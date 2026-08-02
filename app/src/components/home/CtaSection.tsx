'use client'
import Link from 'next/link'
import { ArrowUpRight, CalendarClock } from 'lucide-react'
import { motion } from 'framer-motion'
import { openBooking } from '@/lib/booking'

export default function CtaSection() {
  return (
    <motion.section initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
      className="relative overflow-hidden py-28 md:py-36 text-center">
      <img src="/images/21b542326_6a15c44f5826e1ea74a83119_bg-cover-p-130x130q80.jpg" alt="" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-black/60" />
      <div className="relative max-w-3xl mx-auto px-6">
        <h3 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-[1.05]">
          Transformez votre présence en ligne en{' '}<span className="font-accent font-normal">machine de croissance</span>
        </h3>
        <p className="mt-6 text-white/70 max-w-xl mx-auto text-base md:text-lg">Vos concurrents investissent déjà. Rejoignez les entreprises qui convertissent leurs visiteurs en clients avec vivesmedia.com.</p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link href="/contact" className="inline-flex items-center gap-2 bg-white text-foreground font-semibold px-8 py-4 rounded-xl hover:bg-white/90 transition-all hover:scale-105">
            Lancer mon projet <ArrowUpRight className="w-4 h-4" />
          </Link>
          <button type="button" onClick={openBooking} className="inline-flex items-center gap-2 border border-white/30 text-white font-medium px-8 py-4 rounded-xl hover:border-white/60 transition-colors">
            <CalendarClock className="w-4 h-4" /> Réserver un appel de 30 min
          </button>
        </div>
      </div>
    </motion.section>
  )
}
