import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact — Devis gratuit sous 24h',
  description:
    'Parlons de votre projet de site web. Devis gratuit et réponse sous 24h. Originaire d’Avignon, full remote, partout en France. contact@vivesmedia.com',
  alternates: { canonical: 'https://vivesmedia.com/contact' },
  openGraph: {
    type: 'website',
    title: 'Contact — vivesmedia.com',
    description: 'Parlons de votre projet. Devis gratuit, réponse sous 24h.',
    url: 'https://vivesmedia.com/contact',
  },
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children
}
