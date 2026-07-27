import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { anthropic, buildFormationSystemPrompt } from '@/lib/hub-ai'
import type { ProjectPhase } from '@/types/hub'

export const runtime = 'nodejs'
export const maxDuration = 60

// Génère un module de formation (markdown) par IA. Admin uniquement.
export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'Génération IA momentanément indisponible.' }, { status: 503 })
  }
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const ADMIN = process.env.ADMIN_EMAIL || 'berangervives@gmail.com'
  if (user.email !== ADMIN) return NextResponse.json({ error: "Accès réservé à l'admin" }, { status: 403 })

  const { subject, phase, projectType, clientSector, level = 'debutant' } = await req.json() as {
    subject: string; phase: ProjectPhase; projectType: string; clientSector?: string; level?: 'debutant' | 'intermediaire'
  }
  if (!subject || !phase || !projectType) return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 })

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-5',
      max_tokens: 2000,
      system: buildFormationSystemPrompt(subject, phase, projectType, clientSector, level),
      messages: [{ role: 'user', content: `Crée le module de formation complet sur : "${subject}". Respecte strictement la structure demandée.` }],
    })
    const content = response.content[0].type === 'text' ? response.content[0].text : ''
    return NextResponse.json({ content })
  } catch (e) {
    console.error('[ai/formation] erreur Anthropic:', e)
    return NextResponse.json({ error: 'La génération a échoué, réessaie dans un instant.' }, { status: 502 })
  }
}
