// Catalogue des offres ACHETABLES en self-service (Stripe Checkout).
// Source de vérité côté serveur : le client ne peut pas falsifier le prix.
// Les projets sur-mesure (sites, CRM, catalogue) restent en DEVIS (pas ici).

export type BuyableOffer = {
  slug: string
  name: string
  amountCents: number
  mode: 'payment' | 'subscription' // paiement unique vs abonnement mensuel
}

export const CHECKOUT_CATALOG: Record<string, BuyableOffer> = {
  maintenance: {
    slug: 'maintenance',
    name: 'Maintenance mensuelle — vivesmedia.com',
    amountCents: 5500,
    mode: 'subscription',
  },
  seo: {
    slug: 'seo',
    name: 'Référencement SEO — vivesmedia.com',
    amountCents: 27400,
    mode: 'subscription',
  },
  'visibilite-ia': {
    slug: 'visibilite-ia',
    name: 'Visibilité IA (AEO/GEO) — vivesmedia.com',
    amountCents: 49000,
    mode: 'subscription',
  },
  'video-contenu-ia': {
    slug: 'video-contenu-ia',
    name: 'Vidéo & Contenu IA — vivesmedia.com',
    amountCents: 49000,
    mode: 'subscription',
  },
  'formation-ia': {
    slug: 'formation-ia',
    name: 'Formation IA (session individuelle 2h) — vivesmedia.com',
    amountCents: 29000,
    mode: 'payment',
  },
}

export function getBuyableOffer(slug: string): BuyableOffer | null {
  return CHECKOUT_CATALOG[slug] ?? null
}

export function isBuyable(slug: string): boolean {
  return slug in CHECKOUT_CATALOG
}
