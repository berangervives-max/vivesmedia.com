'use client'
import { useState, useEffect } from 'react'
import { temoignagesService } from '@/services/supabase.service'
import type { Temoignage } from '@/types'
import { Plus, Pencil, Trash2, Star } from 'lucide-react'

const EMPTY: Omit<Temoignage, 'id' | 'created_at'> = { nom: '', entreprise: '', texte: '', note: 5, actif: true }

const inputCls = "w-full px-3 py-2 rounded-lg text-sm outline-none"
const inputStyle = { border: '1px solid #E5E7EB', background: '#fff', color: '#111827' }
const labelCls = "text-xs font-semibold block mb-1.5 uppercase tracking-wide"

export default function CmsTemoignagesPage() {
  const [items, setItems] = useState<Temoignage[]>([])
  const [editing, setEditing] = useState<string | null>(null)
  const [form, setForm] = useState<Omit<Temoignage, 'id' | 'created_at'>>({ ...EMPTY })
  const [saving, setSaving] = useState(false)

  const load = () => temoignagesService.getAll().then(setItems).catch(() => {})
  useEffect(() => { load() }, [])
  const open = (t?: Temoignage) => {
    setEditing(t?.id || 'new')
    setForm(t ? { nom: t.nom, entreprise: t.entreprise || '', texte: t.texte, note: t.note, actif: t.actif } : { ...EMPTY })
  }
  const save = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true)
    try {
      if (editing === 'new') await temoignagesService.create(form)
      else if (editing) await temoignagesService.update(editing, form)
      setEditing(null); load()
    } catch (err: any) { alert(err.message) }
    finally { setSaving(false) }
  }

  if (editing) return (
    <div>
      <div className="mb-6">
        <button onClick={() => setEditing(null)} className="text-xs mb-2 flex items-center gap-1" style={{ color: '#9CA3AF' }}>← Retour aux témoignages</button>
        <h1 className="text-xl font-bold" style={{ color: '#111827' }}>{editing === 'new' ? 'Nouveau témoignage' : 'Modifier'}</h1>
      </div>
      <form onSubmit={save} className="rounded-xl p-5 space-y-4 max-w-xl" style={{ background: '#fff', border: '1px solid #E9ECEF' }}>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls} style={{ color: '#6B7280' }}>Nom *</label>
            <input required value={form.nom} onChange={e => setForm(p => ({ ...p, nom: e.target.value }))} className={inputCls} style={inputStyle} />
          </div>
          <div>
            <label className={labelCls} style={{ color: '#6B7280' }}>Entreprise</label>
            <input value={form.entreprise} onChange={e => setForm(p => ({ ...p, entreprise: e.target.value }))} className={inputCls} style={inputStyle} />
          </div>
        </div>
        <div>
          <label className={labelCls} style={{ color: '#6B7280' }}>Témoignage *</label>
          <textarea required value={form.texte} onChange={e => setForm(p => ({ ...p, texte: e.target.value }))} rows={4}
            className={`${inputCls} resize-none`} style={inputStyle} />
        </div>
        <div>
          <label className={labelCls} style={{ color: '#6B7280' }}>Note</label>
          <div className="flex gap-1 mt-1">
            {[1,2,3,4,5].map(n => (
              <button key={n} type="button" onClick={() => setForm(p => ({ ...p, note: n }))}>
                <Star className={`w-6 h-6 ${form.note >= n ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'}`} />
              </button>
            ))}
          </div>
        </div>
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" checked={form.actif} onChange={e => setForm(p => ({ ...p, actif: e.target.checked }))} className="w-4 h-4 rounded accent-orange-500" />
          <span className="text-sm font-medium" style={{ color: '#374151' }}>Visible sur le site public</span>
        </label>
        <div className="flex gap-3 pt-1">
          <button type="submit" disabled={saving} className="px-5 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-50" style={{ background: '#F4521E' }}>
            {saving ? '...' : 'Sauvegarder'}
          </button>
          <button type="button" onClick={() => setEditing(null)} className="px-5 py-2 rounded-lg text-sm" style={{ border: '1px solid #E5E7EB', color: '#6B7280' }}>
            Annuler
          </button>
        </div>
      </form>
    </div>
  )

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold" style={{ color: '#111827' }}>Témoignages</h1>
          <p className="text-sm mt-0.5" style={{ color: '#9CA3AF' }}>{items.length} témoignage(s)</p>
        </div>
        <button onClick={() => open()} className="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg text-white" style={{ background: '#F4521E' }}>
          <Plus className="w-4 h-4" /> Nouveau
        </button>
      </div>

      {items.length === 0 && (
        <div className="rounded-xl p-12 text-center text-sm" style={{ background: '#fff', border: '1px solid #E9ECEF', color: '#9CA3AF' }}>Aucun témoignage</div>
      )}
      <div className="grid md:grid-cols-2 gap-4">
        {items.map(t => (
          <div key={t.id} className="rounded-xl p-5" style={{ background: '#fff', border: '1px solid #E9ECEF' }}>
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
                  style={{ background: '#0F172A' }}>
                  {t.nom.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-sm" style={{ color: '#111827' }}>{t.nom}</p>
                  <p className="text-xs" style={{ color: '#9CA3AF' }}>{t.entreprise}</p>
                </div>
              </div>
              <div className="flex gap-1">
                <button onClick={() => open(t)} className="p-1.5 rounded-md" style={{ color: '#9CA3AF' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#F3F4F6'; (e.currentTarget as HTMLElement).style.color = '#374151' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#9CA3AF' }}>
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => temoignagesService.delete(t.id).then(load)} className="p-1.5 rounded-md" style={{ color: '#9CA3AF' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#FEF2F2'; (e.currentTarget as HTMLElement).style.color = '#EF4444' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#9CA3AF' }}>
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <div className="flex gap-0.5 mb-3">
              {[1,2,3,4,5].map(n => <Star key={n} className={`w-3.5 h-3.5 ${t.note >= n ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-200'}`} />)}
            </div>
            <p className="text-sm leading-relaxed line-clamp-3" style={{ color: '#6B7280' }}>{t.texte}</p>
            <div className="mt-3">
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${t.actif ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                {t.actif ? 'Actif' : 'Inactif'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
