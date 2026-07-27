'use client'
import { useState, useEffect } from 'react'
import { temoignagesService } from '@/services/supabase.service'
import type { Temoignage } from '@/types'
import { Plus, Pencil, Trash2, Star, ExternalLink, MessageSquarePlus, Eye, EyeOff, MessageSquare, ArrowLeft } from 'lucide-react'
import Kpis from '@/components/cms/Kpis'

function getGoogleReviewUrl(): string {
  try { const raw = localStorage.getItem('vivesmedia-cms-settings'); if (raw) return JSON.parse(raw).googleReviewUrl || '' } catch { /* pas de settings */ }
  return ''
}
function demanderAvisGoogle() {
  const url = getGoogleReviewUrl()
  if (!url) { alert('Ajoute d\'abord ton lien Google Reviews dans Paramètres → Liens connectés.'); return }
  const sujet = encodeURIComponent('Un petit avis sur notre collaboration ? ⭐')
  const corps = encodeURIComponent(`Bonjour,\n\nJ'espère que votre site vous donne entière satisfaction !\n\nSi vous avez 2 minutes, un avis Google m'aiderait énormément à développer mon activité :\n${url}\n\nMerci beaucoup,\nBéranger Vives · vivesmedia.com`)
  window.open(`mailto:?subject=${sujet}&body=${corps}`)
}

const EMPTY: Omit<Temoignage, 'id' | 'created_at'> = { nom: '', entreprise: '', texte: '', note: 5, actif: true }
const labelCls = "text-xs font-semibold block mb-1.5 uppercase tracking-wide"

