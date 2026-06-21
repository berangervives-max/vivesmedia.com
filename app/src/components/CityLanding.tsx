import Link from 'next/link'
import { ArrowUpRight, Check, MapPin } from 'lucide-react'
import JsonLd from '@/components/seo/JsonLd'
import { faqSchema, breadcrumbSchema, SITE_URL } from '@/lib/schema'
import { CITIES, type City } from '@/lib/cities-data'

const SERVICES = [
  { title: 'Site vitrine', desc: 'Présentez votre activité avec un site rapide, élégant et pensé pour générer des contacts.', href: '/services/site-vitrine', price: 'dès 1 490€' },
  { title: 'Site e-commerce', desc: 'Vendez en ligne avec une boutique sur-mesure optimisée pour convertir.', href: '/services/site-ecommerce', price: 'dès 3 840€' },
  { title: 'Site catalogue', desc: 'Mettez en valeur vos produits et votre savoir-faire sans vente en ligne.', href: '/services/site-catalogue', price: 'dès 2 400€' },
]

const WHY = [
  'Un interlocuteur unique et réactif, qui connaît le tissu économique local',
  'Un design 100% sur-mesure (UX/UI) — jamais un template revendu à l’identique',
  'Des rendez-vous en visio (ou sur place) — pas de service client anonyme à l’étranger',
  'Un site optimisé pour le référencement local et le pack Google Maps',
  'La possibilité d’automatiser vos tâches et connecter vos outils (no-code)',
  'Des tarifs transparents, sans abonnement caché',
]

