import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { getPublishedRealisationsData } from '@/services/supabase.service'

export const metadata: Metadata = {
  title: 'Réalisations — Projets web sur-mesure',
  description: 'Découvrez nos réalisations : sites vitrines, e-commerce, guides touristiques. Chaque projet pensé pour convertir.',
  alternates: { canonical: 'https://vivesmedia.com/realisations' },
}

// Permet aux réalisations ajoutées depuis le back-office d'apparaître sans rebuild.
export const revalidate = 60

type ProjectCard = { num: string; name: string; type: string; year: string; href: string; img: string; tags: string[]; featured?: boolean }

const PROJECTS: ProjectCard[] = [
  { num: '01', name: 'Stoop', type: 'Site Vitrine · Logistique & Transport', year: '2026', href: '/realisations/stoop', img: '/images/realisations/stoop-desktop.jpg', tags: ['Site Vitrine', 'Direction Artistique', 'SEO'], featured: true },
  { num: '07', name: 'Sésame Informatique', type: 'Refonte Site · ERP B2B Négoce', year: '2025', href: '/realisations/sesame-informatique', img: '/thumbnails/sesame-hero.png', tags: ['B2B', 'ERP', 'Framer', 'Conversion'] },
  { num: '02', name: 'Yannis Amielh', type: 'Portfolio · Mannequin Éditorial', year: '2026', href: '/realisations/yannis-amielh', img: '/images/realisations/yannis-amielh-desktop.jpg', tags: ['Portfolio', 'Direction Artistique', '3D'] },
  { num: '03', name: 'Vives Reports', type: 'Site Éditorial · Guide Touristique Rome', year: '2022', href: '/realisations/vives-reports', img: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/render/image/public/base44-prod/public/69399ee5f49ad57466b051e2/000074367_tourgarbatella-aubinvives_pmvillareal-27.png?width=800&quality=75&format=webp', tags: ['Éditorial', 'SEO', 'React'] },
  { num: '04', name: 'Paul & Louis Sport', type: 'Site Vitrine · Club Padel', year: '2024', href: '/realisations/paul-et-louis-sport', img: 'https://media.base44.com/images/public/69f3530cd3a27defe3c78f69/44abc6e41_p1049264-high-o0dyng.png', tags: ['Site Vitrine', 'Sport', 'Design'] },
  { num: '05', name: 'Ecoserre', type: 'Site Vitrine · Habitat Durable', year: '2024', href: '/realisations/ecoserre', img: 'https://design-digest-adapt.lovable.app/assets/hero-greenhouse-D5yU2Vvh.jpg', tags: ['Site Vitrine', 'Green', 'SEO'] },
  { num: '06', name: 'Wood Design', type: 'Site Catalogue · Artisan Bois', year: '2024', href: '/realisations/wood-design', img: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800&q=80', tags: ['Catalogue', 'Artisan', 'Design'] },
]

export default async function RealisationsPage() {
  // Réalisations du back-office (publiées), mappées en cartes et ajoutées à la grille.
  const dbRealisations = await getPublishedRealisationsData()
  const dbCards: ProjectCard[] = dbRealisations
    .filter(r => !PROJECTS.some(p => p.href === `/realisations/${r.slug}`))
    .map((r, i) => ({
      num: String(PROJECTS.length + i + 1).padStart(2, '0'),
      name: r.name,
      type: r.type,
      year: r.year,
      href: `/realisations/${r.slug}`,
      img: r.heroImage,
      tags: r.tags.slice(0, 3),
    }))
  const allProjects: ProjectCard[] = [...PROJECTS, ...dbCards]

  return (
    <div className="min-h-screen bg-background pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-16">
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#F4521E' }}>Réalisations</p>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground leading-tight max-w-2xl">
            Des projets pensés pour <span className="italic font-normal">marquer les esprits</span>
          </h1>
          <p className="mt-4 text-muted-foreground max-w-xl">Chaque projet est unique. Voici une sélection de sites conçus et développés de A à Z.</p>
        </div>

        {/* Featured project — full width */}
        {allProjects.filter(p => p.featured).map((project) => (
          <Link key={project.num} href={project.href} className="group block rounded-3xl overflow-hidden border border-border hover:shadow-xl transition-all duration-300 mb-8">
            <div className="aspect-21/9 overflow-hidden bg-secondary">
              <img src={project.img} alt={project.name} className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700" />
            </div>
            <div className="p-6 bg-white">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full text-white shrink-0" style={{ backgroundColor: '#F4521E' }}>Dernier projet</span>
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">{project.type} · {project.year}</p>
                    <h3 className="text-xl font-bold text-foreground">{project.name}</h3>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0 ml-4">
                  <div className="hidden sm:flex gap-2 flex-wrap justify-end">
                    {project.tags.map(tag => <span key={tag} className="text-xs px-2.5 py-1 rounded-full bg-secondary text-muted-foreground">{tag}</span>)}
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                </div>
              </div>
            </div>
          </Link>
        ))}

        {/* Other projects — 2-col grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-20">
          {allProjects.filter(p => !p.featured).map((project) => (
            <Link key={project.num} href={project.href} className="group block rounded-3xl overflow-hidden border border-border hover:shadow-xl transition-all duration-300">
              <div className="aspect-16/10 overflow-hidden bg-secondary">
                <img src={project.img} alt={project.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              </div>
              <div className="p-6 bg-white">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">{project.type} · {project.year}</p>
                    <h3 className="text-xl font-bold text-foreground">{project.name}</h3>
                    <div className="flex gap-2 mt-3 flex-wrap">
                      {project.tags.map(tag => <span key={tag} className="text-xs px-2.5 py-1 rounded-full bg-secondary text-muted-foreground">{tag}</span>)}
                    </div>
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors mt-1" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="rounded-2xl bg-foreground p-10 text-center">
          <h3 className="text-2xl font-bold text-white mb-3">Votre projet sera le prochain</h3>
          <p className="text-white/60 mb-6">Devis gratuit sous 24h, sans engagement.</p>
          <Link href="/contact" className="inline-flex items-center gap-2 bg-white text-foreground font-semibold px-8 py-4 rounded-full hover:bg-white/90 transition-all">
            Lancer mon projet <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}
