// Indexation automatique : Google Indexing API + IndexNow (Bing/Yandex).
// Appelé côté serveur quand un article est publié dans le CMS.
import 'server-only'
import crypto from 'node:crypto'

const SITE = 'https://vivesmedia.com'

function b64url(input: Buffer | string): string {
  return Buffer.from(input).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
}

async function googleToken(): Promise<string | null> {
  const b64 = process.env.GOOGLE_SA_KEY_B64
  if (!b64) return null
  try {
    const sa = JSON.parse(Buffer.from(b64, 'base64').toString('utf8'))
    const now = Math.floor(Date.now() / 1000)
    const header = b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))
    const claim = b64url(JSON.stringify({
      iss: sa.client_email,
      scope: 'https://www.googleapis.com/auth/indexing',
      aud: sa.token_uri, iat: now, exp: now + 3600,
    }))
    const sig = b64url(crypto.createSign('RSA-SHA256').update(`${header}.${claim}`).sign(sa.private_key))
    const res = await fetch(sa.token_uri, {
      method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${header}.${claim}.${sig}`,
    })
    const j = (await res.json()) as { access_token?: string }
    return j.access_token ?? null
  } catch {
    return null
  }
}

// Google : notifie d'une création/mise à jour d'URL (Indexing API)
export async function submitGoogle(url: string): Promise<{ ok: boolean; detail?: string }> {
  const tok = await googleToken()
  if (!tok) return { ok: false, detail: 'no_token' }
  const r = await fetch('https://indexing.googleapis.com/v3/urlNotifications:publish', {
    method: 'POST',
    headers: { Authorization: `Bearer ${tok}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ url, type: 'URL_UPDATED' }),
  })
  return { ok: r.ok, detail: r.ok ? undefined : `${r.status}` }
}

// IndexNow : Bing + Yandex (et donc visibilité ChatGPT côté Bing). Pas de vérif de propriété.
export async function submitIndexNow(urls: string[]): Promise<{ ok: boolean; detail?: string }> {
  const key = process.env.INDEXNOW_KEY
  if (!key) return { ok: false, detail: 'no_key' }
  const r = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ host: 'vivesmedia.com', key, keyLocation: `${SITE}/${key}.txt`, urlList: urls }),
  })
  return { ok: r.ok, detail: r.ok ? undefined : `${r.status}` }
}

export async function indexUrl(url: string) {
  const [google, indexnow] = await Promise.all([submitGoogle(url), submitIndexNow([url])])
  return { url, google, indexnow }
}
