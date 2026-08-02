'use client'
import Link from 'next/link'
import { ArrowUpRight, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'

type Service = {
  num: string
  slug: string
  title: string
  desc: string
  price: string
  priceAlt?: string
  badge?: string
  flag?: boolean
}

type ServiceGroup = {
  label: string
  services: Service[]
}

const GROUPS: ServiceGroup[] = [
  {
    label: 'Créer',
    services: [
      { num: '01', slug: 'site-ecommerce', title: 'Site E-Commerce', desc: 'Catalogue, paiement, gestion des commandes — pour vendre en ligne dès le lancement.', price: 'dès 3 840 €', priceAlt: 'ou 149 €/mois', badge: 'Le plus complet', flag: true },
      { num: '02', slug: 'site-vitrine', title: 'Site Vitrine', desc: 'Présenter l’activité, être trouvé sur Google, convertir en demandes de contact.', price: 'dès 1 800 €', priceAlt: 'ou 89 €/mois' },
      { num: '03', slug: 'site-catalogue', title: 'Site Catalogue', desc: 'Présenter une gamme de produits ou services, sans paiement en ligne.', price: 'dès 2 740 €' },
    ],
  },
  {
    label: 'Être visible',
    services: [
      { num: '04', slug: 'seo', title: 'Référencement SEO', desc: 'Remonter dans Google sur les recherches qui amènent de vrais clients.', price: '274 €/mois' },
      { num: '05', slug: 'visibilite-ia', title: 'Visibilité IA (AEO/GEO)', desc: 'Être cité par ChatGPT, Claude et Perplexity quand on cherche votre métier.', price: '490 €/mois', badge: 'Nouveau' },
      { num: '06', slug: 'video-contenu-ia', title: 'Vidéo & Contenu IA', desc: 'Vidéos et visuels générés et montés pour vos réseaux, sans tournage.', price: 'dès 490 €/mois', badge: 'Nouveau' },
    ],
  },
  {
    label: 'Automatiser',
    services: [
      { num: '07', slug: 'crm-automatisation', title: 'CRM & Automatisation IA', desc: 'Automatiser les relances, devis et suivi client — sans y passer vos soirées.', price: 'Sur devis' },
      { num: '08', slug: 'formation-ia', title: 'Formation IA', desc: 'Prendre en main l’IA au quotidien dans votre activité, en une session.', price: 'dès 290 €', badge: 'Nouveau' },
      { num: '09', slug: 'maintenance', title: 'Maintenance', desc: 'Mises à jour, sauvegardes et support — le site reste en bon état sans y penser.', price: 'dès 55 €/mois' },
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
        className={`group flex items-center gap-4 sm:gap-8 py-4.5 sm:py-5 transition-colors duration-300 ${
          s.flag
            ? 'rounded-lg px-3 -mx-3 sm:px-4 sm:-mx-4 border-t border-transparent'
            : 'border-t border-border/70 hover:bg-white/70'
        }`}
        style={s.flag ? { background: '#FFF4ED' } : undefined}
      >
        <span className="text-[11px] font-mono text-muted-foreground/50 w-6 shrink-0 transition-colors duration-300 group-hover:text-muted-foreground">
          {s.num}
        </span>

        <span className="flex-1 min-w-0">
          <span className="flex items-baseline gap-2.5 flex-wrap">
            <span className="text-base sm:text-lg font-semibold text-foreground tracking-tight transition-transform duration-300 group-hover:translate-x-1">
              {s.title}
            </span>
            {s.badge && (
              <span className="text-[10px] font-semibold uppercase tracking-wider shrink-0" style={{ color: '#FF6B00' }}>
                {s.badge}
              </span>
            )}
          </span>
          <span className="block mt-0.5 text-xs text-muted-foreground truncate">{s.desc}</span>
        </span>

        <span className="text-right shrink-0">
          <span className="block text-sm font-medium text-foreground whitespace-nowrap">{s.price}</span>
          {s.priceAlt && <span className="block text-[11px] text-muted-foreground whitespace-nowrap">{s.priceAlt}</span>}
        </span>

        <span className="relative w-4 h-4 shrink-0 overflow-hidden">
          <ArrowUpRight className="absolute inset-0 w-4 h-4 text-muted-foreground/40 transition-all duration-300 group-hover:translate-x-4 group-hover:-translate-y-4 group-hover:opacity-0" />
          <ArrowUpRight
            className="absolute inset-0 w-4 h-4 -translate-x-4 translate-y-4 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:translate-y-0 group-hover:opacity-100"
            style={{ color: '#FF6B00' }}
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
            style={{ color: '#FF6B00' }}
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
            <span className="font-accent font-normal" style={{ color: '#FF6B00' }}>concrètement.</span>
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
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.25, ease }}
            className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 pt-5 border-t border-border/70"
          >
            {['Prix fixes affichés', 'Aucun frais caché', '1 fois ou en mensualités'].map(t => (
              <span key={t} className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-foreground">
                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: '#FF6B00' }} />
                {t}
              </span>
            ))}
          </motion.div>
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

        {/* Réassurance */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-14 sm:mt-16 text-xs sm:text-sm text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-1.5"
        >
          <span>Interlocuteur unique, du brief à la mise en ligne</span>
          <span className="w-1 h-1 rounded-full bg-border" />
          <span>Devis sous 24h</span>
          <span className="w-1 h-1 rounded-full bg-border" />
          <span>Full remote, partout en France</span>
        </motion.p>

        {/* CTA — une ligne discrète */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease }}
          className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6"
        >
          <p className="text-base sm:text-lg text-muted-foreground">
            Vous hésitez entre plusieurs services ?{' '}
            <span className="font-accent text-foreground">Parlons-en.</span>
          </p>
          <Link
            href="/contact"
            className="group inline-flex items-center gap-2.5 text-sm font-semibold text-white px-6 py-3 rounded-xl transition-all duration-300 hover:gap-4"
            style={{ backgroundColor: 'var(--brand-cta)' }}
          >
            Demander un devis gratuit
            <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>

      </div>
    </section>
  )
}
