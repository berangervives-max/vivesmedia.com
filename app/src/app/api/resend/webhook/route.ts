import { NextRequest, NextResponse } from 'next/server'
import { createClient as createSb } from '@supabase/supabase-js'

// Webhook Resend : enregistre les évènements email (ouvertures, clics, bounces)
// dans automation_logs, attribués à une campagne via le tag « campaign ».
// Sécurité : si RESEND_WEBHOOK_SECRET est défini, l'URL configurée chez Resend
// doit contenir ?key=<secret> (ex: https://vivesmedia.com/api/resend/webhook?key=XXX).
type ResendEvent = {
  type?: string
  data?: {
    tags?: { name: string; value: string }[]
    subject?: string
    to?: string[] | string
    click?: { link?: string }
  }
}

export async function POST(req: NextRequest) {
  const secret = process.env.RESEND_WEBHOOK_SECRET
  if (secret && req.nextUrl.searchParams.get('key') !== secret) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  let evt: ResendEvent
  try { evt = await req.json() } catch { return NextResponse.json({ error: 'JSON invalide' }, { status: 400 }) }

  // On ne garde que les évènements utiles
  const map: Record<string, string> = {
    'email.opened': 'email_open',
    'email.clicked': 'email_click',
    'email.bounced': 'email_bounce',
  }
  const logType = evt.type ? map[evt.type] : undefined
  if (!logType) return NextResponse.json({ ok: true, ignored: evt.type })

  const campaign = evt.data?.tags?.find(t => t.name === 'campaign')?.value || null
  const prospect_id = evt.data?.tags?.find(t => t.name === 'prospect_id')?.value || null
  // Destinataire (pour attribuer l'ouverture/le clic au bon prospect dans la fiche)
  const to = (Array.isArray(evt.data?.to) ? evt.data?.to[0] : evt.data?.to)?.toString().toLowerCase() || null
  const link = evt.data?.click?.link || null

  try {
    const sb = createSb(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
    await sb.from('automation_logs').insert({ type: logType, payload: { campaign, prospect_id, to, link, subject: evt.data?.subject, at: new Date().toISOString() } })
  } catch { /* analytics best-effort */ }

  return NextResponse.json({ ok: true })
}
