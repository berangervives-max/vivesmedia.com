import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowUpRight, Check, Quote, CalendarDays, X } from 'lucide-react'
import { SERVICES_DATA, getServiceBySlug } from '@/data/services-data'
import { getServiceDetail } from '@/data/services-detail'
import JsonLd from '@/components/seo/JsonLd'
import TrackView from '@/components/analytics/TrackView'
import BuyButton from '@/components/ui/BuyButton'
import Reveal from '@/components/ui/Reveal'
import SectionHead from '@/components/ui/SectionHead'
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

      {/* ── 1. HERO ── */}
      <div className="bg-foreground pt-28 pb-16 md:pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <Reveal>
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8">
              <div className="max-w-2xl">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-xs font-mono text-white/30">{s.num}</span>
                  {s.badge && (
                    <span className="text-xs font-semibold px-3 py-1 rounded-xl" style={{ backgroundColor: 'var(--brand-cta)', color: '#fff' }}>{s.badge}</span>
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
          </Reveal>

          <Reveal delay={0.15}>
            {/* Une seule action dominante ; l'alternative reste disponible mais discrète (choix unique = moins de friction). */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 mt-10">
              {buyable ? (
                <BuyButton offer={buyable.slug} mode={buyable.mode} price={buyable.amountCents / 100} label={buyLabel} />
              ) : (
                <Link
                  href={`/contact?service=${s.slug}`}
                  className="flex items-center justify-center gap-2 bg-white text-foreground font-semibold px-6 py-3.5 rounded-xl text-sm hover:bg-white/90 transition-colors"
                >
                  <CalendarDays className="w-4 h-4" /> Réserver un appel découverte gratuit
                </Link>
              )}
              <Link
                href={`/contact?service=${s.slug}`}
                className="text-sm font-medium text-white/60 hover:text-white transition-colors underline underline-offset-4"
              >
                {buyable ? 'Ou réserver un appel / demander un devis par email' : 'Ou demander un devis par email'} →
              </Link>
            </div>
            {buyable && (
              <p className="text-xs text-white/50 mt-3">
                {buyable.mode === 'subscription'
                  ? 'Paiement sécurisé Stripe · sans engagement · résiliable à tout moment'
                  : 'Paiement sécurisé Stripe · facture envoyée automatiquement'}
              </p>
            )}
          </Reveal>
        </div>
      </div>

      {/* ── 2. LE PROBLÈME + STATS — un seul bloc compact (bandeau sombre) ── */}
      <section className="bg-foreground py-20 sm:py-28">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          {s.problem && (
            <Reveal>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] mb-5" style={{ color: '#FF6B00' }}>Le problème qu'on règle</p>
              <p className="border-l-2 pl-6 md:pl-8 font-heading italic text-xl sm:text-2xl leading-snug text-white/90 max-w-3xl" style={{ borderColor: '#FF6B00' }}>
                {s.problem}
              </p>
            </Reveal>
          )}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10 mt-14">
            {s.stats.map((stat, i) => (
              <Reveal key={stat.label} delay={i * 0.06}>
                <div className="border-t border-white/15 pt-5">
                  <p className="text-3xl sm:text-4xl font-bold leading-none tracking-tight" style={{ color: '#FF6B00' }}>{stat.value}</p>
                  <p className="mt-3 text-xs sm:text-sm leading-snug text-white/55">{stat.label}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. DESCRIPTION + INCLUS — lignes courtes, une colonne, pas de paragraphe séparé ── */}
      <section className="py-20 sm:py-28">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <SectionHead eyebrow="Le service" title="En quoi ça consiste," accent="concrètement." />
          <Reveal>
            <p className="mt-8 text-foreground text-base sm:text-lg leading-relaxed">{s.description}</p>
          </Reveal>
          <div className="mt-10 border-t border-border">
            {s.features.map((f, i) => (
              <Reveal key={f.title} delay={i * 0.04}>
                <div className="flex gap-3 py-3.5 border-b border-border">
                  <Check className="w-4 h-4 shrink-0 mt-0.5" style={{ color: '#FF6B00' }} />
                  <p className="text-sm sm:text-base text-foreground"><span className="font-semibold">{f.title}.</span> <span className="text-muted-foreground">{f.desc}</span></p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. EN DÉTAIL — replié par défaut (« nice to know », pas « need to know ») ── */}
      {detail && detail.length > 0 && (
        <section className="border-t border-border bg-secondary/30 py-20 sm:py-28">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <details className="group">
              <summary className="cursor-pointer list-none select-none">
                <SectionHead eyebrow="En détail" title="Comment ça marche," accent="concrètement." />
                <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold" style={{ color: '#FF6B00' }}>
                  Voir le détail complet
                  <span className="w-5 h-5 rounded-full border flex items-center justify-center group-open:rotate-45 transition-transform text-base leading-none" style={{ borderColor: '#FF6B00' }}>+</span>
                </span>
              </summary>
              <div className="mt-10">
                {detail.map((sec, i) => (
                  <div key={sec.title} className="grid gap-4 border-t border-border py-9 sm:grid-cols-[5rem_1fr] sm:gap-10 sm:py-12">
                    <span className="font-mono text-3xl font-bold leading-none text-foreground/15 sm:text-4xl">0{i + 1}</span>
                    <div>
                      <h3 className="text-xl sm:text-2xl font-bold text-foreground">{sec.title}</h3>
                      {sec.intro && <p className="mt-3 text-muted-foreground leading-relaxed max-w-2xl">{sec.intro}</p>}
                      {sec.points && sec.points.length > 0 && (
                        <div className="mt-6 grid sm:grid-cols-2 gap-x-8 gap-y-4">
                          {sec.points.map(p => (
                            <div key={p.title} className="flex gap-3">
                              <Check className="w-4 h-4 shrink-0 mt-1" style={{ color: '#FF6B00' }} />
                              <div>
                                <p className="text-sm font-semibold text-foreground">{p.title}</p>
                                <p className="text-sm text-muted-foreground leading-relaxed">{p.desc}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </details>
          </div>
        </section>
      )}

      {/* ── 5. POUR QUI — replié par défaut (nice to know, même réflexe que « En détail ») ── */}
      {s.forWhom && (
        <section className="py-20 sm:py-28">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <details className="group">
              <summary className="cursor-pointer list-none select-none">
                <SectionHead eyebrow="Pour qui" title="Ce service est fait pour vous" accent="si :" />
                <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold" style={{ color: '#FF6B00' }}>
                  Voir qui est concerné
                  <span className="w-5 h-5 rounded-full border flex items-center justify-center group-open:rotate-45 transition-transform text-base leading-none" style={{ borderColor: '#FF6B00' }}>+</span>
                </span>
              </summary>
              <div className="mt-10 grid sm:grid-cols-2 gap-10 sm:gap-12">
                <ul className="space-y-3.5">
                  {s.forWhom.yes.map(item => (
                    <li key={item} className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 shrink-0 mt-0.5" style={{ color: '#FF6B00' }} />
                      <span className="text-sm sm:text-base text-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
                {s.forWhom.no && s.forWhom.no.length > 0 && (
                  <ul className="space-y-3.5 sm:border-l sm:border-border sm:pl-10">
                    {s.forWhom.no.map(item => (
                      <li key={item.text} className="flex items-start gap-2.5">
                        <X className="w-4 h-4 shrink-0 mt-0.5 text-muted-foreground" />
                        {item.link ? (
                          <Link href={item.link} className="text-sm sm:text-base text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2">{item.text}</Link>
                        ) : (
                          <span className="text-sm sm:text-base text-muted-foreground">{item.text}</span>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </details>
          </div>
        </section>
      )}

      {/* ── 7. FORMULES ── */}
      {s.pricing && (
        <section className="border-t border-border bg-secondary/30 py-20 sm:py-28">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <SectionHead eyebrow="Formules" title="Choisissez votre" accent="niveau." />
            <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4">
              {s.pricing.map((plan, i) => (
                <Reveal key={plan.name} delay={i * 0.06}>
                  <div
                    className={`h-full rounded-2xl border p-6 flex flex-col ${plan.highlighted ? 'bg-foreground border-foreground' : 'bg-white border-border'}`}
                  >
                    {plan.highlighted && (
                      <span className="text-xs font-semibold px-3 py-1 rounded-xl self-start mb-4" style={{ backgroundColor: 'var(--brand-cta)', color: '#fff' }}>Recommandé</span>
                    )}
                    <p className={`text-sm font-semibold mb-1 ${plan.highlighted ? 'text-white/60' : 'text-muted-foreground'}`}>{plan.name}</p>
                    <p className={`text-2xl font-bold mb-0.5 ${plan.highlighted ? 'text-white' : 'text-foreground'}`}>{plan.price}</p>
                    {plan.note && <p className={`text-xs mb-5 ${plan.highlighted ? 'text-white/40' : 'text-muted-foreground'}`}>{plan.note}</p>}
                    <ul className="space-y-2.5 flex-1 mt-2">
                      {plan.features.map(f => (
                        <li key={f} className="flex items-start gap-2">
                          <Check className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${plan.highlighted ? 'text-white/60' : ''}`} style={plan.highlighted ? {} : { color: '#FF6B00' }} />
                          <span className={`text-sm ${plan.highlighted ? 'text-white/80' : 'text-foreground'}`}>{f}</span>
                        </li>
                      ))}
                    </ul>
                    <Link
                      href={`/contact?service=${s.slug}&formule=${encodeURIComponent(`${plan.name} · ${plan.price}`)}`}
                      className={`mt-6 flex items-center justify-center gap-2 font-semibold px-5 py-3 rounded-xl text-sm transition-colors ${plan.highlighted ? 'bg-white text-foreground hover:bg-white/90' : 'border border-border text-foreground hover:border-foreground'}`}
                    >
                      Choisir cette formule →
                    </Link>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── 8. LE PROCESSUS (liste verticale éditoriale, sans carte) ── */}
      <section className="py-20 sm:py-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <SectionHead eyebrow="Comment ça se passe" title="Simple," accent="du début à la fin." />
          <div className="mt-14 sm:mt-16">
            {s.process.map(step => (
              <Reveal key={step.step}>
                <div className="grid gap-4 border-t border-border py-8 sm:grid-cols-[5rem_1fr] sm:gap-10 sm:py-10">
                  <span className="font-mono text-sm font-semibold" style={{ color: '#FF6B00' }}>{step.step}</span>
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-foreground">{step.title}</h3>
                    <p className="mt-2 text-muted-foreground leading-relaxed max-w-2xl">{step.desc}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── PREUVE — un vrai projet livré, jamais une image décorative ; positionnée juste avant la clôture (preuve + FAQ + CTA) ── */}
      {s.proof && (
        <section className="py-4 sm:py-8">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <Reveal>
              <Link href={s.proof.href} className="group grid md:grid-cols-[1.3fr_1fr] gap-6 md:gap-10 items-center">
                <div className="rounded-lg overflow-hidden bg-secondary relative aspect-[16/10]">
                  <Image src={s.proof.src} alt={s.proof.projectName} fill sizes="(max-width: 768px) 100vw, 55vw" className="object-cover object-top transition-transform duration-500 group-hover:scale-[1.02]" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: '#FF6B00' }}>Exemple réel livré</p>
                  <p className="font-accent text-2xl text-foreground">{s.proof.projectName}</p>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{s.proof.caption}</p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-foreground group-hover:gap-2.5 transition-all">
                    Voir le projet <ArrowUpRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Link>
            </Reveal>
          </div>
        </section>
      )}

      {/* ── 9. RETOURS REPRÉSENTATIFS ── */}
      <section className="border-t border-border bg-secondary/30 py-20 sm:py-28">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <SectionHead eyebrow="Retours représentatifs" title="Le type de retour qu'on" accent="reçoit." />
          <p className="mt-5 max-w-xl text-xs text-muted-foreground">Exemples représentatifs, reformulés à partir de retours reçus — non attribués nommément pour préserver l'anonymat des clients.</p>
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {s.testimonials.map((t, i) => (
              <Reveal key={t.name} delay={i * 0.06}>
                <div className="h-full bg-white rounded-2xl border border-border p-6 flex flex-col">
                  <Quote className="w-5 h-5 mb-4" style={{ color: '#FF6B00' }} />
                  <p className="text-sm text-muted-foreground leading-relaxed flex-1 mb-4">"{t.text}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-secondary shrink-0 flex items-center justify-center text-sm font-bold text-muted-foreground">
                      {t.name[0]}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.company}</p>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── 10. FAQ (liste divisée, sans carte par item) ── */}
      <section className="py-20 sm:py-28">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <SectionHead eyebrow="Questions fréquentes" title="Tout ce que vous" accent="voulez savoir." />
          <div className="mt-12 border-t border-border">
            {s.faq.map(item => (
              <details key={item.q} className="group border-b border-border py-1">
                <summary className="flex items-center justify-between gap-4 py-4 cursor-pointer list-none select-none">
                  <span className="text-sm sm:text-base font-semibold text-foreground pr-4">{item.q}</span>
                  <span className="shrink-0 w-5 h-5 rounded-full border border-border flex items-center justify-center text-muted-foreground group-open:rotate-45 transition-transform text-lg leading-none">+</span>
                </summary>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed pb-5 max-w-2xl">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── 11. CTA FINAL ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-16 sm:pb-20">
        <Reveal>
          <div className="rounded-2xl bg-foreground p-8 md:p-12">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">{s.title} — {s.price}</h2>
                <p className="text-white/60 text-sm">{s.priceNote}</p>
              </div>
              {/* Même action, même libellé qu'en hero — un seul verbe répété, pas une nouvelle formulation. */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-x-6 gap-y-3 shrink-0">
                {buyable ? (
                  <BuyButton offer={buyable.slug} mode={buyable.mode} price={buyable.amountCents / 100} label={buyLabel} />
                ) : (
                  <Link
                    href={`/contact?service=${s.slug}`}
                    className="flex items-center justify-center gap-2 bg-white text-foreground font-semibold px-6 py-3.5 rounded-xl text-sm hover:bg-white/90 transition-colors"
                  >
                    <CalendarDays className="w-4 h-4" /> Réserver un appel découverte gratuit
                  </Link>
                )}
                <Link
                  href="/services"
                  className="text-sm font-medium text-white/60 hover:text-white transition-colors underline underline-offset-4"
                >
                  Voir tous les services →
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </div>

    </div>
  )
}
