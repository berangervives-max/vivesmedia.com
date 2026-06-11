import type { Metadata } from 'next'
import { Inter_Tight, Instrument_Serif } from 'next/font/google'
import './globals.css'
import SmoothScroll from '@/components/layout/SmoothScroll'
import { PostHogProvider } from './providers'

const interTight = Inter_Tight({ subsets: ['latin'], variable: '--font-inter-tight', weight: ['400','500','600','700','800','900'] })
const instrumentSerif = Instrument_Serif({ subsets: ['latin'], variable: '--font-instrument-serif', weight: '400', style: ['normal', 'italic'] })

export const metadata: Metadata = {
  title: { default: 'VivesMedia — Agence Web Sur-Mesure', template: '%s | VivesMedia' },
  description: 'Agence web spécialisée dans la création de sites sur-mesure, pensés pour convertir. Full remote · France.',
  keywords: ['agence web', 'création site internet', 'Avignon', 'site sur-mesure', 'SEO', 'e-commerce'],
  authors: [{ name: 'Béranger Vives', url: 'https://vivesmedia.com' }],
  creator: 'VivesMedia',
  metadataBase: new URL('https://vivesmedia.com'),
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: 'https://vivesmedia.com',
    siteName: 'VivesMedia',
    title: 'VivesMedia — Agence Web Sur-Mesure',
    description: 'Sites sur-mesure, pensés pour convertir. Full remote · France.',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'VivesMedia' }],
  },
  twitter: { card: 'summary_large_image', title: 'VivesMedia', description: 'Agence web sur-mesure' },
  robots: { index: true, follow: true },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${interTight.variable} ${instrumentSerif.variable} antialiased`}>
      <head>
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-516900135" />
        <script dangerouslySetInnerHTML={{ __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','G-516900135');` }} />
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
