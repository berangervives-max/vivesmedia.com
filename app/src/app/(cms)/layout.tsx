import type { Metadata } from 'next'

// Le layout racine (src/app/layout.tsx) déclare `robots: { index: true, follow: true }`,
// hérité par TOUTES les routes — y compris le back-office. Résultat constaté en prod
// le 31/07/2026 : /cms renvoyait `X-Robots-Tag: noindex, nofollow` dans l'en-tête HTTP
// mais `<meta name="robots" content="index, follow">` dans le HTML. Deux signaux
// contradictoires (Google retient le plus restrictif, mais c'est fragile et ça affaiblit
// la désindexation en cours).
//
// Ce layout de groupe de routes rétablit la cohérence : tout ce qui vit sous (cms)
// émet un noindex, nofollow dans le HTML, en accord avec l'en-tête HTTP.
// Il est volontairement « serveur » (aucun 'use client') car (cms)/cms/layout.tsx est
// un composant client, qui ne peut donc pas exporter de metadata.
export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false },
  },
}

export default function CmsGroupLayout({ children }: { children: React.ReactNode }) {
  return children
}
