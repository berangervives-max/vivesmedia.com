import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { createAdminSupabase } from '@/lib/supabase-admin'
import { sendInvitationEmail } from '@/lib/hub-resend'

// Crée un client + son 1er projet + envoie un lien magique d'accès à l'espace client. Admin uniquement.
export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const ADMIN = process.env.ADMIN_EMAIL || 'berangervives@gmail.com'
  if (user.email !== ADMIN) return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })

  const { name, email, company, phone, projectName } = await request.json()
  if (!name || !email || !projectName) return NextResponse.json({ error: 'Champs requis manquants' }, { status: 400 })

  const adminClient = createAdminSupabase()

  const { data: client, error: clientError } = await adminClient.from('clients')
    .insert({ name, email, company: company || null, phone: phone || null, created_by: user.id }).select().single()
  if (clientError) return NextResponse.json({ error: clientError.message }, { status: 500 })

  const { data: project, error: projectError } = await adminClient.from('projects')
    .insert({ client_id: client.id, name: projectName, current_phase: 'onboarding' }).select().single()
  if (projectError) return NextResponse.json({ error: projectError.message }, { status: 500 })

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? ''
  const { data: link, error: linkError } = await adminClient.auth.admin.generateLink({
    type: 'magiclink', email, options: { redirectTo: `${appUrl}/hub/auth/callback` },
  })
  if (linkError || !link.properties?.action_link) {
    return NextResponse.json({ client, project, emailSent: false })
  }

  try {
    await sendInvitationEmail({ to: email, clientName: name, projectName, magicLink: link.properties.action_link })
  } catch {
    return NextResponse.json({ client, project, emailSent: false })
  }
  return NextResponse.json({ client, project, emailSent: true })
}
