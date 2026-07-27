import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { anthropic, buildClientSystemPrompt } from '@/lib/hub-ai'
import type { ProjectPhase } from '@/types/hub'

export const runtime = 'nodejs'
export const maxDuration = 30

// Throttle mémoire best-effort : 8 requêtes / min / utilisateur (anti-spam de tokens).
const hits = new Map<string, number[]>()
function tooMany(userId: string): boolean {
  const now = Date.now()
  const arr = (hits.get(userId) || []).filter((t) => now - t < 60_000)
  arr.push(now)
  hits.set(userId, arr)
  return arr.length > 8
}

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'Assistant IA momentanément indisponible.' }, { status: 503 })
  }

  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  if (tooMany(user.id)) return NextResponse.json({ error: "Trop de questions d'affilée, réessaie dans une minute." }, { status: 429 })

  const { question, projectId, history = [] } = await req.json() as {
    question: string; projectId: string; history: { role: 'user' | 'assistant'; content: string }[]
  }
  if (!question?.trim()) return NextResponse.json({ error: 'Question vide' }, { status: 400 })
  if (question.length > 2000) return NextResponse.json({ error: 'Question trop longue.' }, { status: 400 })

  const { data: client } = await supabase.from('clients').select('id, name').eq('user_id', user.id).single()
  if (!client) return NextResponse.json({ error: 'Client introuvable' }, { status: 403 })

  const { data: project } = await supabase.from('projects').select('name, current_phase').eq('id', projectId).eq('client_id', client.id).single()
  if (!project) return NextResponse.json({ error: 'Projet introuvable' }, { status: 404 })

  const messages: { role: 'user' | 'assistant'; content: string }[] = [...history.slice(-6), { role: 'user', content: question }]

  try {
    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 600,
      system: buildClientSystemPrompt(project.current_phase as ProjectPhase, project.name),
      messages,
    })
    const answer = response.content[0].type === 'text' ? response.content[0].text : ''
    return NextResponse.json({ answer })
  } catch (e) {
    console.error('[ai/ask] erreur Anthropic:', e)
    return NextResponse.json({ error: "L'assistant a rencontré un souci, réessaie dans un instant." }, { status: 502 })
  }
}
