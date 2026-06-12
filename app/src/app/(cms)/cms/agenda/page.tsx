'use client'
import { useEffect, useState } from 'react'
import { CalendarDays, Video, Phone, ExternalLink, Clock, CheckCircle2, CalendarPlus } from 'lucide-react'

const ORANGE = '#F4521E'

type AgendaLinks = { calendlyUrl: string; calcomUrl: string; googleAgendaUrl: string }

const DEFAULT_LINKS: AgendaLinks = {
  calendlyUrl: 'https://calendly.com/vivesmedia',
  calcomUrl: '',
  googleAgendaUrl: 'https://calendar.google.com/calendar/r/eventedit?text=Appel%20d%C3%A9couverte%20vivesmedia&description=Appel%20d%C3%A9couverte%2030%20minutes%20avec%20vivesmedia.com%20-%20Full%20remote',
}

const RDV_TYPES = [
  { icon: Phone, label: 'Appel découverte', duree: '30 min', desc: 'Premier contact prospect — comprendre le besoin, qualifier le projet.' },
  { icon: Video, label: 'Présentation maquette', duree: '45 min', desc: 'Validation du design avec le client avant développement.' },
  { icon: Video, label: 'Formation admin', duree: '1h – 2h', desc: 'Formation de livraison : le client devient autonome sur son site.' },
]

export default function AgendaPage() {
  const [links, setLinks] = useState<AgendaLinks>(DEFAULT_LINKS)

  useEffect(() => {
    try {
      const raw = localStorage.getItem('vivesmedia-cms-settings')
      if (raw) {
        const s = JSON.parse(raw)
        setLinks({
          calendlyUrl: s.calendlyUrl || DEFAULT_LINKS.calendlyUrl,
          calcomUrl: s.calcomUrl || '',
          googleAgendaUrl: s.googleAgendaUrl || DEFAULT_LINKS.googleAgendaUrl,
        })
      }
    } catch { /* défauts conservés */ }
  }, [])

  const TOOLS = [
    {
      name: 'Calendly',
      connected: Boolean(links.calendlyUrl),
      role: 'Réservation publique — tes prospects choisissent leur créneau, le RDV tombe dans ton agenda. Visio Google Meet générée automatiquement.',
      href: links.calendlyUrl,
      manage: 'https://calendly.com/app/scheduled_events/user/me',
      manageLabel: 'Mes RDV Calendly',
    },
    {
      name: 'Google Agenda + Meet',
      connected: Boolean(links.googleAgendaUrl),
      role: 'Création directe d\'un RDV avec visio Google Meet — pour caler un rendez-vous toi-même avec un client (lien identique à celui de l\'ancien site).',
      href: links.googleAgendaUrl,
      manage: 'https://calendar.google.com',
      manageLabel: 'Ouvrir mon agenda',
    },
    {
      name: 'cal.com',
      connected: Boolean(links.calcomUrl),
      role: 'Alternative open-source à Calendly. Renseigne ton lien cal.com dans Paramètres → Liens connectés pour l\'activer ici.',
      href: links.calcomUrl || 'https://app.cal.com',
      manage: 'https://app.cal.com/bookings/upcoming',
      manageLabel: 'Mes RDV cal.com',
    },
  ]

  return (
    <div className="space-y-6">

      {/* Les 3 outils de réservation */}
      <div className="grid sm:grid-cols-3 gap-4">
        {TOOLS.map(tool => (
          <div key={tool.name} className="rounded-xl p-5 flex flex-col" style={{ background: '#fff', border: '1px solid #E9ECEF' }}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-bold" style={{ color: '#111827' }}>{tool.name}</p>
              {tool.connected ? (
                <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: '#DCFCE7', color: '#16A34A' }}>
                  <CheckCircle2 className="w-2.5 h-2.5" /> Connecté
                </span>
              ) : (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: '#FEF3C7', color: '#D97706' }}>
                  À configurer
                </span>
              )}
            </div>
            <p className="text-xs leading-relaxed flex-1 mb-3" style={{ color: '#6B7280' }}>{tool.role}</p>
            <div className="flex flex-col gap-1.5">
              <a href={tool.href} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 text-xs font-semibold px-4 py-2 rounded-lg text-white transition-opacity hover:opacity-90"
                style={{ background: tool.connected ? ORANGE : '#9CA3AF' }}>
                {tool.name === 'Google Agenda + Meet' ? <><CalendarPlus className="w-3 h-3" /> Créer un RDV</> : <>Page de réservation <ExternalLink className="w-3 h-3" /></>}
              </a>
              <a href={tool.manage} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 text-xs font-medium px-4 py-2 rounded-lg transition-colors"
                style={{ border: '1px solid #E5E7EB', color: '#6B7280' }}>
                {tool.manageLabel} <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">

        {/* Calendly embarqué */}
        <div className="lg:col-span-2 rounded-xl overflow-hidden" style={{ background: '#fff', border: '1px solid #E9ECEF' }}>
          <div className="px-6 pt-5 pb-3">
            <div className="flex items-center gap-2">
              <CalendarDays className="w-4 h-4" style={{ color: ORANGE }} />
              <h2 className="font-bold text-sm" style={{ color: '#111827' }}>Ta page de réservation Calendly en direct</h2>
            </div>
            <p className="text-xs mt-1" style={{ color: '#9CA3AF' }}>Exactement ce que voient tes prospects</p>
          </div>
          <iframe
            src={`${links.calendlyUrl}?embed_type=Inline&hide_gdpr_banner=1`}
            className="w-full"
            style={{ height: 620, border: 'none' }}
            title="Calendly — réservation vivesmedia.com"
          />
        </div>

        {/* Types de RDV */}
        <div className="rounded-xl p-6" style={{ background: '#fff', border: '1px solid #E9ECEF' }}>
          <h2 className="font-bold text-sm mb-1" style={{ color: '#111827' }}>Types de RDV recommandés</h2>
          <p className="text-xs mb-4" style={{ color: '#9CA3AF' }}>À créer dans tes outils si absent</p>
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

          <div className="mt-5 pt-4" style={{ borderTop: '1px solid #F1F3F5' }}>
            <p className="text-xs leading-relaxed" style={{ color: '#9CA3AF' }}>
              💡 Les liens de ces 3 outils se modifient dans <strong>Paramètres → Liens connectés</strong>.
            </p>
          </div>
        </div>
      </div>

    </div>
  )
}
