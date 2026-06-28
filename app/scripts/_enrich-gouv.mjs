// Enrichit les prospects SANS COORDONNÉES via l'API gouv Recherche d'entreprises (par SIREN).
// Ajoute dirigeant + effectif + CA + résultat net dans les notes. Anti-doublon, throttlé, repris.
// Usage : node scripts/_enrich-gouv.mjs [LIMIT]   (LIMIT optionnel pour tester)
import { readFileSync } from 'node:fs'
import { createClient } from '@supabase/supabase-js'

const env = {}
for (const l of readFileSync(new URL('../.env.local', import.meta.url), 'utf8').split('\n')) { const m = l.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/); if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '') }
const sb = createClient(env.SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)
const LIMIT = process.argv[2] ? parseInt(process.argv[2], 10) : Infinity
const sleep = ms => new Promise(r => setTimeout(r, ms))
const empty = v => !v || !String(v).trim()
const MARK = '[ENRICHI_GOUV'

const EFF = { '00': '0 sal.', '01': '1-2 sal.', '02': '3-5 sal.', '03': '6-9 sal.', '11': '10-19 sal.', '12': '20-49 sal.', '21': '50-99 sal.', '22': '100-199 sal.', '31': '200-249 sal.', '32': '250-499 sal.', '41': '500-999 sal.', '42': '1000+ sal.' }

// 1) charge toutes les fiches (pagination 1000), garde celles sans coord + SIREN + non enrichies
let all = []
for (let from = 0; ; from += 1000) {
  const { data, error } = await sb.from('site_clients').select('id,email,telephone,notes').range(from, from + 999)
  if (error) { console.error(error.message); process.exit(1) }
  all = all.concat(data); if (data.length < 1000) break
}
const targets = all.filter(c => empty(c.email) && empty(c.telephone) && /SIREN (\d{9})/.test(c.notes || '') && !(c.notes || '').includes(MARK))
console.log(`Fiches totales: ${all.length} · cibles (sans coord + SIREN + non enrichies): ${targets.length}`)

let ok = 0, ca = 0, fail = 0, done = 0
for (const c of targets) {
  if (done >= LIMIT) break
  done++
  const siren = (c.notes.match(/SIREN (\d{9})/) || [])[1]
  try {
    const r = await fetch(`https://recherche-entreprises.api.gouv.fr/search?q=${siren}`, { headers: { 'User-Agent': 'vivesmedia-crm' } })
    const j = await r.json()
    const e = (j.results || []).find(x => x.siren === siren) || (j.results || [])[0]
    if (!e) { fail++; await sleep(170); continue }
    const dir = (e.dirigeants || []).find(d => d.nom)
    const dirTxt = dir ? `${(dir.prenoms || '').split(' ')[0]} ${dir.nom}`.trim() + (dir.qualite ? ` (${dir.qualite})` : '') : ''
    const eff = EFF[e.tranche_effectif_salarie] || ''
    const fin = e.finances || {}
    const years = Object.keys(fin).sort()
    const ly = years[years.length - 1]
    const caTxt = ly && fin[ly]?.ca != null ? `CA ${ly} ${fin[ly].ca.toLocaleString('fr-FR')}€` + (fin[ly].resultat_net != null ? ` · RN ${fin[ly].resultat_net.toLocaleString('fr-FR')}€` : '') : 'CA non publié'
    if (ly && fin[ly]?.ca != null) ca++
    const line = `\n[ENRICHI_GOUV 2026-06-28${dirTxt ? ' · dir. ' + dirTxt : ''}${eff ? ' · ' + eff : ''} · ${caTxt}]`
    const payload = { notes: (c.notes || '') + line }
    // si le dirigeant manquait et qu'on l'a, on peut aussi le mettre en "nom" ? non — on garde l'entreprise. On met le tel si dispo ? l'API n'a pas le tel.
    await sb.from('site_clients').update(payload).eq('id', c.id)
    ok++
  } catch (err) { fail++ }
  if (done % 50 === 0) console.log(`… ${done}/${targets.length} (ok ${ok}, avec CA ${ca}, échecs ${fail})`)
  await sleep(180) // ~5,5 req/s (limite API ~7/s)
}
console.log(`\n✓ Terminé. Traités: ${done} · enrichis: ${ok} · dont CA trouvé: ${ca} · échecs: ${fail}`)
