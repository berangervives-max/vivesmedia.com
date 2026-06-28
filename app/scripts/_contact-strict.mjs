// FINDER STRICT & EXACT — ne prend email/tel QUE sur le SITE OFFICIEL de l'entreprise.
// 1) trouve le vrai site (domaine qui contient un token distinctif du nom, pas un agrégateur/concurrent)
// 2) scrape home + /contact + /mentions-legales via Jina (gratuit, illimité)
// 3) email accepté seulement si domaine = domaine du site (leur propre email) OU email "contact@" présent sur leur page
// 4) fixe + mobile + description issus de CE site. Sinon : rien (jamais d'invention).
// Usage:  node scripts/_contact-strict.mjs --test "SYNOPTIC DRONE" "Avignon"   (n'écrit rien, affiche)
//         node scripts/_contact-strict.mjs --run [CAP]                          (écrit en base)
import { readFileSync } from 'node:fs'
import { createClient } from '@supabase/supabase-js'

const env = {}
for (const l of readFileSync(new URL('../.env.local', import.meta.url), 'utf8').split('\n')) { const m = l.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/); if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '') }
const sb = createClient(env.SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)
const sleep = ms => new Promise(r => setTimeout(r, ms))

function findKey(o, k) { if (!o || typeof o !== 'object') return null; for (const key of Object.keys(o)) { if (key === k && typeof o[key] === 'string') return o[key]; const r = findKey(o[key], k); if (r) return r } return null }
const cfg = JSON.parse(readFileSync(process.env.USERPROFILE + '/.claude.json', 'utf8'))
const TAVILY = findKey(cfg, 'TAVILY_API_KEY')

