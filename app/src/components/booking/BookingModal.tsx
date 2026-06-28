'use client'
import { useEffect, useState } from 'react'
import { X, ExternalLink, CalendarClock } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { CalendlyLogo, CalcomLogo } from '@/components/BrandLogos'
import { BOOKING, BOOKING_EVENT, CALCOM_LIVE } from '@/lib/booking'
import { track } from '@/lib/analytics'

type Provider = {
  id: string
  name: string
  Logo: typeof CalendlyLogo
  color: string
  src: string
  open: string
}

const PROVIDERS: Provider[] = [
  {
    id: 'calendly',
    name: 'Calendly',
    Logo: CalendlyLogo,
    color: '#006BFF',
    src: `${BOOKING.calendly}?hide_gdpr_banner=1&embed_type=Inline&primary_color=f4521e`,
    open: BOOKING.calendly,
  },
  {
    id: 'calcom',
    name: 'Cal.com',
    Logo: CalcomLogo,
    color: '#111827',
    src: `${BOOKING.calcom}?embed=true&theme=light`,
    open: BOOKING.calcom,
  },
]

export default function BookingModal() {
  const [open, setOpen] = useState(false)
  const [activeId, setActiveId] = useState('calendly')

  useEffect(() => {
    const onOpen = () => setOpen(true)
    window.addEventListener(BOOKING_EVENT, onOpen)
    return () => window.removeEventListener(BOOKING_EVENT, onOpen)
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    if (open) {
      document.addEventListener('keydown', onKey)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open])

  const active = PROVIDERS.find(p => p.id === activeId) ?? PROVIDERS[0]

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5"
          onClick={() => setOpen(false)}
        >
          <div className="absolute inset-0 bg-black/55 backdrop-blur-sm" />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97, y: 8 }}
            transition={{ type: 'spring', damping: 26, stiffness: 280 }}
            className="relative w-full max-w-2xl bg-white rounded-2xl overflow-hidden shadow-2xl flex flex-col"
            style={{ maxHeight: '90vh' }}
            onClick={e => e.stopPropagation()}
          >
            {/* En-tête */}
            <div className="flex items-start justify-between gap-4 px-5 sm:px-6 pt-5 pb-4 border-b" style={{ borderColor: '#F1F3F5' }}>
              <div className="flex items-center gap-3">
                <span className="flex items-center justify-center w-10 h-10 rounded-full shrink-0" style={{ background: 'rgba(244,82,30,0.1)' }}>
                  <CalendarClock className="w-5 h-5" style={{ color: '#F4521E' }} />
                </span>
                <div>
                  <h2 className="font-bold text-base leading-tight" style={{ color: '#111827' }}>Réserve ton appel découverte</h2>
                  <p className="text-xs mt-0.5" style={{ color: '#9CA3AF' }}>30 min · offert · sans engagement — choisis ton outil</p>
                </div>
              </div>
              <button onClick={() => setOpen(false)} aria-label="Fermer" className="p-1.5 rounded-lg transition-colors hover:bg-black/5 shrink-0">
                <X className="w-5 h-5" style={{ color: '#6B7280' }} />
              </button>
            </div>

            {/* Onglets de marque */}
            <div className="flex gap-2 px-5 sm:px-6 pt-4">
              {PROVIDERS.map(p => {
                const isActive = p.id === activeId
                return (
                  <button
                    key={p.id}
                    onClick={() => { setActiveId(p.id); track('booking_provider_selected', { provider: p.id }) }}
                    className="flex-1 flex items-center justify-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-xl border transition-all"
                    style={isActive
                      ? { background: p.color, color: '#fff', borderColor: p.color }
                      : { background: '#fff', color: '#111827', borderColor: '#E9ECEF' }}
                  >
                    <p.Logo size={20} className="shrink-0" />
                    {p.name}
                  </button>
                )
              })}
            </div>

            {/* Planning live embarqué (ou panneau d'activation pour Cal.com tant qu'il n'est pas publié) */}
            <div className="flex-1 overflow-hidden px-5 sm:px-6 py-4">
              <div className="w-full h-full rounded-xl overflow-hidden flex items-center justify-center" style={{ border: '1px solid #F1F3F5', minHeight: 480 }}>
                {active.id === 'calcom' && !CALCOM_LIVE ? (
                  <div className="text-center px-8 py-12 max-w-sm">
                    <span className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4" style={{ background: '#0E0E10' }}>
                      <active.Logo size={30} />
                    </span>
                    <p className="font-bold text-base mb-2" style={{ color: '#111827' }}>Réservation Cal.com en cours d'activation</p>
                    <p className="text-sm leading-relaxed mb-5" style={{ color: '#6B7280' }}>
                      Notre page Cal.com sera disponible très bientôt. En attendant, réserve ton créneau via <strong>Calendly</strong> — c'est exactement le même appel découverte de 30 min.
                    </p>
                    <button type="button" onClick={() => { setActiveId('calendly'); track('booking_provider_selected', { provider: 'calendly' }) }}
                      className="inline-flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-xl text-white" style={{ background: '#006BFF' }}>
                      <CalendlyLogo size={18} /> Réserver via Calendly
                    </button>
                  </div>
                ) : (
                  <iframe
                    key={active.id}
                    src={active.src}
                    title={`Réservation ${active.name}`}
                    className="w-full h-full"
                    style={{ height: '60vh', minHeight: 480, border: 'none' }}
                  />
                )}
              </div>
            </div>

            {/* Repli : ouvrir dans un onglet (si l'embed est bloqué côté outil) */}
            {(active.id !== 'calcom' || CALCOM_LIVE) && (
              <div className="px-5 sm:px-6 pb-4 -mt-1">
                <a
                  href={active.open} target="_blank" rel="noopener noreferrer"
                  onClick={() => track('cta_clicked', { location: 'booking_modal', label: `Ouvrir ${active.name}`, destination: active.open })}
                  className="flex items-center justify-center gap-1.5 text-xs font-medium"
                  style={{ color: active.color }}
                >
                  Le planning ne s'affiche pas ? Ouvrir {active.name} dans un nouvel onglet <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
