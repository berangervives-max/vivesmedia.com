import { NextRequest, NextResponse } from 'next/server'
import { leadsService } from '@/services/supabase.service'
import { sendLeadConfirmation } from '@/services/email.service'

export async function POST(req: NextRequest) {
  try {
    const { email, website, source } = await req.json()
    // Honeypot anti-bot : champ piège rempli → succès simulé, aucune écriture.
    if (typeof website === 'string' && website.trim() !== '') {
      return NextResponse.json({ success: true })
    }
    if (!email || typeof email !== 'string' || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Email invalide' }, { status: 400 })
    }
    // Allowlist stricte : "source" sert à savoir quel bloc a capté le lead,
    // jamais une valeur libre interpolée dans l'email admin (voir email.service.ts).
    const ALLOWED_SOURCES = ['accueil'] as const
    const safeSource = ALLOWED_SOURCES.includes(source) ? source : 'accueil'

    const lead = await leadsService.create(email, safeSource)
    await sendLeadConfirmation({ email, source: safeSource })

    return NextResponse.json({ success: true, id: lead.id })
  } catch (err: unknown) {
    console.error('[POST /api/leads]', err)
    return NextResponse.json({ error: 'Une erreur est survenue' }, { status: 500 })
  }
}
