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
export type DayPoint = { date: string; [k: string]: number | string }
export type GscData = {
  available: boolean
  totals: { clicks: number; impressions: number; ctr: number; position: number }
  topQueries: GscRow[]
  topPages: GscRow[]
  series: DayPoint[]
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
  const empty: GscData = { available: false, totals: { clicks: 0, impressions: 0, ctr: 0, position: 0 }, topQueries: [], topPages: [], series: [] }
  const token = await getAccessToken('https://www.googleapis.com/auth/webmasters.readonly')
  if (!token) return empty

  const startDate = dateStr(31)
  const endDate = dateStr(3)

  const [totalsRes, queriesRes, pagesRes, dateRes] = await Promise.all([
    gscQuery(token, { startDate, endDate }),
    gscQuery(token, { startDate, endDate, dimensions: ['query'], rowLimit: 25 }),
    gscQuery(token, { startDate, endDate, dimensions: ['page'], rowLimit: 10 }),
    gscQuery(token, { startDate, endDate, dimensions: ['date'], rowLimit: 60 }),
  ])

  const t = totalsRes.rows?.[0]
  return {
    available: true,
    totals: t
      ? { clicks: t.clicks, impressions: t.impressions, ctr: t.ctr, position: t.position }
      : { clicks: 0, impressions: 0, ctr: 0, position: 0 },
    topQueries: queriesRes.rows ?? [],
    topPages: pagesRes.rows ?? [],
    series: (dateRes.rows ?? []).map((r) => ({ date: r.keys[0].slice(5), clics: r.clicks, impressions: r.impressions })),
  }
}

export type Ga4Data = {
  available: boolean
  reason?: string
  realtimeUsers: number
  last7: { activeUsers: number; sessions: number; pageViews: number }
  last30: { activeUsers: number; sessions: number; pageViews: number }
  trendSessionsPct: number
  series: DayPoint[]
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
  const empty: Ga4Data = { available: false, realtimeUsers: 0, last7: { activeUsers: 0, sessions: 0, pageViews: 0 }, last30: { activeUsers: 0, sessions: 0, pageViews: 0 }, trendSessionsPct: 0, series: [], topSources: [], topPages: [] }
  const token = await getAccessToken('https://www.googleapis.com/auth/analytics.readonly')
  if (!token) return empty

  const metrics = [{ name: 'activeUsers' }, { name: 'sessions' }, { name: 'screenPageViews' }]
  const [r7, r30, daily, sources, pages, rt] = await Promise.all([
    ga4Report(token, { dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }], metrics }),
    ga4Report(token, { dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }], metrics }),
    ga4Report(token, { dateRanges: [{ startDate: '29daysAgo', endDate: 'today' }], dimensions: [{ name: 'date' }], metrics: [{ name: 'sessions' }, { name: 'activeUsers' }], orderBys: [{ dimension: { dimensionName: 'date' } }] }),
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
  const series: DayPoint[] = (daily.rows ?? []).map((row) => {
    const d = row.dimensionValues?.[0]?.value ?? '' // YYYYMMDD
    return { date: `${d.slice(4, 6)}-${d.slice(6, 8)}`, sessions: Number(row.metricValues[0].value), visiteurs: Number(row.metricValues[1].value) }
  })
  // tendance : 7 derniers jours vs 7 précédents (sur la série)
  const ses = series.map((p) => Number(p.sessions))
  const last7 = ses.slice(-7).reduce((a, b) => a + b, 0)
  const prev7 = ses.slice(-14, -7).reduce((a, b) => a + b, 0)
  const trendSessionsPct = prev7 > 0 ? Math.round(((last7 - prev7) / prev7) * 100) : 0

  return {
    available: true,
    realtimeUsers: Number((rt as { rows?: { metricValues: { value: string }[] }[] }).rows?.[0]?.metricValues?.[0]?.value ?? 0),
    last7: { activeUsers: m(r7, 0), sessions: m(r7, 1), pageViews: m(r7, 2) },
    last30: { activeUsers: m(r30, 0), sessions: m(r30, 1), pageViews: m(r30, 2) },
    trendSessionsPct,
    series,
    topSources: (sources.rows ?? []).map((row) => ({ source: row.dimensionValues?.[0]?.value ?? '—', sessions: Number(row.metricValues[0].value) })),
    topPages: (pages.rows ?? []).map((row) => ({ path: row.dimensionValues?.[0]?.value ?? '—', views: Number(row.metricValues[0].value) })),
  }
}

