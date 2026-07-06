'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ProjectCardMagazine from '@/components/realisations/ProjectCardMagazine'

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

/** Page Réalisations : filtres par secteur + grille éditoriale « carte magazine ». */
export default function RealisationsBrowser({ projects }: { projects: ProjectCard[] }) {
  const secteurs = ['Tous', ...Array.from(new Set(projects.map((p) => p.secteur)))]
  const [actif, setActif] = useState('Tous')

  const filtered = actif === 'Tous' ? projects : projects.filter((p) => p.secteur === actif)
  const featured = actif === 'Tous' ? filtered.find((p) => p.featured) : undefined
  const grid = featured ? filtered.filter((p) => p !== featured) : filtered

  return (
    <>
      {/* Filtres par secteur */}
      <div className="mb-12 flex flex-wrap gap-2">
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
        <div className="mb-14">
          <ProjectCardMagazine p={featured} index={0} big />
        </div>
      )}

      {/* Grille éditoriale — 2 colonnes */}
      <motion.div layout className="mb-20 grid gap-x-8 gap-y-14 md:grid-cols-2">
        <AnimatePresence mode="popLayout">
          {grid.map((project, i) => (
            <ProjectCardMagazine key={project.href} p={project} index={i} />
          ))}
        </AnimatePresence>
      </motion.div>
    </>
  )
}
