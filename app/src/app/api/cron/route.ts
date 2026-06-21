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

export async function GET(req: NextRequest) {
  if (!(await isAuthorized(req))) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const sb = createServiceClient()
  const now = Date.now()
  const result: Record<string, number> = { relance_devis: 0, overdue_alert: 0, monthly_report: 0 }

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

  // ── Alerte factures impayées : passe en "en_retard" les factures échues non payées ──
  const today = new Date().toISOString().slice(0, 10)
  const { data: aRelancer } = await sb
    .from('factures')
    .select('id, numero, montant_ttc, date_echeance')
    .in('statut', ['envoyee'])
    .lt('date_echeance', today)

  for (const f of aRelancer ?? []) {
    try {
      await sb.from('factures').update({ statut: 'en_retard' }).eq('id', f.id)
      await sb.from('automation_logs').insert({ type: 'overdue_alert', payload: { facture_id: f.id, numero: f.numero, montant_ttc: f.montant_ttc } })
      result.overdue_alert++
    } catch (e) {
      console.error('[cron] alerte facture échec', f.id, e)
    }
  }

  // ── Rapport mensuel : le CA encaissé du mois précédent, une seule fois par mois ──
  const d = new Date(now)
  const moisPrec = new Date(d.getFullYear(), d.getMonth() - 1, 1)
  const moisKey = `${moisPrec.getFullYear()}-${String(moisPrec.getMonth() + 1).padStart(2, '0')}`
  const debutMois = moisPrec.toISOString()
  const finMois = new Date(d.getFullYear(), d.getMonth(), 1).toISOString()

  const { data: rapportsExistants } = await sb
    .from('automation_logs')
    .select('payload')
    .eq('type', 'monthly_report')
  const dejaFait = (rapportsExistants ?? []).some((l) => (l.payload as { mois?: string })?.mois === moisKey)

  if (!dejaFait) {
    const { data: facturesPayees } = await sb
      .from('factures').select('montant_ttc').eq('statut', 'payee').gte('created_at', debutMois).lt('created_at', finMois)
    const { data: commandesPayees } = await sb
      .from('commandes').select('montant').eq('statut', 'paye').gte('created_at', debutMois).lt('created_at', finMois)
    const caFactures = (facturesPayees ?? []).reduce((s, f) => s + Number(f.montant_ttc || 0), 0)
    const caCommandes = (commandesPayees ?? []).reduce((s, c) => s + Number(c.montant || 0), 0)
    const ca = Math.round(caFactures + caCommandes)
    try {
      await sb.from('automation_logs').insert({ type: 'monthly_report', payload: { mois: moisKey, ca, factures: caFactures, commandes: caCommandes } })
      result.monthly_report++
    } catch (e) {
      console.error('[cron] rapport mensuel échec', e)
    }
  }

  return NextResponse.json({ ok: true, ran_at: new Date().toISOString(), ...result })
}
