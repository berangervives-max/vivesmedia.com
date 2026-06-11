'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { MessageSquare, PenTool, Code2, Rocket, ArrowUpRight } from 'lucide-react'

const STEPS = [
  {
    num: '01',
    icon: MessageSquare,
    title: 'Brief & Découverte',
    desc: 'On échange sur votre projet, vos objectifs et vos concurrents. Je pose les vraies questions pour comprendre ce qui fera la différence pour vous.',
    duration: '1–2 jours',
  },
  {
    num: '02',
    icon: PenTool,
    title: 'Design & Validation',
    desc: "Je conçois la maquette complète sous Figma. Vous validez chaque section avant qu'une seule ligne de code soit écrite. Rien n'est imposé.",
    duration: '3–5 jours',
  },
  {
    num: '03',
    icon: Code2,
    title: 'Développement',
    desc: 'Intégration en Next.js ou Framer, animations, SEO technique, performance. Vous avez accès à un lien de prévisualisation à chaque étape.',
    duration: '5–10 jours',
  },
  {
    num: '04',
    icon: Rocket,
    title: 'Mise en ligne & Suivi',
    desc: "Déploiement sur votre domaine, formation CMS, rapport Analytics configuré. Je reste disponible 30 jours après livraison.",
    duration: '1–2 jours',
  },
]

export default function ProcessSection() {
  return (
    <section className="py-24 bg-secondary/30">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-16">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#F4521E' }}>Mon processus</p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground max-w-xl leading-tight">
              De l'idée au site en{' '}
              <span className="italic font-normal text-foreground/50">3 semaines chrono</span>
            </h2>
          </motion.div>
          <motion.p initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
            className="text-muted-foreground text-sm max-w-xs leading-relaxed md:text-right">
            Pas de surprise, pas d'attente. Chaque étape est claire et vous êtes impliqué.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {STEPS.map((step, i) => {
            const Icon = step.icon
            return (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.1 * i }}
                className="relative group"
              >
                {/* Connector line */}
                {i < STEPS.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-[calc(100%-0px)] w-6 h-px bg-border z-10" />
                )}
                <div className="bg-white rounded-2xl border border-border p-6 h-full flex flex-col gap-5 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-secondary/80">
                      <Icon className="w-5 h-5 text-foreground/70" />
                    </div>
                    <span className="text-3xl font-bold text-foreground/8 font-mono leading-none">{step.num}</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-semibold text-foreground mb-2">{step.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: '#F4521E' }} />
                    <span className="text-xs text-muted-foreground font-medium">{step.duration}</span>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
          className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/contact"
            className="flex items-center gap-2 text-white font-semibold px-8 py-4 rounded-full hover:opacity-90 transition-all shadow-lg"
            style={{ backgroundColor: '#F4521E', boxShadow: '0 8px 30px rgba(244,82,30,0.25)' }}>
            Lancer mon projet <ArrowUpRight className="w-4 h-4" />
          </Link>
          <Link href="/realisations"
            className="flex items-center gap-2 text-sm font-medium px-6 py-3.5 rounded-full border border-border text-foreground hover:border-foreground transition-colors">
            Voir les réalisations
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
