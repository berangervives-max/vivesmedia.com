'use client'
import { useState, useEffect, useMemo } from 'react'
import { clientsService } from '@/services/supabase.service'
import type { Client } from '@/types'
import { Plus, Pencil, Trash2, Search, Mail, Phone, MapPin, ChevronLeft, ChevronRight, LayoutGrid, List, Send, ArrowUpRight, Flame, CheckCircle2, Users, UserPlus } from 'lucide-react'
import ClientDossier from '@/components/cms/ClientDossier'

const STATUTS = ['prospect', 'actif', 'pause', 'termine'] as const
const COLORS: Record<string, string> = { prospect: 'bg-blue-100 text-blue-700', actif: 'bg-green-100 text-green-700', pause: 'bg-orange-100 text-orange-700', termine: 'bg-gray-100 text-gray-500' }
const EMPTY: Omit<Client, 'id' | 'created_at' | 'updated_at'> = { nom: '', email: '', telephone: '', entreprise: '', secteur: '', statut: 'prospect', notes: '', stripe_customer_id: '' }
const ORANGE = '#F4521E'
const WEBMAIL = ['gmail.', 'orange.fr', 'free.fr', 'wanadoo.fr', 'hotmail.', 'outlook.', 'live.', 'yahoo.', 'sfr.fr', 'laposte.net', 'icloud.', 'gmx.', 'aol.', 'bbox.fr', 'neuf.fr']

const parseCommune = (n?: string) => (n?.match(/·\s*([^·]+?)\s*\(8\d{4}\)/) || [])[1] || ''
const parseScore = (n?: string) => { const m = n?.match(/score\s+(\d+)\/10/i); return m ? parseInt(m[1]) : 0 }
const emailKind = (e?: string) => { if (!e) return 'none'; const d = (e.split('@')[1] || '').toLowerCase(); return WEBMAIL.some(w => d.includes(w)) ? 'perso' : 'pro' }
const isContacted = (c: Client) => !!c.notes?.includes('EMAIL ENVOYÉ')
const hasContact = (c: Client) => !!(c.email || c.telephone)
const normPhone = (t?: string) => (t || '').replace(/[\s.\-]/g, '').replace(/^\+33/, '0')
const isMobile = (t?: string) => /^0[67]/.test(normPhone(t))
// Couleur de priorité (barre gauche) : client (vert) · à contacter (orange) · contacté (bleu) · sans coordonnées (gris)
const priorityColor = (c: Client) => c.statut !== 'prospect' ? '#16A34A' : isContacted(c) ? '#2563EB' : hasContact(c) ? ORANGE : '#CBD5E1'

