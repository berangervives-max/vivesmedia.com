'use client'
import { useState, useEffect } from 'react'
import { devisService, clientsService } from '@/services/supabase.service'
import type { Devis } from '@/types'
import { Trash2, Mail, Phone, Briefcase, DollarSign, MessageSquare, Reply, UserPlus, Search } from 'lucide-react'

const STATUTS = ['nouveau', 'contacte', 'en_cours', 'accepte', 'refuse'] as const
type Statut = typeof STATUTS[number]
const ST: Record<Statut, { bg: string; fg: string; solid: string; label: string }> = {
  nouveau: { bg: 'var(--cms-warn-bg)', fg: 'var(--cms-warn-fg)', solid: '#A9781F', label: 'Nouveau' },
  contacte: { bg: 'var(--cms-info-bg)', fg: 'var(--cms-info-fg)', solid: '#3A6DB0', label: 'Contacté' },
  en_cours: { bg: '#F1EBFB', fg: '#6B4FB8', solid: '#6B4FB8', label: 'En cours' },
  accepte: { bg: 'var(--cms-ok-bg)', fg: 'var(--cms-ok-fg)', solid: '#2E8B5A', label: 'Accepté' },
  refuse: { bg: 'var(--cms-surface-2)', fg: 'var(--cms-muted)', solid: '#8B837B', label: 'Refusé' },
}

