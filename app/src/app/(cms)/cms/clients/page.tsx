'use client'
import { useState, useEffect } from 'react'
import { clientsService } from '@/services/supabase.service'
import type { Client } from '@/types'
import { Plus, Pencil, Trash2, Search, Eye } from 'lucide-react'
import ClientDossier from '@/components/cms/ClientDossier'

const STATUTS = ['prospect','actif','pause','termine'] as const
const COLORS: Record<string, string> = { prospect: 'bg-blue-100 text-blue-700', actif: 'bg-green-100 text-green-700', pause: 'bg-orange-100 text-orange-700', termine: 'bg-gray-100 text-gray-500' }
const EMPTY: Omit<Client, 'id' | 'created_at' | 'updated_at'> = { nom: '', email: '', telephone: '', entreprise: '', secteur: '', statut: 'prospect', notes: '', stripe_customer_id: '' }

export default function CmsClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [editing, setEditing] = useState<string | null>(null)
  const [form, setForm] = useState<Omit<Client, 'id' | 'created_at' | 'updated_at'>>({ ...EMPTY })
  const [search, setSearch] = useState('')
  const [saving, setSaving] = useState(false)
  const [viewing, setViewing] = useState<Client | null>(null)

  const load = () => clientsService.getAll().then(setClients).catch(() => {})
  useEffect(() => { load() }, [])

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

  const filtered = clients.filter(c => [c.nom, c.email, c.entreprise].some(v => v?.toLowerCase().includes(search.toLowerCase())))

  const inputCls = "w-full px-3 py-2 rounded-lg text-sm outline-none transition-colors"
  const inputStyle = { border: '1px solid #E5E7EB', background: '#fff', color: '#111827' }

  if (viewing) return <ClientDossier client={viewing} onBack={() => setViewing(null)} />

  if (editing) return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <button onClick={() => setEditing(null)} className="text-xs mb-2 flex items-center gap-1" style={{ color: '#9CA3AF' }}>
            ← Retour aux clients
          </button>
          <h1 className="text-xl font-bold" style={{ color: '#111827' }}>
            {editing === 'new' ? 'Nouveau client' : 'Modifier le client'}
          </h1>
        </div>
      </div>
      <form onSubmit={save} className="rounded-xl p-6 space-y-5 max-w-2xl" style={{ background: '#fff', border: '1px solid #E9ECEF' }}>
        <div className="grid md:grid-cols-2 gap-4">
          {([['Nom *', 'nom', true], ['Email *', 'email', true], ['Téléphone', 'telephone', false], ['Entreprise', 'entreprise', false], ['Secteur', 'secteur', false]] as [string, keyof typeof EMPTY, boolean][]).map(([label, name, req]) => (
            <div key={name}>
              <label className="text-xs font-semibold block mb-1.5 uppercase tracking-wide" style={{ color: '#6B7280' }}>{label}</label>
              <input required={req} value={form[name] as string} onChange={e => setForm(p => ({ ...p, [name]: e.target.value }))}
                className={inputCls} style={inputStyle} />
            </div>
          ))}
          <div>
            <label className="text-xs font-semibold block mb-1.5 uppercase tracking-wide" style={{ color: '#6B7280' }}>Statut</label>
            <select value={form.statut} onChange={e => setForm(p => ({ ...p, statut: e.target.value as typeof STATUTS[number] }))}
              className={inputCls} style={inputStyle}>
              {STATUTS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="text-xs font-semibold block mb-1.5 uppercase tracking-wide" style={{ color: '#6B7280' }}>Notes</label>
          <textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} rows={3}
            className={`${inputCls} resize-none`} style={inputStyle} />
        </div>
        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={saving}
            className="px-5 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-50 transition-opacity hover:opacity-90"
            style={{ background: '#F4521E' }}>
            {saving ? 'Sauvegarde...' : 'Sauvegarder'}
          </button>
          <button type="button" onClick={() => setEditing(null)}
            className="px-5 py-2 rounded-lg text-sm transition-colors"
            style={{ border: '1px solid #E5E7EB', color: '#6B7280', background: '#fff' }}>
            Annuler
          </button>
        </div>
      </form>
    </div>
  )

  return (
    <div>
      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold" style={{ color: '#111827' }}>Clients</h1>
          <p className="text-sm mt-0.5" style={{ color: '#9CA3AF' }}>{clients.length} client(s) au total</p>
        </div>
        <button onClick={() => open()}
          className="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg text-white transition-opacity hover:opacity-90"
          style={{ background: '#F4521E' }}>
          <Plus className="w-4 h-4" /> Nouveau client
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#9CA3AF' }} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher par nom, email, entreprise..."
          className="w-full pl-9 pr-4 py-2 rounded-lg text-sm outline-none"
          style={{ border: '1px solid #E5E7EB', background: '#fff', color: '#111827' }} />
      </div>

      {/* Table */}
      <div className="rounded-xl overflow-hidden" style={{ background: '#fff', border: '1px solid #E9ECEF' }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: '1px solid #F3F4F6', background: '#F9FAFB' }}>
              {['Nom', 'Email', 'Entreprise', 'Statut', 'Actions'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: '#9CA3AF' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={5} className="text-center py-12 text-sm" style={{ color: '#9CA3AF' }}>Aucun client trouvé</td></tr>
            )}
            {filtered.map((c, i) => (
              <tr key={c.id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid #F3F4F6' : 'none' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#FAFAFA'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                      style={{ background: '#F4521E' }}>
                      {c.nom.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-medium" style={{ color: '#111827' }}>{c.nom}</span>
                  </div>
                </td>
                <td className="px-4 py-3" style={{ color: '#6B7280' }}>{c.email}</td>
                <td className="px-4 py-3" style={{ color: '#6B7280' }}>{c.entreprise || <span style={{ color: '#D1D5DB' }}>—</span>}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${COLORS[c.statut]}`}>{c.statut}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    <button onClick={() => setViewing(c)} title="Dossier 360° (devis, factures, commandes)"
                      className="p-1.5 rounded-md transition-colors"
                      style={{ color: '#9CA3AF' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(244,82,30,.08)'; (e.currentTarget as HTMLElement).style.color = '#F4521E' }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#9CA3AF' }}>
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => open(c)}
                      className="p-1.5 rounded-md transition-colors"
                      style={{ color: '#9CA3AF' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#F3F4F6'; (e.currentTarget as HTMLElement).style.color = '#374151' }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#9CA3AF' }}>
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => del(c.id)}
                      className="p-1.5 rounded-md transition-colors"
                      style={{ color: '#9CA3AF' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#FEF2F2'; (e.currentTarget as HTMLElement).style.color = '#EF4444' }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#9CA3AF' }}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
