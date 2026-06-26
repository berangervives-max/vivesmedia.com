'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Zap, Clock, Play, Check, Loader2, AlertCircle } from 'lucide-react'

const ORANGE = '#F4521E'
type Meta = { id: string; onglet: string; cible: string; label: string; desc: string; cadence: string }
type Log = { type: string; payload: Record<string, unknown> | null; created_at: string }

const ONGLET_ORDER = ['Pilotage', 'Ventes', 'Marketing', 'Hub Clients', 'Outils']
const CADENCE_STYLE: Record<string, { bg: string; c: string }> = {
  quotidien: { bg: '#EFF6FF', c: '#2563EB' },
  hebdo: { bg: '#F5F3FF', c: '#7C3AED' },
  mensuel: { bg: '#FFFBEB', c: '#D97706' },
}
const fmt = (d: string) => new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
const PROCHAINE: Record<string, string> = {
  quotidien: 'chaque jour · 9h',
  hebdo: 'chaque lundi',
  mensuel: 'le 1er du mois',
}

export default function AutomationsBoard({ meta, lastRun, journal }: { meta: Meta[]; lastRun: Record<string, string>; journal: Log[] }) {
  const router = useRouter()
  const [busy, setBusy] = useState<string | null>(null)
  const [done, setDone] = useState<Record<string, 'ok' | 'err'>>({})
  const [testing, setTesting] = useState(false)
  const [testMsg, setTestMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const labelById = Object.fromEntries(meta.map(m => [m.id, m.label]))

  const testEmail = async () => {
    setTesting(true); setTestMsg(null)
    try {
      const r = await fetch('/api/cms/test-email', { method: 'POST' })
      const d = await r.json().catch(() => ({}))
      setTestMsg(d.ok
        ? { ok: true, text: 'Email envoyé ✓ — regarde ta boîte (et l\'onglet Promotions/Spam de Gmail).' }
        : { ok: false, text: d.error || 'Échec inconnu.' })
    } catch (e) {
      setTestMsg({ ok: false, text: `Erreur réseau : ${(e as Error).message}` })
    } finally { setTesting(false) }
  }

  const run = async (id: string) => {
    setBusy(id)
    try {
      const r = await fetch('/api/cms/automations/run', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
      setDone(p => ({ ...p, [id]: r.ok ? 'ok' : 'err' }))
      if (r.ok) setTimeout(() => router.refresh(), 600)
    } catch { setDone(p => ({ ...p, [id]: 'err' })) }
    finally { setBusy(null); setTimeout(() => setDone(p => { const n = { ...p }; delete n[id]; return n }), 4000) }
  }

  const byOnglet = ONGLET_ORDER.map(o => ({ onglet: o, items: meta.filter(m => m.onglet === o) })).filter(g => g.items.length)

  return (
    <div className="space-y-6">
      {/* Bandeau */}
      <div className="rounded-xl p-5 flex items-start gap-3" style={{ background: '#F0FDF4', border: '1px solid #BBF7D0' }}>
        <Zap className="w-5 h-5 shrink-0 mt-0.5" style={{ color: '#16A34A' }} />
        <div>
          <p className="text-sm font-bold" style={{ color: '#166534' }}>
            ✅ {meta.length} automatisations — 100 % automatiques, rien à cliquer.
          </p>
          <p className="text-sm mt-1" style={{ color: '#166534' }}>
            Elles s'exécutent <strong>toutes seules</strong> via le robot quotidien : les <strong>quotidiennes chaque jour à 9h</strong>, les <strong>hebdo le lundi</strong>, les <strong>mensuelles le 1er</strong>. Le bouton <strong>« Tester »</strong> sert juste à en lancer une <em>tout de suite</em> pour vérifier — il n'est jamais obligatoire.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <button onClick={testEmail} disabled={testing}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg text-white disabled:opacity-50"
              style={{ background: '#16A34A' }}>
              {testing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
              {testing ? 'Envoi…' : "M'envoyer un email de test"}
            </button>
            {testMsg && (
              <span className="text-xs font-medium" style={{ color: testMsg.ok ? '#166534' : '#DC2626' }}>
                {testMsg.ok ? '✓ ' : '✗ '}{testMsg.text}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Groupes par onglet */}
      {byOnglet.map(group => (
        <div key={group.onglet}>
          <div className="flex items-center gap-2 mb-3">
            <h2 className="text-sm font-bold uppercase tracking-wider" style={{ color: '#0F172A' }}>{group.onglet}</h2>
            <span className="text-[11px] font-medium px-2 py-0.5 rounded-full" style={{ background: '#F1F5F9', color: '#64748B' }}>{group.items.length}</span>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {group.items.map(a => {
              const cad = CADENCE_STYLE[a.cadence] || CADENCE_STYLE.quotidien
              const last = lastRun[a.id]
              const st = done[a.id]
              return (
                <div key={a.id} className="rounded-xl p-4 flex flex-col" style={{ background: '#fff', border: '1px solid #E9ECEF' }}>
                  <div className="flex items-center justify-between mb-2 gap-2">
                    <span className="text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded" style={{ background: '#F8F9FA', color: '#9CA3AF' }}>{a.cible}</span>
                    <span className="flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full capitalize" style={{ background: cad.bg, color: cad.c }}>
                      <Clock className="w-2.5 h-2.5" /> {a.cadence}
                    </span>
                  </div>
                  <p className="text-sm font-bold mb-1" style={{ color: '#111827' }}>{a.label}</p>
                  <p className="text-xs leading-relaxed mb-3 flex-1" style={{ color: '#9CA3AF' }}>{a.desc}</p>
                  <div className="pt-2 space-y-1.5" style={{ borderTop: '1px solid #F1F3F5' }}>
                    <p className="flex items-center gap-1.5 text-[11px] font-medium" style={{ color: '#16A34A' }}>
                      <span className="relative flex h-1.5 w-1.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60" style={{ background: '#16A34A' }} /><span className="relative inline-flex rounded-full h-1.5 w-1.5" style={{ background: '#16A34A' }} /></span>
                      Auto · {PROCHAINE[a.cadence] || 'chaque jour'}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px]" style={{ color: '#9CA3AF' }}>{last ? `dernière : ${fmt(last)}` : 'pas encore exécutée'}</span>
                      <button onClick={() => run(a.id)} disabled={busy === a.id} title="Test manuel immédiat — facultatif"
                        className="flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-md transition-colors disabled:opacity-50"
                        style={{ border: '1px solid #E5E7EB', color: st === 'ok' ? '#16A34A' : st === 'err' ? '#EF4444' : '#9CA3AF' }}>
                        {busy === a.id ? <Loader2 className="w-3 h-3 animate-spin" /> : st === 'ok' ? <Check className="w-3 h-3" /> : st === 'err' ? <AlertCircle className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                        {busy === a.id ? '…' : st === 'ok' ? 'OK' : 'Tester'}
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ))}

      {/* Journal */}
      <div className="rounded-xl p-6" style={{ background: '#fff', border: '1px solid #E9ECEF' }}>
        <div className="flex items-center gap-2 mb-1">
          <Zap className="w-4 h-4" style={{ color: ORANGE }} />
          <h2 className="font-bold text-sm" style={{ color: '#111827' }}>Journal des exécutions</h2>
        </div>
        <p className="text-xs mb-5" style={{ color: '#9CA3AF' }}>Les dernières actions automatiques</p>
        {journal.length === 0 ? (
          <div className="h-32 rounded-lg flex flex-col items-center justify-center gap-2" style={{ background: '#F8F9FA', border: '1px dashed #E5E7EB' }}>
            <Zap className="w-6 h-6" style={{ color: '#D1D5DB' }} />
            <p className="text-xs" style={{ color: '#9CA3AF' }}>Aucune exécution enregistrée pour le moment</p>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: '#F1F3F5' }}>
            {journal.map((log, i) => (
              <div key={i} className="flex items-center gap-4 py-2.5">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: '#16A34A' }} />
                <span className="text-sm font-medium w-52 shrink-0 truncate" style={{ color: '#111827' }}>{labelById[log.type] ?? log.type}</span>
                <span className="text-xs flex-1 truncate font-mono" style={{ color: '#9CA3AF' }}>{log.payload ? JSON.stringify(log.payload).slice(0, 90) : '—'}</span>
                <span className="text-xs shrink-0" style={{ color: '#9CA3AF' }}>{fmt(log.created_at)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
