import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { runDueAutomations, AUTOMATIONS } from '@/lib/automations'

// Déclenche une automatisation à la demande depuis le CMS. Admin uniquement.
export async function POST(req: NextRequest) {
  const sb = await createServerSupabaseClient()
  const { data: { user } } = await sb.auth.getUser()
  if (!user || user.email !== 'berangervives@gmail.com') {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }
  const { id } = await req.json().catch(() => ({ id: undefined }))
  if (id && !AUTOMATIONS.some(a => a.id === id)) {
    return NextResponse.json({ error: 'Automatisation inconnue' }, { status: 400 })
  }
  const result = await runDueAutomations(id)
  return NextResponse.json({ ok: true, result, count: result[id as string] ?? 0 })
}
