import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowUpRight, ArrowLeft, ExternalLink } from 'lucide-react'
import Reveal from '@/components/ui/Reveal'
import { BrowserFrame, PhoneFrame } from '@/components/ui/DeviceFrames'

export const metadata: Metadata = {
  title: 'Sésame Informatique — Refonte site ERP B2B Négoce',
  description: "Conception complète du site sesame-informatique.fr : direction artistique, palette teal + amber, hero sombre, bento grid, tunnel de conversion B2B pour un éditeur ERP depuis 1987.",
  alternates: { canonical: 'https://vivesmedia.com/realisations/sesame-informatique' },
}

const PALETTE = [
  { hex: '#0F2C3C', name: 'Encre Sésame', role: 'Hero, navbar, sections sombres' },
  { hex: '#D4891A', name: 'Or du Négoce', role: 'CTAs, accents, icônes, hover' },
  { hex: '#FAFAF8', name: 'Blanc Chaud', role: 'Fond page, cartes' },
  { hex: '#1C2128', name: 'Texte Principal', role: 'Titres, corps de texte' },
  { hex: '#8A9099', name: 'Gris Neutre', role: 'Texte secondaire, muted' },
  { hex: '#FEF3DC', name: 'Ambre Clair', role: 'Cards accent, highlights' },
]

const SECTIONS_SITE = [
  { num: '01', title: 'Hero plein écran sombre', desc: 'Fond #0F2C3C, titre Sora Black, CTA amber pill + outline blanc. Dashboard MARGEZ PLUS animé en flottant à droite.' },
  { num: '02', title: 'Bande logos clients', desc: 'Défilement continu — Brico-Pro, Algorel, Socoda, Master-Pro, Auchan. Preuve sociale immédiate.' },
  { num: '03', title: 'Bento Grid — 8 modules', desc: 'Gestion Commerciale (large), Comptabilité (dark card), CRM (amber card), E-Business, Stats, Planning, Connecteurs, Documents.' },
  { num: '04', title: 'Stats Strip', desc: '+3 pts de marge brute, 34 ans, 2000+ utilisateurs, Sage connecté. Chiffres en grand format.' },
  { num: '05', title: 'Opérationnel en 3 étapes', desc: 'Analyse → Paramétrage → Go Live. Rassure sur le délai de déploiement avant même la question.' },
  { num: '06', title: 'Témoignages', desc: 'Citations verbatim, prénom, société, secteur. Plus un bloc booking "Réservez un rendez-vous".' },
  { num: '07', title: 'Secteurs d\'activité', desc: 'Électricité, Bois, Quincaillerie, Sanitaire, Carrelage, Jardinerie. Pages dédiées = SEO longue traîne.' },
  { num: '08', title: 'Footer sombre + CTA', desc: 'Footer #0F2C3C avec liens + numéro direct + bouton démo orange permanent.' },
]

// Pastille + titre éditorial large (cohérent avec le template [slug]).
function SectionHead({ eyebrow, title, accent }: { eyebrow: string; title: React.ReactNode; accent?: React.ReactNode }) {
  return (
    <Reveal>
      <p className="text-xs font-semibold uppercase tracking-[0.2em] mb-5" style={{ color: '#F4521E' }}>{eyebrow}</p>
      <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-[1.08] tracking-tight text-foreground">
        {title}{accent && <> <span className="font-heading italic font-normal text-foreground/55">{accent}</span></>}
      </h2>
    </Reveal>
  )
}

