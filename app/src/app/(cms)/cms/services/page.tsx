'use client'
import { useEffect, useState } from 'react'
import { commandesService, devisService, servicesService } from '@/services/supabase.service'
import type { Commande, Devis, Service } from '@/types'
import { Euro, ShoppingBag, FileText, TrendingUp, Plus, Pencil, Trash2, Eye, EyeOff } from 'lucide-react'

type ServiceForm = Omit<Service, 'id' | 'created_at' | 'updated_at'>
const EMPTY_SERVICE: ServiceForm = { nom: '', description: '', prix: 0, prix_mensuel: 0, stripe_link: '', stripe_price_id: '', categorie: '', actif: true, image_url: '', ordre: 0 }
const sInput = 'w-full px-3 py-2 rounded-lg text-sm outline-none'
const sStyle = { border: '1px solid #E5E7EB', background: '#fff', color: '#0F172A' }
const sLabel = 'text-xs font-semibold block mb-1.5 uppercase tracking-wide'

const ORANGE = '#F4521E'
const euro = (n: number) =>
  new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n || 0)

type Row = { nom: string; ca: number; commandes: number; devis: number; devisAcceptes: number; abonnement: boolean; actif: boolean; lastSale: string | null }

export default function CmsServicesPage() {
  const [commandes, setCommandes] = useState<Commande[]>([])
  const [devis, setDevis] = useState<Devis[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<string | null>(null)
  const [form, setForm] = useState<ServiceForm>({ ...EMPTY_SERVICE })
  const [saving, setSaving] = useState(false)

  const refreshServices = () => servicesService.getAll().then(setServices).catch(() => {})
  const openService = (s?: Service) => {
    setEditing(s?.id || 'new')
    setForm(s ? { nom: s.nom, description: s.description || '', prix: s.prix, prix_mensuel: s.prix_mensuel || 0, stripe_link: s.stripe_link || '', stripe_price_id: s.stripe_price_id || '', categorie: s.categorie || '', actif: s.actif, image_url: s.image_url || '', ordre: s.ordre } : { ...EMPTY_SERVICE })
  }
  const saveService = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true)
    try {
      if (editing === 'new') await servicesService.create(form)
      else if (editing) await servicesService.update(editing, form)
      setEditing(null); refreshServices()
    } catch (err) { alert(err instanceof Error ? err.message : 'Erreur') }
    finally { setSaving(false) }
  }
  const toggleService = async (s: Service) => { await servicesService.update(s.id, { actif: !s.actif }); refreshServices() }
  const delService = async (s: Service) => { if (confirm(`Supprimer le service « ${s.nom} » ?`)) { await servicesService.delete(s.id); refreshServices() } }

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

  if (editing) return (
    <div className="p-5 lg:p-8 max-w-2xl mx-auto">
      <button onClick={() => setEditing(null)} className="text-xs mb-3 flex items-center gap-1" style={{ color: '#94A3B8' }}>← Retour</button>
      <h1 className="text-xl font-bold mb-5" style={{ color: '#0F172A' }}>{editing === 'new' ? 'Nouveau service' : 'Modifier le service'}</h1>
      <form onSubmit={saveService} className="rounded-2xl p-6 space-y-4" style={{ background: '#fff', border: '1px solid #E5E7EB' }}>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2"><label className={sLabel} style={{ color: '#64748B' }}>Nom *</label><input required value={form.nom} onChange={e => setForm(p => ({ ...p, nom: e.target.value }))} className={sInput} style={sStyle} /></div>
          <div><label className={sLabel} style={{ color: '#64748B' }}>Catégorie</label><input value={form.categorie} onChange={e => setForm(p => ({ ...p, categorie: e.target.value }))} className={sInput} style={sStyle} /></div>
          <div><label className={sLabel} style={{ color: '#64748B' }}>Ordre</label><input type="number" value={form.ordre} onChange={e => setForm(p => ({ ...p, ordre: Number(e.target.value) }))} className={sInput} style={sStyle} /></div>
          <div><label className={sLabel} style={{ color: '#64748B' }}>Prix (€)</label><input type="number" value={form.prix} onChange={e => setForm(p => ({ ...p, prix: Number(e.target.value) }))} className={sInput} style={sStyle} /></div>
          <div><label className={sLabel} style={{ color: '#64748B' }}>Prix mensuel (€, 0 = aucun)</label><input type="number" value={form.prix_mensuel} onChange={e => setForm(p => ({ ...p, prix_mensuel: Number(e.target.value) }))} className={sInput} style={sStyle} /></div>
          <div className="sm:col-span-2"><label className={sLabel} style={{ color: '#64748B' }}>Lien Stripe (paiement)</label><input value={form.stripe_link} onChange={e => setForm(p => ({ ...p, stripe_link: e.target.value }))} placeholder="https://buy.stripe.com/…" className={sInput} style={sStyle} /></div>
        </div>
        <div><label className={sLabel} style={{ color: '#64748B' }}>Description</label><textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={3} className={`${sInput} resize-none`} style={sStyle} /></div>
        <label className="flex items-center gap-3 cursor-pointer"><input type="checkbox" checked={form.actif} onChange={e => setForm(p => ({ ...p, actif: e.target.checked }))} className="w-4 h-4 rounded accent-orange-500" /><span className="text-sm font-medium" style={{ color: '#374151' }}>Actif</span></label>
        <div className="flex gap-3 pt-1">
          <button type="submit" disabled={saving} className="px-5 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-50" style={{ background: ORANGE }}>{saving ? 'Sauvegarde…' : 'Sauvegarder'}</button>
          <button type="button" onClick={() => setEditing(null)} className="px-5 py-2 rounded-lg text-sm" style={{ border: '1px solid #E5E7EB', color: '#64748B' }}>Annuler</button>
        </div>
      </form>
    </div>
  )

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

      {/* Catalogue des services (édition) */}
      <div className="rounded-2xl overflow-hidden mt-6" style={{ background: '#fff', border: '1px solid #E5E7EB' }}>
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid #F1F5F9' }}>
          <div>
            <h2 className="text-sm font-semibold" style={{ color: '#0F172A' }}>Catalogue des services</h2>
            <p className="text-xs mt-0.5" style={{ color: '#94A3B8' }}>Liste de référence utilisée par les KPI ci-dessus.</p>
          </div>
          <button onClick={() => openService()} className="inline-flex items-center gap-1.5 text-sm font-semibold text-white px-4 py-2 rounded-lg" style={{ background: ORANGE }}>
            <Plus className="w-4 h-4" /> Nouveau
          </button>
        </div>
        {services.length === 0 ? (
          <p className="text-sm text-center py-8" style={{ color: '#94A3B8' }}>Aucun service dans le catalogue.</p>
        ) : (
          <div className="divide-y" style={{ borderColor: '#F1F5F9' }}>
            {services.map(s => (
              <div key={s.id} className="flex items-center gap-3 px-5 py-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: '#0F172A' }}>
                    {s.nom}
                    {!!s.prix_mensuel && <span className="ml-2 text-[11px]" style={{ color: '#64748B' }}>abonnement</span>}
                    {!s.actif && <span className="ml-2 text-[11px]" style={{ color: '#94A3B8' }}>(inactif)</span>}
                  </p>
                  <p className="text-xs truncate" style={{ color: '#94A3B8' }}>{s.categorie || '—'} · {euro(s.prix)}{s.prix_mensuel ? ` · ${euro(s.prix_mensuel)}/mois` : ''}</p>
                </div>
                <button onClick={() => toggleService(s)} title={s.actif ? 'Désactiver' : 'Activer'} className="p-2 rounded-lg hover:bg-slate-100">{s.actif ? <Eye className="w-4 h-4" style={{ color: '#64748B' }} /> : <EyeOff className="w-4 h-4" style={{ color: '#94A3B8' }} />}</button>
                <button onClick={() => openService(s)} className="p-2 rounded-lg hover:bg-slate-100"><Pencil className="w-4 h-4" style={{ color: '#64748B' }} /></button>
                <button onClick={() => delService(s)} className="p-2 rounded-lg hover:bg-red-50"><Trash2 className="w-4 h-4" style={{ color: '#DC2626' }} /></button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
