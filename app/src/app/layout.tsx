import type { Metadata } from 'next'
import { Inter_Tight, Instrument_Serif } from 'next/font/google'
import './globals.css'
import SmoothScroll from '@/components/layout/SmoothScroll'
import { PostHogProvider } from './providers'
import JsonLd from '@/components/seo/JsonLd'
import { SITE_SCHEMA } from '@/lib/schema'

const interTight = Inter_Tight({ subsets: ['latin'], variable: '--font-inter-tight', weight: ['400','500','600','700','800','900'] })
const instrumentSerif = Instrument_Serif({ subsets: ['latin'], variable: '--font-instrument-serif', weight: '400', style: ['normal', 'italic'] })

export const metadata: Metadata = {
  title: { default: 'vivesmedia.com — Agence web sur-mesure', template: '%s | vivesmedia.com' },
  description: 'Agence web spécialisée dans la création de sites sur-mesure, pensés pour convertir. Originaire d’Avignon · Full remote · Partout en France.',
  keywords: ['agence web', 'création site internet', 'Avignon', 'site sur-mesure', 'SEO', 'e-commerce', 'site vitrine'],
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
    title: 'vivesmedia.com — Agence web sur-mesure',
    description: 'Sites sur-mesure, pensés pour convertir. Originaire d’Avignon · Full remote · Partout en France.',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'vivesmedia.com — Agence web sur-mesure' }],
  },
  twitter: { card: 'summary_large_image', title: 'vivesmedia.com — Agence web sur-mesure', description: 'Sites sur-mesure, pensés pour convertir. Full remote · France.', images: ['/og-image.jpg'] },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 } },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${interTight.variable} ${instrumentSerif.variable} antialiased`}>
      <head>
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-516900135" />
        <script dangerouslySetInnerHTML={{ __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','G-516900135');` }} />
        {/* Ahrefs Web Analytics */}
        <script async src="https://analytics.ahrefs.com/analytics.js" data-key="9tqUA2EBj5akD55zFPOVvw" />
        <JsonLd data={SITE_SCHEMA} />
      </head>
      <body className="min-h-screen flex flex-col bg-background text-foreground">
        <PostHogProvider>
          <SmoothScroll>
            {children}
          </SmoothScroll>
        </PostHogProvider>
      </body>
    </html>
  )
}
