import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { createClient as createSb } from '@supabase/supabase-js'

// Compteurs LIVE de l'enrichissement des contacts (pour le tableau de bord du Hub).
// Lit toute la table site_clients (paginé) et calcule l'état en temps réel.
const admin = () => createSb(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
const empty = (v?: string | null) => !v || !String(v).trim()

async function requireAdmin() {
  const sb = await createServerSupabaseClient()
  const { data: { user } } = await sb.auth.getUser()
  return user?.email === 'berangervives@gmail.com'
}

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const sb = admin()
  type Row = { email?: string | null; telephone?: string | null; notes?: string | null }
  let all: Row[] = []
  for (let f = 0; ; f += 1000) {
    const { data } = await sb.from('site_clients').select('email,telephone,notes').range(f, f + 999)
    if (!data || !data.length) break
    all = all.concat(data as Row[])
    if (data.length < 1000) break
  }

  const total = all.length
  const sansCoord = all.filter(c => empty(c.email) && empty(c.telephone)).length
  const avecTel = all.filter(c => !empty(c.telephone)).length
  const avecMail = all.filter(c => !empty(c.email)).length
  const avecLesDeux = all.filter(c => !empty(c.email) && !empty(c.telephone)).length
  const strictTraites = all.filter(c => (c.notes || '').includes('[STRICT')).length
  const sansSite = all.filter(c => /\[STRICT[^\]]*pas de site officiel/.test(c.notes || '')).length
  const descTrouvees = all.filter(c => (c.notes || '').includes('[DESC ')).length

  // Fil d'activité : dernières fiches enrichies (email/tél trouvés), triées par updated_at desc.
  type Rec = { entreprise?: string; nom?: string; email?: string; telephone?: string; notes?: string; updated_at?: string }
  const { data: recents } = await sb
    .from('site_clients')
    .select('entreprise,nom,email,telephone,notes,updated_at')
    .ilike('notes', '%[STRICT %')
    .order('updated_at', { ascending: false })
    .limit(40)
  const recent: { entreprise: string; type: 'email' | 'tel' | 'both'; detail: string; when: string }[] = []
  for (const r of (recents || []) as Rec[]) {
    const hasEmail = /\[STRICT [^\]]*email \S+/.test(r.notes || '')
    const hasTel = /\[STRICT [^\]]*(?:fixe|mobile) /.test(r.notes || '')
    if (!hasEmail && !hasTel) continue
    recent.push({
      entreprise: r.entreprise || r.nom || '—',
      type: hasEmail && hasTel ? 'both' : hasEmail ? 'email' : 'tel',
      detail: hasEmail ? (r.email || '') : (r.telephone || ''),
      when: r.updated_at || '',
    })
  }

  return NextResponse.json({
    ts: Date.now(),
    total, sansCoord, avecTel, avecMail, avecLesDeux,
    strictTraites, sansSite, descTrouvees,
    recent: recent.slice(0, 15),
  })
}
