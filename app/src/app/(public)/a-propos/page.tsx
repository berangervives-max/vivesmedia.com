import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowUpRight, MapPin } from 'lucide-react'

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

const SOMMAIRE = [
  { num: '01', href: '#parcours', title: 'Le parcours', sub: "Comment j'en suis arrivé là" },
  { num: '02', href: '#competences', title: 'Compétences', sub: 'Ce que je maîtrise' },
  { num: '03', href: '#formation', title: 'Formation', sub: 'Diplômes & certifications' },
  { num: '04', href: '#contact', title: 'Contact', sub: 'Lancer un projet' },
]

const EXPERTISE_FEATURE = {
  img: '/images/about/about-ux.webp',
  title: 'Sites & UX/UI',
  items: ['Conception UX/UI (Adobe, Figma)', 'E-commerce (PrestaShop, Shopify)', 'Sites sur-mesure (Next.js, Framer)'],
}

const EXPERTISE_SUPPORT = [
  { img: '/images/about/about-ads.webp', title: 'SEA & Social Ads', items: ['Google Ads (SEA)', 'Meta / Social Ads', 'Campagnes & acquisition de leads'] },
  { img: '/images/about/about-seo.webp', title: 'SEO & contenu', items: ['Audits Ahrefs & Search Console', 'SEO technique & visibilité IA', 'Réseaux sociaux, emailing (Brevo)'] },
  { img: '/images/about/about-auto.webp', title: 'Automatisation & IA', items: ['No-code (n8n, Make)', 'CRM & workflows sur-mesure', 'Agents IA & connexion des outils'] },
]

const FORMATION_FEATURE = {
  year: '2023–2025',
  logo: '/images/about/logos/mydigitalschool.svg',
  eyebrow: 'Le plus récent',
  title: 'MBA Expert Marketing Digital',
  rncp: 'RNCP : « Manager de la stratégie marketing digital »',
  meta: ['My Digital School, campus Montpellier', 'Titre RNCP, Niveau 7 (Bac+5)', 'France Compétences'],
  source: { label: 'Vérifier la fiche RNCP41809', href: 'https://www.francecompetences.fr/recherche/rncp/41809' },
}

const FORMATION_SUPPORT = [
  {
    year: '2019–2021',
    logo: '/images/about/logos/idelca.jpg',
    title: 'BTS Négociation et Digitalisation de la Relation Client',
    meta: "Idelca Business School · Diplôme d'État, Niveau 5",
  },
  {
    year: '2021–2023',
    logo: '/images/about/logos/mydigitalschool.svg',
    title: 'Bachelor Marketing Digital',
    meta: 'My Digital School · Titre RNCP, Niveau 6',
  },
  {
    year: '2024',
    logo: '/images/about/logos/n8n.svg',
    title: 'No-Code & Automatisation',
    meta: 'n8n Academy · formation certifiante',
  },
]

function BoldFirstLetter({ text }: { text: string }) {
  return (
    <>
      <b className="font-extrabold text-foreground">{text.charAt(0)}</b>
      {text.slice(1)}
    </>
  )
}

