import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { createClient as createSb } from '@supabase/supabase-js'

// Envoi d'un email de prospection personnalisé, contact par contact, depuis la fiche.
// Admin uniquement. Part de contact@vivesmedia.com via Resend. Trace dans automation_logs.
const FROM = 'Béranger Vives <contact@vivesmedia.com>'
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== 'berangervives@gmail.com') {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }
  const { to, subject, body } = await req.json().catch(() => ({}))
  if (!to || !subject || !body) return NextResponse.json({ error: 'to, subject, body requis' }, { status: 400 })

  // Rendu sobre/personnel (meilleure délivrabilité en cold email qu'un template marketing)
  const html = `<div style="font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;font-size:15px;line-height:1.6;color:#1a1a1a">${esc(body).split(/\n{2,}/).map(p => `<p style="margin:0 0 14px">${p.replace(/\n/g, '<br/>')}</p>`).join('')}</div>`

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: FROM, to, subject, html, reply_to: 'contact@vivesmedia.com' }),
  })
  if (!res.ok) {
    const err = await res.text()
    return NextResponse.json({ error: `Resend : ${err}` }, { status: 502 })
  }
  try {
    const admin = createSb(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
    await admin.from('automation_logs').insert({ type: 'prospect_email', payload: { to, subject, at: new Date().toISOString() } })
  } catch { /* trace best-effort */ }
  return NextResponse.json({ ok: true })
}
