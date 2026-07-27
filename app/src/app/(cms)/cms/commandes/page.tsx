'use client'
import { useState, useEffect } from 'react'
import { commandesService, clientsService } from '@/services/supabase.service'
import type { Commande } from '@/types'

const ST: Record<string, { bg: string; fg: string; label: string }> = {
  en_attente: { bg: 'var(--cms-warn-bg)', fg: 'var(--cms-warn-fg)', label: 'En attente' },
  paye: { bg: 'var(--cms-ok-bg)', fg: 'var(--cms-ok-fg)', label: 'Payé' },
  rembourse: { bg: 'var(--cms-info-bg)', fg: 'var(--cms-info-fg)', label: 'Remboursé' },
  annule: { bg: 'var(--cms-surface-2)', fg: 'var(--cms-muted)', label: 'Annulé' },
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
  const [clientEmails, setClientEmails] = useState<Set<string>>(new Set())
  useEffect(() => {
    commandesService.getAll().then(setCommandes).catch(() => {})
    clientsService.getAll().then(cs => setClientEmails(new Set(cs.map(c => c.email.trim().toLowerCase())))).catch(() => {})
  }, [])
  const estClient = (email?: string) => !!email && clientEmails.has(email.trim().toLowerCase())
  useEffect(() => { fetch('/api/cms/stripe').then(r => r.ok ? r.json() : Promise.reject()).then(setStripe).catch(() => setStripeErr(true)) }, [])
  const total = commandes.filter(c => c.statut === 'paye').reduce((s, c) => s + c.montant, 0)
  const cardStyle = { background: 'var(--cms-card)', border: '1px solid var(--cms-border)', boxShadow: 'var(--cms-shadow)' }

  return (
    <div>
      {/* Header */}
      <div className="mb-5 flex items-start justify-between gap-3 flex-wrap">
        <div>
          <p className="cms-eyebrow">Ventes</p>
          <h1 className="text-2xl font-bold tracking-tight mt-1" style={{ color: 'var(--cms-ink)' }}>Commandes</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--cms-muted)' }}>{commandes.length} commande(s) · <b style={{ color: 'var(--cms-ok-fg)' }}>{total.toLocaleString('fr-FR')} € encaissés</b></p>
        </div>
        <div className="flex gap-3">
          <div className="px-4 py-2.5 rounded-2xl text-center" style={cardStyle}>
            <p className="text-lg font-bold tracking-tight" style={{ color: 'var(--cms-ok-fg)' }}>{total.toLocaleString('fr-FR')} €</p>
            <p className="text-xs" style={{ color: 'var(--cms-muted)' }}>Encaissé</p>
          </div>
          <div className="px-4 py-2.5 rounded-2xl text-center" style={cardStyle}>
            <p className="text-lg font-bold tracking-tight" style={{ color: 'var(--cms-warn-fg)' }}>{commandes.filter(c => c.statut === 'en_attente').length}</p>
            <p className="text-xs" style={{ color: 'var(--cms-muted)' }}>En attente</p>
          </div>
        </div>
      </div>

      {/* Stripe en direct */}
      <div className="rounded-2xl p-5 mb-5" style={cardStyle}>
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs font-bold px-2 py-0.5 rounded" style={{ background: '#635BFF', color: '#fff' }}>Stripe</span>
          <h2 className="font-bold text-sm" style={{ color: 'var(--cms-ink)' }}>Compte en direct</h2>
          <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold" style={{ background: stripe ? 'var(--cms-ok-bg)' : 'var(--cms-warn-bg)', color: stripe ? 'var(--cms-ok-fg)' : 'var(--cms-warn-fg)' }}>
            {stripe ? 'Connecté ✓' : stripeErr ? 'Erreur' : 'Chargement…'}
          </span>
        </div>
        {stripe && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div><p className="text-xl font-bold tracking-tight" style={{ color: 'var(--cms-ink)' }}>{stripe.disponible.toLocaleString('fr-FR')} €</p><p className="text-xs" style={{ color: 'var(--cms-muted)' }}>Solde disponible</p></div>
            <div><p className="text-xl font-bold tracking-tight" style={{ color: 'var(--cms-ink)' }}>{stripe.enRoute.toLocaleString('fr-FR')} €</p><p className="text-xs" style={{ color: 'var(--cms-muted)' }}>En route vers ta banque</p></div>
            <div className="col-span-2">
              <p className="text-xs font-semibold mb-1" style={{ color: 'var(--cms-ink-2)' }}>Derniers paiements Stripe</p>
              {stripe.paiements.length === 0 ? <p className="text-xs" style={{ color: 'var(--cms-muted)' }}>Aucun paiement pour le moment</p> : (
                <div className="space-y-1">
                  {stripe.paiements.slice(0, 3).map(pa => (
                    <p key={pa.id} className="text-xs" style={{ color: 'var(--cms-ink-2)' }}><strong style={{ color: 'var(--cms-ink)' }}>{pa.montant.toLocaleString('fr-FR')} €</strong> · {pa.client} · {new Date(pa.date).toLocaleDateString('fr-FR')} · {pa.statut === 'succeeded' ? '✓ réussi' : pa.statut}</p>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
        {stripeErr && <p className="text-xs" style={{ color: 'var(--cms-danger-fg)' }}>Impossible de joindre Stripe — vérifier la clé sur Vercel.</p>}
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-x-auto" style={cardStyle}>
        <table className="w-full text-sm" style={{ minWidth: 640 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--cms-border)', background: 'var(--cms-surface-2)' }}>
              {['Client', 'Service', 'Montant', 'Statut', 'Date'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-[0.7rem] font-semibold uppercase tracking-wider" style={{ color: 'var(--cms-muted)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {commandes.length === 0 && <tr><td colSpan={5} className="text-center py-12 text-sm" style={{ color: 'var(--cms-muted)' }}>Aucune commande</td></tr>}
            {commandes.map((c, i) => (
              <tr key={c.id} style={{ borderBottom: i < commandes.length - 1 ? '1px solid var(--cms-border)' : 'none' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--cms-surface-2)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold text-white shrink-0" style={{ background: 'var(--cms-brand)' }}>{(c.client_nom || c.client_email || '?').charAt(0).toUpperCase()}</div>
                    <div>
                      <p className="font-medium flex items-center gap-1.5" style={{ color: 'var(--cms-ink)' }}>{c.client_nom || '—'}{estClient(c.client_email) && <span className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold" style={{ background: 'var(--cms-ok-bg)', color: 'var(--cms-ok-fg)' }}>client</span>}</p>
                      <p className="text-xs" style={{ color: 'var(--cms-muted)' }}>{c.client_email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm" style={{ color: 'var(--cms-ink-2)' }}>{c.service || '—'}</td>
                <td className="px-4 py-3 font-semibold" style={{ color: 'var(--cms-ink)', fontVariantNumeric: 'tabular-nums' }}>{c.montant.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €</td>
                <td className="px-4 py-3"><span className="cms-badge" style={{ background: (ST[c.statut] || ST.annule).bg, color: (ST[c.statut] || ST.annule).fg }}>{(ST[c.statut] || { label: c.statut }).label}</span></td>
                <td className="px-4 py-3 text-xs" style={{ color: 'var(--cms-faint)' }}>{new Date(c.created_at).toLocaleDateString('fr-FR')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
