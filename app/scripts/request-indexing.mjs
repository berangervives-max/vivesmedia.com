// Demande d'indexation automatique via Google Indexing API (compte de service).
// Usage : GOOGLE_SA_KEY_B64=... node scripts/request-indexing.mjs [url1 url2 ...]
import crypto from 'node:crypto'

const SCOPE = 'https://www.googleapis.com/auth/indexing'
const sa = JSON.parse(Buffer.from(process.env.GOOGLE_SA_KEY_B64, 'base64').toString('utf8'))
const b64u = (x) => Buffer.from(x).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')

const urls = process.argv.slice(2)
if (!urls.length) {
  // par défaut : les 3 articles déjà publiés (test)
  urls.push(
    'https://vivesmedia.com/blog/prix-site-ecommerce-shopify-2026',
    'https://vivesmedia.com/blog/shopify-woocommerce-prestashop-comparatif-2026',
    'https://vivesmedia.com/blog/geo-tpe-pme-chatgpt-perplexity-2026',
  )
}

async function token() {
  const now = Math.floor(Date.now() / 1000)
  const h = b64u(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))
  const c = b64u(JSON.stringify({ iss: sa.client_email, scope: SCOPE, aud: sa.token_uri, iat: now, exp: now + 3600 }))
  const sig = b64u(crypto.createSign('RSA-SHA256').update(`${h}.${c}`).sign(sa.private_key))
  const r = await fetch(sa.token_uri, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${h}.${c}.${sig}` })
  return (await r.json()).access_token
}

const tok = await token()
if (!tok) { console.error('❌ Pas de token (clé SA invalide)'); process.exit(1) }

for (const url of urls) {
  const r = await fetch('https://indexing.googleapis.com/v3/urlNotifications:publish', {
    method: 'POST',
    headers: { Authorization: `Bearer ${tok}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ url, type: 'URL_UPDATED' }),
  })
  const body = await r.text()
  console.log(`${r.status === 200 ? '✅' : '❌ ' + r.status} ${url}`)
  if (r.status !== 200) console.log('   →', body.replace(/\s+/g, ' ').slice(0, 200))
}
