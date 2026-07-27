import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // Anti open-redirect : n'accepter qu'un chemin interne au Hub.
  const rawNext = searchParams.get('next')
  const next = rawNext && rawNext.startsWith('/hub') && !rawNext.startsWith('//') ? rawNext : '/hub/dashboard'

  if (code) {
    const supabase = await createServerSupabaseClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) return NextResponse.redirect(`${origin}${next}`)
  }
  return NextResponse.redirect(`${origin}/hub/login?error=auth`)
}
