'use client'
import { useState } from 'react'
import { ArrowUpRight, Check } from 'lucide-react'
import { motion } from 'framer-motion'
import { track } from '@/lib/analytics'

export default function LeadCaptureSection() {
  const [email, setEmail] = useState('')
  const [website, setWebsite] = useState('') // honeypot
  const [status, setStatus] = useState<'idle' | 'loading' | 'sent' | 'error'>('idle')

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (status === 'loading' || status === 'sent') return
    setStatus('loading')
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, website, source: 'accueil' }),
      })
      if (!res.ok) throw new Error('failed')
      track('lead_captured', { location: 'accueil', source: 'accueil' })
      setStatus('sent')
    } catch {
      setStatus('error')
    }
  }

  return (
    <section className="bg-background py-8 sm:py-10">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-2xl px-6 py-8 sm:px-10 sm:py-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6"
          style={{ backgroundColor: '#FFF4ED' }}
        >
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--brand-cta)' }}>
              Pas encore prêt à appeler ?
            </p>
            <h3 className="text-xl sm:text-2xl font-bold text-foreground">Laissez-moi juste votre email.</h3>
            <p className="mt-1.5 text-sm text-muted-foreground max-w-sm">
              Je vous recontacte personnellement sous 24h, sans formulaire à rallonge.
            </p>
          </div>

          {status === 'sent' ? (
            <div className="flex items-center gap-2 rounded-xl bg-[#1E6B3C] text-white px-5 py-4 text-sm font-medium sm:min-w-[320px]">
              <Check className="w-4 h-4 shrink-0" /> Merci, c&apos;est noté. Vérifiez votre boîte mail.
            </div>
          ) : (
            <form onSubmit={onSubmit} className="sm:min-w-[320px]">
              <div className="flex gap-2">
                <div className="flex-1 flex flex-col gap-1">
                  <label htmlFor="lead-email" className="text-[11px] font-semibold text-muted-foreground">
                    Votre email professionnel
                  </label>
                  <input
                    id="lead-email"
                    type="email"
                    required
                    autoComplete="email"
                    inputMode="email"
                    placeholder="vous@entreprise.fr"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-[46px] rounded-xl border border-border bg-white px-3.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--brand-cta)]"
                  />
                </div>
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="self-end h-[46px] px-5 rounded-xl text-white text-sm font-semibold flex items-center gap-1.5 whitespace-nowrap disabled:opacity-60"
                  style={{ backgroundColor: '#17150f' }}
                >
                  {status === 'loading' ? 'Envoi…' : <>Être recontacté <ArrowUpRight className="w-4 h-4" /></>}
                </button>
                {/* Honeypot — invisible pour un humain, piège pour un robot */}
                <input
                  type="text"
                  name="website"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  tabIndex={-1}
                  autoComplete="off"
                  className="absolute opacity-0 pointer-events-none w-0 h-0"
                  aria-hidden="true"
                />
              </div>
              {status === 'error' && (
                <p className="mt-2 text-xs text-red-600">Un souci est survenu, réessayez ou écrivez à contact@vivesmedia.com.</p>
              )}
              <p className="mt-2 text-[11px] text-muted-foreground">Aucun spam. Désinscription en un clic.</p>
            </form>
          )}
        </motion.div>
      </div>
    </section>
  )
}
