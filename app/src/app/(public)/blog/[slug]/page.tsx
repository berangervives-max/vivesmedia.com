import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowUpRight, ArrowLeft, Clock } from 'lucide-react'
import { articlesService } from '@/services/supabase.service'
import JsonLd from '@/components/seo/JsonLd'
import { breadcrumbSchema, articleSchema, faqSchema, faqFromArticleHtml, SITE_URL } from '@/lib/schema'
import { processArticleHtml, estimateReadingTime } from '@/lib/article-html'
import ReadingProgress from '@/components/blog/ReadingProgress'
import TableOfContents from '@/components/blog/TableOfContents'
import ShareLinks from '@/components/blog/ShareLinks'

// Articles de secours, servis si Supabase est injoignable. Typés explicitement
// (la règle projet est 0 `any`) et alignés sur la table `articles`.
// L'optionalité suit celle de `Article` (src/types/index.ts) pour qu'une ligne
// Supabase reste assignable à cette variable sans cast.
type StaticArticle = {
  slug: string
  titre: string
  extrait?: string
  categorie?: string
  date_pub?: string
  image_url?: string
  contenu?: string
  updated_at?: string
  tags?: string
}

const STATIC: Record<string, StaticArticle> = {
  'geo-shopify-zero-clic-strategie-2026': {
    slug: 'geo-shopify-zero-clic-strategie-2026', titre: 'Survivre au Zéro-Clic : Pourquoi le GEO est votre priorité Shopify devant le SEO en 2026',
    extrait: "En 2026, 58 % des recherches Google n'aboutissent à aucun clic.", categorie: 'Actualité IA & E-commerce', date_pub: '2026-01-25',
    image_url: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=1200&q=80',
    contenu: `<h2>Qu'est-ce que le GEO ?</h2><p>Le SEO classique optimisait des pages pour des algorithmes de classement. Le GEO, lui, optimise votre contenu pour qu'il soit cité par les modèles de langage (LLM).</p><h2>Les 3 piliers techniques pour dominer la recherche IA sur Shopify</h2><h3>1. La suprématie des données structurées (Schema.org)</h3><p>L'IA a besoin de certitudes. Pour apparaître dans la "vitrine" des assistants d'achat, votre boutique doit parler le langage du Google Shopping Graph.</p><h3>2. Le Model Context Protocol (MCP)</h3><p>Avec la mise à jour Shopify Renaissance Edition, l'intégration du protocole MCP devient vitale.</p><h3>3. L'autorité sémantique</h3><p>Les requêtes des utilisateurs sont devenues de véritables conversations. Votre contenu doit répondre à des intentions complexes.</p><h2>Conclusion</h2><p>Le passage au GEO n'est plus une option, c'est une nécessité de survie pour tout marchand Shopify en 2026.</p>`,
  },
  'automatisation-workflows-site-vitrine-2026': {
    slug: 'automatisation-workflows-site-vitrine-2026', titre: "Pourquoi l'automatisation et les workflows sont vitaux pour votre site vitrine en 2026",
    extrait: "Un site vitrine sans automatisation, c'est un vendeur qui dort.", categorie: 'Stratégie Digitale', date_pub: '2026-01-15',
    image_url: 'https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=1200&q=80',
    contenu: `<h2>L'évolution du site vitrine</h2><p>L'intégration de workflows intelligents transforme un support statique en un outil dynamique capable de qualifier vos prospects.</p><h2>Les automations indispensables</h2><ul><li><strong>La gestion des leads</strong> : Envoi automatique d'un guide PDF après inscription.</li><li><strong>La prise de rendez-vous</strong> : Synchronisation directe avec votre calendrier.</li><li><strong>Le nurturing</strong> : Séquence d'e-mails après première prise de contact.</li></ul><h2>Pourquoi c'est nécessaire</h2><p>Une entreprise qui recontacte un prospect dans les 5 minutes a 9 fois plus de chances de conclure la vente.</p>`,
  },
}

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  let article = STATIC[slug]
  try { const data = await articlesService.getBySlug(slug); if (data) article = data } catch {}
  if (!article) return { title: 'Article introuvable' }
  return {
    title: article.titre,
    description: article.extrait,
    alternates: { canonical: `https://vivesmedia.com/blog/${slug}` },
    openGraph: { title: article.titre, description: article.extrait, images: article.image_url ? [article.image_url] : [] },
  }
}