export default function AProposPage() {
  return (
    <div className="min-h-screen bg-background pt-28 pb-20">
      <div className="max-w-5xl mx-auto px-6">

        {/* Hero */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 border border-border rounded-full px-4 py-1.5 mb-8">
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#FF6B00' }} />
            <span className="text-xs font-medium text-muted-foreground tracking-wide">Fondateur · vivesmedia.com</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-foreground leading-[1.05] mb-4">Béranger Vivès</h1>
          <p className="text-base md:text-lg font-medium mb-6" style={{ color: '#FF6B00' }}>
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
              style={{ backgroundColor: '#FF6B00', boxShadow: '0 8px 30px rgba(244,82,30,0.22)' }}>
              Lancer mon projet <ArrowUpRight className="w-4 h-4" />
            </Link>
            <a href="https://www.linkedin.com/in/b%C3%A9ranger-viv%C3%A8s-3397b61aa/" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-medium px-6 py-3.5 rounded-full border border-border text-foreground hover:border-foreground transition-colors">
              <LinkedinIcon className="w-4 h-4" /> LinkedIn
            </a>
          </div>
        </div>

        {/* Facts — bandeau à filets, plus de cartes */}
        <div className="flex overflow-x-auto sm:overflow-visible snap-x snap-mandatory border-y border-border mb-20 -mx-6 px-6 sm:mx-0 sm:px-0 sm:justify-center">
          {FACTS.map((f, i) => (
            <div key={f.v} className={`flex-none w-[46%] sm:w-auto sm:flex-1 snap-start text-center px-5 py-6 ${i > 0 ? 'border-l border-border' : ''}`}>
              <div className="text-2xl md:text-3xl font-bold text-foreground leading-none">{f.k}</div>
              <div className="text-xs md:text-sm text-muted-foreground mt-2 leading-snug">{f.v}</div>
            </div>
          ))}
        </div>

        {/* Sommaire */}
        <div className="grid sm:grid-cols-[110px_1fr] gap-6 sm:gap-8 items-center mb-24">
          <p className="font-black tracking-tighter text-foreground leading-[0.82] text-4xl sm:text-3xl sm:[writing-mode:vertical-rl] sm:rotate-180 sm:justify-self-center">
            sommaire.
          </p>
          <nav className="flex flex-col">
            {SOMMAIRE.map((s) => (
              <a key={s.num} href={s.href}
                className="group flex items-baseline gap-4 py-3.5 border-b border-border transition-[gap] duration-200 hover:gap-6">
                <span className="font-mono text-xs w-6 shrink-0 text-muted-foreground transition-colors group-hover:text-[#FF6B00]">{s.num}</span>
                <span className="text-lg font-bold text-foreground transition-colors group-hover:text-[#FF6B00]">{s.title}</span>
                <span className="ml-auto text-xs text-muted-foreground hidden sm:inline">{s.sub}</span>
              </a>
            ))}
          </nav>
        </div>

        {/* Story */}
        <div id="parcours" className="mb-16 scroll-mt-28">
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#FF6B00' }}>Le parcours</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground leading-tight mb-8">
            Comment j'en suis <span className="font-accent text-foreground inline-block -rotate-2">arrivé là</span>
          </h2>
          <div className="grid sm:grid-cols-[130px_1fr] gap-6 sm:gap-8 max-w-3xl">
            <div className="flex sm:flex-col items-baseline sm:items-start gap-3 sm:gap-0 border-b sm:border-b-0 border-border pb-4 sm:pb-0">
              <span className="text-4xl sm:text-6xl font-black leading-none" style={{ color: '#FF6B00' }}>5</span>
              <span className="text-xs uppercase tracking-wide text-muted-foreground">ans de terrain</span>
            </div>
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
        </div>

        {/* Respiration XXL */}
        <div className="text-center py-16 mb-8">
          <span className="block text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-4">Avant de parler compétences</span>
          <p className="font-accent text-2xl sm:text-4xl md:text-5xl leading-tight text-foreground text-balance max-w-3xl mx-auto">
            Cinq ans à faire tourner de <span style={{ color: '#FF6B00' }}>vrais</span> sites, pas des maquettes.
          </p>
        </div>

        {/* Compétences */}
        <div id="competences" className="mb-24 scroll-mt-28">
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#FF6B00' }}>Compétences</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground leading-tight mb-12">
            Ce que je <span className="font-accent text-foreground inline-block rotate-1">maîtrise</span>
          </h2>

          {/* Feature */}
          <div className="grid sm:grid-cols-2 gap-6 sm:gap-10 items-center mb-14">
            <div className="relative aspect-[4/3]">
              <Image src={EXPERTISE_FEATURE.img} alt={EXPERTISE_FEATURE.title} fill sizes="(max-width: 640px) 100vw, 50vw" className="object-contain" />
            </div>
            <div className="flex flex-col gap-4">
              <span className="text-[11px] font-bold uppercase tracking-[0.16em]" style={{ color: '#FF6B00' }}>Cœur de métier</span>
              <h3 className="text-2xl sm:text-3xl font-bold text-foreground leading-tight">{EXPERTISE_FEATURE.title}</h3>
              <ul className="space-y-2.5">
                {EXPERTISE_FEATURE.items.map((it) => (
                  <li key={it} className="text-muted-foreground leading-snug">
                    <BoldFirstLetter text={it} />
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Trio de soutien */}
          <div className="grid sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-border border-t border-border">
            {EXPERTISE_SUPPORT.map((e) => (
              <div key={e.title} className="flex flex-col gap-3 py-8 sm:px-8 first:sm:pl-0">
                <div className="relative aspect-[4/3] mb-1">
                  <Image src={e.img} alt={e.title} fill sizes="(max-width: 640px) 100vw, 33vw" className="object-contain" />
                </div>
                <h4 className="text-base font-semibold text-foreground">{e.title}</h4>
                <ul className="space-y-1.5">
                  {e.items.map((it) => (
                    <li key={it} className="text-sm text-muted-foreground leading-snug">
                      <BoldFirstLetter text={it} />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Formation */}
        <div id="formation" className="mb-24 relative overflow-hidden scroll-mt-28">
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#FF6B00' }}>Formation</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground leading-tight mb-4">
            Formé, diplômé, <span className="font-accent text-foreground inline-block -rotate-1">à jour</span>
          </h2>
          <p aria-hidden="true" className="select-none pointer-events-none absolute -top-2 -left-2 sm:-left-4 font-black tracking-tighter leading-[0.8] text-foreground opacity-[0.035] text-[6rem] sm:text-[10rem] whitespace-nowrap">
            diplômes
          </p>

          <div className="relative">
            {/* Feature — MBA */}
            <div className="grid sm:grid-cols-[auto_1fr] gap-6 items-center pb-10">
              <div className="w-16 h-16 sm:w-[88px] sm:h-[88px] flex items-center justify-center shrink-0">
                <Image src={FORMATION_FEATURE.logo} alt="My Digital School" width={88} height={88} unoptimized className="object-contain w-full h-full" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-[0.14em]" style={{ color: '#FF6B00' }}>{FORMATION_FEATURE.eyebrow}</span>
                <h3 className="text-2xl sm:text-4xl font-extrabold text-foreground leading-[1.02] tracking-tight mt-1">{FORMATION_FEATURE.title}</h3>
                <p className="mt-2">
                  RNCP : <span className="font-accent text-foreground">« Manager de la stratégie marketing digital »</span>
                </p>
                <div className="flex flex-wrap gap-x-2 gap-y-1 mt-2 text-sm text-muted-foreground">
                  <span className="font-mono text-foreground font-semibold">{FORMATION_FEATURE.year}</span>
                  {FORMATION_FEATURE.meta.map((m) => (
                    <span key={m}><span className="text-border mr-2">·</span>{m}</span>
                  ))}
                </div>
                <a href={FORMATION_FEATURE.source.href} target="_blank" rel="noopener noreferrer"
                  className="inline-block mt-2 text-xs text-muted-foreground border-b border-border hover:border-foreground hover:text-foreground transition-colors">
                  {FORMATION_FEATURE.source.label} ↗
                </a>
              </div>
            </div>

            <hr className="border-border" />

            {/* Trio de soutien */}
            <div className="grid sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-border">
              {FORMATION_SUPPORT.map((f) => (
                <div key={f.title} className="flex flex-col gap-2.5 py-7 sm:px-7 first:sm:pl-0">
                  <div className="w-12 h-12 flex items-center mb-1">
                    <Image src={f.logo} alt="" width={48} height={48} unoptimized={f.logo.endsWith('.svg')}
                      className="object-contain w-full h-full grayscale opacity-80 hover:grayscale-0 hover:opacity-100 transition-all" />
                  </div>
                  <h4 className="text-base font-bold text-foreground leading-snug">{f.title}</h4>
                  <div className="text-xs text-muted-foreground flex flex-col gap-0.5">
                    <span className="font-mono text-foreground/70">{f.year}</span>
                    <span>{f.meta}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Timeline (parcours chronologique) */}
        <Timeline />

        {/* CTA */}
        <div id="contact" className="bg-foreground p-10 text-center scroll-mt-28">
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
