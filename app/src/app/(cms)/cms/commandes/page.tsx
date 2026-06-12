'use client'
import { useState, useEffect } from 'react'
import { commandesService } from '@/services/supabase.service'
import type { Commande } from '@/types'

const COLORS: Record<string, string> = {
  en_attente: 'bg-orange-100 text-orange-700',
  paye: 'bg-green-100 text-green-700',
  rembourse: 'bg-blue-100 text-blue-700',
  annule: 'bg-gray-100 text-gray-500',
}

type StripeLive = {
  disponible: number
  enRoute: number
  paiements: { id: string; montant: number; statut: string; client: string; date: string; description: string }[]
}

export default function CmsCommandesPage() {
  const [commandes, setCommandes] = useState<Commande[]>([])
  const [stripe, setStripe] = useState<StripeLive | null>(null)
  const [stripeErr, setStripeErr] = useState(false)
  useEffect(() => { commandesService.getAll().then(setCommandes).catch(() => {}) }, [])
  useEffect(() => {
    fetch('/api/cms/stripe').then(r => r.ok ? r.json() : Promise.reject()).then(setStripe).catch(() => setStripeErr(true))
  }, [])
  const total = commandes.filter(c => c.statut === 'paye').reduce((s, c) => s + c.montant, 0)

  return (
    <div>
      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold" style={{ color: '#111827' }}>Commandes</h1>
          <p className="text-sm mt-0.5" style={{ color: '#9CA3AF' }}>
            {commandes.length} commande(s) ·{' '}
            <span style={{ color: '#10B981', fontWeight: 600 }}>{total.toFixed(0)} € encaissés</span>
          </p>
        </div>

        {/* KPI */}
        <div className="flex gap-3">
          <div className="px-4 py-2 rounded-lg text-center" style={{ background: '#fff', border: '1px solid #E9ECEF' }}>
            <p className="text-lg font-bold" style={{ color: '#10B981' }}>{total.toFixed(0)} €</p>
            <p className="text-xs" style={{ color: '#9CA3AF' }}>Encaissé</p>
          </div>
          <div className="px-4 py-2 rounded-lg text-center" style={{ background: '#fff', border: '1px solid #E9ECEF' }}>
            <p className="text-lg font-bold" style={{ color: '#F59E0B' }}>{commandes.filter(c => c.statut === 'en_attente').length}</p>
            <p className="text-xs" style={{ color: '#9CA3AF' }}>En attente</p>
          </div>
        </div>
      </div>

      {/* ── STRIPE EN DIRECT ── */}
      <div className="rounded-xl p-5 mb-5" style={{ background: '#fff', border: '1px solid #E9ECEF' }}>
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs font-bold px-2 py-0.5 rounded" style={{ background: '#635BFF', color: '#fff' }}>Stripe</span>
          <h2 className="font-bold text-sm" style={{ color: '#111827' }}>Compte en direct</h2>
          <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: stripe ? '#DCFCE7' : '#FEF3C7', color: stripe ? '#16A34A' : '#D97706' }}>
            {stripe ? 'Connecté ✓' : stripeErr ? 'Erreur' : 'Chargement…'}
          </span>
        </div>
        {stripe && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <p className="text-xl font-bold" style={{ color: '#111827' }}>{stripe.disponible.toLocaleString('fr-FR')} €</p>
              <p className="text-xs" style={{ color: '#9CA3AF' }}>Solde disponible</p>
            </div>
            <div>
              <p className="text-xl font-bold" style={{ color: '#111827' }}>{stripe.enRoute.toLocaleString('fr-FR')} €</p>
              <p className="text-xs" style={{ color: '#9CA3AF' }}>En route vers ta banque</p>
            </div>
            <div className="col-span-2">
              <p className="text-xs font-semibold mb-1" style={{ color: '#6B7280' }}>Derniers paiements Stripe</p>
              {stripe.paiements.length === 0 ? (
                <p className="text-xs" style={{ color: '#9CA3AF' }}>Aucun paiement pour le moment</p>
              ) : (
                <div className="space-y-1">
                  {stripe.paiements.slice(0, 3).map(pa => (
                    <p key={pa.id} className="text-xs" style={{ color: '#6B7280' }}>
                      <strong style={{ color: '#111827' }}>{pa.montant.toLocaleString('fr-FR')} €</strong> · {pa.client} · {new Date(pa.date).toLocaleDateString('fr-FR')} · {pa.statut === 'succeeded' ? '✓ réussi' : pa.statut}
                    </p>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
        {stripeErr && <p className="text-xs" style={{ color: '#B91C1C' }}>Impossible de joindre Stripe — vérifier la clé sur Vercel.</p>}
      </div>

      {/* Table */}
      <div className="rounded-xl overflow-hidden" style={{ background: '#fff', border: '1px solid #E9ECEF' }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: '1px solid #F3F4F6', background: '#F9FAFB' }}>
              {['Client', 'Service', 'Montant', 'Statut', 'Date'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: '#9CA3AF' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {commandes.length === 0 && (
              <tr><td colSpan={5} className="text-center py-12 text-sm" style={{ color: '#9CA3AF' }}>Aucune commande</td></tr>
            )}
            {commandes.map((c, i) => (
              <tr key={c.id} style={{ borderBottom: i < commandes.length - 1 ? '1px solid #F3F4F6' : 'none' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#FAFAFA'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                      style={{ background: '#0F172A' }}>
                      {(c.client_nom || c.client_email || '?').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium" style={{ color: '#111827' }}>{c.client_nom || '—'}</p>
                      <p className="text-xs" style={{ color: '#9CA3AF' }}>{c.client_email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm" style={{ color: '#6B7280' }}>{c.service || '—'}</td>
                <td className="px-4 py-3 font-semibold" style={{ color: '#111827' }}>{c.montant.toFixed(2)} €</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${COLORS[c.statut]}`}>{c.statut}</span>
                </td>
                <td className="px-4 py-3 text-xs" style={{ color: '#9CA3AF' }}>
                  {new Date(c.created_at).toLocaleDateString('fr-FR')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
