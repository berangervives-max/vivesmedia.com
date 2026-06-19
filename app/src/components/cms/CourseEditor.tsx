'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { coursesService } from '@/services/courses.service'
import type { Course, CourseModule, Lesson, Quiz, QuizQuestion } from '@/types/courses'
import { Plus, Trash2, Save, ArrowLeft } from 'lucide-react'

const ORANGE = '#F4521E'
const rid = () => Math.random().toString(36).slice(2, 8)
const inputCls = 'w-full px-3 py-2 rounded-lg text-sm outline-none'
const inputStyle: React.CSSProperties = { border: '1px solid #E5E7EB', background: '#fff', color: '#111827' }
const labelCls = 'text-[11px] font-semibold block mb-1 uppercase tracking-wide'
const labelStyle = { color: '#64748B' }
const card: React.CSSProperties = { background: '#fff', border: '1px solid #E5E7EB' }

export default function CourseEditor({ initial, isNew }: { initial: Course; isNew: boolean }) {
  const router = useRouter()
  const [course, setCourse] = useState<Course>(initial)
  const [published, setPublished] = useState(true)
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  const edit = (fn: (c: Course) => void) => setCourse((prev) => { const n: Course = structuredClone(prev); fn(n); return n })

  async function save() {
    setErr(null)
    if (!course.slug.trim() || !course.title.trim()) { setErr('Slug et titre obligatoires.'); return }
    setSaving(true)
    try {
      await coursesService.upsert(course, published, 0)
      router.push('/cms/formations'); router.refresh()
    } catch (e) { setErr((e as Error).message || 'Erreur à l\'enregistrement') }
    finally { setSaving(false) }
  }

  return (
    <div className="p-5 lg:p-8 max-w-3xl mx-auto">
      <Link href="/cms/formations" className="inline-flex items-center gap-1.5 text-xs font-medium mb-4" style={{ color: '#64748B' }}>
        <ArrowLeft className="w-3.5 h-3.5" /> Formations
      </Link>
      <div className="flex items-center justify-between gap-4 mb-5">
        <h1 className="text-xl font-bold" style={{ color: '#0F172A' }}>{isNew ? 'Nouveau cours' : course.title}</h1>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-1.5 text-xs" style={{ color: '#64748B' }}>
            <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} /> Publié
          </label>
          <button onClick={save} disabled={saving} className="inline-flex items-center gap-1.5 text-sm font-semibold text-white px-4 py-2 rounded-lg disabled:opacity-60" style={{ background: ORANGE }}>
            <Save className="w-4 h-4" /> {saving ? 'Enregistrement…' : 'Enregistrer'}
          </button>
        </div>
      </div>
      {err && <p className="mb-4 text-sm px-3 py-2 rounded-lg" style={{ background: '#FEF2F2', color: '#DC2626' }}>{err}</p>}

      {/* MÉTA */}
      <section className="rounded-2xl p-5 mb-5 space-y-4" style={card}>
        <p className="text-sm font-semibold" style={{ color: '#0F172A' }}>Informations générales</p>
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className={labelCls} style={labelStyle}>Slug (non modifiable après création)</label>
            <input className={inputCls} style={inputStyle} value={course.slug} disabled={!isNew}
              onChange={(e) => edit((c) => { c.slug = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })} placeholder="mon-cours" />
          </div>
          <div><label className={labelCls} style={labelStyle}>Niveau</label>
            <input className={inputCls} style={inputStyle} value={course.level} onChange={(e) => edit((c) => { c.level = e.target.value })} /></div>
        </div>
        <div><label className={labelCls} style={labelStyle}>Titre</label>
          <input className={inputCls} style={inputStyle} value={course.title} onChange={(e) => edit((c) => { c.title = e.target.value })} /></div>
        <div><label className={labelCls} style={labelStyle}>Accroche</label>
          <input className={inputCls} style={inputStyle} value={course.tagline} onChange={(e) => edit((c) => { c.tagline = e.target.value })} /></div>
        <div className="grid sm:grid-cols-2 gap-3">
          <div><label className={labelCls} style={labelStyle}>Durée (texte)</label>
            <input className={inputCls} style={inputStyle} value={course.durationLabel} onChange={(e) => edit((c) => { c.durationLabel = e.target.value })} placeholder="≈ 1h de contenu" /></div>
          <div><label className={labelCls} style={labelStyle}>Image de couverture (URL)</label>
            <input className={inputCls} style={inputStyle} value={course.coverImageUrl ?? ''} onChange={(e) => edit((c) => { c.coverImageUrl = e.target.value })} /></div>
        </div>
        <div><label className={labelCls} style={labelStyle}>Public visé</label>
          <input className={inputCls} style={inputStyle} value={course.audience} onChange={(e) => edit((c) => { c.audience = e.target.value })} /></div>
        <StringList title="Objectifs pédagogiques" items={course.outcomes} onChange={(a) => edit((c) => { c.outcomes = a })} />
        <StringList title="Ce que le client repart avec" items={course.deliverables} onChange={(a) => edit((c) => { c.deliverables = a })} />
      </section>

      {/* MODULES */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-semibold" style={{ color: '#0F172A' }}>Modules ({course.modules.length})</p>
        <button onClick={() => edit((c) => { c.modules.push({ id: `m-${rid()}`, title: 'Nouveau module', summary: '', lessons: [] }) })}
          className="inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg" style={{ border: '1px solid #E5E7EB', color: '#0F172A' }}>
          <Plus className="w-4 h-4" /> Ajouter un module
        </button>
      </div>
      <div className="space-y-4">
        {course.modules.map((m, mi) => (
          <ModuleCard key={m.id} module={m} index={mi}
            onChange={(fn) => edit((c) => fn(c.modules[mi]))}
            onRemove={() => edit((c) => { c.modules.splice(mi, 1) })}
            onMove={(dir) => edit((c) => { const j = mi + dir; if (j < 0 || j >= c.modules.length) return; const [x] = c.modules.splice(mi, 1); c.modules.splice(j, 0, x) })} />
        ))}
      </div>
    </div>
  )
}

