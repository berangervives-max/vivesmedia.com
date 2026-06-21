import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowUpRight, ArrowLeft, ExternalLink } from 'lucide-react'
import { REALISATIONS_DATA, getRealisationBySlug, type RealisationData } from '@/data/realisations-data'
import { getProcess } from '@/data/realisation-process'
import { realisationsService, dbToRealisationData, getPublishedRealisationsData } from '@/services/supabase.service'
import JsonLd from '@/components/seo/JsonLd'
import Reveal from '@/components/ui/Reveal'
import { BrowserFrame, PhoneFrame } from '@/components/ui/DeviceFrames'
import BeforeAfter from '@/components/ui/BeforeAfter'
import { realisationSchema, breadcrumbSchema, SITE_URL } from '@/lib/schema'

// Les réalisations en base (back-office) peuvent être ajoutées sans rebuild.
export const revalidate = 60
export const dynamicParams = true

/** Résout une réalisation par slug : d'abord la base (éditable via /cms), sinon les statiques (code, secours). */
async function resolveRealisation(slug: string): Promise<RealisationData | undefined> {
  const dbR = await realisationsService.getBySlug(slug).catch(() => null)
  if (dbR) return dbToRealisationData(dbR)
  return getRealisationBySlug(slug)
}

export async function generateStaticParams() {
  const dbRealisations = await getPublishedRealisationsData()
  return [...REALISATIONS_DATA, ...dbRealisations].map(r => ({ slug: r.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const r = await resolveRealisation(slug)
  if (!r) return {}
  return {
    title: `${r.name} — ${r.type} | Réalisation vivesmedia.com`,
    description: r.intro,
    alternates: { canonical: `https://vivesmedia.com/realisations/${slug}` },
    openGraph: {
      type: 'article',
      title: `${r.name} — ${r.type}`,
      description: r.intro,
      url: `https://vivesmedia.com/realisations/${slug}`,
      images: r.heroImage ? [{ url: r.heroImage }] : undefined,
    },
  }
}

// Section : pastille + titre éditorial large (style magazine d'architecture / studio).
function SectionHead({ eyebrow, title, accent, light = false }: { eyebrow: string; title: React.ReactNode; accent?: React.ReactNode; light?: boolean }) {
  return (
    <Reveal>
      <p className="text-xs font-semibold uppercase tracking-[0.2em] mb-5" style={{ color: '#F4521E' }}>{eyebrow}</p>
      <h2 className={`text-3xl sm:text-4xl lg:text-5xl font-bold leading-[1.08] tracking-tight ${light ? 'text-white' : 'text-foreground'}`}>
        {title}{accent && <> <span className={`font-heading italic font-normal ${light ? 'text-white/55' : 'text-foreground/55'}`}>{accent}</span></>}
      </h2>
    </Reveal>
  )
}

export default async function RealisationPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const r = await resolveRealisation(slug)
  if (!r) notFound()

  const hasContext = Boolean(r.context.client || r.context.problem)
  const process = getProcess(slug)

  // Navigation « projet suivant » + host pour le mockup navigateur
  const ordered = await getPublishedRealisationsData().catch(() => [])
  const navList = ordered.length > 0 ? ordered : REALISATIONS_DATA
  const curIdx = navList.findIndex((x) => x.slug === slug)
  const next = curIdx >= 0 && navList.length > 1 ? navList[(curIdx + 1) % navList.length] : undefined
  const liveHost = r.liveUrl ? (() => { try { return new URL(r.liveUrl).host.replace(/^www\./, '') } catch { return undefined } })() : undefined

  return (
    <div className="min-h-screen bg-background">
      <JsonLd data={realisationSchema(r)} />
      <JsonLd data={breadcrumbSchema([
        { name: 'Accueil', url: SITE_URL },
        { name: 'Réalisations', url: `${SITE_URL}/realisations` },
        { name: r.name, url: `${SITE_URL}/realisations/${r.slug}` },
      ])} />

      {/* ── 1. HERO ÉDITORIAL (centré, façon magazine) ── */}
      <header className="mx-auto max-w-3xl px-6 pt-28 sm:pt-36 pb-14 sm:pb-20 text-center">
        <Link href="/realisations" className="group mb-12 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          Toutes les réalisations
        </Link>
        <p className="mb-6 text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: '#F4521E' }}>
          Étude de cas · {r.year}
        </p>
        <h1 className="text-4xl font-bold leading-[1.05] tracking-tight text-foreground sm:text-6xl lg:text-7xl">
          {r.name}
        </h1>
        <p className="mt-4 font-heading text-2xl italic text-foreground/55 sm:text-3xl">{r.type}</p>
        <p className="mx-auto mt-8 max-w-xl text-lg leading-relaxed text-muted-foreground">{r.intro}</p>
        <div className="mt-9 flex flex-wrap items-center justify-center gap-2.5">
          {r.tags.map(tag => (
            <span key={tag} className="rounded-full border border-border px-3.5 py-1.5 text-xs text-muted-foreground">{tag}</span>
          ))}
        </div>
        {r.liveUrl && (
          <div className="mt-7">
            <a href={r.liveUrl} target="_blank" rel="nofollow noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white transition-all hover:scale-[1.03]"
              style={{ backgroundColor: '#F4521E', boxShadow: '0 8px 30px rgba(244,82,30,0.35)' }}>
              Visiter le site en ligne <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        )}
      </header>

      {/* ── IMAGE HERO IMMERSIVE (quasi pleine largeur, dans un mockup navigateur) ── */}
      {r.heroImage && (
        <Reveal className="px-3 sm:px-6">
          <div className="mx-auto max-w-[1500px]">
            <BrowserFrame url={liveHost}>
              <div className="relative aspect-[16/10] w-full sm:aspect-[16/9]">
                <img src={r.heroImage} alt={`${r.name} — aperçu du projet`} className="absolute inset-0 h-full w-full object-cover object-top" />
              </div>
            </BrowserFrame>
          </div>
        </Reveal>
      )}

      {/* ── 2. LE CONTEXTE (éditorial, colonne étroite) ── */}
      {hasContext && (
        <section className="py-24 sm:py-32 lg:py-40">
          <div className="mx-auto max-w-3xl px-6">
            <SectionHead eyebrow="Le contexte" title="Le client," accent="et son point de départ." />
            <div className="mt-12 sm:mt-16 space-y-12">
              {r.context.client && (
                <Reveal>
                  <p className="mb-3 text-xs uppercase tracking-[0.2em] text-muted-foreground">Le client</p>
                  <p className="text-xl leading-relaxed text-foreground sm:text-2xl">{r.context.client}</p>
                </Reveal>
              )}
              {r.context.problem && (
                <Reveal>
                  <p className="mb-3 text-xs uppercase tracking-[0.2em]" style={{ color: '#F4521E' }}>Le problème</p>
                  <p className="border-l-2 pl-6 text-xl leading-relaxed text-foreground sm:text-2xl" style={{ borderColor: '#F4521E' }}>{r.context.problem}</p>
                </Reveal>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ── 3. LA SOLUTION (grands blocs numérotés) ── */}
      {r.solution.length > 0 && (
        <section className="border-t border-border bg-secondary/30 py-24 sm:py-32 lg:py-40">
          <div className="mx-auto max-w-4xl px-6">
            <SectionHead eyebrow="La solution" title="Ce qui a été" accent="conçu, et pourquoi." />
            <div className="mt-16 sm:mt-20">
              {r.solution.map((sol, i) => (
                <Reveal key={sol.title}>
                  <div className="grid gap-4 border-t border-border py-10 sm:grid-cols-[5rem_1fr] sm:gap-10 sm:py-14">
                    <span className="font-mono text-4xl font-bold leading-none text-foreground/15 sm:text-5xl">0{i + 1}</span>
                    <div>
                      <h3 className="text-2xl font-bold text-foreground sm:text-3xl">{sol.title}</h3>
                      <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground">{sol.desc}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── 4. LE PROJET EN IMAGES (galerie pleine largeur) ── */}
      {r.gallery.length > 0 && (
        <section className="py-24 sm:py-32 lg:py-40">
          <div className="mx-auto mb-16 max-w-3xl px-6 sm:mb-20">
            <SectionHead eyebrow="Aperçu du projet" title="Le rendu," accent="en images." />
          </div>
          <div className="mx-auto max-w-[1500px] space-y-16 px-3 sm:space-y-28 sm:px-6">
            {r.gallery.map((img) => (
              <Reveal key={img.src}>
                <figure>
                  {img.mobile ? (
                    <div className="mx-auto max-w-sm">
                      <PhoneFrame>
                        {img.before
                          ? <BeforeAfter before={img.before} after={img.src} alt={img.caption} />
                          : <img src={img.src} alt={img.caption} className="w-full" />}
                      </PhoneFrame>
                    </div>
                  ) : (
                    <BrowserFrame url={liveHost}>
                      {img.before
                        ? <BeforeAfter before={img.before} after={img.src} alt={img.caption} />
                        : <img src={img.src} alt={img.caption} className="w-full object-cover object-top" />}
                    </BrowserFrame>
                  )}
                  {(img.caption || img.rationale) && (
                    <figcaption className="mx-auto mt-6 max-w-xl text-center">
                      {img.caption && <span className="block text-sm font-medium leading-relaxed text-foreground">{img.caption}{img.before && <span className="text-muted-foreground"> · glissez pour comparer avant/après</span>}</span>}
                      {img.rationale && <span className="mt-1.5 block text-sm leading-relaxed text-muted-foreground">{img.rationale}</span>}
                    </figcaption>
                  )}
                </figure>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* ── 5. LA DÉMARCHE (liste verticale éditoriale) ── */}
      {process.length > 0 && (
        <section className="border-t border-border bg-secondary/30 py-24 sm:py-32 lg:py-40">
          <div className="mx-auto max-w-4xl px-6">
            <SectionHead eyebrow="La démarche" title="Comment on a" accent="travaillé." />
            <div className="mt-16 sm:mt-20">
              {process.map((step) => (
                <Reveal key={step.step}>
                  <div className="grid gap-4 border-t border-border py-9 sm:grid-cols-[5rem_1fr] sm:gap-10 sm:py-12">
                    <span className="font-mono text-sm font-semibold" style={{ color: '#F4521E' }}>{step.step}</span>
                    <div>
                      <h3 className="text-xl font-bold text-foreground sm:text-2xl">{step.title}</h3>
                      <p className="mt-3 max-w-2xl text-lg leading-relaxed text-muted-foreground">{step.desc}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── 6. LES RÉSULTATS (bandeau sombre, grands chiffres) ── */}
      {r.results.length > 0 && (
        <section className="bg-foreground py-24 sm:py-32 lg:py-40">
          <div className="mx-auto max-w-5xl px-6">
            <SectionHead eyebrow="Les résultats" title="Des chiffres," accent="pas des promesses." light />
            <div className="mt-16 grid grid-cols-2 gap-x-8 gap-y-14 sm:mt-20 md:grid-cols-4">
              {r.results.map((stat, i) => (
                <Reveal key={stat.label} delay={i * 0.06}>
                  <div className="border-t border-white/15 pt-6">
                    <p className="text-4xl font-bold leading-none text-white sm:text-5xl">{stat.value}</p>
                    <p className="mt-4 text-sm leading-snug text-white/50">{stat.label}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── 7. TÉMOIGNAGE (grande citation éditoriale) ── */}
      {r.testimonial && (
        <section className="py-24 sm:py-32 lg:py-40">
          <div className="mx-auto max-w-3xl px-6 text-center">
            <Reveal>
              <p className="mb-8 font-heading text-6xl italic leading-none text-foreground/15 sm:text-7xl">“</p>
              <blockquote className="font-heading text-3xl italic leading-snug text-foreground sm:text-4xl lg:text-[2.75rem]">
                {r.testimonial.text}
              </blockquote>
              <p className="mt-10 text-sm font-semibold text-foreground">{r.testimonial.name}</p>
              <p className="mt-1 text-sm text-muted-foreground">{r.testimonial.role}</p>
            </Reveal>
          </div>
        </section>
      )}

      {/* ── 8. STACK & SERVICES (minimal) ── */}
      {(r.stack.length > 0 || r.services.length > 0) && (
        <section className="border-t border-border py-20 sm:py-28">
          <div className="mx-auto grid max-w-4xl gap-14 px-6 md:grid-cols-2">
            {r.stack.length > 0 && (
              <Reveal>
                <p className="mb-5 text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: '#F4521E' }}>Technologies</p>
                <h3 className="mb-7 text-2xl font-bold text-foreground">La stack du projet</h3>
                <div className="flex flex-wrap gap-2.5">
                  {r.stack.map(t => (
                    <span key={t} className="rounded-full bg-secondary px-4 py-2 text-sm text-foreground">{t}</span>
                  ))}
                </div>
              </Reveal>
            )}
            {r.services.length > 0 && (
              <Reveal>
                <p className="mb-5 text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: '#F4521E' }}>Services utilisés</p>
                <h3 className="mb-7 text-2xl font-bold text-foreground">Le même résultat pour vous</h3>
                <div className="flex flex-col gap-3">
                  {r.services.map(svc => (
                    <Link key={svc.href} href={svc.href}
                      className="group flex items-center justify-between rounded-2xl border border-border bg-white px-5 py-4 transition-colors hover:border-foreground/30">
                      <span className="text-sm font-semibold text-foreground">{svc.label}</span>
                      <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-foreground" />
                    </Link>
                  ))}
                </div>
              </Reveal>
            )}
          </div>
        </section>
      )}

      {/* ── 9. PROJET SUIVANT (grand, façon Cuberto) ── */}
      {next && (
        <Link href={`/realisations/${next.slug}`} className="group relative block overflow-hidden border-t border-border">
          {next.heroImage && (
            <>
              <img src={next.heroImage} alt="" aria-hidden className="absolute inset-0 h-full w-full object-cover object-top opacity-0 transition-all duration-700 group-hover:scale-105 group-hover:opacity-100" />
              <div className="absolute inset-0 bg-background/0 transition-colors duration-700 group-hover:bg-black/55" />
            </>
          )}
          <div className="relative mx-auto flex max-w-5xl flex-col items-center px-6 py-20 text-center sm:py-28">
            <p className="mb-3 text-xs uppercase tracking-[0.2em] text-muted-foreground transition-colors group-hover:text-white/70">Projet suivant</p>
            <p className="text-4xl font-bold leading-tight tracking-tight text-foreground transition-colors duration-500 group-hover:text-white sm:text-6xl lg:text-7xl">
              {next.name}
            </p>
            <p className="mt-3 font-heading text-xl italic text-foreground/50 transition-colors duration-500 group-hover:text-white/70 sm:text-2xl">{next.type}</p>
            <span className="mt-8 inline-flex h-12 w-12 items-center justify-center rounded-full border border-border text-foreground transition-all duration-500 group-hover:translate-x-1 group-hover:border-white/50 group-hover:text-white">
              <ArrowUpRight className="h-5 w-5" />
            </span>
          </div>
        </Link>
      )}

      {/* ── 10. CTA ── */}
      <section className="border-t border-border bg-background px-6 py-20 sm:py-28">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-3xl bg-foreground p-8 text-center sm:p-14 md:p-16">
            <p className="mb-4 text-xs uppercase tracking-[0.2em] text-white/40">Votre projet est le prochain</p>
            <h3 className="mx-auto max-w-xl text-3xl font-bold leading-tight text-white sm:text-4xl">
              Un projet similaire ?{' '}
              <span className="font-heading italic font-normal">Parlons-en.</span>
            </h3>
            <p className="mx-auto mt-4 max-w-md text-white/60">Devis gratuit sous 24h, sans engagement.</p>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
              <Link href="/contact"
                className="inline-flex items-center gap-2 rounded-full px-8 py-4 font-semibold text-white transition-all hover:scale-105"
                style={{ backgroundColor: '#F4521E', boxShadow: '0 8px 30px rgba(244,82,30,0.4)' }}>
                Lancer mon projet <ArrowUpRight className="h-4 w-4" />
              </Link>
              <Link href="/realisations"
                className="inline-flex items-center gap-2 rounded-full border border-white/20 px-8 py-4 font-medium text-white transition-colors hover:border-white/50">
                Voir les réalisations <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}
