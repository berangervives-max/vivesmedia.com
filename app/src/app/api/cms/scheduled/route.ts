import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { createClient as createSb } from '@supabase/supabase-js'

// Gestion des envois programmés (emails planifiés via Resend `scheduled_at`).
// Source de vérité : un marqueur dans les notes du prospect :
//   [ENVOI_PROGRAMME id=<resendId> when=<ISO> to=<email> statut=programmé|annulé]
// GET  → liste · POST {action:'cancel'|'reschedule', prospectId, id, when?} → agit sur Resend + maj du marqueur.

const RE = /\[ENVOI_PROGRAMME id=([\w-]+) when=(\S+) to=(\S+) statut=([^\]\s]+)\]/g
const admin = () => createSb(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

async function requireAdmin() {
  const sb = await createServerSupabaseClient()
  const { data: { user } } = await sb.auth.getUser()
  return user?.email === 'berangervives@gmail.com'
}

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const sb = admin()
  const { data } = await sb.from('site_clients').select('id,nom,entreprise,email,notes')
  const out: Record<string, unknown>[] = []
  for (const c of data || []) {
    const notes = (c as { notes?: string }).notes || ''
    for (const m of notes.matchAll(RE)) {
      out.push({
        prospectId: (c as { id: string }).id,
        nom: (c as { nom?: string }).nom, entreprise: (c as { entreprise?: string }).entreprise,
        id: m[1], when: m[2], to: m[3], statut: m[4],
      })
    }
  }
  out.sort((a, b) => String(a.when).localeCompare(String(b.when)))
  return NextResponse.json({ items: out })
}

export async function POST(req: NextRequest) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const { action, prospectId, id, when } = await req.json().catch(() => ({}))
  if (!action || !prospectId || !id) return NextResponse.json({ error: 'action, prospectId, id requis' }, { status: 400 })
  const sb = admin()
  const { data: row } = await sb.from('site_clients').select('notes').eq('id', prospectId).single()
  let notes: string = row?.notes || ''
  const KEY = process.env.RESEND_API_KEY

  if (action === 'cancel') {
    const r = await fetch(`https://api.resend.com/emails/${id}/cancel`, { method: 'POST', headers: { Authorization: `Bearer ${KEY}` } })
    if (!r.ok && r.status !== 404) return NextResponse.json({ error: `Resend: ${await r.text()}` }, { status: 502 })
    notes = notes.replace(new RegExp(`(\\[ENVOI_PROGRAMME id=${id} when=\\S+ to=\\S+ statut=)[^\\]\\s]+(\\])`), `$1annulé$2`)
    await sb.from('site_clients').update({ notes }).eq('id', prospectId)
    return NextResponse.json({ ok: true })
  }

  if (action === 'reschedule') {
    if (!when) return NextResponse.json({ error: 'when requis' }, { status: 400 })
    const r = await fetch(`https://api.resend.com/emails/${id}`, {
      method: 'PATCH', headers: { Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ scheduled_at: when }),
    })
    if (!r.ok) return NextResponse.json({ error: `Resend: ${await r.text()}` }, { status: 502 })
    notes = notes.replace(new RegExp(`(\\[ENVOI_PROGRAMME id=${id} when=)\\S+( to=\\S+ statut=)[^\\]\\s]+(\\])`), `$1${when}$2programmé$3`)
    await sb.from('site_clients').update({ notes }).eq('id', prospectId)
    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ error: 'action inconnue' }, { status: 400 })
}
