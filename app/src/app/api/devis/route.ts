import { NextRequest, NextResponse } from 'next/server'
import { devisService } from '@/services/supabase.service'
import { sendDevisReceived } from '@/services/email.service'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { nom, email, telephone, service, budget, message } = body

    if (!nom || !email) return NextResponse.json({ error: 'Nom et email requis' }, { status: 400 })
    if (typeof nom !== 'string' || typeof email !== 'string') return NextResponse.json({ error: 'Format invalide' }, { status: 400 })
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ error: 'Email invalide' }, { status: 400 })
    if (nom.length > 120 || email.length > 254 || String(message ?? '').length > 5000 || String(telephone ?? '').length > 30) {
      return NextResponse.json({ error: 'Contenu trop long' }, { status: 400 })
    }

    const devis = await devisService.create({ nom, email, telephone: telephone || '', service: service || '', budget: budget || '', message: message || '', statut: 'nouveau', lu: false })

    await sendDevisReceived({ nom, email, service, message })

    return NextResponse.json({ success: true, id: devis.id })
  } catch (err: any) {
    console.error('[POST /api/devis]', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
