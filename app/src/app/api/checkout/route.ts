import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getBuyableOffer } from '@/lib/checkout-catalog'

// Crée une session Stripe Checkout pour une offre packagée (achat direct).
// Le prix vient du catalogue serveur (non falsifiable). Le webhook
// /api/stripe/webhook gère ensuite checkout.session.completed.
export async function POST(req: NextRequest) {
  try {
    const { offer } = await req.json().catch(() => ({ offer: null }))
    const item = getBuyableOffer(String(offer ?? ''))
    if (!item) {
      return NextResponse.json({ error: 'Offre non disponible à l\'achat en ligne' }, { status: 400 })
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
    const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'https://vivesmedia.com'

    const session = await stripe.checkout.sessions.create({
      mode: item.mode,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: 'eur',
            product_data: { name: item.name },
            unit_amount: item.amountCents,
            ...(item.mode === 'subscription' ? { recurring: { interval: 'month' } } : {}),
          },
        },
      ],
      success_url: `${origin}/merci?offer=${item.slug}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/services/${item.slug}?achat=annule`,
      metadata: { service: item.slug, offer_name: item.name },
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erreur lors de la création du paiement'
    console.error('[POST /api/checkout]', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
