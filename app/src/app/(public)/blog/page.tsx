import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowUpRight, Clock, Tag } from 'lucide-react'
import { articlesService } from '@/services/supabase.service'

export const metadata: Metadata = {
  title: 'Blog — Stratégie Web & Référencement',
  description: 'Articles et conseils sur la création de sites web, le SEO, l\'automatisation et les tendances digitales.',
  alternates: { canonical: 'https://vivesmedia.com/blog' },
}

const STATIC_ARTICLES = [
  { slug: 'geo-shopify-zero-clic-strategie-2026', categorie: 'Actualité IA & E-commerce', date_pub: '2026-01-25', titre: 'Survivre au Zéro-Clic : Pourquoi le GEO est votre priorité Shopify devant le SEO en 2026', extrait: 'En 2026, 58 % des recherches Google n\'aboutissent à aucun clic. Découvrez comment le GEO permet à votre boutique Shopify de devenir la source de référence citée par les IA.', image_url: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&q=80', tags: 'GEO,Shopify 2026,IA,SEO' },
  { slug: 'automatisation-workflows-site-vitrine-2026', categorie: 'Stratégie Digitale', date_pub: '2026-01-15', titre: 'Pourquoi l\'automatisation et les workflows sont vitaux pour votre site vitrine en 2026', extrait: 'Un site vitrine sans automatisation, c\'est un vendeur qui dort. Découvrez comment les workflows intelligents transforment votre présence en ligne.', image_url: 'https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=800&q=80', tags: 'Automatisation,Site vitrine,IA' },
  { slug: 'design-conversions-psychologie-web', categorie: 'Design & UX', date_pub: '2026-01-05', titre: 'Design & Conversions : La psychologie derrière un site qui vend', extrait: 'Pourquoi certains sites vendent et d\'autres non ? La réponse tient souvent à quelques principes psychologiques fondamentaux appliqués au design.', image_url: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&q=80', tags: 'Design,UX,Conversion' },
]

export default async function BlogPage() {
  let articles = STATIC_ARTICLES as any[]
  try {
    const data = await articlesService.getPublished(20)
    if (data && data.length > 0) articles = data
  } catch {}

  const featured = articles[0]
  const rest = articles.slice(1)

  return (
    <div className="min-h-screen bg-background pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-14">
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#F4521E' }}>Blog</p>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground leading-tight max-w-2xl">
            Stratégie web, SEO &{' '}<span className="italic font-normal">tendances digitales</span>
          </h1>
        </div>

        {featured && (
          <Link href={`/blog/${featured.slug}`} className="group block rounded-3xl overflow-hidden border border-border hover:shadow-lg transition-all mb-10">
            <div className="grid md:grid-cols-2">
              <div className="aspect-[4/3] md:aspect-auto overflow-hidden bg-secondary">
                <img src={featured.image_url} alt={featured.titre} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="p-8 md:p-12 bg-white flex flex-col justify-between">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full bg-secondary text-muted-foreground">{featured.categorie}</span>
                  <h2 className="mt-4 text-2xl md:text-3xl font-bold text-foreground leading-tight">{featured.titre}</h2>
                  <p className="mt-3 text-muted-foreground text-sm leading-relaxed">{featured.extrait}</p>
                </div>
                <div className="mt-8 flex items-center justify-between">
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>{new Date(featured.date_pub).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  </div>
                  <span className="flex items-center gap-1 text-sm font-medium text-foreground group-hover:gap-2 transition-all">Lire l'article <ArrowUpRight className="w-4 h-4" /></span>
                </div>
              </div>
            </div>
          </Link>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rest.map((article) => (
            <Link key={article.slug} href={`/blog/${article.slug}`} className="group rounded-2xl overflow-hidden border border-border bg-white hover:shadow-md transition-all">
              <div className="aspect-[16/9] overflow-hidden bg-secondary">
                <img src={article.image_url} alt={article.titre} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="p-6">
                <span className="text-xs font-medium text-muted-foreground">{article.categorie}</span>
                <h3 className="mt-2 font-semibold text-foreground leading-snug line-clamp-2">{article.titre}</h3>
                <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{article.extrait}</p>
                <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                  <span>{new Date(article.date_pub).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  <ArrowUpRight className="w-4 h-4 group-hover:text-foreground transition-colors" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
