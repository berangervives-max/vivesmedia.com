import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { commandesService, facturesService } from '@/services/supabase.service'
import { creerFactureAbby, isAbbyConfigured } from '@/lib/abby'

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
      const clientNom = session.customer_details?.name || ''
      const clientEmail = session.customer_details?.email || ''
      const service = session.metadata?.service || ''
      const montant = (session.amount_total || 0) / 100

      await commandesService.create({
        client_nom: clientNom,
        client_email: clientEmail,
        service,
        montant,
        statut: 'paye',
        stripe_session_id: session.id,
        stripe_payment_intent: session.payment_intent as string,
      })

      // Émission de la facture dans Abby (plateforme agréée 2026).
      // Isolé : un échec Abby ne doit jamais faire échouer l'enregistrement de la commande.
      if (isAbbyConfigured()) {
        try {
          const res = await creerFactureAbby({ clientNom, clientEmail, service, montant })
          if (res) console.log(`[abby] facture créée: ${res.invoiceId} (session ${session.id})`)
        } catch (err) {
          console.error('[abby] échec création facture:', err)
        }
      }
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
