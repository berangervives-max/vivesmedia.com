'use client'
import { useEffect, useState } from 'react'
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts'
import { devisService, facturesService, commandesService, newsletterService } from '@/services/supabase.service'
import { TrendingUp, Target, Mail, ExternalLink, Euro, Percent, Clock } from 'lucide-react'
import type { Devis, Facture, Commande, Newsletter } from '@/types'

const ORANGE = '#F4521E'
const MONTHS_FR = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc']

const EXTERNAL_TOOLS = [
  { label: 'PostHog', desc: 'Trafic, heatmaps, comportement visiteurs', href: 'https://eu.posthog.com' },
  { label: 'Google Search Console', desc: 'Positions Google, clics, impressions', href: 'https://search.google.com/search-console' },
  { label: 'Stripe', desc: 'Paiements, abonnements, litiges', href: 'https://dashboard.stripe.com' },
  { label: 'Resend', desc: 'Emails envoyés, délivrabilité', href: 'https://resend.com/emails' },
  { label: 'Supabase', desc: 'Base de données, auth, logs', href: 'https://supabase.com/dashboard/project/lycexinkvpnotvbxbvkm' },
  { label: 'Vercel', desc: 'Déploiements, performances serveur', href: 'https://vercel.com/berangervives-8929s-projects/app' },
]

const DEVIS_STATUTS: { key: Devis['statut']; label: string; color: string }[] = [
  { key: 'nouveau', label: 'Nouveaux', color: '#F4521E' },
  { key: 'contacte', label: 'Contactés', color: '#fb923c' },
  { key: 'en_cours', label: 'En cours', color: '#fbbf24' },
  { key: 'accepte', label: 'Acceptés', color: '#22c55e' },
  { key: 'refuse', label: 'Refusés', color: '#9CA3AF' },
]

function monthKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export default function StatsPage() {
  const [devis, setDevis] = useState<Devis[]>([])
  const [factures, setFactures] = useState<Facture[]>([])
  const [commandes, setCommandes] = useState<Commande[]>([])
  const [newsletter, setNewsletter] = useState<Newsletter[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    Promise.all([
      devisService.getAll(),
      facturesService.getAll(),
      commandesService.getAll(),
      newsletterService.getAll(),
    ])
      .then(([d, f, c, n]) => { setDevis(d); setFactures(f); setCommandes(c); setNewsletter(n); setLoading(false) })
      .catch(() => { setError(true); setLoading(false) })
  }, [])

  // ── CA par mois (12 derniers mois) : factures payées + commandes payées ──
  const now = new Date()
  const months: { key: string; label: string }[] = []
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    months.push({ key: monthKey(d), label: MONTHS_FR[d.getMonth()] })
  }
  const caParMois = months.map(m => {
    const fSum = factures.filter(f => f.statut === 'payee' && monthKey(new Date(f.created_at)) === m.key).reduce((s, f) => s + Number(f.montant_ttc), 0)
    const cSum = commandes.filter(c => c.statut === 'paye' && monthKey(new Date(c.created_at)) === m.key).reduce((s, c) => s + Number(c.montant), 0)
    return { mois: m.label, ca: Math.round(fSum + cSum) }
  })
  const caTotal12m = caParMois.reduce((s, m) => s + m.ca, 0)

  // ── Pipeline devis ──
  const pipeline = DEVIS_STATUTS.map(s => ({ ...s, count: devis.filter(d => d.statut === s.key).length }))
  const devisTraites = devis.filter(d => d.statut === 'accepte' || d.statut === 'refuse').length
  const tauxConversion = devisTraites > 0 ? Math.round((devis.filter(d => d.statut === 'accepte').length / devisTraites) * 100) : null

  // ── Demandes par service ──
  const parService = Object.entries(
    devis.reduce<Record<string, number>>((acc, d) => {
      const k = d.service || 'Non précisé'
      acc[k] = (acc[k] ?? 0) + 1
      return acc
    }, {})
  ).sort((a, b) => b[1] - a[1]).slice(0, 6)

  // ── Croissance newsletter (cumulée par mois) ──
  const newsGrowth = months.map(m => ({
    mois: m.label,
    abonnés: newsletter.filter(n => monthKey(new Date(n.date_inscription)) <= m.key).length,
  }))

  // ── Devis du mois vs mois précédent ──
  const moisActuel = monthKey(now)
  const moisPrec = monthKey(new Date(now.getFullYear(), now.getMonth() - 1, 1))
  const devisCeMois = devis.filter(d => monthKey(new Date(d.created_at)) === moisActuel).length
  const devisMoisPrec = devis.filter(d => monthKey(new Date(d.created_at)) === moisPrec).length

  const KPIS = [
    { label: 'CA 12 derniers mois', value: `${caTotal12m.toLocaleString('fr-FR')} €`, icon: Euro },
    { label: 'Devis ce mois', value: `${devisCeMois}${devisMoisPrec > 0 ? ` (vs ${devisMoisPrec})` : ''}`, icon: Target },
    { label: 'Taux de conversion devis', value: tauxConversion !== null ? `${tauxConversion}%` : '—', icon: Percent },
    { label: 'Abonnés newsletter', value: newsletter.length, icon: Mail },
  ]

  if (loading) return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map(i => <div key={i} className="h-28 rounded-xl animate-pulse" style={{ background: '#E9ECEF' }} />)}
    </div>
  )

  if (error) return (
    <div className="rounded-xl p-6 text-sm" style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#B91C1C' }}>
      Impossible de charger les données. Vérifiez que le script SQL <code>003_site_sur_hub_project.sql</code> a bien été exécuté dans Supabase.
    </div>
  )

  return (
    <div className="space-y-6">

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {KPIS.map(k => (
          <div key={k.label} className="rounded-xl p-5" style={{ background: '#fff', border: '1px solid #E9ECEF' }}>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(244,82,30,.1)', color: ORANGE }}>
                <k.icon className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-bold" style={{ color: '#111827' }}>{k.value}</p>
            <p className="text-xs mt-1" style={{ color: '#9CA3AF' }}>{k.label}</p>
          </div>
        ))}
      </div>

      {/* CA par mois */}
      <div className="rounded-xl p-6" style={{ background: '#fff', border: '1px solid #E9ECEF' }}>
        <div className="flex items-center gap-2 mb-1">
          <TrendingUp className="w-4 h-4" style={{ color: ORANGE }} />
          <h2 className="font-bold text-sm" style={{ color: '#111827' }}>Chiffre d'affaires encaissé par mois</h2>
        </div>
        <p className="text-xs mb-5" style={{ color: '#9CA3AF' }}>Factures payées + commandes Stripe, 12 derniers mois</p>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={caParMois}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F3F5" vertical={false} />
              <XAxis dataKey="mois" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} tickFormatter={v => `${v}€`} />
              <Tooltip formatter={(v) => [`${Number(v ?? 0).toLocaleString('fr-FR')} €`, 'CA']} contentStyle={{ borderRadius: 10, border: '1px solid #E9ECEF', fontSize: 12 }} />
              <Bar dataKey="ca" fill={ORANGE} radius={[6, 6, 0, 0]} maxBarSize={36} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">

        {/* Pipeline devis */}
        <div className="rounded-xl p-6" style={{ background: '#fff', border: '1px solid #E9ECEF' }}>
          <div className="flex items-center gap-2 mb-1">
            <Target className="w-4 h-4" style={{ color: ORANGE }} />
            <h2 className="font-bold text-sm" style={{ color: '#111827' }}>Pipeline commercial</h2>
          </div>
          <p className="text-xs mb-5" style={{ color: '#9CA3AF' }}>Tous les devis par statut</p>
          <div className="space-y-3">
            {pipeline.map(s => {
              const max = Math.max(...pipeline.map(p => p.count), 1)
              return (
                <div key={s.key} className="flex items-center gap-3">
                  <span className="text-xs w-20 shrink-0" style={{ color: '#6B7280' }}>{s.label}</span>
                  <div className="flex-1 h-7 rounded-lg overflow-hidden" style={{ background: '#F8F9FA' }}>
                    <div className="h-full rounded-lg transition-all duration-700 flex items-center px-2"
                      style={{ width: `${Math.max((s.count / max) * 100, s.count > 0 ? 12 : 0)}%`, background: s.color }}>
                      {s.count > 0 && <span className="text-xs font-bold text-white">{s.count}</span>}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
          {tauxConversion !== null && (
            <p className="text-xs mt-5 pt-4" style={{ color: '#6B7280', borderTop: '1px solid #F1F3F5' }}>
              Taux de conversion (acceptés / traités) : <strong style={{ color: '#111827' }}>{tauxConversion}%</strong>
            </p>
          )}
        </div>

        {/* Demandes par service */}
        <div className="rounded-xl p-6" style={{ background: '#fff', border: '1px solid #E9ECEF' }}>
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4" style={{ color: ORANGE }} />
            <h2 className="font-bold text-sm" style={{ color: '#111827' }}>Services les plus demandés</h2>
          </div>
          <p className="text-xs mb-5" style={{ color: '#9CA3AF' }}>Répartition des demandes de devis</p>
          {parService.length === 0 ? (
            <p className="text-sm" style={{ color: '#9CA3AF' }}>Aucune demande pour le moment.</p>
          ) : (
            <div className="space-y-3">
              {parService.map(([service, count]) => {
                const max = parService[0][1]
                return (
                  <div key={service} className="flex items-center gap-3">
                    <span className="text-xs w-32 shrink-0 truncate" style={{ color: '#6B7280' }}>{service}</span>
                    <div className="flex-1 h-7 rounded-lg overflow-hidden" style={{ background: '#F8F9FA' }}>
                      <div className="h-full rounded-lg flex items-center px-2 transition-all duration-700"
                        style={{ width: `${Math.max((count / max) * 100, 12)}%`, background: ORANGE }}>
                        <span className="text-xs font-bold text-white">{count}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Croissance newsletter */}
      <div className="rounded-xl p-6" style={{ background: '#fff', border: '1px solid #E9ECEF' }}>
        <div className="flex items-center gap-2 mb-1">
          <Mail className="w-4 h-4" style={{ color: ORANGE }} />
          <h2 className="font-bold text-sm" style={{ color: '#111827' }}>Croissance newsletter</h2>
        </div>
        <p className="text-xs mb-5" style={{ color: '#9CA3AF' }}>Abonnés cumulés, 12 derniers mois</p>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={newsGrowth}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F3F5" vertical={false} />
              <XAxis dataKey="mois" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip contentStyle={{ borderRadius: 10, border: '1px solid #E9ECEF', fontSize: 12 }} />
              <Line type="monotone" dataKey="abonnés" stroke={ORANGE} strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Outils externes */}
      <div className="rounded-xl p-6" style={{ background: '#fff', border: '1px solid #E9ECEF' }}>
        <h2 className="font-bold text-sm mb-1" style={{ color: '#111827' }}>Outils connectés</h2>
        <p className="text-xs mb-5" style={{ color: '#9CA3AF' }}>Accès direct aux dashboards externes</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {EXTERNAL_TOOLS.map(t => (
            <a key={t.label} href={t.href} target="_blank" rel="noopener noreferrer"
              className="group flex items-start justify-between gap-2 p-4 rounded-lg transition-all hover:-translate-y-0.5 hover:shadow-sm"
              style={{ background: '#F8F9FA', border: '1px solid #F1F3F5' }}>
              <div>
                <p className="text-sm font-semibold" style={{ color: '#111827' }}>{t.label}</p>
                <p className="text-xs mt-0.5" style={{ color: '#9CA3AF' }}>{t.desc}</p>
              </div>
              <ExternalLink className="w-3.5 h-3.5 shrink-0 mt-0.5 transition-colors" style={{ color: '#D1D5DB' }} />
            </a>
          ))}
        </div>
      </div>

    </div>
  )
}
