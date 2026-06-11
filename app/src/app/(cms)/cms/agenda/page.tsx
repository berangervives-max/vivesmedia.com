'use client'
import { CalendarDays, Video, Phone, ExternalLink, Clock, CheckCircle2 } from 'lucide-react'

const ORANGE = '#F4521E'
const CALENDLY_URL = 'https://calendly.com/vivesmedia'

const RDV_TYPES = [
  { icon: Phone, label: 'Appel découverte', duree: '30 min', desc: 'Premier contact prospect — comprendre le besoin, qualifier le projet.' },
  { icon: Video, label: 'Présentation maquette', duree: '45 min', desc: 'Validation du design avec le client avant développement.' },
  { icon: Video, label: 'Formation admin', duree: '1h – 2h', desc: 'Formation de livraison : le client devient autonome sur son site.' },
]

export default function AgendaPage() {
  return (
    <div className="space-y-6">

      {/* Statut connecté */}
      <div className="rounded-xl p-5 flex flex-col sm:flex-row sm:items-center gap-4"
        style={{ background: '#F0FDF4', border: '1px solid #BBF7D0' }}>
        <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: '#DCFCE7', color: '#16A34A' }}>
          <CheckCircle2 className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold" style={{ color: '#166534' }}>Calendly connecté — calendly.com/vivesmedia</p>
          <p className="text-xs mt-0.5" style={{ color: '#15803D' }}>
            Tes prospects peuvent réserver directement. Les RDV arrivent dans ton Google Agenda synchronisé à Calendly.
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <a href={CALENDLY_URL} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 text-xs font-semibold px-4 py-2.5 rounded-lg text-white transition-opacity hover:opacity-90"
            style={{ background: ORANGE }}>
            Page de réservation <ExternalLink className="w-3 h-3" />
          </a>
          <a href="https://calendly.com/app/scheduled_events/user/me" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 text-xs font-semibold px-4 py-2.5 rounded-lg transition-colors"
            style={{ border: '1px solid #BBF7D0', color: '#166534' }}>
            Mes RDV Calendly <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">

        {/* Calendly embarqué */}
        <div className="lg:col-span-2 rounded-xl overflow-hidden" style={{ background: '#fff', border: '1px solid #E9ECEF' }}>
          <div className="px-6 pt-5 pb-3">
            <div className="flex items-center gap-2">
              <CalendarDays className="w-4 h-4" style={{ color: ORANGE }} />
              <h2 className="font-bold text-sm" style={{ color: '#111827' }}>Ta page de réservation en direct</h2>
            </div>
            <p className="text-xs mt-1" style={{ color: '#9CA3AF' }}>Exactement ce que voient tes prospects</p>
          </div>
          <iframe
            src={`${CALENDLY_URL}?embed_domain=app-indol-kappa-58.vercel.app&embed_type=Inline&hide_gdpr_banner=1`}
            className="w-full"
            style={{ height: 620, border: 'none' }}
            title="Calendly — réservation vivesmedia.com"
          />
        </div>

        {/* Types de RDV */}
        <div className="rounded-xl p-6" style={{ background: '#fff', border: '1px solid #E9ECEF' }}>
          <h2 className="font-bold text-sm mb-1" style={{ color: '#111827' }}>Types de RDV recommandés</h2>
          <p className="text-xs mb-4" style={{ color: '#9CA3AF' }}>À créer dans Calendly si absent</p>
          <div className="space-y-3">
            {RDV_TYPES.map(t => (
              <div key={t.label} className="p-3.5 rounded-lg" style={{ background: '#F8F9FA', border: '1px solid #F1F3F5' }}>
                <div className="flex items-center gap-2 mb-1">
                  <t.icon className="w-3.5 h-3.5" style={{ color: ORANGE }} />
                  <p className="text-sm font-semibold flex-1" style={{ color: '#111827' }}>{t.label}</p>
                  <span className="flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full" style={{ background: '#fff', color: '#6B7280', border: '1px solid #E9ECEF' }}>
                    <Clock className="w-2.5 h-2.5" /> {t.duree}
                  </span>
                </div>
                <p className="text-xs leading-relaxed" style={{ color: '#9CA3AF' }}>{t.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-5 pt-4 space-y-2" style={{ borderTop: '1px solid #F1F3F5' }}>
            <p className="text-xs font-semibold" style={{ color: '#374151' }}>Raccourcis</p>
            <a href="https://calendly.com/app/availability/schedules" target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-between text-xs p-2.5 rounded-lg transition-colors hover:bg-gray-50"
              style={{ color: '#6B7280', border: '1px solid #F1F3F5' }}>
              Gérer mes disponibilités <ExternalLink className="w-3 h-3" />
            </a>
            <a href="https://calendar.google.com" target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-between text-xs p-2.5 rounded-lg transition-colors hover:bg-gray-50"
              style={{ color: '#6B7280', border: '1px solid #F1F3F5' }}>
              Google Agenda <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>

    </div>
  )
}
