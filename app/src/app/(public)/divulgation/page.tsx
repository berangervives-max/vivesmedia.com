import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'

export const metadata: Metadata = {
  title: "Divulgation d'affiliation & partenariats — vivesmedia.com",
  description: "Transparence sur les liens d'affiliation et les partenariats de vivesmedia.com. Nous ne recommandons que des outils que nous utilisons réellement, sans surcoût pour vous.",
  alternates: { canonical: 'https://vivesmedia.com/divulgation' },
}

const SECTIONS = [
  {
    num: '01',
    title: "Liens d'affiliation",
    desc: "Certains liens présents sur ce site (notamment dans les articles de blog) sont des liens d'affiliation. Si vous effectuez un achat via l'un de ces liens, vivesmedia.com peut percevoir une commission — sans aucun surcoût pour vous. Le prix que vous payez reste identique.",
  },
  {
    num: '02',
    title: 'Une recommandation, jamais une publicité déguisée',
    desc: "Je ne recommande que des outils, services ou plateformes que j'utilise réellement dans mon travail ou que je considère sincèrement utiles. Une commission ne change jamais mon avis : si un outil n'est pas bon, il n'apparaît pas ici.",
  },
  {
    num: '03',
    title: 'Partenariats & certifications',
    desc: "vivesmedia.com est partenaire de certaines plateformes technologiques (e-commerce, hébergement, outils marketing). Ces partenariats me permettent de vous offrir un accompagnement à jour et certifié. Ils sont signalés en toute transparence sur le site.",
  },
  {
    num: '04',
    title: 'Votre confiance avant tout',
    desc: "La transparence fait partie de mes valeurs (clarté, zéro jargon). Pour toute question sur un lien ou un partenariat, écrivez-moi : je vous répondrai avec plaisir.",
  },
]

export default function DivulgationPage() {
  return (
    <div className="min-h-screen bg-background pt-28 pb-20">
      <div className="max-w-3xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 border border-border rounded-full px-4 py-1.5 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-foreground" />
            <span className="text-xs font-medium text-muted-foreground tracking-wide">Transparence</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground leading-tight mb-6">
            Divulgation d&apos;affiliation <span className="italic font-normal">&amp; partenariats</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto leading-relaxed">
            Je préfère jouer cartes sur table. Voici comment fonctionnent les liens et partenariats que vous croisez sur vivesmedia.com.
          </p>
        </div>

        <div className="space-y-6 mb-16">
          {SECTIONS.map((s) => (
            <div key={s.num} className="p-6 rounded-2xl border border-border bg-white">
              <span className="text-xs font-mono text-muted-foreground">{s.num}</span>
              <h2 className="text-lg font-bold text-foreground mt-3 mb-2">{s.title}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>

        <div className="rounded-2xl bg-foreground p-10 text-center">
          <h3 className="text-2xl font-bold text-white mb-3">Une question ?</h3>
          <p className="text-white/60 mb-6">Écrivez-moi, je réponds sous 24h.</p>
          <Link href="/contact" className="inline-flex items-center gap-2 bg-white text-foreground font-semibold px-8 py-4 rounded-full hover:bg-white/90 transition-all">
            Me contacter <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}
