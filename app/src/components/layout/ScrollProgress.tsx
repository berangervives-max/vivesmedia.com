'use client'
import { motion, useScroll, useSpring } from 'framer-motion'

// Barre de progression de lecture, fixée en haut de page (micro-détail premium).
export default function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.3 })

  return (
    <motion.div
      aria-hidden="true"
      className="fixed top-0 left-0 right-0 h-[3px] z-[100] origin-left"
      style={{ scaleX, backgroundColor: '#F4521E' }}
    />
  )
}
