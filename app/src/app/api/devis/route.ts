import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { devisService } from '@/services/supabase.service'
import { sendDevisReceived } from '@/services/email.service'

// Vérifie le code à 6 chiffres scellé dans le token HMAC (voir /api/devis/send-code).
const SECRET = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.CRON_SECRET || 'dev-secret'
function verifyCode(token: unknown, email: string, code: unknown): boolean {
  try {
    const [p, sig] = String(token).split('.')
    if (!p || !sig) return false
    const expected = crypto.createHmac('sha256', SECRET).update(p).digest('base64url')
    const a = Buffer.from(sig), b = Buffer.from(expected)
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return false
    const obj = JSON.parse(Buffer.from(p, 'base64url').toString())
    if (Date.now() > obj.exp) return false
    return obj.email === email.toLowerCase() && obj.code === String(code)
  } catch { return false }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    // Honeypot anti-bot : si le champ piège est rempli, on simule un succès sans rien faire
    if (typeof body.website === 'string' && body.website.trim() !== '') {
      return NextResponse.json({ success: true })
    }
    const { nom, email, telephone, service, budget, message, code, token } = body

    if (!nom || !email) return NextResponse.json({ error: 'Nom et email requis' }, { status: 400 })
    if (typeof nom !== 'string' || typeof email !== 'string') return NextResponse.json({ error: 'Format invalide' }, { status: 400 })
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ error: 'Email invalide' }, { status: 400 })
    if (nom.length > 120 || email.length > 254 || String(message ?? '').length > 5000 || String(telephone ?? '').length > 30) {
      return NextResponse.json({ error: 'Contenu trop long' }, { status: 400 })
    }
    // Vérification email obligatoire : le code reçu par email prouve qu'il est réel.
    if (!verifyCode(token, email, code)) {
      return NextResponse.json({ error: 'Email non vérifié. Saisissez le code reçu par email.' }, { status: 400 })
    }

    const devis = await devisService.create({ nom, email, telephone: telephone || '', service: service || '', budget: budget || '', message: message || '', statut: 'nouveau', lu: false })

    await sendDevisReceived({ nom, email, service, message })

    return NextResponse.json({ success: true, id: devis.id })
  } catch (err: any) {
    console.error('[POST /api/devis]', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
