import type { Metadata } from 'next'
import Script from 'next/script'
import { GoogleAnalytics } from '@next/third-parties/google'
import ConsentBanner from '@/components/ConsentBanner'
import { Inter_Tight, Instrument_Serif } from 'next/font/google'
import './globals.css'
import SmoothScroll from '@/components/layout/SmoothScroll'
import { PostHogProvider } from './providers'
import JsonLd from '@/components/seo/JsonLd'
import { SITE_SCHEMA } from '@/lib/schema'

const interTight = Inter_Tight({ subsets: ['latin'], variable: '--font-inter-tight', weight: ['400','500','600','700','800','900'] })
const instrumentSerif = Instrument_Serif({ subsets: ['latin'], variable: '--font-instrument-serif', weight: '400', style: ['normal', 'italic'] })

export const metadata: Metadata = {
  title: { default: 'vivesmedia.com — Freelance web, design & marketing', template: '%s | vivesmedia.com' },
  description: 'Freelance web, design et marketing : création de sites sur-mesure, identité visuelle et stratégie digitale, pensés pour convertir. Originaire d’Avignon · Full remote · Partout en France.',
  keywords: ['freelance web', 'création site internet', 'design', 'marketing digital', 'Avignon', 'site sur-mesure', 'SEO', 'e-commerce', 'site vitrine'],
  authors: [{ name: 'Béranger Vives', url: 'https://vivesmedia.com' }],
  creator: 'vivesmedia.com',
  publisher: 'vivesmedia.com',
  metadataBase: new URL('https://vivesmedia.com'),
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: 'https://vivesmedia.com',
    siteName: 'vivesmedia.com',
    title: 'vivesmedia.com — Freelance web, design & marketing',
    description: 'Sites sur-mesure, pensés pour convertir. Originaire d’Avignon · Full remote · Partout en France.',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'vivesmedia.com — Freelance web, design & marketing' }],
  },
  twitter: { card: 'summary_large_image', title: 'vivesmedia.com — Freelance web, design & marketing', description: 'Sites sur-mesure, pensés pour convertir. Full remote · France.', images: ['/og-image.jpg'] },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 } },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${interTight.variable} ${instrumentSerif.variable} antialiased`}>
      <head>
        {/* Google Consent Mode v2 (mode avancé) — DOIT s'exécuter AVANT gtag :
            consentement par défaut « denied » tant que l'utilisateur n'a pas choisi
            (functionality/security, nécessaires au site, restent autorisés). L'ordre
            est impératif (doc Google). Si l'utilisateur a déjà accepté, on part en granted. */}
        <Script id="google-consent-default" strategy="beforeInteractive">{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;var c=document.cookie.match(/(?:^|; )vm_consent=([^;]+)/);var g=c&&c[1]==='granted';gtag('consent','default',{ad_storage:g?'granted':'denied',ad_user_data:g?'granted':'denied',ad_personalization:g?'granted':'denied',analytics_storage:g?'granted':'denied',functionality_storage:'granted',security_storage:'granted',wait_for_update:500});`}</Script>
        {/* Ahrefs Web Analytics */}
        <script async src="https://analytics.ahrefs.com/analytics.js" data-key="9tqUA2EBj5akD55zFPOVvw" />
        <JsonLd data={SITE_SCHEMA} />
      </head>
      <body className="min-h-screen flex flex-col bg-background text-foreground">
        {/* Brevo — tracker on-site (suivi des visiteurs/contacts) */}
        <Script src="https://cdn.brevo.com/js/sdk-loader.js" strategy="lazyOnload" />
        <Script id="brevo-init" strategy="lazyOnload">{`window.Brevo=window.Brevo||[];Brevo.push(["init",{client_key:"5mf34tiyc6okfn85xnsrn2ok"}]);`}</Script>
        <PostHogProvider>
          <SmoothScroll>
            {children}
          </SmoothScroll>
        </PostHogProvider>
        {/* GA4 via l'intégration officielle Next.js (@next/third-parties) : charge gtag
            correctement et envoie réellement les hits (fin du blocage ORB). ID = flux vivesmedia.com. */}
        <GoogleAnalytics gaId="G-ME1W8NSM79" />
        <ConsentBanner />
      </body>
    </html>
  )
}
