'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { ArrowUpRight, Menu, X, CalendarClock } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { openBooking } from '@/lib/booking'

const NAV_LINKS = [
  { label: 'Accueil', href: '/' },
  { label: 'À propos', href: '/a-propos' },
  { label: 'Services', href: '/services' },
  { label: 'Réalisations', href: '/realisations' },
  { label: 'Blog', href: '/blog' },
]

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()

  return (
    <>
      <nav className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-7xl">
        <div className="bg-white/85 backdrop-blur-xl border border-black/8 rounded-2xl shadow-sm px-5 py-3 flex items-center justify-between">
          <Link href="/" aria-label="Accueil vivesmedia.com" onClick={(e) => { if (pathname === '/') { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }) } }} className="flex-shrink-0">
            <span className="font-bold text-xl text-foreground tracking-tight">vivesmedia<span style={{ color: '#F4521E' }}>.com</span></span>
          </Link>
          <ul className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <li key={link.label}>
                <Link href={link.href} onClick={(e) => { if (pathname === link.href) { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }) } }} className={`px-4 py-2 text-sm transition-colors rounded-lg ${pathname === link.href ? 'text-foreground font-medium bg-black/6' : 'text-foreground/60 hover:text-foreground hover:bg-black/5'}`}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileOpen(true)} aria-label="Ouvrir le menu" className="lg:hidden p-2 text-foreground/60 hover:text-foreground">
              <Menu className="w-5 h-5" />
            </button>
            <button type="button" onClick={openBooking} className="hidden lg:flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-full border transition-colors hover:bg-foreground/5" style={{ borderColor: 'rgba(17,24,39,0.15)', color: '#111827' }}>
              <CalendarClock className="w-3.5 h-3.5" style={{ color: '#F4521E' }} /> Réserver un appel
            </button>
            <Link href="/contact" className="hidden sm:flex items-center gap-2 text-white text-sm font-semibold px-5 py-2.5 rounded-full hover:opacity-90 transition-colors" style={{ backgroundColor: '#F4521E' }}>
              Devis Gratuit <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] bg-black/30 backdrop-blur-sm lg:hidden" onClick={() => setMobileOpen(false)}>
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="absolute right-0 top-0 h-full w-80 bg-white border-l border-border p-8" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-10">
                <span className="font-bold text-lg text-foreground">vivesmedia<span style={{ color: '#F4521E' }}>.com</span></span>
                <button onClick={() => setMobileOpen(false)} aria-label="Fermer le menu" className="text-foreground/60 hover:text-foreground"><X className="w-5 h-5" /></button>
              </div>
              <ul className="space-y-1">
                {NAV_LINKS.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} onClick={() => { setMobileOpen(false); if (pathname === link.href) window.scrollTo({ top: 0, behavior: 'smooth' }) }} className={`block py-3 text-xl font-medium transition-colors ${pathname === link.href ? 'text-foreground' : 'text-foreground/60 hover:text-foreground'}`}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
              <Link href="/contact" onClick={() => setMobileOpen(false)} className="mt-10 flex items-center justify-center gap-2 bg-foreground text-white font-semibold px-6 py-3 rounded-full w-full">
                Devis Gratuit <ArrowUpRight className="w-4 h-4" />
              </Link>
              <button type="button" onClick={() => { setMobileOpen(false); openBooking() }} className="mt-3 flex items-center justify-center gap-2 font-semibold px-6 py-3 rounded-full w-full border" style={{ borderColor: 'rgba(17,24,39,0.15)', color: '#111827' }}>
                <CalendarClock className="w-4 h-4" style={{ color: '#F4521E' }} /> Réserver un appel
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
