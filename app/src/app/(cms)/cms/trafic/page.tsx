'use client'
import { useEffect, useState } from 'react'
import { Globe, Eye, MousePointerClick, Search, TrendingUp, Radio, ExternalLink, RefreshCw } from 'lucide-react'

const ORANGE = '#F4521E'

type GscRow = { keys: string[]; clicks: number; impressions: number; ctr: number; position: number }
type Data = {
  gsc: {
    available: boolean
    totals: { clicks: number; impressions: number; ctr: number; position: number }
    topQueries: GscRow[]
    topPages: GscRow[]
  }
  ga4: {
    available: boolean
    reason?: string
    realtimeUsers: number
    last7: { activeUsers: number; sessions: number; pageViews: number }
    last30: { activeUsers: number; sessions: number; pageViews: number }
    topSources: { source: string; sessions: number }[]
    topPages: { path: string; views: number }[]
  }
  generatedAt: string
}

function Card({ children }: { children: React.ReactNode }) {
  return <div className="rounded-xl p-5" style={{ background: '#fff', border: '1px solid #E9ECEF' }}>{children}</div>
}

function Kpi({ icon: Icon, label, value, accent }: { icon: typeof Eye; label: string; value: string; accent?: boolean }) {
  return (
    <Card>
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-4 h-4" style={{ color: accent ? ORANGE : '#9CA3AF' }} />
        <p className="text-xs" style={{ color: '#6B7280' }}>{label}</p>
      </div>
      <p className="text-2xl font-bold" style={{ color: accent ? ORANGE : '#111827' }}>{value}</p>
    </Card>
  )
}

