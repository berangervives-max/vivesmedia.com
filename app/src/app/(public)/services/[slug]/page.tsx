import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowUpRight, Check, Star, Phone, CalendarDays, X } from 'lucide-react'
import { SERVICES_DATA, getServiceBySlug } from '@/data/services-data'
import { getServiceDetail } from '@/data/services-detail'
import JsonLd from '@/components/seo/JsonLd'
import TrackView from '@/components/analytics/TrackView'
import BuyButton from '@/components/ui/BuyButton'
import { getBuyableOffer } from '@/lib/checkout-catalog'
import { serviceSchema, faqSchema, breadcrumbSchema, SITE_URL } from '@/lib/schema'

export async function generateStaticParams() {
  return SERVICES_DATA.map(s => ({ slug: s.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const service = getServiceBySlug(slug)
  if (!service) return {}
  return {
    title: `${service.title} — ${service.price} | vivesmedia.com`,
    description: service.problem ?? service.description,
    alternates: { canonical: `https://vivesmedia.com/services/${slug}` },
  }
}

export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const s = getServiceBySlug(slug)
  if (!s) notFound()
  const detail = getServiceDetail(slug)
  const buyable = getBuyableOffer(s.slug)
  const buyLabel = buyable
    ? (buyable.mode === 'subscription'
        ? `Souscrire en ligne · ${buyable.amountCents / 100}€/mois`
        : `Acheter en ligne · ${buyable.amountCents / 100}€`)
    : ''

  return (
    <div className="min-h-screen bg-background">
      <TrackView event="service_viewed" props={{ slug: s.slug, title: s.title, price: s.price }} />
      <JsonLd data={serviceSchema(s)} />
      {s.faq && s.faq.length > 0 && <JsonLd data={faqSchema(s.faq)} />}
      <JsonLd data={breadcrumbSchema([
        { name: 'Accueil', url: SITE_URL },
        { name: 'Services', url: `${SITE_URL}/services` },
        { name: s.title, url: `${SITE_URL}/services/${s.slug}` },
      ])} />

      {/* ── HERO ── */}
      <div className="bg-foreground pt-28 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8">
            <div className="max-w-2xl">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-xs font-mono text-white/30">{s.num}</span>
                {s.badge && (
                  <span className="text-xs font-semibold px-3 py-1 rounded-full" style={{ backgroundColor: '#F4521E', color: '#fff' }}>{s.badge}</span>
                )}
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight mb-4">{s.title}</h1>
              <p className="text-white/60 text-base sm:text-lg leading-relaxed max-w-xl">{s.tagline}</p>
            </div>
            <div className="shrink-0 md:text-right">
              <p className="text-4xl sm:text-5xl font-bold text-white">{s.price}</p>
              <p className="text-white/40 text-sm mt-1">{s.priceNote}</p>
            </div>
          </div>

          {s.heroImage && (
            <div className="mt-10 rounded-2xl overflow-hidden h-64 md:h-80 relative">
              <Image src={s.heroImage} alt={s.title} fill className="object-cover" />
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 mt-10">
            {buyable && <BuyButton offer={buyable.slug} mode={buyable.mode} price={buyable.amountCents / 100} label={buyLabel} />}
            <Link
              href={`/contact?service=${s.slug}`}
              className="flex items-center justify-center gap-2 bg-white text-foreground font-semibold px-6 py-3.5 rounded-full text-sm hover:bg-white/90 transition-colors"
            >
              <CalendarDays className="w-4 h-4" /> Réserver un appel découverte gratuit
            </Link>
            <Link
              href="/contact"
              className="flex items-center justify-center gap-2 border border-white/20 text-white font-medium px-6 py-3.5 rounded-full text-sm hover:border-white/40 transition-colors"
            >
              <Phone className="w-4 h-4" /> Demander un devis par email
            </Link>
          </div>
          {buyable && (
            <p className="text-xs text-white/50 mt-3">
              {buyable.mode === 'subscription'
                ? 'Paiement sécurisé Stripe · sans engagement · résiliable à tout moment'
                : 'Paiement sécurisé Stripe · facture envoyée automatiquement'}
            </p>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">

        {/* ── PROBLÈME CLIENT ── */}
        {s.problem && (
          <div className="mb-16 rounded-2xl border-l-4 bg-white p-6 md:p-8" style={{ borderColor: '#F4521E' }}>
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#F4521E' }}>Le problème qu'on règle</p>
            <p className="text-foreground text-base sm:text-lg leading-relaxed">{s.problem}</p>
          </div>
        )}

        {/* ── STATS ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-16">
          {s.stats.map(stat => (
            <div key={stat.label} className="bg-white rounded-2xl border border-border p-6 text-center">
              <p className="text-2xl sm:text-3xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* ── DESCRIPTION + FEATURES ── */}
        <div className="grid md:grid-cols-2 gap-12 mb-16">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: '#F4521E' }}>Ce service en détail</p>
            <p className="text-foreground text-base leading-relaxed">{s.description}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: '#F4521E' }}>Ce qui est inclus</p>
            <ul className="space-y-4">
              {s.features.map(f => (
                <li key={f.title} className="flex gap-3">
                  <Check className="w-4 h-4 shrink-0 mt-0.5" style={{ color: '#F4521E' }} />
                  <div>
                    <p className="text-sm font-semibold text-foreground">{f.title}</p>
                    <p className="text-sm text-muted-foreground">{f.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ── EN DÉTAIL (deep dive) ── */}
        {detail && detail.length > 0 && (
          <div className="mb-16">
            <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: '#F4521E' }}>En détail</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-8">Comment ça marche, concrètement</h2>
            <div className="space-y-6">
              {detail.map(sec => (
                <div key={sec.title} className="bg-white rounded-2xl border border-border p-6 md:p-8">
                  <h3 className="text-lg sm:text-xl font-bold text-foreground mb-2">{sec.title}</h3>
                  {sec.intro && <p className="text-muted-foreground leading-relaxed mb-5">{sec.intro}</p>}
                  {sec.points && sec.points.length > 0 && (
                    <div className="grid sm:grid-cols-2 gap-x-8 gap-y-4">
                      {sec.points.map(p => (
                        <div key={p.title} className="flex gap-3">
                          <Check className="w-4 h-4 shrink-0 mt-1" style={{ color: '#F4521E' }} />
                          <div>
                            <p className="text-sm font-semibold text-foreground">{p.title}</p>
                            <p className="text-sm text-muted-foreground leading-relaxed">{p.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── POUR QUI ── */}
        {s.forWhom && (
          <div className="mb-16 bg-white rounded-2xl border border-border p-6 md:p-8">
            <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: '#F4521E' }}>Pour qui</p>
            <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-6">
              Ce service est fait pour vous <span className="italic font-normal">si&nbsp;:</span>
            </h2>
            <div className="grid sm:grid-cols-2 gap-6">
              <ul className="space-y-3">
                {s.forWhom.yes.map(item => (
                  <li key={item} className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 shrink-0 mt-0.5" style={{ color: '#F4521E' }} />
                    <span className="text-sm text-foreground">{item}</span>
                  </li>
                ))}
              </ul>
              {s.forWhom.no && s.forWhom.no.length > 0 && (
                <ul className="space-y-3">
                  {s.forWhom.no.map(item => (
                    <li key={item.text} className="flex items-start gap-2.5">
                      <X className="w-4 h-4 shrink-0 mt-0.5 text-muted-foreground" />
                      {item.link ? (
                        <Link href={item.link} className="text-sm text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2">{item.text}</Link>
                      ) : (
                        <span className="text-sm text-muted-foreground">{item.text}</span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        {/* ── PRICING TIERS ── */}
        {s.pricing && (
          <div className="mb-16">
            <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: '#F4521E' }}>Formules</p>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-8">
              Choisissez votre <span className="italic font-normal">niveau.</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {s.pricing.map(plan => (
                <div
                  key={plan.name}
                  className={`rounded-2xl border p-6 flex flex-col ${plan.highlighted ? 'bg-foreground border-foreground' : 'bg-white border-border'}`}
                >
                  {plan.highlighted && (
                    <span className="text-xs font-semibold px-3 py-1 rounded-full self-start mb-4" style={{ backgroundColor: '#F4521E', color: '#fff' }}>Recommandé</span>
                  )}
                  <p className={`text-sm font-semibold mb-1 ${plan.highlighted ? 'text-white/60' : 'text-muted-foreground'}`}>{plan.name}</p>
                  <p className={`text-2xl font-bold mb-0.5 ${plan.highlighted ? 'text-white' : 'text-foreground'}`}>{plan.price}</p>
                  {plan.note && <p className={`text-xs mb-5 ${plan.highlighted ? 'text-white/40' : 'text-muted-foreground'}`}>{plan.note}</p>}
                  <ul className="space-y-2.5 flex-1 mt-2">
                    {plan.features.map(f => (
                      <li key={f} className="flex items-start gap-2">
                        <Check className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${plan.highlighted ? 'text-white/60' : ''}`} style={plan.highlighted ? {} : { color: '#F4521E' }} />
                        <span className={`text-sm ${plan.highlighted ? 'text-white/80' : 'text-foreground'}`}>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={`/contact?service=${s.slug}&formule=${encodeURIComponent(`${plan.name} · ${plan.price}`)}`}
                    className={`mt-6 flex items-center justify-center gap-2 font-semibold px-5 py-3 rounded-full text-sm transition-colors ${plan.highlighted ? 'bg-white text-foreground hover:bg-white/90' : 'border border-border text-foreground hover:border-foreground'}`}
                  >
                    Choisir cette formule →
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── PROCESSUS ── */}
        <div className="mb-16">
          <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: '#F4521E' }}>Comment ça se passe</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-8">
            Simple, <span className="italic font-normal">du début à la fin.</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {s.process.map((step, i) => (
              <div key={step.step} className="relative">
                {i < s.process.length - 1 && (
                  <div className="hidden md:block absolute top-5 left-full w-4 h-px bg-border z-10" />
                )}
                <div className="bg-white rounded-2xl border border-border p-6">
                  <span className="text-xs font-mono text-muted-foreground">{step.step}</span>
                  <h3 className="text-base font-bold text-foreground mt-2 mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── TESTIMONIALS ── */}
        <div className="mb-16">
          <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: '#F4521E' }}>Avis clients</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-8">
            Ce qu'ils en disent, <span className="italic font-normal">vraiment.</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {s.testimonials.map(t => (
              <div key={t.name} className="bg-white rounded-2xl border border-border p-6 flex flex-col">
                <div className="flex gap-0.5 mb-4">
                  {[1,2,3,4,5].map(n => <Star key={n} className="w-4 h-4 fill-current" style={{ color: '#F4521E' }} />)}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed flex-1 mb-4">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  {t.avatar ? (
                    <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 relative">
                      <Image src={t.avatar} alt={t.name} fill className="object-cover" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-secondary shrink-0 flex items-center justify-center text-sm font-bold text-muted-foreground">
                      {t.name[0]}
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-semibold text-foreground">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.company}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── FAQ ── */}
        <div className="mb-16">
          <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: '#F4521E' }}>Questions fréquentes</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-8">
            Tout ce que vous <span className="italic font-normal">voulez savoir.</span>
          </h2>
          <div className="space-y-3">
            {s.faq.map(item => (
              <details key={item.q} className="group bg-white rounded-2xl border border-border overflow-hidden">
                <summary className="flex items-center justify-between px-6 py-4 cursor-pointer list-none select-none">
                  <span className="text-sm font-semibold text-foreground pr-4">{item.q}</span>
                  <span className="shrink-0 w-5 h-5 rounded-full border border-border flex items-center justify-center text-muted-foreground group-open:rotate-45 transition-transform text-lg leading-none">+</span>
                </summary>
                <div className="px-6 pb-5">
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.a}</p>
                </div>
              </details>
            ))}
          </div>
        </div>

        {/* ── CTA FINAL ── */}
        <div className="rounded-2xl bg-foreground p-8 md:p-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">{s.title} — {s.price}</h2>
              <p className="text-white/60 text-sm">{s.priceNote}</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <Link
                href={`/contact?service=${s.slug}`}
                className="flex items-center justify-center gap-2 bg-white text-foreground font-semibold px-6 py-3.5 rounded-full text-sm hover:bg-white/90 transition-colors"
              >
                <CalendarDays className="w-4 h-4" /> Réserver un appel gratuit
              </Link>
              <Link
                href="/services"
                className="flex items-center justify-center gap-2 border border-white/20 text-white font-medium px-6 py-3.5 rounded-full text-sm hover:border-white/40 transition-colors"
              >
                Voir tous les services <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
