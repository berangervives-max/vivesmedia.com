import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { sendFollowup } from '@/services/email.service'

const DAY = 86_400_000

// Autorisé si : (1) appel Vercel Cron avec le bon CRON_SECRET, ou (2) admin connecté
// (déclenchement manuel depuis le CMS).
async function isAuthorized(req: NextRequest): Promise<boolean> {
  const secret = process.env.CRON_SECRET
  const auth = req.headers.get('authorization')
  if (secret && auth === `Bearer ${secret}`) return true
  try {
    const sb = await createServerSupabaseClient()
    const { data: { user } } = await sb.auth.getUser()
    if (user?.email === 'berangervives@gmail.com') return true
  } catch { /* pas de session */ }
  return false
}

export async function GET(req: NextRequest) {
  if (!(await isAuthorized(req))) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const sb = createServiceClient()
  const now = Date.now()
  const result: Record<string, number> = { relance_devis: 0 }

  // ── Relance des devis sans réponse (entre 2 et 14 jours, une seule fois) ──
  const since = new Date(now - 14 * DAY).toISOString()
  const before = new Date(now - 2 * DAY).toISOString()

  const { data: devis } = await sb
    .from('devis')
    .select('id, nom, email, created_at')
    .eq('statut', 'nouveau')
    .gte('created_at', since)
    .lte('created_at', before)

  const { data: logs } = await sb
    .from('automation_logs')
    .select('payload')
    .eq('type', 'relance_devis')

  const dejaRelances = new Set((logs ?? []).map((l) => (l.payload as { devis_id?: string })?.devis_id))

  for (const d of devis ?? []) {
    if (dejaRelances.has(d.id)) continue
    try {
      await sendFollowup({ email: d.email, nom: d.nom })
      await sb.from('automation_logs').insert({ type: 'relance_devis', payload: { devis_id: d.id, email: d.email } })
      result.relance_devis++
    } catch (e) {
      console.error('[cron] relance devis échec', d.id, e)
    }
  }

  return NextResponse.json({ ok: true, ran_at: new Date().toISOString(), ...result })
}
