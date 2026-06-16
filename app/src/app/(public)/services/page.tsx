import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowUpRight, Check } from 'lucide-react'
import { creationFormules, iaServices, recurrentServices, maintenancePlans } from '@/data/tarifs-data'

// Source de vérité partagée avec /tarifs (cf. src/data/tarifs-data.ts).
const ecommerce = creationFormules[0]
const catalogueVitrine = creationFormules.slice(1)

export const metadata: Metadata = {
  title: 'Services & Tarifs — Création de sites web sur-mesure',
  description: 'Site e-commerce dès 3 840€, vitrine dès 1 800€, SEO 274€/mois, formation IA, vidéo IA, visibilité IA. Devis gratuit sous 24h.',
  alternates: { canonical: 'https://vivesmedia.com/services' },
}

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-background pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        {/* Header */}
        <div className="mb-12 md:mb-16">
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#F4521E' }}>Services & Tarifs</p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground leading-tight max-w-2xl">
            Ce que je fais, <span className="italic font-normal">concrètement.</span>
          </h1>
          <p className="mt-4 text-muted-foreground max-w-xl text-sm sm:text-base">
            Pas d'agence intermédiaire. Pas de template revendu. Chaque projet est fait à la main, de A à Z.
          </p>
        </div>

        {/* ── SECTION 1 : CRÉATION DE SITES ── */}
        <p className="text-xs font-semibold uppercase tracking-widest mb-8" style={{ color: '#F4521E' }}>Création de sites</p>

        {/* E-Commerce — carte vedette */}
        <div className="rounded-2xl bg-foreground p-8 md:p-12 mb-4">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-xs font-mono text-white/40">01</span>
                <span className="text-xs font-semibold px-3 py-1 rounded-full" style={{ backgroundColor: '#F4521E', color: '#fff' }}>Le plus populaire</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">{ecommerce.title}</h2>
              <p className="text-4xl sm:text-5xl font-bold text-white mb-1">{ecommerce.price}</p>
              <p className="text-white/40 text-sm mb-1">{ecommerce.priceNote}</p>
              <p className="text-sm mb-6 text-white/70">{ecommerce.sub}</p>
              <p className="text-white/70 text-sm leading-relaxed max-w-md mb-8">
                {ecommerce.desc}
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/services/site-ecommerce" className="flex items-center gap-2 bg-white text-foreground font-semibold px-6 py-3 rounded-full text-sm hover:bg-white/90 transition-colors">
                  En savoir plus <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
                <Link href="/contact?service=site-ecommerce" className="flex items-center gap-2 border border-white/20 text-white font-medium px-6 py-3 rounded-full text-sm hover:border-white/40 transition-colors">
                  Demander un devis
                </Link>
              </div>
            </div>
            <div className="md:w-64 shrink-0">
              <ul className="space-y-3">
                {ecommerce.features.map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-white/70">
                    <Check className="w-3.5 h-3.5 shrink-0" style={{ color: '#F4521E' }} /> {f}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Catalogue + Vitrine — 2 colonnes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-16">
          {catalogueVitrine.map(s => (
            <div key={s.num} className="rounded-2xl border border-border bg-white p-7 flex flex-col">
              <span className="text-xs font-mono text-muted-foreground mb-4">{s.num}</span>
              <h2 className="text-xl font-bold text-foreground mb-1">{s.title}</h2>
              <p className="text-2xl font-bold mb-1" style={{ color: '#F4521E' }}>{s.price}</p>
              <p className="text-xs text-muted-foreground">paiement unique</p>
              {s.sub && <p className="text-xs font-medium mt-1" style={{ color: '#F4521E' }}>{s.sub}</p>}
              <p className="text-sm text-muted-foreground leading-relaxed mt-4 mb-6 flex-1">{s.desc}</p>
              <ul className="space-y-2 mb-6">
                {s.features.map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="w-3.5 h-3.5 shrink-0" style={{ color: '#F4521E' }} /> {f}
                  </li>
                ))}
              </ul>
              <div className="flex flex-col gap-2">
                <Link href={`/services/${s.slug}`} className="flex items-center justify-center gap-2 bg-foreground text-white font-semibold px-5 py-2.5 rounded-full text-sm hover:bg-foreground/90 transition-colors">
                  En savoir plus <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
                <Link href={`/contact?service=${s.slug}`} className="flex items-center justify-center gap-2 border border-border text-muted-foreground font-medium px-5 py-2.5 rounded-full text-sm hover:border-foreground hover:text-foreground transition-colors">
                  Demander un devis
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* ── SECTION 2 : NOUVEAUX SERVICES IA ── */}
        <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: '#F4521E' }}>Nouveaux services</p>
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-8">
          L'IA, <span className="italic font-normal">au service de votre croissance.</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-16">
          {iaServices.map(s => (
            <div key={s.num} className="rounded-2xl border border-border bg-white p-7 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono text-muted-foreground">{s.num}</span>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ backgroundColor: '#F4521E', color: '#fff' }}>Nouveau</span>
              </div>
              <h2 className="text-lg font-bold text-foreground mb-1">{s.title}</h2>
              <p className="text-xl font-bold mb-4" style={{ color: '#F4521E' }}>{s.price}</p>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6 flex-1">{s.desc}</p>
              <ul className="space-y-2 mb-6">
                {s.features.map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="w-3.5 h-3.5 shrink-0" style={{ color: '#F4521E' }} /> {f}
                  </li>
                ))}
              </ul>
              <div className="flex flex-col gap-2">
                <Link href={`/services/${s.slug}`} className="flex items-center justify-center gap-2 bg-foreground text-white font-semibold px-5 py-2.5 rounded-full text-sm hover:bg-foreground/90 transition-colors">
                  En savoir plus <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
                <Link href={`/contact?service=${s.slug}`} className="flex items-center justify-center gap-2 border border-border text-muted-foreground font-medium px-5 py-2.5 rounded-full text-sm hover:border-foreground hover:text-foreground transition-colors">
                  Demander un devis
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* ── SECTION 3 : SERVICES RÉCURRENTS ── */}
        <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: '#F4521E' }}>Abonnements</p>
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-8">
          Croissance, <span className="italic font-normal">mois après mois.</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-16">
          {recurrentServices.map(s => (
            <div key={s.num} className="rounded-2xl border border-border bg-white p-7 flex flex-col">
              <span className="text-xs font-mono text-muted-foreground mb-4">{s.num}</span>
              <h2 className="text-lg font-bold text-foreground mb-1">{s.title}</h2>
              <p className="text-xl font-bold mb-4" style={{ color: '#F4521E' }}>{s.price}</p>
              <p className="text-sm text-muted-foreground leading-relaxed mb-6 flex-1">{s.desc}</p>
              <ul className="space-y-2 mb-6">
                {s.features.map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="w-3.5 h-3.5 shrink-0" style={{ color: '#F4521E' }} /> {f}
                  </li>
                ))}
              </ul>
              <div className="flex flex-col gap-2">
                <Link href={`/services/${s.slug}`} className="flex items-center justify-center gap-2 bg-foreground text-white font-semibold px-5 py-2.5 rounded-full text-sm hover:bg-foreground/90 transition-colors">
                  En savoir plus <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
                <Link href={`/contact?service=${s.slug}`} className="flex items-center justify-center gap-2 border border-border text-muted-foreground font-medium px-5 py-2.5 rounded-full text-sm hover:border-foreground hover:text-foreground transition-colors">
                  Demander un devis
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* ── SECTION 4 : PLANS MAINTENANCE ── */}
        <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: '#F4521E' }}>Maintenance & Support</p>
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-8">
          Votre site, <span className="italic font-normal">toujours à jour.</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-16">
          {maintenancePlans.map(m => (
            <div key={m.name} className={`rounded-2xl border p-7 bg-white flex flex-col ${m.recommended ? 'border-foreground ring-1 ring-foreground' : 'border-border'}`}>
              {m.recommended && <span className="text-xs font-semibold px-3 py-1 rounded-full mb-4 inline-block w-fit" style={{ backgroundColor: '#F4521E', color: '#fff' }}>Recommandé</span>}
              <p className="font-bold text-foreground text-lg">{m.name}</p>
              <p className="text-3xl font-bold text-foreground mt-1 mb-6">{m.price}</p>
              <ul className="space-y-3 flex-1">
                {m.features.map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="w-3.5 h-3.5 shrink-0" style={{ color: '#F4521E' }} />{f}
                  </li>
                ))}
              </ul>
              <Link href="/contact?service=maintenance" className="mt-8 flex items-center justify-center gap-2 bg-foreground text-white font-semibold px-5 py-2.5 rounded-full text-sm hover:bg-foreground/90 transition-colors">
                Choisir ce plan <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="rounded-2xl bg-foreground p-8 md:p-10 text-center">
          <h3 className="text-xl sm:text-2xl font-bold text-white mb-3">Quel service vous convient ?</h3>
          <p className="text-white/60 mb-6 text-sm">Devis gratuit sous 24h — je vous guide vers la meilleure solution.</p>
          <Link href="/contact" className="inline-flex items-center gap-2 bg-white text-foreground font-semibold px-6 sm:px-8 py-3 sm:py-4 rounded-full hover:bg-white/90 transition-all text-sm sm:text-base">
            Demander un devis <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </div>
  )
}
