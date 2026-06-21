import { NextRequest, NextResponse } from 'next/server'
import { createClient as createSb } from '@supabase/supabase-js'

// Pixel de tracking d'OUVERTURE d'email (auto-hébergé, sans dépendance Resend).
// L'email contient <img src=".../api/track/open?pid=...&e=..."> : au chargement
// de l'image par le destinataire, on journalise un évènement email_open.
// Endpoint public (le destinataire n'est pas connecté). Retourne un GIF 1x1.
export const dynamic = 'force-dynamic'
const GIF = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64')

export async function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams
  const pid = p.get('pid') || null
  const to = (p.get('e') || '').toLowerCase() || null
  if (pid || to) {
    try {
      const sb = createSb(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
      await sb.from('automation_logs').insert({ type: 'email_open', payload: { prospect_id: pid, to, via: 'pixel', at: new Date().toISOString() } })
    } catch { /* best-effort */ }
  }
  return new NextResponse(new Uint8Array(GIF), {
    status: 200,
    headers: { 'Content-Type': 'image/gif', 'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0', Pragma: 'no-cache', Expires: '0' },
  })
}
