import Reveal from '@/components/ui/Reveal'

// Pastille + titre éditorial large (style magazine) — partagé entre /realisations/[slug] et /services/[slug].
export default function SectionHead({ eyebrow, title, accent, light = false }: { eyebrow: string; title: React.ReactNode; accent?: React.ReactNode; light?: boolean }) {
  return (
    <Reveal>
      <p className="text-xs font-semibold uppercase tracking-[0.2em] mb-5" style={{ color: '#FF6B00' }}>{eyebrow}</p>
      <h2 className={`text-3xl sm:text-4xl lg:text-5xl font-bold leading-[1.08] tracking-tight ${light ? 'text-white' : 'text-foreground'}`}>
        {title}{accent && <> <span className={`font-accent font-normal ${light ? 'text-white/55' : 'text-foreground/55'}`}>{accent}</span></>}
      </h2>
    </Reveal>
  )
}
