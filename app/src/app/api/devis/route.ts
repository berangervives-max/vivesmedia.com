import { NextRequest, NextResponse } from 'next/server'
import { devisService } from '@/services/supabase.service'
import { sendDevisReceived } from '@/services/email.service'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { nom, email, telephone, service, budget, message } = body

    if (!nom || !email) return NextResponse.json({ error: 'Nom et email requis' }, { status: 400 })

    const devis = await devisService.create({ nom, email, telephone: telephone || '', service: service || '', budget: budget || '', message: message || '', statut: 'nouveau', lu: false })

    await sendDevisReceived({ nom, email, service, message })

    return NextResponse.json({ success: true, id: devis.id })
  } catch (err: any) {
    console.error('[POST /api/devis]', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
