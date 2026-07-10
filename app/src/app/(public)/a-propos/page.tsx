import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowUpRight, GraduationCap, MapPin } from 'lucide-react'

function LinkedinIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29zM5.34 7.43a2.07 2.07 0 1 1 0-4.14 2.07 2.07 0 0 1 0 4.14zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0z" />
    </svg>
  )
}
import Timeline from '@/components/about/Timeline'

export const metadata: Metadata = {
  title: 'À propos — Béranger Vivès · vivesmedia.com',
  description: "Béranger Vivès, fondateur de vivesmedia.com. Marketing digital (MBA Bac+5), spécialiste SEA & Social Ads, UX/UI et automatisation IA. ~5 ans d'expérience en e-commerce, basé à Avignon, full remote.",
  alternates: { canonical: 'https://vivesmedia.com/a-propos' },
}

const FACTS = [
  { k: 'MBA', v: 'Marketing digital · Bac+5' },
  { k: '~5 ans', v: "d'expérience e-commerce" },
  { k: '10+', v: 'projets livrés' },
  { k: 'Avignon', v: 'full remote · France' },
]

const EXPERTISE = [
  { img: '/images/about/about-ux.webp', title: 'Sites & UX/UI', items: ['Conception UX/UI (Adobe, Figma)', 'E-commerce (PrestaShop, Shopify)', 'Sites sur-mesure (Next.js, Framer)'] },
  { img: '/images/about/about-ads.webp', title: 'SEA & Social Ads', items: ['Google Ads (SEA)', 'Meta / Social Ads', 'Campagnes & acquisition de leads'] },
  { img: '/images/about/about-seo.webp', title: 'SEO & contenu', items: ['Audits Ahrefs & Search Console', 'SEO technique & visibilité IA', 'Réseaux sociaux, emailing (Brevo)'] },
  { img: '/images/about/about-auto.webp', title: 'Automatisation & IA', items: ['No-code (n8n, Make)', 'CRM & workflows sur-mesure', 'Agents IA & connexion des outils'] },
]

const FORMATION = [
  { year: '2023–2025', title: 'MBA Expert Marketing Digital', school: 'My Digital School · Bac+5' },
  { year: '2021–2023', title: 'Bachelor Marketing Digital', school: 'My Digital School · Bac+3' },
  { year: '2019–2021', title: 'BTS NDRC', school: 'Idelca Business School' },
  { year: '2024', title: 'No-Code & Automatisation', school: 'n8n · Make' },
]

