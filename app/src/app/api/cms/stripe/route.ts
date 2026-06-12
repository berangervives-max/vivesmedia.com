import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || user.email !== 'berangervives@gmail.com') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
    const [balance, charges] = await Promise.all([
      stripe.balance.retrieve(),
      stripe.charges.list({ limit: 8 }),
    ])

    const eur = (cents: number) => Math.round(cents) / 100
    return NextResponse.json({
      disponible: eur(balance.available.reduce((s, b) => s + b.amount, 0)),
      enRoute: eur(balance.pending.reduce((s, b) => s + b.amount, 0)),
      paiements: charges.data.map(c => ({
        id: c.id,
        montant: eur(c.amount),
        statut: c.status,
        client: c.billing_details?.name || c.billing_details?.email || '—',
        date: new Date(c.created * 1000).toISOString(),
        description: c.description || '',
      })),
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erreur Stripe'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
