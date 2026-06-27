import { NextResponse, type NextRequest } from 'next/server'

// Rate-limiting léger des routes PUBLIQUES qui écrivent (anti-spam / anti-abus).
// In-memory (par isolate Vercel) : suffisant pour une petite audience et 0 config/0 coût.
// Pour une protection distribuée stricte → passer à Upstash Redis (TODO, payant).
//
// Volontairement NON couverts : les webhooks signés (/api/stripe, /api/resend) et le
// cron (/api/cron), pour ne pas bloquer des appels légitimes ; et /api/cms/* déjà
// protégé par l'auth admin.

const WINDOW_MS = 60_000
const MAX_HITS = 12 // 12 requêtes / minute / IP sur les endpoints publics
const hits = new Map<string, number[]>()

function isLimited(ip: string): boolean {
  const now = Date.now()
  const arr = (hits.get(ip) || []).filter(t => now - t < WINDOW_MS)
  arr.push(now)
  hits.set(ip, arr)
  // Nettoyage opportuniste pour éviter la fuite mémoire
  if (hits.size > 5000) for (const [k, v] of hits) if (!v.some(t => now - t < WINDOW_MS)) hits.delete(k)
  return arr.length > MAX_HITS
}

export function middleware(req: NextRequest) {
  // On ne limite que les écritures (POST/PUT/PATCH/DELETE)
  if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS') return NextResponse.next()
  const ip = (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() || 'unknown'
  if (isLimited(ip)) {
    return NextResponse.json(
      { error: 'Trop de requêtes, réessaie dans une minute.' },
      { status: 429, headers: { 'Retry-After': '60' } },
    )
  }
  return NextResponse.next()
}

// Limité aux endpoints publics sensibles (formulaires + tracking + paiement).
export const config = {
  matcher: ['/api/devis/:path*', '/api/rappel/:path*', '/api/newsletter/:path*', '/api/checkout/:path*', '/api/track/:path*'],
}
