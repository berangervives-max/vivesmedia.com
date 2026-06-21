import type { Metadata } from 'next'
import { SITE_URL } from '@/lib/schema'

// Pages locales SEO programmatiques. Contenu UNIQUE par ville (intro + FAQ) pour
// éviter le duplicate content. La page /freelance-web-vaucluse (département) reste à part.
export type City = {
  slug: string // ex: 'freelance-web-avignon'
  city: string // 'Avignon'
  dept: string // 'Vaucluse'
  deptNum: string // '84'
  region: string
  nearby: string[]
  title: string
  description: string
  intro: [string, string] // 2 paragraphes uniques (peuvent contenir <strong>)
  faq: { q: string; a: string }[]
}

const COMMON_FAQ = (city: string): { q: string; a: string }[] => [
  {
    q: 'Quel type de sites créez-vous ?',
    a: "Des sites internet sur-mesure : vitrines, e-commerce et catalogues. Tout est conçu sur-mesure côté design (UX/UI), front et back — jamais un template générique — et optimisé pour convertir vos visiteurs en clients.",
  },
  {
    q: 'Le référencement Google (SEO) est-il inclus ?',
    a: `Oui. Chaque site est livré optimisé pour le SEO (structure, vitesse, balises, données structurées) afin de remonter sur Google, y compris sur les recherches locales à ${city}.`,
  },
  {
    q: 'En combien de temps mon site est-il livré ?',
    a: 'Comptez environ 3 semaines pour un site vitrine, selon votre réactivité sur les contenus. Vous êtes accompagné et formé pour être autonome à la livraison.',
  },
]

