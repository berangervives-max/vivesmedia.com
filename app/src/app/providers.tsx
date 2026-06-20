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
    if (pathname && ph) {
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
    posthog.init('phc_umMWCaohy9wqM6jpDxHqkQqskjocSvWghxnT52c25wNJ', {
      api_host: 'https://eu.i.posthog.com',
      defaults: '2026-05-30',
      person_profiles: 'identified_only',
      capture_pageview: false, // géré manuellement via PostHogPageView
      capture_pageleave: true,
      capture_exceptions: true,        // erreurs JS (message + fichier:ligne + stack) → savoir QUOI bugge et OÙ
      capture_heatmaps: true,          // heatmaps de clics/scroll par page
      capture_dead_clicks: true,       // clics sans effet (frustration)
      autocapture: true,               // clics/soumissions sur tous les éléments
      capture_performance: true,       // Core Web Vitals (LCP/CLS/INP) par page
    })
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
