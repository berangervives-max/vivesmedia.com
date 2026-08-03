'use client'
import { useState } from 'react'
import { Check, Link2 } from 'lucide-react'

/**
 * Liens texte, pas d'icônes de marque (LinkedIn/X ont été retirées de
 * lucide-react — cf. décision projet) : cohérent avec la DA filets/typo
 * du site, pas de bouton-icône générique.
 */
export default function ShareLinks({ url, title }: { url: string; title: string }) {
  const [copied, setCopied] = useState(false)

  const linkedin = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`
  const x = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
      <span className="font-semibold uppercase tracking-widest text-muted-foreground">Partager</span>
      <a href={linkedin} target="_blank" rel="noopener noreferrer" className="font-medium text-foreground/70 underline decoration-border underline-offset-4 transition-colors hover:text-foreground hover:decoration-foreground">
        LinkedIn
      </a>
      <a href={x} target="_blank" rel="noopener noreferrer" className="font-medium text-foreground/70 underline decoration-border underline-offset-4 transition-colors hover:text-foreground hover:decoration-foreground">
        X
      </a>
      <button type="button" onClick={copyLink} className="flex items-center gap-1.5 font-medium text-foreground/70 underline decoration-border underline-offset-4 transition-colors hover:text-foreground hover:decoration-foreground">
        {copied ? <Check className="h-3.5 w-3.5" /> : <Link2 className="h-3.5 w-3.5" />}
        {copied ? 'Copié' : 'Copier le lien'}
      </button>
    </div>
  )
}
