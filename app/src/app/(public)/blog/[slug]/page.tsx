import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowUpRight, ArrowLeft } from 'lucide-react'
import { articlesService } from '@/services/supabase.service'
import JsonLd from '@/components/seo/JsonLd'
import { breadcrumbSchema, SITE_URL } from '@/lib/schema'

const STATIC: Record<string, any> = {
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

  return (
    <article className="min-h-screen bg-background pt-28 pb-20">
      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: article.titre,
        description: article.extrait,
        ...(article.image_url ? { image: article.image_url } : {}),
        datePublished: article.date_pub,
        dateModified: article.date_pub,
        url: `${SITE_URL}/blog/${slug}`,
        ...(article.categorie ? { articleSection: article.categorie } : {}),
        inLanguage: 'fr-FR',
        author: { '@type': 'Person', name: 'Béranger Vives' },
        publisher: { '@id': `${SITE_URL}/#organization` },
        mainEntityOfPage: { '@type': 'WebPage', '@id': `${SITE_URL}/blog/${slug}` },
      }} />
      <JsonLd data={breadcrumbSchema([
        { name: 'Accueil', url: SITE_URL },
        { name: 'Blog', url: `${SITE_URL}/blog` },
        { name: article.titre, url: `${SITE_URL}/blog/${slug}` },
      ])} />
      <div className="max-w-3xl mx-auto px-6">
        <Link href="/blog" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" /> Retour au blog
        </Link>
        <div className="mb-6">
          <span className="text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full bg-secondary text-muted-foreground">{article.categorie}</span>
          <p className="mt-3 text-xs text-muted-foreground">{new Date(article.date_pub).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground leading-tight mb-6">{article.titre}</h1>
        <p className="text-lg text-muted-foreground leading-relaxed mb-10 pb-10 border-b border-border">{article.extrait}</p>
        {article.image_url && (
          <div className="rounded-2xl overflow-hidden mb-10">
            <img src={article.image_url} alt={article.titre} className="w-full h-auto object-cover" />
          </div>
        )}
        <div className="prose prose-lg max-w-none text-foreground [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mt-10 [&_h2]:mb-4 [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:mt-6 [&_h3]:mb-3 [&_p]:text-muted-foreground [&_p]:leading-relaxed [&_p]:mb-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:text-muted-foreground [&_li]:mb-2"
          dangerouslySetInnerHTML={{ __html: article.contenu || '' }} />
        {/* Maillage interne — diffuse l'autorité de l'article vers les pages services */}
        <div className="mt-14 pt-10 border-t border-border">
          <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: '#F4521E' }}>Aller plus loin</p>
          <h2 className="text-xl font-bold text-foreground mb-5">Les services liés à cet article</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {relatedServices(article).map((s) => (
              <Link key={s.slug} href={`/services/${s.slug}`}
                className="group flex items-center justify-between rounded-xl border border-border bg-white px-5 py-4 transition-colors hover:border-foreground/30">
                <span className="text-sm font-semibold text-foreground">{s.label}</span>
                <ArrowUpRight className="w-4 h-4 text-muted-foreground transition-colors group-hover:text-foreground" />
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-10 pt-10 border-t border-border">
          <div className="rounded-2xl bg-foreground p-8 text-center">
            <h3 className="text-xl font-bold text-white mb-2">Prêt à transformer votre présence en ligne ?</h3>
            <p className="text-white/70 text-sm mb-6">Devis gratuit sous 24h — sans engagement.</p>
            <Link href="/contact" className="inline-flex items-center gap-2 bg-white text-foreground font-semibold px-6 py-3 rounded-full hover:bg-white/90 transition-colors text-sm">
              Demander un devis <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </article>
  )
}
