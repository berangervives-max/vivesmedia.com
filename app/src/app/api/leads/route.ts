import { NextRequest, NextResponse, after } from 'next/server'
import { leadsService } from '@/services/supabase.service'
import { sendLeadConfirmation } from '@/services/email.service'

export async function POST(req: NextRequest) {
  try {
    const { email: rawEmail, website, source } = await req.json()
    // Honeypot anti-bot : champ piège rempli → succès simulé, aucune écriture.
    if (typeof website === 'string' && website.trim() !== '') {
      return NextResponse.json({ success: true })
    }
    if (!rawEmail || typeof rawEmail !== 'string' || rawEmail.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rawEmail)) {
      return NextResponse.json({ error: 'Email invalide' }, { status: 400 })
    }
    const email = rawEmail.trim().toLowerCase()

    // Allowlist stricte : "source" sert à savoir quel bloc a capté le lead,
    // jamais une valeur libre interpolée dans l'email admin (voir email.service.ts).
    const ALLOWED_SOURCES = ['accueil'] as const
    const safeSource = ALLOWED_SOURCES.includes(source) ? source : 'accueil'

    // Capture atomique (insert ou refresh si > 10 min) côté SQL — voir
    // leadsService.capture. shouldNotify=false pour un doublon récent.
    const shouldNotify = await leadsService.capture(email, safeSource)
    if (shouldNotify) {
      // Hors du chemin de réponse (after()) : le visiteur n'attend pas l'envoi
      // Resend, et le temps de réponse ne distingue pas "nouveau" de "doublon"
      // (pas d'oracle d'énumération sur la forme ou le timing de la réponse).
      after(() => sendLeadConfirmation({ email, source: safeSource }))
    }

    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    console.error('[POST /api/leads]', err)
    return NextResponse.json({ error: 'Une erreur est survenue' }, { status: 500 })
  }
}
