'use client'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import {
  LayoutDashboard, Users, FileText, Receipt, ShoppingBag,
  BookOpen, Star, Mail, BarChart3, Globe, CalendarDays, Send,
  Zap, Settings, LogOut, Menu, X, ExternalLink
} from 'lucide-react'

const NAV_SECTIONS = [
  {
    label: 'Pilotage',
    items: [
      { href: '/cms/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/cms/stats', label: 'Statistiques', icon: BarChart3 },
      { href: '/cms/trafic', label: 'Trafic web', icon: Globe },
    ],
  },
  {
    label: 'Ventes',
    items: [
      { href: '/cms/devis', label: 'Devis', icon: FileText },
      { href: '/cms/clients', label: 'Clients', icon: Users },
      { href: '/cms/factures', label: 'Factures', icon: Receipt },
      { href: '/cms/commandes', label: 'Commandes', icon: ShoppingBag },
    ],
  },
  {
    label: 'Marketing',
    items: [
      { href: '/cms/articles', label: 'Articles', icon: BookOpen },
      { href: '/cms/temoignages', label: 'Témoignages', icon: Star },
      { href: '/cms/newsletter', label: 'Newsletter', icon: Mail },
      { href: '/cms/campagnes', label: 'Campagnes', icon: Send },
    ],
  },
  {
    label: 'Hub Clients',
    items: [
      { href: '/hub/admin', label: 'Projets clients', icon: Users },
    ],
  },
  {
    label: 'Outils',
    items: [
      { href: '/cms/agenda', label: 'Agenda & RDV', icon: CalendarDays },
      { href: '/cms/automations', label: 'Automatisations', icon: Zap },
      { href: '/cms/settings', label: 'Paramètres', icon: Settings },
    ],
  },
]

const SECTION_LABELS: Record<string, string> = Object.fromEntries(
  NAV_SECTIONS.flatMap(s => s.items.map(i => [i.href, i.label]))
)

export default function CmsLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [checking, setChecking] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (pathname === '/cms/login') { setChecking(false); return }
    const sb = createClient()
    sb.auth.getSession().then(({ data: { session } }) => {
      // Seul l'admin accède au CMS — les clients du Hub partagent le même Supabase Auth
      if (!session || session.user.email !== 'berangervives@gmail.com') router.replace('/cms/login')
      else setChecking(false)
    })
  }, [router, pathname])

  const handleLogout = async () => {
    const sb = createClient()
    await sb.auth.signOut()
    router.replace('/cms/login')
  }

  if (checking) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#F8F9FA' }}>
      <div className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#F4521E', borderTopColor: 'transparent' }} />
    </div>
  )

  const currentLabel = SECTION_LABELS[pathname] ?? 'CMS'

  return (
    <div className="min-h-screen flex" style={{ background: '#F1F3F5' }}>

      {/* SIDEBAR */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-60 flex flex-col transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
        style={{ background: '#0F172A' }}>

        {/* Logo */}
        <div className="h-14 flex items-center justify-between px-5 shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,.07)' }}>
          <span className="font-bold text-sm tracking-tight text-white">
            vives<span style={{ color: '#F4521E' }}>media</span>
            <span style={{ color: 'rgba(255,255,255,.3)' }}>.com</span>
          </span>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1 rounded-md" style={{ color: 'rgba(255,255,255,.4)' }}>
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nav sections */}
        <nav className="flex-1 px-3 overflow-y-auto pb-4 pt-2">
          {NAV_SECTIONS.map(section => (
            <div key={section.label} className="mb-1">
              <p className="px-2 pt-4 pb-1.5 text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,.25)' }}>
                {section.label}
              </p>
              <div className="space-y-0.5">
                {section.items.map(({ href, label, icon: Icon }) => {
                  const active = pathname === href
                  return (
                    <Link key={href} href={href} onClick={() => setSidebarOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-150"
                      style={{
                        background: active ? 'rgba(244,82,30,.15)' : 'transparent',
                        color: active ? '#F4521E' : 'rgba(255,255,255,.5)',
                        fontWeight: active ? 600 : 400,
                      }}>
                      <Icon className="w-4 h-4 shrink-0" />
                      <span className="flex-1">{label}</span>
                      {active && <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#F4521E' }} />}
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-3 pb-4 shrink-0" style={{ borderTop: '1px solid rgba(255,255,255,.07)', paddingTop: '12px' }}>
          <button onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm w-full transition-all duration-150"
            style={{ color: 'rgba(255,255,255,.35)' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#fff'; (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,.06)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,.35)'; (e.currentTarget as HTMLElement).style.background = 'transparent' }}>
            <LogOut className="w-4 h-4" />
            <span>Se déconnecter</span>
          </button>
        </div>
      </aside>

      {/* Overlay mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" style={{ background: 'rgba(0,0,0,.5)' }} onClick={() => setSidebarOpen(false)} />
      )}

      {/* MAIN */}
      <div className="flex-1 lg:ml-60 flex flex-col min-h-screen">

        {/* TOPBAR */}
        <header className="h-14 flex items-center px-6 gap-4 sticky top-0 z-30"
          style={{ background: '#fff', borderBottom: '1px solid #E9ECEF' }}>
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-1.5 rounded-md" style={{ color: '#6B7280' }}>
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 text-sm">
            <span style={{ color: '#9CA3AF' }}>CMS</span>
            <span style={{ color: '#D1D5DB' }}>/</span>
            <span className="font-semibold" style={{ color: '#111827' }}>{currentLabel}</span>
          </div>

          <div className="flex-1" />

          <Link href="/" target="_blank"
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md transition-colors"
            style={{ color: '#6B7280', border: '1px solid #E5E7EB' }}>
            <ExternalLink className="w-3 h-3" />
            Voir le site
          </Link>

          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
            style={{ background: '#F4521E' }}>
            B
          </div>
        </header>

        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}