// Maillage interne : on relie chaque article aux pages services pertinentes
// (diffuse l'autorité SEO de l'article vers les pages de conversion).
const SERVICES_LINKS: { slug: string; label: string; kw: string[] }[] = [
  { slug: 'site-vitrine', label: 'Création de site vitrine', kw: ['vitrine', 'site web', 'développeur', 'next', 'landing'] },
  { slug: 'site-ecommerce', label: 'Site e-commerce', kw: ['commerce', 'ecommerce', 'e-commerce', 'boutique', 'vente', 'shopify', 'panier'] },
  { slug: 'seo', label: 'Référencement SEO', kw: ['seo', 'référencement', 'referencement', 'google', 'recherche', 'trafic', 'mots-clés', 'mots cles', 'serp'] },
  { slug: 'visibilite-ia', label: 'Visibilité IA (AEO/GEO)', kw: ['aeo', 'geo', 'chatgpt', 'perplexity', 'visibilité', 'générative', 'generative', 'llm'] },
  { slug: 'crm-automatisation', label: 'CRM & Automatisation IA', kw: ['automat', 'crm', 'workflow', 'n8n', 'pipeline', 'process', 'productivité', 'zapier'] },
  { slug: 'video-contenu-ia', label: 'Vidéo & Contenu IA', kw: ['vidéo', 'video', 'contenu', 'reel', 'social', 'ugc', 'instagram'] },
  { slug: 'formation-ia', label: 'Formation IA', kw: ['formation', 'apprendre', 'tutoriel', 'tuto'] },
  { slug: 'maintenance', label: 'Maintenance & sécurité', kw: ['maintenance', 'sécurité', 'securite', 'mise à jour', 'sauvegarde'] },
]
function relatedServices(a: { titre: string; categorie?: string | null; tags?: string | null }) {
  const hay = `${a.titre} ${a.categorie || ''} ${a.tags || ''}`.toLowerCase()
  const out = SERVICES_LINKS.filter(s => s.kw.some(k => hay.includes(k)))
  for (const slug of ['site-vitrine', 'seo', 'crm-automatisation']) {
    if (out.length >= 3) break
    const f = SERVICES_LINKS.find(s => s.slug === slug)
    if (f && !out.some(o => o.slug === f.slug)) out.push(f)
  }
  return out.slice(0, 4)
}