export default function TraficPage() {
  const [data, setData] = useState<Data | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = () => {
    setLoading(true)
    fetch('/api/cms/trafic')
      .then(r => r.json())
      .then(d => { if (d.error) setError(d.error); else setData(d) })
      .catch(() => setError('Impossible de charger les données'))
      .finally(() => setLoading(false))
  }
  useEffect(load, [])

  if (loading) return <div className="flex items-center gap-2 text-sm" style={{ color: '#6B7280' }}><RefreshCw className="w-4 h-4 animate-spin" /> Chargement des données Google…</div>
  if (error) return <div className="rounded-xl p-5 text-sm" style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#B91C1C' }}>{error}</div>
  if (!data) return null

  const pct = (n: number) => `${(n * 100).toFixed(1)} %`
  const ga4 = data.ga4
  const gsc = data.gsc

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold" style={{ color: '#111827' }}>Trafic & SEO</h1>
          <p className="text-xs" style={{ color: '#9CA3AF' }}>Données live · GA4 + Search Console</p>
        </div>
        <button onClick={load} className="flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-lg" style={{ border: '1px solid #E5E7EB', color: '#374151' }}>
          <RefreshCw className="w-3.5 h-3.5" /> Actualiser
        </button>
      </div>

      {/* GA4 */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4" style={{ color: ORANGE }} />
          <h2 className="text-sm font-bold" style={{ color: '#111827' }}>Google Analytics 4</h2>
          <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: '#F0FDF4', color: '#16A34A' }}>connecté</span>
        </div>

        {ga4.available ? (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Kpi icon={Radio} label="Visiteurs en direct" value={String(ga4.realtimeUsers)} accent />
              <Kpi icon={Eye} label="Utilisateurs (30j)" value={String(ga4.last30.activeUsers)} />
              <Kpi icon={Globe} label="Sessions (30j)" value={String(ga4.last30.sessions)} />
              <Kpi icon={MousePointerClick} label="Pages vues (30j)" value={String(ga4.last30.pageViews)} />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <Card>
                <p className="text-xs font-semibold mb-3" style={{ color: '#6B7280' }}>Sources de trafic (30j)</p>
                <ul className="space-y-2">
                  {ga4.topSources.map((s, i) => (
                    <li key={i} className="flex items-center justify-between text-sm">
                      <span style={{ color: '#374151' }}>{s.source}</span>
                      <span className="font-semibold" style={{ color: '#111827' }}>{s.sessions}</span>
                    </li>
                  ))}
                  {ga4.topSources.length === 0 && <li className="text-xs" style={{ color: '#9CA3AF' }}>Pas encore de données</li>}
                </ul>
              </Card>
              <Card>
                <p className="text-xs font-semibold mb-3" style={{ color: '#6B7280' }}>Pages les plus vues (30j)</p>
                <ul className="space-y-2">
                  {ga4.topPages.map((p, i) => (
                    <li key={i} className="flex items-center justify-between text-sm gap-3">
                      <span className="truncate" style={{ color: '#374151' }}>{p.path}</span>
                      <span className="font-semibold shrink-0" style={{ color: '#111827' }}>{p.views}</span>
                    </li>
                  ))}
                  {ga4.topPages.length === 0 && <li className="text-xs" style={{ color: '#9CA3AF' }}>Pas encore de données</li>}
                </ul>
              </Card>
            </div>
          </>
        ) : (
          <Card>
            <p className="text-sm" style={{ color: '#B45309' }}>
              {ga4.reason === 'data-api-disabled'
                ? 'GA4 connecté mais la « Google Analytics Data API » n\'est pas encore activée dans Google Cloud.'
                : 'GA4 indisponible pour le moment.'}
            </p>
          </Card>
        )}
      </section>

      {/* Search Console */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Search className="w-4 h-4" style={{ color: ORANGE }} />
          <h2 className="text-sm font-bold" style={{ color: '#111827' }}>Search Console <span className="font-normal" style={{ color: '#9CA3AF' }}>· SEO (28 derniers jours, délai Google ~3j)</span></h2>
          <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: '#F0FDF4', color: '#16A34A' }}>connecté</span>
        </div>

        {gsc.available ? (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Kpi icon={MousePointerClick} label="Clics" value={String(gsc.totals.clicks)} accent />
              <Kpi icon={Eye} label="Impressions" value={String(gsc.totals.impressions)} />
              <Kpi icon={TrendingUp} label="CTR moyen" value={pct(gsc.totals.ctr)} />
              <Kpi icon={Search} label="Position moy." value={gsc.totals.position.toFixed(1)} />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <Card>
                <p className="text-xs font-semibold mb-3" style={{ color: '#6B7280' }}>Top requêtes Google</p>
                <ul className="space-y-2">
                  {gsc.topQueries.map((q, i) => (
                    <li key={i} className="flex items-center justify-between text-sm gap-3">
                      <span className="truncate" style={{ color: '#374151' }}>{q.keys[0]}</span>
                      <span className="shrink-0 text-xs" style={{ color: '#9CA3AF' }}>{q.clicks} clics · pos {q.position.toFixed(0)}</span>
                    </li>
                  ))}
                  {gsc.topQueries.length === 0 && <li className="text-xs" style={{ color: '#9CA3AF' }}>Pas encore de données (site récemment indexé)</li>}
                </ul>
              </Card>
              <Card>
                <p className="text-xs font-semibold mb-3" style={{ color: '#6B7280' }}>Pages les mieux classées</p>
                <ul className="space-y-2">
                  {gsc.topPages.map((p, i) => (
                    <li key={i} className="flex items-center justify-between text-sm gap-3">
                      <span className="truncate" style={{ color: '#374151' }}>{p.keys[0].replace('https://vivesmedia.com', '') || '/'}</span>
                      <span className="shrink-0 text-xs" style={{ color: '#9CA3AF' }}>{p.clicks} clics · {p.impressions} impr.</span>
                    </li>
                  ))}
                  {gsc.topPages.length === 0 && <li className="text-xs" style={{ color: '#9CA3AF' }}>Pas encore de données</li>}
                </ul>
              </Card>
            </div>
          </>
        ) : (
          <Card><p className="text-sm" style={{ color: '#B45309' }}>Search Console indisponible.</p></Card>
        )}
      </section>

      {/* PostHog */}
      <section>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold" style={{ color: '#111827' }}>PostHog · comportement détaillé</p>
              <p className="text-xs mt-1" style={{ color: '#6B7280' }}>Sessions, heatmaps, funnels, enregistrements — sur le dashboard PostHog</p>
            </div>
            <a href="https://eu.posthog.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-lg" style={{ border: '1px solid #E5E7EB', color: '#374151' }}>
              Ouvrir PostHog <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </Card>
      </section>

      <p className="text-[10px]" style={{ color: '#C0C4CC' }}>Données générées le {new Date(data.generatedAt).toLocaleString('fr-FR')}</p>
    </div>
  )
}
