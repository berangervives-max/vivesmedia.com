import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { runDueAutomations } from '@/lib/automations'

// Autorisé si : (1) appel Vercel Cron avec le bon CRON_SECRET, ou (2) admin connecté
// (déclenchement manuel depuis le CMS).
async function isAuthorized(req: NextRequest): Promise<boolean> {
  const secret = process.env.CRON_SECRET
  const auth = req.headers.get('authorization')
  if (secret && auth === `Bearer ${secret}`) return true
  // Sans CRON_SECRET configuré : on autorise les invocations Vercel Cron, identifiées
  // par leur user-agent « vercel-cron » (le cron tourne donc sans variable à poser).
  const ua = (req.headers.get('user-agent') || '').toLowerCase()
  if (!secret && ua.includes('vercel-cron')) return true
  try {
    const sb = await createServerSupabaseClient()
    const { data: { user } } = await sb.auth.getUser()
    if (user?.email === 'berangervives@gmail.com') return true
  } catch { /* pas de session */ }
  return false
}

// Cron quotidien (vercel.json : 0 9 * * *). Exécute toutes les automatisations dues
// (quotidiennes chaque jour, hebdo le lundi, mensuelles le 1er) via le moteur.
export async function GET(req: NextRequest) {
  if (!(await isAuthorized(req))) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }
  const result = await runDueAutomations()
  return NextResponse.json({ ok: true, ran_at: new Date().toISOString(), result })
}
