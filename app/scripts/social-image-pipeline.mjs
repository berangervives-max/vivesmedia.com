// ─────────────────────────────────────────────────────────────────────────
// Pipeline visuels réseaux sociaux — OUTIL RÉUTILISABLE (agents vivesmedia)
// Télécharge une image (depuis n'importe quelle URL), la recadre au format
// exact du réseau/type de post, l'héberge sur Supabase (bucket realisations),
// et (option) l'attache à un post du calendrier /cms/social.
//
// USAGE :
//   node scripts/social-image-pipeline.mjs --url "<URL_IMAGE>" --format ig_post [--attach "<id|titre>"]
//   node scripts/social-image-pipeline.mjs --urls "url1,url2" --format ig_story
//
// FORMATS : ig_post (1080x1350) · ig_square (1080x1080) · ig_story (1080x1920)
//           ig_reel (1080x1920) · li_carrousel (1080x1350) · li_post (1200x1200)
//
// Sortie : l'URL publique hébergée (à mettre dans social_posts.visuel_url).
// ─────────────────────────────────────────────────────────────────────────
import { createClient } from '@supabase/supabase-js'
import sharp from 'sharp'
import fs from 'fs'

const env = Object.fromEntries(fs.readFileSync(new URL('../.env.local', import.meta.url), 'utf8')
  .split('\n').filter(l => l.includes('=')).map(l => { const i = l.indexOf('='); return [l.slice(0, i).trim(), l.slice(i + 1).trim()] }))
const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY)
const UA = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36' }

export const FORMATS = {
  ig_post: [1080, 1350], ig_square: [1080, 1080], ig_story: [1080, 1920],
  ig_reel: [1080, 1920], li_carrousel: [1080, 1350], li_post: [1200, 1200],
}

// Télécharge + recadre (cover, recentrage intelligent) + héberge → URL publique.
export async function processImage(url, format = 'ig_post') {
  const dims = FORMATS[format]
  if (!dims) throw new Error(`Format inconnu: ${format} (dispo: ${Object.keys(FORMATS).join(', ')})`)
  const r = await fetch(url, { headers: UA })
  if (!r.ok) throw new Error(`Téléchargement échoué (HTTP ${r.status}) : ${url}`)
  const buf = Buffer.from(await r.arrayBuffer())
  const out = await sharp(buf).resize(dims[0], dims[1], { fit: 'cover', position: 'attention' }).jpeg({ quality: 88 }).toBuffer()
  const path = `social/${format}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}.jpg`
  const { error } = await sb.storage.from('realisations').upload(path, out, { contentType: 'image/jpeg', upsert: true })
  if (error) throw new Error(`Upload Supabase échoué : ${error.message}`)
  return sb.storage.from('realisations').getPublicUrl(path).data.publicUrl
}

// Attache une URL de visuel à un post (par id exact ou par titre approchant).
export async function attachToPost(idOrTitle, visuelUrl) {
  let q = sb.from('social_posts').select('id,titre').limit(1)
  q = /^[0-9a-f]{8}-/.test(idOrTitle) ? q.eq('id', idOrTitle) : q.ilike('titre', `%${idOrTitle}%`)
  const { data } = await q
  if (!data?.length) return false
  await sb.from('social_posts').update({ visuel_url: visuelUrl }).eq('id', data[0].id)
  return data[0].titre
}

// ── CLI ──
const arg = (k) => { const i = process.argv.indexOf(k); return i > -1 ? process.argv[i + 1] : null }
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('social-image-pipeline.mjs')) {
  const format = arg('--format') || 'ig_post'
  const urls = (arg('--url') ? [arg('--url')] : (arg('--urls') || '').split(',').filter(Boolean))
  const attach = arg('--attach')
  if (!urls.length) { console.error('Fournis --url <URL> ou --urls "u1,u2"'); process.exit(1) }
  for (const u of urls) {
    try {
      const pub = await processImage(u.trim(), format)
      let msg = `OK [${format}] -> ${pub}`
      if (attach) { const t = await attachToPost(attach, pub); msg += t ? ` · attaché à « ${t} »` : ' · (post à attacher introuvable)' }
      console.log(msg)
    } catch (e) { console.error('ERR', e.message) }
  }
}
