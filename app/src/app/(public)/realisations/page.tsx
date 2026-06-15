import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { getPublishedRealisationsData } from '@/services/supabase.service'
import RealisationsBrowser, { type ProjectCard } from './RealisationsBrowser'

export const metadata: Metadata = {
  title: 'Réalisations — Projets web sur-mesure',
  description: 'Découvrez nos réalisations par secteur : architecture, sport, tourisme, habitat, artisanat, tech B2B. Chaque projet pensé pour convertir.',
  alternates: { canonical: 'https://vivesmedia.com/realisations' },
}

// Permet aux réalisations ajoutées depuis le back-office d'apparaître sans rebuild.
export const revalidate = 60

// Projet mis en avant (pleine largeur). Choix éditorial gardé en code.
const FEATURED_SLUGS = ['marine-caro']

// Secteur d'activité par projet (sert au filtre « Parcourir par secteur »).
const SECTEUR_PAR_SLUG: Record<string, string> = {
  'marine-caro': 'Architecture',
  'stoop': 'Transport & Logistique',
  'sesame-informatique': 'Tech & B2B',
  'yannis-amielh': 'Mode & Portfolio',
  'vives-reports': 'Tourisme & Éditorial',
  'paul-et-louis-sport': 'Sport & Loisirs',
  'ecoserre': 'Habitat & Éco',
  'wood-design': 'Artisanat & Commerce',
}
const secteurDe = (slug: string) => SECTEUR_PAR_SLUG[slug] ?? 'Autres'

// Secours si la base est vide/indisponible.
const FALLBACK_PROJECTS: ProjectCard[] = [
  { num: '01', name: 'Marine Caro', type: 'Site Vitrine · Architecte en Provence', year: '2026', href: '/realisations/marine-caro', img: '/images/realisations/marine-desktop.jpg', tags: ['Site Vitrine', 'Architecture', 'SEO'], featured: true, secteur: 'Architecture' },
  { num: '02', name: 'Stoop', type: 'Site Vitrine · Logistique & Transport', year: '2026', href: '/realisations/stoop', img: '/images/realisations/stoop-desktop.jpg', tags: ['Site Vitrine', 'Direction Artistique', 'SEO'], secteur: 'Transport & Logistique' },
  { num: '03', name: 'Sésame Informatique', type: 'Refonte Site · ERP B2B Négoce', year: '2025', href: '/realisations/sesame-informatique', img: '/thumbnails/sesame-hero.png', tags: ['B2B', 'ERP', 'Framer'], secteur: 'Tech & B2B' },
  { num: '04', name: 'Yannis Amielh', type: 'Portfolio · Mannequin Éditorial', year: '2026', href: '/realisations/yannis-amielh', img: '/images/realisations/yannis-site-desktop.jpg', tags: ['Portfolio', 'Direction Artistique', '3D'], secteur: 'Mode & Portfolio' },
  { num: '05', name: 'Vives Reports', type: 'Site Éditorial · Guide Touristique Rome', year: '2022', href: '/realisations/vives-reports', img: '/images/realisations/vivesreports-desktop.png', tags: ['Éditorial', 'SEO', 'React'], secteur: 'Tourisme & Éditorial' },
  { num: '06', name: 'Paul & Louis Sport', type: 'Site Vitrine · Club Padel', year: '2024', href: '/realisations/paul-et-louis-sport', img: 'https://media.base44.com/images/public/69f3530cd3a27defe3c78f69/44abc6e41_p1049264-high-o0dyng.png', tags: ['Site Vitrine', 'Sport', 'Design'], secteur: 'Sport & Loisirs' },
  { num: '07', name: 'Ecoserre', type: 'Site Vitrine · Habitat Durable', year: '2024', href: '/realisations/ecoserre', img: '/images/realisations/ecoserre-desktop.png', tags: ['Site Vitrine', 'Green', 'SEO'], secteur: 'Habitat & Éco' },
  { num: '08', name: 'Wood Design', type: 'Site Catalogue · Artisan Bois', year: '2024', href: '/realisations/wood-design', img: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800&q=80', tags: ['Catalogue', 'Artisan', 'Design'], secteur: 'Artisanat & Commerce' },
]

export default async function RealisationsPage() {
  // La base (back-office /cms) pilote l'affichage et l'ordre (champ `ordre`).
  const dbRealisations = await getPublishedRealisationsData()
  const allProjects: ProjectCard[] = dbRealisations.length > 0
    ? dbRealisations.map((r, i) => ({
        num: String(i + 1).padStart(2, '0'),
        name: r.name,
        type: r.type,
        year: r.year,
        href: `/realisations/${r.slug}`,
        img: r.heroImage,
        tags: r.tags.slice(0, 3),
        featured: FEATURED_SLUGS.includes(r.slug),
        secteur: secteurDe(r.slug),
      }))
    : FALLBACK_PROJECTS

  return (
    <div className="min-h-screen bg-background pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-12">
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#F4521E' }}>Réalisations</p>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground leading-tight max-w-2xl">
            Des projets pensés pour <span className="italic font-normal">marquer les esprits</span>
          </h1>
          <p className="mt-4 text-muted-foreground max-w-xl">Chaque projet est unique. Filtrez par secteur d'activité pour explorer nos réalisations.</p>
        </div>

        <RealisationsBrowser projects={allProjects} />

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
