'use client'
import { useState, useEffect } from 'react'
import { realisationsService } from '@/services/supabase.service'
import { createClient } from '@/lib/supabase'
import type { Realisation } from '@/types'
import { Plus, Pencil, Trash2, Eye, EyeOff, Briefcase, X, Upload } from 'lucide-react'
import Kpis from '@/components/cms/Kpis'

type Form = Omit<Realisation, 'id' | 'created_at' | 'updated_at'>

const EMPTY: Form = {
  slug: '', name: '', type: '', year: new Date().getFullYear().toString(), tags: [],
  hero_image: '', live_url: '', intro: '', context_client: '', context_problem: '',
  solution: [], results: [], gallery: [], stack: [], services: [], publie: false, ordre: 0,
}

function toSlug(s: string) {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

const inputCls = "w-full px-3 py-2 rounded-lg text-sm outline-none"
const inputStyle = { border: '1px solid var(--cms-border-2)', background: 'var(--cms-card)', color: 'var(--cms-ink)' }
const labelCls = "text-xs font-semibold block mb-1.5 uppercase tracking-wide"

/** Upload un fichier vers le bucket Supabase `realisations` et renvoie l'URL publique. */
async function uploadToBucket(file: File, slug: string): Promise<string> {
  const sb = createClient()
  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase()
  const path = `${slug || 'rea'}/${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${ext}`
  const { error } = await sb.storage.from('realisations').upload(path, file, { cacheControl: '3600', upsert: false })
  if (error) throw error
  return sb.storage.from('realisations').getPublicUrl(path).data.publicUrl
}

export default function CmsRealisationsPage() {
  const [items, setItems] = useState<Realisation[]>([])
  const [editing, setEditing] = useState<string | null>(null)
  const [form, setForm] = useState<Form>({ ...EMPTY })
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState<string | null>(null)

  const load = () => realisationsService.getAll().then(setItems).catch(() => {})
  useEffect(() => { load() }, [])

  const set = <K extends keyof Form>(k: K, v: Form[K]) => setForm(p => ({ ...p, [k]: v }))

  const open = (r?: Realisation) => {
    setEditing(r?.id || 'new')
    setForm(r ? {
      slug: r.slug, name: r.name, type: r.type || '', year: r.year || '', tags: r.tags || [],
      hero_image: r.hero_image || '', live_url: r.live_url || '', intro: r.intro || '',
      context_client: r.context_client || '', context_problem: r.context_problem || '',
      solution: r.solution || [], results: r.results || [], gallery: r.gallery || [],
      stack: r.stack || [], services: r.services || [], publie: r.publie, ordre: r.ordre ?? 0,
    } : { ...EMPTY })
  }

  const save = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true)
    try {
      if (editing === 'new') await realisationsService.create(form)
      else if (editing) await realisationsService.update(editing, form)
      setEditing(null); load()
    } catch (err: any) { alert(err.message) }
    finally { setSaving(false) }
  }

  const toggle = async (r: Realisation) => { await realisationsService.update(r.id, { publie: !r.publie }); load() }

  const onUploadHero = async (file?: File) => {
    if (!file) return
    setUploading('hero')
    try { set('hero_image', await uploadToBucket(file, form.slug)) }
    catch (err: any) { alert('Upload échoué : ' + err.message) }
    finally { setUploading(null) }
  }

  const onUploadGallery = async (file?: File) => {
    if (!file) return
    setUploading('gallery')
    try {
      const src = await uploadToBucket(file, form.slug)
      set('gallery', [...form.gallery, { src, caption: '', mobile: false }])
    } catch (err: any) { alert('Upload échoué : ' + err.message) }
    finally { setUploading(null) }
  }

  // Image « avant » d'un visuel (active le slider avant/après sur la page publique)
  const onUploadBefore = async (i: number, file?: File) => {
    if (!file) return
    setUploading(`before-${i}`)
    try {
      const before = await uploadToBucket(file, form.slug)
      set('gallery', form.gallery.map((x, j) => j === i ? { ...x, before } : x))
    } catch (err: any) { alert('Upload échoué : ' + err.message) }
    finally { setUploading(null) }
  }

  // ── FORMULAIRE ──
  if (editing) return (
    <div>
      <div className="mb-6">
        <button onClick={() => setEditing(null)} className="text-xs mb-2 flex items-center gap-1" style={{ color: 'var(--cms-muted)' }}>← Retour aux réalisations</button>
        <h1 className="text-xl font-bold" style={{ color: 'var(--cms-ink)' }}>{editing === 'new' ? 'Nouvelle réalisation' : 'Modifier la réalisation'}</h1>
      </div>
      <form onSubmit={save} className="space-y-4 max-w-3xl">

        {/* Infos principales */}
        <div className="rounded-xl p-5 space-y-4" style={{ background: 'var(--cms-card)', border: '1px solid var(--cms-border)' }}>
          <div>
            <label className={labelCls} style={{ color: 'var(--cms-ink-2)' }}>Nom du projet *</label>
            <input required value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value, slug: editing === 'new' ? toSlug(e.target.value) : p.slug }))}
              className={inputCls} style={inputStyle} />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className={labelCls} style={{ color: 'var(--cms-ink-2)' }}>Slug</label>
              <input value={form.slug} onChange={e => set('slug', e.target.value)} className={`${inputCls} font-mono`} style={{ ...inputStyle, fontSize: '12px', background: 'var(--cms-surface-2)' }} />
            </div>
            <div>
              <label className={labelCls} style={{ color: 'var(--cms-ink-2)' }}>Année</label>
              <input value={form.year} onChange={e => set('year', e.target.value)} className={inputCls} style={inputStyle} />
            </div>
          </div>
          <div>
            <label className={labelCls} style={{ color: 'var(--cms-ink-2)' }}>Type (ex: Site Vitrine · Club Padel)</label>
            <input value={form.type} onChange={e => set('type', e.target.value)} className={inputCls} style={inputStyle} />
          </div>
          <div>
            <label className={labelCls} style={{ color: 'var(--cms-ink-2)' }}>Tags (séparés par des virgules)</label>
            <input value={form.tags.join(', ')} onChange={e => set('tags', e.target.value.split(',').map(t => t.trim()).filter(Boolean))} className={inputCls} style={inputStyle} />
          </div>
          <div>
            <label className={labelCls} style={{ color: 'var(--cms-ink-2)' }}>Lien vers le site (live)</label>
            <input value={form.live_url} onChange={e => set('live_url', e.target.value)} placeholder="https://…" className={inputCls} style={inputStyle} />
          </div>
          <div>
            <label className={labelCls} style={{ color: 'var(--cms-ink-2)' }}>Intro (résumé du projet)</label>
            <textarea value={form.intro} onChange={e => set('intro', e.target.value)} rows={3} className={`${inputCls} resize-none`} style={inputStyle} />
          </div>
        </div>

        {/* Image héro */}
        <div className="rounded-xl p-5 space-y-3" style={{ background: 'var(--cms-card)', border: '1px solid var(--cms-border)' }}>
          <label className={labelCls} style={{ color: 'var(--cms-ink-2)' }}>Image principale (héro)</label>
          {form.hero_image && <img src={form.hero_image} alt="" className="w-full max-w-sm rounded-lg border" style={{ borderColor: 'var(--cms-border-2)' }} />}
          <div className="flex items-center gap-3">
            <label className="inline-flex items-center gap-2 text-sm px-3 py-2 rounded-lg cursor-pointer" style={{ border: '1px solid var(--cms-border-2)', color: 'var(--cms-ink-2)' }}>
              <Upload className="w-4 h-4" /> {uploading === 'hero' ? 'Envoi…' : 'Choisir un fichier'}
              <input type="file" accept="image/*" className="hidden" onChange={e => onUploadHero(e.target.files?.[0])} />
            </label>
            <input value={form.hero_image} onChange={e => set('hero_image', e.target.value)} placeholder="…ou coller une URL" className={inputCls} style={inputStyle} />
          </div>
        </div>

        {/* Contexte */}
        <div className="rounded-xl p-5 space-y-4" style={{ background: 'var(--cms-card)', border: '1px solid var(--cms-border)' }}>
          <p className="text-sm font-bold" style={{ color: 'var(--cms-ink)' }}>Contexte</p>
          <div>
            <label className={labelCls} style={{ color: 'var(--cms-ink-2)' }}>Le client</label>
            <textarea value={form.context_client} onChange={e => set('context_client', e.target.value)} rows={2} className={`${inputCls} resize-none`} style={inputStyle} />
          </div>
          <div>
            <label className={labelCls} style={{ color: 'var(--cms-ink-2)' }}>Le problème</label>
            <textarea value={form.context_problem} onChange={e => set('context_problem', e.target.value)} rows={2} className={`${inputCls} resize-none`} style={inputStyle} />
          </div>
        </div>

        {/* Solution (liste dynamique) */}
        <div className="rounded-xl p-5 space-y-3" style={{ background: 'var(--cms-card)', border: '1px solid var(--cms-border)' }}>
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold" style={{ color: 'var(--cms-ink)' }}>Solution — ce qui a été conçu</p>
            <button type="button" onClick={() => set('solution', [...form.solution, { title: '', desc: '' }])} className="text-xs flex items-center gap-1" style={{ color: 'var(--cms-brand)' }}><Plus className="w-3 h-3" /> Ajouter</button>
          </div>
          {form.solution.map((s, i) => (
            <div key={i} className="flex gap-2 items-start p-3 rounded-lg" style={{ background: 'var(--cms-surface-2)' }}>
              <div className="flex-1 space-y-2">
                <input value={s.title} onChange={e => set('solution', form.solution.map((x, j) => j === i ? { ...x, title: e.target.value } : x))} placeholder="Titre" className={inputCls} style={inputStyle} />
                <textarea value={s.desc} onChange={e => set('solution', form.solution.map((x, j) => j === i ? { ...x, desc: e.target.value } : x))} placeholder="Description" rows={2} className={`${inputCls} resize-none`} style={inputStyle} />
              </div>
              <button type="button" onClick={() => set('solution', form.solution.filter((_, j) => j !== i))} className="p-1.5 rounded-md" style={{ color: 'var(--cms-muted)' }}><X className="w-4 h-4" /></button>
            </div>
          ))}
        </div>

        {/* Résultats (liste dynamique) */}
        <div className="rounded-xl p-5 space-y-3" style={{ background: 'var(--cms-card)', border: '1px solid var(--cms-border)' }}>
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold" style={{ color: 'var(--cms-ink)' }}>Résultats — chiffres clés</p>
            <button type="button" onClick={() => set('results', [...form.results, { value: '', label: '' }])} className="text-xs flex items-center gap-1" style={{ color: 'var(--cms-brand)' }}><Plus className="w-3 h-3" /> Ajouter</button>
          </div>
          {form.results.map((s, i) => (
            <div key={i} className="flex gap-2 items-center p-3 rounded-lg" style={{ background: 'var(--cms-surface-2)' }}>
              <input value={s.value} onChange={e => set('results', form.results.map((x, j) => j === i ? { ...x, value: e.target.value } : x))} placeholder="Valeur (ex: +60%)" className={`${inputCls} max-w-[140px]`} style={inputStyle} />
              <input value={s.label} onChange={e => set('results', form.results.map((x, j) => j === i ? { ...x, label: e.target.value } : x))} placeholder="Libellé" className={inputCls} style={inputStyle} />
              <button type="button" onClick={() => set('results', form.results.filter((_, j) => j !== i))} className="p-1.5 rounded-md shrink-0" style={{ color: 'var(--cms-muted)' }}><X className="w-4 h-4" /></button>
            </div>
          ))}
        </div>

        {/* Galerie (uploads) */}
        <div className="rounded-xl p-5 space-y-3" style={{ background: 'var(--cms-card)', border: '1px solid var(--cms-border)' }}>
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold" style={{ color: 'var(--cms-ink)' }}>Galerie</p>
            <label className="text-xs flex items-center gap-1 cursor-pointer" style={{ color: 'var(--cms-brand)' }}>
              <Upload className="w-3 h-3" /> {uploading === 'gallery' ? 'Envoi…' : 'Ajouter une image'}
              <input type="file" accept="image/*" className="hidden" onChange={e => onUploadGallery(e.target.files?.[0])} />
            </label>
          </div>
          {form.gallery.map((g, i) => (
            <div key={i} className="p-3 rounded-lg space-y-2" style={{ background: 'var(--cms-surface-2)' }}>
              <div className="flex gap-3 items-center">
                <img src={g.src} alt="" className="w-16 h-12 object-cover rounded-md shrink-0 border" style={{ borderColor: 'var(--cms-border-2)' }} />
                <input value={g.caption} onChange={e => set('gallery', form.gallery.map((x, j) => j === i ? { ...x, caption: e.target.value } : x))} placeholder="Légende" className={inputCls} style={inputStyle} />
                <label className="flex items-center gap-1.5 text-xs shrink-0 cursor-pointer" style={{ color: 'var(--cms-ink-2)' }}>
                  <input type="checkbox" checked={!!g.mobile} onChange={e => set('gallery', form.gallery.map((x, j) => j === i ? { ...x, mobile: e.target.checked } : x))} className="w-3.5 h-3.5 accent-orange-500" /> mobile
                </label>
                <button type="button" onClick={() => set('gallery', form.gallery.filter((_, j) => j !== i))} className="p-1.5 rounded-md shrink-0" style={{ color: 'var(--cms-muted)' }}><X className="w-4 h-4" /></button>
              </div>
              <textarea value={g.rationale || ''} onChange={e => set('gallery', form.gallery.map((x, j) => j === i ? { ...x, rationale: e.target.value } : x))} placeholder="Pourquoi ce choix ? (légende « rationale », optionnel)" rows={2} className={`${inputCls} resize-none`} style={inputStyle} />
              <div className="flex items-center gap-3">
                {g.before
                  ? <img src={g.before} alt="avant" className="w-16 h-12 object-cover rounded-md shrink-0 border" style={{ borderColor: 'var(--cms-border-2)' }} />
                  : <span className="text-xs shrink-0" style={{ color: 'var(--cms-muted)' }}>Image « avant » :</span>}
                <label className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg cursor-pointer" style={{ border: '1px solid var(--cms-border-2)', color: 'var(--cms-ink-2)' }}>
                  <Upload className="w-3.5 h-3.5" /> {uploading === `before-${i}` ? 'Envoi…' : g.before ? 'Remplacer l\'avant' : 'Ajouter un avant/après'}
                  <input type="file" accept="image/*" className="hidden" onChange={e => onUploadBefore(i, e.target.files?.[0])} />
                </label>
                {g.before && <button type="button" onClick={() => set('gallery', form.gallery.map((x, j) => j === i ? { ...x, before: undefined } : x))} className="text-xs" style={{ color: 'var(--cms-muted)' }}>retirer</button>}
              </div>
            </div>
          ))}
        </div>

        {/* Stack + Services */}
        <div className="rounded-xl p-5 space-y-4" style={{ background: 'var(--cms-card)', border: '1px solid var(--cms-border)' }}>
          <div>
            <label className={labelCls} style={{ color: 'var(--cms-ink-2)' }}>Stack technique (séparée par des virgules)</label>
            <input value={form.stack.join(', ')} onChange={e => set('stack', e.target.value.split(',').map(t => t.trim()).filter(Boolean))} className={inputCls} style={inputStyle} />
          </div>
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold" style={{ color: 'var(--cms-ink)' }}>Services liés</p>
            <button type="button" onClick={() => set('services', [...form.services, { label: '', href: '' }])} className="text-xs flex items-center gap-1" style={{ color: 'var(--cms-brand)' }}><Plus className="w-3 h-3" /> Ajouter</button>
          </div>
          {form.services.map((s, i) => (
            <div key={i} className="flex gap-2 items-center p-3 rounded-lg" style={{ background: 'var(--cms-surface-2)' }}>
              <input value={s.label} onChange={e => set('services', form.services.map((x, j) => j === i ? { ...x, label: e.target.value } : x))} placeholder="Libellé (ex: Site Vitrine)" className={inputCls} style={inputStyle} />
              <input value={s.href} onChange={e => set('services', form.services.map((x, j) => j === i ? { ...x, href: e.target.value } : x))} placeholder="/services/site-vitrine" className={`${inputCls} font-mono`} style={{ ...inputStyle, fontSize: '12px' }} />
              <button type="button" onClick={() => set('services', form.services.filter((_, j) => j !== i))} className="p-1.5 rounded-md shrink-0" style={{ color: 'var(--cms-muted)' }}><X className="w-4 h-4" /></button>
            </div>
          ))}
        </div>

        {/* Publication */}
        <div className="rounded-xl p-5 space-y-4" style={{ background: 'var(--cms-card)', border: '1px solid var(--cms-border)' }}>
          <div className="grid md:grid-cols-2 gap-4 items-end">
            <div>
              <label className={labelCls} style={{ color: 'var(--cms-ink-2)' }}>Ordre d'affichage</label>
              <input type="number" value={form.ordre} onChange={e => set('ordre', Number(e.target.value))} className={inputCls} style={inputStyle} />
            </div>
            <label className="flex items-center gap-3 cursor-pointer pb-2">
              <input type="checkbox" checked={form.publie} onChange={e => set('publie', e.target.checked)} className="w-4 h-4 rounded accent-orange-500" />
              <span className="text-sm font-medium" style={{ color: 'var(--cms-ink-2)' }}>Publié (visible sur le site)</span>
            </label>
          </div>
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={saving} className="px-5 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-50" style={{ background: 'var(--cms-brand)' }}>
            {saving ? 'Sauvegarde...' : 'Sauvegarder'}
          </button>
          <button type="button" onClick={() => setEditing(null)} className="px-5 py-2 rounded-lg text-sm" style={{ border: '1px solid var(--cms-border-2)', color: 'var(--cms-ink-2)' }}>
            Annuler
          </button>
        </div>
      </form>
    </div>
  )

  // ── LISTE ──
  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="cms-eyebrow">Marketing</p>
          <h1 className="text-2xl font-bold tracking-tight mt-1" style={{ color: 'var(--cms-ink)' }}>Réalisations</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--cms-muted)' }}>
            {items.length} réalisation(s) · {items.filter(a => a.publie).length} publiée(s)
            <span className="ml-1">— les projets historiques restent gérés dans le code</span>
          </p>
        </div>
        <button onClick={() => open()} className="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg text-white" style={{ background: 'var(--cms-brand)' }}>
          <Plus className="w-4 h-4" /> Nouvelle réalisation
        </button>
      </div>

      <Kpis items={[
        { label: 'Total en base', value: items.length, icon: Briefcase, color: 'var(--cms-brand)' },
        { label: 'En ligne', value: items.filter(r => r.publie).length, icon: Eye, color: 'var(--cms-ok-fg)', hint: 'visibles sur le site' },
        { label: 'Brouillons', value: items.filter(r => !r.publie).length, icon: EyeOff, color: 'var(--cms-muted)', hint: 'non publiés' },
      ]} />

      {items.length === 0 && (
        <div className="rounded-xl p-12 text-center text-sm" style={{ background: 'var(--cms-card)', border: '1px solid var(--cms-border)', color: 'var(--cms-muted)' }}>
          Aucune réalisation en base pour l'instant
        </div>
      )}
      <div className="space-y-2">
        {items.map(r => (
          <div key={r.id} className="flex items-center gap-4 p-4 rounded-xl" style={{ background: 'var(--cms-card)', border: '1px solid var(--cms-border)' }}>
            {r.hero_image ? (
              <img src={r.hero_image} alt={r.name} className="w-14 h-10 object-cover rounded-lg shrink-0" />
            ) : (
              <div className="w-14 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'var(--cms-surface-2)' }}>
                <Briefcase className="w-4 h-4" style={{ color: 'var(--cms-muted)' }} />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate" style={{ color: 'var(--cms-ink)' }}>{r.name}</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--cms-muted)' }}>{r.type}{r.type && r.year ? ' · ' : ''}{r.year}</p>
            </div>
            <span className="cms-badge shrink-0" style={r.publie ? { background: 'var(--cms-ok-bg)', color: 'var(--cms-ok-fg)' } : { background: 'var(--cms-surface-2)', color: 'var(--cms-muted)' }}>
              {r.publie ? 'Publié' : 'Brouillon'}
            </span>
            <div className="flex gap-1 shrink-0">
              <button onClick={() => toggle(r)} className="p-1.5 rounded-md" style={{ color: 'var(--cms-muted)' }} title={r.publie ? 'Dépublier' : 'Publier'}>
                {r.publie ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
              <button onClick={() => open(r)} className="p-1.5 rounded-md" style={{ color: 'var(--cms-muted)' }}>
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => { if (confirm('Supprimer cette réalisation ?')) realisationsService.delete(r.id).then(load) }} className="p-1.5 rounded-md" style={{ color: 'var(--cms-muted)' }}>
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
