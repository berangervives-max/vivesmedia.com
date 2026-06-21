'use client'
import { useState, useEffect } from 'react'
import { facturesService } from '@/services/supabase.service'
import { sendFacture } from '@/services/email.service'
import type { Facture, FactureLigne } from '@/types'
import { Plus, Trash2, Send, Pencil, Download, ExternalLink, CheckCircle2 } from 'lucide-react'
import { genererFacturePdf } from '@/lib/facture-pdf'

const STATUTS = ['brouillon','envoyee','payee','en_retard','annulee'] as const
const COLORS: Record<string, string> = {
  brouillon: 'bg-gray-100 text-gray-500',
  envoyee: 'bg-blue-100 text-blue-700',
  payee: 'bg-green-100 text-green-700',
  en_retard: 'bg-red-100 text-red-600',
  annulee: 'bg-gray-100 text-gray-400',
}

function calcTotaux(lignes: FactureLigne[], remise: number, tva: number) {
  const ht_brut = lignes.reduce((s, l) => s + (l.quantite * l.prix_unitaire), 0)
  const ht = ht_brut * (1 - remise / 100)
  return { montant_ht: ht, montant_tva: ht * (tva / 100), montant_ttc: ht + ht * (tva / 100) }
}

/** Préfixe de numéro depuis les Paramètres (ex: « VM-2026- »), sinon défaut « VM-AAAA- ». */
function facturePrefix() {
  try {
    const raw = localStorage.getItem('vivesmedia-cms-settings')
    if (raw) { const p = JSON.parse(raw).prefixeFacture as string | undefined; if (p) return p }
  } catch { /* défaut */ }
  return `VM-${new Date().getFullYear()}-`
}

function nextNumero(factures: Facture[]) {
  const prefix = facturePrefix()
  const nums = factures
    .filter(f => f.numero?.startsWith(prefix))
    .map(f => parseInt(f.numero.slice(prefix.length), 10) || 0)
  return `${prefix}${String(nums.length ? Math.max(...nums) + 1 : 1).padStart(3, '0')}`
}

const EMPTY_LIGNE: FactureLigne = { description: '', quantite: 1, prix_unitaire: 0 }
// TVA à 0 par défaut : micro-entreprise en franchise de TVA (art. 293 B du CGI).
const EMPTY = (factures: Facture[]): Omit<Facture, 'id' | 'created_at' | 'updated_at'> => ({
  numero: nextNumero(factures), client_nom: '', client_email: '', client_adresse: '', client_siret: '',
  date_emission: new Date().toISOString().slice(0, 10),
  date_echeance: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
  lignes: [{ ...EMPTY_LIGNE }], remise: 0, tva_taux: 0, stripe_payment_link: '',
  montant_ht: 0, montant_tva: 0, montant_ttc: 0, statut: 'brouillon', notes: '',
})

const inputCls = "w-full px-3 py-2 rounded-lg text-sm outline-none"
const inputStyle = { border: '1px solid #E5E7EB', background: '#fff', color: '#111827' }
const labelCls = "text-xs font-semibold block mb-1.5 uppercase tracking-wide"

