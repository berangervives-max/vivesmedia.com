'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { coursesService } from '@/services/courses.service'
import type { CourseRow } from '@/types/courses'
import { courseLessonCount } from '@/types/courses'
import { Plus, Pencil, Trash2, Eye, EyeOff, ExternalLink, GraduationCap } from 'lucide-react'

const ORANGE = '#F4521E'

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
          <h1 className="text-xl font-bold" style={{ color: '#0F172A' }}>Formations</h1>
          <p className="text-sm mt-0.5" style={{ color: '#64748B' }}>Cours de l&apos;espace client — créez, éditez, publiez.</p>
        </div>
        <Link href="/cms/formations/new" className="inline-flex items-center gap-1.5 text-sm font-semibold text-white px-4 py-2 rounded-lg shrink-0" style={{ background: ORANGE }}>
          <Plus className="w-4 h-4" /> Nouveau cours
        </Link>
      </div>

      {loading ? (
        <p className="text-sm py-10 text-center" style={{ color: '#94A3B8' }}>Chargement…</p>
      ) : rows.length === 0 ? (
        <div className="rounded-2xl p-10 text-center" style={{ background: '#fff', border: '1px solid #E5E7EB' }}>
          <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3" style={{ background: '#F1F5F9' }}>
            <GraduationCap className="w-6 h-6" style={{ color: '#94A3B8' }} />
          </div>
          <p className="font-semibold mb-1" style={{ color: '#0F172A' }}>Aucun cours en base</p>
          <p className="text-sm mb-4" style={{ color: '#64748B' }}>Créez votre premier cours, ou importez les modèles depuis l&apos;admin Hub.</p>
          <Link href="/cms/formations/new" className="inline-flex items-center gap-1.5 text-sm font-semibold text-white px-4 py-2 rounded-lg" style={{ background: ORANGE }}>
            <Plus className="w-4 h-4" /> Créer un cours
          </Link>
        </div>
      ) : (
        <div className="rounded-2xl overflow-hidden" style={{ background: '#fff', border: '1px solid #E5E7EB' }}>
          {rows.map((r, i) => (
            <div key={r.slug} className="flex items-center gap-4 p-4" style={{ borderTop: i ? '1px solid #F1F5F9' : 'none' }}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold truncate" style={{ color: '#0F172A' }}>{r.data?.title || r.slug}</p>
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded-full shrink-0"
                    style={r.published ? { background: '#ECFDF5', color: '#059669' } : { background: '#F1F5F9', color: '#64748B' }}>
                    {r.published ? 'Publié' : 'Brouillon'}
                  </span>
                </div>
                <p className="text-xs truncate mt-0.5" style={{ color: '#64748B' }}>{r.data?.tagline}</p>
                <p className="text-[11px] mt-1" style={{ color: '#94A3B8' }}>
                  {(r.data?.modules?.length ?? 0)} modules · {r.data ? courseLessonCount(r.data) : 0} leçons · {r.data?.level}
                </p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <a href={`/hub/dashboard/formations/${r.slug}`} target="_blank" rel="noopener noreferrer" title="Voir côté client" className="p-2 rounded-lg hover:bg-slate-100"><ExternalLink className="w-4 h-4" style={{ color: '#64748B' }} /></a>
                <button title={r.published ? 'Dépublier' : 'Publier'} disabled={busy === r.slug} onClick={() => togglePublish(r)} className="p-2 rounded-lg hover:bg-slate-100">
                  {r.published ? <EyeOff className="w-4 h-4" style={{ color: '#64748B' }} /> : <Eye className="w-4 h-4" style={{ color: '#64748B' }} />}
                </button>
                <Link href={`/cms/formations/${r.slug}`} className="inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg" style={{ border: '1px solid #E5E7EB', color: '#0F172A' }}>
                  <Pencil className="w-3.5 h-3.5" /> Éditer
                </Link>
                <button title="Supprimer" disabled={busy === r.slug} onClick={() => remove(r.slug)} className="p-2 rounded-lg hover:bg-red-50"><Trash2 className="w-4 h-4" style={{ color: '#DC2626' }} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
