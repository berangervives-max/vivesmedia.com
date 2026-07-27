'use client'
import { useState, useEffect } from 'react'
import { facturesService } from '@/services/supabase.service'
import { sendFacture } from '@/services/email.service'
import type { Facture, FactureLigne } from '@/types'
import { Plus, Trash2, Send, Pencil, Download, ExternalLink, CheckCircle2, ArrowLeft } from 'lucide-react'
import { genererFacturePdf } from '@/lib/facture-pdf'

const STATUTS = ['brouillon', 'envoyee', 'payee', 'en_retard', 'annulee'] as const
const ST: Record<string, { bg: string; fg: string; label: string }> = {
  brouillon: { bg: 'var(--cms-surface-2)', fg: 'var(--cms-muted)', label: 'Brouillon' },
  envoyee: { bg: 'var(--cms-info-bg)', fg: 'var(--cms-info-fg)', label: 'Envoyée' },
  payee: { bg: 'var(--cms-ok-bg)', fg: 'var(--cms-ok-fg)', label: 'Payée' },
  en_retard: { bg: 'var(--cms-danger-bg)', fg: 'var(--cms-danger-fg)', label: 'En retard' },
  annulee: { bg: 'var(--cms-surface-2)', fg: 'var(--cms-faint)', label: 'Annulée' },
}

function calcTotaux(lignes: FactureLigne[], remise: number, tva: number) {
  const ht_brut = lignes.reduce((s, l) => s + (l.quantite * l.prix_unitaire), 0)
  const ht = ht_brut * (1 - remise / 100)
  return { montant_ht: ht, montant_tva: ht * (tva / 100), montant_ttc: ht + ht * (tva / 100) }
}

function facturePrefix() {
  try {
    const raw = localStorage.getItem('vivesmedia-cms-settings')
    if (raw) { const p = JSON.parse(raw).prefixeFacture as string | undefined; if (p) return p }
  } catch { /* défaut */ }
  return `VM-${new Date().getFullYear()}-`
}

function nextNumero(factures: Facture[]) {
  const prefix = facturePrefix()
  const nums = factures.filter(f => f.numero?.startsWith(prefix)).map(f => parseInt(f.numero.slice(prefix.length), 10) || 0)
  return `${prefix}${String(nums.length ? Math.max(...nums) + 1 : 1).padStart(3, '0')}`
}

const EMPTY_LIGNE: FactureLigne = { description: '', quantite: 1, prix_unitaire: 0 }
const EMPTY = (factures: Facture[]): Omit<Facture, 'id' | 'created_at' | 'updated_at'> => ({
  numero: nextNumero(factures), client_nom: '', client_email: '', client_adresse: '', client_siret: '',
  date_emission: new Date().toISOString().slice(0, 10),
  date_echeance: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
  lignes: [{ ...EMPTY_LIGNE }], remise: 0, tva_taux: 0, stripe_payment_link: '',
  montant_ht: 0, montant_tva: 0, montant_ttc: 0, statut: 'brouillon', notes: '',
})

const labelCls = "text-xs font-semibold block mb-1.5 uppercase tracking-wide"