export const CITIES: Record<string, City> = {
  'freelance-web-avignon': {
    slug: 'freelance-web-avignon',
    city: 'Avignon',
    dept: 'Vaucluse',
    deptNum: '84',
    region: "Provence-Alpes-Côte d'Azur",
    nearby: ['Le Pontet', 'Villeneuve-lès-Avignon', 'Sorgues', 'Morières-lès-Avignon', 'Vedène', 'Les Angles', 'Caumont-sur-Durance'],
    title: 'Freelance web à Avignon — création de site internet (84)',
    description:
      "Freelance web à Avignon : création de site internet sur-mesure (vitrine, e-commerce), design, SEO et automatisation. Rencontre sur place ou en visio. Devis gratuit sous 24h.",
    intro: [
      "Vous cherchez un <strong>freelance web à Avignon</strong> pour créer ou refondre le site internet de votre entreprise ? Installé dans la cité des papes, j'accompagne les commerçants de l'intra-muros, les artisans, les indépendants et les PME du bassin avignonnais dans la <strong>création de sites internet sur-mesure</strong> — du design à la mise en ligne. Des sites rapides, élégants et pensés pour transformer vos visiteurs en clients.",
      "Avignon vit au rythme du tourisme, de la culture et d'un tissu de TPE dynamique : votre site doit vous démarquer et vous rendre visible sur Google dès la première recherche locale. Pas de template revendu à l'identique — chaque projet est conçu sur-mesure côté <strong>design UX/UI</strong>, optimisé pour le <strong>référencement (SEO)</strong> et la <strong>visibilité sur les IA</strong> (ChatGPT, Perplexity). Je peux aussi automatiser vos tâches et connecter vos outils (CRM, e-mails, facturation).",
    ],
    faq: [
      { q: 'Combien coûte un site internet à Avignon ?', a: 'Un site vitrine démarre à 1 490€, un site e-commerce à 3 840€. Le tarif dépend du nombre de pages et des fonctionnalités. Vous recevez un devis gratuit et détaillé sous 24h, sans engagement.' },
      { q: 'Peut-on se rencontrer sur Avignon ?', a: "Oui, je suis basé à Avignon : on peut échanger en visio ou se rencontrer sur place selon votre préférence. Vous avez un interlocuteur unique, du premier échange jusqu'à la livraison." },
      { q: 'Mon site ressortira-t-il sur les recherches locales à Avignon ?', a: 'Oui. Chaque site est optimisé pour le référencement local (SEO + pack Google Maps) afin de remonter sur des recherches comme « votre activité + Avignon » et capter des clients de proximité.' },
      ...COMMON_FAQ('Avignon'),
    ],
  },
  'freelance-web-orange': {
    slug: 'freelance-web-orange',
    city: 'Orange',
    dept: 'Vaucluse',
    deptNum: '84',
    region: "Provence-Alpes-Côte d'Azur",
    nearby: ['Courthézon', 'Camaret-sur-Aigues', 'Jonquières', 'Bédarrides', 'Sérignan-du-Comtat', 'Châteauneuf-du-Pape'],
    title: 'Freelance web à Orange — création de site internet (84)',
    description:
      "Freelance web à Orange : création de site internet sur-mesure pour commerces, domaines viticoles et PME du Haut-Vaucluse. Design, SEO, automatisation. Devis gratuit sous 24h.",
    intro: [
      "Besoin d'un <strong>freelance web à Orange</strong> pour donner à votre entreprise un site internet à la hauteur ? J'accompagne les commerçants, artisans, domaines viticoles et PME d'Orange et du Haut-Vaucluse dans la <strong>création de sites sur-mesure</strong> — vitrine, e-commerce, catalogue — du design jusqu'à la mise en ligne.",
      "Entre patrimoine antique, tourisme et vignobles des Côtes-du-Rhône, Orange a une économie locale où l'image compte. Votre site doit inspirer confiance et vous faire ressortir sur Google. Conçu sur-mesure (design <strong>UX/UI</strong>), optimisé <strong>SEO</strong> et prêt pour la <strong>visibilité sur les IA</strong>, votre site peut aussi s'accompagner d'<strong>automatisations no-code</strong> pour vous faire gagner du temps.",
    ],
    faq: [
      { q: 'Combien coûte un site internet à Orange ?', a: 'Un site vitrine démarre à 1 490€, un site e-commerce à 3 840€. Le tarif final dépend de vos besoins. Devis gratuit et détaillé sous 24h, sans engagement.' },
      { q: 'Travaillez-vous avec les domaines viticoles et producteurs locaux ?', a: 'Oui. Je crée des sites vitrines et e-commerce adaptés aux domaines, caves et producteurs (mise en avant des produits, vente en ligne, click & collect), valorisant le savoir-faire local.' },
      ...COMMON_FAQ('Orange'),
    ],
  },
  'freelance-web-carpentras': {
    slug: 'freelance-web-carpentras',
    city: 'Carpentras',
    dept: 'Vaucluse',
    deptNum: '84',
    region: "Provence-Alpes-Côte d'Azur",
    nearby: ['Monteux', 'Pernes-les-Fontaines', 'Mazan', 'Aubignan', 'Sarrians', 'Caromb'],
    title: 'Freelance web à Carpentras — création de site (84)',
    description:
      "Freelance web à Carpentras : création de site internet sur-mesure pour commerces, producteurs et PME du Comtat Venaissin. Design, SEO local, automatisation. Devis sous 24h.",
    intro: [
      "Vous cherchez un <strong>freelance web à Carpentras</strong> pour créer le site internet de votre activité ? J'accompagne les commerçants, producteurs, artisans et PME de Carpentras et du Comtat Venaissin dans la <strong>création de sites sur-mesure</strong>, pensés pour attirer et convertir.",
      "Capitale du Comtat, réputée pour son marché et son agroalimentaire, Carpentras a besoin de sites qui valorisent le savoir-faire local et ressortent sur Google. Design <strong>sur-mesure (UX/UI)</strong>, <strong>SEO</strong> local inclus, visibilité sur les moteurs IA, et possibilité d'<strong>automatiser vos processus</strong> (CRM, e-mails, facturation) grâce au no-code.",
    ],
    faq: [
      { q: 'Combien coûte un site internet à Carpentras ?', a: 'Un site vitrine démarre à 1 490€, un site e-commerce à 3 840€. Vous recevez un devis gratuit, détaillé et sans engagement sous 24h.' },
      { q: 'Intervenez-vous dans tout le Comtat Venaissin ?', a: "Oui : Carpentras, Monteux, Pernes-les-Fontaines, Mazan, Aubignan… et tout le Vaucluse, ainsi que partout en France en full remote." },
      ...COMMON_FAQ('Carpentras'),
    ],
  },
  'freelance-web-nimes': {
    slug: 'freelance-web-nimes',
    city: 'Nîmes',
    dept: 'Gard',
    deptNum: '30',
    region: 'Occitanie',
    nearby: ['Caissargues', 'Marguerittes', 'Milhaud', 'Bouillargues', 'Saint-Gilles', 'Manduel'],
    title: 'Freelance web à Nîmes — création de site internet (30)',
    description:
      "Freelance web à Nîmes (Gard) : création de site internet sur-mesure pour commerces, indépendants et PME. Design, SEO, automatisation IA. Devis gratuit sous 24h.",
    intro: [
      "À la recherche d'un <strong>freelance web à Nîmes</strong> pour votre site internet ? J'accompagne les commerces, indépendants et PME de Nîmes et du Gard dans la <strong>création de sites sur-mesure</strong> — vitrine, e-commerce, catalogue — en full remote depuis Avignon, à 30 minutes.",
      "Ville d'art, de commerce et de tertiaire en plein essor, Nîmes est un marché concurrentiel où un site rapide et bien référencé fait la différence. Chaque projet est conçu sur-mesure (design <strong>UX/UI</strong>), optimisé <strong>SEO</strong> et pour la <strong>visibilité sur les IA</strong>, avec des <strong>automatisations no-code</strong> en option pour gagner du temps.",
    ],
    faq: [
      { q: 'Combien coûte un site internet à Nîmes ?', a: 'Un site vitrine démarre à 1 490€, un site e-commerce à 3 840€. Le tarif dépend de vos besoins. Devis gratuit et détaillé sous 24h, sans engagement.' },
      { q: 'Travaillez-vous à distance avec les entreprises nîmoises ?', a: 'Oui, en full remote depuis Avignon (à 30 min) : échanges en visio, suivi en ligne, et déplacement possible sur Nîmes si nécessaire. Vous gardez un interlocuteur unique.' },
      ...COMMON_FAQ('Nîmes'),
    ],
  },
}

export const CITY_SLUGS = Object.keys(CITIES)

export function cityMetadata(c: City): Metadata {
  const url = `${SITE_URL}/${c.slug}`
  return {
    title: c.title,
    description: c.description,
    alternates: { canonical: url },
    openGraph: {
      type: 'website',
      title: c.title,
      description: c.description,
      url,
      images: [{ url: '/og-image.jpg', width: 1200, height: 630 }],
    },
  }
}