// ── Code couleur par catégorie de secteur (avatar + puce secteur) ──
const CAT_STYLE: Record<string, { bg: string; fg: string; label: string }> = {
  food: { bg: '#FEF3C7', fg: '#B45309', label: 'Restauration & alimentation' },
  beaute: { bg: '#FCE7F3', fg: '#BE185D', label: 'Beauté & bien-être' },
  sante: { bg: '#CCFBF1', fg: '#0F766E', label: 'Santé' },
  btp: { bg: '#DBEAFE', fg: '#1D4ED8', label: 'Artisanat & BTP' },
  auto: { bg: '#E0E7FF', fg: '#4338CA', label: 'Automobile' },
  commerce: { bg: '#EDE9FE', fg: '#6D28D9', label: 'Commerce' },
  pro: { bg: '#D1FAE5', fg: '#047857', label: 'Services pro' },
  tourisme: { bg: '#CFFAFE', fg: '#0E7490', label: 'Tourisme' },
  autre: { bg: '#F1F5F9', fg: '#475569', label: 'Autre' },
}
const SECTOR_CAT: Record<string, keyof typeof CAT_STYLE> = {
  restaurant: 'food', 'restauration rapide': 'food', 'bar / café': 'food', pizzeria: 'food', traiteur: 'food', boulangerie: 'food', 'pâtisserie': 'food', boucherie: 'food', caviste: 'food', 'épicerie fine': 'food',
  coiffure: 'beaute', 'institut de beauté': 'beaute', 'institut de beaute': 'beaute', 'spa / bien-être': 'beaute', 'salle de sport': 'beaute',
  dentiste: 'sante', opticien: 'sante', pharmacie: 'sante', 'kinésithérapeute': 'sante', kinesitherapeute: 'sante', osteopathe: 'sante',
  'plomberie / chauffage': 'btp', plombier: 'btp', 'électricité': 'btp', electricien: 'btp', menuiserie: 'btp', peinture: 'btp', peintre: 'btp', 'carrelage / sols': 'btp', carreleur: 'btp', 'plâtrerie': 'btp', 'construction maison': 'btp', macon: 'btp', paysagiste: 'btp', isolation: 'btp',
  'garage automobile': 'auto', 'vente auto': 'auto', moto: 'auto', 'équipement auto': 'auto', 'personnalisation auto': 'auto',
  'prêt-à-porter': 'commerce', fleuriste: 'commerce', 'magasin de meubles': 'commerce', 'commerce de détail': 'commerce', 'électroménager / hifi': 'commerce',
  architecte: 'pro', 'avocat / juridique': 'pro', avocat: 'pro', 'expert-comptable': 'pro', 'conseil en gestion': 'pro', 'agence de pub': 'pro', photographe: 'pro', 'design / déco': 'pro', 'agence immobilière': 'pro', 'agence immobiliere': 'pro', 'courtier assurance': 'pro',
  'hôtel': 'tourisme', 'gîte / chambres d’hôtes': 'tourisme', 'agence de voyage': 'tourisme',
  'auto-école': 'autre', 'auto ecole': 'autre', formation: 'autre', 'pressing / blanchisserie': 'autre',
}
const sectorStyle = (s?: string) => CAT_STYLE[SECTOR_CAT[s || ''] || 'autre']

type Segment = 'tous' | 'prospects' | 'a_contacter' | 'contactes' | 'clients' | 'sans_coord'

