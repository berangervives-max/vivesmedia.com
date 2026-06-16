// Lecture Google Search Console (compte de service) — rapport positions vivesmedia.com
// Usage : GOOGLE_SA_KEY_B64=... node scripts/gsc-report.mjs
import crypto from 'node:crypto'

const SITE = 'https://vivesmedia.com/'
const SCOPE = 'https://www.googleapis.com/auth/webmasters.readonly'
const sa = JSON.parse(Buffer.from(process.env.GOOGLE_SA_KEY_B64, 'base64').toString('utf8'))
const b64u = (x) => Buffer.from(x).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')

async function token() {
  const now = Math.floor(Date.now() / 1000)
  const h = b64u(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))
  const c = b64u(JSON.stringify({ iss: sa.client_email, scope: SCOPE, aud: sa.token_uri, iat: now, exp: now + 3600 }))
  const sig = b64u(crypto.createSign('RSA-SHA256').update(`${h}.${c}`).sign(sa.private_key))
  const r = await fetch(sa.token_uri, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${h}.${c}.${sig}` })
  return (await r.json()).access_token
}

async function query(tok, dims) {
  const end = new Date().toISOString().slice(0, 10)
  const start = new Date(Date.now() - 180 * 86400000).toISOString().slice(0, 10)
  const r = await fetch(`https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(SITE)}/searchAnalytics/query`,
    { method: 'POST', headers: { Authorization: `Bearer ${tok}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ startDate: start, endDate: end, dimensions: dims, rowLimit: 30 }) })
  if (!r.ok) return { error: `${r.status} ${await r.text()}` }
  return r.json()
}

const tok = await token()
if (!tok) { console.error('Pas de token (clé SA invalide ?)'); process.exit(1) }

const q = await query(tok, ['query'])
const p = await query(tok, ['page'])

console.log('\n=== TOP REQUÊTES (180 j) — clics | impressions | position ===')
;(q.rows || []).sort((a, b) => b.impressions - a.impressions).slice(0, 25).forEach(r =>
  console.log(`${String(r.clicks).padStart(4)} | ${String(r.impressions).padStart(6)} | pos ${r.position.toFixed(1).padStart(5)} | ${r.keys[0]}`))
if (q.error) console.log('Erreur requêtes:', q.error)

console.log('\n=== TOP PAGES — clics | impressions | position ===')
;(p.rows || []).sort((a, b) => b.impressions - a.impressions).slice(0, 15).forEach(r =>
  console.log(`${String(r.clicks).padStart(4)} | ${String(r.impressions).padStart(6)} | pos ${r.position.toFixed(1).padStart(5)} | ${r.keys[0].replace('https://vivesmedia.com', '')}`))
if (p.error) console.log('Erreur pages:', p.error)

const tot = (q.rows || []).reduce((a, r) => ({ c: a.c + r.clicks, i: a.i + r.impressions }), { c: 0, i: 0 })
console.log(`\n=== TOTAL ~180j : ${tot.c} clics · ${tot.i} impressions ===`)
