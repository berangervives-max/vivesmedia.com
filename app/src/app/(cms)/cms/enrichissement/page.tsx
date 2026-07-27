'use client'
import { useEffect, useRef, useState } from 'react'
import { Activity, Mail, Phone, Users, TrendingUp, RefreshCw, CheckCircle2 } from 'lucide-react'

type Stats = {
  ts: number; total: number; sansCoord: number; avecTel: number; avecMail: number; avecLesDeux: number
  strictTraites: number; sansSite: number; descTrouvees: number
  recent: { entreprise: string; type: 'email' | 'tel' | 'both'; detail: string; when: string }[]
}

const fmtWhen = (iso: string) => { try { return new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) } catch { return '' } }

export default function EnrichissementPage() {
  const [s, setS] = useState<Stats | null>(null)
  const [prev, setPrev] = useState<Stats | null>(null)
  const [pulse, setPulse] = useState<{ tel: boolean; mail: boolean }>({ tel: false, mail: false })
  const timer = useRef<ReturnType<typeof setInterval> | null>(null)

  const load = () => {
    fetch('/api/cms/enrichissement').then(r => r.json()).then((d: Stats) => {
      setS(old => {
        if (old) {
          setPrev(old)
          if (d.avecTel > old.avecTel || d.avecMail > old.avecMail) {
            setPulse({ tel: d.avecTel > old.avecTel, mail: d.avecMail > old.avecMail })
            setTimeout(() => setPulse({ tel: false, mail: false }), 1200)
          }
        }
        return d
      })
    }).catch(() => {})
  }

  useEffect(() => {
    load()
    timer.current = setInterval(load, 8000)
    return () => { if (timer.current) clearInterval(timer.current) }
  }, [])

  if (!s) return <p className="text-sm" style={{ color: 'var(--cms-muted)' }}>Chargement du tableau de bord…</p>

  const pct = (n: number) => s.total ? Math.round((n / s.total) * 100) : 0
  const delta = (k: keyof Stats) => prev ? (s[k] as number) - (prev[k] as number) : 0

  const Card = ({ icon, label, value, sub, color, glow }: { icon: React.ReactNode; label: string; value: number; sub?: string; color: string; glow?: boolean }) => (
    <div className="rounded-2xl p-5 transition-all duration-500" style={{ background: 'var(--cms-card)', border: '1px solid var(--cms-border)', boxShadow: glow ? `0 0 0 3px ${color}33` : 'none' }}>
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${color}1a`, color }}>{icon}</div>
        <span className="text-xs font-medium" style={{ color: 'var(--cms-ink-2)' }}>{label}</span>
      </div>
      <div className="flex items-end gap-2">
        <span className="text-3xl font-bold tabular-nums" style={{ color: 'var(--cms-ink)' }}>{value.toLocaleString('fr-FR')}</span>
        {sub && <span className="text-xs mb-1.5" style={{ color: 'var(--cms-muted)' }}>{sub}</span>}
      </div>
    </div>
  )

  return (
    <div className="max-w-5xl">
      <div className="flex items-center gap-3 mb-1">
        <Activity className="w-5 h-5" style={{ color: 'var(--cms-brand)' }} />
        <p className="cms-eyebrow">CRM</p>
        <h1 className="text-2xl font-bold tracking-tight mt-1" style={{ color: 'var(--cms-ink)' }}>Enrichissement des contacts</h1>
        <span className="flex items-center gap-1.5 text-[11px] px-2 py-0.5 rounded-full font-medium ml-1" style={{ background: 'var(--cms-ok-bg)', color: 'var(--cms-ok-fg)' }}>
          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'var(--cms-ok-fg)' }} /> EN DIRECT
        </span>
      </div>
      <p className="text-sm mb-6" style={{ color: 'var(--cms-ink-2)' }}>Suivi temps réel — les contacts sont récupérés uniquement sur le site officiel de chaque entreprise (footer + page contact). Mise à jour auto toutes les 8 s.</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <Card icon={<Users className="w-4 h-4" />} label="Prospects" value={s.total} color="#7C56C7" />
        <Card icon={<Phone className="w-4 h-4" />} label="Avec téléphone" value={s.avecTel} sub={delta('avecTel') > 0 ? `+${delta('avecTel')}` : `${pct(s.avecTel)}%`} color="var(--cms-info-fg)" glow={pulse.tel} />
        <Card icon={<Mail className="w-4 h-4" />} label="Avec email" value={s.avecMail} sub={delta('avecMail') > 0 ? `+${delta('avecMail')}` : `${pct(s.avecMail)}%`} color="var(--cms-brand)" glow={pulse.mail} />
        <Card icon={<TrendingUp className="w-4 h-4" />} label="Sans coordonnées" value={s.sansCoord} sub="restant" color="var(--cms-faint)" />
      </div>

      {/* Taux de remplissage avec objectif 45% */}
      <div className="rounded-2xl p-5 mb-6" style={{ background: 'var(--cms-card)', border: '1px solid var(--cms-border)' }}>
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-semibold" style={{ color: 'var(--cms-ink)' }}>Taux de remplissage</span>
          <span className="text-[11px] px-2 py-0.5 rounded-full font-medium" style={{ background: 'var(--cms-surface-3)', color: 'var(--cms-ink-2)' }}>Objectif 45 %</span>
        </div>
        {([
          { label: 'Téléphone', icon: <Phone className="w-3.5 h-3.5" />, n: s.avecTel, color: 'var(--cms-info-fg)' },
          { label: 'Email', icon: <Mail className="w-3.5 h-3.5" />, n: s.avecMail, color: 'var(--cms-brand)' },
        ]).map(row => {
          const p = s.total ? (row.n / s.total) * 100 : 0
          const reached = p >= 45
          return (
            <div key={row.label} className="mb-4 last:mb-0">
              <div className="flex items-center justify-between mb-1.5">
                <span className="flex items-center gap-1.5 text-xs font-medium" style={{ color: 'var(--cms-ink-2)' }}>
                  <span style={{ color: row.color }}>{row.icon}</span>{row.label}
                  <span style={{ color: 'var(--cms-muted)' }}>· {row.n.toLocaleString('fr-FR')} / {s.total.toLocaleString('fr-FR')}</span>
                </span>
                <span className="text-sm font-bold tabular-nums" style={{ color: reached ? 'var(--cms-ok-fg)' : row.color }}>
                  {p.toFixed(1)} %
                </span>
              </div>
              <div className="relative h-3 rounded-full overflow-hidden" style={{ background: 'var(--cms-surface-2)' }}>
                {/* repère objectif 45% */}
                <div className="absolute top-0 bottom-0 z-10" style={{ left: '45%', width: '2px', background: 'var(--cms-faint)' }} />
                <div className="h-full rounded-full transition-all duration-700" style={{ width: `${Math.min(100, p)}%`, background: reached ? 'var(--cms-ok-fg)' : `linear-gradient(90deg,${row.color},${row.color}aa)` }} />
              </div>
            </div>
          )
        })}
        <p className="text-[11px] mt-1" style={{ color: 'var(--cms-muted)' }}>Le trait gris = objectif 45 %. Barre verte une fois l'objectif atteint.</p>
      </div>

      {/* Progression du batch */}
      <div className="rounded-2xl p-5 mb-6" style={{ background: 'var(--cms-card)', border: '1px solid var(--cms-border)' }}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold" style={{ color: 'var(--cms-ink)' }}>Avancement de l'analyse</span>
          <span className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--cms-muted)' }}><RefreshCw className="w-3 h-3" /> {s.strictTraites.toLocaleString('fr-FR')} fiches analysées</span>
        </div>
        <div className="h-2.5 rounded-full overflow-hidden" style={{ background: 'var(--cms-surface-2)' }}>
          <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct(s.strictTraites)}%`, background: 'linear-gradient(90deg,var(--cms-brand),var(--cms-warn-fg))' }} />
        </div>
        <div className="flex gap-4 mt-3 text-xs" style={{ color: 'var(--cms-ink-2)' }}>
          <span><b style={{ color: 'var(--cms-ok-fg)' }}>{s.avecLesDeux}</b> complets (tél + email)</span>
          <span><b style={{ color: 'var(--cms-info-fg)' }}>{s.descTrouvees}</b> descriptions</span>
          <span><b style={{ color: 'var(--cms-faint)' }}>{s.sansSite}</b> sans site web</span>
        </div>
      </div>

      {/* Fil d'activité live */}
      <div className="rounded-2xl p-5" style={{ background: 'var(--cms-card)', border: '1px solid var(--cms-border)' }}>
        <p className="text-[11px] font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--cms-muted)' }}>Activité récente</p>
        {s.recent.length === 0 ? (
          <p className="text-sm" style={{ color: 'var(--cms-muted)' }}>En attente des premiers contacts trouvés…</p>
        ) : (
          <div className="space-y-1.5">
            {s.recent.map((r, i) => (
              <div key={i} className="flex items-center gap-3 py-1.5 px-2 rounded-lg text-sm" style={{ background: i === 0 ? 'var(--cms-warn-bg)' : 'transparent' }}>
                {r.type === 'email' ? <Mail className="w-4 h-4 shrink-0" style={{ color: 'var(--cms-brand)' }} />
                  : r.type === 'tel' ? <Phone className="w-4 h-4 shrink-0" style={{ color: 'var(--cms-info-fg)' }} />
                  : <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: 'var(--cms-ok-fg)' }} />}
                <span className="font-medium truncate" style={{ color: 'var(--cms-ink)' }}>{r.entreprise}</span>
                <span className="text-xs truncate" style={{ color: 'var(--cms-ink-2)' }}>
                  {r.type === 'email' ? `email ajouté · ${r.detail}` : r.type === 'tel' ? `téléphone ajouté · ${r.detail}` : `email + téléphone ajoutés`}
                </span>
                <span className="ml-auto text-[11px] shrink-0" style={{ color: 'var(--cms-faint)' }}>{fmtWhen(r.when)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
