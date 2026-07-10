'use client'

import posthog from 'posthog-js'
import { PostHogProvider as PHProvider, usePostHog } from 'posthog-js/react'
import { useEffect, Suspense } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

function PostHogPageView() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const ph = usePostHog()

  useEffect(() => {
    // On ne track PAS le back-office (admin) : ça fausse les stats publiques.
    if (pathname && ph && !pathname.startsWith('/cms') && !pathname.startsWith('/hub')) {
      let url = window.origin + pathname
      const search = searchParams?.toString()
      if (search) url += `?${search}`
      ph.capture('$pageview', { $current_url: url })
    }
  }, [pathname, searchParams, ph])

  return null
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Init DIFFÉRÉE (quand le navigateur est libre) : garde TOUTES les fonctions PostHog
    // (heatmaps, recording, autocapture, exceptions, web-vitals) mais hors du chemin
    // critique de chargement → beaucoup plus fluide, surtout mobile. Aucune donnée perdue.
    const startPosthog = () => {
      posthog.init('phc_umMWCaohy9wqM6jpDxHqkQqskjocSvWghxnT52c25wNJ', {
        api_host: 'https://eu.i.posthog.com',
        defaults: '2026-05-30',
        person_profiles: 'identified_only',
        capture_pageview: false, // géré manuellement via PostHogPageView
        capture_pageleave: true,
        capture_exceptions: true,        // erreurs JS (message + fichier:ligne + stack)
        capture_heatmaps: true,          // heatmaps de clics/scroll par page
        capture_dead_clicks: true,       // clics sans effet (frustration)
        autocapture: true,               // clics/soumissions sur tous les éléments
        capture_performance: true,       // Core Web Vitals (LCP/CLS/INP) par page
        // Exclut TOUT le back-office (pageviews, autocapture, heatmaps…) des analytics publiques.
        before_send: (event) => {
          if (typeof window !== 'undefined') {
            const p = window.location.pathname
            if (p.startsWith('/cms') || p.startsWith('/hub')) return null
          }
          return event
        },
      })
      // pageview initial capturé une fois PostHog prêt (hors back-office) → aucune perte
      const p = window.location.pathname
      if (!p.startsWith('/cms') && !p.startsWith('/hub')) {
        posthog.capture('$pageview', { $current_url: window.location.href })
      }
    }
    const w = window as unknown as { requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => void }
    if (typeof w.requestIdleCallback === 'function') {
      w.requestIdleCallback(startPosthog, { timeout: 3000 })
    } else {
      setTimeout(startPosthog, 1200)
    }
  }, [])

  return (
    <PHProvider client={posthog}>
      <Suspense fallback={null}>
        <PostHogPageView />
      </Suspense>
      {children}
    </PHProvider>
  )
}
