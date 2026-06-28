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

  if (!s) return <p className="text-sm" style={{ color: '#9CA3AF' }}>Chargement du tableau de bord…</p>

  const pct = (n: number) => s.total ? Math.round((n / s.total) * 100) : 0
  const delta = (k: keyof Stats) => prev ? (s[k] as number) - (prev[k] as number) : 0

  const Card = ({ icon, label, value, sub, color, glow }: { icon: React.ReactNode; label: string; value: number; sub?: string; color: string; glow?: boolean }) => (
    <div className="rounded-2xl p-5 transition-all duration-500" style={{ background: '#fff', border: '1px solid #E9ECEF', boxShadow: glow ? `0 0 0 3px ${color}33` : 'none' }}>
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${color}1a`, color }}>{icon}</div>
        <span className="text-xs font-medium" style={{ color: '#6B7280' }}>{label}</span>
      </div>
      <div className="flex items-end gap-2">
        <span className="text-3xl font-bold tabular-nums" style={{ color: '#111827' }}>{value.toLocaleString('fr-FR')}</span>
        {sub && <span className="text-xs mb-1.5" style={{ color: '#9CA3AF' }}>{sub}</span>}
      </div>
    </div>
  )

  return (
    <div className="max-w-5xl">
      <div className="flex items-center gap-3 mb-1">
        <Activity className="w-5 h-5" style={{ color: '#F4521E' }} />
        <h1 className="text-xl font-bold" style={{ color: '#111827' }}>Enrichissement des contacts</h1>
        <span className="flex items-center gap-1.5 text-[11px] px-2 py-0.5 rounded-full font-medium ml-1" style={{ background: '#ECFDF5', color: '#059669' }}>
          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#10B981' }} /> EN DIRECT
        </span>
      </div>
      <p className="text-sm mb-6" style={{ color: '#6B7280' }}>Suivi temps réel — les contacts sont récupérés uniquement sur le site officiel de chaque entreprise (footer + page contact). Mise à jour auto toutes les 8 s.</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <Card icon={<Users className="w-4 h-4" />} label="Prospects" value={s.total} color="#6366F1" />
        <Card icon={<Phone className="w-4 h-4" />} label="Avec téléphone" value={s.avecTel} sub={delta('avecTel') > 0 ? `+${delta('avecTel')}` : `${pct(s.avecTel)}%`} color="#0EA5E9" glow={pulse.tel} />
        <Card icon={<Mail className="w-4 h-4" />} label="Avec email" value={s.avecMail} sub={delta('avecMail') > 0 ? `+${delta('avecMail')}` : `${pct(s.avecMail)}%`} color="#F4521E" glow={pulse.mail} />
        <Card icon={<TrendingUp className="w-4 h-4" />} label="Sans coordonnées" value={s.sansCoord} sub="restant" color="#94A3B8" />
      </div>

      {/* Progression du batch */}
      <div className="rounded-2xl p-5 mb-6" style={{ background: '#fff', border: '1px solid #E9ECEF' }}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold" style={{ color: '#111827' }}>Avancement de l'analyse</span>
          <span className="flex items-center gap-1.5 text-xs" style={{ color: '#9CA3AF' }}><RefreshCw className="w-3 h-3" /> {s.strictTraites.toLocaleString('fr-FR')} fiches analysées</span>
        </div>
        <div className="h-2.5 rounded-full overflow-hidden" style={{ background: '#F1F3F5' }}>
          <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct(s.strictTraites)}%`, background: 'linear-gradient(90deg,#F4521E,#FB923C)' }} />
        </div>
        <div className="flex gap-4 mt-3 text-xs" style={{ color: '#6B7280' }}>
          <span><b style={{ color: '#059669' }}>{s.avecLesDeux}</b> complets (tél + email)</span>
          <span><b style={{ color: '#0EA5E9' }}>{s.descTrouvees}</b> descriptions</span>
          <span><b style={{ color: '#94A3B8' }}>{s.sansSite}</b> sans site web</span>
        </div>
      </div>

      {/* Fil d'activité live */}
      <div className="rounded-2xl p-5" style={{ background: '#fff', border: '1px solid #E9ECEF' }}>
        <p className="text-[11px] font-semibold uppercase tracking-widest mb-3" style={{ color: '#9CA3AF' }}>Activité récente</p>
        {s.recent.length === 0 ? (
          <p className="text-sm" style={{ color: '#9CA3AF' }}>En attente des premiers contacts trouvés…</p>
        ) : (
          <div className="space-y-1.5">
            {s.recent.map((r, i) => (
              <div key={i} className="flex items-center gap-3 py-1.5 px-2 rounded-lg text-sm" style={{ background: i === 0 ? '#FFF7ED' : 'transparent' }}>
                {r.type === 'email' ? <Mail className="w-4 h-4 shrink-0" style={{ color: '#F4521E' }} />
                  : r.type === 'tel' ? <Phone className="w-4 h-4 shrink-0" style={{ color: '#0EA5E9' }} />
                  : <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: '#059669' }} />}
                <span className="font-medium truncate" style={{ color: '#111827' }}>{r.entreprise}</span>
                <span className="text-xs truncate" style={{ color: '#6B7280' }}>
                  {r.type === 'email' ? `email ajouté · ${r.detail}` : r.type === 'tel' ? `téléphone ajouté · ${r.detail}` : `email + téléphone ajoutés`}
                </span>
                <span className="ml-auto text-[11px] shrink-0" style={{ color: '#C4C9D0' }}>{fmtWhen(r.when)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
