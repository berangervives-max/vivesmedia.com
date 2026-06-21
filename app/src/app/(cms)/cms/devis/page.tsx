'use client'
import { useState, useEffect } from 'react'
import { devisService, clientsService } from '@/services/supabase.service'
import type { Devis } from '@/types'
import { Trash2, Mail, Phone, Briefcase, DollarSign, MessageSquare, Reply, UserPlus } from 'lucide-react'

const STATUTS = ['nouveau','contacte','en_cours','accepte','refuse'] as const
const COLORS: Record<string, string> = {
  nouveau: 'bg-orange-100 text-orange-700',
  contacte: 'bg-blue-100 text-blue-700',
  en_cours: 'bg-violet-100 text-violet-700',
  accepte: 'bg-green-100 text-green-700',
  refuse: 'bg-gray-100 text-gray-500',
}
const STATUT_COLORS: Record<string, string> = {
  nouveau: '#F59E0B', contacte: '#3B82F6', en_cours: '#8B5CF6', accepte: '#10B981', refuse: '#9CA3AF',
}

export default function CmsDevisPage() {
  const [devis, setDevis] = useState<Devis[]>([])
  const [selected, setSelected] = useState<Devis | null>(null)
  const [clientEmails, setClientEmails] = useState<Set<string>>(new Set())
  const [q, setQ] = useState('')
  const [filt, setFilt] = useState<'tous' | typeof STATUTS[number]>('tous')
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

  // Glisser-déposer kanban : déplacer une carte = changer son statut
  const onDrop = (statut: typeof STATUTS[number]) => {
    if (dragId) updateStatut(dragId, statut)
    setDragId(null)
  }

  const markRead = async (d: Devis) => {
    if (!d.lu) { await devisService.update(d.id, { lu: true }); load() }
    setSelected(d)
  }
  const updateStatut = async (id: string, statut: typeof STATUTS[number]) => {
    await devisService.update(id, { statut }); load()
    if (selected?.id === id) setSelected(p => p ? { ...p, statut } : null)
  }
  const del = async (id: string) => {
    if (!confirm('Supprimer ce devis ?')) return
    await devisService.delete(id); setSelected(null); load()
  }

  // Répondre : ouvre un email pré-rempli (mailto)
  const repondre = (d: Devis) => {
    const sujet = encodeURIComponent(`Votre demande de devis — vivesmedia.com`)
    const corps = encodeURIComponent(`Bonjour ${d.nom.split(' ')[0]},\n\nMerci pour votre demande${d.service ? ` concernant « ${d.service} »` : ''}.\n\n\n\n— Béranger Vives · vivesmedia.com`)
    window.location.href = `mailto:${d.email}?subject=${sujet}&body=${corps}`
  }

  // Convertir le devis en fiche client (anti-doublon par email)
  const [converting, setConverting] = useState(false)
  const convertir = async (d: Devis) => {
    setConverting(true)
    try {
      const existants = await clientsService.getAll()
      if (existants.some(c => c.email.trim().toLowerCase() === d.email.trim().toLowerCase())) {
        alert('Un client avec cet email existe déjà — voir l\'onglet Clients.'); return
      }
      const notes = [d.service && `Service : ${d.service}`, d.budget && `Budget : ${d.budget}`, d.message && `Message : ${d.message}`].filter(Boolean).join('\n')
      await clientsService.create({ nom: d.nom, email: d.email, telephone: d.telephone || '', entreprise: '', secteur: '', statut: 'prospect', notes, stripe_customer_id: '' })
      alert(`${d.nom} ajouté comme client (prospect). Retrouvez-le dans l\'onglet Clients.`)
    } catch (err: any) { alert(err.message) }
    finally { setConverting(false) }
  }

  const nonLus = devis.filter(d => !d.lu).length

  return (
    <div>
      {/* Header */}
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold" style={{ color: '#111827' }}>Devis</h1>
          <p className="text-sm mt-0.5" style={{ color: '#9CA3AF' }}>
            {devis.length} demande(s) · {nonLus > 0 && <span style={{ color: '#F59E0B', fontWeight: 600 }}>{nonLus} non lu(s)</span>}
            {nonLus === 0 && 'Tout lu'}
          </p>
        </div>
        {/* Bascule Liste / Kanban */}
        <div className="flex rounded-lg overflow-hidden shrink-0" style={{ border: '1px solid #E5E7EB' }}>
          {(['liste', 'kanban'] as const).map(v => (
            <button key={v} onClick={() => setView(v)}
              className="px-3 py-1.5 text-xs font-medium capitalize transition-colors"
              style={{ background: view === v ? '#0F172A' : '#fff', color: view === v ? '#fff' : '#6B7280' }}>
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* Filtres */}
      <div className="mb-4 flex flex-col sm:flex-row gap-2">
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Rechercher (nom, email, service)…"
          className="flex-1 px-3 py-2 rounded-lg text-sm outline-none" style={{ border: '1px solid #E5E7EB', background: '#fff', color: '#111827' }} />
        {view === 'liste' && (
          <div className="flex flex-wrap gap-1.5">
            {(['tous', ...STATUTS] as const).map(s => (
              <button key={s} onClick={() => setFilt(s)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                style={{ background: filt === s ? '#0F172A' : '#fff', color: filt === s ? '#fff' : '#6B7280', border: '1px solid #E5E7EB' }}>
                {s === 'tous' ? 'Tous' : s}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── VUE KANBAN ── */}
      {view === 'kanban' && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5 items-start">
          {STATUTS.map(col => {
            const cards = byQuery.filter(d => d.statut === col)
            return (
              <div key={col}
                onDragOver={e => e.preventDefault()}
                onDrop={() => onDrop(col)}
                className="rounded-xl p-2.5 min-h-[120px]"
                style={{ background: '#F1F3F5', border: dragId ? '1px dashed #CBD5E1' : '1px solid transparent' }}>
                <div className="flex items-center justify-between px-1.5 pb-2 mb-1">
                  <span className="text-xs font-semibold capitalize" style={{ color: STATUT_COLORS[col] }}>{col}</span>
                  <span className="text-[11px] font-medium px-1.5 rounded-full" style={{ background: '#fff', color: '#9CA3AF' }}>{cards.length}</span>
                </div>
                <div className="space-y-2">
                  {cards.map(d => (
                    <div key={d.id} draggable
                      onDragStart={() => setDragId(d.id)} onDragEnd={() => setDragId(null)}
                      onClick={() => { markRead(d); setView('liste') }}
                      className="rounded-lg p-3 cursor-grab active:cursor-grabbing bg-white transition-shadow hover:shadow-sm"
                      style={{ border: '1px solid #E9ECEF', borderLeft: `3px solid ${STATUT_COLORS[col]}` }}>
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <p className="text-sm font-semibold truncate flex-1" style={{ color: '#111827' }}>{d.nom}</p>
                        {!d.lu && <span className="h-2 w-2 rounded-full shrink-0" style={{ background: '#F59E0B' }} />}
                      </div>
                      {d.service && <p className="text-xs truncate" style={{ color: '#6B7280' }}>{d.service}</p>}
                      <div className="flex items-center justify-between mt-1.5">
                        <span className="text-[11px]" style={{ color: '#D1D5DB' }}>{new Date(d.created_at).toLocaleDateString('fr-FR')}</span>
                        {estClient(d.email) && <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium" style={{ background: '#DCFCE7', color: '#16A34A' }}>client</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {view === 'liste' && (
      <div className="grid lg:grid-cols-5 gap-4">
        {/* Liste */}
        <div className="lg:col-span-2 space-y-2">
          {filtered.length === 0 && (
            <div className="rounded-xl p-10 text-center text-sm" style={{ background: '#fff', border: '1px solid #E9ECEF', color: '#9CA3AF' }}>
              Aucun devis
            </div>
          )}
          {filtered.map(d => (
            <button key={d.id} onClick={() => markRead(d)}
              className="w-full text-left rounded-xl p-4 transition-all"
              style={{
                background: '#fff',
                border: `1px solid ${selected?.id === d.id ? '#F4521E' : '#E9ECEF'}`,
                boxShadow: selected?.id === d.id ? '0 0 0 2px rgba(244,82,30,.1)' : 'none',
              }}>
              <div className="flex items-center justify-between mb-1">
                <p className="font-semibold text-sm flex items-center gap-1.5" style={{ color: '#111827' }}>
                  {d.nom}
                  {estClient(d.email) && <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium" style={{ background: '#DCFCE7', color: '#16A34A' }}>client</span>}
                </p>
                {!d.lu && (
                  <span className="flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full opacity-75" style={{ background: '#F59E0B' }} />
                    <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: '#F59E0B' }} />
                  </span>
                )}
              </div>
              <p className="text-xs mb-2" style={{ color: '#9CA3AF' }}>{d.email}</p>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${COLORS[d.statut] || COLORS.nouveau}`}>{d.statut}</span>
                <span className="text-xs" style={{ color: '#D1D5DB' }}>{new Date(d.created_at).toLocaleDateString('fr-FR')}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Détail */}
        <div className="lg:col-span-3">
          {!selected ? (
            <div className="rounded-xl p-12 text-center text-sm" style={{ background: '#fff', border: '1px solid #E9ECEF', color: '#9CA3AF' }}>
              ← Sélectionnez un devis pour le consulter
            </div>
          ) : (
            <div className="rounded-xl p-6 space-y-5" style={{ background: '#fff', border: '1px solid #E9ECEF' }}>
              {/* Entête */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white"
                    style={{ background: '#F4521E' }}>
                    {selected.nom.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="font-bold" style={{ color: '#111827' }}>{selected.nom}</h2>
                    <p className="text-xs" style={{ color: '#9CA3AF' }}>
                      {new Date(selected.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                </div>
                <button onClick={() => del(selected.id)}
                  className="p-2 rounded-lg transition-colors"
                  style={{ color: '#9CA3AF' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#FEF2F2'; (e.currentTarget as HTMLElement).style.color = '#EF4444' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#9CA3AF' }}>
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Infos */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: Mail, label: 'Email', value: selected.email },
                  { icon: Phone, label: 'Téléphone', value: selected.telephone },
                  { icon: Briefcase, label: 'Service', value: selected.service },
                  { icon: DollarSign, label: 'Budget', value: selected.budget },
                ].map(({ icon: Icon, label, value }) => value ? (
                  <div key={label} className="p-3 rounded-lg" style={{ background: '#F9FAFB', border: '1px solid #F3F4F6' }}>
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className="w-3.5 h-3.5" style={{ color: '#9CA3AF' }} />
                      <span className="text-xs uppercase tracking-wide font-semibold" style={{ color: '#9CA3AF' }}>{label}</span>
                    </div>
                    <p className="text-sm font-medium" style={{ color: '#111827' }}>{value}</p>
                  </div>
                ) : null)}
              </div>

              {/* Message */}
              {selected.message && (
                <div className="p-4 rounded-lg" style={{ background: '#F9FAFB', border: '1px solid #F3F4F6' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <MessageSquare className="w-3.5 h-3.5" style={{ color: '#9CA3AF' }} />
                    <span className="text-xs uppercase tracking-wide font-semibold" style={{ color: '#9CA3AF' }}>Message</span>
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: '#374151' }}>{selected.message}</p>
                </div>
              )}

              {/* Actions rapides */}
              <div className="flex flex-wrap gap-2">
                <button onClick={() => repondre(selected)}
                  className="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg text-white transition-opacity hover:opacity-90"
                  style={{ background: '#F4521E' }}>
                  <Reply className="w-4 h-4" /> Répondre par email
                </button>
                <button onClick={() => convertir(selected)} disabled={converting}
                  className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                  style={{ border: '1px solid #E5E7EB', color: '#374151' }}>
                  <UserPlus className="w-4 h-4" /> {converting ? 'Ajout…' : 'Convertir en client'}
                </button>
              </div>

              {/* Statut */}
              <div>
                <p className="text-xs uppercase tracking-wide font-semibold mb-3" style={{ color: '#9CA3AF' }}>Changer le statut</p>
                <div className="flex flex-wrap gap-2">
                  {STATUTS.map(s => (
                    <button key={s} onClick={() => updateStatut(selected.id, s)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                      style={{
                        background: selected.statut === s ? STATUT_COLORS[s] : '#F3F4F6',
                        color: selected.statut === s ? '#fff' : '#6B7280',
                        border: `1px solid ${selected.statut === s ? STATUT_COLORS[s] : '#E5E7EB'}`,
                      }}>
                      {s}
                    </button>
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
