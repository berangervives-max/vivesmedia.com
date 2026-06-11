'use client'
import { useState, useEffect } from 'react'
import { devisService } from '@/services/supabase.service'
import type { Devis } from '@/types'
import { Trash2, Mail, Phone, Briefcase, DollarSign, MessageSquare } from 'lucide-react'

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

  const load = () => devisService.getAll().then(setDevis).catch(() => {})
  useEffect(() => { load() }, [])

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

  const nonLus = devis.filter(d => !d.lu).length

  return (
    <div>
      {/* Header */}
      <div className="mb-5">
        <h1 className="text-xl font-bold" style={{ color: '#111827' }}>Devis</h1>
        <p className="text-sm mt-0.5" style={{ color: '#9CA3AF' }}>
          {devis.length} demande(s) · {nonLus > 0 && <span style={{ color: '#F59E0B', fontWeight: 600 }}>{nonLus} non lu(s)</span>}
          {nonLus === 0 && 'Tout lu'}
        </p>
      </div>

      <div className="grid lg:grid-cols-5 gap-4">
        {/* Liste */}
        <div className="lg:col-span-2 space-y-2">
          {devis.length === 0 && (
            <div className="rounded-xl p-10 text-center text-sm" style={{ background: '#fff', border: '1px solid #E9ECEF', color: '#9CA3AF' }}>
              Aucun devis reçu
            </div>
          )}
          {devis.map(d => (
            <button key={d.id} onClick={() => markRead(d)}
              className="w-full text-left rounded-xl p-4 transition-all"
              style={{
                background: '#fff',
                border: `1px solid ${selected?.id === d.id ? '#F4521E' : '#E9ECEF'}`,
                boxShadow: selected?.id === d.id ? '0 0 0 2px rgba(244,82,30,.1)' : 'none',
              }}>
              <div className="flex items-center justify-between mb-1">
                <p className="font-semibold text-sm" style={{ color: '#111827' }}>{d.nom}</p>
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
    </div>
  )
}
