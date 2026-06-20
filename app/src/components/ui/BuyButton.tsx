'use client'
import { useState } from 'react'
import { ArrowUpRight, Loader2 } from 'lucide-react'
import { track } from '@/lib/analytics'

type Props = {
  offer: string
  label: string
  price: number
  mode: 'payment' | 'subscription'
}

// Bouton d'achat self-service : crée une session Stripe Checkout et redirige.
export default function BuyButton({ offer, label, price, mode }: Props) {
  const [loading, setLoading] = useState(false)

  const handleClick = async () => {
    setLoading(true)
    track('checkout_started', { offer, price, mode })
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ offer }),
      })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        track('checkout_failed', { offer, reason: data.error || 'no_url' })
        setLoading(false)
      }
    } catch {
      track('checkout_failed', { offer, reason: 'network' })
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="flex items-center justify-center gap-2 text-white font-semibold px-6 py-3.5 rounded-full text-sm btn-orange-glow disabled:opacity-60"
      style={{ backgroundColor: '#F4521E' }}
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>{label} <ArrowUpRight className="w-4 h-4" /></>}
    </button>
  )
}