export default function CityLanding({ city }: { city: City }) {
  const cityServiceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: `Création de site internet sur-mesure à ${city.city}`,
    serviceType: 'Création de site internet',
    provider: { '@id': `${SITE_URL}/#organization` },
    areaServed: { '@type': 'City', name: city.city, containedInPlace: { '@type': 'AdministrativeArea', name: city.dept } },
    url: `${SITE_URL}/${city.slug}`,
    description: `Création de sites internet vitrines, e-commerce et sur-mesure à ${city.city} (${city.dept}, ${city.deptNum}) : design UX/UI, SEO et automatisation inclus.`,
  }

  // Maillage interne : les autres villes + la page département
  const others = Object.values(CITIES).filter((c) => c.slug !== city.slug)

  return (
    <div className="bg-background">
      <JsonLd data={cityServiceSchema} />
      <JsonLd data={faqSchema(city.faq)} />
      <JsonLd data={breadcrumbSchema([
        { name: 'Accueil', url: SITE_URL },
        { name: `Freelance web ${city.city}`, url: `${SITE_URL}/${city.slug}` },
      ])} />

      {/* Hero */}
      <section className="relative pt-36 pb-20 bg-gradient-to-b from-[#f0eeff] via-background to-background overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full bg-primary/10 blur-[140px] pointer-events-none" />
        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <span className="inline-flex items-center gap-2 text-sm font-medium px-4 py-1.5 rounded-full mb-6" style={{ background: '#FEEFE9', color: '#F4521E' }}>
            <MapPin className="w-3.5 h-3.5" /> {city.city} · {city.dept} · {city.deptNum}
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-foreground leading-[1.07] tracking-tight">
            Freelance web à {city.city} —{' '}
            <span className="font-heading italic font-normal">sur-mesure</span>
          </h1>
          <p className="mt-6 text-muted-foreground text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            Création de sites internet sur-mesure — vitrine, e-commerce, UX/UI — pour les entreprises et indépendants
            de {city.city} et ses environs. Design unique, SEO et automatisation inclus. Livraison en 3 semaines, devis gratuit sous 24h.
          </p>
          <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/contact" className="flex items-center gap-2 text-white font-semibold px-8 py-4 rounded-full hover:scale-105 transition-all" style={{ backgroundColor: '#F4521E', boxShadow: '0 8px 30px rgba(244,82,30,0.35)' }}>
              Devis gratuit sous 24h <ArrowUpRight className="w-4 h-4" />
            </Link>
            <Link href="/realisations" className="flex items-center gap-2 text-foreground font-semibold px-6 py-4 rounded-full border border-black/10 hover:bg-black/5 transition-colors">
              Voir mes réalisations
            </Link>
          </div>
        </div>
      </section>

      {/* Intro SEO (contenu unique par ville) */}
      <section className="max-w-3xl mx-auto px-6 py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-5">Votre site internet sur-mesure à {city.city}</h2>
        <div className="space-y-4 text-muted-foreground leading-relaxed">
          {city.intro.map((p, i) => (
            <p key={i} dangerouslySetInnerHTML={{ __html: p }} />
          ))}
        </div>
      </section>

      {/* Services */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-10">Mes services à {city.city}</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {SERVICES.map((s) => (
            <Link key={s.href} href={s.href} className="group rounded-2xl p-6 border border-black/8 hover:border-black/20 hover:shadow-lg transition-all bg-white">
              <p className="text-xs font-semibold mb-2" style={{ color: '#F4521E' }}>{s.price}</p>
              <h3 className="text-lg font-bold text-foreground mb-2 flex items-center justify-between">{s.title}<ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" /></h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Pourquoi local */}
      <section className="max-w-3xl mx-auto px-6 py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">Pourquoi travailler avec un freelance web local à {city.city} ?</h2>
        <ul className="space-y-3">
          {WHY.map((item) => (
            <li key={item} className="flex items-start gap-3 text-muted-foreground">
              <Check className="w-5 h-5 mt-0.5 shrink-0" style={{ color: '#F4521E' }} />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Communes desservies */}
      <section className="max-w-4xl mx-auto px-6 py-12">
        <h2 className="text-xl font-bold text-foreground mb-5 text-center">J&apos;interviens à {city.city} et autour</h2>
        <div className="flex flex-wrap justify-center gap-2.5">
          {[city.city, ...city.nearby].map((v) => (
            <span key={v} className="text-sm px-4 py-2 rounded-full border border-black/8 text-muted-foreground bg-white">{v}</span>
          ))}
        </div>
        <p className="text-center text-sm text-muted-foreground mt-5">…et partout en France en full remote.</p>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-6 py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-8">Questions fréquentes</h2>
        <div className="space-y-4">
          {city.faq.map((f) => (
            <details key={f.q} className="group rounded-xl border border-black/8 bg-white p-5">
              <summary className="font-semibold text-foreground cursor-pointer list-none flex items-center justify-between">
                {f.q}<span className="text-muted-foreground group-open:rotate-45 transition-transform text-xl">+</span>
              </summary>
              <p className="mt-3 text-muted-foreground leading-relaxed text-sm">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Maillage interne : autres villes */}
      <section className="max-w-4xl mx-auto px-6 pb-4">
        <h2 className="text-sm font-semibold text-foreground mb-4 text-center uppercase tracking-wide">Freelance web dans d&apos;autres villes</h2>
        <div className="flex flex-wrap justify-center gap-2.5">
          {others.map((c) => (
            <Link key={c.slug} href={`/${c.slug}`} className="text-sm px-4 py-2 rounded-full border border-black/10 text-foreground bg-white hover:bg-black/5 transition-colors">
              Freelance web {c.city}
            </Link>
          ))}
          <Link href="/freelance-web-vaucluse" className="text-sm px-4 py-2 rounded-full border border-black/10 text-foreground bg-white hover:bg-black/5 transition-colors">
            Freelance web Vaucluse
          </Link>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-6 py-20">
        <div className="rounded-3xl p-10 md:p-14 text-center" style={{ background: '#0F0F0F' }}>
          <h2 className="text-2xl md:text-4xl font-bold text-white mb-4">Votre projet web à {city.city} commence ici</h2>
          <p className="text-white/60 mb-8 max-w-xl mx-auto">Parlons de votre site. Devis gratuit, détaillé et sans engagement, sous 24h.</p>
          <Link href="/contact" className="inline-flex items-center gap-2 text-white font-semibold px-8 py-4 rounded-full hover:scale-105 transition-all" style={{ backgroundColor: '#F4521E' }}>
            Demander mon devis gratuit <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  )
}
