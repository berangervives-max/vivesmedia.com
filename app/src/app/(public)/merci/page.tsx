import type { Metadata } from 'next'
import Link from 'next/link'
import { CheckCircle2 } from 'lucide-react'
import TrackView from '@/components/analytics/TrackView'

export const metadata: Metadata = {
  title: 'Merci pour votre commande — vivesmedia.com',
  description: 'Votre paiement a bien été pris en compte.',
  robots: { index: false, follow: false },
}

export default async function MerciPage({ searchParams }: { searchParams: Promise<{ offer?: string }> }) {
  const { offer } = await searchParams

  return (
    <div className="min-h-screen bg-background flex items-center justify-center pt-20 pb-20">
      <TrackView event="checkout_completed" props={{ offer: offer ?? null }} />
      <div className="max-w-md w-full mx-auto px-6 text-center">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-8 h-8 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold text-foreground mb-3">Merci, c'est confirmé !</h1>
        <p className="text-muted-foreground mb-2">
          Votre paiement a bien été pris en compte. Vous allez recevoir un email de confirmation
          {' '}avec votre reçu.
        </p>
        <p className="text-muted-foreground mb-8">
          Je reviens vers vous très vite pour démarrer. Une question ?{' '}
          <a href="mailto:contact@vivesmedia.com" className="underline hover:text-foreground">contact@vivesmedia.com</a>
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/" className="flex items-center justify-center gap-2 text-white font-semibold px-6 py-3 rounded-full text-sm btn-orange-glow" style={{ backgroundColor: '#F4521E' }}>
            Retour à l'accueil
          </Link>
          <Link href="/realisations" className="flex items-center justify-center gap-2 border border-border text-foreground font-medium px-6 py-3 rounded-full text-sm hover:border-foreground transition-colors">
            Voir les réalisations
          </Link>
        </div>
      </div>
    </div>
  )
}
