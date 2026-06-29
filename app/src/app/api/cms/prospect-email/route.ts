import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { createClient as createSb } from '@supabase/supabase-js'

// Envoi d'un email de prospection personnalisé, contact par contact, depuis la fiche.
// Admin uniquement. Part de contact@vivesmedia.com via Resend. Trace dans automation_logs.
const FROM = 'Béranger Vives <contact@vivesmedia.com>'
// Boîte Gmail qui reçoit une copie des envois ET les réponses des prospects
// (le domaine vivesmedia.com n'a pas de MX → il ne peut pas recevoir d'email).
const NOTIFY = process.env.PROSPECT_NOTIFY_EMAIL || 'vivesmediacontact@gmail.com'
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
  const { to, subject, body, kind, clientId, scheduledAt } = await req.json().catch(() => ({}))
  if (!to || !subject || !body) return NextResponse.json({ error: 'to, subject, body requis' }, { status: 400 })
  const isScheduled = typeof scheduledAt === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(scheduledAt)
  // Tags Resend (ASCII/chiffres/_/- uniquement) → permettent d'attribuer ouvertures/clics
  const tags: { name: string; value: string }[] = []
  if (typeof kind === 'string' && /^[A-Za-z0-9_-]{1,40}$/.test(kind)) tags.push({ name: 'kind', value: kind })
  if (typeof clientId === 'string' && /^[A-Za-z0-9-]{6,40}$/.test(clientId)) tags.push({ name: 'prospect_id', value: clientId })

  // Rendu sobre/personnel (meilleure délivrabilité en cold email qu'un template marketing)
  const toLc = String(to).toLowerCase()
  const cid = typeof clientId === 'string' ? clientId : ''
  const wrapDiv = (inner: string) => `<div style="font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;font-size:15px;line-height:1.6;color:#1a1a1a">${inner}</div>`
  const escaped = esc(body).split(/\n{2,}/).map(p => p.replace(/\n/g, '<br/>'))
  // Version envoyée au prospect : liens traçés (clics) + pixel d'ouverture
  const pixel = `<img src="${BASE}/api/track/open?pid=${encodeURIComponent(cid)}&e=${encodeURIComponent(toLc)}" width="1" height="1" alt="" style="display:none;width:1px;height:1px" />`
  const html = wrapDiv(escaped.map(p => `<p style="margin:0 0 14px">${trackLinks(p, cid, toLc)}</p>`).join('')) + pixel
  // Version « copie » pour la boîte Gmail : SANS tracking (n'altère pas les stats d'ouverture/clic)
  const plainHtml = wrapDiv(escaped.map(p => `<p style="margin:0 0 14px">${p}</p>`).join(''))

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: FROM, to, subject, html, reply_to: NOTIFY, ...(tags.length ? { tags } : {}), ...(isScheduled ? { scheduled_at: scheduledAt } : {}) }),
  })
  if (!res.ok) {
    const err = await res.text()
    return NextResponse.json({ error: `Resend : ${err}` }, { status: 502 })
  }
  const sent = await res.json().catch(() => ({}))
  const admin = createSb(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

  // Copie immédiate dans la boîte Gmail — uniquement pour un envoi immédiat (pas pour un programmé)
  if (!isScheduled) {
    try {
      const copyHtml = `<p style="font-family:Arial,sans-serif;font-size:13px;color:#888;margin:0 0 8px">📤 Copie — email de prospection envoyé à <b>${esc(String(to))}</b> le ${new Date().toLocaleString('fr-FR')}. Les réponses arriveront directement ici.</p><hr style="border:none;border-top:1px solid #eee"/>${plainHtml}`
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ from: FROM, to: NOTIFY, subject: `📤 ${to} — ${subject}`, html: copyHtml }),
      })
    } catch { /* copie best-effort */ }
  }
  // Trace dans le suivi (apparaît dans « Suivi prospection ») — même pour un envoi programmé
  try {
    await admin.from('automation_logs').insert({ type: 'prospect_email', payload: { to: String(to).toLowerCase(), subject, kind: kind || null, prospect_id: clientId || null, email_id: sent?.id || null, scheduled: isScheduled || undefined, at: isScheduled ? scheduledAt : new Date().toISOString() } })
  } catch { /* trace best-effort */ }
  // Pour un envoi programmé : marqueur gérable depuis « Envois programmés »
  if (isScheduled && clientId && sent?.id) {
    try {
      const { data: row } = await admin.from('site_clients').select('notes').eq('id', clientId).single()
      const marker = `\n[ENVOI_PROGRAMME id=${sent.id} when=${scheduledAt} to=${String(to).toLowerCase()} statut=programmé]`
      await admin.from('site_clients').update({ notes: (row?.notes || '') + marker }).eq('id', clientId)
    } catch { /* marqueur best-effort */ }
  }
  return NextResponse.json({ ok: true, scheduled: isScheduled, id: sent?.id })
}
