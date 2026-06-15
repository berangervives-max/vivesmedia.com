'use client'
import { useState } from 'react'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'

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

/** Page Réalisations : barre de filtres par secteur + grille filtrée. */
export default function RealisationsBrowser({ projects }: { projects: ProjectCard[] }) {
  const secteurs = ['Tous', ...Array.from(new Set(projects.map(p => p.secteur)))]
  const [actif, setActif] = useState('Tous')

  const filtered = actif === 'Tous' ? projects : projects.filter(p => p.secteur === actif)
  // Le projet "à la une" n'est mis en avant que sur la vue globale.
  const featured = actif === 'Tous' ? filtered.find(p => p.featured) : undefined
  const grid = featured ? filtered.filter(p => p !== featured) : filtered

  return (
    <>
      {/* Filtres par secteur */}
      <div className="flex flex-wrap gap-2 mb-12">
        {secteurs.map(s => (
          <button
            key={s}
            onClick={() => setActif(s)}
            className={`text-sm px-4 py-2 rounded-full border transition-colors ${
              actif === s
                ? 'bg-foreground text-white border-foreground'
                : 'border-border text-muted-foreground hover:text-foreground hover:border-foreground/40'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Projet à la une — pleine largeur */}
      {featured && (
        <Link href={featured.href} className="group block rounded-3xl overflow-hidden border border-border hover:shadow-xl transition-all duration-300 mb-8">
          <div className="aspect-21/9 overflow-hidden bg-secondary">
            <img src={featured.img} alt={featured.name} className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700" />
          </div>
          <div className="p-6 bg-white">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full text-white shrink-0" style={{ backgroundColor: '#F4521E' }}>Dernier projet</span>
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">{featured.type} · {featured.year}</p>
                  <h3 className="text-xl font-bold text-foreground">{featured.name}</h3>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0 ml-4">
                <div className="hidden sm:flex gap-2 flex-wrap justify-end">
                  {featured.tags.map(tag => <span key={tag} className="text-xs px-2.5 py-1 rounded-full bg-secondary text-muted-foreground">{tag}</span>)}
                </div>
                <ArrowUpRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
              </div>
            </div>
          </div>
        </Link>
      )}

      {/* Grille — 2 colonnes */}
      <div className="grid md:grid-cols-2 gap-8 mb-20">
        {grid.map(project => (
          <Link key={project.href} href={project.href} className="group block rounded-3xl overflow-hidden border border-border hover:shadow-xl transition-all duration-300">
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
    </>
  )
}
