'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { clientsService, devisService, facturesService, commandesService } from '@/services/supabase.service'
import { Users, FileText, Receipt, ShoppingBag, TrendingUp, AlertCircle, Plus, BookOpen } from 'lucide-react'

type Activity = { id: string; label: string; sub: string; date: string; href: string; icon: typeof FileText; color: string }

export default function DashboardPage() {
  const [stats, setStats] = useState({ clients: 0, devisNonLus: 0, facturesEnRetard: 0, revenuMois: 0, commandesMois: 0 })
  const [recent, setRecent] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      clientsService.getAll(),
      devisService.getAll(),
      facturesService.getAll(),
      commandesService.getAll(),
    ]).then(([clients, devis, factures, commandes]) => {
      const now = new Date()
      const moisDebut = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
      setStats({
        clients: clients.length,
        devisNonLus: devis.filter(d => !d.lu).length,
        facturesEnRetard: factures.filter(f => f.statut === 'en_retard').length,
        revenuMois: factures.filter(f => f.statut === 'payee' && f.created_at >= moisDebut).reduce((s, f) => s + f.montant_ttc, 0),
        commandesMois: commandes.filter(c => c.statut === 'paye' && c.created_at >= moisDebut).length,
      })
      const acts: Activity[] = [
        ...devis.map(d => ({ id: `d${d.id}`, label: `Devis — ${d.nom}`, sub: d.service || 'Demande de devis', date: d.created_at, href: '/cms/devis', icon: FileText, color: '#F4521E' })),
        ...factures.map(f => ({ id: `f${f.id}`, label: `Facture ${f.numero}`, sub: `${f.client_nom} · ${f.montant_ttc.toFixed(0)} €`, date: f.created_at, href: '/cms/factures', icon: Receipt, color: '#8B5CF6' })),
        ...commandes.map(c => ({ id: `c${c.id}`, label: `Commande — ${c.client_nom || c.client_email || '—'}`, sub: `${c.service || ''} · ${c.montant.toFixed(0)} €`, date: c.created_at, href: '/cms/commandes', icon: ShoppingBag, color: '#10B981' })),
      ].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 7)
      setRecent(acts)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const CARDS = [
    { label: 'Clients', value: stats.clients, icon: Users, href: '/cms/clients', color: 'bg-blue-50 text-blue-600' },
    { label: 'Devis non lus', value: stats.devisNonLus, icon: FileText, href: '/cms/devis', color: 'bg-orange-50 text-orange-600', alert: stats.devisNonLus > 0 },
    { label: 'Factures en retard', value: stats.facturesEnRetard, icon: Receipt, href: '/cms/factures', color: 'bg-red-50 text-red-600', alert: stats.facturesEnRetard > 0 },
    { label: 'Revenu ce mois', value: `${stats.revenuMois.toFixed(0)} €`, icon: TrendingUp, href: '/cms/factures', color: 'bg-green-50 text-green-600' },
  ]

  const now = new Date()
  const greeting = now.getHours() < 12 ? 'Bonjour' : now.getHours() < 18 ? 'Bon après-midi' : 'Bonsoir'

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold" style={{ color: '#111827' }}>{greeting}, Béranger 👋</h1>
          <p className="text-sm mt-0.5" style={{ color: '#9CA3AF' }}>
            {now.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
        <Link href="/cms/devis"
          className="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg text-white transition-opacity hover:opacity-90"
          style={{ background: '#F4521E' }}>
          <Plus className="w-4 h-4" /> Nouveau devis
        </Link>
      </div>

      {/* KPI Cards */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[1,2,3,4].map(i => <div key={i} className="h-28 rounded-xl animate-pulse" style={{ background: '#E9ECEF' }} />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {CARDS.map(card => (
            <Link key={card.label} href={card.href}
              className="rounded-xl p-5 flex flex-col gap-3 transition-all hover:-translate-y-0.5 hover:shadow-md relative overflow-hidden"
              style={{ background: '#fff', border: '1px solid #E9ECEF' }}>
              {card.alert && (
                <span className="absolute top-3 right-3 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                </span>
              )}
              <div className="flex items-center justify-between">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${card.color}`}>
                  <card.icon className="w-4 h-4" />
                </div>
              </div>
              <div>
                <p className="text-2xl font-bold tracking-tight" style={{ color: '#111827' }}>{card.value}</p>
                <p className="text-xs mt-0.5" style={{ color: '#9CA3AF' }}>{card.label}</p>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Bottom grid */}
      <div className="grid lg:grid-cols-3 gap-4">

        {/* Accès rapide — 2/3 */}
        <div className="lg:col-span-2 rounded-xl p-5" style={{ background: '#fff', border: '1px solid #E9ECEF' }}>
          <h3 className="text-sm font-semibold mb-4" style={{ color: '#111827' }}>Actions rapides</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { href: '/cms/devis', label: 'Voir les devis', desc: `${stats.devisNonLus} non lu(s)`, icon: FileText, accent: '#F4521E' },
              { href: '/cms/factures', label: 'Nouvelle facture', desc: 'Créer une facture', icon: Receipt, accent: '#8B5CF6' },
              { href: '/cms/articles', label: 'Écrire un article', desc: 'Nouveau post blog', icon: BookOpen, accent: '#3B82F6' },
              { href: '/cms/clients', label: 'Gérer les clients', desc: `${stats.clients} client(s)`, icon: Users, accent: '#10B981' },
            ].map(item => (
              <Link key={item.href} href={item.href}
                className="flex items-center gap-3 p-3 rounded-lg transition-colors group"
                style={{ border: '1px solid #F3F4F6' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = '#E9ECEF'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = '#F3F4F6'}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: `${item.accent}15`, color: item.accent }}>
                  <item.icon className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-medium" style={{ color: '#111827' }}>{item.label}</p>
                  <p className="text-xs" style={{ color: '#9CA3AF' }}>{item.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Ressources — 1/3 */}
        <div className="rounded-xl p-5" style={{ background: '#fff', border: '1px solid #E9ECEF' }}>
          <h3 className="text-sm font-semibold mb-4" style={{ color: '#111827' }}>Ressources</h3>
          <div className="space-y-2">
            {[
              { href: 'https://supabase.com/dashboard', label: 'Supabase', desc: 'Base de données', bg: '#DCFCE7', color: '#16A34A', letter: 'SB' },
              { href: 'https://dashboard.stripe.com', label: 'Stripe', desc: 'Paiements', bg: '#EDE9FE', color: '#7C3AED', letter: 'ST' },
              { href: 'https://vercel.com/dashboard', label: 'Vercel', desc: 'Déploiement', bg: '#111827', color: '#fff', letter: '▲' },
            ].map(r => (
              <a key={r.href} href={r.href} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-3 p-2.5 rounded-lg transition-colors"
                style={{ background: 'transparent' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#F9FAFB'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                <span className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0"
                  style={{ background: r.bg, color: r.color }}>{r.letter}</span>
                <div>
                  <p className="text-sm font-medium" style={{ color: '#111827' }}>{r.label}</p>
                  <p className="text-xs" style={{ color: '#9CA3AF' }}>{r.desc}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Activité récente */}
      <div className="rounded-xl p-5 mt-4" style={{ background: '#fff', border: '1px solid #E9ECEF' }}>
        <h3 className="text-sm font-semibold mb-4" style={{ color: '#111827' }}>Activité récente</h3>
        {loading ? (
          <p className="text-sm" style={{ color: '#9CA3AF' }}>Chargement…</p>
        ) : recent.length === 0 ? (
          <p className="text-sm" style={{ color: '#9CA3AF' }}>Aucune activité pour le moment.</p>
        ) : (
          <div className="divide-y" style={{ borderColor: '#F3F4F6' }}>
            {recent.map(a => (
              <Link key={a.id} href={a.href} className="flex items-center gap-3 py-2.5 transition-colors rounded-lg px-2 -mx-2"
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = '#FAFAFA'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                <span className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${a.color}15`, color: a.color }}>
                  <a.icon className="w-3.5 h-3.5" />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: '#111827' }}>{a.label}</p>
                  <p className="text-xs truncate" style={{ color: '#9CA3AF' }}>{a.sub}</p>
                </div>
                <span className="text-xs shrink-0" style={{ color: '#D1D5DB' }}>{new Date(a.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
