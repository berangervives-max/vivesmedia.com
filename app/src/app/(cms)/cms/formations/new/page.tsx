'use client'
import CourseEditor from '@/components/cms/CourseEditor'
import type { Course } from '@/types/courses'

const EMPTY: Course = {
  slug: '', title: '', tagline: '', level: 'Débutant', durationLabel: '', audience: '',
  coverImageUrl: '', outcomes: [], deliverables: [], modules: [],
}

export default function NewCoursePage() {
  return <CourseEditor initial={EMPTY} isNew />
}
