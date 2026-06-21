import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { createClient as createSb } from '@supabase/supabase-js'

// Envoi d'un SMS de prospection via Brevo (API transactionalSMS), depuis la fiche.
// Admin uniquement. Expéditeur = BREVO_SMS_SENDER (défaut "vivesmedia").
// Trace dans automation_logs (type prospect_sms). Conforme : créneau 8h-20h FR,
// hors dimanche ; Brevo ajoute le STOP pour les SMS marketing FR.
const ADMIN = 'berangervives@gmail.com'
const SENDER = (process.env.BREVO_SMS_SENDER || 'vivesmedia').slice(0, 11)

// 0X XX XX XX XX → 33XXXXXXXXX (format international sans +)
function toIntl(raw: string): string {
  const p = (raw || '').replace(/[^\d+]/g, '').replace(/^\+/, '')
  if (p.startsWith('33')) return p
  if (p.startsWith('0')) return '33' + p.slice(1)
  return p
}
// Fenêtre légale d'envoi marketing en France : 8h-20h, pas le dimanche
function withinLegalWindow(d = new Date()): boolean {
  const fr = new Date(d.toLocaleString('en-US', { timeZone: 'Europe/Paris' }))
  const h = fr.getHours(); const day = fr.getDay() // 0 = dimanche
  return day !== 0 && h >= 8 && h < 20
}

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user?.email !== ADMIN) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const key = process.env.BREVO_API_KEY
  if (!key) return NextResponse.json({ error: 'Clé Brevo manquante (ajoute BREVO_API_KEY dans Vercel).' }, { status: 503 })

  const { to, text, clientId, force } = await req.json().catch(() => ({}))
  if (!to || !text) return NextResponse.json({ error: 'to + text requis' }, { status: 400 })
  const recipient = toIntl(String(to))
  if (!/^33[67]\d{8}$/.test(recipient) && !/^33[1-9]\d{8}$/.test(recipient)) {
    return NextResponse.json({ error: 'Numéro invalide (format FR attendu)' }, { status: 400 })
  }
  if (!force && !withinLegalWindow()) {
    return NextResponse.json({ error: 'Hors créneau légal (8h-20h, pas le dimanche). Réessaie dans la plage autorisée.' }, { status: 425 })
  }

  const res = await fetch('https://api.brevo.com/v3/transactionalSMS/sms', {
    method: 'POST',
    headers: { 'api-key': key, 'Content-Type': 'application/json', accept: 'application/json' },
    body: JSON.stringify({ sender: SENDER, recipient, content: String(text).slice(0, 480), type: 'marketing' }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    return NextResponse.json({ error: `Brevo : ${data?.message || res.status}` }, { status: 502 })
  }
  try {
    const admin = createSb(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
    await admin.from('automation_logs').insert({ type: 'prospect_sms', payload: { to: recipient, prospect_id: clientId || null, via: 'brevo', messageId: data?.messageId || null, remaining: data?.remainingCredits ?? null, at: new Date().toISOString() } })
  } catch { /* trace best-effort */ }
  return NextResponse.json({ ok: true, remainingCredits: data?.remainingCredits ?? null })
}
