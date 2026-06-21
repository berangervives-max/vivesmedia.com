import { NextRequest, NextResponse } from 'next/server'
import { createClient as createSb } from '@supabase/supabase-js'

// Tracking de CLIC (auto-hébergé). Les liens des emails sont réécrits vers
// .../api/track/click?pid=...&e=...&u=<url>. On journalise email_click puis on
// redirige (302) vers l'URL réelle. Endpoint public.
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams
  const pid = p.get('pid') || null
  const to = (p.get('e') || '').toLowerCase() || null
  const fallback = process.env.NEXT_PUBLIC_SITE_URL || 'https://vivesmedia.com'
  let target = ''
  try {
    const url = new URL(p.get('u') || '')
    if (['http:', 'https:'].includes(url.protocol)) target = url.toString()
  } catch { /* url invalide */ }
  if (!target) return NextResponse.redirect(fallback, 302)
  try {
    const sb = createSb(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
    await sb.from('automation_logs').insert({ type: 'email_click', payload: { prospect_id: pid, to, link: target, via: 'redirect', at: new Date().toISOString() } })
  } catch { /* best-effort */ }
  return NextResponse.redirect(target, 302)
}
