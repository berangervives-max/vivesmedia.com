/**
 * import-articles-aout2026.mjs
 * ---------------------------------------------------------------------------
 * Importe un (ou plusieurs) article(s) Markdown/HTML de la vague de blog
 * dans la table Supabase `articles`, en BROUILLON (publie = false), pour que
 * Béranger les relise et les valide dans le back-office /cms/articles avant
 * toute mise en ligne.
 *
 * USAGE
 *   node scripts/import-articles-aout2026.mjs <chemin.md> [autre.md ...]
 *   node scripts/import-articles-aout2026.mjs <dossier>          (tous les .md)
 *   node scripts/import-articles-aout2026.mjs "<dossier>/*.md"   (glob, OK PowerShell)
 *
 * OPTIONS
 *   --draft    force publie=false même sur un article DÉJÀ publié (par défaut,
 *              une mise à jour ne touche jamais au statut de publication).
 *   --dry-run  affiche ce qui serait écrit, sans rien écrire en base.
 *
 * FORMAT ATTENDU DU FICHIER
 *   Frontmatter YAML entre deux lignes `---`, puis le corps en HTML.
 *   Clés lues : slug, titre, meta_title, meta_description, extrait,
 *               categorie, tags, date_pub, image_url (optionnelle).
 *   Les autres clés (mot_cle_principal, cta_url, notes_*) sont ignorées :
 *   elles servent à la rédaction/production, pas à la base.
 *
 * TRANSFORMATION DU CORPS
 *   Chaque marqueur `[IMAGE: description]` devient un commentaire HTML
 *   `<!-- IMAGE: description -->` : invisible pour le lecteur, mais conservé
 *   dans le contenu pour la génération des visuels ensuite.
 *
 * GARDE-FOUS (volontaires, ne pas retirer sans réfléchir)
 *   - image_url : mis à null à la CRÉATION seulement. Lors d'une mise à jour,
 *     la valeur déjà en base est PRÉSERVÉE — sinon un ré-import après la
 *     génération des visuels effacerait les images.
 *   - publie : false à la CRÉATION. Lors d'une mise à jour, le statut existant
 *     est PRÉSERVÉ (sauf --draft) — sinon corriger une coquille dans le .md
 *     dépublierait silencieusement un article déjà en ligne.
 *   - tags : la colonne `articles.tags` est un TEXTE (ex. "SEO, Shopify"),
 *     pas un tableau Postgres. Le tableau YAML est donc joint par ", ".
 */

import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, resolve, basename } from 'node:path'
import { createClient } from '@supabase/supabase-js'

// ── Connexion Supabase ────────────────────────────────────────────────────
// La clé service_role vit dans app/.env.local (gitignoré). Jamais dans le code.
function loadEnv() {
  const env = { ...process.env }
  try {
    const raw = readFileSync(new URL('../.env.local', import.meta.url), 'utf8')
    for (const line of raw.split('\n')) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/)
      if (m && !env[m[1]]) env[m[1]] = m[2].replace(/^["']|["']$/g, '')
    }
  } catch {
    /* pas de .env.local : on se rabat sur les variables d'environnement */
  }
  return env
}

const env = loadEnv()
const SUPABASE_URL = env.SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY = env.SUPABASE_SERVICE_ROLE_KEY
if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('✖ Clés Supabase manquantes (NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY).')
  console.error('  Attendues dans app/.env.local, ou via les variables d\'environnement.')
  process.exit(1)
}
const sb = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } })

