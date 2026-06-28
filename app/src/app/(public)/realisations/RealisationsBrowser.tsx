'use client'
import { useState } from 'react'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export type ProjectCard = {
  num: string
  name: string
  type: string
  year: string
  href: string
  img: string
  tags: string[]
  featured?: boolean
  secteur: string
}

const ease = [0.22, 1, 0.36, 1] as const

/** Carte projet immersive : screenshot plein cadre, dégradé + infos lisibles,
 *  zoom + révélation (tags / « Voir le projet ») au survol. */
function ProjectTile({ p, index, big = false }: { p: ProjectCard; index: number; big?: boolean }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, delay: index * 0.07, ease }}
    >
      <Link
        href={p.href}
        className={`group relative block w-full overflow-hidden rounded-3xl bg-secondary ${big ? 'aspect-[16/10] sm:aspect-[16/9]' : 'aspect-[16/10]'}`}
      >
        <img
          src={p.img}
          alt={`Projet ${p.name} — ${p.type}`}
          className="absolute inset-0 h-full w-full object-cover object-top transition-transform duration-[900ms] ease-out group-hover:scale-[1.06]"
        />
        {/* Dégradé permanent (lisibilité du titre) + renfort au survol */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent transition-opacity duration-500" />
        <div className="absolute inset-0 bg-black/0 transition-colors duration-500 group-hover:bg-black/10" />

        {/* Index éditorial */}
        <span className="absolute left-6 top-5 font-mono text-xs text-white/50">{p.num}</span>

        {/* Badge projet phare */}
        {p.featured && (
          <span className="absolute right-5 top-5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-white" style={{ backgroundColor: '#F4521E' }}>
            Dernier projet
          </span>
        )}

        {/* Pastille flèche qui apparaît au survol (sauf sur le projet phare qui a déjà un badge) */}
        {!p.featured && (
          <span className="absolute right-5 top-5 flex h-10 w-10 translate-y-1 items-center justify-center rounded-full bg-white opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
            <ArrowUpRight className="h-4 w-4 text-foreground" />
          </span>
        )}

        {/* Bloc infos en bas */}
        <div className="absolute inset-x-0 bottom-0 p-6 md:p-7">
          <p className="mb-1 text-xs text-white/70">{p.type} · {p.year}</p>
          <h3 className={`font-bold leading-tight text-white ${big ? 'text-3xl md:text-4xl' : 'text-2xl'}`}>{p.name}</h3>

          {/* Tags + CTA : révélés en douceur au survol (toujours visibles tactile via max-height) */}
          <div className="mt-3 flex items-center gap-3 overflow-hidden">
            <div className="flex flex-wrap gap-2 opacity-90">
              {p.tags.map((tag) => (
                <span key={tag} className="rounded-full bg-white/15 px-2.5 py-1 text-[11px] text-white backdrop-blur-sm">{tag}</span>
              ))}
            </div>
            <span className="ml-auto hidden shrink-0 items-center gap-1.5 text-sm font-semibold text-white opacity-0 transition-all duration-500 group-hover:opacity-100 sm:flex">
              Voir le projet <ArrowUpRight className="h-4 w-4" />
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

/** Page Réalisations : filtres par secteur + grille immersive. */
export default function RealisationsBrowser({ projects }: { projects: ProjectCard[] }) {
  const secteurs = ['Tous', ...Array.from(new Set(projects.map((p) => p.secteur)))]
  const [actif, setActif] = useState('Tous')

  const filtered = actif === 'Tous' ? projects : projects.filter((p) => p.secteur === actif)
  const featured = actif === 'Tous' ? filtered.find((p) => p.featured) : undefined
  const grid = featured ? filtered.filter((p) => p !== featured) : filtered

  return (
    <>
      {/* Filtres par secteur */}
      <div className="mb-10 flex flex-wrap gap-2">
        {secteurs.map((s) => (
          <button
            key={s}
            onClick={() => setActif(s)}
            className={`rounded-full border px-4 py-2 text-sm transition-colors ${
              actif === s
                ? 'border-foreground bg-foreground text-white'
                : 'border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Projet à la une — pleine largeur */}
      {featured && (
        <div className="mb-8">
          <ProjectTile p={featured} index={0} big />
        </div>
      )}

      {/* Grille immersive — 2 colonnes */}
      <motion.div layout className="mb-20 grid gap-6 md:grid-cols-2">
        <AnimatePresence mode="popLayout">
          {grid.map((project, i) => (
            <ProjectTile key={project.href} p={project} index={i} />
          ))}
        </AnimatePresence>
      </motion.div>
    </>
  )
}
