'use client'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { motion } from 'framer-motion'

const PROJECTS = [
  { title: 'Vives Reports', tag: 'Site Éditorial · Guide Touristique Rome', href: '/realisations/vives-reports', thumbnail: '/images/realisations/vivesreports-desktop.png', featured: true },
  { title: 'Marine Caro', tag: 'Site Vitrine · Architecte en Provence', href: '/realisations/marine-caro', thumbnail: '/images/realisations/marine-desktop.jpg' },
  { title: 'CADENCE', tag: 'Concept & Site · Studio Multisport', href: '/realisations/cadence', thumbnail: '/images/realisations/cadence-disciplines.png' },
  { title: 'Stoop', tag: 'Site Vitrine · Logistique & Transport', href: '/realisations/stoop', thumbnail: '/images/realisations/stoop-desktop.jpg' },
  { title: 'Sésame Informatique', tag: 'Refonte Site · ERP B2B Négoce', href: '/realisations/sesame-informatique', thumbnail: '/thumbnails/sesame-hero.png' },
  { title: 'Yannis Amielh', tag: 'Portfolio · Mannequin Éditorial', href: '/realisations/yannis-amielh', thumbnail: '/images/realisations/yannis-site-desktop.jpg' },
]

export default function WorkSection() {
  return (
    <section id="work" className="py-28 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-14">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#F4521E' }}>Réalisations</p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground max-w-xl leading-tight">
              Des projets pensés pour{' '}<span className="font-heading italic font-normal text-foreground/50">marquer les esprits</span>
            </h2>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.15 }}>
            <Link href="/realisations" className="inline-flex items-center gap-2 text-foreground/50 hover:text-foreground text-sm font-medium transition-colors group">
              Voir toutes les réalisations <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          </motion.div>
        </div>
        <div className="space-y-6">
          {/* Projet à la une — image (16:10, non coupée) + texte côte à côte */}
          {PROJECTS.filter(p => p.featured).map((project) => (
            <motion.div key={project.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <Link href={project.href} className="group grid md:grid-cols-2 rounded-2xl overflow-hidden border border-border hover:shadow-xl transition-all bg-white">
                <div className="aspect-16/10 overflow-hidden bg-secondary">
                  <img src={project.thumbnail} alt={project.title} className="w-full h-full object-cover object-top group-hover:scale-[1.02] transition-transform duration-700" />
                </div>
                <div className="p-8 md:p-10 flex flex-col justify-center">
                  <span className="self-start text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full text-white mb-4" style={{ backgroundColor: '#F4521E' }}>À la une</span>
                  <p className="font-semibold text-foreground text-2xl md:text-3xl leading-tight">{project.title}</p>
                  <p className="text-sm text-muted-foreground mt-1.5">{project.tag}</p>
                  <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-foreground">
                    Voir le projet <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
          {/* Other projects — 3 cols, style v4 */}
          <div className="grid md:grid-cols-3 gap-6">
            {PROJECTS.filter(p => !p.featured).map((project, i) => (
              <motion.div key={project.title} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group cursor-pointer">
                <Link href={project.href} className="block">
                  <div className="relative overflow-hidden rounded-2xl mb-4 border border-border aspect-16/10">
                    <img src={project.thumbnail} alt={project.title} className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 rounded-2xl" />
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center shadow-lg">
                        <ArrowUpRight className="w-4 h-4 text-foreground" />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-foreground font-semibold text-base">{project.title}</p>
                      <p className="text-muted-foreground text-sm mt-0.5">{project.tag}</p>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-foreground/30 group-hover:text-foreground/70 transition-colors" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
