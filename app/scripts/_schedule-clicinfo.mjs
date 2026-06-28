// Programme l'envoi de l'email perso Clic'Info pour lundi 29/06 9h (Resend scheduled_at).
import { readFileSync } from 'node:fs'
import { createClient } from '@supabase/supabase-js'

const env = {}
for (const line of readFileSync(new URL('../.env.local', import.meta.url), 'utf8').split('\n')) {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/); if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '')
}
const RESEND = env.RESEND_API_KEY
const SB_URL = env.SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL
const SB_KEY = env.SUPABASE_SERVICE_ROLE_KEY
if (!RESEND) { console.error('RESEND_API_KEY manquant'); process.exit(1) }
const sb = createClient(SB_URL, SB_KEY)

const ID = '11ebfa2e-0d63-4ded-8921-506f960f1ae7'
const TO = 'contact@clic-info.fr'
const FROM = 'Béranger Vives <contact@vivesmedia.com>'
const REPLY = env.PROSPECT_NOTIFY_EMAIL || 'vivesmediacontact@gmail.com'
const WHEN = '2026-06-29T09:00:00+02:00' // lundi 9h Paris

const { data } = await sb.from('site_clients').select('notes').eq('id', ID).single()
const n = data.notes || ''
if (n.includes('[PROGRAMMÉ Resend')) { console.log('⚠️ Déjà programmé — abandon pour éviter un doublon.'); process.exit(0) }

// parse objet + corps (même logique que le Hub)
const MARK = '==== EMAIL PERSONNALISÉ ===='
const block = n.slice(n.indexOf(MARK) + MARK.length).trim()
const m = block.match(/^Objet\s*:\s*(.+)$/m)
const subject = m[1].trim()
const body = block.slice(block.indexOf(m[0]) + m[0].length).trim()

const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const html = `<div style="font-family:-apple-system,Segoe UI,Roboto,Arial,sans-serif;font-size:15px;line-height:1.6;color:#1a1a1a">` +
  esc(body).split(/\n{2,}/).map(p => `<p style="margin:0 0 14px">${p.replace(/\n/g, '<br/>')}</p>`).join('') + `</div>`

const res = await fetch('https://api.resend.com/emails', {
  method: 'POST',
  headers: { Authorization: `Bearer ${RESEND}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({ from: FROM, to: TO, subject, html, reply_to: REPLY, scheduled_at: WHEN }),
})
const out = await res.json().catch(() => ({}))
if (!res.ok) { console.error('Échec Resend :', JSON.stringify(out)); process.exit(1) }

console.log('✓ PROGRAMMÉ pour lundi 29/06 9h — Resend id:', out.id)
// trace dans la fiche CRM (annulable via cet id)
const stamp = `\n\n[PROGRAMMÉ Resend ${WHEN} → ${TO} | id ${out.id} | annulable]`
await sb.from('site_clients').update({ notes: n + stamp }).eq('id', ID)
console.log('✓ Fiche CRM mise à jour (trace + id).')
