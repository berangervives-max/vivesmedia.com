'use client'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import {
  LayoutDashboard, Users, FileText, Receipt, ShoppingBag,
  BookOpen, Star, Mail, Settings, LogOut, ChevronRight, Menu, X, ExternalLink
} from 'lucide-react'

const NAV = [
  { href: '/cms/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/cms/clients', label: 'Clients', icon: Users },
  { href: '/cms/devis', label: 'Devis', icon: FileText },
  { href: '/cms/factures', label: 'Factures', icon: Receipt },
  { href: '/cms/commandes', label: 'Commandes', icon: ShoppingBag },
  { href: '/cms/articles', label: 'Articles', icon: BookOpen },
  { href: '/cms/temoignages', label: 'Témoignages', icon: Star },
  { href: '/cms/newsletter', label: 'Newsletter', icon: Mail },
]

const SECTION_LABELS: Record<string, string> = {
  '/cms/dashboard': 'Dashboard',
  '/cms/clients': 'Clients',
  '/cms/devis': 'Devis',
  '/cms/factures': 'Factures',
  '/cms/commandes': 'Commandes',
  '/cms/articles': 'Articles',
  '/cms/temoignages': 'Témoignages',
  '/cms/newsletter': 'Newsletter',
}

export default function CmsLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [checking, setChecking] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (pathname === '/cms/login') { setChecking(false); return }
    const sb = createClient()
    sb.auth.getSession().then(({ data: { session } }) => {
      if (!session) router.replace('/cms/login')
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

        {/* Nav label */}
        <div className="px-5 pt-5 pb-2">
          <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,.25)' }}>Navigation</p>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto pb-4">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname === href
            return (
              <Link key={href} href={href} onClick={() => setSidebarOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150"
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

          {/* Breadcrumb */}
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

          {/* Avatar */}
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
            style={{ background: '#F4521E' }}>
            B
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}