export type PostHogData = {
  available: boolean
  recordingsCount: number
  avgSessionSec: number
  bounceRate: number
  rageClicks: number
  deadClicks: number
  topClicks: { label: string; count: number }[]
  frictionPages: { path: string; rage: number }[]
  series: DayPoint[]
  devices: { device: string; sessions: number }[]
}

async function hogql(sql: string): Promise<unknown[][] | null> {
  const key = process.env.POSTHOG_PERSONAL_API_KEY
  const pid = process.env.POSTHOG_PROJECT_ID
  if (!key || !pid) return null
  const res = await fetch(`https://eu.posthog.com/api/projects/${pid}/query/`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: { kind: 'HogQLQuery', query: sql } }),
  })
  if (!res.ok) return null
  const json = (await res.json()) as { results?: unknown[][] }
  return json.results ?? null
}

export type Insight = {
  severity: 'opportunity' | 'warning' | 'good'
  title: string
  detail: string
  action: string
}

/** Génère des axes d'amélioration concrets à partir des données réelles. */
export function buildInsights(gsc: GscData, ga4: Ga4Data, ph: PostHogData): Insight[] {
  const out: Insight[] = []

  // 1. Mots-clés en page 2 (position 8-20) avec impressions = opportunités de remontée
  const page2 = gsc.topQueries
    .filter((q) => q.position > 7.5 && q.position <= 20 && q.impressions >= 3)
    .sort((a, b) => b.impressions - a.impressions)
    .slice(0, 3)
  for (const q of page2) {
    out.push({
      severity: 'opportunity',
      title: `« ${q.keys[0]} » est en position ${q.position.toFixed(0)}`,
      detail: `${q.impressions} impressions mais seulement ${q.clicks} clic(s). Tu es à la porte de la page 1.`,
      action: `Crée/enrichis une page dédiée à « ${q.keys[0] }» (titre, H1, contenu) pour gagner des places.`,
    })
  }

  // 2. Fort potentiel : beaucoup d'impressions, CTR faible, déjà en page 1
  const lowCtr = gsc.topQueries
    .filter((q) => q.position <= 10 && q.impressions >= 10 && q.ctr < 0.03)
    .sort((a, b) => b.impressions - a.impressions)
    .slice(0, 2)
  for (const q of lowCtr) {
    out.push({
      severity: 'warning',
      title: `CTR faible sur « ${q.keys[0]} »`,
      detail: `Position ${q.position.toFixed(1)}, ${q.impressions} impressions, mais CTR de ${(q.ctr * 100).toFixed(1)} %.`,
      action: `Réécris le titre et la meta description de la page pour donner plus envie de cliquer.`,
    })
  }

  // 3. Tendance de trafic GA4
  if (ga4.available) {
    if (ga4.trendSessionsPct >= 15) {
      out.push({ severity: 'good', title: `Trafic en hausse de ${ga4.trendSessionsPct} %`, detail: `Tes sessions des 7 derniers jours dépassent la semaine précédente.`, action: `Identifie quelle source/page a porté cette hausse et capitalise dessus.` })
    } else if (ga4.trendSessionsPct <= -15) {
      out.push({ severity: 'warning', title: `Trafic en baisse de ${Math.abs(ga4.trendSessionsPct)} %`, detail: `Tes sessions reculent vs la semaine précédente.`, action: `Publie un contenu/post LinkedIn et vérifie qu'aucune page clé n'a chuté dans Google.` })
    }
  }

  // 4. Dépendance au trafic Direct (peu d'acquisition)
  const total = ga4.topSources.reduce((a, s) => a + s.sessions, 0)
  const direct = ga4.topSources.find((s) => /direct/i.test(s.source))
  if (total > 0 && direct && direct.sessions / total > 0.7) {
    out.push({
      severity: 'opportunity',
      title: 'Trafic très dépendant du « Direct »',
      detail: `${Math.round((direct.sessions / total) * 100)} % de tes sessions sont en accès direct — peu d'acquisition SEO/réseaux.`,
      action: `Travaille le SEO (contenus ciblés) et poste régulièrement sur LinkedIn/Instagram pour diversifier tes sources.`,
    })
  }

  // 5. Page star à capitaliser
  if (gsc.topPages[0] && gsc.topPages[0].clicks > 0) {
    const p = gsc.topPages[0]
    out.push({
      severity: 'good',
      title: `Ta page la plus performante`,
      detail: `${p.keys[0].replace('https://vivesmedia.com', '') || '/'} génère ${p.clicks} clics et ${p.impressions} impressions.`,
      action: `Ajoute des liens internes depuis cette page vers tes pages services pour diffuser son autorité.`,
    })
  }

  // 6. Indexation jeune
  if (gsc.totals.impressions < 50) {
    out.push({
      severity: 'opportunity',
      title: 'Site récemment (ré)indexé',
      detail: `Encore peu d'impressions Google — c'est normal après la bascule. Les données vont monter.`,
      action: `Demande l'indexation de tes pages clés dans Search Console et publie 1 article de blog par semaine.`,
    })
  }

  return out.slice(0, 6)
}