export default function CmsDevisPage() {
  const [devis, setDevis] = useState<Devis[]>([])
  const [selected, setSelected] = useState<Devis | null>(null)
  const [clientEmails, setClientEmails] = useState<Set<string>>(new Set())
  const [q, setQ] = useState('')
  const [filt, setFilt] = useState<'tous' | Statut>('tous')
  const [view, setView] = useState<'liste' | 'kanban'>('liste')
  const [dragId, setDragId] = useState<string | null>(null)

  const load = () => devisService.getAll().then(setDevis).catch(() => {})
  useEffect(() => {
    load()
    clientsService.getAll().then(cs => setClientEmails(new Set(cs.map(c => c.email.trim().toLowerCase())))).catch(() => {})
  }, [])

  const estClient = (email: string) => clientEmails.has((email || '').trim().toLowerCase())
  const byQuery = devis.filter(d => !q || [d.nom, d.email, d.service].some(v => v?.toLowerCase().includes(q.toLowerCase())))
  const filtered = byQuery.filter(d => filt === 'tous' || d.statut === filt)

  const onDrop = (statut: Statut) => { if (dragId) updateStatut(dragId, statut); setDragId(null) }
  const markRead = async (d: Devis) => { if (!d.lu) { await devisService.update(d.id, { lu: true }); load() } setSelected(d) }
  const updateStatut = async (id: string, statut: Statut) => {
    await devisService.update(id, { statut }); load()
    if (selected?.id === id) setSelected(p => p ? { ...p, statut } : null)
  }
  const del = async (id: string) => { if (!confirm('Supprimer ce devis ?')) return; await devisService.delete(id); setSelected(null); load() }
  const repondre = (d: Devis) => {
    const sujet = encodeURIComponent('Votre demande de devis — vivesmedia.com')
    const corps = encodeURIComponent(`Bonjour ${d.nom.split(' ')[0]},\n\nMerci pour votre demande${d.service ? ` concernant « ${d.service} »` : ''}.\n\n\n\n— Béranger Vives · vivesmedia.com`)
    window.location.href = `mailto:${d.email}?subject=${sujet}&body=${corps}`
  }

  const [converting, setConverting] = useState(false)
  const convertir = async (d: Devis) => {
    setConverting(true)
    try {
      const existants = await clientsService.getAll()
      if (existants.some(c => c.email.trim().toLowerCase() === d.email.trim().toLowerCase())) { alert('Un client avec cet email existe déjà — voir l\'onglet Clients.'); return }
      const notes = [d.service && `Service : ${d.service}`, d.budget && `Budget : ${d.budget}`, d.message && `Message : ${d.message}`].filter(Boolean).join('\n')
      await clientsService.create({ nom: d.nom, email: d.email, telephone: d.telephone || '', entreprise: '', secteur: '', statut: 'prospect', notes, stripe_customer_id: '' })
      alert(`${d.nom} ajouté comme client (prospect). Retrouvez-le dans l\'onglet Clients.`)
    } catch (err) { alert(err instanceof Error ? err.message : 'Erreur') }
    finally { setConverting(false) }
  }

  const nonLus = devis.filter(d => !d.lu).length
  const cardStyle = { background: 'var(--cms-card)', border: '1px solid var(--cms-border)', boxShadow: 'var(--cms-shadow)' }
  const inputStyle = { border: '1px solid var(--cms-border-2)', background: 'var(--cms-card)', color: 'var(--cms-ink)' }
  const Badge = ({ s }: { s: Statut }) => <span className="cms-badge" style={{ background: ST[s].bg, color: ST[s].fg }}>{ST[s].label}</span>

  return (
    <div>
      <style>{`.dv-in:focus{outline:none;border-color:var(--cms-brand);box-shadow:0 0 0 3px rgb(244 82 30/.18)}`}</style>

      {/* Header */}
      <div className="mb-5 flex items-start justify-between gap-3 flex-wrap">
        <div>
          <p className="cms-eyebrow">Ventes</p>
          <h1 className="text-2xl font-bold tracking-tight mt-1" style={{ color: 'var(--cms-ink)' }}>Devis <span className="cms-accent" style={{ fontSize: '1.5rem', color: 'var(--cms-brand)' }}>reçus</span></h1>
          <p className="text-sm mt-1" style={{ color: 'var(--cms-muted)' }}>
            {devis.length} demande(s){nonLus > 0 ? <> · <b style={{ color: 'var(--cms-warn-fg)' }}>{nonLus} non lu(s)</b></> : ' · tout lu'}
          </p>
        </div>
        <div className="inline-flex rounded-full p-1 shrink-0" style={{ background: 'var(--cms-surface-2)' }}>
          {(['liste', 'kanban'] as const).map(v => (
            <button key={v} onClick={() => setView(v)} className="px-4 py-1.5 text-xs font-semibold capitalize rounded-full transition-colors"
              style={view === v ? { background: 'var(--cms-card)', color: 'var(--cms-ink)', boxShadow: 'var(--cms-shadow)' } : { color: 'var(--cms-muted)' }}>{v}</button>
          ))}
        </div>
      </div>

      {/* Filtres */}
      <div className="mb-4 flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--cms-muted)' }} />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Rechercher (nom, email, service)…"
            className="dv-in w-full pl-9 pr-3 py-2 rounded-xl text-sm transition-shadow" style={inputStyle} />
        </div>
        {view === 'liste' && (
          <div className="flex flex-wrap gap-1.5">
            {(['tous', ...STATUTS] as const).map(s => (
              <button key={s} onClick={() => setFilt(s)} className="px-3 py-1.5 rounded-full text-xs font-semibold transition-colors"
                style={filt === s ? { background: 'var(--cms-brand)', color: '#fff' } : { background: 'var(--cms-card)', color: 'var(--cms-ink-2)', border: '1px solid var(--cms-border)' }}>
                {s === 'tous' ? 'Tous' : ST[s].label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* KANBAN */}
      {view === 'kanban' && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5 items-start">
          {STATUTS.map(col => {
            const cards = byQuery.filter(d => d.statut === col)
            return (
              <div key={col} onDragOver={e => e.preventDefault()} onDrop={() => onDrop(col)} className="rounded-2xl p-2.5 min-h-[120px]"
                style={{ background: 'var(--cms-surface-2)', border: dragId ? '1px dashed var(--cms-border-2)' : '1px solid transparent' }}>
                <div className="flex items-center justify-between px-1.5 pb-2 mb-1">
                  <span className="text-xs font-bold" style={{ color: ST[col].solid }}>{ST[col].label}</span>
                  <span className="text-[11px] font-semibold px-1.5 rounded-full" style={{ background: 'var(--cms-card)', color: 'var(--cms-muted)' }}>{cards.length}</span>
                </div>
                <div className="space-y-2">
                  {cards.map(d => (
                    <div key={d.id} draggable onDragStart={() => setDragId(d.id)} onDragEnd={() => setDragId(null)}
                      onClick={() => { markRead(d); setView('liste') }} className="rounded-xl p-3 cursor-grab active:cursor-grabbing transition-shadow hover:shadow-sm"
                      style={{ background: 'var(--cms-card)', border: '1px solid var(--cms-border)', borderLeft: `3px solid ${ST[col].solid}` }}>
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <p className="text-sm font-semibold truncate flex-1" style={{ color: 'var(--cms-ink)' }}>{d.nom}</p>
                        {!d.lu && <span className="h-2 w-2 rounded-full shrink-0" style={{ background: 'var(--cms-warn-fg)' }} />}
                      </div>
                      {d.service && <p className="text-xs truncate" style={{ color: 'var(--cms-muted)' }}>{d.service}</p>}
                      <div className="flex items-center justify-between mt-1.5">
                        <span className="text-[11px]" style={{ color: 'var(--cms-faint)' }}>{new Date(d.created_at).toLocaleDateString('fr-FR')}</span>
                        {estClient(d.email) && <span className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold" style={{ background: 'var(--cms-ok-bg)', color: 'var(--cms-ok-fg)' }}>client</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* LISTE master/détail */}
      {view === 'liste' && (
        <div className="grid lg:grid-cols-5 gap-4">
          <div className="lg:col-span-2 space-y-2">
            {filtered.length === 0 && (
              <div className="rounded-2xl p-10 text-center text-sm" style={{ ...cardStyle, color: 'var(--cms-muted)' }}>Aucun devis</div>
            )}
            {filtered.map(d => (
              <button key={d.id} onClick={() => markRead(d)} className="w-full text-left rounded-2xl p-4 transition-all"
                style={{ background: 'var(--cms-card)', border: `1px solid ${selected?.id === d.id ? 'var(--cms-brand)' : 'var(--cms-border)'}`, boxShadow: selected?.id === d.id ? '0 0 0 2px rgb(244 82 30/.1)' : 'var(--cms-shadow)' }}>
                <div className="flex items-center justify-between mb-1">
                  <p className="font-semibold text-sm flex items-center gap-1.5" style={{ color: 'var(--cms-ink)' }}>
                    {d.nom}
                    {estClient(d.email) && <span className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold" style={{ background: 'var(--cms-ok-bg)', color: 'var(--cms-ok-fg)' }}>client</span>}
                  </p>
                  {!d.lu && <span className="h-2 w-2 rounded-full" style={{ background: 'var(--cms-warn-fg)' }} />}
                </div>
                <p className="text-xs mb-2" style={{ color: 'var(--cms-muted)' }}>{d.email}</p>
                <div className="flex items-center gap-2">
                  <Badge s={d.statut as Statut} />
                  <span className="text-xs" style={{ color: 'var(--cms-faint)' }}>{new Date(d.created_at).toLocaleDateString('fr-FR')}</span>
                </div>
              </button>
            ))}
          </div>

          <div className="lg:col-span-3">
            {!selected ? (
              <div className="rounded-2xl p-12 text-center text-sm" style={{ ...cardStyle, color: 'var(--cms-muted)' }}>← Sélectionnez un devis pour le consulter</div>
            ) : (
              <div className="rounded-2xl p-6 space-y-5" style={cardStyle}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-sm font-bold text-white" style={{ background: 'var(--cms-brand)' }}>{selected.nom.charAt(0).toUpperCase()}</div>
                    <div>
                      <h2 className="font-bold" style={{ color: 'var(--cms-ink)' }}>{selected.nom}</h2>
                      <p className="text-xs" style={{ color: 'var(--cms-muted)' }}>{new Date(selected.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    </div>
                  </div>
                  <button onClick={() => del(selected.id)} className="p-2 rounded-lg transition-colors" style={{ color: 'var(--cms-muted)' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--cms-danger-bg)'; (e.currentTarget as HTMLElement).style.color = 'var(--cms-danger-fg)' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'var(--cms-muted)' }}>
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {[{ icon: Mail, label: 'Email', value: selected.email }, { icon: Phone, label: 'Téléphone', value: selected.telephone }, { icon: Briefcase, label: 'Service', value: selected.service }, { icon: DollarSign, label: 'Budget', value: selected.budget }].map(({ icon: Icon, label, value }) => value ? (
                    <div key={label} className="p-3 rounded-xl" style={{ background: 'var(--cms-surface-2)', border: '1px solid var(--cms-border)' }}>
                      <div className="flex items-center gap-2 mb-1"><Icon className="w-3.5 h-3.5" style={{ color: 'var(--cms-muted)' }} /><span className="text-xs uppercase tracking-wide font-semibold" style={{ color: 'var(--cms-muted)' }}>{label}</span></div>
                      <p className="text-sm font-medium" style={{ color: 'var(--cms-ink)' }}>{value}</p>
                    </div>
                  ) : null)}
                </div>

                {selected.message && (
                  <div className="p-4 rounded-xl" style={{ background: 'var(--cms-surface-2)', border: '1px solid var(--cms-border)' }}>
                    <div className="flex items-center gap-2 mb-2"><MessageSquare className="w-3.5 h-3.5" style={{ color: 'var(--cms-muted)' }} /><span className="text-xs uppercase tracking-wide font-semibold" style={{ color: 'var(--cms-muted)' }}>Message</span></div>
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--cms-ink-2)' }}>{selected.message}</p>
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  <button onClick={() => repondre(selected)} className="cms-btn cms-btn-primary"><Reply className="w-4 h-4" /> Répondre par email</button>
                  <button onClick={() => convertir(selected)} disabled={converting} className="cms-btn cms-btn-secondary disabled:opacity-50"><UserPlus className="w-4 h-4" /> {converting ? 'Ajout…' : 'Convertir en client'}</button>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-wide font-semibold mb-3" style={{ color: 'var(--cms-muted)' }}>Changer le statut</p>
                  <div className="flex flex-wrap gap-2">
                    {STATUTS.map(s => (
                      <button key={s} onClick={() => updateStatut(selected.id, s)} className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                        style={selected.statut === s ? { background: ST[s].solid, color: '#fff' } : { background: 'var(--cms-surface-2)', color: 'var(--cms-ink-2)', border: '1px solid var(--cms-border)' }}>{ST[s].label}</button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
