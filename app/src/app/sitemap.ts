import { MetadataRoute } from 'next'
import { articlesService, getPublishedRealisationsData } from '@/services/supabase.service'
import { REALISATIONS_DATA } from '@/data/realisations-data'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = 'https://vivesmedia.com'
  const now = new Date()

  const staticPages: MetadataRoute.Sitemap = [
    { url: base, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/services`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${base}/freelance-web-vaucluse`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${base}/tarifs`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${base}/realisations`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/blog`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${base}/contact`, lastModified: now, changeFrequency: 'yearly', priority: 0.7 },
    { url: `${base}/a-propos`, lastModified: now, changeFrequency: 'yearly', priority: 0.6 },
    { url: `${base}/mentions-legales`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${base}/cgv`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${base}/divulgation`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
  ]

  let articlePages: MetadataRoute.Sitemap = []
  try {
    const articles = await articlesService.getPublished(100)
    articlePages = articles.map(a => ({
      url: `${base}/blog/${a.slug}`,
      lastModified: new Date(a.updated_at),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }))
  } catch {}

  // Pages détail des réalisations (statiques + back-office)
  const realisationSlugs = new Set<string>(REALISATIONS_DATA.map(r => r.slug))
  try {
    const dbR = await getPublishedRealisationsData()
    dbR.forEach(r => realisationSlugs.add(r.slug))
  } catch {}
  const realisationPages: MetadataRoute.Sitemap = Array.from(realisationSlugs).map(slug => ({
    url: `${base}/realisations/${slug}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  return [...staticPages, ...articlePages, ...realisationPages]
}
