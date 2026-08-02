'use client'
import { useRef } from 'react'
import Image from 'next/image'
import { motion, useScroll } from 'framer-motion'

const TIMELINE = [
  { num: '01', year: '2019–2021', title: 'BTS NDRC — Idelca Business School', desc: 'Négociation et digitalisation de la relation client. Les fondamentaux : vente, prospection, relation client.', logo: '/images/about/logos/idelca.jpg' },
  { num: '02', year: '2021–2022', title: 'Community Manager — Hurier Moto', desc: 'Réseaux sociaux, veille, stratégie sociale et créations graphiques pour un concessionnaire moto (Cavaillon). En parallèle : Bachelor Marketing Digital.', logo: '/images/about/logos/hurier-moto.jpg' },
  { num: '03', year: '2022–2023', title: 'Webmaster & Community Manager — Ducati JMS Motos', desc: 'Image de marque et contenus web (Avignon), mise en ligne des annonces, satisfaction client (GarageScore), photo & vidéo produits.', logo: '/images/about/logos/ducati.png' },
  { num: '04', year: '2023–2025', title: 'CM & Webmaster — Matos Import', desc: 'Gestion du site e-commerce PrestaShop (jet-ski & nautique, Cap d\'Agde), réseaux sociaux, événements & jeux concours, supports marketing. En parallèle : MBA Expert Marketing Digital (Bac+5).', logo: '/images/about/logos/matos-import.png' },
  { num: '05', year: 'oct. 2025 →', title: 'Fondation de vivesmedia.com', desc: 'Studio web freelance à Avignon. Des sites sur-mesure pensés pour convertir, avec IA et automatisation : Vives Reports, Sésame Informatique, Marine Caro, Stoop, CADENCE, Yannis Amielh.' },
]

export default function Timeline() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 75%', 'end 60%'],
  })

  return (
    <div className="mb-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mb-14"
      >
        <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#FF6B00' }}>Parcours</p>
        <h2 className="text-3xl sm:text-4xl font-bold text-foreground leading-tight">
          Les fondations de{' '}
          <span className="font-accent text-foreground inline-block -rotate-1">ce que je construis</span>
        </h2>
      </motion.div>

      {/* Frise verticale : rail continu + progression au scroll */}
      <div ref={ref} className="relative">
        {/* Rail (fond) */}
        <div className="absolute top-2 bottom-2 left-[11px] sm:left-[120px] w-px bg-border" aria-hidden="true" />
        {/* Rail (progression qui se remplit au scroll) */}
        <motion.div
          style={{ scaleY: scrollYProgress }}
          className="absolute top-2 bottom-2 left-[11px] sm:left-[120px] w-px origin-top"
          aria-hidden="true"
        >
          <div className="w-full h-full" style={{ background: '#FF6B00' }} />
        </motion.div>

        <ol className="space-y-10">
          {TIMELINE.map((item, i) => (
            <motion.li
              key={item.num}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="relative grid sm:grid-cols-[120px_1fr] items-start"
            >
              {/* Année (colonne gauche desktop) */}
              <div className="hidden sm:block pr-8 pt-1 text-right">
                <span className="text-2xl font-bold text-foreground leading-none">{item.year}</span>
              </div>

              {/* Nœud sur le rail */}
              <motion.span
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ type: 'spring', stiffness: 260, damping: 18, delay: i * 0.08 + 0.15 }}
                className="absolute top-1 left-0 sm:left-[120px] sm:-translate-x-1/2 z-10 flex items-center justify-center w-6 h-6 rounded-full bg-white border-2 shadow-sm"
                style={{ borderColor: '#FF6B00' }}
                aria-hidden="true"
              >
                <span className="w-2 h-2 rounded-full" style={{ background: '#FF6B00' }} />
              </motion.span>

              {/* Contenu — filet, plus de carte */}
              <div className={`pl-10 ${i < TIMELINE.length - 1 ? 'pb-8 border-b border-border' : ''}`}>
                <div className="flex items-center gap-3 mb-3">
                  {item.logo && (
                    <div className="w-10 h-10 flex items-center justify-center shrink-0">
                      <Image src={item.logo} alt="" width={40} height={40} className="object-contain w-full h-full grayscale opacity-80 transition-all hover:grayscale-0 hover:opacity-100" />
                    </div>
                  )}
                  <span className="font-mono text-xs font-semibold text-muted-foreground">{item.num}</span>
                  <span className="sm:hidden text-lg font-bold text-foreground">{item.year}</span>
                </div>
                <h3 className="text-base font-semibold text-foreground mb-2 leading-tight">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            </motion.li>
          ))}
        </ol>
      </div>
    </div>
  )
}
