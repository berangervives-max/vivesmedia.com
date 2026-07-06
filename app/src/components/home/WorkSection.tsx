'use client'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { motion } from 'framer-motion'
import ProjectCardMagazine, { type MagazineCard } from '@/components/realisations/ProjectCardMagazine'

const PROJECTS: MagazineCard[] = [
  { name: 'Vives Reports', type: 'Site Éditorial · Guide Touristique Rome', year: '2022', href: '/realisations/vives-reports', img: '/images/realisations/vivesreports-desktop.png', tags: ['Éditorial', 'SEO', 'React'], featured: true },
  { num: '01', name: 'Marine Caro', type: 'Site Vitrine · Architecte en Provence', year: '2026', href: '/realisations/marine-caro', img: '/images/realisations/marine-desktop.jpg', tags: ['Site Vitrine', 'Architecture', 'SEO'] },
  { num: '02', name: 'CADENCE', type: 'Concept & Site · Studio Multisport', year: '2026', href: '/realisations/cadence', img: '/images/realisations/cadence-desktop.png', tags: ['Concept', 'Direction Artistique', 'Sport'] },
  { num: '03', name: 'Stoop', type: 'Site Vitrine · Logistique & Transport', year: '2026', href: '/realisations/stoop', img: '/images/realisations/stoop-desktop.jpg', tags: ['Site Vitrine', 'Direction Artistique', 'SEO'] },
  { num: '04', name: 'Sésame Informatique', type: 'Refonte Site · ERP B2B Négoce', year: '2025', href: '/realisations/sesame-informatique', img: '/thumbnails/sesame-hero.png', tags: ['B2B', 'ERP', 'Refonte'] },
  { num: '05', name: 'Yannis Amielh', type: 'Portfolio · Mannequin Éditorial', year: '2026', href: '/realisations/yannis-amielh', img: '/images/realisations/yannis-site-desktop.jpg', tags: ['Portfolio', 'Direction Artistique', '3D'] },
]

export default function WorkSection() {
  const featured = PROJECTS.find((p) => p.featured)
  const rest = PROJECTS.filter((p) => !p.featured)

  return (
    <section id="work" className="bg-white py-28">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-14 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest" style={{ color: '#F4521E' }}>Réalisations</p>
            <h2 className="max-w-xl text-3xl font-bold leading-tight text-foreground sm:text-4xl md:text-5xl">
              Des projets pensés pour{' '}<span className="font-heading italic font-normal text-foreground/50">marquer les esprits</span>
            </h2>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.15 }}>
            <Link href="/realisations" className="group inline-flex items-center gap-2 text-sm font-medium text-foreground/50 transition-colors hover:text-foreground">
              Voir toutes les réalisations <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </motion.div>
        </div>

        {/* Projet à la une — grand format côte à côte */}
        {featured && (
          <div className="mb-16">
            <ProjectCardMagazine p={featured} index={0} big />
          </div>
        )}

        {/* Grille éditoriale — 3 colonnes */}
        <div className="grid gap-x-8 gap-y-12 md:grid-cols-3">
          {rest.map((project, i) => (
            <ProjectCardMagazine key={project.href} p={project} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