async function phRecordingsCount(): Promise<number> {
  const key = process.env.POSTHOG_PERSONAL_API_KEY
  const pid = process.env.POSTHOG_PROJECT_ID
  if (!key || !pid) return 0
  try {
    const r = await fetch(`https://eu.posthog.com/api/projects/${pid}/session_recordings?limit=1`, { headers: { Authorization: `Bearer ${key}` } })
    if (!r.ok) return 0
    const j = (await r.json()) as { results?: unknown[] }
    return (j.results ?? []).length
  } catch {
    return 0
  }
}

/** Stats PostHog orientées COMPORTEMENT/UX (et non trafic, déjà couvert par GA4). */
export async function getPostHogData(): Promise<PostHogData> {
  const empty: PostHogData = { available: false, recordingsCount: 0, avgSessionSec: 0, bounceRate: 0, rageClicks: 0, deadClicks: 0, topClicks: [], frictionPages: [], series: [], devices: [] }
  try {
    const [sessions, rage, dead, clicks, friction, daily, devices, recCount] = await Promise.all([
      hogql("SELECT avg(session.$session_duration) AS dur, count() AS n, countIf(session.$pageview_count <= 1) AS bounces FROM sessions AS session WHERE session.$start_timestamp > now() - INTERVAL 30 DAY"),
      hogql("SELECT count() AS c FROM events WHERE event = '$rageclick' AND timestamp > now() - INTERVAL 30 DAY"),
      hogql("SELECT count() AS c FROM events WHERE event = '$dead_click' AND timestamp > now() - INTERVAL 30 DAY"),
      hogql("SELECT properties.$el_text AS el, count() AS c FROM events WHERE event = '$autocapture' AND properties.$event_type = 'click' AND isNotNull(properties.$el_text) AND properties.$el_text != '' AND properties.$pathname NOT LIKE '/cms%' AND timestamp > now() - INTERVAL 30 DAY GROUP BY el ORDER BY c DESC LIMIT 8"),
      hogql("SELECT properties.$pathname AS p, count() AS c FROM events WHERE event = '$rageclick' AND timestamp > now() - INTERVAL 30 DAY GROUP BY p ORDER BY c DESC LIMIT 5"),
      hogql("SELECT toDate(timestamp) AS d, count() AS pv, count(DISTINCT person_id) AS v FROM events WHERE event = '$pageview' AND timestamp > now() - INTERVAL 30 DAY GROUP BY d ORDER BY d"),
      hogql("SELECT properties.$device_type AS device, count(DISTINCT $session_id) AS s FROM events WHERE timestamp > now() - INTERVAL 30 DAY AND device != '' GROUP BY device ORDER BY s DESC LIMIT 4"),
      phRecordingsCount(),
    ])
    if (!sessions) return empty
    const n = Number(sessions[0]?.[1] ?? 0)
    const bounces = Number(sessions[0]?.[2] ?? 0)
    return {
      available: true,
      recordingsCount: recCount,
      avgSessionSec: Math.round(Number(sessions[0]?.[0] ?? 0)),
      bounceRate: n > 0 ? Math.round((bounces / n) * 100) : 0,
      rageClicks: Number(rage?.[0]?.[0] ?? 0),
      deadClicks: Number(dead?.[0]?.[0] ?? 0),
      topClicks: (clicks ?? []).map((row) => ({ label: String(row[0] ?? '').slice(0, 40), count: Number(row[1]) })),
      frictionPages: (friction ?? []).map((row) => ({ path: String(row[0] ?? '/') || '/', rage: Number(row[1]) })),
      series: (daily ?? []).map((row) => ({ date: String(row[0] ?? '').slice(5), vues: Number(row[1]), visiteurs: Number(row[2]) })),
      devices: (devices ?? []).map((row) => ({ device: String(row[0] ?? '—') || '—', sessions: Number(row[1]) })),
    }
  } catch {
    return empty
  }
}
