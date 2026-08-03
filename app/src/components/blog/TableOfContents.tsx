'use client'
import { useEffect, useState } from 'react'
import type { ArticleHeading } from '@/lib/article-html'

/**
 * Sommaire scrollspy — pas de card, un simple filet vertical qui suit la
 * lecture. Le rootMargin resserre la zone de détection en haut du viewport :
 * un titre devient « actif » dès qu'il franchit la navbar, pas seulement
 * quand il atteint le milieu de l'écran.
 */
export default function TableOfContents({ headings }: { headings: ArticleHeading[] }) {
  const [activeId, setActiveId] = useState<string | null>(headings[0]?.id ?? null)

  useEffect(() => {
    if (headings.length === 0) return
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting)
        if (visible.length > 0) setActiveId(visible[0].target.id)
      },
      { rootMargin: '-100px 0px -70% 0px', threshold: 0 }
    )
    const elements = headings
      .map((h) => document.getElementById(h.id))
      .filter((el): el is HTMLElement => el !== null)
    elements.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [headings])

  if (headings.length < 2) return null

  return (
    <nav aria-label="Sommaire de l'article">
      <ul className="space-y-0.5 border-l border-border">
        {headings.map((h) => (
          <li key={h.id}>
            <a
              href={`#${h.id}`}
              className={`-ml-px block border-l-2 py-1.5 text-sm leading-snug transition-colors ${
                h.level === 3 ? 'pl-7' : 'pl-4'
              } ${
                activeId === h.id
                  ? 'border-[color:var(--primary)] font-medium text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
