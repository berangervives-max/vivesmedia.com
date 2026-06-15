/**
 * Seed des réalisations historiques (codées en dur) dans la table Supabase
 * `site_realisations`, pour qu'elles apparaissent et soient éditables dans /cms.
 *
 * Idempotent : upsert par `slug`. Ré-exécutable sans créer de doublons.
 *
 * Usage : npx tsx scripts/seed-realisations.ts
 */
import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createClient } from '@supabase/supabase-js'
import { REALISATIONS_DATA, type RealisationData } from '../src/data/realisations-data'

const __dirname = dirname(fileURLToPath(import.meta.url))

// ── Charge .env.local (tsx ne le fait pas automatiquement) ──
function loadEnv() {
  const raw = readFileSync(resolve(__dirname, '..', '.env.local'), 'utf8')
  for (const line of raw.split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '')
  }
}
loadEnv()

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
if (!url || !serviceKey) throw new Error('NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY manquant dans .env.local')

const sb = createClient(url, serviceKey, { auth: { persistSession: false } })

// Sésame a une page détail custom (pas dans REALISATIONS_DATA) → on le seed à part (résumé).
const SESAME: RealisationData = {
  slug: 'sesame-informatique',
  name: 'Sésame Informatique',
  type: 'Refonte Site · ERP B2B Négoce',
  year: '2025',
  tags: ['B2B', 'ERP', 'Framer', 'Conversion'],
  heroImage: '/thumbnails/sesame-hero.png',
  liveUrl: 'https://sesame-preview.vercel.app/',
  intro: "Conception complète du site pour un éditeur ERP du négoce présent depuis 1987 : direction artistique, palette teal + amber, hero sombre, bento grid, tunnel de conversion B2B.",
  context: { client: '', problem: '' },
  solution: [],
  results: [],
  gallery: [],
  stack: [],
  services: [],
}

// Ordre d'affichage identique à la page /realisations actuelle.
const ORDRE: Record<string, number> = {
  'marine-caro': 0,
  'stoop': 10,
  'sesame-informatique': 20,
  'yannis-amielh': 30,
  'vives-reports': 40,
  'paul-et-louis-sport': 50,
  'ecoserre': 60,
  'wood-design': 70,
}

function toRow(r: RealisationData) {
  return {
    slug: r.slug,
    name: r.name,
    type: r.type,
    year: r.year,
    tags: r.tags,
    hero_image: r.heroImage,
    live_url: r.liveUrl ?? null,
    intro: r.intro,
    context_client: r.context.client,
    context_problem: r.context.problem,
    solution: r.solution,
    results: r.results,
    gallery: r.gallery,
    stack: r.stack,
    services: r.services,
    publie: true,
    ordre: ORDRE[r.slug] ?? 100,
  }
}

async function main() {
  const all: RealisationData[] = [...REALISATIONS_DATA, SESAME]
  const rows = all.map(toRow)
  const { data, error } = await sb
    .from('site_realisations')
    .upsert(rows, { onConflict: 'slug' })
    .select('slug, publie, ordre')
  if (error) { console.error('❌ Seed échoué:', error.message); process.exit(1) }
  console.log(`✅ ${data?.length ?? 0} réalisations upsertées :`)
  for (const r of data ?? []) console.log(`   · ${r.slug} (ordre ${r.ordre}, publié: ${r.publie})`)
}

main()
