'use client'
import { useState, useEffect, useMemo } from 'react'
import { clientsService } from '@/services/supabase.service'
import type { Client } from '@/types'
import { Plus, Pencil, Trash2, Search, Mail, Phone, MapPin, ChevronLeft, ChevronRight } from 'lucide-react'
import ClientDossier from '@/components/cms/ClientDossier'

const STATUTS = ['prospect', 'actif', 'pause', 'termine'] as const
const COLORS: Record<string, string> = { prospect: 'bg-blue-100 text-blue-700', actif: 'bg-green-100 text-green-700', pause: 'bg-orange-100 text-orange-700', termine: 'bg-gray-100 text-gray-500' }
const EMPTY: Omit<Client, 'id' | 'created_at' | 'updated_at'> = { nom: '', email: '', telephone: '', entreprise: '', secteur: '', statut: 'prospect', notes: '', stripe_customer_id: '' }
const PER = 40
const WEBMAIL = ['gmail.', 'orange.fr', 'free.fr', 'wanadoo.fr', 'hotmail.', 'outlook.', 'live.', 'yahoo.', 'sfr.fr', 'laposte.net', 'icloud.', 'gmx.', 'aol.', 'bbox.fr', 'neuf.fr']
const parseCommune = (n?: string) => (n?.match(/·\s*([^·]+?)\s*\(8\d{4}\)/) || [])[1] || ''
const parseScore = (n?: string) => { const m = n?.match(/score\s+(\d+)\/10/i); return m ? parseInt(m[1]) : 0 }
const emailKind = (e?: string) => { if (!e) return 'none'; const d = (e.split('@')[1] || '').toLowerCase(); return WEBMAIL.some(w => d.includes(w)) ? 'perso' : 'pro' }

