'use client'
import { useState, useEffect } from 'react'
import { articlesService } from '@/services/supabase.service'
import { createClient } from '@/lib/supabase'
import type { Article } from '@/types'
import { Plus, Pencil, Trash2, Eye, EyeOff, BookOpen, CalendarClock, Send, Check, Loader2, X, Upload, MousePointerClick } from 'lucide-react'
import Kpis from '@/components/cms/Kpis'

/** Upload une image vers le bucket Supabase `realisations` (dossier articles/) → URL publique. */
async function uploadArticleImage(file: File): Promise<string> {
  const sb = createClient()
  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase()
  const path = `articles/${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${ext}`
  const { error } = await sb.storage.from('realisations').upload(path, file, { cacheControl: '3600', upsert: false })
  if (error) throw error
  return sb.storage.from('realisations').getPublicUrl(path).data.publicUrl
}

const EMPTY: Omit<Article, 'id' | 'created_at' | 'updated_at'> = {
  titre: '', slug: '', extrait: '', contenu: '', categorie: '', tags: '',
  date_pub: new Date().toISOString().slice(0, 10), publie: false, image_url: '', meta_title: '', meta_desc: ''
}

function toSlug(s: string) {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

const STATUS = {
  publie: { label: 'Publié', cls: 'bg-[var(--cms-ok-bg)] text-[var(--cms-ok-fg)]' },
  programme: { label: 'Programmé', cls: 'bg-[var(--cms-warn-bg)] text-[var(--cms-warn-fg)]' },
  brouillon: { label: 'Brouillon', cls: 'bg-[var(--cms-surface-2)] text-[var(--cms-muted)]' },
} as const

// Statut réel : Programmé = date de publication dans le futur (pas encore en ligne) ;
// Publié = en ligne (publie + date passée) ; Brouillon = non publié, sans date future.
function statusOf(a: { publie: boolean; date_pub?: string | null }): keyof typeof STATUS {
  const today = new Date().toISOString().slice(0, 10)
  const d = (a.date_pub || '').slice(0, 10)
  if (d && d > today) return 'programme'
  return a.publie ? 'publie' : 'brouillon'
}

const inputCls = "w-full px-3 py-2 rounded-lg text-sm outline-none"
const inputStyle = { border: '1px solid var(--cms-border-2)', background: 'var(--cms-card)', color: 'var(--cms-ink)' }
const labelCls = "text-xs font-semibold block mb-1.5 uppercase tracking-wide"

export default function CmsArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([])
  const [editing, setEditing] = useState<string | null>(null)
  const [form, setForm] = useState<Omit<Article, 'id' | 'created_at' | 'updated_at'>>({ ...EMPTY })
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [previewHtml, setPreviewHtml] = useState(false)
  const [stats, setStats] = useState<Record<string, { clicks: number; impressions: number; position: number }>>({})

  const onUploadImage = async (file?: File) => {
    if (!file) return
    setUploading(true)
    try { setForm(p => ({ ...p, image_url: '' })); const url = await uploadArticleImage(file); setForm(p => ({ ...p, image_url: url })) }
    catch (err: any) { alert('Upload échoué : ' + err.message) }
    finally { setUploading(false) }
  }

  const load = () => articlesService.getAll().then(setArticles).catch(() => {})
  useEffect(() => {
    load()
    // Stats Search Console par article (clics / impressions / position)
    fetch('/api/cms/article-stats').then(r => r.json()).then(d => setStats(d.stats || {})).catch(() => {})
  }, [])

  const open = (a?: Article) => {
    setEditing(a?.id || 'new')
    setForm(a ? { titre: a.titre, slug: a.slug, extrait: a.extrait || '', contenu: a.contenu || '', categorie: a.categorie || '', tags: a.tags || '', date_pub: a.date_pub || EMPTY.date_pub, publie: a.publie, image_url: a.image_url || '', meta_title: a.meta_title || '', meta_desc: a.meta_desc || '' } : { ...EMPTY })
  }

  const save = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true)
    try {
      if (editing === 'new') await articlesService.create(form)
      else if (editing) await articlesService.update(editing, form)
      if (form.publie) pingIndex(form.slug)
      setEditing(null); load()
    } catch (err: any) { alert(err.message) }
    finally { setSaving(false) }
  }

  // Ping Google Indexing API + IndexNow (Bing) — indexation automatique à la publication
  const pingIndex = (slug: string) =>
    fetch('/api/cms/index-article', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: `https://vivesmedia.com/blog/${slug}` }),
    }).catch(() => {})

  const toggle = async (a: Article) => {
    const publishing = !a.publie
    await articlesService.update(a.id, { publie: !a.publie })
    if (publishing) pingIndex(a.slug)
    load()
  }

  // Demande d'indexation manuelle (Google + Bing), avec retour visuel
  const [indexing, setIndexing] = useState<Record<string, 'busy' | 'ok' | 'err'>>({})
  const requestIndex = async (slug: string) => {
    setIndexing(p => ({ ...p, [slug]: 'busy' }))
    try {
      const r = await fetch('/api/cms/index-article', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: `https://vivesmedia.com/blog/${slug}` }),
      })
      const d = await r.json()
      setIndexing(p => ({ ...p, [slug]: d?.google?.ok || d?.indexnow?.ok ? 'ok' : 'err' }))
    } catch {
      setIndexing(p => ({ ...p, [slug]: 'err' }))
    }
    setTimeout(() => setIndexing(p => { const n = { ...p }; delete n[slug]; return n }), 4000)
  }

  if (editing) return (
    <div>
      <div className="mb-6">
        <button onClick={() => setEditing(null)} className="text-xs mb-2 flex items-center gap-1" style={{ color: 'var(--cms-muted)' }}>← Retour aux articles</button>
        <h1 className="text-xl font-bold" style={{ color: 'var(--cms-ink)' }}>{editing === 'new' ? 'Nouvel article' : 'Modifier l\'article'}</h1>
      </div>
      <form onSubmit={save} className="space-y-4 max-w-3xl">
        <div className="rounded-xl p-5 space-y-4" style={{ background: 'var(--cms-card)', border: '1px solid var(--cms-border)' }}>
          <div>
            <label className={labelCls} style={{ color: 'var(--cms-ink-2)' }}>Titre *</label>
            <input required value={form.titre}
              onChange={e => setForm(p => ({ ...p, titre: e.target.value, slug: toSlug(e.target.value) }))}
              className={inputCls} style={inputStyle} />
          </div>
          <div>
            <label className={labelCls} style={{ color: 'var(--cms-ink-2)' }}>Slug</label>
            <input value={form.slug} onChange={e => setForm(p => ({ ...p, slug: e.target.value }))}
              className={`${inputCls} font-mono`} style={{ ...inputStyle, fontSize: '12px', background: 'var(--cms-surface-2)' }} />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className={labelCls} style={{ color: 'var(--cms-ink-2)' }}>Catégorie</label>
              <input value={form.categorie} onChange={e => setForm(p => ({ ...p, categorie: e.target.value }))} className={inputCls} style={inputStyle} />
            </div>
            <div>
              <label className={labelCls} style={{ color: 'var(--cms-ink-2)' }}>Date de publication</label>
              <input type="date" value={form.date_pub} onChange={e => setForm(p => ({ ...p, date_pub: e.target.value }))} className={inputCls} style={inputStyle} />
            </div>
          </div>
          <div>
            <label className={labelCls} style={{ color: 'var(--cms-ink-2)' }}>Image de couverture</label>
            {form.image_url && <img src={form.image_url} alt="" className="w-full max-w-xs rounded-lg border mb-2" style={{ borderColor: 'var(--cms-border-2)' }} />}
            <div className="flex items-center gap-3">
              <label className="inline-flex items-center gap-2 text-sm px-3 py-2 rounded-lg cursor-pointer shrink-0" style={{ border: '1px solid var(--cms-border-2)', color: 'var(--cms-ink-2)' }}>
                <Upload className="w-4 h-4" /> {uploading ? 'Envoi…' : 'Choisir un fichier'}
                <input type="file" accept="image/*" className="hidden" onChange={e => onUploadImage(e.target.files?.[0])} />
              </label>
              <input value={form.image_url} onChange={e => setForm(p => ({ ...p, image_url: e.target.value }))} placeholder="…ou coller une URL" className={inputCls} style={inputStyle} />
            </div>
          </div>
          <div>
            <label className={labelCls} style={{ color: 'var(--cms-ink-2)' }}>Extrait</label>
            <textarea value={form.extrait} onChange={e => setForm(p => ({ ...p, extrait: e.target.value }))} rows={2}
              className={`${inputCls} resize-none`} style={inputStyle} />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className={labelCls} style={{ color: 'var(--cms-ink-2)' }}>Contenu (HTML)</label>
              <button type="button" onClick={() => setPreviewHtml(p => !p)} className="flex items-center gap-1 text-xs font-medium" style={{ color: 'var(--cms-brand)' }}>
                <Eye className="w-3.5 h-3.5" /> {previewHtml ? 'Masquer l\'aperçu' : 'Aperçu du rendu'}
              </button>
            </div>
            <textarea value={form.contenu} onChange={e => setForm(p => ({ ...p, contenu: e.target.value }))} rows={12}
              className={`${inputCls} font-mono resize-y`} style={{ ...inputStyle, fontSize: '12px', background: 'var(--cms-surface-2)' }} />
            {previewHtml && (
              <div className="mt-3 rounded-lg border p-5 prose prose-sm max-w-none" style={{ borderColor: 'var(--cms-border-2)', background: 'var(--cms-card)' }}
                dangerouslySetInnerHTML={{ __html: form.contenu || '<p style="color:var(--cms-muted)">(contenu vide)</p>' }} />
            )}
          </div>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={form.publie} onChange={e => setForm(p => ({ ...p, publie: e.target.checked }))} className="w-4 h-4 rounded accent-orange-500" />
            <span className="text-sm font-medium" style={{ color: 'var(--cms-ink-2)' }}>Publié (visible sur le site)</span>
          </label>
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

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="cms-eyebrow">Marketing</p>
          <h1 className="text-2xl font-bold tracking-tight mt-1" style={{ color: 'var(--cms-ink)' }}>Articles</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--cms-muted)' }}>
            {articles.length} article(s) · {articles.filter(a => statusOf(a) === 'publie').length} publié(s) · {articles.filter(a => statusOf(a) === 'programme').length} programmé(s)
          </p>
        </div>
        <button onClick={() => open()} className="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg text-white" style={{ background: 'var(--cms-brand)' }}>
          <Plus className="w-4 h-4" /> Nouvel article
        </button>
      </div>

      <Kpis items={[
        { label: 'Publiés', value: articles.filter(a => statusOf(a) === 'publie').length, icon: BookOpen, color: 'var(--cms-ok-fg)' },
        { label: 'Programmés', value: articles.filter(a => statusOf(a) === 'programme').length, icon: CalendarClock, color: 'var(--cms-warn-fg)' },
        { label: 'Brouillons', value: articles.filter(a => statusOf(a) === 'brouillon').length, icon: EyeOff, color: 'var(--cms-muted)' },
        { label: 'Clics Google', value: Object.values(stats).reduce((s, v) => s + (v.clicks || 0), 0), icon: MousePointerClick, color: 'var(--cms-info-fg)', hint: '30 derniers jours (GSC)' },
        { label: 'Impressions', value: Object.values(stats).reduce((s, v) => s + (v.impressions || 0), 0).toLocaleString('fr-FR'), icon: Eye, color: '#7C56C7', hint: 'vues dans la recherche' },
      ]} />

      {articles.length === 0 && (
        <div className="rounded-xl p-12 text-center text-sm" style={{ background: 'var(--cms-card)', border: '1px solid var(--cms-border)', color: 'var(--cms-muted)' }}>
          Aucun article
        </div>
      )}
      {(() => {
        const upcoming = articles
          .filter(a => statusOf(a) === 'programme')
          .sort((x, y) => (x.date_pub || '').localeCompare(y.date_pub || ''))
        if (!upcoming.length) return null
        return (
          <div className="rounded-xl p-5 mb-5" style={{ background: 'var(--cms-card)', border: '1px solid var(--cms-border)' }}>
            <div className="flex items-center gap-2 mb-3">
              <CalendarClock className="w-4 h-4" style={{ color: 'var(--cms-brand)' }} />
              <h2 className="text-sm font-bold" style={{ color: 'var(--cms-ink)' }}>
                Planning éditorial — {upcoming.length} article(s) à venir
              </h2>
            </div>
            <div className="space-y-1.5">
              {upcoming.map(a => {
                const d = new Date(a.date_pub as string)
                const days = Math.max(0, Math.ceil((d.getTime() - Date.now()) / 86400000))
                return (
                  <div key={a.id} className="flex items-center gap-3 text-sm">
                    <span className="font-mono text-xs px-2 py-0.5 rounded shrink-0" style={{ background: 'var(--cms-brand-wash)', color: 'var(--cms-brand)' }}>
                      {d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                    </span>
                    <span className="flex-1 truncate" style={{ color: 'var(--cms-ink-2)' }}>{a.titre}</span>
                    <span className="text-xs shrink-0" style={{ color: 'var(--cms-muted)' }}>dans {days} j</span>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })()}

      <div className="space-y-2">
        {articles.map(a => (
          <div key={a.id} className="flex items-center gap-4 p-4 rounded-xl" style={{ background: 'var(--cms-card)', border: '1px solid var(--cms-border)' }}>
            {a.image_url ? (
              <img src={a.image_url} alt={a.titre} className="w-14 h-10 object-cover rounded-lg shrink-0" />
            ) : (
              <div className="w-14 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'var(--cms-surface-2)' }}>
                <BookOpen className="w-4 h-4" style={{ color: 'var(--cms-muted)' }} />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate" style={{ color: 'var(--cms-ink)' }}>{a.titre}</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--cms-muted)' }}>
                {a.categorie && <span>{a.categorie} · </span>}
                {a.date_pub}
              </p>
            </div>
            {(() => {
              const s = stats[`/blog/${a.slug}`]
              if (!s || (!s.impressions && !s.clicks)) return null
              return (
                <div className="hidden sm:flex flex-col items-end text-xs shrink-0 mr-1 leading-tight" style={{ color: 'var(--cms-ink-2)' }} title="Search Console · 90 derniers jours">
                  <span><strong style={{ color: 'var(--cms-ink)' }}>{s.impressions}</strong> impr · <strong style={{ color: 'var(--cms-ink)' }}>{s.clicks}</strong> clics</span>
                  <span>pos. moy. <strong style={{ color: 'var(--cms-brand)' }}>{s.position}</strong></span>
                </div>
              )
            })()}
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium shrink-0 ${STATUS[statusOf(a)].cls}`}>
              {STATUS[statusOf(a)].label}
            </span>
            <div className="flex gap-1 shrink-0">
              {a.publie && (
                <button onClick={() => requestIndex(a.slug)} disabled={indexing[a.slug] === 'busy'} className="p-1.5 rounded-md" style={{ color: 'var(--cms-muted)' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--cms-brand-wash)'; (e.currentTarget as HTMLElement).style.color = 'var(--cms-brand)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'var(--cms-muted)' }}
                  title="Demander l'indexation (Google + Bing)">
                  {indexing[a.slug] === 'busy' ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    : indexing[a.slug] === 'ok' ? <Check className="w-3.5 h-3.5" style={{ color: 'var(--cms-ok-fg)' }} />
                    : indexing[a.slug] === 'err' ? <X className="w-3.5 h-3.5" style={{ color: 'var(--cms-danger-fg)' }} />
                    : <Send className="w-3.5 h-3.5" />}
                </button>
              )}
              <button onClick={() => toggle(a)} className="p-1.5 rounded-md" style={{ color: 'var(--cms-muted)' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--cms-surface-2)'; (e.currentTarget as HTMLElement).style.color = 'var(--cms-ink-2)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'var(--cms-muted)' }}
                title={a.publie ? 'Dépublier' : 'Publier'}>
                {a.publie ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
              <button onClick={() => open(a)} className="p-1.5 rounded-md" style={{ color: 'var(--cms-muted)' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--cms-surface-2)'; (e.currentTarget as HTMLElement).style.color = 'var(--cms-ink-2)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'var(--cms-muted)' }}>
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => articlesService.delete(a.id).then(load)} className="p-1.5 rounded-md" style={{ color: 'var(--cms-muted)' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--cms-danger-bg)'; (e.currentTarget as HTMLElement).style.color = 'var(--cms-danger-fg)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'var(--cms-muted)' }}>
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
