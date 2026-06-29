'use client'
import { useEffect, useMemo, useState } from 'react'
import { Send, Eye, MousePointerClick, Phone, MessageSquare, MessageCircle, Mail, Activity, Search, type LucideIcon } from 'lucide-react'

const ORANGE = '#F4521E'
type Evt = { id: string; type: string; payload: { to?: string; subject?: string; kind?: string; link?: string; note?: string; at?: string; scheduled?: boolean }; created_at: string; client: { id: string; nom: string; secteur?: string } | null }

const META: Record<string, { label: string; icon: LucideIcon; bg: string; fg: string; chan: string }> = {
  prospect_email: { label: 'Email envoyé', icon: Send, bg: '#FFF1EC', fg: '#F4521E', chan: 'email' },
  email_open: { label: 'Email ouvert', icon: Eye, bg: '#ECFDF5', fg: '#16A34A', chan: 'email' },
  email_click: { label: 'Lien cliqué', icon: MousePointerClick, bg: '#EFF6FF', fg: '#2563EB', chan: 'email' },
  email_bounce: { label: 'Email rejeté', icon: Mail, bg: '#FEE2E2', fg: '#DC2626', chan: 'email' },
  prospect_call: { label: 'Appel', icon: Phone, bg: '#F1F5F9', fg: '#475569', chan: 'appel' },
  prospect_sms: { label: 'SMS', icon: MessageSquare, bg: '#F1F5F9', fg: '#475569', chan: 'sms' },
  prospect_whatsapp: { label: 'WhatsApp', icon: MessageCircle, bg: '#DCFCE7', fg: '#16A34A', chan: 'whatsapp' },
}
const FILTERS: { key: string; label: string }[] = [
  { key: 'tous', label: 'Tout' }, { key: 'prospect_email', label: 'Envoyés' }, { key: 'email_open', label: 'Ouverts' },
  { key: 'email_click', label: 'Clics' }, { key: 'prospect_call', label: 'Appels' }, { key: 'prospect_sms', label: 'SMS' }, { key: 'prospect_whatsapp', label: 'WhatsApp' },
]

export default function SuiviPage() {
  const [evts, setEvts] = useState<Evt[]>([])
  const [loading, setLoading] = useState(true)
  const [filt, setFilt] = useState('tous')
  const [q, setQ] = useState('')

  useEffect(() => {
    fetch('/api/cms/prospect-activity?feed=1').then(r => r.json()).then(d => setEvts(d.events || [])).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const counts = useMemo(() => {
    const c: Record<string, number> = {}
    for (const e of evts) c[e.type] = (c[e.type] || 0) + 1
    return c
  }, [evts])

  const list = useMemo(() => evts.filter(e =>
    (filt === 'tous' || e.type === filt) &&
    (!q || (e.client?.nom || e.payload?.to || '').toLowerCase().includes(q.toLowerCase()))
  ), [evts, filt, q])

  const kpis = [
    { label: 'Emails envoyés', n: counts.prospect_email || 0, icon: Send, color: ORANGE },
    { label: 'Ouverts', n: counts.email_open || 0, icon: Eye, color: '#16A34A' },
    { label: 'Clics', n: counts.email_click || 0, icon: MousePointerClick, color: '#2563EB' },
    { label: 'Appels', n: counts.prospect_call || 0, icon: Phone, color: '#475569' },
    { label: 'SMS', n: counts.prospect_sms || 0, icon: MessageSquare, color: '#475569' },
  ]
  const card = { background: '#fff', border: '1px solid #E9ECEF' }

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-xl font-bold" style={{ color: '#111827' }}>Suivi prospection</h1>
        <p className="text-sm mt-0.5" style={{ color: '#9CA3AF' }}>Historique de tous les contacts : qui, quand, par quel canal — ouvertures et clics suivis en direct.</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-5">
        {kpis.map(k => (
          <div key={k.label} className="rounded-xl p-4" style={card}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs" style={{ color: '#9CA3AF' }}>{k.label}</span>
              <k.icon className="w-4 h-4" style={{ color: k.color }} />
            </div>
            <p className="text-2xl font-bold leading-none" style={{ color: k.color }}>{k.n}</p>
          </div>
        ))}
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap items-center gap-2 mb-3">
        {FILTERS.map(f => (
          <button key={f.key} onClick={() => setFilt(f.key)} className="px-3 py-1.5 rounded-full text-xs font-medium transition-colors"
            style={{ background: filt === f.key ? '#0F172A' : '#fff', color: filt === f.key ? '#fff' : '#6B7280', border: '1px solid #E5E7EB' }}>{f.label}</button>
        ))}
        <div className="relative ml-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#9CA3AF' }} />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Rechercher un prospect…"
            className="pl-9 pr-4 py-2 rounded-lg text-sm outline-none" style={{ border: '1px solid #E5E7EB', background: '#fff', color: '#111827', minWidth: 220 }} />
        </div>
      </div>

      {/* Timeline */}
      <div className="rounded-xl p-2 sm:p-4" style={card}>
        {loading ? <p className="text-sm text-center py-10" style={{ color: '#9CA3AF' }}>Chargement…</p>
          : list.length === 0 ? <p className="text-sm text-center py-10" style={{ color: '#9CA3AF' }}>Aucune activité. Les emails envoyés (et leurs ouvertures/clics), appels et SMS apparaîtront ici dès tes premiers contacts.</p>
            : (
              <div className="divide-y" style={{ borderColor: '#F3F4F6' }}>
                {list.map(e => {
                  const m = META[e.type] || META.prospect_email
                  const name = e.client?.nom || e.payload?.to || '—'
                  const d = new Date(e.payload?.at || e.created_at)
                  const isFutureSched = !!e.payload?.scheduled && d.getTime() > Date.now()
                  const label = isFutureSched ? 'Email programmé ⏰' : m.label
                  const detail = e.type === 'prospect_email' && e.payload?.kind ? `(${e.payload.kind})` : e.payload?.subject ? `« ${e.payload.subject} »` : e.payload?.link ? `→ ${e.payload.link}` : e.payload?.note || ''
                  return (
                    <div key={e.id} className="flex items-center gap-3 py-2.5 px-1">
                      <span className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background: m.bg }}><m.icon className="w-4 h-4" style={{ color: m.fg }} /></span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm truncate" style={{ color: '#111827' }}><span className="font-semibold">{name}</span> {e.client?.secteur ? <span className="text-xs" style={{ color: '#9CA3AF' }}>· {e.client.secteur}</span> : null}</p>
                        <p className="text-xs truncate" style={{ color: '#6B7280' }}><span style={{ color: m.fg, fontWeight: 600 }}>{label}</span> {detail}</p>
                      </div>
                      <span className="text-xs shrink-0 text-right" style={{ color: '#9CA3AF' }}>{d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}<br />{d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  )
                })}
              </div>
            )}
      </div>
      <p className="text-xs mt-3" style={{ color: '#9CA3AF' }}>💡 Le détail par prospect (et l'envoi d'emails) reste dans chaque fiche, onglet Clients & Prospects.</p>
    </div>
  )
}
