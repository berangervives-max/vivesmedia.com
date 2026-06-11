import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { createClient as createSb } from '@supabase/supabase-js'

const FROM = 'vivesmedia.com <contact@vivesmedia.com>'
const BATCH_SIZE = 90 // Resend batch : 100 max par appel

function campaignHtml(body: string) {
  const paragraphs = body
    .split(/\n{2,}/)
    .map(p => `<p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:#374151;">${p.replace(/\n/g, '<br/>')}</p>`)
    .join('')
  return `
<div style="background:#F9F9F9;padding:32px 16px;font-family:-apple-system,Segoe UI,Roboto,sans-serif;">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #ECECEC;">
    <div style="background:#F4521E;padding:20px 28px;">
      <span style="color:#fff;font-weight:700;font-size:16px;">vivesmedia<span style="opacity:.6;">.com</span></span>
    </div>
    <div style="padding:28px;">
      ${paragraphs}
    </div>
    <div style="padding:16px 28px;border-top:1px solid #F1F3F5;">
      <p style="margin:0;font-size:11px;color:#9CA3AF;">
        Vous recevez cet email car vous êtes abonné à la newsletter Vivesinsights.
        <a href="https://vivesmedia.com" style="color:#F4521E;">vivesmedia.com</a>
      </p>
    </div>
  </div>
</div>`
}

export async function POST(req: NextRequest) {
  try {
    // Auth : seul l'admin connecté au CMS peut envoyer
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

    const { subject, body } = await req.json()
    if (!subject || !body) return NextResponse.json({ error: 'Objet et message requis' }, { status: 400 })

    // Destinataires : abonnés newsletter actifs (service role pour contourner RLS)
    const admin = createSb(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
    const { data: abonnes, error } = await admin.from('newsletter').select('email').eq('actif', true)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    if (!abonnes || abonnes.length === 0) return NextResponse.json({ error: 'Aucun abonné actif' }, { status: 400 })

    const html = campaignHtml(body)
    const emails = abonnes.map(a => a.email)
    let sent = 0

    for (let i = 0; i < emails.length; i += BATCH_SIZE) {
      const batch = emails.slice(i, i + BATCH_SIZE).map(to => ({ from: FROM, to, subject, html }))
      const res = await fetch('https://api.resend.com/emails/batch', {
        method: 'POST',
        headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(batch),
      })
      if (res.ok) sent += batch.length
      else {
        const err = await res.text()
        return NextResponse.json({ error: `Resend : ${err}`, sent }, { status: 502 })
      }
    }

    return NextResponse.json({ success: true, sent })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
