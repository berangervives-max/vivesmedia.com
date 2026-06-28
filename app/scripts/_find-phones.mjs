// Cherche le TÉLÉPHONE (et email si trouvé) des prospects SANS COORDONNÉES via Tavily, et met à jour les fiches.
// Priorise prioritaires + meilleurs scores. Plafond quota. Usage: node scripts/_find-phones.mjs [CAP]
import { readFileSync } from 'node:fs'
import { createClient } from '@supabase/supabase-js'

const env = {}
for (const l of readFileSync(new URL('../.env.local', import.meta.url), 'utf8').split('\n')) { const m = l.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/); if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '') }
const sb = createClient(env.SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)
const CAP = process.argv[2] ? parseInt(process.argv[2], 10) : 950
const sleep = ms => new Promise(r => setTimeout(r, ms))

// clé Tavily depuis ~/.claude.json (recherche récursive)
function findKey(o, k) { if (!o || typeof o !== 'object') return null; for (const key of Object.keys(o)) { if (key === k && typeof o[key] === 'string') return o[key]; const r = findKey(o[key], k); if (r) return r } return null }
const cfg = JSON.parse(readFileSync(process.env.USERPROFILE + '/.claude.json', 'utf8'))
const TAVILY = findKey(cfg, 'TAVILY_API_KEY')
if (!TAVILY) { console.error('Clé Tavily introuvable'); process.exit(1) }

const empty = v => !v || !String(v).trim()
const ville = n => ((n || '').match(/·\s*([^·]+?)\s*\(8\d{4}\)/) || [])[1] || ''
const DIRS = ['pagesjaunes', 'societe.com', 'verif.com', 'facebook', 'michelin', 'vroomly', 'google.', 'mappy', 'kompass', 'rubypayeur', 'infogreffe', 'pappers']
const phoneRe = /(?:\+33[\s.]?|0)[1-9](?:[\s.\-]?\d{2}){4}/g
const fmt = d => d.replace(/(\d{2})(?=\d)/g, '$1 ').trim()
function bestPhone(text) {
  const tally = {}
  for (const m of (text.match(phoneRe) || [])) { let d = m.replace(/[^\d+]/g, '').replace(/^\+33/, '0'); if (/^0[1-9]\d{8}$/.test(d)) tally[d] = (tally[d] || 0) + 1 }
  const arr = Object.entries(tally).sort((a, b) => b[1] - a[1]); return arr.length ? fmt(arr[0][0]) : ''
}
function bizEmail(text) {
  const ems = (text.match(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/gi) || []).filter(e => !DIRS.some(d => e.toLowerCase().includes(d)) && !/sentry|wixpress|example/.test(e.toLowerCase()))
  return ems[0] || ''
}

// charge tout (email/tel/notes) puis cible les sans-coordonnées non encore traités
let all = []
for (let f = 0; ; f += 1000) { const { data } = await sb.from('site_clients').select('id,entreprise,nom,secteur,email,telephone,notes').range(f, f + 999); all = all.concat(data); if (data.length < 1000) break }
const targets = all.filter(c => empty(c.email) && empty(c.telephone) && !(c.notes || '').includes('[CONTACT_WEB'))
const score = c => ((c.notes || '').match(/score\s+(\d+)\/10/i) || [])[1] | 0
targets.sort((a, b) => ((b.notes || '').includes('[PRIORITAIRE') - (a.notes || '').includes('[PRIORITAIRE')) || (score(b) - score(a)))
console.log(`Cibles sans coordonnées: ${targets.length} · plafond ce run: ${CAP}`)

let tel = 0, mail = 0, none = 0, done = 0
for (const c of targets) {
  if (done >= CAP) break
  done++
  const q = `${(c.entreprise || c.nom)} ${ville(c.notes)} ${c.secteur || ''} téléphone`
  try {
    const r = await fetch('https://api.tavily.com/search', { method: 'POST', headers: { Authorization: `Bearer ${TAVILY}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ query: q, max_results: 5, search_depth: 'basic', country: 'France' }) })
    if (!r.ok) { if (r.status === 429 || r.status === 432 || r.status === 433) { console.log('Quota Tavily atteint à', done); break } none++; await sleep(900); continue }
    const j = await r.json()
    // EXACTITUDE : ne garder que les coordonnées issues d'un résultat qui cite la bonne ville/CP (évite les homonymes d'autres villes)
    const vN = (ville(c.notes) || '').toLowerCase()
    const cp = ((c.notes || '').match(/\((8\d{4})\)/) || [])[1] || ''
    const tally = {}; let email = ''
    for (const x of (j.results || [])) {
      const t = `${x.title} ${x.content} ${x.url}`
      const loc = (vN && t.toLowerCase().includes(vN)) || (cp && t.includes(cp))
      if (!loc) continue
      for (const mm of (t.match(phoneRe) || [])) { const d = mm.replace(/[^\d+]/g, '').replace(/^\+33/, '0'); if (/^0[1-9]\d{8}$/.test(d)) tally[d] = (tally[d] || 0) + 1 }
      if (!email) { const e = bizEmail(t); if (e) email = e }
    }
    const sorted = Object.entries(tally).sort((a, b) => b[1] - a[1])
    const phone = sorted.length ? fmt(sorted[0][0]) : ''
    if (phone || email) {
      const upd = {}; if (phone) upd.telephone = phone; if (email) upd.email = email
      upd.notes = (c.notes || '') + `\n[CONTACT_WEB 2026-06-28${phone ? ' tel ' + phone : ''}${email ? ' email ' + email : ''} (Tavily)]`
      await sb.from('site_clients').update(upd).eq('id', c.id)
      if (phone) tel++; if (email) mail++
    } else { none++; await sb.from('site_clients').update({ notes: (c.notes || '') + `\n[CONTACT_WEB 2026-06-28 introuvable]` }).eq('id', c.id) }
  } catch (e) { none++ }
  if (done % 25 === 0) console.log(`… ${done}/${Math.min(CAP, targets.length)} · tel ${tel} · email ${mail} · rien ${none}`)
  await sleep(850)
}
console.log(`\n✓ Fini. Traités ${done} · téléphones trouvés ${tel} · emails ${mail} · introuvables ${none}`)