export default function AProposPage() {
  return (
    <div className="min-h-screen bg-background pt-28 pb-20">
      <div className="max-w-5xl mx-auto px-6">

        {/* Hero */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 border border-border rounded-full px-4 py-1.5 mb-8">
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#F4521E' }} />
            <span className="text-xs font-medium text-muted-foreground tracking-wide">Fondateur · vivesmedia.com</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-foreground leading-[1.05] mb-4">Béranger Vivès</h1>
          <p className="text-base md:text-lg font-medium mb-6" style={{ color: '#F4521E' }}>
            Marketing digital · SEA &amp; Social Ads · UX/UI
          </p>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
            Expert en marketing digital diplômé d'un <strong className="text-foreground font-semibold">MBA (Bac+5)</strong>, spécialiste
            SEA &amp; Social Ads, avec près de 5 ans d'expérience en e-commerce. Avec vivesmedia.com, je transforme votre présence
            web en un <strong className="text-foreground font-semibold">système de croissance autonome</strong> : des sites pensés
            pour convertir, où l'IA et l'automatisation gèrent la logistique à votre place.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link href="/contact" className="inline-flex items-center gap-2 text-white font-semibold px-7 py-3.5 rounded-full transition-all hover:opacity-90"
              style={{ backgroundColor: '#F4521E', boxShadow: '0 8px 30px rgba(244,82,30,0.22)' }}>
              Lancer mon projet <ArrowUpRight className="w-4 h-4" />
            </Link>
            <a href="https://www.linkedin.com/in/b%C3%A9ranger-viv%C3%A8s-3397b61aa/" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-medium px-6 py-3.5 rounded-full border border-border text-foreground hover:border-foreground transition-colors">
              <LinkedinIcon className="w-4 h-4" /> LinkedIn
            </a>
          </div>
        </div>

        {/* Facts */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-24">
          {FACTS.map((f) => (
            <div key={f.v} className="rounded-2xl border border-border bg-white px-5 py-6 text-center">
              <div className="text-2xl md:text-3xl font-bold text-foreground leading-none">{f.k}</div>
              <div className="text-xs md:text-sm text-muted-foreground mt-2 leading-snug">{f.v}</div>
            </div>
          ))}
        </div>

        {/* Story */}
        <div className="mb-24 max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#F4521E' }}>Le parcours</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground leading-tight mb-6">
            Comment j'en suis <span className="font-heading italic font-normal text-foreground/50">arrivé là</span>
          </h2>
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              Je viens du <strong className="text-foreground font-medium">marketing digital e-commerce</strong>. Pendant près de cinq ans,
              en alternance, j'ai géré des sites, des campagnes et des communautés pour des marques du sport mécanique et du nautique
              (Hurier Moto, Ducati JMS Motos, Matos Import) : refonte UX/UI de sites PrestaShop, publicité, SEO, réseaux sociaux,
              emailing et contenu.
            </p>
            <p>
              En parallèle, j'ai poussé ma formation jusqu'au <strong className="text-foreground font-medium">MBA Expert Marketing Digital (Bac+5)</strong>,
              puis je me suis spécialisé dans le no-code et l'IA. De cette double culture, un marketing qui convertit et une
              exécution soignée, est né <strong className="text-foreground font-medium">vivesmedia.com</strong> : je ne livre pas
              juste de « beaux sites », mais des systèmes où l'IA et l'automatisation travaillent pour vous, pour que vous vous
              recentriez sur votre métier.
            </p>
          </div>
        </div>

        {/* Expertise */}
        <div className="mb-24">
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#F4521E' }}>Compétences</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground leading-tight mb-12">
            Ce que je <span className="font-heading italic font-normal text-foreground/50">maîtrise</span>
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {EXPERTISE.map((e) => (
              <div key={e.title} className="group rounded-2xl border border-border bg-white overflow-hidden h-full flex flex-col hover:shadow-md transition-shadow">
                <div className="relative aspect-[3/2] border-b border-border bg-white">
                  <Image src={e.img} alt={e.title} fill sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw" className="object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
                </div>
                <div className="p-6 flex flex-col gap-3 flex-1">
                  <h3 className="text-base font-semibold text-foreground">{e.title}</h3>
                  <ul className="space-y-2">
                    {e.items.map((it) => (
                      <li key={it} className="flex items-start gap-2 text-sm text-muted-foreground leading-snug">
                        <span className="mt-1.5 w-1 h-1 rounded-full shrink-0" style={{ backgroundColor: '#F4521E' }} />
                        {it}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Formation */}
        <div className="mb-24">
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#F4521E' }}>Formation</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground leading-tight mb-12">
            Formé, diplômé, <span className="font-heading italic font-normal text-foreground/50">à jour</span>
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {FORMATION.map((f) => (
              <div key={f.title} className="rounded-2xl border border-border bg-white p-6 flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-secondary/70">
                  <GraduationCap className="w-5 h-5 text-foreground/70" />
                </div>
                <div>
                  <div className="text-xs font-mono text-muted-foreground mb-1">{f.year}</div>
                  <h3 className="text-base font-semibold text-foreground leading-tight">{f.title}</h3>
                  <p className="text-sm text-muted-foreground mt-0.5">{f.school}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline (parcours chronologique) */}
        <Timeline />

        {/* CTA */}
        <div className="rounded-2xl bg-foreground p-10 text-center">
          <div className="inline-flex items-center gap-1.5 text-white/60 text-sm mb-4">
            <MapPin className="w-4 h-4" /> Avignon · Full remote · Partout en France
          </div>
          <h3 className="text-2xl font-bold text-white mb-3">Travaillons ensemble</h3>
          <p className="text-white/60 mb-6">Devis gratuit sous 24h, sans engagement.</p>
          <Link href="/contact" className="inline-flex items-center gap-2 bg-white text-foreground font-semibold px-8 py-4 rounded-full hover:bg-white/90 transition-all">
            Lancer mon projet <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}
