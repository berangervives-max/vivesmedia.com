import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import Timeline from '@/components/about/Timeline'

export const metadata: Metadata = {
  title: 'À propos — Studio web freelance Avignon',
  description: 'vivesmedia.com, studio web freelance basé à Avignon. Expert en création de sites sur-mesure, SEO, CRM et automatisation IA. 5 ans d\'expérience, 100% full remote.',
  alternates: { canonical: 'https://vivesmedia.com/a-propos' },
}

const PILLARS = [
  { num: '01', title: 'Clarté', desc: 'Zéro jargon. Vous comprenez chaque décision prise pour votre projet.' },
  { num: '02', title: 'Résultats', desc: 'Un beau site ne suffit pas. Chaque choix technique vise à convertir vos visiteurs.' },
  { num: '03', title: 'Engagement', desc: 'Un interlocuteur unique du brief à la livraison. Jamais de sous-traitance cachée.' },
  { num: '04', title: 'Avance', desc: 'IA, automatisation, SEO technique — toujours à la pointe pour vous garder devant.' },
]

export default function AProposPage() {
  return (
    <div className="min-h-screen bg-background pt-28 pb-20">
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 border border-border rounded-full px-4 py-1.5 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-foreground" />
            <span className="text-xs font-medium text-muted-foreground tracking-wide">Full remote · France</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-foreground leading-tight mb-6">
            Je construis des sites qui <span className="italic font-normal">travaillent pour vous</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
            vivesmedia.com est un studio web freelance basé à Avignon. Spécialisé dans les sites sur-mesure, pensés pour convertir — pas juste pour être beaux.
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-6 mb-20">
          {PILLARS.map((p, i) => (
            <div key={p.num} className="p-6 rounded-2xl border border-border bg-white">
              <span className="text-xs font-mono text-muted-foreground">{p.num}</span>
              <h3 className="text-lg font-bold text-foreground mt-3 mb-2">{p.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>

        <Timeline />

        <div className="rounded-2xl bg-foreground p-10 text-center">
          <h3 className="text-2xl font-bold text-white mb-3">Travaillons ensemble</h3>
          <p className="text-white/60 mb-6">Devis gratuit sous 24h, sans engagement.</p>
          <Link href="/contact" className="inline-flex items-center gap-2 bg-white text-foreground font-semibold px-8 py-4 rounded-full hover:bg-white/90 transition-all">
            Lancer mon projet <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}
