import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { getUpcomingEvents } from '@/lib/google-data'

// Prochains RDV depuis Google Calendar (compte de service). Admin uniquement.
export async function GET() {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || user.email !== 'berangervives@gmail.com') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }
    const result = await getUpcomingEvents(8)
    return NextResponse.json(result)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue'
    return NextResponse.json({ ok: false, reason: 'error', message }, { status: 500 })
  }
}