export default function CmsFacturesPage() {
  const [factures, setFactures] = useState<Facture[]>([])
  const [editing, setEditing] = useState<string | null>(null)
  const [form, setForm] = useState<Omit<Facture, 'id' | 'created_at' | 'updated_at'>>(EMPTY([]))
  const [saving, setSaving] = useState(false)

  const load = () => facturesService.getAll().then(setFactures).catch(() => {})
  useEffect(() => { load() }, [])

  const inputStyle = { border: '1px solid var(--cms-border-2)', background: 'var(--cms-card)', color: 'var(--cms-ink)' }
  const cardStyle = { background: 'var(--cms-card)', border: '1px solid var(--cms-border)', boxShadow: 'var(--cms-shadow)' }
  const inputCls = "fc-in w-full px-3 py-2 rounded-xl text-sm transition-shadow"

  const open = (f?: Facture) => {
    setEditing(f?.id || 'new')
    setForm(f ? { numero: f.numero, client_nom: f.client_nom, client_email: f.client_email || '', client_adresse: f.client_adresse || '', client_siret: f.client_siret || '', date_emission: f.date_emission, date_echeance: f.date_echeance || '', lignes: f.lignes, remise: f.remise, tva_taux: f.tva_taux, stripe_payment_link: f.stripe_payment_link || '', montant_ht: f.montant_ht, montant_tva: f.montant_tva, montant_ttc: f.montant_ttc, statut: f.statut, notes: f.notes || '' } : EMPTY(factures))
  }
  const setLigne = (i: number, k: keyof FactureLigne, v: string | number) => {
    const lignes = [...form.lignes]; lignes[i] = { ...lignes[i], [k]: v }
    setForm(p => ({ ...p, lignes, ...calcTotaux(lignes, form.remise, form.tva_taux) }))
  }
  const setRemise = (remise: number) => setForm(p => ({ ...p, remise, ...calcTotaux(p.lignes, remise, p.tva_taux) }))
  const setTva = (tva: number) => setForm(p => ({ ...p, tva_taux: tva, ...calcTotaux(p.lignes, p.remise, tva) }))
  const save = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true)
    try {
      if (editing === 'new') await facturesService.create(form)
      else if (editing) await facturesService.update(editing, form)
      setEditing(null); load()
    } catch (err) { alert(err instanceof Error ? err.message : 'Erreur') }
    finally { setSaving(false) }
  }
  const sendEmail = async (f: Facture) => {
    if (!f.client_email) return alert('Pas d\'email client')
    await sendFacture({ client_email: f.client_email, client_nom: f.client_nom, numero: f.numero, montant_ttc: f.montant_ttc, stripe_payment_link: f.stripe_payment_link })
    await facturesService.update(f.id, { statut: 'envoyee' }); load()
    alert('Facture envoyée !')
  }

  const styleTag = <style>{`.fc-in:focus{outline:none;border-color:var(--cms-brand);box-shadow:0 0 0 3px rgb(244 82 30/.18)}`}</style>

  if (editing) return (
    <div>
      {styleTag}
      <div className="mb-6">
        <button onClick={() => setEditing(null)} className="text-xs mb-2 flex items-center gap-1" style={{ color: 'var(--cms-muted)' }}><ArrowLeft className="w-3.5 h-3.5" /> Retour aux factures</button>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--cms-ink)' }}>
          {editing === 'new' ? <>Nouvelle <span className="cms-accent" style={{ color: 'var(--cms-brand)', fontSize: '1.5rem' }}>facture</span></> : 'Modifier la facture'}
        </h1>
      </div>
      <form onSubmit={save} className="space-y-4 max-w-3xl">
        <div className="rounded-2xl p-5" style={cardStyle}>
          <p className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: 'var(--cms-muted)' }}>Informations</p>
          <div className="grid md:grid-cols-2 gap-4">
            {([['Numéro', 'numero'], ['Client', 'client_nom'], ['Email client', 'client_email'], ['Adresse', 'client_adresse'], ['SIRET', 'client_siret'], ['Date émission', 'date_emission'], ['Date échéance', 'date_echeance']] as [string, string][]).map(([label, key]) => (
              <div key={key}>
                <label className={labelCls} style={{ color: 'var(--cms-ink-2)' }}>{label}</label>
                <input type={key.includes('date') ? 'date' : 'text'} value={form[key as keyof typeof form] as string}
                  onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))} className={inputCls} style={inputStyle} />
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl p-5" style={cardStyle}>
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--cms-muted)' }}>Lignes de facturation</p>
            <button type="button" onClick={() => setForm(p => ({ ...p, lignes: [...p.lignes, { ...EMPTY_LIGNE }] }))} className="cms-btn cms-btn-primary cms-btn-sm"><Plus className="w-3.5 h-3.5" /> Ajouter</button>
          </div>
          <div className="grid grid-cols-12 gap-2 mb-2 px-1">
            {['Description', 'Qté', 'Prix unitaire', ''].map((h, i) => (
              <p key={i} className={`text-xs font-semibold uppercase tracking-wide ${i === 0 ? 'col-span-6' : i === 1 ? 'col-span-2' : i === 2 ? 'col-span-3' : 'col-span-1'}`} style={{ color: 'var(--cms-muted)' }}>{h}</p>
            ))}
          </div>
          <div className="space-y-2">
            {form.lignes.map((l, i) => (
              <div key={i} className="grid grid-cols-12 gap-2 items-center">
                <input value={l.description} onChange={e => setLigne(i, 'description', e.target.value)} placeholder="Description" className={`col-span-6 ${inputCls}`} style={inputStyle} />
                <input type="number" value={l.quantite} onChange={e => setLigne(i, 'quantite', Number(e.target.value))} className={`col-span-2 text-center ${inputCls}`} style={inputStyle} />
                <input type="number" value={l.prix_unitaire} onChange={e => setLigne(i, 'prix_unitaire', Number(e.target.value))} className={`col-span-3 ${inputCls}`} style={inputStyle} />
                <button type="button" onClick={() => { const l2 = form.lignes.filter((_, j) => j !== i); setForm(p => ({ ...p, lignes: l2, ...calcTotaux(l2, p.remise, p.tva_taux) })) }}
                  className="col-span-1 flex justify-center p-1.5 rounded-lg" style={{ color: 'var(--cms-muted)' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--cms-danger-fg)'; (e.currentTarget as HTMLElement).style.background = 'var(--cms-danger-bg)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--cms-muted)'; (e.currentTarget as HTMLElement).style.background = 'transparent' }}>
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
          <div className="mt-5 pt-4 grid grid-cols-2 gap-3 max-w-xs ml-auto" style={{ borderTop: '1px solid var(--cms-border)' }}>
            <div><label className={labelCls} style={{ color: 'var(--cms-ink-2)' }}>Remise (%)</label><input type="number" min={0} max={100} value={form.remise} onChange={e => setRemise(Number(e.target.value))} className={inputCls} style={inputStyle} /></div>
            <div><label className={labelCls} style={{ color: 'var(--cms-ink-2)' }}>TVA (%)</label><input type="number" min={0} max={20} value={form.tva_taux} onChange={e => setTva(Number(e.target.value))} className={inputCls} style={inputStyle} /></div>
          </div>
          {form.tva_taux === 0 && <p className="text-right text-[11px] mt-1.5" style={{ color: 'var(--cms-muted)' }}>TVA non applicable, art. 293 B du CGI (franchise en base).</p>}
          <div className="mt-4 pt-4 text-right space-y-1 text-sm" style={{ borderTop: '1px solid var(--cms-border)' }}>
            <p style={{ color: 'var(--cms-ink-2)' }}>HT : <strong style={{ color: 'var(--cms-ink)' }}>{form.montant_ht.toFixed(2)} €</strong></p>
            {form.tva_taux > 0 && <p style={{ color: 'var(--cms-ink-2)' }}>TVA ({form.tva_taux}%) : <strong style={{ color: 'var(--cms-ink)' }}>{form.montant_tva.toFixed(2)} €</strong></p>}
            <p className="text-lg font-bold" style={{ color: 'var(--cms-ink)' }}>{form.tva_taux > 0 ? 'TTC' : 'Total'} : {form.montant_ttc.toFixed(2)} €</p>
          </div>
          <div className="mt-5 pt-4" style={{ borderTop: '1px solid var(--cms-border)' }}>
            <label className={labelCls} style={{ color: 'var(--cms-ink-2)' }}>Lien de paiement Stripe (optionnel — apparaît dans le PDF et l&apos;email)</label>
            <input value={form.stripe_payment_link} onChange={e => setForm(p => ({ ...p, stripe_payment_link: e.target.value }))} placeholder="https://buy.stripe.com/…" className={inputCls} style={inputStyle} />
          </div>
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={saving} className="cms-btn cms-btn-primary disabled:opacity-50">{saving ? 'Sauvegarde...' : 'Sauvegarder'}</button>
          <button type="button" onClick={() => setEditing(null)} className="cms-btn cms-btn-secondary">Annuler</button>
        </div>
      </form>
    </div>
  )

  const totalEncaisse = factures.filter(f => f.statut === 'payee').reduce((s, f) => s + f.montant_ttc, 0)

  return (
    <div>
      <div className="mb-5 flex items-start justify-between gap-3 flex-wrap">
        <div>
          <p className="cms-eyebrow">Ventes</p>
          <h1 className="text-2xl font-bold tracking-tight mt-1" style={{ color: 'var(--cms-ink)' }}>Factures</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--cms-muted)' }}>{factures.length} facture(s) · <b style={{ color: 'var(--cms-ok-fg)' }}>{totalEncaisse.toLocaleString('fr-FR')} € encaissés</b></p>
        </div>
        <div className="flex items-center gap-2">
          <a href="https://app.pennylane.com" target="_blank" rel="noopener noreferrer" className="cms-btn cms-btn-secondary cms-btn-sm">Pennylane <ExternalLink className="w-3.5 h-3.5" /></a>
          <button onClick={() => open()} className="cms-btn cms-btn-primary"><Plus className="w-4 h-4" /> Nouvelle facture</button>
        </div>
      </div>

      <div className="rounded-2xl overflow-x-auto" style={cardStyle}>
        <table className="w-full text-sm" style={{ minWidth: 720 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--cms-border)', background: 'var(--cms-surface-2)' }}>
              {['Numéro', 'Client', 'Montant TTC', 'Statut', 'Échéance', 'Actions'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-[0.7rem] font-semibold uppercase tracking-wider" style={{ color: 'var(--cms-muted)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {factures.length === 0 && <tr><td colSpan={6} className="text-center py-12 text-sm" style={{ color: 'var(--cms-muted)' }}>Aucune facture</td></tr>}
            {factures.map((f, i) => (
              <tr key={f.id} style={{ borderBottom: i < factures.length - 1 ? '1px solid var(--cms-border)' : 'none' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--cms-surface-2)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                <td className="px-4 py-3 font-mono text-xs font-semibold" style={{ color: 'var(--cms-ink-2)' }}>{f.numero}</td>
                <td className="px-4 py-3"><p className="font-medium" style={{ color: 'var(--cms-ink)' }}>{f.client_nom}</p><p className="text-xs" style={{ color: 'var(--cms-muted)' }}>{f.client_email}</p></td>
                <td className="px-4 py-3 font-semibold" style={{ color: 'var(--cms-ink)', fontVariantNumeric: 'tabular-nums' }}>{f.montant_ttc.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €</td>
                <td className="px-4 py-3"><span className="cms-badge" style={{ background: (ST[f.statut] || ST.brouillon).bg, color: (ST[f.statut] || ST.brouillon).fg }}>{(ST[f.statut] || { label: f.statut }).label}</span></td>
                <td className="px-4 py-3 text-xs" style={{ color: 'var(--cms-faint)' }}>{f.date_echeance || '—'}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    {[
                      ...(f.statut !== 'payee' && f.statut !== 'annulee' ? [{ icon: CheckCircle2, onClick: () => facturesService.update(f.id, { statut: 'payee' }).then(load), hb: 'var(--cms-ok-bg)', hc: 'var(--cms-ok-fg)' }] : []),
                      { icon: Download, onClick: () => genererFacturePdf(f), hb: 'var(--cms-brand-wash)', hc: 'var(--cms-brand)' },
                      { icon: Pencil, onClick: () => open(f), hb: 'var(--cms-surface-2)', hc: 'var(--cms-ink)' },
                      { icon: Send, onClick: () => sendEmail(f), hb: 'var(--cms-info-bg)', hc: 'var(--cms-info-fg)' },
                      { icon: Trash2, onClick: () => facturesService.delete(f.id).then(load), hb: 'var(--cms-danger-bg)', hc: 'var(--cms-danger-fg)' },
                    ].map(({ icon: Icon, onClick, hb, hc }, idx) => (
                      <button key={idx} onClick={onClick} className="p-1.5 rounded-md transition-colors" style={{ color: 'var(--cms-muted)' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = hb; (e.currentTarget as HTMLElement).style.color = hc }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'var(--cms-muted)' }}>
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
