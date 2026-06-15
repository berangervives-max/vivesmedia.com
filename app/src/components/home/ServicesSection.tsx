'use client'
import Link from 'next/link'
import { ArrowUpRight, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'

type Service = {
  num: string
  slug: string
  title: string
  price: string
  badge?: string
}

type ServiceGroup = {
  label: string
  services: Service[]
}

const GROUPS: ServiceGroup[] = [
  {
    label: 'Créer',
    services: [
      { num: '01', slug: 'site-ecommerce', title: 'Site E-Commerce', price: 'dès 3 840€ ou 149€/mois', badge: 'Populaire' },
      { num: '02', slug: 'site-vitrine', title: 'Site Vitrine', price: 'dès 1 800€ ou 89€/mois' },
      { num: '03', slug: 'site-catalogue', title: 'Site Catalogue', price: 'dès 2 740€' },
    ],
  },
  {
    label: 'Être visible',
    services: [
      { num: '04', slug: 'seo', title: 'Référencement SEO', price: '274€/mois' },
      { num: '05', slug: 'visibilite-ia', title: 'Visibilité IA (AEO/GEO)', price: '490€/mois', badge: 'Nouveau' },
      { num: '06', slug: 'video-contenu-ia', title: 'Vidéo & Contenu IA', price: 'dès 490€/mois', badge: 'Nouveau' },
    ],
  },
  {
    label: 'Automatiser',
    services: [
      { num: '07', slug: 'crm-automatisation', title: 'CRM & Automatisation IA', price: 'Sur devis' },
      { num: '08', slug: 'formation-ia', title: 'Formation IA', price: 'dès 290€', badge: 'Nouveau' },
      { num: '09', slug: 'maintenance', title: 'Maintenance', price: 'dès 55€/mois' },
    ],
  },
]

const ease = [0.22, 1, 0.36, 1] as const

function ServiceRow({ s, index }: { s: Service; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay: index * 0.06, ease }}
    >
      <Link
        href={`/services/${s.slug}`}
        className="group flex items-center gap-4 sm:gap-8 py-4.5 sm:py-5 border-t border-border/70 transition-colors duration-300 hover:bg-white/70"
      >
        <span className="text-[11px] font-mono text-muted-foreground/50 w-6 shrink-0 transition-colors duration-300 group-hover:text-muted-foreground">
          {s.num}
        </span>

        <span className="flex items-baseline gap-2.5 flex-1 min-w-0">
          <span className="text-base sm:text-lg font-semibold text-foreground tracking-tight transition-transform duration-300 group-hover:translate-x-1 truncate">
            {s.title}
          </span>
          {s.badge && (
            <span className="hidden sm:inline text-[10px] font-medium uppercase tracking-wider shrink-0" style={{ color: '#F4521E' }}>
              {s.badge}
            </span>
          )}
        </span>

        <span className="text-sm font-medium text-foreground whitespace-nowrap">{s.price}</span>

        <span className="relative w-4 h-4 shrink-0 overflow-hidden">
          <ArrowUpRight className="absolute inset-0 w-4 h-4 text-muted-foreground/40 transition-all duration-300 group-hover:translate-x-4 group-hover:-translate-y-4 group-hover:opacity-0" />
          <ArrowUpRight
            className="absolute inset-0 w-4 h-4 -translate-x-4 translate-y-4 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:translate-y-0 group-hover:opacity-100"
            style={{ color: '#F4521E' }}
          />
        </span>
      </Link>
    </motion.div>
  )
}

export default function ServicesSection() {
  return (
    <section id="services" className="py-20 sm:py-28 bg-background">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">

        {/* En-tête */}
        <div className="mb-12 sm:mb-16">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-xs font-semibold uppercase tracking-[0.2em] mb-4"
            style={{ color: '#F4521E' }}
          >
            Services
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease }}
            className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground max-w-2xl leading-[1.1] tracking-tight"
          >
            Ce que je fais,{' '}
            <span className="font-heading italic font-normal" style={{ color: '#F4521E' }}>concrètement.</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15, ease }}
            className="mt-5 text-muted-foreground text-sm sm:text-base max-w-md leading-relaxed"
          >
            Pas d'agence intermédiaire, pas de template revendu. Chaque projet est fait à la main, de A à Z.
          </motion.p>
        </div>

        {/* Liste par groupe */}
        <div className="space-y-12 sm:space-y-14">
          {GROUPS.map(group => (
            <div key={group.label}>
              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/60 mb-2"
              >
                {group.label}
              </motion.p>
              <div className="border-b border-border/70">
                {group.services.map((s, i) => (
                  <ServiceRow key={s.slug} s={s} index={i} />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* CTA — une ligne discrète */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease }}
          className="mt-14 sm:mt-16 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6"
        >
          <p className="text-base sm:text-lg text-muted-foreground">
            Vous hésitez entre plusieurs services ?{' '}
            <span className="font-heading italic text-foreground">Parlons-en.</span>
          </p>
          <Link
            href="/contact"
            className="group inline-flex items-center gap-2.5 text-sm font-semibold text-white px-6 py-3 rounded-full transition-all duration-300 hover:gap-4"
            style={{ backgroundColor: '#F4521E' }}
          >
            Demander un devis gratuit
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>

      </div>
    </section>
  )
}
