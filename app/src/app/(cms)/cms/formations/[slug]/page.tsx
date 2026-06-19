'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { coursesService } from '@/services/courses.service'
import type { Course } from '@/types/courses'
import CourseEditor from '@/components/cms/CourseEditor'

export default function EditCoursePage() {
  const params = useParams<{ slug: string }>()
  const slug = params?.slug
  const [course, setCourse] = useState<Course | null>(null)
  const [state, setState] = useState<'loading' | 'ok' | 'notfound'>('loading')

  useEffect(() => {
    if (!slug) return
    coursesService.getOne(slug)
      .then((row) => { if (row?.data) { setCourse(row.data); setState('ok') } else setState('notfound') })
      .catch(() => setState('notfound'))
  }, [slug])

  if (state === 'loading') return <p className="p-8 text-sm" style={{ color: '#94A3B8' }}>Chargement…</p>
  if (state === 'notfound' || !course) return (
    <div className="p-8 max-w-md">
      <p className="font-semibold mb-2" style={{ color: '#0F172A' }}>Cours introuvable</p>
      <Link href="/cms/formations" className="text-sm font-semibold" style={{ color: '#F4521E' }}>← Retour aux formations</Link>
    </div>
  )
  return <CourseEditor initial={course} isNew={false} />
}
