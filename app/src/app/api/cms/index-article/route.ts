import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { indexUrl } from '@/lib/indexing'

// Déclenche l'indexation (Google Indexing API + IndexNow) d'un article. Admin only.
export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== 'berangervives@gmail.com') {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }
  const { url } = await req.json().catch(() => ({ url: null }))
  if (!url || typeof url !== 'string') {
    return NextResponse.json({ error: 'url requise' }, { status: 400 })
  }
  const result = await indexUrl(url)
  return NextResponse.json(result)
}
