import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { createClient as createSb } from '@supabase/supabase-js'

// Envoi d'un email de prospection personnalisé, contact par contact, depuis la fiche.
// Admin uniquement. Part de contact@vivesmedia.com via Resend. Trace dans automation_logs.
const FROM = 'Béranger Vives <contact@vivesmedia.com>'
const BASE = process.env.NEXT_PUBLIC_SITE_URL || 'https://vivesmedia.com'
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

// Réécrit les liens d'un texte (déjà échappé) vers le tracker de clics + style orange
function trackLinks(escaped: string, clientId: string, to: string): string {
  const wrap = (raw: string, label: string) =>
    `<a href="${BASE}/api/track/click?pid=${encodeURIComponent(clientId)}&e=${encodeURIComponent(to)}&u=${encodeURIComponent(raw)}" style="color:#F4521E;text-decoration:underline">${label}</a>`
  // 1) URLs complètes http(s)
  let s = escaped.replace(/(https?:\/\/[^\s<]+)/g, m => wrap(m, m))
  // 2) www. sans schéma
  s = s.replace(/(^|[\s(])(www\.[^\s<]+)/g, (_m, pre, d) => `${pre}${wrap('https://' + d, d)}`)
  // 3) le domaine de marque en clair (signature) — hors URL/anchor déjà créés
  s = s.replace(/(^|[\s(>])(vivesmedia\.com)(?![^<]*<\/a>)/g, (_m, pre, d) => `${pre}${wrap('https://vivesmedia.com', d)}`)
  return s
}

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== 'berangervives@gmail.com') {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }
  const { to, subject, body, kind, clientId } = await req.json().catch(() => ({}))
  if (!to || !subject || !body) return NextResponse.json({ error: 'to, subject, body requis' }, { status: 400 })
  // Tags Resend (ASCII/chiffres/_/- uniquement) → permettent d'attribuer ouvertures/clics
  const tags: { name: string; value: string }[] = []
  if (typeof kind === 'string' && /^[A-Za-z0-9_-]{1,40}$/.test(kind)) tags.push({ name: 'kind', value: kind })
  if (typeof clientId === 'string' && /^[A-Za-z0-9-]{6,40}$/.test(clientId)) tags.push({ name: 'prospect_id', value: clientId })

  // Rendu sobre/personnel (meilleure délivrabilité en cold email qu'un template marketing)
  // + liens traçés (clics) + pixel de tracking d'ouverture (auto-hébergés)
  const toLc = String(to).toLowerCase()
  const cid = typeof clientId === 'string' ? clientId : ''
  const paras = esc(body).split(/\n{2,}/).map(p => `<p style="margin:0 0 14px">${trackLinks(p.replace(/\n/g, '<br/>'), cid, toLc)}</p>`).join('')
  const pixel = `<img src="${BASE}/api/track/open?pid=${encodeURIComponent(cid)}&e=${encodeURIComponent(toLc)}" width="1" height="1" alt="" style="display:none;width:1px;height:1px" />`
  const html = `<div style="font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;font-size:15px;line-height:1.6;color:#1a1a1a">${paras}</div>${pixel}`

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: FROM, to, subject, html, reply_to: 'contact@vivesmedia.com', ...(tags.length ? { tags } : {}) }),
  })
  if (!res.ok) {
    const err = await res.text()
    return NextResponse.json({ error: `Resend : ${err}` }, { status: 502 })
  }
  const sent = await res.json().catch(() => ({}))
  try {
    const admin = createSb(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
    await admin.from('automation_logs').insert({ type: 'prospect_email', payload: { to: String(to).toLowerCase(), subject, kind: kind || null, prospect_id: clientId || null, email_id: sent?.id || null, at: new Date().toISOString() } })
  } catch { /* trace best-effort */ }
  return NextResponse.json({ ok: true })
}