const deburr = s => (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
// agrégateurs / réseaux / annuaires = JAMAIS le site officiel
const AGG = ['pagesjaunes', 'societe.com', 'verif.com', 'facebook', 'instagram', 'linkedin', 'michelin', 'vroomly', 'google.', 'mappy', 'kompass', 'rubypayeur', 'infogreffe', 'pappers', 'tripadvisor', 'yelp', 'leboncoin', 'indeed', 'wikipedia', 'youtube', 'twitter', 'x.com', '.gouv.fr', 'manageo', 'bodacc', 'tel.local', 'cylex', '118000', 'justacote', 'allo-pro', 'annuaire', 'pages-blanches', 'pagespro', 'go-pro.fr', 'b-reputation', 'dirigeants', 'score3', 'ellisphere', 'lefigaro', 'amazon.', 'doctolib', 'resagolf']
// mots génériques de secteur / forme juridique → pas distinctifs pour matcher un domaine
const STOP = new Set(['sarl', 'sas', 'sasu', 'eurl', 'sci', 'snc', 'scop', 'eirl', 'ei', 'sa', 'scm', 'selarl', 'ets', 'etablissements', 'societe', 'ste', 'cie', 'compagnie', 'groupe', 'group', 'france', 'and', 'des', 'les', 'del', 'duo', 'pro', 'service', 'services', 'conseil', 'auto', 'garage', 'drone', 'restaurant', 'cafe', 'bar', 'boulangerie', 'coiffure', 'institut', 'menuiserie', 'plomberie', 'electricite', 'batiment', 'travaux', 'maison', 'atelier', 'studio', 'agence', 'cabinet', 'transport', 'transports', 'distribution', 'immobilier', 'pizza', 'sushi', 'optique', 'pharmacie', 'centre', 'espace', 'art', 'design', 'creation', 'concept', 'consulting'])

function tokens(name) {
  return deburr(name).replace(/[^a-z0-9]+/g, ' ').split(' ').filter(t => t.length >= 4 && !STOP.has(t)).sort((a, b) => b.length - a.length)
}
function domainOf(url) { try { return new URL(url).hostname.replace(/^www\./, '') } catch { return '' } }
const isAgg = d => AGG.some(a => d.includes(a))

// site "officiel" — 2 niveaux de preuve :
//  A) domaine contient un token distinctif du nom (preuve forte, ex. synoptic-drone.fr)
//  B) sinon, domaine non-agrégateur dont la PAGE contient le nom distinctif ET la ville/CP (preuve par contenu)
function strongSite(results, toks) {
  for (const r of results) {
    const d = domainOf(r.url || ''); if (!d || isAgg(d)) continue
    const dd = deburr(d).replace(/[^a-z0-9]/g, '')
    if (toks.some(t => dd.includes(t))) return 'https://' + d
  }
  return ''
}
function candidates(results) {
  const seen = new Set(), out = []
  for (const r of results) { const d = domainOf(r.url || ''); if (d && !isAgg(d) && !seen.has(d)) { seen.add(d); out.push('https://' + d) } }
  return out
}
// valide qu'un texte de page appartient bien à CETTE entreprise (nom distinctif + ville ou CP)
function pageBelongs(text, toks, ville, cp) {
  const t = deburr(text)
  const hasName = toks.some(tk => t.includes(tk))
  const hasLoc = (ville && t.includes(deburr(ville))) || (cp && text.includes(cp))
  return hasName && hasLoc
}

async function jina(url) {
  try {
    const r = await fetch('https://r.jina.ai/' + url, { headers: { 'X-Return-Format': 'text', Accept: 'text/plain' } })
    if (!r.ok) return ''
    return await r.text()
  } catch { return '' }
}

const phoneRe = /(?:\+33[\s.]?|0)[1-9](?:[\s.\-]?\d{2}){4}/g
const fmt = d => d.replace(/(\d{2})(?=\d)/g, '$1 ').trim()
function classifyPhones(text) {
  const set = new Set()
  for (const m of (text.match(phoneRe) || [])) { let d = m.replace(/[^\d+]/g, '').replace(/^\+33/, '0'); if (/^0[1-9]\d{8}$/.test(d)) set.add(d) }
  let fixe = '', mobile = ''
  for (const d of set) { if ((d[1] === '6' || d[1] === '7') && !mobile) mobile = fmt(d); else if (!'67'.includes(d[1]) && !fixe) fixe = fmt(d) }
  return { fixe, mobile }
}
// le site est DÉJÀ validé comme étant bien le leur → tout email de la page est légitime.
// Priorité à l'email du domaine du site, sinon email perso (gmail/orange/wanadoo…) présent sur LEUR page.
function emailsFrom(text, siteDomain) {
  const ems = [...new Set((text.match(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/gi) || []).map(e => e.toLowerCase()))]
    .filter(e => !/sentry|wixpress|example|\.png|\.jpg|\.gif|\.webp|\.svg|godaddy|cloudflare|@(?:sentry|wix|squarespace|shopify|wordpress)\b|noreply|no-reply|votre@|nom@|email@|prenom\.nom|@domaine|@email|@adresse|placeholder/.test(e))
  if (!ems.length) return ''
  const token = siteDomain.replace(/^www\./, '').split('.')[0]
  const own = ems.find(e => (e.split('@')[1] || '').includes(token))
  return own || ems[0]
}
function description(text, name) {
  const clean = text.replace(/\s+/g, ' ').trim()
  const idx = clean.search(/\b(nous sommes|spécialis|propose|entreprise|société|notre|expert|votre partenaire|depuis \d{4})/i)
  let snip = idx >= 0 ? clean.slice(idx, idx + 220) : clean.slice(0, 200)
  return snip.replace(/\s+\S*$/, '').trim()
}

async function tavily(q) {
  const r = await fetch('https://api.tavily.com/search', { method: 'POST', headers: { Authorization: `Bearer ${TAVILY}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ query: q, max_results: 6, search_depth: 'basic', country: 'France' }) })
  if (!r.ok) { if ([429, 432, 433].includes(r.status)) throw new Error('QUOTA'); return [] }
  const j = await r.json(); return j.results || []
}

// décode les emails masqués : "contact (at) domaine .fr", "nom [arobase] x point fr", "&#64;"
function deobfuscate(t) {
  return (t || '')
    .replace(/&#0?64;/gi, '@').replace(/&#46;/gi, '.')
    .replace(/\s*[\(\[]\s*(?:at|arobase|chez)\s*[\)\]]\s*/gi, '@')
    .replace(/\s+(?:at|arobase|chez)\s+/gi, '@')
    .replace(/\s*[\(\[]\s*(?:dot|point)\s*[\)\]]\s*/gi, '.')
    .replace(/\s+(?:dot|point)\s+/gi, '.')
}
async function scrapeSite(site) {
  let text = await jina(site)            // home → contient le footer (email/tél souvent ici)
  for (const p of ['/contact', '/contact.html', '/contact.php', '/mentions-legales', '/nous-contacter', '/contactez-nous', '/a-propos', '/qui-sommes-nous']) {
    if (text.length > 16000) break
    const t = await jina(site + p); if (t) text += '\n' + t; await sleep(120)
  }
  return deobfuscate(text)
}

// cœur : pour une entreprise+ville+cp → {site, email, fixe, mobile, desc} STRICT
async function enrich(entreprise, ville, cp) {
  const toks = tokens(entreprise)
  if (!toks.length) return { site: '', reason: 'nom trop générique' }
  let results
  try { results = await tavily(`${entreprise} ${ville} contact`) } catch (e) { if (e.message === 'QUOTA') throw e; return { site: '', reason: 'recherche échouée' } }

  // Niveau A : domaine qui matche le nom → site sûr
  let site = strongSite(results, toks), text = ''
  if (site) text = await scrapeSite(site)

  // Niveau B : sinon, on teste les candidats non-agrégateurs et on valide par le contenu de la page
  if (!site) {
    for (const cand of candidates(results).slice(0, 3)) {
      const t = await scrapeSite(cand)
      if (t && pageBelongs(t, toks, ville, cp)) { site = cand; text = t; break }
      await sleep(150)
    }
  }
  if (!site) return { site: '', reason: 'pas de site officiel trouvé' }

  const dom = domainOf(site)
  const email = emailsFrom(text, dom)
  const { fixe, mobile } = classifyPhones(text)
  const desc = description(text, entreprise)
  return { site, email, fixe, mobile, desc, reason: 'ok' }
}

// ---- MODES ----
const args = process.argv.slice(2)
if (args[0] === '--test') {
  const res = await enrich(args[1], args[2] || '', args[3] || '')
  console.log('\n===== TEST STRICT =====')
  console.log('Entreprise :', args[1], '·', args[2] || '')
  console.log('Tokens distinctifs :', tokens(args[1]).join(', ') || '(aucun)')
  console.log('Site officiel :', res.site || '— (' + res.reason + ')')
  console.log('Email :', res.email || '—')
  console.log('Fixe  :', res.fixe || '—')
  console.log('Mobile:', res.mobile || '—')
  console.log('Desc  :', res.desc || '—')
  process.exit(0)
}

const empty = v => !v || !String(v).trim()
const villeOf = n => ((n || '').match(/·\s*([^·]+?)\s*\(8\d{4}\)/) || [])[1] || ''
const cpOf = n => ((n || '').match(/\((8\d{4})\)/) || [])[1] || ''

if (args[0] === '--sample') {
  const N = args[1] ? parseInt(args[1], 10) : 12
  let all = []
  for (let f = 0; ; f += 1000) { const { data } = await sb.from('site_clients').select('id,entreprise,nom,notes').range(f, f + 999); all = all.concat(data); if (data.length < 1000) break }
  const targets = all.filter(c => !(c.notes || '').includes('[STRICT'))
  const pick = []
  for (let i = 0; i < targets.length && pick.length < N; i += Math.max(1, Math.floor(targets.length / N))) pick.push(targets[i])
  console.log(`Échantillon de ${pick.length} prospects réels :\n`)
  let mail = 0, tel = 0
  for (const c of pick) {
    let res; try { res = await enrich(c.entreprise || c.nom, villeOf(c.notes), cpOf(c.notes)) } catch (e) { if (e.message === 'QUOTA') { console.log('Quota'); break } res = { reason: 'err' } }
    if (res.email) mail++; if (res.fixe || res.mobile) tel++
    console.log(`• ${(c.entreprise || c.nom).slice(0, 30).padEnd(30)} | ${villeOf(c.notes).slice(0, 12).padEnd(12)} | site:${res.site ? 'OUI' : 'non'} | mail:${res.email || '—'} | fixe:${res.fixe || '—'} | mob:${res.mobile || '—'}`)
    await sleep(600)
  }
  console.log(`\n→ Sur ${pick.length} : email ${mail} · téléphone ${tel}`)
  process.exit(0)
}

if (args[0] === '--run') {
  const CAP = args[1] ? parseInt(args[1], 10) : 200
  const ville = villeOf
  let all = []
  for (let f = 0; ; f += 1000) { const { data } = await sb.from('site_clients').select('id,entreprise,nom,secteur,email,telephone,notes').range(f, f + 999); all = all.concat(data); if (data.length < 1000) break }
  const targets = all.filter(c => (empty(c.email) || empty(c.telephone)) && !(c.notes || '').includes('[STRICT'))
  const score = c => ((c.notes || '').match(/score\s+(\d+)\/10/i) || [])[1] | 0
  targets.sort((a, b) => ((b.notes || '').includes('[PRIORITAIRE') - (a.notes || '').includes('[PRIORITAIRE')) || (score(b) - score(a)))
  // 'rev' = ouvrier parallèle qui attaque par le bas du lot (évite les doublons avec l'ouvrier principal)
  if (args.includes('rev')) targets.reverse()
  console.log(`Cibles: ${targets.length} · plafond ce run: ${CAP}${args.includes('rev') ? ' (sens inverse)' : ''}`)
  let okMail = 0, okTel = 0, none = 0, done = 0
  for (const c of targets) {
    if (done >= CAP) break
    done++
    let res
    try { res = await enrich(c.entreprise || c.nom, ville(c.notes), cpOf(c.notes)) }
    catch (e) { if (e.message === 'QUOTA') { console.log('Quota Tavily atteint à', done); break } res = { site: '', reason: 'err' } }
    if (res.email || res.fixe || res.mobile) {
      const upd = {}
      if (res.email) { upd.email = res.email; okMail++ }
      const tel = res.fixe || res.mobile; if (tel) { upd.telephone = res.mobile ? `${res.fixe || ''}${res.fixe && res.mobile ? ' · ' : ''}${res.mobile}`.trim() : res.fixe; okTel++ }
      upd.notes = (c.notes || '') +
        `\n[STRICT 2026-06-28 site ${res.site}${res.email ? ' email ' + res.email : ''}${res.fixe ? ' fixe ' + res.fixe : ''}${res.mobile ? ' mobile ' + res.mobile : ''}]` +
        (res.desc ? `\n[DESC ${res.desc}]` : '')
      await sb.from('site_clients').update(upd).eq('id', c.id)
    } else {
      none++
      await sb.from('site_clients').update({ notes: (c.notes || '') + `\n[STRICT 2026-06-28 ${res.reason}]` }).eq('id', c.id)
    }
    if (done % 20 === 0) console.log(`… ${done}/${Math.min(CAP, targets.length)} · email ${okMail} · tel ${okTel} · rien ${none}`)
    await sleep(700)
  }
  console.log(`\n✓ Fini. Traités ${done} · emails ${okMail} · tels ${okTel} · sans site ${none}`)
  process.exit(0)
}

console.log('Usage: --test "ENTREPRISE" "VILLE"  |  --run [CAP]')