export default async function BlogArticlePage({ params }: Props) {
  const { slug } = await params
  let article = STATIC[slug]
  try { const data = await articlesService.getBySlug(slug); if (data) article = data } catch {}
  if (!article) notFound()

  // FAQPage généré depuis la section « FAQ » réellement présente dans l'article.
  // Vide si l'article n'en a pas → aucun balisage émis (on ne balise jamais une FAQ
  // invisible pour l'utilisateur). S'applique automatiquement à tous les articles,
  // existants comme futurs, puisque ce fichier est le gabarit partagé.
  const articleFaq = faqFromArticleHtml(article.contenu)
  // headings alimente le sommaire (desktop sticky + accordéon mobile) ; les `id`
  // injectés dans le HTML sont les MÊMES slugs (un seul walk, cf. article-html.ts)
  // donc les ancres #slug pointent toujours sur le bon titre.
  const { html: articleHtml, headings } = processArticleHtml(article.contenu)
  const readingTime = estimateReadingTime(article.contenu)
  const articleUrl = `${SITE_URL}/blog/${slug}`
  const dateLabel = article.date_pub
    ? new Date(article.date_pub).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
    : null

  return (
    <article className="min-h-screen bg-background pb-20">
      <ReadingProgress />
      <JsonLd data={articleSchema({ ...article, slug })} />
      {articleFaq.length > 0 && <JsonLd data={faqSchema(articleFaq)} />}
      <JsonLd data={breadcrumbSchema([
        { name: 'Accueil', url: SITE_URL },
        { name: 'Blog', url: `${SITE_URL}/blog` },
        { name: article.titre, url: articleUrl },
      ])} />

      <div className="max-w-6xl mx-auto px-6">
        {/* Ligne fine : retour + méta — remplit la largeur dès le haut plutôt
            que de laisser la colonne centrale flotter seule sur grand écran. */}
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-b border-border pt-28 pb-6 text-sm">
          <Link href="/blog" className="inline-flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground">
            <ArrowLeft className="w-4 h-4" /> Retour au blog
          </Link>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            {article.categorie && <span className="font-semibold uppercase tracking-wider text-foreground/70">{article.categorie}</span>}
            {article.categorie && dateLabel && <span aria-hidden="true">·</span>}
            {dateLabel && <span>{dateLabel}</span>}
            <span aria-hidden="true">·</span>
            <span className="inline-flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {readingTime} min de lecture</span>
          </div>
        </div>

        {/* Titre — pleine largeur, au-dessus du bloc image+chapô */}
        <h1 className="max-w-4xl pt-10 pb-8 text-3xl font-bold leading-[1.1] tracking-tight text-foreground sm:text-4xl lg:text-[2.75rem]">
          {article.titre}
        </h1>

        {/* Hero en 2 blocs : image contenue + chapô/byline/partage à côté,
            plutôt qu'image pleine largeur puis texte dessous — remplit la
            largeur du haut de page sans bleed ni carte (cf. recherche
            concurrentielle blog-article-deep/SYNTHESE.md, pattern B/C). */}
        <div className="grid gap-8 pb-14 md:grid-cols-2 md:gap-12 md:items-center lg:pb-16">
          <div className={article.image_url ? 'order-2 md:order-1' : 'order-1 md:col-span-2'}>
            {article.image_url && (
              <div className="aspect-[4/3] overflow-hidden rounded-2xl border border-border">
                <img src={article.image_url} alt={article.titre} className="h-full w-full object-cover" />
              </div>
            )}
          </div>
          <div className={article.image_url ? 'order-1 md:order-2' : 'order-2'}>
            {article.extrait && (
              <p className="text-lg leading-relaxed text-muted-foreground">{article.extrait}</p>
            )}
            <div className="mt-6 flex items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-foreground text-xs font-semibold text-white">BV</span>
              <div className="text-sm">
                <p className="font-semibold text-foreground">Béranger Vives</p>
                <p className="text-muted-foreground">Fondateur, vivesmedia.com</p>
              </div>
            </div>
            <div className="mt-6">
              <ShareLinks url={articleUrl} title={article.titre} />
            </div>
          </div>
        </div>

        {/* Sommaire mobile — encart dépliable entre le hero et le corps de
            texte (jamais une sidebar identique réduite : sur les 10 sites
            étudiés, aucun ne garde la sidebar telle quelle en mobile).
            Masqué sous 3 titres : pas assez de structure pour justifier un
            sommaire, cf. pattern Attio/Ahrefs. */}
        {headings.length >= 3 && (
          <details className="group mb-10 border-y border-border py-1 lg:hidden">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-3 select-none">
              <span className="text-sm font-semibold text-foreground">Sommaire</span>
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-border text-lg leading-none text-muted-foreground transition-transform group-open:rotate-45">+</span>
            </summary>
            <div className="pb-4">
              <TableOfContents headings={headings} />
            </div>
          </details>
        )}

        {/* Corps de l'article + sommaire sticky (desktop uniquement).
            La mesure de lecture (--measure, 550px) reste gérée par
            .article-content dans globals.css : ici on ne fixe que la largeur
            de la CELLULE de grille, pas celle du texte. */}
        <div className="grid grid-cols-1 gap-x-16 gap-y-10 lg:grid-cols-[minmax(0,1fr)_280px]">
          {/* La mise en forme vit dans .article-content (globals.css) : le HTML
              vient de Supabase sans aucune classe, il faut donc styler les balises
              elles-mêmes. Les classes `prose`/`prose-lg` qui étaient ici étaient
              mortes (@tailwindcss/typography n'est pas installé). */}
          <div className="article-content" dangerouslySetInnerHTML={{ __html: articleHtml }} />

          <aside className="hidden lg:block">
            <div className="sticky top-28">
              {headings.length >= 2 && (
                <>
                  <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Sommaire</p>
                  <TableOfContents headings={headings} />
                </>
              )}
              <div className={headings.length >= 2 ? 'mt-8 border-t border-border pt-6' : ''}>
                <p className="mb-1.5 text-sm font-semibold text-foreground">Un projet en tête ?</p>
                <p className="mb-4 text-sm leading-relaxed text-muted-foreground">Devis gratuit sous 24h, sans engagement.</p>
                <Link href="/contact" className="group inline-flex items-center gap-1.5 text-sm font-semibold text-foreground">
                  Demander un devis
                  <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
              </div>
            </div>
          </aside>
        </div>

        {/* Maillage interne — diffuse l'autorité de l'article vers les pages services.
            Liste divisée par filets, pas de cards (doctrine éditoriale du site). */}
        <div className="mt-16 border-t border-border pt-10">
          <p className="mb-4 text-xs font-semibold uppercase tracking-widest" style={{ color: '#FF6B00' }}>Aller plus loin</p>
          <h2 className="mb-2 text-xl font-bold text-foreground">Les services liés à cet article</h2>
          <div className="mt-4 border-t border-border">
            {relatedServices(article).map((s) => (
              <Link key={s.slug} href={`/services/${s.slug}`}
                className="group flex items-center justify-between border-b border-border py-4 transition-colors">
                <span className="text-sm font-semibold text-foreground">{s.label}</span>
                <ArrowUpRight className="w-4 h-4 shrink-0 text-muted-foreground transition-colors group-hover:text-foreground" />
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-10 pt-10">
          <div className="rounded-2xl bg-foreground p-8 text-center md:p-12">
            <h3 className="mb-2 text-xl font-bold text-white">Prêt à transformer votre présence en ligne ?</h3>
            <p className="mb-6 text-sm text-white/70">Devis gratuit sous 24h — sans engagement.</p>
            <Link href="/contact" className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-white/90">
              Demander un devis <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </article>
  )
}