export default function CmsClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [editing, setEditing] = useState<string | null>(null)
  const [form, setForm] = useState<Omit<Client, 'id' | 'created_at' | 'updated_at'>>({ ...EMPTY })
  const [search, setSearch] = useState('')
  const [saving, setSaving] = useState(false)
  const [viewing, setViewing] = useState<Client | null>(null)
  const [segment, setSegment] = useState<Segment>('tous')
  const [secteurFilt, setSecteurFilt] = useState('tous')
  const [sort, setSort] = useState<'nom' | 'score' | 'recent'>('score')
  const [view, setView] = useState<'cards' | 'list'>('cards')
  const [page, setPage] = useState(0)
  const [selMode, setSelMode] = useState(false)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const PER = view === 'cards' ? 24 : 50

  const load = () => clientsService.getAll().then(setClients).catch(() => {})
  useEffect(() => { load() }, [])
  useEffect(() => { setPage(0) }, [segment, secteurFilt, search, sort, view])

  const open = (c?: Client) => { setEditing(c?.id || 'new'); setForm(c ? { nom: c.nom, email: c.email, telephone: c.telephone || '', entreprise: c.entreprise || '', secteur: c.secteur || '', statut: c.statut, notes: c.notes || '', stripe_customer_id: c.stripe_customer_id || '' } : { ...EMPTY }) }
  const save = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true)
    try {
      if (editing === 'new') await clientsService.create(form)
      else if (editing) await clientsService.update(editing, form)
      setEditing(null); load()
    } catch (err) { alert(err instanceof Error ? err.message : 'Erreur') }
    finally { setSaving(false) }
  }
  const del = async (id: string) => { if (!confirm('Supprimer ce client ?')) return; await clientsService.delete(id); load() }
  const toggleSel = (id: string) => setSelected(p => { const n = new Set(p); if (n.has(id)) n.delete(id); else n.add(id); return n })
  const delSelected = async () => {
    if (selected.size === 0) return
    if (!confirm(`Supprimer définitivement ${selected.size} fiche(s) ? Action irréversible.`)) return
    for (const id of selected) { try { await clientsService.delete(id) } catch { /* ignore */ } }
    setSelected(new Set()); setSelMode(false); load()
  }
  const rowClick = (c: Client) => { if (selMode) toggleSel(c.id); else setViewing(c) }

  const counts = useMemo(() => ({
    tous: clients.length,
    prospects: clients.filter(c => c.statut === 'prospect').length,
    clients: clients.filter(c => c.statut !== 'prospect').length,
    a_contacter: clients.filter(c => c.statut === 'prospect' && hasContact(c) && !isContacted(c)).length,
    contactes: clients.filter(c => isContacted(c)).length,
    sans_coord: clients.filter(c => c.statut === 'prospect' && !hasContact(c)).length,
  }), [clients])

  const secteurs = useMemo(() => Array.from(new Set(clients.map(c => c.secteur).filter(Boolean))).sort() as string[], [clients])

  const matchSegment = (c: Client) => {
    switch (segment) {
      case 'prospects': return c.statut === 'prospect'
      case 'clients': return c.statut !== 'prospect'
      case 'a_contacter': return c.statut === 'prospect' && hasContact(c) && !isContacted(c)
      case 'contactes': return isContacted(c)
      case 'sans_coord': return c.statut === 'prospect' && !hasContact(c)
      default: return true
    }
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    const list = clients.filter(c => matchSegment(c) &&
      (secteurFilt === 'tous' || c.secteur === secteurFilt) &&
      [c.nom, c.email, c.entreprise, c.notes].some(v => v?.toLowerCase().includes(q)))
    return [...list].sort((a, b) =>
      sort === 'nom' ? a.nom.localeCompare(b.nom)
        : sort === 'score' ? (parseScore(b.notes) - parseScore(a.notes)) || (b.created_at || '').localeCompare(a.created_at || '')
          : (b.created_at || '').localeCompare(a.created_at || ''))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clients, segment, secteurFilt, search, sort])

  const pages = Math.max(1, Math.ceil(filtered.length / PER))
  const paged = filtered.slice(page * PER, page * PER + PER)

  const inputCls = 'w-full px-3 py-2 rounded-lg text-sm outline-none transition-colors'
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
          <button type="submit" disabled={saving} className="px-5 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-50 hover:opacity-90" style={{ background: ORANGE }}>{saving ? 'Sauvegarde...' : 'Sauvegarder'}</button>
          <button type="button" onClick={() => setEditing(null)} className="px-5 py-2 rounded-lg text-sm" style={{ border: '1px solid #E5E7EB', color: '#6B7280', background: '#fff' }}>Annuler</button>
        </div>
      </form>
    </div>
  )

  const kpis = [
    { key: 'a_contacter' as Segment, label: 'À contacter', value: counts.a_contacter, icon: Flame, color: ORANGE, hint: 'joignables, pas encore relancés' },
    { key: 'contactes' as Segment, label: 'Contactés', value: counts.contactes, icon: CheckCircle2, color: '#2563EB', hint: 'un email a été envoyé' },
    { key: 'clients' as Segment, label: 'Clients', value: counts.clients, icon: Users, color: '#16A34A', hint: 'convertis' },
    { key: 'tous' as Segment, label: 'Total base', value: counts.tous, icon: UserPlus, color: '#64748B', hint: 'prospects + clients' },
  ]
  const chips: { key: Segment; label: string; n: number }[] = [
    { key: 'tous', label: 'Tous', n: counts.tous },
    { key: 'prospects', label: 'Prospects', n: counts.prospects },
    { key: 'a_contacter', label: 'À contacter', n: counts.a_contacter },
    { key: 'contactes', label: 'Contactés', n: counts.contactes },
    { key: 'clients', label: 'Clients', n: counts.clients },
    { key: 'sans_coord', label: 'Sans coordonnées', n: counts.sans_coord },
  ]

  return (
    <div>
      {/* Header */}
      <div className="mb-5 flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold" style={{ color: '#111827' }}>Clients & Prospects</h1>
          <p className="text-sm mt-0.5" style={{ color: '#9CA3AF' }}>{counts.clients} client(s) · {counts.prospects} prospect(s)</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {selMode && selected.size > 0 && (
            <button onClick={delSelected} className="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg text-white hover:opacity-90" style={{ background: '#DC2626' }}>
              <Trash2 className="w-4 h-4" /> Supprimer ({selected.size})
            </button>
          )}
          <button onClick={() => { setSelMode(m => !m); setSelected(new Set()) }} className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg" style={{ border: '1px solid #E5E7EB', color: selMode ? '#DC2626' : '#6B7280', background: '#fff' }}>
            {selMode ? 'Annuler' : 'Sélectionner'}
          </button>
          <button onClick={() => open()} className="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg text-white hover:opacity-90" style={{ background: ORANGE }}>
            <Plus className="w-4 h-4" /> Nouveau
          </button>
        </div>
      </div>

      {/* Pipeline (KPI cliquables) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {kpis.map(k => {
          const on = segment === k.key
          return (
            <button key={k.key} onClick={() => setSegment(k.key)} className="text-left rounded-xl p-4 transition-all"
              style={{ background: '#fff', border: `1px solid ${on ? k.color : '#E9ECEF'}`, boxShadow: on ? `0 0 0 1px ${k.color}` : 'none' }}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs" style={{ color: '#9CA3AF' }}>{k.label}</span>
                <k.icon className="w-4 h-4" style={{ color: k.color }} />
              </div>
              <p className="text-2xl font-bold leading-none" style={{ color: k.color }}>{k.value}</p>
              <p className="text-[11px] mt-1.5" style={{ color: '#9CA3AF' }}>{k.hint}</p>
            </button>
          )
        })}
      </div>

      {/* Filtres : chips + recherche + secteur + tri + vue */}
      <div className="flex flex-wrap items-center gap-2 mb-3">
        {chips.map(c => (
          <button key={c.key} onClick={() => setSegment(c.key)}
            className="px-3 py-1.5 rounded-full text-xs font-medium transition-colors flex items-center gap-1.5"
            style={{ background: segment === c.key ? '#0F172A' : '#fff', color: segment === c.key ? '#fff' : '#6B7280', border: '1px solid #E5E7EB' }}>
            {c.label} <span className="text-[10px] px-1.5 rounded-full" style={{ background: segment === c.key ? 'rgba(255,255,255,.2)' : '#F1F5F9' }}>{c.n}</span>
          </button>
        ))}
      </div>
      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#9CA3AF' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher (nom, ville, email, secteur…)"
            className="w-full pl-9 pr-4 py-2 rounded-lg text-sm outline-none" style={inputStyle} />
        </div>
        <select value={secteurFilt} onChange={e => setSecteurFilt(e.target.value)} className="px-3 py-2 rounded-lg text-sm outline-none" style={inputStyle}>
          <option value="tous">Tous secteurs</option>
          {secteurs.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={sort} onChange={e => setSort(e.target.value as typeof sort)} className="px-3 py-2 rounded-lg text-sm outline-none" style={inputStyle}>
          <option value="score">Meilleur score</option>
          <option value="recent">Plus récents</option>
          <option value="nom">Nom (A-Z)</option>
        </select>
        <div className="flex rounded-lg overflow-hidden shrink-0" style={{ border: '1px solid #E5E7EB' }}>
          {([['cards', LayoutGrid], ['list', List]] as const).map(([v, Icon]) => (
            <button key={v} onClick={() => setView(v)} className="px-3 py-2" title={v === 'cards' ? 'Cartes' : 'Liste'}
              style={{ background: view === v ? '#0F172A' : '#fff', color: view === v ? '#fff' : '#9CA3AF' }}>
              <Icon className="w-4 h-4" />
            </button>
          ))}
        </div>
      </div>

      {/* Légende code couleur */}
      <div className="rounded-xl p-3 mb-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px]" style={{ background: '#fff', border: '1px solid #E9ECEF' }}>
        <span className="font-semibold" style={{ color: '#6B7280' }}>Priorité (barre gauche) :</span>
        {([['à contacter', ORANGE], ['contacté', '#2563EB'], ['client', '#16A34A'], ['sans coordonnées', '#CBD5E1']] as [string, string][]).map(([l, col]) => (
          <span key={l} className="flex items-center gap-1" style={{ color: '#6B7280' }}><span className="w-2.5 h-2.5 rounded-sm" style={{ background: col }} />{l}</span>
        ))}
        <span className="w-px h-4" style={{ background: '#E5E7EB' }} />
        <span className="font-semibold" style={{ color: '#6B7280' }}>Secteurs :</span>
        {Object.values(CAT_STYLE).filter(c => c.label !== 'Autre').map(c => (
          <span key={c.label} className="px-1.5 py-0.5 rounded-full font-medium" style={{ background: c.bg, color: c.fg }}>{c.label}</span>
        ))}
        <span className="w-px h-4" style={{ background: '#E5E7EB' }} />
        <span style={{ color: '#6B7280' }}>Contact : <b style={{ color: '#16A34A' }}>mobile/pro</b> · <b style={{ color: '#D97706' }}>fixe/perso</b></span>
      </div>

      {paged.length === 0 && (
        <div className="text-center py-16 rounded-xl text-sm" style={{ background: '#fff', border: '1px solid #E9ECEF', color: '#9CA3AF' }}>Aucun résultat pour ce filtre.</div>
      )}

      {/* Vue CARTES */}
      {view === 'cards' && paged.length > 0 && (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {paged.map(c => {
            const commune = parseCommune(c.notes); const score = parseScore(c.notes); const ek = emailKind(c.email); const prio = priorityColor(c); const ss = sectorStyle(c.secteur)
            const sel = selected.has(c.id)
            return (
              <div key={c.id} onClick={() => rowClick(c)} className="group relative rounded-xl p-4 cursor-pointer transition-shadow hover:shadow-md"
                style={{ background: sel ? '#FFF7F5' : '#fff', border: `1px solid ${sel ? ORANGE : '#E9ECEF'}`, borderLeft: `3px solid ${prio}` }}>
                {/* Sélection (mode lot) + suppression rapide */}
                {selMode && (
                  <span className="absolute top-2 left-2 w-5 h-5 rounded flex items-center justify-center text-[11px] font-bold" style={{ background: sel ? ORANGE : '#fff', border: `1.5px solid ${sel ? ORANGE : '#CBD5E1'}`, color: '#fff' }}>{sel ? '✓' : ''}</span>
                )}
                {!selMode && (
                  <button onClick={e => { e.stopPropagation(); del(c.id) }} title="Supprimer" className="absolute top-2 right-2 p-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: '#9CA3AF' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#FEF2F2'; (e.currentTarget as HTMLElement).style.color = '#EF4444' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#9CA3AF' }}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0" style={{ background: ss.fg }}>{c.nom.charAt(0).toUpperCase()}</div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold truncate" style={{ color: '#111827' }}>{c.nom}</p>
                    <p className="text-xs truncate" style={{ color: '#9CA3AF' }}>{c.entreprise || '—'}</p>
                  </div>
                  {score > 0 && <span className="text-xs font-bold px-2 py-0.5 rounded-full shrink-0" style={{ background: score >= 8 ? 'rgba(244,82,30,.1)' : '#F1F5F9', color: score >= 8 ? ORANGE : '#94A3B8' }}>{score}/10</span>}
                </div>
                <div className="flex items-center gap-2 mt-3 text-xs flex-wrap">
                  {c.secteur && <span className="px-2 py-0.5 rounded-full font-medium" style={{ background: ss.bg, color: ss.fg }}>{c.secteur}</span>}
                  {commune && <span className="flex items-center gap-1" style={{ color: '#9CA3AF' }}><MapPin className="w-3 h-3" />{commune}</span>}
                </div>
                <div className="mt-3 space-y-1 text-xs">
                  {c.telephone ? (
                    <a href={`tel:${normPhone(c.telephone)}`} onClick={e => e.stopPropagation()} className="flex items-center gap-1.5 hover:underline" style={{ color: '#374151' }}>
                      <Phone className="w-3.5 h-3.5" style={{ color: '#16A34A' }} /> {c.telephone}
                      <span className="text-[9px] px-1 rounded" style={{ background: '#F1F5F9', color: '#64748B' }}>{isMobile(c.telephone) ? 'mobile' : 'fixe'}</span>
                    </a>
                  ) : null}
                  {c.email ? (
                    <a href={`mailto:${c.email}`} onClick={e => e.stopPropagation()} className="flex items-center gap-1.5 hover:underline" style={{ color: '#374151' }}>
                      <Mail className="w-3.5 h-3.5 shrink-0" style={{ color: ek === 'pro' ? '#16A34A' : '#D97706' }} /> <span className="truncate">{c.email}</span>
                      <span className="text-[9px] px-1 rounded shrink-0" style={ek === 'pro' ? { background: '#DCFCE7', color: '#16A34A' } : { background: '#FEF3C7', color: '#D97706' }}>{ek === 'pro' ? 'pro' : 'perso'}</span>
                    </a>
                  ) : null}
                  {!hasContact(c) && <span className="flex items-center gap-1.5" style={{ color: '#B45309' }}><Search className="w-3.5 h-3.5" /> coordonnées à trouver</span>}
                </div>
                <div className="flex items-center justify-between mt-3 pt-3" style={{ borderTop: '1px solid #F3F4F6' }}>
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${COLORS[c.statut]}`}>{c.statut}</span>
                    {isContacted(c) && <span className="text-[10px] px-2 py-0.5 rounded-full font-medium flex items-center gap-1" style={{ background: '#EFF6FF', color: '#2563EB' }}><Send className="w-2.5 h-2.5" />contacté</span>}
                  </div>
                  <span className="text-xs font-semibold flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: ORANGE }}>Ouvrir <ArrowUpRight className="w-3.5 h-3.5" /></span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Vue LISTE */}
      {view === 'list' && paged.length > 0 && (
        <div className="rounded-xl overflow-hidden" style={{ background: '#fff', border: '1px solid #E9ECEF' }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid #F3F4F6', background: '#F9FAFB' }}>
                {['Nom', 'Secteur', 'Coordonnées', 'Suivi', 'Score', ''].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: '#9CA3AF' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paged.map((c, i) => {
                const commune = parseCommune(c.notes); const score = parseScore(c.notes); const ek = emailKind(c.email); const prio = priorityColor(c); const ss = sectorStyle(c.secteur)
                return (
                  <tr key={c.id} onClick={() => rowClick(c)} className="cursor-pointer"
                    style={{ borderBottom: i < paged.length - 1 ? '1px solid #F3F4F6' : 'none', borderLeft: `3px solid ${prio}`, background: selected.has(c.id) ? '#FFF7F5' : 'transparent' }}
                    onMouseEnter={e => { if (!selected.has(c.id)) (e.currentTarget as HTMLElement).style.background = '#FAFAFA' }}
                    onMouseLeave={e => { if (!selected.has(c.id)) (e.currentTarget as HTMLElement).style.background = 'transparent' }}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {selMode && <span className="w-5 h-5 rounded flex items-center justify-center text-[11px] font-bold shrink-0" style={{ background: selected.has(c.id) ? ORANGE : '#fff', border: `1.5px solid ${selected.has(c.id) ? ORANGE : '#CBD5E1'}`, color: '#fff' }}>{selected.has(c.id) ? '✓' : ''}</span>}
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0" style={{ background: ss.fg }}>{c.nom.charAt(0).toUpperCase()}</div>
                        <div className="min-w-0">
                          <p className="font-medium truncate" style={{ color: '#111827' }}>{c.nom}</p>
                          {commune && <p className="text-xs flex items-center gap-1" style={{ color: '#9CA3AF' }}><MapPin className="w-3 h-3" />{commune}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">{c.secteur ? <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: ss.bg, color: ss.fg }}>{c.secteur}</span> : <span className="text-xs" style={{ color: '#9CA3AF' }}>—</span>}</td>
                    <td className="px-4 py-3 text-xs" style={{ color: '#6B7280' }}>
                      {c.telephone ? <a href={`tel:${normPhone(c.telephone)}`} onClick={e => e.stopPropagation()} className="flex items-center gap-1 hover:underline"><Phone className="w-3 h-3" style={{ color: isMobile(c.telephone) ? '#16A34A' : '#64748B' }} />{c.telephone}<span className="text-[9px] px-1 rounded" style={{ background: '#F1F5F9', color: '#64748B' }}>{isMobile(c.telephone) ? 'mobile' : 'fixe'}</span></a> : null}
                      {c.email ? <a href={`mailto:${c.email}`} onClick={e => e.stopPropagation()} className="flex items-center gap-1 hover:underline"><Mail className="w-3 h-3 shrink-0" style={{ color: ek === 'pro' ? '#16A34A' : '#D97706' }} /><span className="truncate max-w-[170px]">{c.email}</span><span className="text-[9px] px-1 rounded shrink-0" style={ek === 'pro' ? { background: '#DCFCE7', color: '#16A34A' } : { background: '#FEF3C7', color: '#D97706' }}>{ek === 'pro' ? 'pro' : 'perso'}</span></a> : null}
                      {!hasContact(c) && <span style={{ color: '#B45309' }}>à trouver</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${COLORS[c.statut]}`}>{c.statut}</span>
                      {isContacted(c) && <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded-full font-medium" style={{ background: '#EFF6FF', color: '#2563EB' }}>contacté</span>}
                    </td>
                    <td className="px-4 py-3">{score > 0 && <span className="text-xs font-bold" style={{ color: score >= 8 ? ORANGE : '#9CA3AF' }}>{score}/10</span>}</td>
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
      )}

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4 text-sm">
        <span style={{ color: '#9CA3AF' }}>{filtered.length} résultat(s){pages > 1 ? ` · page ${page + 1}/${pages}` : ''}</span>
        {pages > 1 && (
          <div className="flex gap-2">
            <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} className="p-2 rounded-lg disabled:opacity-40" style={{ border: '1px solid #E5E7EB', color: '#374151' }}><ChevronLeft className="w-4 h-4" /></button>
            <button onClick={() => setPage(p => Math.min(pages - 1, p + 1))} disabled={page >= pages - 1} className="p-2 rounded-lg disabled:opacity-40" style={{ border: '1px solid #E5E7EB', color: '#374151' }}><ChevronRight className="w-4 h-4" /></button>
          </div>
        )}
      </div>

      <p className="text-xs mt-3" style={{ color: '#9CA3AF' }}>💡 Clique une carte pour ouvrir la fiche (analyse, appel, SMS, email perso + suivi). La barre colorée à gauche = <span style={{ color: ORANGE }}>à contacter</span> · <span style={{ color: '#2563EB' }}>contacté</span> · <span style={{ color: '#16A34A' }}>client</span> · <span style={{ color: '#94A3B8' }}>sans coordonnées</span>.</p>
    </div>
  )
}
