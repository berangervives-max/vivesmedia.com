'use client'
import { useEffect, useState } from 'react'
import { Building2, Receipt, Link2, Save, Check } from 'lucide-react'

const ORANGE = '#F4521E'
const STORAGE_KEY = 'vivesmedia-cms-settings'

type Settings = {
  entreprise: string
  siret: string
  adresse: string
  tva: string
  emailContact: string
  telephone: string
  prefixeFacture: string
  mentionsFacture: string
  delaiPaiement: string
  googleReviewUrl: string
  calendlyUrl: string
  calcomUrl: string
  googleAgendaUrl: string
}

const DEFAULTS: Settings = {
  entreprise: 'vivesmedia.com — Béranger Vives',
  siret: '',
  adresse: 'Avignon, France',
  tva: 'TVA non applicable, art. 293 B du CGI',
  emailContact: 'contact@vivesmedia.com',
  telephone: '',
  prefixeFacture: 'VM-2026-',
  mentionsFacture: 'Paiement à réception. Pénalités de retard : 3× le taux d\'intérêt légal. Indemnité forfaitaire de recouvrement : 40€.',
  delaiPaiement: '30',
  googleReviewUrl: '',
  calendlyUrl: 'https://calendly.com/vivesmedia',
  calcomUrl: 'https://cal.com/vives-beranger-4xsrgx',
  googleAgendaUrl: 'https://calendar.google.com/calendar/r/eventedit?text=Appel%20d%C3%A9couverte%20vivesmedia&description=Appel%20d%C3%A9couverte%2030%20minutes%20avec%20vivesmedia.com%20-%20Full%20remote',
}

function Field({ label, value, onChange, placeholder, textarea }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; textarea?: boolean
}) {
  return (
    <div>
      <label className="text-xs font-semibold uppercase tracking-wider block mb-1.5" style={{ color: '#9CA3AF' }}>{label}</label>
      {textarea ? (
        <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={3}
          className="w-full px-3 py-2.5 rounded-lg text-sm outline-none resize-none leading-relaxed"
          style={{ background: '#F8F9FA', border: '1px solid #E9ECEF', color: '#111827' }} />
      ) : (
        <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
          className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
          style={{ background: '#F8F9FA', border: '1px solid #E9ECEF', color: '#111827' }} />
      )}
    </div>
  )
}

export default function SettingsPage() {
  const [s, setS] = useState<Settings>(DEFAULTS)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setS({ ...DEFAULTS, ...JSON.parse(raw) })
    } catch { /* défauts conservés */ }
  }, [])

  const set = (k: keyof Settings) => (v: string) => { setS(p => ({ ...p, [k]: v })); setSaved(false) }

  const handleSave = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s))
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="space-y-6 max-w-3xl">

      {/* Entreprise */}
      <div className="rounded-xl p-6" style={{ background: '#fff', border: '1px solid #E9ECEF' }}>
        <div className="flex items-center gap-2 mb-5">
          <Building2 className="w-4 h-4" style={{ color: ORANGE }} />
          <h2 className="font-bold text-sm" style={{ color: '#111827' }}>Entreprise</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Raison sociale" value={s.entreprise} onChange={set('entreprise')} />
          <Field label="SIRET" value={s.siret} onChange={set('siret')} placeholder="123 456 789 00012" />
          <Field label="Adresse" value={s.adresse} onChange={set('adresse')} />
          <Field label="Régime TVA" value={s.tva} onChange={set('tva')} />
          <Field label="Email de contact" value={s.emailContact} onChange={set('emailContact')} />
          <Field label="Téléphone" value={s.telephone} onChange={set('telephone')} placeholder="06 12 34 56 78" />
        </div>
      </div>

      {/* Facturation */}
      <div className="rounded-xl p-6" style={{ background: '#fff', border: '1px solid #E9ECEF' }}>
        <div className="flex items-center gap-2 mb-5">
          <Receipt className="w-4 h-4" style={{ color: ORANGE }} />
          <h2 className="font-bold text-sm" style={{ color: '#111827' }}>Facturation</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <Field label="Préfixe numéro de facture" value={s.prefixeFacture} onChange={set('prefixeFacture')} placeholder="VM-2026-" />
          <Field label="Délai de paiement (jours)" value={s.delaiPaiement} onChange={set('delaiPaiement')} placeholder="30" />
        </div>
        <Field label="Mentions légales sur factures" value={s.mentionsFacture} onChange={set('mentionsFacture')} textarea />
      </div>

      {/* Liens */}
      <div className="rounded-xl p-6" style={{ background: '#fff', border: '1px solid #E9ECEF' }}>
        <div className="flex items-center gap-2 mb-5">
          <Link2 className="w-4 h-4" style={{ color: ORANGE }} />
          <h2 className="font-bold text-sm" style={{ color: '#111827' }}>Liens connectés</h2>
        </div>
        <div className="space-y-4">
          <Field label="Lien avis Google" value={s.googleReviewUrl} onChange={set('googleReviewUrl')} placeholder="https://g.page/r/XXXX/review" />
          <Field label="Lien Calendly" value={s.calendlyUrl} onChange={set('calendlyUrl')} placeholder="https://calendly.com/vivesmedia" />
          <Field label="Lien cal.com" value={s.calcomUrl} onChange={set('calcomUrl')} placeholder="https://cal.com/vivesmedia" />
          <Field label="Lien Google Agenda (création RDV)" value={s.googleAgendaUrl} onChange={set('googleAgendaUrl')} placeholder="https://calendar.google.com/calendar/r/eventedit?..." />
        </div>
      </div>

      {/* Sauvegarde */}
      <div className="flex items-center gap-4">
        <button onClick={handleSave}
          className="flex items-center gap-2 text-sm font-semibold px-6 py-3 rounded-lg text-white transition-opacity hover:opacity-90"
          style={{ background: saved ? '#16A34A' : ORANGE }}>
          {saved ? <><Check className="w-4 h-4" /> Enregistré</> : <><Save className="w-4 h-4" /> Enregistrer</>}
        </button>
        <p className="text-xs" style={{ color: '#9CA3AF' }}>
          Utilisé pour tes <strong>factures</strong> (préfixe de numéro, coordonnées, mentions, régime TVA) et tes <strong>liens</strong> (Calendly, avis Google). Stocké sur ce navigateur.
        </p>
      </div>

    </div>
  )
}
