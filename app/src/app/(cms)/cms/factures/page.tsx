'use client'
import { useState, useEffect } from 'react'
import { facturesService } from '@/services/supabase.service'
import { sendFacture } from '@/services/email.service'
import type { Facture, FactureLigne } from '@/types'
import { Plus, Trash2, Send, Pencil } from 'lucide-react'

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

function nextNumero(factures: Facture[]) {
  const y = new Date().getFullYear()
  const nums = factures.filter(f => f.numero?.startsWith(`VM-${y}-`)).map(f => parseInt(f.numero.split('-')[2]) || 0)
  return `VM-${y}-${String(nums.length ? Math.max(...nums) + 1 : 1).padStart(3, '0')}`
}

const EMPTY_LIGNE: FactureLigne = { description: '', quantite: 1, prix_unitaire: 0 }
const EMPTY = (factures: Facture[]): Omit<Facture, 'id' | 'created_at' | 'updated_at'> => ({
  numero: nextNumero(factures), client_nom: '', client_email: '', client_adresse: '', client_siret: '',
  date_emission: new Date().toISOString().slice(0, 10),
  date_echeance: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
  lignes: [{ ...EMPTY_LIGNE }], remise: 0, tva_taux: 20,
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
    setForm(f ? { numero: f.numero, client_nom: f.client_nom, client_email: f.client_email || '', client_adresse: f.client_adresse || '', client_siret: f.client_siret || '', date_emission: f.date_emission, date_echeance: f.date_echeance || '', lignes: f.lignes, remise: f.remise, tva_taux: f.tva_taux, montant_ht: f.montant_ht, montant_tva: f.montant_tva, montant_ttc: f.montant_ttc, statut: f.statut, notes: f.notes || '' } : EMPTY(factures))
  }

  const setLigne = (i: number, k: keyof FactureLigne, v: string | number) => {
    const lignes = [...form.lignes]; lignes[i] = { ...lignes[i], [k]: v }
    const totaux = calcTotaux(lignes, form.remise, form.tva_taux)
    setForm(p => ({ ...p, lignes, ...totaux }))
  }

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
          {/* Totaux */}
          <div className="mt-5 pt-4 text-right space-y-1 text-sm" style={{ borderTop: '1px solid #F3F4F6' }}>
            <p style={{ color: '#6B7280' }}>HT : <strong>{form.montant_ht.toFixed(2)} €</strong></p>
            <p style={{ color: '#6B7280' }}>TVA ({form.tva_taux}%) : <strong>{form.montant_tva.toFixed(2)} €</strong></p>
            <p className="text-lg font-bold" style={{ color: '#111827' }}>TTC : {form.montant_ttc.toFixed(2)} €</p>
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
        <button onClick={() => open()}
          className="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg text-white"
          style={{ background: '#F4521E' }}>
          <Plus className="w-4 h-4" /> Nouvelle facture
        </button>
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
