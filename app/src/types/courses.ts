// Types du contenu des cours (formations) — identiques au Hub.
// Le contenu vit dans la table Supabase `courses` (data JSONB).

export interface QuizQuestion {
  id: string
  question: string
  options: string[]
  correctIndex: number
  explanation: string
}

export interface Quiz {
  id: string
  title: string
  passScore?: number
  questions: QuizQuestion[]
}

export interface Lesson {
  id: string
  title: string
  durationMin: number
  body: string
  imageUrl?: string
  imageAlt?: string
  videoUrl?: string | null
  videoScript?: string
}

export interface CourseModule {
  id: string
  title: string
  summary: string
  lessons: Lesson[]
  quiz?: Quiz
}

export interface Course {
  slug: string
  title: string
  tagline: string
  level: string
  durationLabel: string
  audience: string
  coverImageUrl?: string
  outcomes: string[]
  deliverables: string[]
  modules: CourseModule[]
}

export interface CourseRow {
  slug: string
  data: Course
  published: boolean
  position: number
}

export function courseLessonCount(c: Course): number {
  return (c.modules ?? []).reduce((n, m) => n + (m.lessons?.length ?? 0), 0)
}
