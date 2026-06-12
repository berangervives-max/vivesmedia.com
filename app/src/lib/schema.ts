// Schema.org JSON-LD — source de vérité unique. Marque : vivesmedia.com
export const SITE_URL = 'https://vivesmedia.com'

const ORG_ID = `${SITE_URL}/#organization`
const LOCALBUSINESS_ID = `${SITE_URL}/#localbusiness`
const WEBSITE_ID = `${SITE_URL}/#website`

const SAME_AS = [
  'https://www.linkedin.com/company/110147739/',
  'https://www.instagram.com/vivesmedia/',
]

const FOUNDER = { '@type': 'Person', name: 'Béranger Vives', url: SITE_URL }

const ADDRESS = {
  '@type': 'PostalAddress',
  addressLocality: 'Avignon',
  addressRegion: "Provence-Alpes-Côte d'Azur",
  addressCountry: 'FR',
}

/** Graphe global injecté sur toutes les pages (Organization + LocalBusiness + WebSite). */
export const SITE_SCHEMA = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': ORG_ID,
      name: 'vivesmedia.com',
      url: SITE_URL,
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/icon.svg`, width: 100, height: 100 },
      image: `${SITE_URL}/og-image.jpg`,
      email: 'contact@vivesmedia.com',
      description:
        'Agence web spécialisée dans la création de sites sur-mesure, pensés pour convertir. Originaire d’Avignon, full remote, partout en France.',
      founder: FOUNDER,
      foundingDate: '2025',
      areaServed: { '@type': 'Country', name: 'France' },
      address: ADDRESS,
      sameAs: SAME_AS,
    },
    {
      '@type': 'ProfessionalService',
      '@id': LOCALBUSINESS_ID,
      name: 'vivesmedia.com',
      image: `${SITE_URL}/og-image.jpg`,
      url: SITE_URL,
      email: 'contact@vivesmedia.com',
      description:
        'Création de sites internet sur-mesure (vitrine, e-commerce, catalogue) pensés pour convertir. SEO inclus. Full remote depuis Avignon.',
      priceRange: '€€',
      areaServed: { '@type': 'Country', name: 'France' },
      address: ADDRESS,
      founder: FOUNDER,
      parentOrganization: { '@id': ORG_ID },
      sameAs: SAME_AS,
    },
    {
      '@type': 'WebSite',
      '@id': WEBSITE_ID,
      url: SITE_URL,
      name: 'vivesmedia.com',
      inLanguage: 'fr-FR',
      publisher: { '@id': ORG_ID },
    },
  ],
}

export type Crumb = { name: string; url: string }

/** BreadcrumbList — fil d'Ariane pour résultats enrichis. */
export function breadcrumbSchema(items: Crumb[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: it.url,
    })),
  }
}

/** Extrait un nombre depuis "dès 3 840€" → 3840 (ou null). */
function parsePrice(price: string): number | null {
  const digits = price.replace(/[^\d]/g, '')
  return digits ? Number(digits) : null
}

type ServiceLike = {
  slug: string
  title: string
  description: string
  price: string
  faq?: { q: string; a: string }[]
}

/** Service + Offer pour une page service. */
export function serviceSchema(service: ServiceLike) {
  const amount = parsePrice(service.price)
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: service.title,
    serviceType: service.title,
    description: service.description,
    url: `${SITE_URL}/services/${service.slug}`,
    provider: { '@id': ORG_ID },
    areaServed: { '@type': 'Country', name: 'France' },
    ...(amount
      ? {
          offers: {
            '@type': 'Offer',
            price: amount,
            priceCurrency: 'EUR',
            priceSpecification: {
              '@type': 'PriceSpecification',
              price: amount,
              priceCurrency: 'EUR',
              valueAddedTaxIncluded: false,
            },
            url: `${SITE_URL}/services/${service.slug}`,
            availability: 'https://schema.org/InStock',
          },
        }
      : {}),
  }
}

/** FAQPage à partir des Q/R d'une page. */
export function faqSchema(faq: { q: string; a: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  }
}

type RealisationLike = {
  slug: string
  name: string
  intro: string
  heroImage: string
  year: string
  tags: string[]
  type: string
  liveUrl?: string
}

/** CreativeWork pour une réalisation/projet. */
export function realisationSchema(r: RealisationLike) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: r.name,
    headline: r.name,
    abstract: r.intro,
    description: r.intro,
    url: `${SITE_URL}/realisations/${r.slug}`,
    image: r.heroImage,
    dateCreated: r.year,
    genre: r.type,
    keywords: r.tags.join(', '),
    creator: { '@id': ORG_ID },
    ...(r.liveUrl ? { sameAs: r.liveUrl } : {}),
  }
}