export default function CmsFacturesPage() {
  const [factures, setFactures] = useState<Facture[]>([])
  const [editing, setEditing] = useState<string | null>(null)
  const [form, setForm] = useState<Omit<Facture, 'id' | 'created_at' | 'updated_at'>>(EMPTY([]))
  const [saving, setSaving] = useState(false)

  const load = () => facturesService.getAll().then(setFactures).catch(() => {})
  useEffect(() => { load() }, [])

  const open = (f?: Facture) => {
    setEditing(f?.id || 'new')
    setForm(f ? { numero: f.numero, client_nom: f.client_nom, client_email: f.client_email || '', client_adresse: f.client_adresse || '', client_siret: f.client_siret || '', date_emission: f.date_emission, date_echeance: f.date_echeance || '', lignes: f.lignes, remise: f.remise, tva_taux: f.tva_taux, stripe_payment_link: f.stripe_payment_link || '', montant_ht: f.montant_ht, montant_tva: f.montant_tva, montant_ttc: f.montant_ttc, statut: f.statut, notes: f.notes || '' } : EMPTY(factures))
  }

  const setLigne = (i: number, k: keyof FactureLigne, v: string | number) => {
    const lignes = [...form.lignes]; lignes[i] = { ...lignes[i], [k]: v }
    const totaux = calcTotaux(lignes, form.remise, form.tva_taux)
    setForm(p => ({ ...p, lignes, ...totaux }))
  }

  // Recalcule les totaux quand la remise ou le taux de TVA change.
  const setRemise = (remise: number) => setForm(p => ({ ...p, remise, ...calcTotaux(p.lignes, remise, p.tva_taux) }))
  const setTva = (tva: number) => setForm(p => ({ ...p, tva_taux: tva, ...calcTotaux(p.lignes, p.remise, tva) }))

  const save = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true)
    try {
      if (editing === 'new') await facturesService.create(form)
      else if (editing) await facturesService.update(editing, form)
      setEditing(null); load()
    } catch (err: any) { alert(err.message) }
    finally { setSaving(false) }
  }

  const sendEmail = async (f: Facture) => {
    if (!f.client_email) return alert('Pas d\'email client')
    await sendFacture({ client_email: f.client_email, client_nom: f.client_nom, numero: f.numero, montant_ttc: f.montant_ttc, stripe_payment_link: f.stripe_payment_link })
    await facturesService.update(f.id, { statut: 'envoyee' }); load()
    alert('Facture envoyée !')
  }

  if (editing) return (
    <div>
      <div className="mb-6">
        <button onClick={() => setEditing(null)} className="text-xs mb-2 flex items-center gap-1" style={{ color: '#9CA3AF' }}>← Retour aux factures</button>
        <h1 className="text-xl font-bold" style={{ color: '#111827' }}>
          {editing === 'new' ? 'Nouvelle facture' : 'Modifier la facture'}
        </h1>
      </div>
      <form onSubmit={save} className="space-y-4 max-w-3xl">
        {/* Infos client */}
        <div className="rounded-xl p-5" style={{ background: '#fff', border: '1px solid #E9ECEF' }}>
          <p className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: '#9CA3AF' }}>Informations</p>
          <div className="grid md:grid-cols-2 gap-4">
            {([['Numéro', 'numero'], ['Client', 'client_nom'], ['Email client', 'client_email'], ['Adresse', 'client_adresse'], ['SIRET', 'client_siret'], ['Date émission', 'date_emission'], ['Date échéance', 'date_echeance']] as [string, string][]).map(([label, key]) => (
              <div key={key}>
                <label className={labelCls} style={{ color: '#6B7280' }}>{label}</label>
                <input type={key.includes('date') ? 'date' : 'text'} value={form[key as keyof typeof form] as string}
                  onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                  className={inputCls} style={inputStyle} />
              </div>
            ))}
          </div>
        </div>

        {/* Lignes */}
        <div className="rounded-xl p-5" style={{ background: '#fff', border: '1px solid #E9ECEF' }}>
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#9CA3AF' }}>Lignes de facturation</p>
            <button type="button" onClick={() => setForm(p => ({ ...p, lignes: [...p.lignes, { ...EMPTY_LIGNE }] }))}
              className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg"
              style={{ background: '#F4521E', color: '#fff' }}>
              <Plus className="w-3.5 h-3.5" /> Ajouter
            </button>
          </div>
          {/* En-tête colonnes */}
          <div className="grid grid-cols-12 gap-2 mb-2 px-1">
            {['Description', 'Qté', 'Prix unitaire', ''].map((h, i) => (
              <p key={i} className={`text-xs font-semibold uppercase tracking-wide ${i === 0 ? 'col-span-6' : i === 1 ? 'col-span-2' : i === 2 ? 'col-span-3' : 'col-span-1'}`}
                style={{ color: '#9CA3AF' }}>{h}</p>
            ))}
          </div>
          <div className="space-y-2">
            {form.lignes.map((l, i) => (
              <div key={i} className="grid grid-cols-12 gap-2 items-center">
                <input value={l.description} onChange={e => setLigne(i, 'description', e.target.value)} placeholder="Description"
                  className={`col-span-6 ${inputCls}`} style={inputStyle} />
                <input type="number" value={l.quantite} onChange={e => setLigne(i, 'quantite', Number(e.target.value))}
                  className={`col-span-2 text-center ${inputCls}`} style={inputStyle} />
                <input type="number" value={l.prix_unitaire} onChange={e => setLigne(i, 'prix_unitaire', Number(e.target.value))}
                  className={`col-span-3 ${inputCls}`} style={inputStyle} />
                <button type="button" onClick={() => { const l2 = form.lignes.filter((_, j) => j !== i); setForm(p => ({ ...p, lignes: l2, ...calcTotaux(l2, p.remise, p.tva_taux) })) }}
                  className="col-span-1 flex justify-center p-1.5 rounded-lg" style={{ color: '#9CA3AF' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#EF4444'; (e.currentTarget as HTMLElement).style.background = '#FEF2F2' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = '#9CA3AF'; (e.currentTarget as HTMLElement).style.background = 'transparent' }}>
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
          {/* Remise / TVA */}
          <div className="mt-5 pt-4 grid grid-cols-2 gap-3 max-w-xs ml-auto" style={{ borderTop: '1px solid #F3F4F6' }}>
            <div>
              <label className={labelCls} style={{ color: '#6B7280' }}>Remise (%)</label>
              <input type="number" min={0} max={100} value={form.remise} onChange={e => setRemise(Number(e.target.value))} className={inputCls} style={inputStyle} />
            </div>
            <div>
              <label className={labelCls} style={{ color: '#6B7280' }}>TVA (%)</label>
              <input type="number" min={0} max={20} value={form.tva_taux} onChange={e => setTva(Number(e.target.value))} className={inputCls} style={inputStyle} />
            </div>
          </div>
          {form.tva_taux === 0 && (
            <p className="text-right text-[11px] mt-1.5" style={{ color: '#9CA3AF' }}>TVA non applicable, art. 293 B du CGI (franchise en base).</p>
          )}

          {/* Totaux */}
          <div className="mt-4 pt-4 text-right space-y-1 text-sm" style={{ borderTop: '1px solid #F3F4F6' }}>
            <p style={{ color: '#6B7280' }}>HT : <strong>{form.montant_ht.toFixed(2)} €</strong></p>
            {form.tva_taux > 0 && <p style={{ color: '#6B7280' }}>TVA ({form.tva_taux}%) : <strong>{form.montant_tva.toFixed(2)} €</strong></p>}
            <p className="text-lg font-bold" style={{ color: '#111827' }}>{form.tva_taux > 0 ? 'TTC' : 'Total'} : {form.montant_ttc.toFixed(2)} €</p>
          </div>

          {/* Lien de paiement Stripe */}
          <div className="mt-5 pt-4" style={{ borderTop: '1px solid #F3F4F6' }}>
            <label className={labelCls} style={{ color: '#6B7280' }}>Lien de paiement Stripe (optionnel — apparaît dans le PDF et l'email)</label>
            <input value={form.stripe_payment_link} onChange={e => setForm(p => ({ ...p, stripe_payment_link: e.target.value }))} placeholder="https://buy.stripe.com/…" className={inputCls} style={inputStyle} />
          </div>
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={saving}
            className="px-5 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-50"
            style={{ background: '#F4521E' }}>
            {saving ? 'Sauvegarde...' : 'Sauvegarder'}
          </button>
          <button type="button" onClick={() => setEditing(null)}
            className="px-5 py-2 rounded-lg text-sm"
            style={{ border: '1px solid #E5E7EB', color: '#6B7280', background: '#fff' }}>
            Annuler
          </button>
        </div>
      </form>
    </div>
  )

  const totalEncaisse = factures.filter(f => f.statut === 'payee').reduce((s, f) => s + f.montant_ttc, 0)

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold" style={{ color: '#111827' }}>Factures</h1>
          <p className="text-sm mt-0.5" style={{ color: '#9CA3AF' }}>
            {factures.length} facture(s) ·{' '}
            <span style={{ color: '#10B981', fontWeight: 600 }}>{totalEncaisse.toFixed(0)} € encaissés</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <a href="https://app.pennylane.com" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            style={{ border: '1px solid #E5E7EB', color: '#6B7280' }}>
            Pennylane <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <button onClick={() => open()}
            className="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg text-white"
            style={{ background: '#F4521E' }}>
            <Plus className="w-4 h-4" /> Nouvelle facture
          </button>
        </div>
      </div>

      <div className="rounded-xl overflow-hidden" style={{ background: '#fff', border: '1px solid #E9ECEF' }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: '1px solid #F3F4F6', background: '#F9FAFB' }}>
              {['Numéro', 'Client', 'Montant TTC', 'Statut', 'Échéance', 'Actions'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: '#9CA3AF' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {factures.length === 0 && (
              <tr><td colSpan={6} className="text-center py-12 text-sm" style={{ color: '#9CA3AF' }}>Aucune facture</td></tr>
            )}
            {factures.map((f, i) => (
              <tr key={f.id} style={{ borderBottom: i < factures.length - 1 ? '1px solid #F3F4F6' : 'none' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#FAFAFA'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                <td className="px-4 py-3 font-mono text-xs font-semibold" style={{ color: '#374151' }}>{f.numero}</td>
                <td className="px-4 py-3">
                  <p className="font-medium" style={{ color: '#111827' }}>{f.client_nom}</p>
                  <p className="text-xs" style={{ color: '#9CA3AF' }}>{f.client_email}</p>
                </td>
                <td className="px-4 py-3 font-semibold" style={{ color: '#111827' }}>{f.montant_ttc.toFixed(2)} €</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${COLORS[f.statut]}`}>{f.statut}</span>
                </td>
                <td className="px-4 py-3 text-xs" style={{ color: '#9CA3AF' }}>{f.date_echeance || '—'}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    {[
                      ...(f.statut !== 'payee' && f.statut !== 'annulee'
                        ? [{ icon: CheckCircle2, onClick: () => facturesService.update(f.id, { statut: 'payee' }).then(load), hoverBg: '#F0FDF4', hoverColor: '#16A34A' }]
                        : []),
                      { icon: Download, onClick: () => genererFacturePdf(f), hoverBg: 'rgba(244,82,30,.08)', hoverColor: '#F4521E' },
                      { icon: Pencil, onClick: () => open(f), hoverBg: '#F3F4F6', hoverColor: '#374151' },
                      { icon: Send, onClick: () => sendEmail(f), hoverBg: '#EFF6FF', hoverColor: '#3B82F6' },
                      { icon: Trash2, onClick: () => facturesService.delete(f.id).then(load), hoverBg: '#FEF2F2', hoverColor: '#EF4444' },
                    ].map(({ icon: Icon, onClick, hoverBg, hoverColor }, idx) => (
                      <button key={idx} onClick={onClick} className="p-1.5 rounded-md transition-colors" style={{ color: '#9CA3AF' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = hoverBg; (e.currentTarget as HTMLElement).style.color = hoverColor }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#9CA3AF' }}>
                        <Icon className="w-3.5 h-3.5" />
                      </button>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
