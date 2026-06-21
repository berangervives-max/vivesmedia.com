import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

// Analyse du site d'un prospect (côté serveur, sans clé externe) pour personnaliser
// les emails : HTTPS, vitesse de réponse, version mobile/responsive, titre & meta
// Google, Open Graph, images, technologie. Produit des observations concrètes
// (emailLines) prêtes à coller dans le mail. Admin uniquement.

const ADMIN = 'berangervives@gmail.com'

type Finding = { level: 'ok' | 'warn' | 'bad'; label: string }

function detectBuilder(html: string, headers: Headers): string {
  const h = html.toLowerCase()
  const gen = (html.match(/<meta[^>]+name=["']generator["'][^>]+content=["']([^"']+)/i) || [])[1] || ''
  if (/wix\.com|static\.wixstatic/.test(h)) return 'Wix'
  if (/squarespace/.test(h)) return 'Squarespace'
  if (/cdn\.shopify|shopify/.test(h)) return 'Shopify'
  if (/wp-content|wordpress/.test(h) || /wordpress/i.test(gen)) return 'WordPress'
  if (/jimdo/.test(h)) return 'Jimdo'
  if (/webflow/.test(h)) return 'Webflow'
  if (/godaddy|website builder/i.test(gen)) return 'GoDaddy'
  if (/joomla/i.test(gen)) return 'Joomla'
  return gen || ''
}

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user?.email !== ADMIN) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  let { url } = await req.json().catch(() => ({}))
  if (!url || typeof url !== 'string') return NextResponse.json({ error: 'url requise' }, { status: 400 })
  if (!/^https?:\/\//i.test(url)) url = 'https://' + url
  let u: URL
  try { u = new URL(url) } catch { return NextResponse.json({ error: 'url invalide' }, { status: 400 }) }
  if (!['http:', 'https:'].includes(u.protocol)) return NextResponse.json({ error: 'protocole non supporté' }, { status: 400 })

  const t0 = Date.now()
  let resp: Response
  try {
    const ctrl = new AbortController()
    const timer = setTimeout(() => ctrl.abort(), 12000)
    resp = await fetch(u.toString(), { redirect: 'follow', signal: ctrl.signal, headers: { 'User-Agent': 'Mozilla/5.0 (compatible; vivesmedia-audit/1.0)' } })
    clearTimeout(timer)
  } catch {
    return NextResponse.json({ error: 'Site injoignable (ne répond pas ou trop lent)', unreachable: true }, { status: 200 })
  }
  const ttfb = Date.now() - t0
  const finalUrl = resp.url || u.toString()
  const isHttps = finalUrl.startsWith('https://')
  const status = resp.status

  let html = ''
  try {
    const buf = await resp.arrayBuffer()
    html = Buffer.from(buf.slice(0, 600_000)).toString('utf8')
  } catch { /* ignore */ }
  const total = Date.now() - t0
  const bytes = html.length

  const has = (re: RegExp) => re.test(html)
  const title = (html.match(/<title[^>]*>([^<]*)<\/title>/i) || [])[1]?.trim() || ''
  const metaDesc = (html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)/i) || [])[1]?.trim()
    || (html.match(/<meta[^>]+content=["']([^"']*)["'][^>]+name=["']description["']/i) || [])[1]?.trim() || ''
  const viewport = has(/<meta[^>]+name=["']viewport["']/i)
  const ogImage = has(/<meta[^>]+property=["']og:image["']/i)
  const ogTitle = has(/<meta[^>]+property=["']og:(title|description)["']/i)
  const h1 = (html.match(/<h1[\b>]/gi) || []).length
  const imgs = (html.match(/<img\b/gi) || []).length
  const imgsNoAlt = (html.match(/<img\b(?:(?!alt=)[^>])*?>/gi) || []).length
  const scripts = (html.match(/<script\b/gi) || []).length
  const favicon = has(/<link[^>]+rel=["'][^"']*icon/i)
  const canonical = has(/<link[^>]+rel=["']canonical["']/i)
  const lang = (html.match(/<html[^>]+lang=["']([^"']+)/i) || [])[1] || ''
  const builder = detectBuilder(html, resp.headers)
  const slow = total > 2500
  const verySlow = total > 5000

  // Diagnostic structuré
  const findings: Finding[] = []
  const f = (level: Finding['level'], label: string) => findings.push({ level, label })
  isHttps ? f('ok', 'Site sécurisé (HTTPS)') : f('bad', 'Pas de HTTPS — affiché « non sécurisé » par Chrome, pénalisé par Google')
  viewport ? f('ok', 'Version mobile (responsive) déclarée') : f('bad', 'Pas de balise mobile — le site s\'affiche mal sur téléphone (>60% des visites)')
  if (verySlow) f('bad', `Très lent : ${(total / 1000).toFixed(1)}s pour répondre`)
  else if (slow) f('warn', `Chargement lent : ${(total / 1000).toFixed(1)}s`)
  else f('ok', `Réponse rapide : ${(total / 1000).toFixed(1)}s`)
  title ? (title.length < 15 || title.length > 65 ? f('warn', `Titre Google peu optimisé (${title.length} car.)`) : f('ok', 'Titre Google présent')) : f('bad', 'Aucun titre Google (<title>)')
  metaDesc ? f('ok', 'Description Google (meta) présente') : f('bad', 'Pas de description Google (meta description) → moins de clics depuis la recherche')
  ogImage ? f('ok', 'Aperçu réseaux sociaux configuré') : f('warn', 'Pas d\'image de partage (réseaux/WhatsApp affichent un lien nu)')
  if (h1 === 0) f('warn', 'Pas de titre principal (H1) → SEO affaibli')
  if (imgs > 0 && imgsNoAlt / imgs > 0.5) f('warn', `${imgsNoAlt}/${imgs} images sans description (alt) → invisibles sur Google Images`)
  if (status >= 400) f('bad', `Le site renvoie une erreur (HTTP ${status})`)

  // Score global indicatif /100
  let score = 100
  for (const x of findings) score -= x.level === 'bad' ? 18 : x.level === 'warn' ? 7 : 0
  score = Math.max(5, Math.min(100, score))

  // Lignes prêtes à coller dans l'email (formulées « valeur », jamais blessantes)
  const lines: string[] = []
  if (!isHttps) lines.push('votre site n\'est pas en HTTPS : Chrome affiche « non sécurisé » à vos visiteurs et Google le déclasse')
  if (!viewport) lines.push('sur mobile (la majorité de vos visiteurs), le site ne s\'adapte pas à l\'écran et devient difficile à lire')
  if (verySlow || slow) lines.push(`votre site met ${(total / 1000).toFixed(1)}s à s\'afficher — une bonne partie des visiteurs part avant de voir le contenu`)
  if (!metaDesc) lines.push('il manque la description qui s\'affiche sous votre nom dans Google : vous perdez des clics au profit des concurrents')
  if (!ogImage) lines.push('quand on partage votre site (WhatsApp, Facebook, Insta), aucune image n\'apparaît — ça réduit l\'envie de cliquer')
  if (imgs > 0 && imgsNoAlt / imgs > 0.5) lines.push('vos images ne sont pas optimisées : chargement plus lent et invisibilité sur Google Images')
  if (builder === 'Wix' || builder === 'GoDaddy' || builder === 'Jimdo') lines.push(`votre site est sur ${builder} : on peut faire un site plus rapide, mieux référencé et plus personnalisé`)
  if (h1 === 0 && !lines.length) lines.push('quelques réglages SEO de base manquent (structure des titres) et freinent votre visibilité Google')

  return NextResponse.json({
    ok: true,
    site: finalUrl,
    audit: { score, isHttps, status, responseMs: total, ttfb, bytes, title, titleLen: title.length, metaDesc: !!metaDesc, viewport, ogImage, ogTitle, h1, imgs, imgsNoAlt, scripts, favicon, canonical, lang, builder },
    findings,
    emailLines: lines.slice(0, 4),
  })
}
