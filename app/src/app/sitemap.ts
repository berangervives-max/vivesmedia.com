import { MetadataRoute } from 'next'
import { articlesService } from '@/services/supabase.service'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = 'https://vivesmedia.com'
  const now = new Date()

  const staticPages: MetadataRoute.Sitemap = [
    { url: base, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/services`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${base}/agence-web-vaucluse`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${base}/tarifs`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${base}/realisations`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/blog`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${base}/contact`, lastModified: now, changeFrequency: 'yearly', priority: 0.7 },
    { url: `${base}/a-propos`, lastModified: now, changeFrequency: 'yearly', priority: 0.6 },
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

  return [...staticPages, ...articlePages]
}