function IconBtn({ onClick, title, children, danger }: { onClick: () => void; title?: string; children: React.ReactNode; danger?: boolean }) {
  return <button onClick={onClick} title={title} className="p-1.5 rounded-lg hover:bg-slate-100" style={{ color: danger ? '#DC2626' : '#64748B' }}>{children}</button>
}

function StringList({ title, items, onChange }: { title: string; items: string[]; onChange: (a: string[]) => void }) {
  return (
    <div>
      <label className={labelCls} style={labelStyle}>{title}</label>
      <div className="space-y-2">
        {items.map((it, i) => (
          <div key={i} className="flex gap-2">
            <input className={inputCls} style={inputStyle} value={it} onChange={(e) => { const a = [...items]; a[i] = e.target.value; onChange(a) }} />
            <IconBtn onClick={() => onChange(items.filter((_, j) => j !== i))} danger><Trash2 className="w-4 h-4" /></IconBtn>
          </div>
        ))}
        <button onClick={() => onChange([...items, ''])} className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg" style={{ border: '1px solid #E5E7EB', color: '#0F172A' }}><Plus className="w-3 h-3" /> Ajouter</button>
      </div>
    </div>
  )
}

function ModuleCard({ module: m, index, onChange, onRemove, onMove }: {
  module: CourseModule; index: number; onChange: (fn: (m: CourseModule) => void) => void; onRemove: () => void; onMove: (d: -1 | 1) => void
}) {
  return (
    <section className="rounded-2xl p-5" style={card}>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs font-bold" style={{ color: '#94A3B8' }}>Module {index + 1}</span>
        <div className="ml-auto flex items-center gap-1">
          <IconBtn onClick={() => onMove(-1)} title="Monter">↑</IconBtn>
          <IconBtn onClick={() => onMove(1)} title="Descendre">↓</IconBtn>
          <IconBtn onClick={onRemove} danger><Trash2 className="w-4 h-4" /></IconBtn>
        </div>
      </div>
      <div className="space-y-3">
        <input className={inputCls} style={inputStyle} value={m.title} onChange={(e) => onChange((mm) => { mm.title = e.target.value })} placeholder="Titre du module" />
        <input className={inputCls} style={inputStyle} value={m.summary} onChange={(e) => onChange((mm) => { mm.summary = e.target.value })} placeholder="Résumé court" />
        <div className="pl-3 space-y-3" style={{ borderLeft: '2px solid #F1F5F9' }}>
          {m.lessons.map((l, li) => (
            <LessonCard key={l.id} lesson={l} index={li}
              onChange={(fn) => onChange((mm) => fn(mm.lessons[li]))}
              onRemove={() => onChange((mm) => { mm.lessons.splice(li, 1) })} />
          ))}
          <button onClick={() => onChange((mm) => { mm.lessons.push({ id: `l-${rid()}`, title: 'Nouvelle leçon', durationMin: 5, body: '', videoUrl: null }) })}
            className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg" style={{ border: '1px solid #E5E7EB', color: '#0F172A' }}><Plus className="w-3 h-3" /> Ajouter une leçon</button>
        </div>
        {m.quiz ? (
          <QuizCard quiz={m.quiz} onChange={(fn) => onChange((mm) => { if (mm.quiz) fn(mm.quiz) })} onRemove={() => onChange((mm) => { delete mm.quiz })} />
        ) : (
          <button onClick={() => onChange((mm) => { mm.quiz = { id: `q-${rid()}`, title: 'Quiz', passScore: 50, questions: [] } })}
            className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg" style={{ border: '1px solid #E5E7EB', color: '#0F172A' }}><Plus className="w-3 h-3" /> Ajouter un quiz</button>
        )}
      </div>
    </section>
  )
}

