'use client'
import { useEffect, useState } from 'react'

/**
 * Barre de progression de lecture — collée au bord haut du viewport (z-40),
 * sous la pilule de nav flottante (z-50, top-4) : les deux ne se chevauchent
 * jamais. Recalculée sur scroll/resize plutôt que via une lib : une seule
 * valeur (ratio défilé) sur toute la durée de vie de la page.
 */
export default function ReadingProgress() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const onScroll = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight
      setProgress(scrollable > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollable)) : 0)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [])

  return (
    <div className="fixed top-0 left-0 right-0 z-40 h-[2px] bg-transparent" aria-hidden="true">
      <div
        className="h-full origin-left transition-transform duration-150 ease-out"
        style={{ backgroundColor: 'var(--primary)', transform: `scaleX(${progress})` }}
      />
    </div>
  )
}
