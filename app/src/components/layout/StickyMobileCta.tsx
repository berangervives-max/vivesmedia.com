'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { track } from '@/lib/analytics'

export default function StickyMobileCta() {
  const pathname = usePathname()
  const [show, setShow] = useState(false)

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 600)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Inutile sur la page de contact (le formulaire y est déjà)
  if (pathname === '/contact') return null

  return (
    <div
      className={`sm:hidden fixed bottom-0 inset-x-0 z-40 px-4 pb-4 pt-8 pointer-events-none transition-transform duration-300 ${show ? 'translate-y-0' : 'translate-y-full'}`}
      style={{ background: 'linear-gradient(to top, rgba(255,255,255,0.96) 55%, rgba(255,255,255,0))' }}
    >
      <Link
        href="/contact"
        onClick={() => track('cta_clicked', { location: 'sticky_mobile', label: 'Devis gratuit', destination: '/contact' })}
        className="pointer-events-auto flex items-center justify-center gap-2 text-white font-semibold py-3.5 rounded-full"
        style={{ backgroundColor: '#F4521E', boxShadow: '0 8px 30px rgba(244,82,30,0.4)' }}
      >
        Devis gratuit <ArrowUpRight className="w-4 h-4" />
      </Link>
    </div>
  )
}
