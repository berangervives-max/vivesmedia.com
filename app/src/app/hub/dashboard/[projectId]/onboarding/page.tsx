import { redirect, notFound } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import OnboardingForm from '@/components/client/OnboardingForm'
import type { FormField } from '@/types/hub'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

type FormWithResponse = {
  id: string; title?: string; fields?: FormField[]
  form_responses?: { is_complete?: boolean; responses?: Record<string, string | string[]> }[]
}

export default async function OnboardingPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/hub/login')

  const { data: client } = await supabase.from('clients').select('id, name').eq('user_id', user.id).single()
  if (!client) redirect('/hub/dashboard')

  const { data: project } = await supabase.from('projects').select('id, name, client_id').eq('id', projectId).eq('client_id', client.id).single()
  if (!project) notFound()

  const { data: rawForm } = await supabase.from('onboarding_forms').select('*, form_responses(*)').eq('project_id', projectId).maybeSingle()
  if (!rawForm) redirect(`/hub/dashboard/${projectId}`)

  const form = rawForm as FormWithResponse
  const existingResponse = form.form_responses?.[0]
  if (existingResponse?.is_complete) redirect(`/hub/dashboard/${projectId}`)

  return (
    <div className="max-w-xl mx-auto">
      <Link href={`/hub/dashboard/${projectId}`} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
        <ArrowLeft className="w-4 h-4" /> Retour au projet
      </Link>

      <div className="mb-8">
        <p className="hub-eyebrow">{project.name}</p>
        <h1 className="text-2xl font-bold text-foreground mt-1.5">{form.title}</h1>
        <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
          Merci de compléter ce formulaire pour démarrer votre projet. Cela prend 5 à 10 minutes.
        </p>
      </div>

      <OnboardingForm
        formId={form.id}
        projectId={projectId}
        fields={(form.fields as FormField[]) ?? []}
        existingResponses={existingResponse?.responses ?? {}}
      />
    </div>
  )
}
