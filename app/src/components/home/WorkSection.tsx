'use client'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { motion } from 'framer-motion'

const PROJECTS = [
  { title: 'Sésame Informatique', tag: 'Refonte Site · ERP B2B Négoce', href: '/realisations/sesame-informatique', thumbnail: '/thumbnails/sesame-hero.png', featured: true },
  { title: 'Vives Reports', tag: 'Site Éditorial · Guide Touristique Rome', href: '/realisations/vives-reports', thumbnail: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/render/image/public/base44-prod/public/69399ee5f49ad57466b051e2/000074367_tourgarbatella-aubinvives_pmvillareal-27.png?width=800&quality=75&format=webp' },
  { title: 'Paul & Louis Sport', tag: 'Site Vitrine · Club Padel', href: '/realisations/paul-et-louis-sport', thumbnail: 'https://media.base44.com/images/public/69f3530cd3a27defe3c78f69/44abc6e41_p1049264-high-o0dyng.png' },
  { title: 'Ecoserre', tag: 'Site Vitrine · Habitat Durable', href: '/realisations/ecoserre', thumbnail: 'https://design-digest-adapt.lovable.app/assets/hero-greenhouse-D5yU2Vvh.jpg' },
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
          {/* Featured project — full width */}
          {PROJECTS.filter(p => p.featured).map((project, i) => (
            <motion.div key={project.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <Link href={project.href} className="group block rounded-2xl overflow-hidden border border-border hover:shadow-xl transition-all">
                <div className="aspect-21/9 overflow-hidden bg-secondary">
                  <img src={project.thumbnail} alt={project.title} className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700" />
                </div>
                <div className="p-5 bg-white flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full text-white" style={{ backgroundColor: '#F4521E' }}>À la une</span>
                    <div>
                      <p className="font-semibold text-foreground text-sm">{project.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{project.tag}</p>
                    </div>
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
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
                  <div className="relative overflow-hidden rounded-2xl mb-4 border border-border aspect-4/3">
                    <img src={project.thumbnail} alt={project.title} className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-105" />
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
