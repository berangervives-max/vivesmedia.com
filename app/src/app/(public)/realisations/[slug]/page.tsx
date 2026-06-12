import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowUpRight, ArrowLeft, ExternalLink, Quote } from 'lucide-react'
import { REALISATIONS_DATA, getRealisationBySlug } from '@/data/realisations-data'
import JsonLd from '@/components/seo/JsonLd'
import { realisationSchema, breadcrumbSchema, SITE_URL } from '@/lib/schema'

export async function generateStaticParams() {
  return REALISATIONS_DATA.map(r => ({ slug: r.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const r = getRealisationBySlug(slug)
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

export default async function RealisationPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const r = getRealisationBySlug(slug)
  if (!r) notFound()

  return (
    <div className="min-h-screen bg-background">
      <JsonLd data={realisationSchema(r)} />
      <JsonLd data={breadcrumbSchema([
        { name: 'Accueil', url: SITE_URL },
        { name: 'Réalisations', url: `${SITE_URL}/realisations` },
        { name: r.name, url: `${SITE_URL}/realisations/${r.slug}` },
      ])} />

      {/* Back nav */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-32 pb-0">
        <Link href="/realisations" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group mb-12">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Toutes les réalisations
        </Link>
      </div>

      {/* ── 1. HERO ── */}
      <header className="max-w-7xl mx-auto px-4 sm:px-6 pb-12">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: '#F4521E' }}>
              Réalisation · {r.year}
            </p>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-foreground leading-[1.05] tracking-tight">
              {r.name} —{' '}
              <span className="font-heading italic font-normal text-foreground/60">{r.type}</span>
            </h1>
            <p className="mt-6 text-muted-foreground text-base sm:text-lg leading-relaxed max-w-2xl">{r.intro}</p>
          </div>
          <div className="flex flex-col gap-3 shrink-0">
            <div className="flex flex-wrap gap-2">
              {r.tags.map(tag => (
                <span key={tag} className="text-xs px-3 py-1.5 rounded-full border border-border text-muted-foreground">{tag}</span>
              ))}
            </div>
            {r.liveUrl && (
              <a href={r.liveUrl} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-full border border-border hover:border-foreground/30 transition-colors text-muted-foreground hover:text-foreground w-fit">
                Voir le site <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>
      </header>

      {/* ── 2. CONTEXTE CLIENT ── */}
      <section className="py-16 sm:py-24 bg-secondary/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: '#F4521E' }}>Le contexte</p>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground leading-tight max-w-2xl mb-12">
            Le client, <span className="font-heading italic font-normal">et son point de départ.</span>
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-border p-6 sm:p-8">
              <p className="text-xs text-muted-foreground uppercase tracking-widest mb-3">Le client</p>
              <p className="text-foreground text-base leading-relaxed">{r.context.client}</p>
            </div>
            <div className="bg-white rounded-2xl border-l-4 border border-border p-6 sm:p-8" style={{ borderLeftColor: '#F4521E' }}>
              <p className="text-xs uppercase tracking-widest mb-3" style={{ color: '#F4521E' }}>Le problème</p>
              <p className="text-foreground text-base leading-relaxed">{r.context.problem}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. LA SOLUTION ── */}
      <section className="py-16 sm:py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: '#F4521E' }}>La solution</p>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground leading-tight max-w-2xl mb-12">
            Ce qui a été <span className="font-heading italic font-normal">conçu, et pourquoi.</span>
          </h2>
          <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
            {r.solution.map((sol, i) => (
              <div key={sol.title} className="bg-white rounded-2xl border border-border p-6 sm:p-8">
                <span className="text-xs font-mono text-muted-foreground">0{i + 1}</span>
                <h3 className="text-base sm:text-lg font-bold text-foreground mt-2 mb-2">{sol.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{sol.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. RÉSULTATS ── */}
      <section className="py-16 sm:py-24 bg-foreground">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: '#F4521E' }}>Les résultats</p>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white leading-tight max-w-2xl mb-12">
            Des chiffres, <span className="font-heading italic font-normal text-white/60">pas des promesses.</span>
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {r.results.map(stat => (
              <div key={stat.label} className="rounded-2xl border border-white/10 p-5 sm:p-8">
                <p className="text-3xl sm:text-4xl font-bold text-white">{stat.value}</p>
                <p className="text-xs sm:text-sm text-white/50 mt-2 leading-snug">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. GALERIE ── */}
      {r.gallery.length > 0 && (
        <section className="py-16 sm:py-24 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: '#F4521E' }}>Aperçu du projet</p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground leading-tight max-w-2xl mb-12">
              Le rendu, <span className="font-heading italic font-normal">en images.</span>
            </h2>
            <div className={`grid gap-6 ${r.gallery.length > 1 ? 'md:grid-cols-2' : ''}`}>
              {r.gallery.map(img => (
                <figure key={img.src} className={img.mobile ? 'max-w-[320px] mx-auto' : ''}>
                  <div className="rounded-2xl overflow-hidden border border-border shadow-md bg-secondary">
                    <img src={img.src} alt={img.caption} className="w-full object-cover" />
                  </div>
                  <figcaption className="text-xs text-muted-foreground mt-3 text-center uppercase tracking-widest">{img.caption}</figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── 6. TÉMOIGNAGE ── */}
      {r.testimonial && (
        <section className="py-16 sm:py-24 bg-secondary/30">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
            <Quote className="w-10 h-10 mx-auto mb-6" style={{ color: '#F4521E' }} />
            <blockquote className="text-xl sm:text-2xl md:text-3xl font-medium text-foreground leading-relaxed">
              "{r.testimonial.text}"
            </blockquote>
            <p className="mt-8 text-sm font-semibold text-foreground">{r.testimonial.name}</p>
            <p className="text-xs text-muted-foreground mt-1">{r.testimonial.role}</p>
          </div>
        </section>
      )}

      {/* ── 7. STACK & SERVICES ── */}
      <section className="py-16 sm:py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: '#F4521E' }}>Technologies</p>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-6">La stack du projet</h2>
              <div className="flex flex-wrap gap-2">
                {r.stack.map(t => (
                  <span key={t} className="text-sm px-4 py-2 rounded-full bg-secondary text-foreground">{t}</span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: '#F4521E' }}>Services utilisés</p>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-6">Le même résultat pour votre projet</h2>
              <div className="flex flex-col gap-3">
                {r.services.map(svc => (
                  <Link key={svc.href} href={svc.href}
                    className="group flex items-center justify-between bg-white rounded-2xl border border-border px-5 py-4 hover:border-foreground/30 transition-colors">
                    <span className="text-sm font-semibold text-foreground">{svc.label}</span>
                    <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 8. CTA ── */}
      <section className="pb-16 sm:pb-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="rounded-3xl bg-foreground p-8 sm:p-12 md:p-16 text-center">
            <p className="text-white/40 text-xs uppercase tracking-widest mb-4">Votre projet est le prochain</p>
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white leading-tight max-w-xl mx-auto">
              Un projet similaire ?{' '}
              <span className="font-heading italic font-normal">Parlons-en.</span>
            </h3>
            <p className="mt-4 text-white/60 max-w-md mx-auto">Devis gratuit sous 24h, sans engagement.</p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link href="/contact"
                className="inline-flex items-center gap-2 font-semibold px-8 py-4 rounded-full text-white hover:scale-105 transition-all"
                style={{ backgroundColor: '#F4521E', boxShadow: '0 8px 30px rgba(244,82,30,0.4)' }}>
                Lancer mon projet <ArrowUpRight className="w-4 h-4" />
              </Link>
              <Link href="/realisations"
                className="inline-flex items-center gap-2 border border-white/20 text-white font-medium px-8 py-4 rounded-full hover:border-white/50 transition-colors">
                Voir les réalisations <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}
