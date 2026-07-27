'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { clientsService, devisService, facturesService, commandesService } from '@/services/supabase.service'
import { Users, FileText, Receipt, ShoppingBag, TrendingUp, Plus, BookOpen, Activity, Send, Eye, MousePointerClick, Phone, MessageSquare, MessageCircle } from 'lucide-react'

type Activity = { id: string; label: string; sub: string; date: string; href: string; icon: typeof FileText; color: string }

export default function DashboardPage() {
  const [stats, setStats] = useState({ clients: 0, devisNonLus: 0, facturesEnRetard: 0, revenuMois: 0, commandesMois: 0 })
  const [recent, setRecent] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [suivi, setSuivi] = useState({ sent: 0, open: 0, click: 0, call: 0, sms: 0, whatsapp: 0 })
  const [pipeline, setPipeline] = useState({ prospects: 0, aContacter: 0, contactes: 0 })

  useEffect(() => {
    // KPI de suivi prospection (emails/ouvertures/clics/appels/SMS/WhatsApp)
    fetch('/api/cms/prospect-activity?summary=1').then(r => r.json()).then(d => {
      const c = d.counts || {}
      setSuivi({ sent: c.prospect_email || 0, open: c.email_open || 0, click: c.email_click || 0, call: c.prospect_call || 0, sms: c.prospect_sms || 0, whatsapp: c.prospect_whatsapp || 0 })
    }).catch(() => {})
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
      // Pipeline prospection (depuis les clients/prospects)
      const contacted = (n?: string) => !!n && (n.includes('EMAIL ENVOYÉ') || n.includes('SMS ENVOYÉ'))
      const prospects = clients.filter(c => c.statut === 'prospect')
      setPipeline({
        prospects: prospects.length,
        aContacter: prospects.filter(c => (c.email || c.telephone) && !contacted(c.notes)).length,
        contactes: clients.filter(c => contacted(c.notes)).length,
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
    { label: 'Clients', value: stats.clients, icon: Users, href: '/cms/clients', tint: '#EEF3FB', fg: '#3A6DB0' },
    { label: 'Devis non lus', value: stats.devisNonLus, icon: FileText, href: '/cms/devis', tint: '#FCEFE9', fg: '#F4521E', alert: stats.devisNonLus > 0 },
    { label: 'Factures en retard', value: stats.facturesEnRetard, icon: Receipt, href: '/cms/factures', tint: '#FCECEC', fg: '#C4392F', alert: stats.facturesEnRetard > 0 },
    { label: 'Revenu ce mois', value: `${stats.revenuMois.toFixed(0)} €`, icon: TrendingUp, href: '/cms/factures', tint: '#EAF5EE', fg: '#2E8B5A' },
  ]

  const now = new Date()
  const greeting = now.getHours() < 12 ? 'Bonjour' : now.getHours() < 18 ? 'Bon après-midi' : 'Bonsoir'

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--cms-ink)' }}>
            {greeting}, <span className="cms-accent">Béranger</span> 👋
          </h1>
          <p className="text-sm mt-1 first-letter:uppercase" style={{ color: 'var(--cms-muted)' }}>
            {now.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
        <Link href="/cms/devis" className="cms-btn cms-btn-primary">
          <Plus className="w-4 h-4" /> Nouveau devis
        </Link>
      </div>

      {/* KPI Cards */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[1,2,3,4].map(i => <div key={i} className="h-28 rounded-2xl animate-pulse" style={{ background: 'var(--cms-surface-2)' }} />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {CARDS.map(card => (
            <Link key={card.label} href={card.href}
              className="cms-card p-5 flex flex-col gap-3 transition-all hover:-translate-y-0.5 relative overflow-hidden"
              style={{ boxShadow: 'var(--cms-shadow)' }}>
              {card.alert && (
                <span className="absolute top-3 right-3 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: card.fg }} />
                  <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: card.fg }} />
                </span>
              )}
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: card.tint, color: card.fg }}>
                <card.icon className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[1.9rem] leading-none font-bold tracking-tighter" style={{ color: 'var(--cms-ink)' }}>{card.value}</p>
                <p className="text-xs mt-1.5" style={{ color: 'var(--cms-muted)' }}>{card.label}</p>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Suivi prospection */}
      <div className="cms-card p-5 mb-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold flex items-center gap-2" style={{ color: 'var(--cms-ink)' }}><Activity className="w-4 h-4" style={{ color: '#F4521E' }} /> Suivi prospection</h3>
          <Link href="/cms/suivi" className="text-xs font-semibold" style={{ color: '#F4521E' }}>Voir le détail →</Link>
        </div>
        <div className="grid grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
          {[
            { label: 'Emails envoyés', v: suivi.sent, icon: Send, c: '#F4521E' },
            { label: 'Ouverts', v: suivi.open, icon: Eye, c: '#2E8B5A' },
            { label: 'Clics', v: suivi.click, icon: MousePointerClick, c: '#3A6DB0' },
            { label: 'Appels', v: suivi.call, icon: Phone, c: '#57514B' },
            { label: 'SMS', v: suivi.sms, icon: MessageSquare, c: '#57514B' },
            { label: 'WhatsApp', v: suivi.whatsapp, icon: MessageCircle, c: '#2E8B5A' },
          ].map(k => (
            <div key={k.label} className="rounded-xl p-3" style={{ border: '1px solid var(--cms-border)' }}>
              <div className="flex items-center justify-between mb-1"><span className="text-[11px]" style={{ color: 'var(--cms-muted)' }}>{k.label}</span><k.icon className="w-3.5 h-3.5" style={{ color: k.c }} /></div>
              <p className="text-xl font-bold" style={{ color: k.c }}>{k.v}</p>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Prospects', v: pipeline.prospects, c: 'var(--cms-ink-2)' },
            { label: 'À contacter', v: pipeline.aContacter, c: '#F4521E' },
            { label: 'Contactés', v: pipeline.contactes, c: '#3A6DB0' },
          ].map(k => (
            <Link key={k.label} href="/cms/clients" className="rounded-xl p-3 flex items-center justify-between transition-colors" style={{ background: 'var(--cms-surface-2)', border: '1px solid var(--cms-border)' }}>
              <span className="text-xs" style={{ color: 'var(--cms-ink-2)' }}>{k.label}</span>
              <span className="text-lg font-bold" style={{ color: k.c }}>{k.v}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Bottom grid */}
      <div className="grid lg:grid-cols-3 gap-4">

        {/* Actions rapides — 2/3 */}
        <div className="lg:col-span-2 cms-card p-5">
          <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--cms-ink)' }}>Actions rapides</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { href: '/cms/devis', label: 'Voir les devis', desc: `${stats.devisNonLus} non lu(s)`, icon: FileText, accent: '#F4521E' },
              { href: '/cms/factures', label: 'Nouvelle facture', desc: 'Créer une facture', icon: Receipt, accent: '#8B5CF6' },
              { href: '/cms/articles', label: 'Écrire un article', desc: 'Nouveau post blog', icon: BookOpen, accent: '#3A6DB0' },
              { href: '/cms/clients', label: 'Gérer les clients', desc: `${stats.clients} client(s)`, icon: Users, accent: '#2E8B5A' },
            ].map(item => (
              <Link key={item.href} href={item.href}
                className="flex items-center gap-3 p-3 rounded-xl transition-colors group"
                style={{ border: '1px solid var(--cms-border)' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--cms-surface-2)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: `${item.accent}15`, color: item.accent }}>
                  <item.icon className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--cms-ink)' }}>{item.label}</p>
                  <p className="text-xs" style={{ color: 'var(--cms-muted)' }}>{item.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Ressources — 1/3 */}
        <div className="cms-card p-5">
          <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--cms-ink)' }}>Ressources</h3>
          <div className="space-y-2">
            {[
              { href: 'https://supabase.com/dashboard', label: 'Supabase', desc: 'Base de données', bg: '#DCFCE7', color: '#16A34A', letter: 'SB' },
              { href: 'https://dashboard.stripe.com', label: 'Stripe', desc: 'Paiements', bg: '#EDE9FE', color: '#7C3AED', letter: 'ST' },
              { href: 'https://vercel.com/dashboard', label: 'Vercel', desc: 'Déploiement', bg: '#16130F', color: '#fff', letter: '▲' },
            ].map(r => (
              <a key={r.href} href={r.href} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-3 p-2.5 rounded-xl transition-colors"
                style={{ background: 'transparent' }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--cms-surface-2)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                <span className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0"
                  style={{ background: r.bg, color: r.color }}>{r.letter}</span>
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--cms-ink)' }}>{r.label}</p>
                  <p className="text-xs" style={{ color: 'var(--cms-muted)' }}>{r.desc}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Activité récente */}
      <div className="cms-card p-5 mt-4">
        <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--cms-ink)' }}>Activité récente</h3>
        {loading ? (
          <p className="text-sm" style={{ color: 'var(--cms-muted)' }}>Chargement…</p>
        ) : recent.length === 0 ? (
          <p className="text-sm" style={{ color: 'var(--cms-muted)' }}>Aucune activité pour le moment.</p>
        ) : (
          <div className="divide-y" style={{ borderColor: 'var(--cms-border)' }}>
            {recent.map(a => (
              <Link key={a.id} href={a.href} className="flex items-center gap-3 py-2.5 transition-colors rounded-lg px-2 -mx-2"
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--cms-surface-2)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                <span className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${a.color}15`, color: a.color }}>
                  <a.icon className="w-3.5 h-3.5" />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: 'var(--cms-ink)' }}>{a.label}</p>
                  <p className="text-xs truncate" style={{ color: 'var(--cms-muted)' }}>{a.sub}</p>
                </div>
                <span className="text-xs shrink-0" style={{ color: 'var(--cms-faint)' }}>{new Date(a.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
