'use client'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowUpRight, Star, CalendarClock } from 'lucide-react'
import { motion } from 'framer-motion'
import AnimatedCounter from '@/components/ui/AnimatedCounter'
import { GoogleGLogo } from '@/components/BrandLogos'
import { track } from '@/lib/analytics'
import { openBooking } from '@/lib/booking'

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center pt-32 pb-20 bg-gradient-to-b from-[#f0eeff] via-background to-background">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-full bg-primary/10 blur-[140px]" />
        <div className="absolute top-20 right-10 w-[300px] h-[300px] rounded-full bg-orange-200/30 blur-[100px]" />
      </div>
      {/* Mont Ventoux — ancrage local (Avignon), fondu SANS couture via multiply (le blanc de l'image disparaît dans le fond), adaptatif tous formats */}
      <div className="absolute inset-x-0 bottom-0 z-0 pointer-events-none overflow-hidden h-[46vh] sm:h-[52vh] lg:h-[58vh]">
        <Image src="/images/mont-ventoux.webp" alt="" fill priority sizes="100vw" className="object-cover object-bottom select-none mix-blend-multiply" style={{ maskImage: 'linear-gradient(to bottom, transparent 0%, #000 42%)', WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, #000 42%)' }} />
      </div>
      {/* Voile de lisibilité : lève le texte au-dessus de la montagne sans la masquer */}
      <div className="absolute inset-0 z-[1] pointer-events-none" style={{ background: 'radial-gradient(125% 82% at 50% 38%, rgba(249,249,249,0.8) 0%, rgba(249,249,249,0.48) 50%, rgba(249,249,249,0) 74%)' }} />
      <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
        <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}
          className="text-5xl sm:text-6xl md:text-7xl lg:text-[88px] font-bold text-foreground leading-[1.05] tracking-tight">
          Des sites qui convertissent vos{' '}
          <span className="font-heading italic font-normal text-foreground">visiteurs en clients</span>
        </motion.h1>
        <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.15 }}
          className="mt-7 text-foreground/75 text-base md:text-lg max-w-xl mx-auto leading-relaxed">
          Sites sur-mesure, rapides, pensés pour convertir. Livraison en 3 semaines, full remote, partout en France.
        </motion.p>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.3 }}
          className="mt-10 flex flex-col items-center gap-6">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/contact" onClick={() => track('cta_clicked', { location: 'hero', label: 'Lancer mon projet', destination: '/contact' })}
              className="flex items-center gap-2 text-white font-semibold px-8 py-4 rounded-full btn-orange-glow"
              style={{ backgroundColor: '#F4521E' }}>
              Lancer mon projet <ArrowUpRight className="w-4 h-4" />
            </Link>
            <button type="button"
              onClick={() => { track('cta_clicked', { location: 'hero', label: 'Réserver un appel', destination: 'booking_modal' }); openBooking() }}
              className="flex items-center gap-2 font-semibold px-8 py-4 rounded-full border transition-colors hover:bg-foreground/5"
              style={{ borderColor: 'rgba(17,24,39,0.18)', color: '#111827' }}>
              <CalendarClock className="w-4 h-4" style={{ color: '#F4521E' }} /> Réserver un appel
            </button>
          </div>
          <a href="https://g.page/r/CVrzNHW-E9f0EAE/review" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="flex -space-x-2">
              {[
                '/images/42247233d_6a15c44f5826e1ea74a830ea_Ellipse24.jpg',
                '/images/9fcc2f99a_6a15c44f5826e1ea74a830eb_Ellipse23.jpg',
                '/images/0c5e109b4_6a15c44f5826e1ea74a830ec_Ellipse21.jpg',
                '/images/3d0d5b02d_6a15c44f5826e1ea74a830ed_Ellipse22.jpg',
              ].map((src, i) => (
                <img key={i} src={src} alt="client" className="w-9 h-9 rounded-full border-2 border-white object-cover" />
              ))}
            </div>
            <div className="text-left">
              <div className="flex items-center gap-0.5">{[1,2,3,4,5].map((i) => <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />)}</div>
              <p className="flex items-center gap-1 text-xs text-foreground/75 mt-0.5">
                <GoogleGLogo size={13} /> Avis Google · 5,0/5
              </p>
            </div>
          </a>
        </motion.div>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.7, delay: 0.5 }}
          className="mt-5 text-xs sm:text-sm text-foreground/80 font-medium">
          Devis gratuit ou appel de 30&nbsp;min · réponse sous 24&nbsp;h · sans engagement
        </motion.p>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.55 }}
          className="mt-16 flex flex-wrap justify-center gap-12">
          {[{ num: 5, suffix: '+', label: "ans d'expérience" }, { num: 10, suffix: '+', label: 'projets livrés' }, { num: 100, suffix: '%', label: 'full remote · France' }].map((stat) => (
            <div key={stat.label} className="text-center">
              <AnimatedCounter value={stat.num} suffix={stat.suffix} className="block text-3xl font-bold text-foreground" />
              <p className="text-sm text-foreground/75 mt-1 font-medium">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