export default function CmsTemoignagesPage() {
  const [items, setItems] = useState<Temoignage[]>([])
  const [editing, setEditing] = useState<string | null>(null)
  const [form, setForm] = useState<Omit<Temoignage, 'id' | 'created_at'>>({ ...EMPTY })
  const [saving, setSaving] = useState(false)

  const load = () => temoignagesService.getAll().then(setItems).catch(() => {})
  useEffect(() => { load() }, [])
  const open = (t?: Temoignage) => { setEditing(t?.id || 'new'); setForm(t ? { nom: t.nom, entreprise: t.entreprise || '', texte: t.texte, note: t.note, actif: t.actif } : { ...EMPTY }) }
  const save = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true)
    try { if (editing === 'new') await temoignagesService.create(form); else if (editing) await temoignagesService.update(editing, form); setEditing(null); load() }
    catch (err) { alert(err instanceof Error ? err.message : 'Erreur') } finally { setSaving(false) }
  }

  const inputStyle = { border: '1px solid var(--cms-border-2)', background: 'var(--cms-card)', color: 'var(--cms-ink)' }
  const cardStyle = { background: 'var(--cms-card)', border: '1px solid var(--cms-border)', boxShadow: 'var(--cms-shadow)' }
  const inputCls = "tm-in w-full px-3 py-2 rounded-xl text-sm transition-shadow"
  const StarRow = ({ note, size = 'w-3.5 h-3.5' }: { note: number; size?: string }) => (
    <>{[1, 2, 3, 4, 5].map(n => <Star key={n} className={size} style={{ color: note >= n ? '#F5A623' : 'var(--cms-border-2)', fill: note >= n ? '#F5A623' : 'var(--cms-border-2)' }} />)}</>
  )

  if (editing) return (
    <div>
      <style>{`.tm-in:focus{outline:none;border-color:var(--cms-brand);box-shadow:0 0 0 3px rgb(244 82 30/.18)}`}</style>
      <div className="mb-6">
        <button onClick={() => setEditing(null)} className="text-xs mb-2 flex items-center gap-1" style={{ color: 'var(--cms-muted)' }}><ArrowLeft className="w-3.5 h-3.5" /> Retour aux témoignages</button>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--cms-ink)' }}>{editing === 'new' ? 'Nouveau témoignage' : 'Modifier'}</h1>
      </div>
      <form onSubmit={save} className="rounded-2xl p-5 space-y-4 max-w-xl" style={cardStyle}>
        <div className="grid grid-cols-2 gap-4">
          <div><label className={labelCls} style={{ color: 'var(--cms-ink-2)' }}>Nom *</label><input required value={form.nom} onChange={e => setForm(p => ({ ...p, nom: e.target.value }))} className={inputCls} style={inputStyle} /></div>
          <div><label className={labelCls} style={{ color: 'var(--cms-ink-2)' }}>Entreprise</label><input value={form.entreprise} onChange={e => setForm(p => ({ ...p, entreprise: e.target.value }))} className={inputCls} style={inputStyle} /></div>
        </div>
        <div><label className={labelCls} style={{ color: 'var(--cms-ink-2)' }}>Témoignage *</label><textarea required value={form.texte} onChange={e => setForm(p => ({ ...p, texte: e.target.value }))} rows={4} className={`${inputCls} resize-none`} style={inputStyle} /></div>
        <div>
          <label className={labelCls} style={{ color: 'var(--cms-ink-2)' }}>Note</label>
          <div className="flex gap-1 mt-1">
            {[1, 2, 3, 4, 5].map(n => (
              <button key={n} type="button" onClick={() => setForm(p => ({ ...p, note: n }))}>
                <Star className="w-6 h-6" style={{ color: form.note >= n ? '#F5A623' : 'var(--cms-border-2)', fill: form.note >= n ? '#F5A623' : 'var(--cms-border-2)' }} />
              </button>
            ))}
          </div>
        </div>
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" checked={form.actif} onChange={e => setForm(p => ({ ...p, actif: e.target.checked }))} className="w-4 h-4 rounded accent-orange-500" />
          <span className="text-sm font-medium" style={{ color: 'var(--cms-ink-2)' }}>Visible sur le site public</span>
        </label>
        <div className="flex gap-3 pt-1">
          <button type="submit" disabled={saving} className="cms-btn cms-btn-primary disabled:opacity-50">{saving ? '...' : 'Sauvegarder'}</button>
          <button type="button" onClick={() => setEditing(null)} className="cms-btn cms-btn-secondary">Annuler</button>
        </div>
      </form>
    </div>
  )

  return (
    <div>
      <div className="mb-5 flex items-start justify-between gap-3 flex-wrap">
        <div>
          <p className="cms-eyebrow">Marketing</p>
          <h1 className="text-2xl font-bold tracking-tight mt-1" style={{ color: 'var(--cms-ink)' }}>Témoignages</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--cms-muted)' }}>{items.length} témoignage(s)</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={demanderAvisGoogle} className="cms-btn cms-btn-secondary cms-btn-sm" title="Ouvre un email pré-rempli avec ton lien Google Reviews"><MessageSquarePlus className="w-4 h-4" /> Demander un avis</button>
          <button onClick={() => { const url = getGoogleReviewUrl(); if (url) window.open(url.replace('/review', ''), '_blank'); else alert('Ajoute ton lien Google Reviews dans Paramètres → Liens connectés.') }} className="cms-btn cms-btn-secondary cms-btn-sm">Page Google <ExternalLink className="w-3.5 h-3.5" /></button>
          <button onClick={() => open()} className="cms-btn cms-btn-primary"><Plus className="w-4 h-4" /> Nouveau</button>
        </div>
      </div>

      <Kpis items={[
        { label: 'Total', value: items.length, icon: MessageSquare, color: 'var(--cms-brand)' },
        { label: 'Affichés sur le site', value: items.filter(t => t.actif).length, icon: Eye, color: 'var(--cms-ok-fg)' },
        { label: 'En attente', value: items.filter(t => !t.actif).length, icon: EyeOff, color: 'var(--cms-muted)', hint: 'non publiés' },
        { label: 'Note moyenne', value: items.length ? `${(items.reduce((s, t) => s + (t.note || 0), 0) / items.length).toFixed(1)} ★` : '—', icon: Star, color: 'var(--cms-warn-fg)' },
      ]} />

      {items.length === 0 && <div className="rounded-2xl p-12 text-center text-sm" style={{ ...cardStyle, color: 'var(--cms-muted)' }}>Aucun témoignage</div>}
      <div className="grid md:grid-cols-2 gap-4">
        {items.map(t => (
          <div key={t.id} className="rounded-2xl p-5" style={cardStyle}>
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold text-white shrink-0" style={{ background: 'var(--cms-brand)' }}>{t.nom.charAt(0).toUpperCase()}</div>
                <div><p className="font-semibold text-sm" style={{ color: 'var(--cms-ink)' }}>{t.nom}</p><p className="text-xs" style={{ color: 'var(--cms-muted)' }}>{t.entreprise}</p></div>
              </div>
              <div className="flex gap-1">
                <button onClick={() => open(t)} className="p-1.5 rounded-md" style={{ color: 'var(--cms-muted)' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--cms-surface-2)'; (e.currentTarget as HTMLElement).style.color = 'var(--cms-ink)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'var(--cms-muted)' }}><Pencil className="w-3.5 h-3.5" /></button>
                <button onClick={() => temoignagesService.delete(t.id).then(load)} className="p-1.5 rounded-md" style={{ color: 'var(--cms-muted)' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--cms-danger-bg)'; (e.currentTarget as HTMLElement).style.color = 'var(--cms-danger-fg)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'var(--cms-muted)' }}><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </div>
            <div className="flex gap-0.5 mb-3"><StarRow note={t.note} /></div>
            <p className="text-sm leading-relaxed line-clamp-3" style={{ color: 'var(--cms-ink-2)' }}>{t.texte}</p>
            <div className="mt-3"><span className="cms-badge" style={t.actif ? { background: 'var(--cms-ok-bg)', color: 'var(--cms-ok-fg)' } : { background: 'var(--cms-surface-2)', color: 'var(--cms-muted)' }}>{t.actif ? 'Actif' : 'Inactif'}</span></div>
          </div>
        ))}
      </div>
    </div>
  )
}
