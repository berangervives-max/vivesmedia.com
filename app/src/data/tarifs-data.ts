// Source de vérité unique des tarifs vivesmedia.com.
// Consommée par /services (détail des offres) ET /tarifs (comparatif + FAQ).
// Modifier un prix ICI le met à jour sur les deux pages — jamais de divergence.

export interface Formule {
  slug: string
  num: string
  title: string
  price: string
  priceNote?: string // ex. "paiement unique"
  sub?: string // ligne abonnement / mensualité
  badge?: string // ex. "Le plus populaire", "Nouveau"
  desc: string
  features: string[]
}

export interface MaintenancePlan {
  name: string
  price: string
  recommended: boolean
  features: string[]
}

// ── Création de sites (paiement unique, abonnement possible) ──
export const creationFormules: Formule[] = [
  {
    slug: 'site-ecommerce',
    num: '01',
    title: 'Site E-Commerce',
    price: '3 840€',
    priceNote: 'paiement unique',
    sub: 'ou 149€/mois en abonnement · acompte 790€ · engagement 24 mois min.',
    badge: 'Le plus populaire',
    desc: 'Boutique en ligne complète avec paiement Stripe, gestion des stocks temps réel et dashboard admin complet. Prête à vendre dès le premier jour.',
    features: ['Stripe / PayPal / Klarna', 'Gestion des stocks temps réel', 'Dashboard admin complet', "Jusqu'à 50 produits", 'Blog intégré', 'Support 6 mois inclus'],
  },
  {
    slug: 'site-catalogue',
    num: '02',
    title: 'Site Catalogue',
    price: '2 740€',
    priceNote: 'paiement unique',
    desc: "Présentez jusqu'à 250 produits avec filtres avancés et fiches techniques PDF. Idéal pour les artisans et fabricants.",
    features: ['250 produits maximum', 'Filtres de recherche avancés', 'Fiches techniques PDF', 'SEO optimisé', 'Design responsive premium', 'Support prioritaire'],
  },
  {
    slug: 'site-vitrine',
    num: '03',
    title: 'Site Vitrine',
    price: '1 800€',
    priceNote: 'paiement unique',
    sub: 'ou 89€/mois en abonnement · acompte 490€ · 24 mois min.',
    desc: '5 pages sur-mesure, design responsive premium, SEO local optimisé, formulaire de contact. Hébergement 1 an offert.',
    features: ['Design 100% sur-mesure', 'SEO local optimisé', '5 pages professionnelles', 'Formulaire de contact', 'Hébergement 1 an offert', 'Formation admin incluse'],
  },
]

// ── Nouveaux services IA ──
export const iaServices: Formule[] = [
  {
    slug: 'video-contenu-ia',
    num: '04',
    title: 'Vidéo & Contenu IA',
    price: '490€/mois',
    badge: 'Nouveau',
    desc: 'Reels Instagram, vidéos produit et backgrounds cinématiques générés par IA. Livraison hebdomadaire, prêts à publier.',
    features: ['8 à 16 vidéos/mois', 'Format Reels 9:16', 'Format desktop 16:9', 'Calendrier éditorial', 'Copywriting inclus'],
  },
  {
    slug: 'visibilite-ia',
    num: '05',
    title: 'Visibilité IA (AEO/GEO)',
    price: '490€/mois',
    badge: 'Nouveau',
    desc: "Être cité par ChatGPT, Perplexity et Gemini. Audit, plan d'action et tracking mensuel.",
    features: ['Audit citations IA', 'Tracking mensuel', 'Optimisation contenu AEO', 'Rapport Brand Radar', 'Schema.org implémenté'],
  },
  {
    slug: 'formation-ia',
    num: '06',
    title: 'Formation IA',
    price: 'dès 290€/session',
    badge: 'Nouveau',
    desc: 'Apprenez à utiliser Claude et les agents IA. Sessions Zoom individuelles, workbooks et replays inclus.',
    features: ['Sessions Zoom 2h', 'Workbook exercices', 'Cheat sheet prompts', 'Replay vidéo', 'Pack 5 sessions dispo'],
  },
]