export default function CmsClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [editing, setEditing] = useState<string | null>(null)
  const [form, setForm] = useState<Omit<Client, 'id' | 'created_at' | 'updated_at'>>({ ...EMPTY })
  const [search, setSearch] = useState('')
  const [saving, setSaving] = useState(false)
  const [viewing, setViewing] = useState<Client | null>(null)
  const [segment, setSegment] = useState<'tous' | 'prospects' | 'clients'>('tous')
  const [secteurFilt, setSecteurFilt] = useState('tous')
  const [sort, setSort] = useState<'nom' | 'score' | 'recent'>('recent')
  const [page, setPage] = useState(0)

  const load = () => clientsService.getAll().then(setClients).catch(() => {})
  useEffect(() => { load() }, [])
  useEffect(() => { setPage(0) }, [segment, secteurFilt, search, sort])

  const open = (c?: Client) => { setEditing(c?.id || 'new'); setForm(c ? { nom: c.nom, email: c.email, telephone: c.telephone || '', entreprise: c.entreprise || '', secteur: c.secteur || '', statut: c.statut, notes: c.notes || '', stripe_customer_id: c.stripe_customer_id || '' } : { ...EMPTY }) }
  const save = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true)
    try {
      if (editing === 'new') await clientsService.create(form)
      else if (editing) await clientsService.update(editing, form)
      setEditing(null); load()
    } catch (err: any) { alert(err.message) }
    finally { setSaving(false) }
  }
  const del = async (id: string) => { if (!confirm('Supprimer ce client ?')) return; await clientsService.delete(id); load() }

  const counts = useMemo(() => ({
    tous: clients.length,
    prospects: clients.filter(c => c.statut === 'prospect').length,
    clients: clients.filter(c => c.statut !== 'prospect').length,
  }), [clients])

  const secteurs = useMemo(() => Array.from(new Set(clients.map(c => c.secteur).filter(Boolean))).sort() as string[], [clients])

  const filtered = useMemo(() => {
    let list = clients.filter(c =>
      (segment === 'tous' || (segment === 'prospects' ? c.statut === 'prospect' : c.statut !== 'prospect')) &&
      (secteurFilt === 'tous' || c.secteur === secteurFilt) &&
      [c.nom, c.email, c.entreprise, c.notes].some(v => v?.toLowerCase().includes(search.toLowerCase()))
    )
    list = [...list].sort((a, b) =>
      sort === 'nom' ? a.nom.localeCompare(b.nom)
        : sort === 'score' ? parseScore(b.notes) - parseScore(a.notes)
        : (b.created_at || '').localeCompare(a.created_at || '')
    )
    return list
  }, [clients, segment, secteurFilt, search, sort])

  const pages = Math.max(1, Math.ceil(filtered.length / PER))
  const paged = filtered.slice(page * PER, page * PER + PER)

  const inputCls = "w-full px-3 py-2 rounded-lg text-sm outline-none transition-colors"
  const inputStyle = { border: '1px solid #E5E7EB', background: '#fff', color: '#111827' }

  if (viewing) return <ClientDossier client={viewing} onBack={() => { setViewing(null); load() }} />

  if (editing) return (
    <div>
      <div className="mb-6">
        <button onClick={() => setEditing(null)} className="text-xs mb-2 flex items-center gap-1" style={{ color: '#9CA3AF' }}>← Retour aux clients</button>
        <h1 className="text-xl font-bold" style={{ color: '#111827' }}>{editing === 'new' ? 'Nouveau client' : 'Modifier le client'}</h1>
      </div>
      <form onSubmit={save} className="rounded-xl p-6 space-y-5 max-w-2xl" style={{ background: '#fff', border: '1px solid #E9ECEF' }}>
        <div className="grid md:grid-cols-2 gap-4">
          {([['Nom *', 'nom', true], ['Email', 'email', false], ['Téléphone', 'telephone', false], ['Entreprise', 'entreprise', false], ['Secteur', 'secteur', false]] as [string, keyof typeof EMPTY, boolean][]).map(([label, name, req]) => (
            <div key={name}>
              <label className="text-xs font-semibold block mb-1.5 uppercase tracking-wide" style={{ color: '#6B7280' }}>{label}</label>
              <input required={req} value={form[name] as string} onChange={e => setForm(p => ({ ...p, [name]: e.target.value }))} className={inputCls} style={inputStyle} />
            </div>
          ))}
          <div>
            <label className="text-xs font-semibold block mb-1.5 uppercase tracking-wide" style={{ color: '#6B7280' }}>Statut</label>
            <select value={form.statut} onChange={e => setForm(p => ({ ...p, statut: e.target.value as typeof STATUTS[number] }))} className={inputCls} style={inputStyle}>
              {STATUTS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="text-xs font-semibold block mb-1.5 uppercase tracking-wide" style={{ color: '#6B7280' }}>Notes</label>
          <textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} rows={4} className={`${inputCls} resize-none`} style={inputStyle} />
        </div>
        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={saving} className="px-5 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-50 hover:opacity-90" style={{ background: '#F4521E' }}>{saving ? 'Sauvegarde...' : 'Sauvegarder'}</button>
          <button type="button" onClick={() => setEditing(null)} className="px-5 py-2 rounded-lg text-sm" style={{ border: '1px solid #E5E7EB', color: '#6B7280', background: '#fff' }}>Annuler</button>
        </div>
      </form>
    </div>
  )

  return (
    <div>
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold" style={{ color: '#111827' }}>Clients & Prospects</h1>
          <p className="text-sm mt-0.5" style={{ color: '#9CA3AF' }}>{counts.clients} client(s) · {counts.prospects} prospect(s)</p>
        </div>
        <button onClick={() => open()} className="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg text-white hover:opacity-90" style={{ background: '#F4521E' }}>
          <Plus className="w-4 h-4" /> Nouveau
        </button>
      </div>

      {/* Segments */}
      <div className="flex gap-2 mb-3">
        {([['tous', 'Tous', counts.tous], ['prospects', 'Prospects', counts.prospects], ['clients', 'Clients', counts.clients]] as const).map(([k, label, n]) => (
          <button key={k} onClick={() => setSegment(k)}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            style={{ background: segment === k ? '#0F172A' : '#fff', color: segment === k ? '#fff' : '#6B7280', border: '1px solid #E5E7EB' }}>
            {label} <span className="text-[11px] px-1.5 rounded-full" style={{ background: segment === k ? 'rgba(255,255,255,.2)' : '#F1F5F9' }}>{n}</span>
          </button>
        ))}
      </div>

      {/* Filtres : recherche + secteur + tri */}
      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#9CA3AF' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher (nom, ville, email, secteur…)"
            className="w-full pl-9 pr-4 py-2 rounded-lg text-sm outline-none" style={{ border: '1px solid #E5E7EB', background: '#fff', color: '#111827' }} />
        </div>
        <select value={secteurFilt} onChange={e => setSecteurFilt(e.target.value)} className="px-3 py-2 rounded-lg text-sm outline-none" style={{ border: '1px solid #E5E7EB', background: '#fff', color: '#374151' }}>
          <option value="tous">Tous secteurs</option>
          {secteurs.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={sort} onChange={e => setSort(e.target.value as typeof sort)} className="px-3 py-2 rounded-lg text-sm outline-none" style={{ border: '1px solid #E5E7EB', background: '#fff', color: '#374151' }}>
          <option value="recent">Plus récents</option>
          <option value="score">Meilleur score</option>
          <option value="nom">Nom (A-Z)</option>
        </select>
      </div>

      {/* Table — lignes cliquables */}
      <div className="rounded-xl overflow-hidden" style={{ background: '#fff', border: '1px solid #E9ECEF' }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: '1px solid #F3F4F6', background: '#F9FAFB' }}>
              {['Nom', 'Secteur', 'Contact', 'Statut', 'Score', ''].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: '#9CA3AF' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 && <tr><td colSpan={6} className="text-center py-12 text-sm" style={{ color: '#9CA3AF' }}>Aucun résultat</td></tr>}
            {paged.map((c, i) => {
              const commune = parseCommune(c.notes); const score = parseScore(c.notes); const ek = emailKind(c.email)
              return (
                <tr key={c.id} onClick={() => setViewing(c)} className="cursor-pointer"
                  style={{ borderBottom: i < paged.length - 1 ? '1px solid #F3F4F6' : 'none' }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#FAFAFA'}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0" style={{ background: '#F4521E' }}>{c.nom.charAt(0).toUpperCase()}</div>
                      <div className="min-w-0">
                        <p className="font-medium truncate" style={{ color: '#111827' }}>{c.nom}</p>
                        {commune && <p className="text-xs flex items-center gap-1" style={{ color: '#9CA3AF' }}><MapPin className="w-3 h-3" />{commune}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color: '#6B7280' }}>{c.secteur || '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5" style={{ color: ek === 'pro' ? '#16A34A' : ek === 'perso' ? '#D97706' : '#E5E7EB' }} />
                      <Phone className="w-3.5 h-3.5" style={{ color: c.telephone ? '#16A34A' : '#E5E7EB' }} />
                      {c.notes?.includes('EMAIL ENVOYÉ') && <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium" style={{ background: '#FFF1EC', color: '#F4521E' }}>contacté</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3"><span className={`text-xs px-2.5 py-1 rounded-full font-medium ${COLORS[c.statut]}`}>{c.statut}</span></td>
                  <td className="px-4 py-3">{score > 0 && <span className="text-xs font-bold" style={{ color: score >= 8 ? '#F4521E' : '#9CA3AF' }}>{score}/10</span>}</td>
                  <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                    <div className="flex gap-1">
                      <button onClick={() => open(c)} className="p-1.5 rounded-md" style={{ color: '#9CA3AF' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#F3F4F6'; (e.currentTarget as HTMLElement).style.color = '#374151' }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#9CA3AF' }}>
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => del(c.id)} className="p-1.5 rounded-md" style={{ color: '#9CA3AF' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#FEF2F2'; (e.currentTarget as HTMLElement).style.color = '#EF4444' }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#9CA3AF' }}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-between mt-4 text-sm">
          <span style={{ color: '#9CA3AF' }}>{filtered.length} résultat(s) · page {page + 1}/{pages}</span>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} className="p-2 rounded-lg disabled:opacity-40" style={{ border: '1px solid #E5E7EB', color: '#374151' }}><ChevronLeft className="w-4 h-4" /></button>
            <button onClick={() => setPage(p => Math.min(pages - 1, p + 1))} disabled={page >= pages - 1} className="p-2 rounded-lg disabled:opacity-40" style={{ border: '1px solid #E5E7EB', color: '#374151' }}><ChevronRight className="w-4 h-4" /></button>
          </div>
        </div>
      )}

      <p className="text-xs mt-3" style={{ color: '#9CA3AF' }}>💡 Clique sur une ligne pour ouvrir la fiche (analyse, appel, SMS, email personnalisé).</p>
    </div>
  )
}
