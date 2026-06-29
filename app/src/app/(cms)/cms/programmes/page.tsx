'use client'
import { useEffect, useState } from 'react'
import { Clock, X, CalendarClock, RefreshCw, CheckCircle2, Ban } from 'lucide-react'

type Item = { prospectId: string; nom?: string; entreprise?: string; id: string; when: string; to: string; statut: string; statutReel?: string | null }

// statut réel Resend → libellé + couleurs
const STATUT: Record<string, { label: string; color: string; bg: string }> = {
  scheduled: { label: 'Programmé', color: '#92400E', bg: '#FEF3C7' },
  sent: { label: 'Envoyé', color: '#1E40AF', bg: '#DBEAFE' },
  delivered: { label: 'Livré ✓', color: '#065F46', bg: '#D1FAE5' },
  delivery_delayed: { label: 'Envoi différé', color: '#92400E', bg: '#FEF3C7' },
  opened: { label: 'Ouvert 👀', color: '#065F46', bg: '#D1FAE5' },
  clicked: { label: 'Cliqué 🔗', color: '#065F46', bg: '#D1FAE5' },
  bounced: { label: 'Rejeté (adresse invalide)', color: '#991B1B', bg: '#FEE2E2' },
  complained: { label: 'Marqué spam', color: '#991B1B', bg: '#FEE2E2' },
  canceled: { label: 'Annulé', color: '#6B7280', bg: '#F3F4F6' },
}
const statutOf = (it: Item) => STATUT[it.statutReel || ''] || STATUT[it.statut === 'annulé' ? 'canceled' : it.statut === 'envoyé' ? 'sent' : 'scheduled']

const fmt = (iso: string) => { try { return new Date(iso).toLocaleString('fr-FR', { weekday: 'short', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) } catch { return iso } }
// ISO local (datetime-local) → ISO avec offset Paris (+02:00 été)
const toParisIso = (local: string) => `${local}:00+02:00`
const toLocalInput = (iso: string) => { try { const d = new Date(iso); const p = (n: number) => String(n).padStart(2, '0'); return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}` } catch { return '' } }

export default function ProgrammesPage() {
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<string | null>(null)
  const [when, setWhen] = useState('')
  const [busy, setBusy] = useState(false)

  const load = () => { setLoading(true); fetch('/api/cms/scheduled').then(r => r.json()).then(d => setItems(d.items || [])).catch(() => {}).finally(() => setLoading(false)) }
  useEffect(load, [])

  const act = async (body: Record<string, unknown>) => {
    setBusy(true)
    const r = await fetch('/api/cms/scheduled', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    setBusy(false); setEditing(null)
    if (!r.ok) { const e = await r.json().catch(() => ({})); alert('Erreur : ' + (e.error || r.status)); return }
    load()
  }
  const cancel = (it: Item) => { if (confirm(`Annuler l'envoi à ${it.to} (${it.entreprise || it.nom}) ?`)) act({ action: 'cancel', prospectId: it.prospectId, id: it.id }) }
  const reschedule = (it: Item) => act({ action: 'reschedule', prospectId: it.prospectId, id: it.id, when: toParisIso(when) })

  const isPending = (i: Item) => (i.statutReel ? i.statutReel === 'scheduled' : i.statut === 'programmé')
  const active = items.filter(isPending)
  const past = items.filter(i => !isPending(i))

  return (
    <div className="max-w-4xl">
      <div className="flex items-center gap-3 mb-1">
        <Clock className="w-5 h-5" style={{ color: '#F4521E' }} />
        <h1 className="text-xl font-bold" style={{ color: '#111827' }}>Envois programmés</h1>
      </div>
      <p className="text-sm mb-6" style={{ color: '#6B7280' }}>Emails de prospection planifiés (via Resend). Vous pouvez les annuler ou changer la date/heure jusqu'à l'envoi.</p>

      {loading ? <p className="text-sm" style={{ color: '#9CA3AF' }}>Chargement…</p> : (
        <>
          {active.length === 0 && <div className="rounded-xl p-8 text-center text-sm" style={{ background: '#fff', border: '1px solid #E9ECEF', color: '#9CA3AF' }}>Aucun envoi programmé pour le moment.</div>}

          <div className="space-y-3">
            {active.map(it => (
              <div key={it.id} className="rounded-xl p-4" style={{ background: '#fff', border: '1px solid #E9ECEF' }}>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'rgba(244,82,30,.1)' }}>
                    <CalendarClock className="w-5 h-5" style={{ color: '#F4521E' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm" style={{ color: '#111827' }}>{it.entreprise || it.nom}</span>
                      <span className="text-[11px] px-2 py-0.5 rounded-full font-medium" style={{ background: statutOf(it).bg, color: statutOf(it).color }}>{statutOf(it).label}</span>
                    </div>
                    <p className="text-xs mt-1" style={{ color: '#6B7280' }}>→ {it.to}</p>
                    <p className="text-sm mt-1 font-medium" style={{ color: '#F4521E' }}>{fmt(it.when)}</p>

                    {editing === it.id && (
                      <div className="flex items-center gap-2 mt-3 flex-wrap">
                        <input type="datetime-local" value={when} onChange={e => setWhen(e.target.value)}
                          className="text-sm px-3 py-1.5 rounded-lg outline-none" style={{ border: '1px solid #E5E7EB' }} />
                        <button disabled={busy || !when} onClick={() => reschedule(it)}
                          className="text-xs font-medium px-3 py-1.5 rounded-lg text-white disabled:opacity-40" style={{ background: '#F4521E' }}>Confirmer</button>
                        <button onClick={() => setEditing(null)} className="text-xs px-2 py-1.5" style={{ color: '#9CA3AF' }}>Annuler</button>
                      </div>
                    )}
                  </div>
                  {editing !== it.id && (
                    <div className="flex items-center gap-2 shrink-0">
                      <button onClick={() => { setEditing(it.id); setWhen(toLocalInput(it.when)) }} disabled={busy}
                        className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg" style={{ border: '1px solid #E5E7EB', color: '#374151' }}>
                        <RefreshCw className="w-3.5 h-3.5" /> Reprogrammer
                      </button>
                      <button onClick={() => cancel(it)} disabled={busy}
                        className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg" style={{ border: '1px solid #FEE2E2', color: '#DC2626', background: '#FEF2F2' }}>
                        <X className="w-3.5 h-3.5" /> Annuler
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {past.length > 0 && (
            <div className="mt-8">
              <p className="text-[11px] font-semibold uppercase tracking-widest mb-2" style={{ color: '#9CA3AF' }}>Historique</p>
              <div className="space-y-2">
                {past.map(it => (
                  <div key={it.id} className="rounded-lg p-3 flex items-center gap-3 text-sm" style={{ background: '#fff', border: '1px solid #F1F3F5', color: '#9CA3AF' }}>
                    {(it.statutReel === 'bounced' || it.statutReel === 'complained' || it.statut === 'annulé') ? <Ban className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                    <span className="font-medium" style={{ color: '#6B7280' }}>{it.entreprise || it.nom}</span>
                    <span>→ {it.to}</span>
                    <span className="text-[11px] px-2 py-0.5 rounded-full font-medium" style={{ background: statutOf(it).bg, color: statutOf(it).color }}>{statutOf(it).label}</span>
                    <span className="ml-auto">{fmt(it.when)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
