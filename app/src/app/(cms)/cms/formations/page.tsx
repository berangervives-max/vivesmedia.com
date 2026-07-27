'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { coursesService } from '@/services/courses.service'
import type { CourseRow } from '@/types/courses'
import { courseLessonCount } from '@/types/courses'
import { Plus, Pencil, Trash2, Eye, EyeOff, ExternalLink, GraduationCap } from 'lucide-react'

const ORANGE = 'var(--cms-brand)'

export default function CmsFormationsPage() {
  const [rows, setRows] = useState<CourseRow[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState<string | null>(null)

  const load = () => coursesService.getAll().then(setRows).catch(() => setRows([])).finally(() => setLoading(false))
  useEffect(() => { load() }, [])

  async function togglePublish(r: CourseRow) {
    setBusy(r.slug)
    try { await coursesService.setPublished(r.slug, !r.published); setRows((p) => p.map((x) => x.slug === r.slug ? { ...x, published: !r.published } : x)) }
    finally { setBusy(null) }
  }
  async function remove(slug: string) {
    if (!confirm(`Supprimer le cours « ${slug} » ?`)) return
    setBusy(slug)
    try { await coursesService.remove(slug); setRows((p) => p.filter((x) => x.slug !== slug)) }
    finally { setBusy(null) }
  }

  return (
    <div className="p-5 lg:p-8 max-w-5xl mx-auto">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <p className="cms-eyebrow">Hub client</p>
          <h1 className="text-2xl font-bold tracking-tight mt-1" style={{ color: 'var(--cms-ink)' }}>Formations</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--cms-muted)' }}>Cours de l&apos;espace client — créez, éditez, publiez.</p>
        </div>
        <Link href="/cms/formations/new" className="inline-flex items-center gap-1.5 text-sm font-semibold text-white px-4 py-2 rounded-lg shrink-0" style={{ background: ORANGE }}>
          <Plus className="w-4 h-4" /> Nouveau cours
        </Link>
      </div>

      {loading ? (
        <p className="text-sm py-10 text-center" style={{ color: 'var(--cms-faint)' }}>Chargement…</p>
      ) : rows.length === 0 ? (
        <div className="rounded-2xl p-10 text-center" style={{ background: 'var(--cms-card)', border: '1px solid var(--cms-border-2)' }}>
          <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3" style={{ background: 'var(--cms-surface-3)' }}>
            <GraduationCap className="w-6 h-6" style={{ color: 'var(--cms-faint)' }} />
          </div>
          <p className="font-semibold mb-1" style={{ color: 'var(--cms-ink)' }}>Aucun cours en base</p>
          <p className="text-sm mb-4" style={{ color: 'var(--cms-muted)' }}>Créez votre premier cours, ou importez les modèles depuis l&apos;admin Hub.</p>
          <Link href="/cms/formations/new" className="inline-flex items-center gap-1.5 text-sm font-semibold text-white px-4 py-2 rounded-lg" style={{ background: ORANGE }}>
            <Plus className="w-4 h-4" /> Créer un cours
          </Link>
        </div>
      ) : (
        <div className="rounded-2xl overflow-hidden" style={{ background: 'var(--cms-card)', border: '1px solid var(--cms-border-2)' }}>
          {rows.map((r, i) => (
            <div key={r.slug} className="flex items-center gap-4 p-4" style={{ borderTop: i ? '1px solid var(--cms-surface-3)' : 'none' }}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold truncate" style={{ color: 'var(--cms-ink)' }}>{r.data?.title || r.slug}</p>
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded-full shrink-0"
                    style={r.published ? { background: 'var(--cms-ok-bg)', color: 'var(--cms-ok-fg)' } : { background: 'var(--cms-surface-3)', color: 'var(--cms-muted)' }}>
                    {r.published ? 'Publié' : 'Brouillon'}
                  </span>
                </div>
                <p className="text-xs truncate mt-0.5" style={{ color: 'var(--cms-muted)' }}>{r.data?.tagline}</p>
                <p className="text-[11px] mt-1" style={{ color: 'var(--cms-faint)' }}>
                  {(r.data?.modules?.length ?? 0)} modules · {r.data ? courseLessonCount(r.data) : 0} leçons · {r.data?.level}
                </p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <a href={`/hub/dashboard/formations/${r.slug}`} target="_blank" rel="noopener noreferrer" title="Voir côté client" className="p-2 rounded-lg hover:bg-[var(--cms-surface-2)]"><ExternalLink className="w-4 h-4" style={{ color: 'var(--cms-muted)' }} /></a>
                <button title={r.published ? 'Dépublier' : 'Publier'} disabled={busy === r.slug} onClick={() => togglePublish(r)} className="p-2 rounded-lg hover:bg-[var(--cms-surface-2)]">
                  {r.published ? <EyeOff className="w-4 h-4" style={{ color: 'var(--cms-muted)' }} /> : <Eye className="w-4 h-4" style={{ color: 'var(--cms-muted)' }} />}
                </button>
                <Link href={`/cms/formations/${r.slug}`} className="inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg" style={{ border: '1px solid var(--cms-border-2)', color: 'var(--cms-ink)' }}>
                  <Pencil className="w-3.5 h-3.5" /> Éditer
                </Link>
                <button title="Supprimer" disabled={busy === r.slug} onClick={() => remove(r.slug)} className="p-2 rounded-lg hover:bg-[var(--cms-danger-bg)]"><Trash2 className="w-4 h-4" style={{ color: 'var(--cms-danger-fg)' }} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
