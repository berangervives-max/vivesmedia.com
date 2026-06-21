'use client'
import { useEffect, useState } from 'react'
import { crmService, type ClientDossier as Dossier } from '@/services/supabase.service'
import type { Client } from '@/types'
import { FileText, Receipt, ShoppingBag, Euro, Mail, Phone, Building2, ArrowLeft } from 'lucide-react'

const ORANGE = '#F4521E'
const euro = (n: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n || 0)

const DEVIS_COLORS: Record<string, string> = { nouveau: 'bg-orange-100 text-orange-700', contacte: 'bg-blue-100 text-blue-700', en_cours: 'bg-violet-100 text-violet-700', accepte: 'bg-green-100 text-green-700', refuse: 'bg-gray-100 text-gray-500' }
const FACT_COLORS: Record<string, string> = { brouillon: 'bg-gray-100 text-gray-500', envoyee: 'bg-blue-100 text-blue-700', payee: 'bg-green-100 text-green-700', en_retard: 'bg-red-100 text-red-600', annulee: 'bg-gray-100 text-gray-400' }
const CMD_COLORS: Record<string, string> = { en_attente: 'bg-orange-100 text-orange-700', paye: 'bg-green-100 text-green-700', rembourse: 'bg-blue-100 text-blue-700', annule: 'bg-gray-100 text-gray-500' }

