'use client'
import { CalendarDays, Video, Phone, ExternalLink, Plug, Clock } from 'lucide-react'

const ORANGE = '#F4521E'

const RDV_TYPES = [
  { icon: Phone, label: 'Appel découverte', duree: '30 min', desc: 'Premier contact prospect — comprendre le besoin, qualifier le projet.' },
  { icon: Video, label: 'Présentation maquette', duree: '45 min', desc: 'Validation du design avec le client avant développement.' },
  { icon: Video, label: 'Formation admin', duree: '1h – 2h', desc: 'Formation de livraison : le client devient autonome sur son site.' },
]

const CONNECT_OPTIONS = [
  {
    name: 'Calendly',
    reco: true,
    desc: 'Page de réservation publique : le prospect choisit son créneau, le RDV arrive dans ton Google Calendar. Zéro aller-retour email.',
    steps: ['Créer un compte gratuit sur calendly.com', 'Créer un événement "Appel découverte — 30 min"', 'Donner le lien à Claude Code → intégration sur /contact + cette page'],
  },
  {
    name: 'Google Calendar (booking natif)',
    reco: false,
    desc: "L'ancien site Base44 utilisait l'API Google Calendar en direct. Portable ici, mais plus de code à maintenir qu'un simple embed Calendly.",
    steps: ['Activer l\'API Google Calendar', 'Configurer OAuth', 'Porter la fonction googleCalendarBooking'],
  },
]

export default function AgendaPage() {
  return (
    <div className="space-y-6">

      {/* Bandeau connexion */}
      <div className="rounded-xl p-5 flex flex-col sm:flex-row sm:items-center gap-4"
        style={{ background: 'rgba(244,82,30,.06)', border: '1px solid rgba(244,82,30,.2)' }}>
        <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'rgba(244,82,30,.12)', color: ORANGE }}>
          <Plug className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold" style={{ color: '#111827' }}>Prise de RDV non connectée</p>
          <p className="text-xs mt-0.5" style={{ color: '#6B7280' }}>
            Choisis une option ci-dessous — l'agenda s'affichera ici et le bouton "Réserver un appel" du site deviendra une vraie réservation en ligne.
          </p>
        </div>
        <a href="https://calendly.com" target="_blank" rel="noopener noreferrer"
          className="shrink-0 flex items-center gap-2 text-xs font-semibold px-4 py-2.5 rounded-lg text-white transition-opacity hover:opacity-90"
          style={{ background: ORANGE }}>
          Créer mon Calendly <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">

        {/* Agenda placeholder */}
        <div className="lg:col-span-2 rounded-xl p-6" style={{ background: '#fff', border: '1px solid #E9ECEF' }}>
          <div className="flex items-center gap-2 mb-1">
            <CalendarDays className="w-4 h-4" style={{ color: ORANGE }} />
            <h2 className="font-bold text-sm" style={{ color: '#111827' }}>Prochains rendez-vous</h2>
          </div>
          <p className="text-xs mb-5" style={{ color: '#9CA3AF' }}>Synchronisé avec ton agenda une fois connecté</p>
          <div className="h-72 rounded-lg flex flex-col items-center justify-center gap-3"
            style={{ background: '#F8F9FA', border: '1px dashed #E5E7EB' }}>
            <CalendarDays className="w-8 h-8" style={{ color: '#D1D5DB' }} />
            <div className="text-center">
              <p className="text-sm font-medium" style={{ color: '#6B7280' }}>Aucun agenda connecté</p>
              <p className="text-xs mt-1" style={{ color: '#9CA3AF' }}>Les RDV réservés par tes prospects apparaîtront ici</p>
            </div>
          </div>
        </div>

        {/* Types de RDV */}
        <div className="rounded-xl p-6" style={{ background: '#fff', border: '1px solid #E9ECEF' }}>
          <h2 className="font-bold text-sm mb-1" style={{ color: '#111827' }}>Types de RDV à créer</h2>
          <p className="text-xs mb-4" style={{ color: '#9CA3AF' }}>Recommandés pour ton activité</p>
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
        </div>
      </div>

      {/* Options de connexion */}
      <div className="grid sm:grid-cols-2 gap-6">
        {CONNECT_OPTIONS.map(opt => (
          <div key={opt.name} className="rounded-xl p-6 relative" style={{ background: '#fff', border: opt.reco ? `1px solid ${ORANGE}` : '1px solid #E9ECEF' }}>
            {opt.reco && (
              <span className="absolute -top-2.5 left-5 text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full text-white" style={{ background: ORANGE }}>
                Recommandé
              </span>
            )}
            <h3 className="font-bold text-sm mb-2" style={{ color: '#111827' }}>{opt.name}</h3>
            <p className="text-xs leading-relaxed mb-4" style={{ color: '#6B7280' }}>{opt.desc}</p>
            <ol className="space-y-2">
              {opt.steps.map((s, i) => (
                <li key={s} className="flex items-start gap-2.5">
                  <span className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 mt-0.5"
                    style={{ background: opt.reco ? 'rgba(244,82,30,.1)' : '#F1F3F5', color: opt.reco ? ORANGE : '#9CA3AF' }}>
                    {i + 1}
                  </span>
                  <span className="text-xs" style={{ color: '#374151' }}>{s}</span>
                </li>
              ))}
            </ol>
          </div>
        ))}
      </div>

    </div>
  )
}