export default function SesameInformatiquePage() {
  return (
    <div className="min-h-screen bg-background">

      {/* ── 1. HERO ÉDITORIAL (centré, façon magazine) ── */}
      <header className="mx-auto max-w-3xl px-6 pt-28 sm:pt-36 pb-14 sm:pb-20 text-center">
        <Link href="/realisations" className="group mb-12 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground">
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          Toutes les réalisations
        </Link>
        <p className="mb-6 text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: '#F4521E' }}>
          Étude de cas · 2025
        </p>
        <h1 className="text-4xl font-bold leading-[1.05] tracking-tight text-foreground sm:text-6xl lg:text-7xl">
          Sésame Informatique
        </h1>
        <p className="mt-4 font-heading text-2xl italic text-foreground/55 sm:text-3xl">Site de conversion ERP B2B</p>
        <p className="mx-auto mt-8 max-w-xl text-lg leading-relaxed text-muted-foreground">
          Conception complète du site pour un éditeur ERP du négoce présent depuis 1987. Direction artistique, palette teal + amber, hero sombre, dashboard produit animé, bento grid 8 modules, tunnel de conversion B2B optimisé.
        </p>
        <div className="mt-9 flex flex-wrap items-center justify-center gap-2.5">
          {['Framer', 'B2B ERP', 'Direction artistique', 'Sora + DM Sans', 'PostHog'].map(tag => (
            <span key={tag} className="rounded-full border border-border px-3.5 py-1.5 text-xs text-muted-foreground">{tag}</span>
          ))}
        </div>
        <div className="mt-7">
          <a href="https://sesame-preview.vercel.app/" target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white transition-all hover:scale-[1.03]"
            style={{ backgroundColor: '#F4521E', boxShadow: '0 8px 30px rgba(244,82,30,0.35)' }}>
            Visiter le site en ligne <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </header>

      {/* ── IMAGE HERO IMMERSIVE ── */}
      <Reveal className="px-3 sm:px-6">
        <div className="mx-auto max-w-[1500px]">
          <BrowserFrame url="sesame-preview.vercel.app">
            <img src="/thumbnails/sesame-hero.png" alt="Sésame Informatique — Hero desktop" className="w-full" />
          </BrowserFrame>
        </div>
      </Reveal>

      {/* ── APERÇUS DESKTOP + MOBILE (défilables) ── */}
      <section className="py-24 sm:py-32 lg:py-40">
        <div className="mx-auto mb-16 max-w-3xl px-6 sm:mb-20">
          <SectionHead eyebrow="Aperçu du projet" title="Le rendu," accent="en images." />
        </div>
        <div className="mx-auto grid max-w-[1500px] items-start gap-12 px-3 sm:px-6 md:grid-cols-2">
          <Reveal>
            <figure>
              <BrowserFrame url="page complète">
                <div className="h-[480px] overflow-y-auto">
                  <img src="/thumbnails/sesame-desktop.png" alt="Sésame Informatique — page complète desktop" className="block w-full" />
                </div>
              </BrowserFrame>
              <figcaption className="mt-6 text-center text-sm text-muted-foreground">Page complète · Desktop — faites défiler</figcaption>
            </figure>
          </Reveal>
          <Reveal>
            <figure className="flex flex-col items-center">
              <div className="w-full max-w-[280px]">
                <PhoneFrame>
                  <div className="h-[480px] overflow-y-auto">
                    <img src="/thumbnails/sesame-mobile.png" alt="Sésame Informatique — mobile" className="block w-full" />
                  </div>
                </PhoneFrame>
              </div>
              <figcaption className="mt-6 text-center text-sm text-muted-foreground">Mobile · 390px — faites défiler</figcaption>
            </figure>
          </Reveal>
        </div>
      </section>

      {/* ── IDENTITÉ VISUELLE (logo) ── */}
      <section className="border-t border-border bg-secondary/30 py-24 sm:py-32 lg:py-40">
        <div className="mx-auto max-w-5xl px-6">
          <SectionHead eyebrow="Identité visuelle" title="Le logo —" accent="34 ans d'autorité préservés" />
          <div className="mt-14 grid items-start gap-8 sm:mt-20 lg:grid-cols-2">
            <Reveal>
              <div className="flex min-h-[320px] items-center justify-center rounded-3xl border border-border bg-white p-16">
                <img src="/thumbnails/sesame-card.svg" alt="Logo Sésame Informatique" className="w-full max-w-[260px]" />
              </div>
            </Reveal>
            <Reveal>
              <div className="space-y-6">
                <div className="flex min-h-[320px] items-center justify-center rounded-3xl bg-[#0F2C3C] p-16">
                  <div style={{ filter: 'invert(1) brightness(10)' }}>
                    <img src="/thumbnails/sesame-card.svg" alt="Logo Sésame Informatique version claire" className="w-full max-w-[260px]" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-xl border border-border bg-white p-4">
                    <p className="mb-1 text-xs text-muted-foreground">Décision clé</p>
                    <p className="font-semibold text-foreground">Conserver l'existant</p>
                    <p className="mt-1 text-xs text-muted-foreground">En B2B ERP, 35 ans de reconnaissance &gt; modernité</p>
                  </div>
                  <div className="rounded-xl border border-border bg-white p-4">
                    <p className="mb-1 text-xs text-muted-foreground">Modernisation</p>
                    <p className="font-semibold text-foreground">Contexte + mise en scène</p>
                    <p className="mt-1 text-xs text-muted-foreground">Palette teal + amber autour du logo</p>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── PALETTE ── */}
      <section className="py-24 sm:py-32 lg:py-40">
        <div className="mx-auto max-w-5xl px-6">
          <SectionHead eyebrow="Direction artistique — Couleurs" title="Teal + Amber —" accent="unique dans le secteur ERP" />
          <Reveal>
            <p className="mb-12 mt-8 max-w-2xl text-lg leading-relaxed text-muted-foreground">
              Tous les concurrents (NegOSS, Trade-Easy, Gestimum, Codial) utilisent du bleu. Le choix teal + amber permet à Sésame de se différencier immédiatement dans tout résultat Google, toute comparaison de sites, tout PDF d'appel d'offre.
            </p>
          </Reveal>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {PALETTE.map((c, i) => (
              <Reveal key={c.hex} delay={i * 0.05}>
                <div className="flex items-start gap-4 rounded-2xl border border-border bg-white p-5">
                  <div className="h-12 w-12 shrink-0 rounded-xl border border-border/50" style={{ backgroundColor: c.hex }} />
                  <div>
                    <p className="font-mono text-xs text-muted-foreground">{c.hex}</p>
                    <p className="mt-0.5 text-sm font-semibold text-foreground">{c.name}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{c.role}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── TYPOGRAPHIE ── */}
      <section className="border-t border-border bg-secondary/30 py-24 sm:py-32 lg:py-40">
        <div className="mx-auto max-w-5xl px-6">
          <SectionHead eyebrow="Direction artistique — Typographie" title="Sora + DM Sans —" accent="autorité et lisibilité" />
          <div className="mt-14 grid gap-8 sm:mt-20 md:grid-cols-2">
            <Reveal>
              <div className="rounded-2xl border border-border bg-white p-8">
                <p className="mb-4 text-xs uppercase tracking-[0.2em] text-muted-foreground">Sora — Titres & headings</p>
                <p className="text-5xl font-black leading-tight" style={{ fontFamily: "'Sora', sans-serif", color: '#0F2C3C', letterSpacing: '-1.5px' }}>MARGEZ<br/>PLUS</p>
                <p className="mt-4 text-xs text-muted-foreground">Sora Black 900 · tracking -1.5px</p>
                <p className="mt-4 text-sm text-muted-foreground">Utilisé pour les titres hero, H1/H2. Police géométrique semi-condensée — projette sérieux et modernité sans être froide.</p>
              </div>
            </Reveal>
            <Reveal>
              <div className="rounded-2xl border border-border bg-white p-8">
                <p className="mb-4 text-xs uppercase tracking-[0.2em] text-muted-foreground">DM Sans — Corps de texte</p>
                <p className="text-xl font-medium leading-relaxed" style={{ color: '#1C2128' }}>MARGEZ PLUS automatise vos devis, commandes, stocks et marges — en une seule solution.</p>
                <p className="mt-4 text-xs text-muted-foreground">DM Sans 400/500 · 16px · line-height 1.8</p>
                <p className="mt-4 text-sm text-muted-foreground">Humaniste sans-serif. Lisibilité maximale pour les décideurs B2B qui lisent vite sur mobile.</p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── STRUCTURE (liste éditoriale) ── */}
      <section className="py-24 sm:py-32 lg:py-40">
        <div className="mx-auto max-w-4xl px-6">
          <SectionHead eyebrow="Structure du site" title="8 sections —" accent="un tunnel de conversion B2B" />
          <Reveal>
            <p className="mb-4 mt-8 max-w-xl text-lg leading-relaxed text-muted-foreground">
              Chaque section répond à une question implicite du prospect avant qu'il ne la pose.
            </p>
          </Reveal>
          <div className="mt-10">
            {SECTIONS_SITE.map((s) => (
              <Reveal key={s.num}>
                <div className="grid gap-4 border-t border-border py-8 sm:grid-cols-[5rem_1fr] sm:gap-10 sm:py-10">
                  <span className="font-mono text-sm font-semibold" style={{ color: '#F4521E' }}>{s.num}</span>
                  <div>
                    <h3 className="text-xl font-bold text-foreground sm:text-2xl">{s.title}</h3>
                    <p className="mt-3 max-w-2xl text-lg leading-relaxed text-muted-foreground">{s.desc}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── TRACKING ── */}
      <section className="border-t border-border bg-secondary/30 py-24 sm:py-32 lg:py-40">
        <div className="mx-auto max-w-5xl px-6">
          <SectionHead eyebrow="Tracking & Automatisation" title="Mesurer pour" accent="améliorer dès le jour 1" />
          <div className="mt-14 grid gap-6 sm:mt-20 md:grid-cols-3">
            {[
              { tool: 'PostHog', detail: 'Heatmaps, session recordings, funnels. 1 semaine après lancement : 20 sessions regardées pour identifier les points de friction.' },
              { tool: 'GA4 + Search Console', detail: 'Trafic, sources, pages les plus visitées. Mots-clés sur lesquels Google indexe le site.' },
              { tool: 'Microsoft Clarity', detail: 'Heatmaps gratuits en double validation. Enregistrement illimité de sessions pour optimisation continue.' },
              { tool: 'LinkedIn Insight Tag', detail: 'Recibler les visiteurs qui ne convertissent pas ET identifier leurs entreprises. Clé pour cibler DSI et dirigeants PME.' },
              { tool: 'Facebook Pixel', detail: '75% des visiteurs repartent sans contact. Le pixel permet de les ré-cibler à faible coût via publicité Meta.' },
              { tool: 'Séquence email automatique', detail: 'J+0 confirmation · J+2 relance sans réponse · J+7/14/30 nurturing avec ressources utiles (facture électronique 2026, etc.)' },
            ].map((item, i) => (
              <Reveal key={item.tool} delay={i * 0.05}>
                <div className="rounded-2xl border border-border bg-white p-6">
                  <p className="mb-2 text-sm font-bold text-foreground">{item.tool}</p>
                  <p className="text-sm leading-relaxed text-muted-foreground">{item.detail}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROJET SUIVANT ── */}
      <Link href="/realisations" className="group block border-t border-border">
        <div className="mx-auto flex max-w-5xl flex-col items-center px-6 py-20 text-center sm:py-28">
          <p className="mb-3 text-xs uppercase tracking-[0.2em] text-muted-foreground">Tous les projets</p>
          <p className="text-4xl font-bold leading-tight tracking-tight text-foreground transition-colors duration-500 group-hover:text-foreground/55 sm:text-6xl lg:text-7xl">
            Voir les réalisations
          </p>
          <span className="mt-8 inline-flex h-12 w-12 items-center justify-center rounded-full border border-border text-foreground transition-all duration-500 group-hover:translate-x-1">
            <ArrowUpRight className="h-5 w-5" />
          </span>
        </div>
      </Link>

      {/* ── CTA ── */}
      <section className="border-t border-border bg-background px-6 py-20 sm:py-28">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-3xl bg-foreground p-8 text-center sm:p-14 md:p-16">
            <p className="mb-4 text-xs uppercase tracking-[0.2em] text-white/40">Votre projet est le prochain</p>
            <h3 className="mx-auto max-w-xl text-3xl font-bold leading-tight text-white sm:text-4xl">
              Un site qui convertit,{' '}
              <span className="font-heading italic font-normal">pas juste qui existe</span>
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