function Badge({ value, map }: { value: string; map: Record<string, string> }) {
  return <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${map[value] || 'bg-gray-100 text-gray-500'}`}>{value}</span>
}

/** Dossier client 360° : agrège devis + factures + commandes liés par l'email. */
export default function ClientDossier({ client, onBack }: { client: Client; onBack: () => void }) {
  const [d, setD] = useState<Dossier | null>(null)

  useEffect(() => { crmService.getDossier(client.email).then(setD).catch(() => setD({ devis: [], factures: [], commandes: [] })) }, [client.email])

  const caFactures = (d?.factures ?? []).filter(f => f.statut === 'payee').reduce((s, f) => s + Number(f.montant_ttc || 0), 0)
  const caCommandes = (d?.commandes ?? []).filter(c => c.statut === 'paye').reduce((s, c) => s + Number(c.montant || 0), 0)
  const caTotal = caFactures + caCommandes
  const enAttente = (d?.factures ?? []).filter(f => f.statut === 'envoyee' || f.statut === 'en_retard').reduce((s, f) => s + Number(f.montant_ttc || 0), 0)

  const card = { background: '#fff', border: '1px solid #E9ECEF' }

  return (
    <div>
      <button onClick={onBack} className="text-xs mb-3 flex items-center gap-1" style={{ color: '#9CA3AF' }}>
        <ArrowLeft className="w-3.5 h-3.5" /> Retour aux clients
      </button>

      {/* Entête client */}
      <div className="rounded-xl p-6 mb-4" style={card}>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold text-white shrink-0" style={{ background: ORANGE }}>
              {client.nom.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-xl font-bold" style={{ color: '#111827' }}>{client.nom}</h1>
              <p className="text-sm" style={{ color: '#9CA3AF' }}>{client.entreprise || '—'}</p>
            </div>
            <span className="ml-2"><Badge value={client.statut} map={{ prospect: 'bg-blue-100 text-blue-700', actif: 'bg-green-100 text-green-700', pause: 'bg-orange-100 text-orange-700', termine: 'bg-gray-100 text-gray-500' }} /></span>
          </div>
          <div className="flex flex-wrap gap-3 text-sm" style={{ color: '#6B7280' }}>
            {client.email && <a href={`mailto:${client.email}`} className="flex items-center gap-1.5 hover:underline"><Mail className="w-3.5 h-3.5" /> {client.email}</a>}
            {client.telephone && <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> {client.telephone}</span>}
            {client.secteur && <span className="flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5" /> {client.secteur}</span>}
          </div>
        </div>
        {client.notes && <p className="text-sm mt-4 pt-4 leading-relaxed" style={{ color: '#6B7280', borderTop: '1px solid #F3F4F6' }}>{client.notes}</p>}
      </div>

      {/* KPIs dossier */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        {[
          { label: 'CA encaissé', value: euro(caTotal), icon: Euro, accent: true },
          { label: 'En attente', value: euro(enAttente), icon: Receipt, accent: false },
          { label: 'Devis', value: String(d?.devis.length ?? '…'), icon: FileText, accent: false },
          { label: 'Commandes', value: String(d?.commandes.length ?? '…'), icon: ShoppingBag, accent: false },
        ].map(k => (
          <div key={k.label} className="rounded-xl p-4" style={{ ...card, borderColor: k.accent ? 'rgba(244,82,30,.25)' : '#E9ECEF' }}>
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-xs" style={{ color: '#9CA3AF' }}>{k.label}</p>
              <k.icon className="w-4 h-4" style={{ color: k.accent ? ORANGE : '#94A3B8' }} />
            </div>
            <p className="text-2xl font-bold" style={{ color: k.accent ? ORANGE : '#111827' }}>{k.value}</p>
          </div>
        ))}
      </div>

      {/* Listes liées */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* Devis */}
        <div className="rounded-xl p-5" style={card}>
          <div className="flex items-center gap-2 mb-3"><FileText className="w-4 h-4" style={{ color: ORANGE }} /><h2 className="text-sm font-bold" style={{ color: '#111827' }}>Devis</h2></div>
          {d && d.devis.length === 0 && <p className="text-xs" style={{ color: '#9CA3AF' }}>Aucun devis</p>}
          <div className="space-y-2">
            {(d?.devis ?? []).map(x => (
              <div key={x.id} className="flex items-center justify-between gap-2 text-sm p-2 rounded-lg" style={{ background: '#F9FAFB' }}>
                <span className="truncate" style={{ color: '#374151' }}>{x.service || 'Demande'}<span className="text-xs ml-1" style={{ color: '#9CA3AF' }}>{new Date(x.created_at).toLocaleDateString('fr-FR')}</span></span>
                <Badge value={x.statut} map={DEVIS_COLORS} />
              </div>
            ))}
          </div>
        </div>
        {/* Factures */}
        <div className="rounded-xl p-5" style={card}>
          <div className="flex items-center gap-2 mb-3"><Receipt className="w-4 h-4" style={{ color: ORANGE }} /><h2 className="text-sm font-bold" style={{ color: '#111827' }}>Factures</h2></div>
          {d && d.factures.length === 0 && <p className="text-xs" style={{ color: '#9CA3AF' }}>Aucune facture</p>}
          <div className="space-y-2">
            {(d?.factures ?? []).map(x => (
              <div key={x.id} className="flex items-center justify-between gap-2 text-sm p-2 rounded-lg" style={{ background: '#F9FAFB' }}>
                <span className="truncate font-mono text-xs" style={{ color: '#374151' }}>{x.numero}</span>
                <span className="flex items-center gap-2 shrink-0"><strong style={{ color: '#111827' }}>{euro(x.montant_ttc)}</strong><Badge value={x.statut} map={FACT_COLORS} /></span>
              </div>
            ))}
          </div>
        </div>
        {/* Commandes */}
        <div className="rounded-xl p-5" style={card}>
          <div className="flex items-center gap-2 mb-3"><ShoppingBag className="w-4 h-4" style={{ color: ORANGE }} /><h2 className="text-sm font-bold" style={{ color: '#111827' }}>Commandes Stripe</h2></div>
          {d && d.commandes.length === 0 && <p className="text-xs" style={{ color: '#9CA3AF' }}>Aucune commande</p>}
          <div className="space-y-2">
            {(d?.commandes ?? []).map(x => (
              <div key={x.id} className="flex items-center justify-between gap-2 text-sm p-2 rounded-lg" style={{ background: '#F9FAFB' }}>
                <span className="truncate" style={{ color: '#374151' }}>{x.service || 'Commande'}</span>
                <span className="flex items-center gap-2 shrink-0"><strong style={{ color: '#111827' }}>{euro(x.montant)}</strong><Badge value={x.statut} map={CMD_COLORS} /></span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
