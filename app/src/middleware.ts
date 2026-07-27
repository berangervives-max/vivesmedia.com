import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

// ── 1) Rate-limiting léger des routes PUBLIQUES qui écrivent (anti-spam) ──
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
const HUB_PUBLIC = ['/hub/login', '/hub/auth']

// Client Supabase SSR partagé (lecture des cookies de session, rafraîchissement).
function makeSupabase(req: NextRequest) {
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
  return { supabase, getRes: () => res }
}

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

  // 2) Espace CLIENT (/hub) : refresh de session + garde d'auth
  if (pathname.startsWith('/hub')) {
    const { supabase, getRes } = makeSupabase(req)
    let user = null
    try { user = (await supabase.auth.getUser()).data.user } catch { /* réseau : ne pas bloquer */ }
    const isPublic = HUB_PUBLIC.some(p => pathname.startsWith(p))
    const isApi = pathname.startsWith('/hub/api')
    if (!user && !isPublic && !isApi) {
      const url = req.nextUrl.clone(); url.pathname = '/hub/login'; return NextResponse.redirect(url)
    }
    return getRes()
  }

  // 3) Back-office ADMIN (/cms) : protection SERVEUR (défense en profondeur) + 2FA imposé.
  if (pathname.startsWith('/cms')) {
    if (pathname === '/cms/login') return NextResponse.next()
    const { supabase, getRes } = makeSupabase(req)
    const ADMIN = process.env.ADMIN_EMAIL || 'berangervives@gmail.com'
    let user = null
    let mfaSatisfied = true
    try {
      user = (await supabase.auth.getUser()).data.user
      if (user) {
        const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
        // Si un 2FA est enrôlé (nextLevel aal2) mais pas encore validé → session incomplète.
        if (aal && aal.nextLevel === 'aal2' && aal.currentLevel !== 'aal2') mfaSatisfied = false
      }
    } catch { /* réseau : ne pas verrouiller sur une erreur */ }

    if (!user || user.email !== ADMIN || !mfaSatisfied) {
      const url = req.nextUrl.clone(); url.pathname = '/cms/login'; return NextResponse.redirect(url)
    }
    return getRes()
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/hub/:path*',
    '/cms/:path*',
    '/api/devis/:path*',
    '/api/rappel/:path*',
    '/api/newsletter/:path*',
    '/api/checkout/:path*',
    '/api/track/:path*',
  ],
}
