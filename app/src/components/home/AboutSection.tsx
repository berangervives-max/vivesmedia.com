'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { motion, useInView } from 'framer-motion'

function CountUp({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })
  useEffect(() => {
    if (!inView) return
    let start = 0
    const step = target / (2000 / 16)
    const timer = setInterval(() => {
      start += step
      if (start >= target) { setCount(target); clearInterval(timer) }
      else setCount(Math.floor(start))
    }, 16)
    return () => clearInterval(timer)
  }, [inView, target])
  return <span ref={ref}>{count}{suffix}</span>
}

const STATS = [
  { value: 9, suffix: '+', label: 'Projets livrés avec succès' },
  { value: 5, suffix: '+', label: "Ans d'expérience" },
  { value: 5, suffix: '.0/5', label: 'sur Google' },
]

export default function AboutSection() {
  return (
    <section className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <motion.p initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: '#F4521E' }}>À propos</motion.p>
            <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
              className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground leading-tight">
              Un freelance dédié à votre{' '}<span className="font-heading italic font-normal">croissance digitale</span>
            </motion.h2>
            <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}
              className="mt-6 text-muted-foreground leading-relaxed text-base">
              Je crée des sites web sur-mesure, pensés pour convertir — pas juste pour être beaux.
              Originaire d'Avignon, je travaille en full remote avec des entreprises partout en France.
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }}
              className="mt-8 grid grid-cols-2 gap-3">
              {[
                { label: 'Full Remote', desc: 'Je travaille à distance, partout en France' },
                { label: 'Interlocuteur unique', desc: 'Un seul contact du brief à la livraison' },
                { label: 'Devis sous 24h', desc: 'Réponse garantie, sans engagement' },
                { label: 'Basé à Avignon', desc: 'Déplacement possible sur demande' },
              ].map((item, i) => (
                <motion.div key={item.label} initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.35 + i * 0.05 }}
                  className="p-4 rounded-xl border border-border bg-secondary/40">
                  <p className="text-sm font-semibold text-foreground">{item.label}</p>
                  <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
                </motion.div>
              ))}
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.4 }}
              className="mt-8 flex gap-3">
              <Link href="/realisations"
                className="flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-full text-white"
                style={{ backgroundColor: '#F4521E' }}>
                Voir mes réalisations <ArrowUpRight className="w-4 h-4" />
              </Link>
              <Link href="/a-propos"
                className="flex items-center gap-2 text-sm font-medium px-5 py-2.5 rounded-full border border-border text-foreground hover:border-foreground transition-colors">
                En savoir plus
              </Link>
            </motion.div>
          </div>
          <div className="flex flex-col gap-0 divide-y divide-border">
            {STATS.map((stat, i) => (
              <motion.div key={stat.label} initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.15 * i }}
                className="py-8 first:pt-0 last:pb-0">
                <span className="text-6xl md:text-7xl font-bold tracking-tight" style={{ color: '#F4521E' }}>
                  <CountUp target={stat.value} suffix={stat.suffix} />
                </span>
                <p className="text-muted-foreground text-sm mt-2 font-medium">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
