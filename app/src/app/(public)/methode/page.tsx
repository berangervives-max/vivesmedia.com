import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Ma méthode — vivesmedia.com',
  description: "Cinq étapes, jamais sautées : découverte, cadrage, parcours et règles, backlog priorisé, livraison et mesure. La démarche derrière chaque site vivesmedia.com.",
  alternates: { canonical: 'https://vivesmedia.com/methode' },
}

const STEPS = [
  {
    num: '01',
    title: 'Découverte',
    desc: "Avant de parler design, je veux savoir qui vient sur votre site et pourquoi. Vos clients, vos concurrents, ce qui vous différencie vraiment.",
  },
  {
    num: '02',
    title: 'Cadrage',
    desc: "Je fixe un périmètre clair, des objectifs mesurables et les risques à surveiller. Tout est écrit noir sur blanc avant la première maquette.",
  },
  {
    num: '03',
    title: 'Parcours & règles',
    desc: "Je trace chaque parcours, de la première visite à la demande de devis, et j'écris les règles qui doivent tenir, pas seulement ce qui doit bien paraître.",
  },
  {
    num: '04',
    title: 'Backlog priorisé',
    desc: "Chaque tâche est classée par impact et par effort. On traite d'abord ce qui compte vraiment pour vos clients, pas ce qui se voit le plus vite.",
  },
  {
    num: '05',
    title: 'Livraison & mesure',
    desc: "Déploiement contrôlé, mesure réelle du résultat une fois en ligne. Pas de « je pense que ça marche » : des chiffres, ou je corrige.",
  },
]

export default function MethodePage() {
  return (
    <div className="bg-background">
      <section className="pt-36 pb-16 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: 'var(--brand-cta)' }}>
            Ma méthode
          </p>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-foreground leading-[1.05] tracking-tight">
            Cinq étapes, <span className="font-accent font-normal text-foreground">jamais sautées</span>
          </h1>
          <p className="mt-6 text-foreground/75 text-base md:text-lg max-w-xl mx-auto leading-relaxed">
            Un site qui convertit n&apos;est jamais le fruit du hasard. Voici comment je travaille, du premier échange à la mise en ligne.
          </p>
        </div>
      </section>

      <section className="pb-28 px-6">
        <div className="max-w-3xl mx-auto">
          {STEPS.map((step) => (
            <div key={step.num} className="border-t border-border py-8 flex gap-6 sm:gap-10 items-start">
              <span className="font-mono text-sm text-muted-foreground/60 pt-1 shrink-0 w-8">{step.num}</span>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">{step.title}</h2>
                <p className="text-foreground/70 leading-relaxed max-w-xl">{step.desc}</p>
              </div>
            </div>
          ))}
          <div className="border-t border-border" />
        </div>
      </section>

      <section className="pb-28 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h3 className="text-2xl sm:text-3xl font-bold text-foreground mb-6">
            On démarre par un échange de 30 minutes ?
          </h3>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 text-white font-semibold px-8 py-4 rounded-xl btn-orange-glow"
            style={{ backgroundColor: 'var(--brand-cta)' }}
          >
            Lancer mon projet <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  )
}
