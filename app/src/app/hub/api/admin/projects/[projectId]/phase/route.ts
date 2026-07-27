import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { createAdminSupabase } from '@/lib/supabase-admin'
import { sendPhaseChangeEmail } from '@/lib/hub-resend'
import { PHASE_LABELS, type ProjectPhase } from '@/types/hub'

export async function PATCH(request: Request, { params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  if (user.email !== process.env.ADMIN_EMAIL) return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })

  const { phase, note } = await request.json()
  if (!phase) return NextResponse.json({ error: 'Phase requise' }, { status: 400 })

  const adminClient = createAdminSupabase()
  const { data: project } = await adminClient.from('projects').select('*, clients(name, email)').eq('id', projectId).single()
  if (!project) return NextResponse.json({ error: 'Projet introuvable' }, { status: 404 })

  const { error: updateError } = await adminClient.from('projects').update({ current_phase: phase }).eq('id', projectId)
  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 })

  await adminClient.from('phase_history').insert({ project_id: projectId, phase, changed_by: user.id, note: note || null })

  const client = Array.isArray(project.clients) ? project.clients[0] : project.clients
  if (client?.email) {
    try {
      await sendPhaseChangeEmail({
        to: client.email, clientName: client.name, projectName: project.name,
        phaseLabel: PHASE_LABELS[phase as ProjectPhase],
        dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL ?? ''}/hub/dashboard/${projectId}`, note,
      })
      await adminClient.from('notifications_log').insert({ project_id: projectId, type: 'phase_change', recipient_email: client.email, metadata: { phase, note: note || null } })
    } catch { /* email non bloquant */ }
  }
  return NextResponse.json({ success: true })
}
