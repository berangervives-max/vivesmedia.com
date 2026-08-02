import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // /api est bloqué au crawl (aucune URL d'API n'a vocation à finir dans Google).
      //
      // ⚠️ NE PAS AJOUTER « Disallow: /cms/ » (ni « /hub/ ») TANT QUE LA DÉSINDEXATION
      // N'EST PAS TERMINÉE. C'est un choix volontaire, pas un oubli — un audit a déjà
      // demandé cet ajout, il serait contre-productif aujourd'hui.
      // /cms et /hub renvoient déjà `X-Robots-Tag: noindex, nofollow` (next.config.ts)
      // et, depuis le 31/07/2026, un `<meta name="robots" content="noindex, nofollow">`
      // cohérent (src/app/(cms)/layout.tsx) — avant, le layout racine leur imposait au
      // contraire un « index, follow » qui contredisait l'en-tête.
      // Or un robot ne peut LIRE un noindex que s'il a le droit de CRAWLER la page.
      // Poser un Disallow maintenant empêcherait Google de voir ce noindex : les URLs
      // /cms déjà indexées y resteraient bloquées, potentiellement indéfiniment.
      //
      // CRITÈRE DE SORTIE : quand Search Console (Indexation → Pages) affiche 0 URL
      // indexée sous /cms et /hub, alors seulement ajouter le Disallow pour économiser
      // le budget de crawl.
      { userAgent: '*', allow: '/', disallow: ['/api/'] },
    ],
    sitemap: 'https://vivesmedia.com/sitemap.xml',
  }
}
