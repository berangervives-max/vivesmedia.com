'use client'
import Link from 'next/link'
import { useState } from 'react'
import { ArrowUpRight, Calendar } from 'lucide-react'
import { track } from '@/lib/analytics'

const NAV = [
  { label: 'Accueil', href: '/' },
  { label: 'À propos', href: '/a-propos' },
  { label: 'Tarifs', href: '/tarifs' },
  { label: 'Réalisations', href: '/realisations' },
  { label: 'Blog', href: '/blog' },
]

export default function Footer() {
  const [email, setEmail] = useState('')
  const [website, setWebsite] = useState('') // honeypot anti-bot
  const [subscribed, setSubscribed] = useState(false)

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await fetch('/api/newsletter', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, website }) })
      track('newsletter_subscribed', { location: 'footer' })
      setSubscribed(true)
    } catch {
      setSubscribed(true)
    }
  }

  return (
    <footer className="border-t border-border bg-white">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">
          <div className="lg:max-w-xs">
            <Link href="/" className="inline-block mb-4">
              <span className="font-bold text-xl text-foreground tracking-tight">vivesmedia<span style={{ color: '#F4521E' }}>.com</span></span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed mb-6">Sites sur-mesure, pensés pour convertir. Originaire d'Avignon · Full remote · Partout en France</p>
            <div className="mb-6">
              <p className="text-xs font-semibold text-foreground uppercase tracking-wider mb-3">Newsletter mensuelle</p>
              {subscribed ? (
                <p className="text-xs text-green-600 font-medium">✓ Inscription confirmée !</p>
              ) : (
                <form onSubmit={handleSubscribe} className="flex gap-2">
                  <input type="text" name="website" value={website} onChange={e => setWebsite(e.target.value)} tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute left-[-9999px] w-px h-px opacity-0" />
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="votre@email.com" className="flex-1 border border-border rounded-full px-4 py-2 text-xs focus:outline-none focus:border-foreground/30 min-w-0" />
                  <button type="submit" className="bg-foreground text-white text-xs px-4 py-2 rounded-full hover:bg-foreground/90 transition-colors flex-shrink-0">OK</button>
                </form>
              )}
            </div>
            <div className="flex gap-3">
              <a href="https://www.linkedin.com/company/110147739/" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors" aria-label="LinkedIn">
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              </a>
              <a href="https://www.instagram.com/vivesmedia/" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors" aria-label="Instagram">
                <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
              </a>
            </div>
          </div>

          <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-10">
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wider">Navigation</h4>
              <ul className="space-y-3">
                {NAV.map((link) => (
                  <li key={link.label}><Link href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">{link.label}</Link></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wider">Services</h4>
              <ul className="space-y-3">
                {['Site Vitrine', 'Site E-Commerce', 'Référencement SEO', 'CRM & IA', 'Maintenance'].map((s) => (
                  <li key={s}><Link href="/services" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{s}</Link></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wider">Contact</h4>
              <ul className="space-y-3">
                <li className="text-sm text-muted-foreground">Full remote · France</li>
                <li><a href="mailto:contact@vivesmedia.com" className="text-sm text-muted-foreground hover:text-foreground transition-colors">contact@vivesmedia.com</a></li>
              </ul>
              <div className="mt-5 space-y-2">
                <a href="https://calendar.google.com/calendar/r/eventedit?text=Appel+découverte+vivesmedia" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-foreground text-white text-xs font-semibold px-5 py-2.5 rounded-full hover:bg-foreground/90 transition-colors">
                  <Calendar className="w-3 h-3" /> Google Agenda <ArrowUpRight className="w-3 h-3" />
                </a>
                <Link href="/contact" className="flex items-center gap-2 text-white text-xs font-semibold px-5 py-2.5 rounded-full hover:opacity-90 transition-colors" style={{ backgroundColor: '#F4521E' }}>
                  Devis gratuit <ArrowUpRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground">©{new Date().getFullYear()} vivesmedia.com — Tous droits réservés. Full remote · France.</p>
          <div className="flex gap-6">
            <Link href="/mentions-legales" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Mentions légales</Link>
            <Link href="/cgv" className="text-xs text-muted-foreground hover:text-foreground transition-colors">CGV</Link>
            <Link href="/divulgation" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Divulgation d&apos;affiliation</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
