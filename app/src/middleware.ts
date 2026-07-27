import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

// ── 1) Rate-limiting léger des routes PUBLIQUES qui écrivent (anti-spam) ──
// In-memory (par isolate Vercel) : suffisant pour une petite audience, 0 config/0 coût.
const WINDOW_MS = 60_000
const MAX_HITS = 12
const hits = new Map<string, number[]>()
function isLimited(ip: string): boolean {
  const now = Date.now()
  const arr = (hits.get(ip) || []).filter(t => now - t < WINDOW_MS)
  arr.push(now)
  hits.set(ip, arr)
  if (hits.size > 5000) for (const [k, v] of hits) if (!v.some(t => now - t < WINDOW_MS)) hits.delete(k)
  return arr.length > MAX_HITS
}

const RATE_LIMITED = ['/api/devis', '/api/rappel', '/api/newsletter', '/api/checkout', '/api/track']
// Chemins /hub encore servis par l'ANCIEN Hub (proxifiés) : on n'y touche pas (il gère sa propre auth).
// Débranchement terminé : plus aucun chemin /hub n'est proxifié vers l'ancien Hub.
const HUB_PROXIED: string[] = []
// Chemins /hub publics (pas d'auth requise).
const HUB_PUBLIC = ['/hub/login', '/hub/auth']

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // 1) Rate-limit des écritures publiques (comportement inchangé)
  if (RATE_LIMITED.some(p => pathname.startsWith(p))) {
    if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS') return NextResponse.next()
    const ip = (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() || 'unknown'
    if (isLimited(ip)) {
      return NextResponse.json({ error: 'Trop de requêtes, réessaie dans une minute.' }, { status: 429, headers: { 'Retry-After': '60' } })
    }
    return NextResponse.next()
  }

  // 2) Espace client NATIF : refresh de session Supabase + garde d'auth
  if (pathname.startsWith('/hub')) {
    if (HUB_PROXIED.some(p => pathname.startsWith(p))) return NextResponse.next()

    let res = NextResponse.next({ request: req })
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return req.cookies.getAll() },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => req.cookies.set(name, value))
            res = NextResponse.next({ request: req })
            cookiesToSet.forEach(({ name, value, options }) => res.cookies.set(name, value, options))
          },
        },
      },
    )

    let user = null
    try { const { data } = await supabase.auth.getUser(); user = data.user } catch { /* réseau : ne pas bloquer */ }

    const isPublic = HUB_PUBLIC.some(p => pathname.startsWith(p))
    const isApi = pathname.startsWith('/hub/api')
    // Les pages protégées non connectées → login. Les API renvoient leur propre 401 (jamais de redirect HTML).
    if (!user && !isPublic && !isApi) {
      const url = req.nextUrl.clone()
      url.pathname = '/hub/login'
      return NextResponse.redirect(url)
    }
    return res
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/hub/:path*',
    '/api/devis/:path*',
    '/api/rappel/:path*',
    '/api/newsletter/:path*',
    '/api/checkout/:path*',
    '/api/track/:path*',
  ],
}
