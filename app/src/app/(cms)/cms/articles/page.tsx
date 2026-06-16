'use client'
import { useState, useEffect } from 'react'
import { articlesService } from '@/services/supabase.service'
import type { Article } from '@/types'
import { Plus, Pencil, Trash2, Eye, EyeOff, BookOpen, CalendarClock } from 'lucide-react'

const EMPTY: Omit<Article, 'id' | 'created_at' | 'updated_at'> = {
  titre: '', slug: '', extrait: '', contenu: '', categorie: '', tags: '',
  date_pub: new Date().toISOString().slice(0, 10), publie: false, image_url: '', meta_title: '', meta_desc: ''
}

function toSlug(s: string) {
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

const STATUS = {
  publie: { label: 'Publié', cls: 'bg-green-100 text-green-700' },
  programme: { label: 'Programmé', cls: 'bg-amber-100 text-amber-700' },
  brouillon: { label: 'Brouillon', cls: 'bg-gray-100 text-gray-500' },
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
const inputStyle = { border: '1px solid #E5E7EB', background: '#fff', color: '#111827' }
const labelCls = "text-xs font-semibold block mb-1.5 uppercase tracking-wide"

export default function CmsArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([])
  const [editing, setEditing] = useState<string | null>(null)
  const [form, setForm] = useState<Omit<Article, 'id' | 'created_at' | 'updated_at'>>({ ...EMPTY })
  const [saving, setSaving] = useState(false)

  const load = () => articlesService.getAll().then(setArticles).catch(() => {})
  useEffect(() => { load() }, [])

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

  if (editing) return (
    <div>
      <div className="mb-6">
        <button onClick={() => setEditing(null)} className="text-xs mb-2 flex items-center gap-1" style={{ color: '#9CA3AF' }}>← Retour aux articles</button>
        <h1 className="text-xl font-bold" style={{ color: '#111827' }}>{editing === 'new' ? 'Nouvel article' : 'Modifier l\'article'}</h1>
      </div>
      <form onSubmit={save} className="space-y-4 max-w-3xl">
        <div className="rounded-xl p-5 space-y-4" style={{ background: '#fff', border: '1px solid #E9ECEF' }}>
          <div>
            <label className={labelCls} style={{ color: '#6B7280' }}>Titre *</label>
            <input required value={form.titre}
              onChange={e => setForm(p => ({ ...p, titre: e.target.value, slug: toSlug(e.target.value) }))}
              className={inputCls} style={inputStyle} />
          </div>
          <div>
            <label className={labelCls} style={{ color: '#6B7280' }}>Slug</label>
            <input value={form.slug} onChange={e => setForm(p => ({ ...p, slug: e.target.value }))}
              className={`${inputCls} font-mono`} style={{ ...inputStyle, fontSize: '12px', background: '#F9FAFB' }} />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className={labelCls} style={{ color: '#6B7280' }}>Catégorie</label>
              <input value={form.categorie} onChange={e => setForm(p => ({ ...p, categorie: e.target.value }))} className={inputCls} style={inputStyle} />
            </div>
            <div>
              <label className={labelCls} style={{ color: '#6B7280' }}>Date de publication</label>
              <input type="date" value={form.date_pub} onChange={e => setForm(p => ({ ...p, date_pub: e.target.value }))} className={inputCls} style={inputStyle} />
            </div>
          </div>
          <div>
            <label className={labelCls} style={{ color: '#6B7280' }}>Image URL</label>
            <input value={form.image_url} onChange={e => setForm(p => ({ ...p, image_url: e.target.value }))} className={inputCls} style={inputStyle} />
          </div>
          <div>
            <label className={labelCls} style={{ color: '#6B7280' }}>Extrait</label>
            <textarea value={form.extrait} onChange={e => setForm(p => ({ ...p, extrait: e.target.value }))} rows={2}
              className={`${inputCls} resize-none`} style={inputStyle} />
          </div>
          <div>
            <label className={labelCls} style={{ color: '#6B7280' }}>Contenu (HTML)</label>
            <textarea value={form.contenu} onChange={e => setForm(p => ({ ...p, contenu: e.target.value }))} rows={12}
              className={`${inputCls} font-mono resize-y`} style={{ ...inputStyle, fontSize: '12px', background: '#F9FAFB' }} />
          </div>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={form.publie} onChange={e => setForm(p => ({ ...p, publie: e.target.checked }))} className="w-4 h-4 rounded accent-orange-500" />
            <span className="text-sm font-medium" style={{ color: '#374151' }}>Publié (visible sur le site)</span>
          </label>
        </div>
        <div className="flex gap-3">
          <button type="submit" disabled={saving} className="px-5 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-50" style={{ background: '#F4521E' }}>
            {saving ? 'Sauvegarde...' : 'Sauvegarder'}
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
          <h1 className="text-xl font-bold" style={{ color: '#111827' }}>Articles</h1>
          <p className="text-sm mt-0.5" style={{ color: '#9CA3AF' }}>
            {articles.length} article(s) · {articles.filter(a => statusOf(a) === 'publie').length} publié(s) · {articles.filter(a => statusOf(a) === 'programme').length} programmé(s)
          </p>
        </div>
        <button onClick={() => open()} className="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg text-white" style={{ background: '#F4521E' }}>
          <Plus className="w-4 h-4" /> Nouvel article
        </button>
      </div>

      {articles.length === 0 && (
        <div className="rounded-xl p-12 text-center text-sm" style={{ background: '#fff', border: '1px solid #E9ECEF', color: '#9CA3AF' }}>
          Aucun article
        </div>
      )}
      {(() => {
        const upcoming = articles
          .filter(a => statusOf(a) === 'programme')
          .sort((x, y) => (x.date_pub || '').localeCompare(y.date_pub || ''))
        if (!upcoming.length) return null
        return (
          <div className="rounded-xl p-5 mb-5" style={{ background: '#fff', border: '1px solid #E9ECEF' }}>
            <div className="flex items-center gap-2 mb-3">
              <CalendarClock className="w-4 h-4" style={{ color: '#F4521E' }} />
              <h2 className="text-sm font-bold" style={{ color: '#111827' }}>
                Planning éditorial — {upcoming.length} article(s) à venir
              </h2>
            </div>
            <div className="space-y-1.5">
              {upcoming.map(a => {
                const d = new Date(a.date_pub as string)
                const days = Math.max(0, Math.ceil((d.getTime() - Date.now()) / 86400000))
                return (
                  <div key={a.id} className="flex items-center gap-3 text-sm">
                    <span className="font-mono text-xs px-2 py-0.5 rounded shrink-0" style={{ background: '#FFF4ED', color: '#F4521E' }}>
                      {d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                    </span>
                    <span className="flex-1 truncate" style={{ color: '#374151' }}>{a.titre}</span>
                    <span className="text-xs shrink-0" style={{ color: '#9CA3AF' }}>dans {days} j</span>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })()}

      <div className="space-y-2">
        {articles.map(a => (
          <div key={a.id} className="flex items-center gap-4 p-4 rounded-xl" style={{ background: '#fff', border: '1px solid #E9ECEF' }}>
            {a.image_url ? (
              <img src={a.image_url} alt={a.titre} className="w-14 h-10 object-cover rounded-lg shrink-0" />
            ) : (
              <div className="w-14 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: '#F3F4F6' }}>
                <BookOpen className="w-4 h-4" style={{ color: '#9CA3AF' }} />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate" style={{ color: '#111827' }}>{a.titre}</p>
              <p className="text-xs mt-0.5" style={{ color: '#9CA3AF' }}>
                {a.categorie && <span>{a.categorie} · </span>}
                {a.date_pub}
              </p>
            </div>
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium shrink-0 ${STATUS[statusOf(a)].cls}`}>
              {STATUS[statusOf(a)].label}
            </span>
            <div className="flex gap-1 shrink-0">
              <button onClick={() => toggle(a)} className="p-1.5 rounded-md" style={{ color: '#9CA3AF' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#F3F4F6'; (e.currentTarget as HTMLElement).style.color = '#374151' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#9CA3AF' }}
                title={a.publie ? 'Dépublier' : 'Publier'}>
                {a.publie ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
              <button onClick={() => open(a)} className="p-1.5 rounded-md" style={{ color: '#9CA3AF' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#F3F4F6'; (e.currentTarget as HTMLElement).style.color = '#374151' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#9CA3AF' }}>
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => articlesService.delete(a.id).then(load)} className="p-1.5 rounded-md" style={{ color: '#9CA3AF' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#FEF2F2'; (e.currentTarget as HTMLElement).style.color = '#EF4444' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#9CA3AF' }}>
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
