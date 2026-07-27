import type { ComponentType } from 'react'

export type Kpi = {
  label: string
  value: string | number
  hint?: string
  icon?: ComponentType<{ className?: string; style?: React.CSSProperties }>
  color?: string
}

/**
 * Bandeau de cartes KPI réutilisable pour tous les onglets du /cms.
 * Présentation uniquement — les valeurs sont calculées dans chaque page
 * à partir des données déjà chargées (aucune requête supplémentaire).
 */
export default function Kpis({ items }: { items: Kpi[] }) {
  if (!items.length) return null
  return (
    <div className="grid gap-3 mb-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))' }}>
      {items.map((k, i) => {
        const Icon = k.icon
        const color = k.color || '#F4521E'
        return (
          <div key={i} className="rounded-2xl p-4" style={{ background: 'var(--cms-card)', border: '1px solid var(--cms-border)', boxShadow: 'var(--cms-shadow)' }}>
            <div className="flex items-center gap-1.5 mb-1">
              {Icon ? <Icon className="w-3.5 h-3.5" style={{ color }} /> : null}
              <p className="text-[11px] uppercase tracking-wide font-semibold" style={{ color: 'var(--cms-muted)' }}>{k.label}</p>
            </div>
            <p className="text-2xl font-bold tracking-tight leading-none" style={{ color: 'var(--cms-ink)' }}>{k.value}</p>
            {k.hint ? <p className="text-[11px] mt-1.5" style={{ color: 'var(--cms-muted)' }}>{k.hint}</p> : null}
          </div>
        )
      })}
    </div>
  )
}
