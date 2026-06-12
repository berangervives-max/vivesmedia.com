// Accès serveur aux données Google (Search Console + GA4) via compte de service.
// Clé lue depuis GOOGLE_SA_KEY_B64 (base64 du JSON). Aucune dépendance externe.
import 'server-only'
import crypto from 'node:crypto'

const GA4_PROPERTY_ID = '516900135'
const GSC_SITE = 'https://vivesmedia.com/'

type ServiceAccount = {
  client_email: string
  private_key: string
  token_uri: string
}

function getServiceAccount(): ServiceAccount | null {
  const b64 = process.env.GOOGLE_SA_KEY_B64
  if (!b64) return null
  try {
    return JSON.parse(Buffer.from(b64, 'base64').toString('utf8'))
  } catch {
    return null
  }
}

function base64url(input: Buffer | string): string {
  return Buffer.from(input).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
}

// Cache de token en mémoire (par scope) pour éviter de re-signer à chaque appel.
const tokenCache = new Map<string, { token: string; exp: number }>()

async function getAccessToken(scope: string): Promise<string | null> {
  const sa = getServiceAccount()
  if (!sa) return null

  const cached = tokenCache.get(scope)
  const now = Math.floor(Date.now() / 1000)
  if (cached && cached.exp > now + 60) return cached.token

  const header = base64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }))
  const claim = base64url(
    JSON.stringify({ iss: sa.client_email, scope, aud: sa.token_uri, iat: now, exp: now + 3600 }),
  )
  const signature = base64url(
    crypto.createSign('RSA-SHA256').update(`${header}.${claim}`).sign(sa.private_key),
  )
  const jwt = `${header}.${claim}.${signature}`

  const res = await fetch(sa.token_uri, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  })
  const json = (await res.json()) as { access_token?: string }
  if (!json.access_token) return null
  tokenCache.set(scope, { token: json.access_token, exp: now + 3500 })
  return json.access_token
}

export type GscRow = { keys: string[]; clicks: number; impressions: number; ctr: number; position: number }
export type GscData = {
  available: boolean
  totals: { clicks: number; impressions: number; ctr: number; position: number }
  topQueries: GscRow[]
  topPages: GscRow[]
}

function dateStr(daysAgo: number): string {
  return new Date(Date.now() - daysAgo * 86400000).toISOString().slice(0, 10)
}

async function gscQuery(token: string, body: object): Promise<{ rows?: GscRow[] }> {
  const res = await fetch(
    `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(GSC_SITE)}/searchAnalytics/query`,
    { method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(body) },
  )
  if (!res.ok) return {}
  return res.json()
}

/** Données Search Console sur les 28 derniers jours (J-3 → J-31, délai Google). */
export async function getGscData(): Promise<GscData> {
  const empty: GscData = { available: false, totals: { clicks: 0, impressions: 0, ctr: 0, position: 0 }, topQueries: [], topPages: [] }
  const token = await getAccessToken('https://www.googleapis.com/auth/webmasters.readonly')
  if (!token) return empty

  const startDate = dateStr(31)
  const endDate = dateStr(3)

  const [totalsRes, queriesRes, pagesRes] = await Promise.all([
    gscQuery(token, { startDate, endDate }),
    gscQuery(token, { startDate, endDate, dimensions: ['query'], rowLimit: 10 }),
    gscQuery(token, { startDate, endDate, dimensions: ['page'], rowLimit: 10 }),
  ])

  const t = totalsRes.rows?.[0]
  return {
    available: true,
    totals: t
      ? { clicks: t.clicks, impressions: t.impressions, ctr: t.ctr, position: t.position }
      : { clicks: 0, impressions: 0, ctr: 0, position: 0 },
    topQueries: queriesRes.rows ?? [],
    topPages: pagesRes.rows ?? [],
  }
}

export type Ga4Data = {
  available: boolean
  reason?: string
  realtimeUsers: number
  last7: { activeUsers: number; sessions: number; pageViews: number }
  last30: { activeUsers: number; sessions: number; pageViews: number }
  topSources: { source: string; sessions: number }[]
  topPages: { path: string; views: number }[]
}

async function ga4Report(token: string, body: object): Promise<{ rows?: { dimensionValues?: { value: string }[]; metricValues: { value: string }[] }[]; error?: { message: string } }> {
  const res = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${GA4_PROPERTY_ID}:runReport`, {
    method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(body),
  })
  return res.json()
}

/** Données GA4 (trafic + temps réel). Renvoie available:false tant que la Data API n'est pas activée. */
export async function getGa4Data(): Promise<Ga4Data> {
  const empty: Ga4Data = { available: false, realtimeUsers: 0, last7: { activeUsers: 0, sessions: 0, pageViews: 0 }, last30: { activeUsers: 0, sessions: 0, pageViews: 0 }, topSources: [], topPages: [] }
  const token = await getAccessToken('https://www.googleapis.com/auth/analytics.readonly')
  if (!token) return empty

  const metrics = [{ name: 'activeUsers' }, { name: 'sessions' }, { name: 'screenPageViews' }]
  const [r7, r30, sources, pages, rt] = await Promise.all([
    ga4Report(token, { dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }], metrics }),
    ga4Report(token, { dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }], metrics }),
    ga4Report(token, { dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }], dimensions: [{ name: 'sessionDefaultChannelGroup' }], metrics: [{ name: 'sessions' }], limit: 6 }),
    ga4Report(token, { dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }], dimensions: [{ name: 'pagePath' }], metrics: [{ name: 'screenPageViews' }], limit: 8, orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }] }),
    fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${GA4_PROPERTY_ID}:runRealtimeReport`, {
      method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ metrics: [{ name: 'activeUsers' }] }),
    }).then((r) => r.json()).catch(() => ({})),
  ])

  if (r7.error) {
    const apiOff = /has not been used|disabled|SERVICE_DISABLED/i.test(r7.error.message)
    return { ...empty, reason: apiOff ? 'data-api-disabled' : r7.error.message }
  }

  const m = (r: typeof r7, i: number) => Number(r.rows?.[0]?.metricValues?.[i]?.value ?? 0)
  return {
    available: true,
    realtimeUsers: Number((rt as { rows?: { metricValues: { value: string }[] }[] }).rows?.[0]?.metricValues?.[0]?.value ?? 0),
    last7: { activeUsers: m(r7, 0), sessions: m(r7, 1), pageViews: m(r7, 2) },
    last30: { activeUsers: m(r30, 0), sessions: m(r30, 1), pageViews: m(r30, 2) },
    topSources: (sources.rows ?? []).map((row) => ({ source: row.dimensionValues?.[0]?.value ?? '—', sessions: Number(row.metricValues[0].value) })),
    topPages: (pages.rows ?? []).map((row) => ({ path: row.dimensionValues?.[0]?.value ?? '—', views: Number(row.metricValues[0].value) })),
  }
}