// ── Services récurrents (abonnements) ──
export const recurrentServices: Formule[] = [
  {
    slug: 'seo',
    num: '07',
    title: 'Référencement SEO',
    price: '274€/mois',
    desc: 'Audit technique, optimisation on-page, articles ciblés. Du trafic qualifié, durablement.',
    features: ['Audit SEO complet', 'Optimisation technique', 'Stratégie de contenu', 'Suivi rankings', 'Rapport mensuel'],
  },
  {
    slug: 'crm-automatisation',
    num: '08',
    title: 'CRM & Automatisation IA',
    price: 'Sur Devis',
    desc: 'Agents IA autonomes 24/7, workflows automatisés, prospection sur pilote automatique.',
    features: ['Agents IA 24/7', 'Workflows automatisés', 'CRM sur-mesure', 'Intégration Stripe', 'Tableau de bord'],
  },
  {
    slug: 'maintenance',
    num: '09',
    title: 'Maintenance',
    price: 'dès 55€/mois',
    desc: 'Mises à jour, sauvegardes quotidiennes, monitoring uptime. Votre site entre de bonnes mains.',
    features: ['Mises à jour sécurité', 'Sauvegardes régulières', 'Monitoring 24/7', 'Support prioritaire', 'Rapport mensuel'],
  },
]

// ── Paliers de maintenance ──
export const maintenancePlans: MaintenancePlan[] = [
  { name: 'Essentiel', price: '55€/mois', recommended: false, features: ['Mises à jour sécurité', 'Sauvegarde mensuelle', '1h modifications/mois', 'Support email 48h'] },
  { name: 'Pro', price: '110€/mois', recommended: true, features: ['Sauvegarde hebdomadaire', '3h modifications/mois', 'Support prioritaire 24h', 'Monitoring Uptime 24/7'] },
  { name: 'Premium', price: '165€/mois', recommended: false, features: ['Sauvegarde quotidienne', '5h modifications/mois', 'Support Visio dédié', 'Audit sécurité mensuel'] },
]

// ── FAQ tarifs (alimente aussi le Schema FAQPage de /tarifs) ──
export const tarifsFaq: { q: string; a: string }[] = [
  {
    q: "Combien coûte la création d'un site internet à Avignon ?",
    a: "Un site vitrine démarre à 1 800€, un site catalogue à 2 740€ et un site e-commerce à 3 840€ en paiement unique. Une formule abonnement est aussi disponible dès 89€/mois pour étaler le coût.",
  },
  {
    q: 'Peut-on payer son site en plusieurs fois ?',
    a: "Oui. En plus du paiement unique, la formule abonnement permet d'étaler le coût : un acompte à la commande puis des mensualités (89€/mois pour un site vitrine, 149€/mois pour un e-commerce), avec un engagement de 24 mois minimum.",
  },
  {
    q: "L'hébergement est-il compris dans le prix ?",
    a: "Pour un site vitrine, l'hébergement de la première année est offert. Au-delà, l'hébergement, les mises à jour et les sauvegardes sont couverts par un forfait maintenance à partir de 55€/mois.",
  },
  {
    q: 'Y a-t-il des frais cachés ou mensuels obligatoires ?',
    a: "Non. Le prix de création est tout compris et annoncé d'avance. Les abonnements (SEO, maintenance, contenu IA) sont entièrement optionnels et choisis selon vos besoins.",
  },
  {
    q: 'Quelle est la différence de prix entre un site vitrine et un site e-commerce ?',
    a: "Un site vitrine (1 800€) sert à présenter une activité sur 5 pages sur-mesure. Un site e-commerce (3 840€) ajoute une boutique en ligne complète : paiement Stripe, gestion des stocks en temps réel et dashboard d'administration pour vendre directement.",
  },
  {
    q: 'Combien coûte le référencement (SEO) chaque mois ?',
    a: "L'abonnement SEO est à 274€/mois : audit technique, optimisation on-page, articles ciblés, suivi des positions et rapport mensuel. Il est indépendant du prix de création du site.",
  },
]