function LessonCard({ lesson: l, index, onChange, onRemove }: { lesson: Lesson; index: number; onChange: (fn: (l: Lesson) => void) => void; onRemove: () => void }) {
  return (
    <div className="rounded-xl p-3 space-y-2" style={{ background: '#F8FAFC', border: '1px solid #E5E7EB' }}>
      <div className="flex items-center gap-2">
        <span className="text-[11px] font-bold" style={{ color: '#94A3B8' }}>Leçon {index + 1}</span>
        <IconBtn onClick={onRemove} danger><Trash2 className="w-3.5 h-3.5" /></IconBtn>
      </div>
      <div className="grid sm:grid-cols-[1fr_90px] gap-2">
        <input className={inputCls} style={inputStyle} value={l.title} onChange={(e) => onChange((x) => { x.title = e.target.value })} placeholder="Titre de la leçon" />
        <input type="number" className={inputCls} style={inputStyle} value={l.durationMin} onChange={(e) => onChange((x) => { x.durationMin = Number(e.target.value) })} placeholder="min" />
      </div>
      <textarea className={inputCls} style={{ ...inputStyle, fontFamily: 'monospace' }} rows={5} value={l.body} onChange={(e) => onChange((x) => { x.body = e.target.value })} placeholder="Contenu (Markdown)…" />
      <div className="grid sm:grid-cols-2 gap-2">
        <input className={inputCls} style={inputStyle} value={l.imageUrl ?? ''} onChange={(e) => onChange((x) => { x.imageUrl = e.target.value })} placeholder="Image (URL)" />
        <input className={inputCls} style={inputStyle} value={l.videoUrl ?? ''} onChange={(e) => onChange((x) => { x.videoUrl = e.target.value || null })} placeholder="Vidéo (URL, vide = à venir)" />
      </div>
    </div>
  )
}

function QuizCard({ quiz, onChange, onRemove }: { quiz: Quiz; onChange: (fn: (q: Quiz) => void) => void; onRemove: () => void }) {
  return (
    <div className="rounded-xl p-3 space-y-3" style={{ background: '#FFF7F4', border: '1px dashed #FBCAB6' }}>
      <div className="flex items-center gap-2">
        <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: ORANGE }}>Quiz</span>
        <input className={inputCls} style={{ ...inputStyle, maxWidth: 220, height: 30 }} value={quiz.title} onChange={(e) => onChange((q) => { q.title = e.target.value })} />
        <IconBtn onClick={onRemove} danger><Trash2 className="w-3.5 h-3.5" /></IconBtn>
      </div>
      {quiz.questions.map((qq, qi) => (
        <QuestionCard key={qq.id} q={qq} index={qi} onChange={(fn) => onChange((q) => fn(q.questions[qi]))} onRemove={() => onChange((q) => { q.questions.splice(qi, 1) })} />
      ))}
      <button onClick={() => onChange((q) => { q.questions.push({ id: `qq-${rid()}`, question: '', options: ['', ''], correctIndex: 0, explanation: '' }) })}
        className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg" style={{ border: '1px solid #E5E7EB', color: '#0F172A', background: '#fff' }}><Plus className="w-3 h-3" /> Ajouter une question</button>
    </div>
  )
}

function QuestionCard({ q, index, onChange, onRemove }: { q: QuizQuestion; index: number; onChange: (fn: (q: QuizQuestion) => void) => void; onRemove: () => void }) {
  return (
    <div className="rounded-lg p-3 space-y-2" style={{ background: '#fff', border: '1px solid #E5E7EB' }}>
      <div className="flex items-center gap-2">
        <span className="text-[11px] font-bold" style={{ color: '#94A3B8' }}>Q{index + 1}</span>
        <IconBtn onClick={onRemove} danger><Trash2 className="w-3.5 h-3.5" /></IconBtn>
      </div>
      <input className={inputCls} style={inputStyle} value={q.question} onChange={(e) => onChange((x) => { x.question = e.target.value })} placeholder="Intitulé de la question" />
      <div className="space-y-1.5">
        {q.options.map((opt, oi) => (
          <div key={oi} className="flex items-center gap-2">
            <input type="radio" name={`c-${q.id}`} checked={q.correctIndex === oi} onChange={() => onChange((x) => { x.correctIndex = oi })} title="Bonne réponse" />
            <input className={inputCls} style={inputStyle} value={opt} onChange={(e) => onChange((x) => { x.options[oi] = e.target.value })} placeholder={`Option ${oi + 1}`} />
            <IconBtn onClick={() => onChange((x) => { x.options.splice(oi, 1); if (x.correctIndex >= x.options.length) x.correctIndex = 0 })} danger><Trash2 className="w-3.5 h-3.5" /></IconBtn>
          </div>
        ))}
        <button onClick={() => onChange((x) => { x.options.push('') })} className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-lg" style={{ border: '1px solid #E5E7EB', color: '#0F172A' }}><Plus className="w-3 h-3" /> Option</button>
      </div>
      <input className={inputCls} style={inputStyle} value={q.explanation} onChange={(e) => onChange((x) => { x.explanation = e.target.value })} placeholder="Explication de la bonne réponse" />
    </div>
  )
}