// ── Parsing du frontmatter YAML (sous-ensemble suffisant, sans dépendance) ─
function parseFrontmatter(raw) {
  const lines = raw.replace(/^﻿/, '').split(/\r?\n/)
  if (lines[0].trim() !== '---') {
    throw new Error('frontmatter absent : le fichier doit commencer par une ligne "---"')
  }
  const end = lines.indexOf('---', 1)
  if (end === -1) throw new Error('frontmatter non fermé : ligne "---" de fin introuvable')

  // 1) regroupement clé -> lignes brutes (gère une valeur repliée sur plusieurs lignes)
  const rawFields = []
  for (const line of lines.slice(1, end)) {
    const m = line.match(/^([a-z_][a-z0-9_]*):\s*(.*)$/i)
    if (m) rawFields.push([m[1], m[2]])
    else if (line.trim() && rawFields.length) rawFields[rawFields.length - 1][1] += ' ' + line.trim()
  }

  // 2) décodage des valeurs
  const data = {}
  for (const [key, rawValue] of rawFields) {
    const v = rawValue.trim()
    if (v.startsWith('[') && v.endsWith(']')) {
      try {
        data[key] = JSON.parse(v)
      } catch {
        data[key] = v.slice(1, -1).split(',').map((s) => s.trim().replace(/^["']|["']$/g, '')).filter(Boolean)
      }
    } else if (v.startsWith('"')) {
      try {
        data[key] = JSON.parse(v)
      } catch {
        data[key] = v.replace(/^"|"$/g, '').replace(/\\"/g, '"')
      }
    } else if (v.startsWith("'")) {
      data[key] = v.replace(/^'|'$/g, '').replace(/''/g, "'")
    } else {
      data[key] = v
    }
  }

  return { data, body: lines.slice(end + 1).join('\n').trim() }
}

// ── [IMAGE: ...] -> <!-- IMAGE: ... --> ───────────────────────────────────
function convertImageMarkers(html) {
  let count = 0
  const out = html.replace(/\[IMAGE:\s*([^\]]*?)\s*\]/g, (_full, desc) => {
    count++
    // "--" est interdit dans un commentaire HTML : filet de sécurité.
    const safe = desc.replace(/-{2,}/g, '-').trim()
    return `<!-- IMAGE: ${safe} -->`
  })
  return { html: out, count }
}

// ── Résolution des arguments (fichiers, dossiers, glob simple) ────────────
function expandArgs(args) {
  const files = []
  for (const arg of args) {
    const p = resolve(arg)
    if (arg.includes('*')) {
      // glob simple "<dossier>/motif*.md" — utile car PowerShell n'étend pas les jokers
      const dir = resolve(arg.replace(/[/\\][^/\\]*$/, ''))
      const pattern = basename(arg)
      const rx = new RegExp('^' + pattern.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*') + '$', 'i')
      for (const f of readdirSync(dir)) if (rx.test(f)) files.push(join(dir, f))
      continue
    }
    let st
    try {
      st = statSync(p)
    } catch {
      console.error(`✖ Introuvable : ${arg}`)
      process.exit(1)
    }
    if (st.isDirectory()) {
      for (const f of readdirSync(p)) if (f.toLowerCase().endsWith('.md')) files.push(join(p, f))
    } else {
      files.push(p)
    }
  }
  return [...new Set(files)].sort()
}

// ── Import d'un fichier ───────────────────────────────────────────────────
async function importFile(file, { dryRun, forceDraft }) {
  const { data: fm, body } = parseFrontmatter(readFileSync(file, 'utf8'))

  for (const required of ['slug', 'titre']) {
    if (!fm[required]) throw new Error(`champ obligatoire manquant dans le frontmatter : ${required}`)
  }
  if (!body) throw new Error('corps de l\'article vide')

  const { html: contenu, count: images } = convertImageMarkers(body)
  const tags = Array.isArray(fm.tags) ? fm.tags.join(', ') : (fm.tags || null)

  const payload = {
    titre: fm.titre,
    slug: fm.slug,
    extrait: fm.extrait || null,
    contenu,
    categorie: fm.categorie || null,
    tags,
    date_pub: fm.date_pub || null,
    meta_title: fm.meta_title || null,
    meta_desc: fm.meta_description || fm.meta_desc || null,
  }

  // L'article existe-t-il déjà ? (pas de dépendance à une contrainte UNIQUE)
  const { data: existing, error: selErr } = await sb
    .from('articles')
    .select('id, publie, image_url')
    .eq('slug', payload.slug)
    .maybeSingle()
  if (selErr) throw selErr

  if (payload.meta_desc && payload.meta_desc.length > 160) {
    console.warn(`   ⚠ meta_desc = ${payload.meta_desc.length} caractères (>160, Google tronquera)`)
  }

  if (dryRun) {
    console.log(`   [dry-run] ${existing ? 'UPDATE' : 'INSERT'} — ${images} marqueur(s) image, ${contenu.length} car. de HTML`)
    return { slug: payload.slug, id: existing?.id ?? '(nouveau)', action: 'dry-run', images }
  }

  if (existing) {
    // Mise à jour : le statut de publication n'est jamais touché ici.
    // image_url : on ne l'écrase QUE si le fichier en apporte une valeur réelle
    // (génération des visuels terminée) ; un ré-import sans image_url dans le
    // frontmatter préserve donc la valeur déjà en base, comme avant.
    let imageNote = existing.image_url ? 'conservée' : 'toujours vide'
    if (fm.image_url && fm.image_url.trim()) {
      payload.image_url = fm.image_url.trim()
      imageNote = existing.image_url ? 'mise à jour' : 'ajoutée'
    }
    payload.updated_at = new Date().toISOString()
    if (forceDraft) payload.publie = false
    const { data, error } = await sb
      .from('articles')
      .update(payload)
      .eq('id', existing.id)
      .select('id, slug, publie, date_pub')
      .single()
    if (error) throw error
    return {
      ...data,
      action: 'MIS À JOUR',
      images,
      note: `image_url ${imageNote} · publie ${forceDraft ? 'forcé à false' : 'inchangé'}`,
    }
  }

  // Création : brouillon, sans visuel (les images seront générées ensuite).
  payload.publie = false
  payload.image_url = null
  const { data, error } = await sb
    .from('articles')
    .insert(payload)
    .select('id, slug, publie, date_pub')
    .single()
  if (error) throw error
  return { ...data, action: 'CRÉÉ', images, note: 'brouillon, image_url vide' }
}

// ── Exécution ─────────────────────────────────────────────────────────────
const argv = process.argv.slice(2)
const dryRun = argv.includes('--dry-run')
const forceDraft = argv.includes('--draft')
const paths = argv.filter((a) => !a.startsWith('--'))

if (!paths.length) {
  console.error('Usage : node scripts/import-articles-aout2026.mjs <fichier.md> [autre.md ...] [--draft] [--dry-run]')
  process.exit(1)
}

const files = expandArgs(paths)
console.log(`\n📥 Import de ${files.length} article(s) vers Supabase (${new URL(SUPABASE_URL).host})${dryRun ? ' — DRY RUN' : ''}\n`)

let ok = 0
let ko = 0
for (const file of files) {
  const name = basename(file)
  try {
    const r = await importFile(file, { dryRun, forceDraft })
    console.log(`✅ ${r.action.padEnd(11)} ${r.slug}`)
    console.log(`   id       : ${r.id}`)
    console.log(`   publie   : ${r.publie === undefined ? '—' : r.publie}   date_pub : ${r.date_pub ?? '—'}`)
    console.log(`   images   : ${r.images} marqueur(s) converti(s) en commentaire HTML`)
    if (r.note) console.log(`   note     : ${r.note}`)
    console.log(`   source   : ${name}\n`)
    ok++
  } catch (e) {
    console.error(`❌ ÉCHEC      ${name}`)
    console.error(`   ${e.message || e}\n`)
    ko++
  }
}

console.log('─'.repeat(70))
console.log(`${ok} article(s) en base · ${ko} échec(s)`)
if (ok && !dryRun) console.log('→ À relire et publier dans le back-office : /cms/articles')
console.log('')
process.exit(ko ? 1 : 0)
