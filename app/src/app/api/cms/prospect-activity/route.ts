import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { createClient as createSb } from '@supabase/supabase-js'

// Suivi de prospection : timeline d'un prospect (emails envoyés/ouverts/cliqués,
// appels, SMS) + journalisation manuelle d'un appel ou d'un SMS depuis la fiche.
// Admin uniquement. S'appuie sur la table automation_logs (type + payload jsonb).

const ADMIN = 'berangervives@gmail.com'
const ACT_TYPES = ['prospect_email', 'email_open', 'email_click', 'email_bounce', 'prospect_call', 'prospect_sms']

async function admin(req: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user?.email === ADMIN ? user : null
}
const svc = () => createSb(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

// GET ?email=... → timeline pour ce prospect (+ ?summary=1 → compteurs globaux)
export async function GET(req: NextRequest) {
  if (!(await admin(req))) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const sb = svc()
  const summary = req.nextUrl.searchParams.get('summary')
  if (summary) {
    const { data } = await sb.from('automation_logs').select('type').in('type', ACT_TYPES)
    const counts: Record<string, number> = {}
    for (const r of data || []) counts[r.type] = (counts[r.type] || 0) + 1
    return NextResponse.json({ counts })
  }
  // Flux global : toutes les activités récentes, avec le nom du prospect résolu
  if (req.nextUrl.searchParams.get('feed')) {
    const { data } = await sb.from('automation_logs').select('id,type,payload,created_at')
      .in('type', ACT_TYPES).order('created_at', { ascending: false }).limit(400)
    const rows = data || []
    const ids = [...new Set(rows.map(r => r.payload?.prospect_id).filter(Boolean))] as string[]
    const mails = [...new Set(rows.map(r => (r.payload?.to || '').toString().toLowerCase()).filter(Boolean))] as string[]
    const byId: Record<string, { id: string; nom: string; secteur?: string }> = {}
    const byMail: Record<string, { id: string; nom: string; secteur?: string }> = {}
    if (ids.length) { const { data: cs } = await sb.from('site_clients').select('id,nom,secteur').in('id', ids); (cs || []).forEach(c => { byId[c.id] = c }) }
    if (mails.length) { const { data: cs } = await sb.from('site_clients').select('id,nom,secteur,email').in('email', mails); (cs || []).forEach(c => { if (c.email) byMail[c.email.toLowerCase()] = { id: c.id, nom: c.nom, secteur: c.secteur } }) }
    const events = rows.map(r => ({ ...r, client: byId[r.payload?.prospect_id] || byMail[(r.payload?.to || '').toString().toLowerCase()] || null }))
    return NextResponse.json({ events })
  }
  const email = (req.nextUrl.searchParams.get('email') || '').toLowerCase().trim()
  const pid = (req.nextUrl.searchParams.get('pid') || '').trim()
  if (!email && !pid) return NextResponse.json({ events: [] })
  // On récupère les logs d'activité récents et on filtre par prospect_id OU destinataire
  const { data } = await sb.from('automation_logs').select('id,type,payload,created_at')
    .in('type', ACT_TYPES).order('created_at', { ascending: false }).limit(800)
  const events = (data || []).filter(r => {
    const to = (r.payload?.to || '').toString().toLowerCase()
    return (pid && r.payload?.prospect_id === pid) || (!!email && to === email)
  })
  return NextResponse.json({ events })
}

// POST {clientId, email?, phone?, kind:'call'|'sms', note?} → journalise une action manuelle
export async function POST(req: NextRequest) {
  if (!(await admin(req))) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const { clientId, email, phone, kind, note } = await req.json().catch(() => ({}))
  if (!['call', 'sms'].includes(kind)) return NextResponse.json({ error: 'kind requis' }, { status: 400 })
  if (!clientId && !email) return NextResponse.json({ error: 'clientId ou email requis' }, { status: 400 })
  const type = kind === 'call' ? 'prospect_call' : 'prospect_sms'
  await svc().from('automation_logs').insert({ type, payload: { prospect_id: clientId || null, to: email ? String(email).toLowerCase() : null, phone: phone || null, note: note || '', at: new Date().toISOString() } })
  return NextResponse.json({ ok: true })
}
