// Trie les prospects "lookalike Clic'Info" et (avec --delete) supprime les autres.
// Profil cible : CA ~658k (400k-1M), structure petite (0-9 sal.), dirigeant ~43-61 ans, tous secteurs.
// SÉCURITÉ : par défaut = APERÇU (aucune suppression). Ajouter --delete pour exécuter.
import { readFileSync, writeFileSync } from 'node:fs'
import { createClient } from '@supabase/supabase-js'

const env = {}
for (const l of readFileSync(new URL('../.env.local', import.meta.url), 'utf8').split('\n')) { const m = l.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/); if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '') }
const sb = createClient(env.SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)
const DELETE = process.argv.includes('--delete')
const sleep = ms => new Promise(r => setTimeout(r, ms))

const CA_MIN = 400000, CA_MAX = 1000000, CA_REF = 658727
const SMALL = new Set(['0 sal.', '1-2 sal.', '3-5 sal.', '6-9 sal.'])
const AGE_MIN = 43, AGE_MAX = 61, YEAR = 2026

const parseCA = n => { const m = (n || '').match(/CA\s+\d{4}\s+([\d\s.  ]+?)\s*€/i); if (!m) return null; const v = parseInt(m[1].replace(/[^\d]/g, ''), 10); return isNaN(v) ? null : v }
const parseEff = n => { const m = (n || '').match(/·\s*(\d+(?:-\d+)?\s*sal\.|0 sal\.)/i); return m ? m[1].replace(/\s+/g, ' ').trim() : '' }
const parseSiren = n => ((n || '').match(/SIREN\s+(\d{9})/) || [])[1] || null
const parseVille = n => ((n || '').match(/·\s*([^·]+?)\s*\(8\d{4}\)/) || [])[1] || ''

// 1) charge tout
let all = []
for (let f = 0; ; f += 1000) { const { data } = await sb.from('site_clients').select('id,entreprise,nom,secteur,notes').range(f, f + 999); all = all.concat(data); if (data.length < 1000) break }

// 2) candidats : CA dans la fourchette + petite structure
const cand = []
for (const c of all) {
  const ca = parseCA(c.notes); const eff = parseEff(c.notes)
  if (ca != null && ca >= CA_MIN && ca <= CA_MAX && SMALL.has(eff)) cand.push({ ...c, ca, eff, siren: parseSiren(c.notes), ville: parseVille(c.notes) })
}
console.log(`Total: ${all.length} · candidats (CA ${CA_MIN/1000}-${CA_MAX/1000}k + 0-9 sal.): ${cand.length}`)

// 3) âge du dirigeant via API gouv (sur les candidats seulement)
const keep = []
for (const c of cand) {
  let age = null, forme = ''
  if (c.siren) {
    try {
      const r = await fetch(`https://recherche-entreprises.api.gouv.fr/search?q=${c.siren}`, { headers: { 'User-Agent': 'vivesmedia-crm' } })
      const j = await r.json(); const e = (j.results || []).find(x => x.siren === c.siren) || (j.results || [])[0]
      forme = e?.nature_juridique || ''
      const d = (e?.dirigeants || []).find(x => x.annee_de_naissance || x.date_de_naissance)
      const y = d ? parseInt((d.annee_de_naissance || d.date_de_naissance || '').slice(0, 4), 10) : NaN
      if (!isNaN(y)) age = YEAR - y
    } catch { /* ignore */ }
    await sleep(180)
  }
  c.age = age; c.forme = forme
  // garde si âge dans la fourchette OU âge inconnu (structure/CA déjà conformes)
  if (age == null || (age >= AGE_MIN && age <= AGE_MAX)) keep.push(c)
}

keep.sort((a, b) => Math.abs(a.ca - CA_REF) - Math.abs(b.ca - CA_REF))
const keepIds = new Set(keep.map(c => c.id))
const del = all.filter(c => !keepIds.has(c.id))
try {
  writeFileSync('C:/Users/beran/OneDrive/Bureau/SHOPIFY HYDROGEN/PROSPECTION/lookalikes_clicinfo.json',
    JSON.stringify(keep.map(c => ({ id: c.id, entreprise: c.entreprise || c.nom, secteur: c.secteur, ville: c.ville, ca: c.ca, eff: c.eff, age: c.age, forme: c.forme, siren: c.siren })), null, 1))
  console.log('→ liste des lookalikes exportée : PROSPECTION/lookalikes_clicinfo.json')
} catch (e) { console.log('(export liste impossible:', e.message, ')') }

console.log(`\n===== LOOKALIKE CLIC'INFO =====`)
console.log(`À GARDER : ${keep.length}  ·  À SUPPRIMER : ${del.length}`)
console.log(`\nTop gardés (proches du CA de Clic'Info) :`)
keep.slice(0, 20).forEach(c => console.log(`  • ${(c.entreprise || c.nom).slice(0, 34).padEnd(34)} | ${(c.secteur || '').slice(0, 16).padEnd(16)} | ${c.ville.slice(0, 14).padEnd(14)} | CA ${c.ca.toLocaleString('fr-FR')}€ | ${c.eff} | ${c.age ? c.age + ' ans' : 'âge ?'}`))

if (!DELETE) { console.log(`\n(APERÇU — rien supprimé. Relancer avec --delete pour supprimer les ${del.length} non-conformes.)`); process.exit(0) }

// 4) suppression par lots
console.log(`\nSuppression de ${del.length} fiches…`)
let removed = 0
for (let i = 0; i < del.length; i += 100) {
  const ids = del.slice(i, i + 100).map(c => c.id)
  const { error } = await sb.from('site_clients').delete().in('id', ids)
  if (error) { console.error('Erreur lot', i, error.message); break }
  removed += ids.length; if (i % 500 === 0) console.log(`… ${removed}/${del.length}`)
}
console.log(`\n✓ Supprimées: ${removed} · restantes (lookalikes): ${keep.length}`)
