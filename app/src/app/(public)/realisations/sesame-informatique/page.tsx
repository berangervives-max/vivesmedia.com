import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowUpRight, ArrowLeft, ExternalLink } from 'lucide-react'

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

export default function SesameInformatiquePage() {
  return (
    <div className="min-h-screen bg-background">

      {/* Back nav */}
      <div className="max-w-7xl mx-auto px-6 pt-32 pb-0">
        <Link href="/realisations" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group mb-12">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Toutes les réalisations
        </Link>
      </div>

      {/* ── HERO PROJECT ── */}
      <header className="max-w-7xl mx-auto px-6 pb-16">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: '#F4521E' }}>
              Réalisation · 2025
            </p>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-foreground leading-[1.05] tracking-tight">
              Sésame Informatique —{' '}
              <span className="font-heading italic font-normal text-foreground/60">
                site de conversion ERP B2B
              </span>
            </h1>
            <p className="mt-6 text-muted-foreground text-lg leading-relaxed max-w-2xl">
              Conception complète du site pour un éditeur ERP du négoce présent depuis 1987. Direction artistique, palette teal + amber, hero sombre, dashboard produit animé, bento grid 8 modules, tunnel de conversion B2B optimisé.
            </p>
          </div>
          <div className="flex flex-col gap-3 shrink-0">
            <div className="flex flex-wrap gap-2">
              {['Framer', 'B2B ERP', 'Direction artistique', 'Sora + DM Sans', 'PostHog'].map(tag => (
                <span key={tag} className="text-xs px-3 py-1.5 rounded-full border border-border text-muted-foreground">{tag}</span>
              ))}
            </div>
            <a href="https://sesame-preview.vercel.app/" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-full border border-border hover:border-foreground/30 transition-colors text-muted-foreground hover:text-foreground w-fit">
              Voir le site <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </header>

      {/* ── SCREENSHOT DESKTOP ── */}
      <div className="max-w-7xl mx-auto px-6 mb-6">
        <div className="rounded-3xl overflow-hidden border border-border shadow-xl">
          <div className="bg-secondary/50 px-4 py-3 flex items-center gap-2 border-b border-border">
            <span className="w-3 h-3 rounded-full bg-red-400" />
            <span className="w-3 h-3 rounded-full bg-yellow-400" />
            <span className="w-3 h-3 rounded-full bg-green-400" />
            <span className="flex-1 text-center text-xs text-muted-foreground font-mono">sesame-preview.vercel.app</span>
          </div>
          <img src="/thumbnails/sesame-hero.png" alt="Sésame Informatique — Hero desktop" className="w-full" />
        </div>
        <p className="text-xs text-muted-foreground mt-3 text-center uppercase tracking-widest">Vue hero — desktop 1440px</p>
      </div>

      {/* ── DESKTOP + MOBILE SPLIT ── */}
      <div className="max-w-7xl mx-auto px-6 mb-24">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Full desktop */}
          <div>
            <div className="rounded-2xl overflow-hidden border border-border shadow-md bg-white">
              <img src="/thumbnails/sesame-desktop.png" alt="Sésame Informatique — page complète desktop" className="w-full" />
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">Page complète · Desktop</p>
          </div>
          {/* Mobile */}
          <div className="flex flex-col items-center">
            <div className="rounded-2xl overflow-hidden border border-border shadow-md bg-white w-full max-w-[300px] mx-auto">
              <img src="/thumbnails/sesame-mobile.png" alt="Sésame Informatique — mobile" className="w-full" />
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">Mobile · 390px</p>
          </div>
        </div>
      </div>

      {/* ── LOGO ── */}
      <section className="py-24 bg-secondary/30">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: '#F4521E' }}>Identité visuelle</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground leading-tight max-w-2xl mb-16">
            Le logo —{' '}
            <span className="font-heading italic font-normal">34 ans d'autorité préservés</span>
          </h2>
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Logo sur fond blanc */}
            <div className="bg-white rounded-3xl border border-border p-16 flex items-center justify-center min-h-[320px]">
              <img src="/thumbnails/sesame-card.svg" alt="Logo Sésame Informatique" className="w-full max-w-[260px]" />
            </div>
            {/* Logo sur fond sombre */}
            <div className="space-y-6">
              <div className="bg-[#0F2C3C] rounded-3xl p-16 flex items-center justify-center min-h-[320px]">
                <div style={{ filter: 'invert(1) brightness(10)' }}>
                  <img src="/thumbnails/sesame-card.svg" alt="Logo Sésame Informatique version claire" className="w-full max-w-[260px]" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="p-4 rounded-xl border border-border bg-white">
                  <p className="text-xs text-muted-foreground mb-1">Décision clé</p>
                  <p className="font-semibold text-foreground">Conserver l'existant</p>
                  <p className="text-xs text-muted-foreground mt-1">En B2B ERP, 35 ans de reconnaissance &gt; modernité</p>
                </div>
                <div className="p-4 rounded-xl border border-border bg-white">
                  <p className="text-xs text-muted-foreground mb-1">Modernisation</p>
                  <p className="font-semibold text-foreground">Contexte + mise en scène</p>
                  <p className="text-xs text-muted-foreground mt-1">Palette teal + amber autour du logo</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PALETTE ── */}
      <section className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: '#F4521E' }}>Direction artistique — Couleurs</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground leading-tight max-w-2xl mb-4">
            Teal + Amber —{' '}
            <span className="font-heading italic font-normal">unique dans le secteur ERP</span>
          </h2>
          <p className="text-muted-foreground mb-12 max-w-2xl">
            Tous les concurrents (NegOSS, Trade-Easy, Gestimum, Codial) utilisent du bleu. Le choix teal + amber permet à Sésame de se différencier immédiatement dans tout résultat Google, toute comparaison de sites, tout PDF d'appel d'offre.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {PALETTE.map(c => (
              <div key={c.hex} className="flex gap-4 items-start p-5 rounded-2xl border border-border bg-white">
                <div className="w-12 h-12 rounded-xl shrink-0 border border-border/50" style={{ backgroundColor: c.hex }} />
                <div>
                  <p className="font-mono text-xs text-muted-foreground">{c.hex}</p>
                  <p className="text-sm font-semibold text-foreground mt-0.5">{c.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">{c.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TYPOGRAPHIE ── */}
      <section className="py-24 bg-secondary/30">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: '#F4521E' }}>Direction artistique — Typographie</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground leading-tight max-w-2xl mb-12">
            Sora + DM Sans —{' '}
            <span className="font-heading italic font-normal">autorité et lisibilité</span>
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl border border-border p-8">
              <p className="text-xs text-muted-foreground uppercase tracking-widest mb-4">Sora — Titres & headings</p>
              <p className="text-5xl font-black leading-tight" style={{ fontFamily: "'Sora', sans-serif", color: '#0F2C3C', letterSpacing: '-1.5px' }}>MARGEZ<br/>PLUS</p>
              <p className="text-xs text-muted-foreground mt-4">Sora Black 900 · tracking -1.5px</p>
              <p className="mt-4 text-sm text-muted-foreground">Utilisé pour les titres hero, H1/H2. Police géométrique semi-condensée — projette sérieux et modernité sans être froide.</p>
            </div>
            <div className="bg-white rounded-2xl border border-border p-8">
              <p className="text-xs text-muted-foreground uppercase tracking-widest mb-4">DM Sans — Corps de texte</p>
              <p className="text-xl font-medium leading-relaxed" style={{ color: '#1C2128' }}>MARGEZ PLUS automatise vos devis, commandes, stocks et marges — en une seule solution.</p>
              <p className="text-xs text-muted-foreground mt-4">DM Sans 400/500 · 16px · line-height 1.8</p>
              <p className="mt-4 text-sm text-muted-foreground">Humaniste sans-serif. Lisibilité maximale pour les décideurs B2B qui lisent vite sur mobile.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── STRUCTURE ── */}
      <section className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: '#F4521E' }}>Structure du site</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground leading-tight max-w-2xl mb-4">
            8 sections —{' '}
            <span className="font-heading italic font-normal">un tunnel de conversion B2B</span>
          </h2>
          <p className="text-muted-foreground mb-12 max-w-xl">
            Chaque section répond à une question implicite du prospect avant qu'il ne la pose.
          </p>
          <div className="divide-y divide-border border-t border-b border-border">
            {SECTIONS_SITE.map((s) => (
              <div key={s.num} className="flex flex-col sm:flex-row sm:items-start gap-4 py-5 hover:bg-secondary/30 transition-colors px-2 -mx-2 rounded-xl">
                <span className="text-xs text-muted-foreground font-mono w-8 shrink-0 pt-0.5">{s.num}</span>
                <h3 className="text-sm font-semibold text-foreground sm:w-56 shrink-0">{s.title}</h3>
                <p className="text-sm text-muted-foreground flex-1 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TRACKING ── */}
      <section className="py-24 bg-secondary/30">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: '#F4521E' }}>Tracking & Automatisation</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground leading-tight max-w-2xl mb-12">
            Mesurer pour{' '}
            <span className="font-heading italic font-normal">améliorer dès le jour 1</span>
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { tool: 'PostHog', detail: 'Heatmaps, session recordings, funnels. 1 semaine après lancement : 20 sessions regardées pour identifier les points de friction.' },
              { tool: 'GA4 + Search Console', detail: 'Trafic, sources, pages les plus visitées. Mots-clés sur lesquels Google indexe le site.' },
              { tool: 'Microsoft Clarity', detail: 'Heatmaps gratuits en double validation. Enregistrement illimité de sessions pour optimisation continue.' },
              { tool: 'LinkedIn Insight Tag', detail: 'Recibler les visiteurs qui ne convertissent pas ET identifier leurs entreprises. Clé pour cibler DSI et dirigeants PME.' },
              { tool: 'Facebook Pixel', detail: '75% des visiteurs repartent sans contact. Le pixel permet de les ré-cibler à faible coût via publicité Meta.' },
              { tool: 'Séquence email automatique', detail: 'J+0 confirmation · J+2 relance sans réponse · J+7/14/30 nurturing avec ressources utiles (facture électronique 2026, etc.)' },
            ].map(item => (
              <div key={item.tool} className="p-6 rounded-2xl border border-border bg-white">
                <p className="text-sm font-bold text-foreground mb-2">{item.tool}</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-6">
          <div className="rounded-3xl bg-foreground p-12 md:p-16 text-center">
            <p className="text-white/40 text-xs uppercase tracking-widest mb-4">Votre projet est le prochain</p>
            <h3 className="text-3xl sm:text-4xl font-bold text-white leading-tight max-w-xl mx-auto">
              Un site qui convertit,{' '}
              <span className="font-heading italic font-normal">pas juste qui existe</span>
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
