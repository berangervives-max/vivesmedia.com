'use client'
import { useState } from 'react'
import { Globe, Eye, MousePointerClick, Timer, ExternalLink, Plug, Check } from 'lucide-react'

const ORANGE = '#F4521E'

const PLACEHOLDER_KPIS = [
  { label: 'Visiteurs uniques (30j)', icon: Eye },
  { label: 'Pages vues (30j)', icon: Globe },
  { label: 'Taux de conversion devis', icon: MousePointerClick },
  { label: 'Durée moyenne de session', icon: Timer },
]

const CONNECT_STEPS = [
  'Va sur eu.posthog.com → Settings → Personal API Keys',
  'Crée une clé avec le scope "Query Read"',
  'Envoie la clé à Claude Code (ou ajoute POSTHOG_PERSONAL_API_KEY dans Vercel)',
  'Cette page affichera automatiquement les vraies données',
]

export default function TraficPage() {
  const [connected] = useState(false)

  return (
    <div className="space-y-6">

      {/* Les 3 outils de mesure */}
      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { name: 'PostHog', state: 'Tracking actif — données qui s\'accumulent', stateOk: true, action: 'Clé API à fournir pour affichage ici', href: 'https://eu.posthog.com', role: 'Comportement : sessions, heatmaps, funnels, conversions' },
          { name: 'Google Analytics 4', state: 'Non installé sur ce site', stateOk: false, action: 'Créer la propriété GA4 → me donner l\'ID G-XXXX', href: 'https://analytics.google.com', role: 'Trafic global : sources, audiences, acquisitions' },
          { name: 'Search Console', state: 'À vérifier après bascule du domaine', stateOk: false, action: 'Propriété vivesmedia.com → vérification DNS', href: 'https://search.google.com/search-console', role: 'SEO : positions Google, clics, impressions, indexation' },
        ].map(tool => (
          <div key={tool.name} className="rounded-xl p-5 flex flex-col" style={{ background: '#fff', border: '1px solid #E9ECEF' }}>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-bold" style={{ color: '#111827' }}>{tool.name}</p>
              <span className="w-2 h-2 rounded-full" style={{ background: tool.stateOk ? '#16A34A' : '#F59E0B' }} />
            </div>
            <p className="text-xs leading-relaxed mb-2" style={{ color: '#6B7280' }}>{tool.role}</p>
            <p className="text-[11px] mb-1" style={{ color: tool.stateOk ? '#16A34A' : '#D97706' }}>{tool.state}</p>
            <p className="text-[11px] flex-1" style={{ color: '#9CA3AF' }}>{tool.action}</p>
            <a href={tool.href} target="_blank" rel="noopener noreferrer"
              className="mt-3 flex items-center justify-center gap-2 text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
              style={{ border: '1px solid #E5E7EB', color: '#374151' }}>
              Ouvrir {tool.name} <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        ))}
      </div>

      {/* Bandeau connexion */}
      {!connected && (
        <div className="rounded-xl p-5 flex flex-col sm:flex-row sm:items-center gap-4"
          style={{ background: 'rgba(244,82,30,.06)', border: '1px solid rgba(244,82,30,.2)' }}>
          <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'rgba(244,82,30,.12)', color: ORANGE }}>
            <Plug className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold" style={{ color: '#111827' }}>Affichage des données dans cette page</p>
            <p className="text-xs mt-0.5" style={{ color: '#6B7280' }}>
              PostHog enregistre déjà chaque visite. Pour afficher les chiffres ici, il manque une clé API personnelle (guide ci-dessous). GA4 et Search Console s'ajouteront après création des propriétés.
            </p>
          </div>
        </div>
      )}

      {/* KPIs placeholder */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {PLACEHOLDER_KPIS.map(k => (
          <div key={k.label} className="rounded-xl p-5" style={{ background: '#fff', border: '1px solid #E9ECEF' }}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-3" style={{ background: '#F8F9FA', color: '#9CA3AF' }}>
              <k.icon className="w-4 h-4" />
            </div>
            <p className="text-2xl font-bold" style={{ color: '#D1D5DB' }}>—</p>
            <p className="text-xs mt-1" style={{ color: '#9CA3AF' }}>{k.label}</p>
          </div>
        ))}
      </div>

      {/* Zones graphiques placeholder */}
      <div className="grid lg:grid-cols-2 gap-6">
        {['Visiteurs par jour (30 derniers jours)', 'Pages les plus visitées'].map(title => (
          <div key={title} className="rounded-xl p-6" style={{ background: '#fff', border: '1px solid #E9ECEF' }}>
            <h2 className="font-bold text-sm mb-5" style={{ color: '#111827' }}>{title}</h2>
            <div className="h-48 rounded-lg flex flex-col items-center justify-center gap-2"
              style={{ background: '#F8F9FA', border: '1px dashed #E5E7EB' }}>
              <Globe className="w-6 h-6" style={{ color: '#D1D5DB' }} />
              <p className="text-xs" style={{ color: '#9CA3AF' }}>Données disponibles après connexion PostHog</p>
            </div>
          </div>
        ))}
      </div>

      {/* Comment connecter */}
      <div className="rounded-xl p-6" style={{ background: '#fff', border: '1px solid #E9ECEF' }}>
        <h2 className="font-bold text-sm mb-1" style={{ color: '#111827' }}>Comment connecter (2 minutes)</h2>
        <p className="text-xs mb-5" style={{ color: '#9CA3AF' }}>Une fois la clé fournie, tout s'affiche automatiquement — visiteurs, sources, pages, conversions.</p>
        <ol className="space-y-3">
          {CONNECT_STEPS.map((step, i) => (
            <li key={step} className="flex items-start gap-3">
              <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5"
                style={{ background: 'rgba(244,82,30,.1)', color: ORANGE }}>
                {i + 1}
              </span>
              <span className="text-sm" style={{ color: '#374151' }}>{step}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* Déjà actif */}
      <div className="rounded-xl p-5 flex items-center gap-3" style={{ background: '#F0FDF4', border: '1px solid #BBF7D0' }}>
        <Check className="w-4 h-4 shrink-0" style={{ color: '#16A34A' }} />
        <p className="text-sm" style={{ color: '#166534' }}>
          Le script de tracking PostHog est <strong>déjà installé et actif</strong> sur toutes les pages du site — les données s'accumulent depuis le lancement.
        </p>
      </div>

    </div>
  )
}
