'use client'
import { useEffect, useState } from 'react'
import { commandesService, devisService, servicesService } from '@/services/supabase.service'
import type { Commande, Devis, Service } from '@/types'
import { Euro, ShoppingBag, FileText, TrendingUp } from 'lucide-react'

const ORANGE = '#F4521E'
const euro = (n: number) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n || 0)

type Row = { nom: string; ca: number; commandes: number; devis: number; devisAcceptes: number; abonnement: boolean; actif: boolean; lastSale: string | null }

export default function CmsServicesPage() {
  const [commandes, setCommandes] = useState<Commande[]>([])
  const [devis, setDevis] = useState<Devis[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      commandesService.getAll().catch(() => []),
      devisService.getAll().catch(() => []),
      servicesService.getAll().catch(() => []),
    ]).then(([c, d, s]) => {
      setCommandes(c as Commande[]); setDevis(d as Devis[]); setServices(s as Service[]); setLoading(false)
    })
  }, [])

  const paid = commandes.filter((c) => c.statut === 'paye')
  const caTotal = paid.reduce((s, c) => s + Number(c.montant || 0), 0)
  const devisAcceptes = devis.filter((d) => d.statut === 'accepte').length
  const conversion = devis.length ? Math.round((devisAcceptes / devis.length) * 100) : 0
  const panierMoyen = paid.length ? Math.round(caTotal / paid.length) : 0

  const kpis = [
    { label: 'CA encaissé', value: euro(caTotal), icon: Euro, accent: true },
    { label: 'Commandes payées', value: String(paid.length), icon: ShoppingBag, accent: false },
    { label: 'Devis reçus', value: String(devis.length), icon: FileText, accent: false },
    { label: 'Conversion devis', value: `${conversion}%`, icon: TrendingUp, accent: false },
  ]

  const rows = new Map<string, Row>()
  const ensure = (nom: string): Row => {
    const key = nom?.trim() || '—'
    if (!rows.has(key)) rows.set(key, { nom: key, ca: 0, commandes: 0, devis: 0, devisAcceptes: 0, abonnement: false, actif: true, lastSale: null })
    return rows.get(key)!
  }
  for (const s of services) { const r = ensure(s.nom); r.abonnement = !!s.prix_mensuel; r.actif = s.actif }
  for (const c of paid) { const r = ensure(c.service || '—'); r.ca += Number(c.montant || 0); r.commandes += 1; if (!r.lastSale || c.created_at > r.lastSale) r.lastSale = c.created_at }
  for (const d of devis) { const r = ensure(d.service || '—'); r.devis += 1; if (d.statut === 'accepte') r.devisAcceptes += 1 }
  const serviceRows = [...rows.values()].sort((a, b) => b.ca - a.ca)

  return (
    <div className="p-5 lg:p-8 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold" style={{ color: '#0F172A' }}>Services &amp; KPI</h1>
        <p className="text-sm mt-0.5" style={{ color: '#64748B' }}>Performance des services vendus (commandes Stripe &amp; devis).</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-6">
        {kpis.map(({ label, value, icon: Icon, accent }) => (
          <div key={label} className="rounded-2xl p-4 lg:p-5" style={{ background: '#fff', border: `1px solid ${accent ? 'rgba(244,82,30,.25)' : '#E5E7EB'}` }}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs" style={{ color: '#64748B' }}>{label}</p>
              <Icon className="w-4 h-4" style={{ color: accent ? ORANGE : '#94A3B8' }} />
            </div>
            <p className="text-2xl lg:text-3xl font-bold" style={{ color: accent ? ORANGE : '#0F172A' }}>{loading ? '…' : value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ background: '#fff', border: '1px solid #E5E7EB' }}>
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid #F1F5F9' }}>
          <h2 className="text-sm font-semibold" style={{ color: '#0F172A' }}>Par service</h2>
          <span className="text-xs" style={{ color: '#64748B' }}>Panier moyen : {euro(panierMoyen)}</span>
        </div>
        {loading ? (
          <p className="text-sm text-center py-10" style={{ color: '#94A3B8' }}>Chargement…</p>
        ) : serviceRows.length === 0 ? (
          <p className="text-sm text-center py-10" style={{ color: '#94A3B8' }}>Aucune donnée de vente pour l&apos;instant.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ color: '#94A3B8', borderBottom: '1px solid #F1F5F9' }} className="text-left text-xs">
                  <th className="px-5 py-2.5 font-medium">Service</th>
                  <th className="px-3 py-2.5 font-medium text-right">CA</th>
                  <th className="px-3 py-2.5 font-medium text-right">Cmd</th>
                  <th className="px-3 py-2.5 font-medium text-right">Devis</th>
                  <th className="px-3 py-2.5 font-medium text-right">Acceptés</th>
                  <th className="px-5 py-2.5 font-medium text-right">Dernière vente</th>
                </tr>
              </thead>
              <tbody>
                {serviceRows.map((r) => (
                  <tr key={r.nom} style={{ borderBottom: '1px solid #F8FAFC' }}>
                    <td className="px-5 py-3" style={{ color: '#0F172A' }}>
                      <span className="font-medium">{r.nom}</span>
                      {r.abonnement && <span className="ml-2 text-[11px]" style={{ color: '#64748B' }}>abonnement</span>}
                      {!r.actif && <span className="ml-2 text-[11px]" style={{ color: '#94A3B8' }}>(inactif)</span>}
                    </td>
                    <td className="px-3 py-3 text-right font-semibold" style={{ color: r.ca > 0 ? ORANGE : '#94A3B8' }}>{euro(r.ca)}</td>
                    <td className="px-3 py-3 text-right" style={{ color: '#64748B' }}>{r.commandes}</td>
                    <td className="px-3 py-3 text-right" style={{ color: '#64748B' }}>{r.devis}</td>
                    <td className="px-3 py-3 text-right" style={{ color: '#64748B' }}>{r.devisAcceptes}</td>
                    <td className="px-5 py-3 text-right" style={{ color: '#64748B' }}>{r.lastSale ? new Date(r.lastSale).toLocaleDateString('fr-FR') : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
