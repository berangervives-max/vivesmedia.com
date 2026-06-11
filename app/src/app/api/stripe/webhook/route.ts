import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { commandesService, facturesService } from '@/services/supabase.service'

export async function POST(req: NextRequest) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 })
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      await commandesService.create({
        client_nom: session.customer_details?.name || '',
        client_email: session.customer_details?.email || '',
        service: session.metadata?.service || '',
        montant: (session.amount_total || 0) / 100,
        statut: 'paye',
        stripe_session_id: session.id,
        stripe_payment_intent: session.payment_intent as string,
      })
      break
    }
    case 'payment_intent.succeeded': {
      const pi = event.data.object as Stripe.PaymentIntent
      const factures = await facturesService.getAll()
      const facture = factures.find(f => f.stripe_payment_link?.includes(pi.id))
      if (facture) await facturesService.update(facture.id, { statut: 'payee' })
      break
    }
    case 'payment_intent.payment_failed': {
      const pi = event.data.object as Stripe.PaymentIntent
      const factures = await facturesService.getAll()
      const facture = factures.find(f => f.stripe_payment_link?.includes(pi.id))
      if (facture) await facturesService.update(facture.id, { statut: 'en_retard' })
      break
    }
  }

  return NextResponse.json({ received: true })
}
