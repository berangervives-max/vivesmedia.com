import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { validateEmail } from '@/lib/email-validation'
import { createServiceClient } from '@/lib/supabase'

// Envoie un code à 6 chiffres sur l'email saisi, pour PROUVER qu'il est réel
// avant d'accepter le devis. Stateless : le code est scellé dans un token HMAC
// (aucune table). Le client renvoie ce token + le code à /api/devis.

const SECRET = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.CRON_SECRET || 'dev-secret'
const FROM = 'vivesmedia.com <contact@vivesmedia.com>'

// Domaines d'emails jetables / temporaires les plus courants → refusés.
const DISPOSABLE = /(mailinator|yopmail|guerrillamail|10minutemail|tempmail|temp-mail|trashmail|getnada|sharklasers|maildrop|throwaway|fakeinbox|dispostable|moakt|emailondeck|mohmal|spam4|mintemail|tmpmail)\./i

export function signCode(payload: object): string {
  const p = Buffer.from(JSON.stringify(payload)).toString('base64url')
  const sig = crypto.createHmac('sha256', SECRET).update(p).digest('base64url')
  return `${p}.${sig}`
}

export async function POST(req: NextRequest) {
  const { email } = await req.json().catch(() => ({}))
  if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Email invalide' }, { status: 400 })
  }
  if (DISPOSABLE.test(email)) {
    return NextResponse.json({ error: 'Les adresses email temporaires ne sont pas acceptées. Utilisez votre vraie adresse.' }, { status: 400 })
  }

  // Validation de délivrabilité réelle (s'active dès qu'une clé API est posée).
  const check = await validateEmail(email)
  // Tracking : on journalise chaque vérification (succès/échec) pour le suivi CMS.
  try {
    createServiceClient().from('automation_logs').insert({
      type: 'email_validation',
      payload: { email: email.toLowerCase(), ok: check.ok, status: check.status, provider: check.provider, skipped: !!check.skipped, at: new Date().toISOString() },
    }).then(() => {}, () => {})
  } catch { /* best-effort */ }
  if (!check.ok) {
    return NextResponse.json({ error: 'Cette adresse email semble invalide ou injoignable. Vérifiez-la ou utilisez « Continuer avec Google ».' }, { status: 400 })
  }

  const code = String(Math.floor(100000 + Math.random() * 900000))
  const token = signCode({ email: email.toLowerCase(), code, exp: Date.now() + 10 * 60 * 1000 }) // 10 min

  const key = process.env.RESEND_API_KEY
  if (!key) return NextResponse.json({ error: 'Service email indisponible' }, { status: 503 })
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: FROM, to: email,
      subject: `Votre code de vérification : ${code}`,
      html: `<div style="font-family:-apple-system,Segoe UI,Arial,sans-serif;color:#111827"><p>Voici votre code de vérification pour finaliser votre demande de devis sur vivesmedia.com :</p><p style="font-size:30px;font-weight:800;letter-spacing:6px;color:#F4521E;margin:16px 0">${code}</p><p style="color:#6B7280;font-size:13px">Ce code expire dans 10 minutes. Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.</p></div>`,
    }),
  })
  if (!res.ok) return NextResponse.json({ error: 'Envoi du code impossible' }, { status: 502 })
  return NextResponse.json({ ok: true, token })
}
