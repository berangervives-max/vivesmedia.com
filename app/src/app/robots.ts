import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // /api bloqué au crawl. /cms et /hub sont volontairement CRAWLABLES (pas
      // dans disallow) pour que Google lise leur en-tête X-Robots-Tag: noindex
      // et RETIRE les URLs déjà indexées (un disallow empêcherait de voir le noindex).
      { userAgent: '*', allow: '/', disallow: ['/api/'] },
    ],
    sitemap: 'https://vivesmedia.com/sitemap.xml',
  }
}
