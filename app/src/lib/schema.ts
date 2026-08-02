// Schema.org JSON-LD — source de vérité unique. Marque : vivesmedia.com
export const SITE_URL = 'https://vivesmedia.com'

export const ORG_ID = `${SITE_URL}/#organization`
export const LOCALBUSINESS_ID = `${SITE_URL}/#localbusiness`
export const PERSON_NODE_ID = `${SITE_URL}/#beranger`
const WEBSITE_ID = `${SITE_URL}/#website`

const SAME_AS = [
  'https://www.linkedin.com/company/110147739/',
  'https://www.instagram.com/vivesmedia/',
]

const PERSON_ID = `${SITE_URL}/#beranger`
// Référence vers le node Person du graphe (E-E-A-T), défini une seule fois.
const FOUNDER = { '@id': PERSON_ID }

// Coordonnées d'Avignon (SEO local / pack Maps).
const GEO = { '@type': 'GeoCoordinates', latitude: 43.9493, longitude: 4.8055 }

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
      '@type': 'Person',
      '@id': PERSON_ID,
      name: 'Béranger Vives',
      url: `${SITE_URL}/a-propos`,
      jobTitle: 'Freelance web, design & marketing',
      worksFor: { '@id': ORG_ID },
      knowsAbout: ['Création de sites web', 'SEO', 'Design', 'Marketing digital', 'E-commerce'],
      sameAs: SAME_AS,
    },
    {
      '@type': 'Organization',
      '@id': ORG_ID,
      name: 'vivesmedia.com',
      legalName: 'Béranger Vives',
      alternateName: 'VIVES & Co',
      url: SITE_URL,
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/icon.svg`, width: 100, height: 100 },
      image: `${SITE_URL}/og-image.jpg`,
      email: 'contact@vivesmedia.com',
      description:
        'Freelance web, design et marketing, spécialisé dans la création de sites sur-mesure pensés pour convertir. Originaire d’Avignon, full remote, partout en France.',
      founder: FOUNDER,
      foundingDate: '2025-12-14',
      identifier: { '@type': 'PropertyValue', propertyID: 'SIREN', value: '935306522' },
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
      geo: GEO,
      areaServed: [
        { '@type': 'Country', name: 'France' },
        { '@type': 'City', name: 'Avignon' },
        { '@type': 'City', name: 'Carpentras' },
        { '@type': 'City', name: 'Orange' },
        { '@type': 'City', name: 'Nîmes' },
        { '@type': 'AdministrativeArea', name: 'Vaucluse' },
      ],
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

/* ────────────────────────────────────────────────────────────────────────────
   ARTICLES DE BLOG
   Le contenu des articles est du HTML stocké en base (table Supabase `articles`,
   colonne `contenu`), pas du Markdown. Les rédactions suivent toutes la même
   structure : un <h2> dont le titre commence par « FAQ », puis des paires
   <h3>question</h3><p>réponse</p>, jusqu'au <h2> suivant.
   ──────────────────────────────────────────────────────────────────────────── */

const ENTITIES: Record<string, string> = {
  '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&apos;': "'",
  '&nbsp;': ' ', '&eacute;': 'é', '&egrave;': 'è', '&agrave;': 'à',
  '&ccedil;': 'ç', '&ecirc;': 'ê', '&mdash;': '—', '&ndash;': '–',
  '&hellip;': '…', '&laquo;': '«', '&raquo;': '»', '&euro;': '€',
}

/** HTML → texte brut lisible (balises retirées, entités décodées, espaces normalisés). */
function htmlToText(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&#(\d+);/g, (_, d) => String.fromCharCode(Number(d)))
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCharCode(parseInt(h, 16)))
    .replace(/&[a-z]+;/gi, (e) => ENTITIES[e.toLowerCase()] ?? e)
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Extrait les questions/réponses de la section FAQ d'un article.
 * Retourne [] si l'article n'a pas de section FAQ — dans ce cas, aucun FAQPage
 * n'est émis (on ne balise JAMAIS une FAQ qui n'est pas visible sur la page :
 * c'est une violation des règles Google sur les données structurées).
 */
export function faqFromArticleHtml(html?: string | null): { q: string; a: string }[] {
  if (!html) return []

  // 1) Localiser le <h2> de FAQ (accepte « FAQ », « F.A.Q. », « Questions fréquentes »).
  const h2s = [...html.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/gi)]
  const faqH2 = h2s.find((m) => /^\s*(f\.?a\.?q\.?|questions?\s+fr[ée]quentes?)/i.test(htmlToText(m[1])))
  if (!faqH2) return []

  // 2) Isoler le bloc entre ce <h2> et le <h2> suivant (ou la fin du contenu).
  const start = (faqH2.index ?? 0) + faqH2[0].length
  const nextH2 = html.slice(start).search(/<h2[^>]*>/i)
  const block = nextH2 === -1 ? html.slice(start) : html.slice(start, start + nextH2)

  // 3) Paires <h3>question</h3> … <p>réponse</p> (plusieurs <p> = réponse concaténée).
  const out: { q: string; a: string }[] = []
  const parts = block.split(/<h3[^>]*>/i).slice(1)
  for (const part of parts) {
    const endQ = part.search(/<\/h3>/i)
    if (endQ === -1) continue
    const q = htmlToText(part.slice(0, endQ))
    const answerHtml = part.slice(endQ)
    const paragraphs = [...answerHtml.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)].map((m) => htmlToText(m[1]))
    const a = paragraphs.filter(Boolean).join(' ')
    if (q && a) out.push({ q, a })
  }
  return out
}

type ArticleLike = {
  slug: string
  titre: string
  extrait?: string | null
  contenu?: string | null
  categorie?: string | null
  image_url?: string | null
  date_pub?: string | null
  updated_at?: string | null
}

/**
 * BlogPosting complet pour un article.
 * - `dateModified` utilise la vraie date de dernière modification (`updated_at`)
 *   quand elle existe, au lieu de recopier `datePublished`.
 * - `author` et `publisher` pointent vers les nodes @id du graphe global
 *   (Person + Organization) au lieu de redéclarer des entités isolées : c'est ce
 *   qui relie l'article à l'E-E-A-T de la marque.
 */
export function articleSchema(a: ArticleLike) {
  const url = `${SITE_URL}/blog/${a.slug}`
  const modified = a.updated_at || a.date_pub || undefined
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: a.titre,
    ...(a.extrait ? { description: a.extrait } : {}),
    ...(a.image_url ? { image: a.image_url } : {}),
    ...(a.date_pub ? { datePublished: a.date_pub } : {}),
    ...(modified ? { dateModified: modified } : {}),
    url,
    ...(a.categorie ? { articleSection: a.categorie } : {}),
    inLanguage: 'fr-FR',
    author: { '@id': PERSON_NODE_ID },
    publisher: { '@id': ORG_ID },
    isPartOf: { '@id': WEBSITE_ID },
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
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
