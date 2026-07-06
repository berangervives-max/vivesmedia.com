'use client'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { motion } from 'framer-motion'

const ease = [0.22, 1, 0.36, 1] as const

export type MagazineCard = {
  name: string
  type: string
  year?: string
  tags?: string[]
  img: string
  href: string
  num?: string
  featured?: boolean
}

/** Chip de tag façon magazine : petit point orange + libellé. */
function Tag({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-1 text-[11px] leading-none text-muted-foreground">
      <span className="h-1 w-1 rounded-full" style={{ backgroundColor: '#F4521E' }} />
      {label}
    </span>
  )
}

/**
 * Vignette éditoriale « carte magazine ».
 * L'image est ENCADRÉE (marge interne : elle respire, jamais en bord perdu),
 * et les métadonnées (nom serif italique · type · année · tags) sont posées
 * dessous comme une légende de magazine. Inspiration : Locomotive.
 */
export default function ProjectCardMagazine({
  p,
  index = 0,
  big = false,
}: {
  p: MagazineCard
  index?: number
  big?: boolean
}) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, delay: index * 0.07, ease }}
    >
      <Link href={p.href} className={`group block ${big ? 'grid items-center gap-8 md:grid-cols-2 lg:gap-12' : ''}`}>
        {/* ── Cadre image (marge interne = l'image respire) ── */}
        <div className="rounded-[1.7rem] border border-border bg-card p-2.5 transition-all duration-500 group-hover:-translate-y-1 group-hover:shadow-[0_24px_60px_-24px_rgba(18,18,18,0.28)]">
          <div className={`relative overflow-hidden rounded-[1.25rem] bg-secondary ${big ? 'aspect-[16/10] sm:aspect-[16/9]' : 'aspect-[16/10]'}`}>
            <img
              src={p.img}
              alt={`${p.name} — ${p.type}`}
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover object-top transition-transform duration-[900ms] ease-out group-hover:scale-[1.04]"
            />
            {/* Voile discret au survol pour la profondeur */}
            <div className="absolute inset-0 bg-foreground/0 transition-colors duration-500 group-hover:bg-foreground/[0.04]" />

            {/* Index éditorial */}
            {p.num && (
              <span className="absolute left-4 top-3.5 rounded-full bg-card/85 px-2 py-0.5 font-mono text-[11px] text-muted-foreground backdrop-blur-sm">
                {p.num}
              </span>
            )}

            {/* Badge dernier projet */}
            {p.featured && (
              <span
                className="absolute right-4 top-3.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-white"
                style={{ backgroundColor: '#F4521E' }}
              >
                Dernier projet
              </span>
            )}

            {/* Pastille flèche au survol (si pas de badge) */}
            {!p.featured && (
              <span className="absolute right-4 top-3.5 flex h-9 w-9 translate-y-1 items-center justify-center rounded-full bg-white opacity-0 shadow-lg transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                <ArrowUpRight className="h-4 w-4 text-foreground" />
              </span>
            )}
          </div>
        </div>

        {/* ── Légende éditoriale ── */}
        <div className={big ? '' : 'px-1.5 pt-5'}>
          <div className="flex items-baseline justify-between gap-4">
            <h3 className={`font-heading italic leading-tight text-foreground ${big ? 'text-3xl sm:text-4xl lg:text-5xl' : 'text-2xl'}`}>
              {p.name}
            </h3>
            {p.year && <span className="shrink-0 font-mono text-xs text-muted-foreground">{p.year}</span>}
          </div>
          <p className={`mt-1.5 text-muted-foreground ${big ? 'text-base' : 'text-sm'}`}>{p.type}</p>

          {p.tags && p.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {p.tags.map((t) => (
                <Tag key={t} label={t} />
              ))}
            </div>
          )}

          <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-foreground">
            Voir le projet
            <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </span>
        </div>
      </Link>
    </motion.article>
  )
}
