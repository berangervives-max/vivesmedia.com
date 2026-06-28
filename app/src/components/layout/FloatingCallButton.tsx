'use client'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { CalendarClock } from 'lucide-react'
import { track } from '@/lib/analytics'

const CALENDLY_URL = 'https://calendly.com/vivesmedia'

// Bouton flottant desktop : contact toujours à portée de clic (pattern des meilleures agences).
// sm+ uniquement (le StickyMobileCta couvre le mobile), masqué sur la page contact.
export default function FloatingCallButton() {
  const pathname = usePathname()
  const [show, setShow] = useState(false)

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 600)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  if (pathname === '/contact') return null

  return (
    <a
      href={CALENDLY_URL}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => track('cta_clicked', { location: 'floating_desktop', label: 'Réserver un appel', destination: CALENDLY_URL })}
      aria-label="Réserver un appel de 30 minutes"
      className={`hidden sm:flex fixed bottom-6 right-6 z-40 items-center gap-2 text-white font-semibold pl-4 pr-5 py-3 rounded-full transition-all duration-300 hover:scale-105 ${show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}
      style={{ backgroundColor: '#F4521E', boxShadow: '0 10px 34px rgba(244,82,30,0.45)' }}
    >
      <CalendarClock className="w-4 h-4" />
      Réserver un appel
    </a>
  )
}
