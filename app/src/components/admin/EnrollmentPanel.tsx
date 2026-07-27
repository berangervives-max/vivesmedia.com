'use client'
import { useState } from 'react'
import { COURSES } from '@/lib/courses'
import { toast } from 'sonner'
import { Check, GraduationCap, Loader2 } from 'lucide-react'

export default function EnrollmentPanel({ clientId, initialEnrolled }: { clientId: string; initialEnrolled: string[] }) {
  const [enrolled, setEnrolled] = useState<Set<string>>(new Set(initialEnrolled))
  const [busy, setBusy] = useState<string | null>(null)

  async function toggle(slug: string) {
    const isEnrolled = enrolled.has(slug)
    setBusy(slug)
    try {
      const res = await fetch('/api/cms/enroll', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId, courseSlug: slug, action: isEnrolled ? 'revoke' : 'grant' }),
      })
      if (!res.ok) throw new Error(await res.text())
      setEnrolled((prev) => { const n = new Set(prev); if (isEnrolled) n.delete(slug); else n.add(slug); return n })
      toast.success(isEnrolled ? 'Accès retiré.' : 'Accès accordé.')
    } catch {
      toast.error('Erreur. Réessaie.')
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground mb-3">Coche les formations auxquelles ce client a accès dans son espace.</p>
      {COURSES.map((course) => {
        const on = enrolled.has(course.slug)
        return (
          <button key={course.slug} onClick={() => toggle(course.slug)} disabled={busy === course.slug}
            className="w-full flex items-center gap-3 p-3 rounded-xl border transition-colors text-left"
            style={{ borderColor: on ? 'var(--cms-ok-fg)' : 'var(--cms-border)', background: on ? 'var(--cms-ok-bg)' : 'var(--cms-card)' }}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: on ? 'var(--cms-ok-fg)' : 'var(--cms-surface-2)' }}>
              {busy === course.slug ? <Loader2 className="w-4 h-4 animate-spin" style={{ color: on ? '#fff' : 'var(--cms-muted)' }} />
                : on ? <Check className="w-4 h-4 text-white" strokeWidth={3} />
                  : <GraduationCap className="w-4 h-4" style={{ color: 'var(--cms-muted)' }} />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate" style={{ color: 'var(--cms-ink)' }}>{course.title}</p>
              <p className="text-xs truncate" style={{ color: 'var(--cms-muted)' }}>{course.tagline}</p>
            </div>
            <span className="text-xs font-semibold" style={{ color: on ? 'var(--cms-ok-fg)' : 'var(--cms-faint)' }}>{on ? 'Accès activé' : 'Activer'}</span>
          </button>
        )
      })}
    </div>
  )
}
