import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { createAdminSupabase } from '@/lib/supabase-admin'

// Inscrit / désinscrit un client à une formation (course_enrollments). Admin uniquement.
export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const ADMIN = process.env.ADMIN_EMAIL || 'berangervives@gmail.com'
  if (user.email !== ADMIN) return NextResponse.json({ error: 'Accès réservé' }, { status: 403 })

  const { clientId, courseSlug, action } = await req.json()
  if (!clientId || !courseSlug) return NextResponse.json({ error: 'Bad request' }, { status: 400 })

  const admin = createAdminSupabase()

  if (action === 'revoke') {
    const { error } = await admin.from('course_enrollments').delete().eq('client_id', clientId).eq('course_slug', courseSlug)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true, enrolled: false })
  }

  const { error } = await admin.from('course_enrollments').upsert(
    { client_id: clientId, course_slug: courseSlug, granted_by: user.id },
    { onConflict: 'client_id,course_slug' },
  )
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true, enrolled: true })
}
