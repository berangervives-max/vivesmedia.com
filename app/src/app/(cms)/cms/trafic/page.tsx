'use client'
import { useEffect, useState } from 'react'
import {
  Globe, Eye, MousePointerClick, Search, TrendingUp, TrendingDown, Radio, ExternalLink,
  RefreshCw, Lightbulb, AlertTriangle, CheckCircle2, ArrowUpRight,
} from 'lucide-react'
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar, Cell,
} from 'recharts'

const ORANGE = '#F4521E'

type GscRow = { keys: string[]; clicks: number; impressions: number; ctr: number; position: number }
type Day = { date: string; [k: string]: number | string }
type Insight = { severity: 'opportunity' | 'warning' | 'good'; title: string; detail: string; action: string }
type Data = {
  gsc: { available: boolean; totals: { clicks: number; impressions: number; ctr: number; position: number }; topQueries: GscRow[]; topPages: GscRow[]; series: Day[] }
  ga4: { available: boolean; reason?: string; realtimeUsers: number; last30: { activeUsers: number; sessions: number; pageViews: number }; trendSessionsPct: number; series: Day[]; topSources: { source: string; sessions: number }[]; topPages: { path: string; views: number }[] }
  posthog: { available: boolean; pageViews30: number; visitors30: number; events24h: number; viewsPerVisitor: number; topPages: { path: string; views: number }[]; topEvents: { event: string; count: number }[]; series: Day[]; devices: { device: string; sessions: number }[] }
  insights: Insight[]
  generatedAt: string
}

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-2xl p-5 ${className}`} style={{ background: '#fff', border: '1px solid #ECEEF1' }}>{children}</div>
}

function Kpi({ icon: Icon, label, value, sub, accent }: { icon: typeof Eye; label: string; value: string; sub?: React.ReactNode; accent?: boolean }) {
  return (
    <Card>
      <div className="flex items-center gap-2 mb-3">
        <span className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: accent ? '#FEEFE9' : '#F4F5F7' }}>
          <Icon className="w-4 h-4" style={{ color: accent ? ORANGE : '#6B7280' }} />
        </span>
        <p className="text-xs font-medium" style={{ color: '#6B7280' }}>{label}</p>
      </div>
      <p className="text-3xl font-bold tracking-tight" style={{ color: '#0F172A' }}>{value}</p>
      {sub && <div className="mt-1 text-xs">{sub}</div>}
    </Card>
  )
}

const SEV = {
  opportunity: { bg: '#FEF6F2', bd: '#FAD9CB', fg: ORANGE, icon: Lightbulb, label: 'Opportunité' },
  warning: { bg: '#FFFBEB', bd: '#FDE68A', fg: '#B45309', icon: AlertTriangle, label: 'À surveiller' },
  good: { bg: '#F0FDF4', bd: '#BBF7D0', fg: '#16A34A', icon: CheckCircle2, label: 'Point fort' },
}

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg px-3 py-2 text-xs shadow-lg" style={{ background: '#0F172A', color: '#fff' }}>
      <p className="font-semibold mb-1">{label}</p>
      {payload.map((p, i) => <p key={i} style={{ color: p.color }}>{p.name} : <span className="font-bold">{p.value}</span></p>)}
    </div>
  )
}

export default function TraficPage() {
  const [data, setData] = useState<Data | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = () => {
    setLoading(true)
    fetch('/api/cms/trafic').then(r => r.json())
      .then(d => { if (d.error) setError(d.error); else { setData(d); setError(null) } })
      .catch(() => setError('Impossible de charger les données'))
      .finally(() => setLoading(false))
  }
  useEffect(load, [])

  if (loading && !data) return <div className="flex items-center gap-2 text-sm" style={{ color: '#6B7280' }}><RefreshCw className="w-4 h-4 animate-spin" /> Chargement des données…</div>
  if (error) return <div className="rounded-xl p-5 text-sm" style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#B91C1C' }}>{error}</div>
  if (!data) return null

  const { ga4, gsc, posthog, insights } = data
  const pct = (n: number) => `${(n * 100).toFixed(1)} %`
  const trendUp = ga4.trendSessionsPct >= 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: '#0F172A' }}>Analytics</h1>
          <p className="text-xs mt-0.5" style={{ color: '#94A3B8' }}>GA4 · Search Console · PostHog — données en direct</p>
        </div>
        <div className="flex items-center gap-3">
          {ga4.available && (
            <span className="flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-lg" style={{ background: '#FEEFE9', color: ORANGE }}>
              <span className="relative flex h-2 w-2"><span className="animate-ping absolute h-2 w-2 rounded-full opacity-75" style={{ background: ORANGE }} /><span className="rounded-full h-2 w-2" style={{ background: ORANGE }} /></span>
              {ga4.realtimeUsers} en direct
            </span>
          )}
          <button onClick={load} className="flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-lg" style={{ border: '1px solid #E5E7EB', color: '#374151' }}>
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Actualiser
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Kpi icon={Globe} label="Sessions (30j)" value={String(ga4.last30.sessions)} accent
          sub={<span className="inline-flex items-center gap-1 font-semibold" style={{ color: trendUp ? '#16A34A' : '#DC2626' }}>{trendUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}{ga4.trendSessionsPct > 0 ? '+' : ''}{ga4.trendSessionsPct}% vs 7j préc.</span>} />
        <Kpi icon={Eye} label="Visiteurs (30j)" value={String(ga4.last30.activeUsers)} sub={<span style={{ color: '#94A3B8' }}>{ga4.last30.pageViews} pages vues</span>} />
        <Kpi icon={MousePointerClick} label="Clics SEO (28j)" value={String(gsc.totals.clicks)} sub={<span style={{ color: '#94A3B8' }}>{gsc.totals.impressions} impressions</span>} />
        <Kpi icon={Search} label="Position Google moy." value={gsc.totals.position ? gsc.totals.position.toFixed(1) : '—'} sub={<span style={{ color: '#94A3B8' }}>CTR {pct(gsc.totals.ctr)}</span>} />
      </div>

      {/* Courbe trafic GA4 */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-bold" style={{ color: '#0F172A' }}>Trafic — 30 derniers jours</p>
          <div className="flex items-center gap-4 text-xs" style={{ color: '#64748B' }}>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full" style={{ background: ORANGE }} /> Sessions</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full" style={{ background: '#94A3B8' }} /> Visiteurs</span>
          </div>
        </div>
        {ga4.available && ga4.series.length > 0 ? (
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={ga4.series} margin={{ left: -20, right: 8, top: 4 }}>
              <defs>
                <linearGradient id="gSes" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={ORANGE} stopOpacity={0.25} /><stop offset="100%" stopColor={ORANGE} stopOpacity={0} /></linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94A3B8' }} interval={4} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#94A3B8' }} tickLine={false} axisLine={false} width={32} />
              <Tooltip content={<ChartTooltip />} />
              <Area type="monotone" dataKey="visiteurs" stroke="#CBD5E1" strokeWidth={1.5} fill="none" name="Visiteurs" />
              <Area type="monotone" dataKey="sessions" stroke={ORANGE} strokeWidth={2.5} fill="url(#gSes)" name="Sessions" />
            </AreaChart>
          </ResponsiveContainer>
        ) : <p className="text-xs py-12 text-center" style={{ color: '#94A3B8' }}>{ga4.reason === 'data-api-disabled' ? 'Active la Google Analytics Data API pour voir la courbe.' : 'Pas encore de données.'}</p>}
      </Card>

      {/* Axes d'amélioration */}
      {insights.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Lightbulb className="w-4 h-4" style={{ color: ORANGE }} />
            <h2 className="text-sm font-bold" style={{ color: '#0F172A' }}>Axes d&apos;amélioration</h2>
            <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: '#F1F5F9', color: '#64748B' }}>généré depuis tes données</span>
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            {insights.map((ins, i) => {
              const s = SEV[ins.severity]; const Icon = s.icon
              return (
                <div key={i} className="rounded-xl p-4" style={{ background: s.bg, border: `1px solid ${s.bd}` }}>
                  <div className="flex items-start gap-3">
                    <Icon className="w-4 h-4 mt-0.5 shrink-0" style={{ color: s.fg }} />
                    <div>
                      <p className="text-sm font-semibold" style={{ color: '#0F172A' }}>{ins.title}</p>
                      <p className="text-xs mt-1" style={{ color: '#475569' }}>{ins.detail}</p>
                      <p className="text-xs mt-2 flex items-start gap-1 font-medium" style={{ color: s.fg }}><ArrowUpRight className="w-3 h-3 mt-0.5 shrink-0" />{ins.action}</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Sources + SEO courbe */}
      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <p className="text-sm font-bold mb-4" style={{ color: '#0F172A' }}>Sources de trafic (30j)</p>
          {ga4.topSources.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={ga4.topSources} layout="vertical" margin={{ left: 20, right: 16 }}>
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="source" tick={{ fontSize: 11, fill: '#475569' }} width={110} tickLine={false} axisLine={false} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: '#F8FAFC' }} />
                <Bar dataKey="sessions" name="Sessions" radius={[0, 6, 6, 0]} barSize={18}>
                  {ga4.topSources.map((_, i) => <Cell key={i} fill={i === 0 ? ORANGE : '#FBC4AC'} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : <p className="text-xs py-10 text-center" style={{ color: '#94A3B8' }}>Pas encore de données</p>}
        </Card>

        <Card>
          <p className="text-sm font-bold mb-4" style={{ color: '#0F172A' }}>SEO — clics & impressions (28j)</p>
          {gsc.series.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={gsc.series} margin={{ left: -20, right: 8, top: 4 }}>
                <defs><linearGradient id="gImp" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#3B82F6" stopOpacity={0.15} /><stop offset="100%" stopColor="#3B82F6" stopOpacity={0} /></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94A3B8' }} interval={4} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#94A3B8' }} tickLine={false} axisLine={false} width={32} />
                <Tooltip content={<ChartTooltip />} />
                <Area type="monotone" dataKey="impressions" stroke="#3B82F6" strokeWidth={1.5} fill="url(#gImp)" name="Impressions" />
                <Area type="monotone" dataKey="clics" stroke={ORANGE} strokeWidth={2.5} fill="none" name="Clics" />
              </AreaChart>
            </ResponsiveContainer>
          ) : <p className="text-xs py-10 text-center" style={{ color: '#94A3B8' }}>Pas encore de données SEO</p>}
        </Card>
      </div>

      {/* Top requêtes + top pages */}
      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <p className="text-sm font-bold mb-3" style={{ color: '#0F172A' }}>Top requêtes Google</p>
          <ul className="space-y-2.5">
            {gsc.topQueries.slice(0, 7).map((q, i) => (
              <li key={i} className="flex items-center justify-between text-sm gap-3">
                <span className="truncate" style={{ color: '#334155' }}>{q.keys[0]}</span>
                <span className="shrink-0 text-xs tabular-nums" style={{ color: '#94A3B8' }}>{q.clicks} clics · pos {q.position.toFixed(0)}</span>
              </li>
            ))}
            {gsc.topQueries.length === 0 && <li className="text-xs" style={{ color: '#94A3B8' }}>Pas encore de données</li>}
          </ul>
        </Card>
        <Card>
          <p className="text-sm font-bold mb-3" style={{ color: '#0F172A' }}>Pages les plus vues (30j)</p>
          <ul className="space-y-2.5">
            {ga4.topPages.slice(0, 7).map((p, i) => (
              <li key={i} className="flex items-center justify-between text-sm gap-3">
                <span className="truncate" style={{ color: '#334155' }}>{p.path}</span>
                <span className="shrink-0 text-xs tabular-nums font-semibold" style={{ color: '#0F172A' }}>{p.views}</span>
              </li>
            ))}
            {ga4.topPages.length === 0 && <li className="text-xs" style={{ color: '#94A3B8' }}>Pas encore de données</li>}
          </ul>
        </Card>
      </div>

      {/* PostHog — comportement */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4" style={{ color: ORANGE }} />
            <h2 className="text-sm font-bold" style={{ color: '#0F172A' }}>PostHog · comportement</h2>
            {posthog.available && <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: '#F0FDF4', color: '#16A34A' }}>connecté</span>}
          </div>
          <a href="https://eu.posthog.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: ORANGE }}>Sessions & heatmaps <ExternalLink className="w-3 h-3" /></a>
        </div>

        {posthog.available ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Kpi icon={Eye} label="Pages vues (30j)" value={String(posthog.pageViews30)} accent />
              <Kpi icon={Globe} label="Visiteurs uniques" value={String(posthog.visitors30)} />
              <Kpi icon={MousePointerClick} label="Pages / visiteur" value={String(posthog.viewsPerVisitor)} sub={<span style={{ color: '#94A3B8' }}>engagement</span>} />
              <Kpi icon={Radio} label="Events (24h)" value={String(posthog.events24h)} />
            </div>

            <div className="grid lg:grid-cols-3 gap-4">
              <Card className="lg:col-span-2">
                <p className="text-sm font-bold mb-4" style={{ color: '#0F172A' }}>Activité — 30 derniers jours</p>
                {posthog.series.length > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={posthog.series} margin={{ left: -20, right: 8, top: 4 }}>
                      <defs><linearGradient id="gPh" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={ORANGE} stopOpacity={0.2} /><stop offset="100%" stopColor={ORANGE} stopOpacity={0} /></linearGradient></defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                      <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94A3B8' }} interval={3} tickLine={false} axisLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: '#94A3B8' }} tickLine={false} axisLine={false} width={32} />
                      <Tooltip content={<ChartTooltip />} />
                      <Area type="monotone" dataKey="vues" stroke={ORANGE} strokeWidth={2.5} fill="url(#gPh)" name="Pages vues" />
                      <Area type="monotone" dataKey="visiteurs" stroke="#CBD5E1" strokeWidth={1.5} fill="none" name="Visiteurs" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : <p className="text-xs py-10 text-center" style={{ color: '#94A3B8' }}>Pas encore de données</p>}
              </Card>

              <Card>
                <p className="text-sm font-bold mb-3" style={{ color: '#0F172A' }}>Événements (30j)</p>
                <ul className="space-y-2.5">
                  {posthog.topEvents.map((e, i) => {
                    const max = posthog.topEvents[0]?.count || 1
                    return (
                      <li key={i}>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span style={{ color: '#334155' }}>{e.event}</span>
                          <span className="tabular-nums font-semibold" style={{ color: '#0F172A' }}>{e.count}</span>
                        </div>
                        <div className="h-1.5 rounded-full" style={{ background: '#F1F5F9' }}><div className="h-1.5 rounded-full" style={{ width: `${(e.count / max) * 100}%`, background: i === 0 ? ORANGE : '#FBC4AC' }} /></div>
                      </li>
                    )
                  })}
                </ul>
                {posthog.devices.length > 0 && (
                  <div className="mt-4 pt-4 flex gap-4" style={{ borderTop: '1px solid #F1F5F9' }}>
                    {posthog.devices.map((d, i) => (
                      <div key={i}><p className="text-lg font-bold" style={{ color: '#0F172A' }}>{d.sessions}</p><p className="text-[11px]" style={{ color: '#94A3B8' }}>{d.device}</p></div>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          </div>
        ) : <Card><p className="text-xs" style={{ color: '#94A3B8' }}>PostHog non connecté</p></Card>}
      </div>

      <p className="text-[10px]" style={{ color: '#CBD5E1' }}>Mis à jour le {new Date(data.generatedAt).toLocaleString('fr-FR')}</p>
    </div>
  )
}
