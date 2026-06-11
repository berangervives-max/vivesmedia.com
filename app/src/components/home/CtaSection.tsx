'use client'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { motion } from 'framer-motion'

export default function CtaSection() {
  return (
    <section className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="relative rounded-3xl overflow-hidden border border-border p-12 md:p-20 text-center">
          <img src="https://media.base44.com/images/public/6a15d09e64865f761ccc6c1a/21b542326_6a15c44f5826e1ea74a83119_bg-cover-p-130x130q80.jpg" alt="bg" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/60" />
          <div className="relative">
            <h3 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight">
              Transformez votre présence en ligne en{' '}<span className="font-heading italic font-normal">machine de croissance</span>
            </h3>
            <p className="mt-6 text-white/70 max-w-xl mx-auto">Vos concurrents investissent déjà. Rejoignez les entreprises qui convertissent leurs visiteurs en clients avec vivesmedia.com.</p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link href="/contact" className="inline-flex items-center gap-2 bg-white text-foreground font-semibold px-8 py-4 rounded-full hover:bg-white/90 transition-all hover:scale-105">
                Lancer mon projet <ArrowUpRight className="w-4 h-4" />
              </Link>
              <Link href="/realisations" className="inline-flex items-center gap-2 border border-white/30 text-white font-medium px-8 py-4 rounded-full hover:border-white/60 transition-colors">
                Voir nos réalisations <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
