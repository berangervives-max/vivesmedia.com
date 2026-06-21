'use client'
import { useRef, useState } from 'react'

/** Slider avant/après : glisser la poignée pour révéler l'ancien vs le nouveau. */
export default function BeforeAfter({ before, after, alt }: { before: string; after: string; alt: string }) {
  const [pos, setPos] = useState(50)
  const ref = useRef<HTMLDivElement>(null)

  const move = (clientX: number) => {
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    setPos(Math.min(100, Math.max(0, ((clientX - r.left) / r.width) * 100)))
  }

  return (
    <div
      ref={ref}
      className="relative w-full select-none overflow-hidden"
      onPointerMove={(e) => { if (e.buttons === 1) move(e.clientX) }}
      onPointerDown={(e) => move(e.clientX)}
    >
      {/* Après (dessous, pleine largeur) */}
      <img src={after} alt={alt} className="block w-full object-cover object-top" draggable={false} />
      {/* Avant (au-dessus, masqué par clip) */}
      <div className="absolute inset-0 overflow-hidden" style={{ width: `${pos}%` }}>
        <img
          src={before}
          alt={`${alt} — avant`}
          className="block h-full w-auto max-w-none object-cover object-top"
          style={{ width: ref.current ? ref.current.getBoundingClientRect().width : '100%' }}
          draggable={false}
        />
        <span className="absolute left-3 top-3 rounded-full bg-black/70 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-white">Avant</span>
      </div>
      <span className="absolute right-3 top-3 rounded-full bg-black/70 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-white">Après</span>
      {/* Poignée */}
      <div className="absolute inset-y-0 -ml-0.5 w-1" style={{ left: `${pos}%`, background: '#F4521E' }}>
        <span className="absolute top-1/2 left-1/2 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-white shadow-lg" style={{ background: '#F4521E' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="m9 18-6-6 6-6M15 6l6 6-6 6" /></svg>
        </span>
      </div>
    </div>
  )
}
