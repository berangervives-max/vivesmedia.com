'use client'

/**
 * Bannière de consentement RGPD/CNIL + Google Consent Mode v2 (mode avancé),
 * dessinée 100 % à la DA vivesmedia.com (Inter Tight + Instrument Serif italique,
 * orange #F4521E, pilules rounded-full + lueur, tokens foreground/muted).
 * - « Refuser » aussi accessible que « Accepter » (exigence CNIL).
 * - Au choix : gtag consent update + opt-in/opt-out PostHog, mémorisé 12 mois.
 * Le défaut « denied » est posé AVANT gtag (script inline dans layout.tsx).
 */

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowUpRight, ShieldCheck } from 'lucide-react'
import posthog from 'posthog-js'

const COOKIE = 'vm_consent'
const ORANGE = '#F4521E'

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
  }
}

function readConsent(): string | null {
  if (typeof document === 'undefined') return null
  const m = document.cookie.match(new RegExp(`(?:^|; )${COOKIE}=([^;]+)`))
  return m ? m[1] : null
}

function writeConsent(value: 'granted' | 'denied') {
  document.cookie = `${COOKIE}=${value}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`
}

export default function ConsentBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!readConsent()) setVisible(true)
  }, [])

  const decide = (granted: boolean) => {
    writeConsent(granted ? 'granted' : 'denied')
    window.gtag?.('consent', 'update', {
      ad_storage: granted ? 'granted' : 'denied',
      ad_user_data: granted ? 'granted' : 'denied',
      ad_personalization: granted ? 'granted' : 'denied',
      analytics_storage: granted ? 'granted' : 'denied',
    })
    try {
      if (granted) posthog.opt_in_capturing()
      else posthog.opt_out_capturing()
    } catch {
      /* PostHog pas encore prêt : le cookie fera foi au prochain chargement. */
    }
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Gestion du consentement aux cookies"
      className="fixed inset-x-4 bottom-4 z-[100] mx-auto max-w-2xl rounded-2xl border border-black/5 bg-white/95 p-5 backdrop-blur-md sm:p-6"
      style={{ boxShadow: '0 16px 50px -12px rgba(17,24,39,0.28)' }}
    >
      <div className="flex items-start gap-4">
        <span
          className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-full sm:flex"
          style={{ backgroundColor: 'rgba(244,82,30,0.10)' }}
        >
          <ShieldCheck className="h-5 w-5" style={{ color: ORANGE }} />
        </span>

        <div className="flex-1">
          <p className="text-base font-semibold tracking-tight text-foreground">
            Ta vie privée,{' '}
            <span className="italic" style={{ fontFamily: 'var(--font-instrument-serif)', color: ORANGE }}>
              ton choix
            </span>
          </p>
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
            On utilise une mesure d&apos;audience (Google Analytics, PostHog) pour améliorer le site.
            Aucun cookie de suivi n&apos;est déposé sans ton accord.{' '}
            <Link
              href="/mentions-legales"
              className="font-medium underline underline-offset-2 transition-opacity hover:opacity-80"
              style={{ color: ORANGE }}
            >
              En savoir plus
            </Link>
          </p>

          <div className="mt-4 flex flex-col gap-2.5 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={() => decide(true)}
              className="flex items-center justify-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: ORANGE, boxShadow: '0 8px 30px rgba(244,82,30,0.4)' }}
            >
              Tout accepter <ArrowUpRight className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => decide(false)}
              className="rounded-full border px-6 py-2.5 text-sm font-semibold transition-colors hover:bg-foreground/5"
              style={{ borderColor: 'rgba(17,24,39,0.15)', color: '#111827' }}
            >
              Refuser
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
