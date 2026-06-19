import { createClient } from '@/lib/supabase'
import type { Course, CourseRow } from '@/types/courses'

// CRUD des cours (table `courses`, Supabase partagé avec le Hub).
// RLS : admin (session CMS) a tous les droits ; l'espace client du Hub lit les publiés.
export const coursesService = {
  async getAll(): Promise<CourseRow[]> {
    const sb = createClient()
    const { data, error } = await sb
      .from('courses')
      .select('slug, data, published, position')
      .order('position', { ascending: true })
    if (error) throw error
    return (data ?? []) as unknown as CourseRow[]
  },

  async getOne(slug: string): Promise<CourseRow | null> {
    const sb = createClient()
    const { data, error } = await sb
      .from('courses')
      .select('slug, data, published, position')
      .eq('slug', slug)
      .maybeSingle()
    if (error) throw error
    return (data as unknown as CourseRow) ?? null
  },

  async upsert(course: Course, published: boolean, position: number): Promise<void> {
    const sb = createClient()
    const { error } = await sb
      .from('courses')
      .upsert(
        { slug: course.slug, data: course, published, position, updated_at: new Date().toISOString() },
        { onConflict: 'slug' }
      )
    if (error) throw error
  },

  async setPublished(slug: string, published: boolean): Promise<void> {
    const sb = createClient()
    const { error } = await sb.from('courses').update({ published, updated_at: new Date().toISOString() }).eq('slug', slug)
    if (error) throw error
  },

  async remove(slug: string): Promise<void> {
    const sb = createClient()
    const { error } = await sb.from('courses').delete().eq('slug', slug)
    if (error) throw error
  },
}
