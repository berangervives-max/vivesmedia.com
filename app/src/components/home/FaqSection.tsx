'use client'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

const FAQS = [
  { q: 'Quels types de sites créez-vous ?', a: 'Nous concevons des sites vitrines, des sites catalogues, des boutiques e-commerce, ainsi que des outils sur-mesure (CRM, automatisations, agents IA). Chaque projet est unique et adapté à vos besoins réels.' },
  { q: "Combien de temps dure un projet ?", a: 'Un site vitrine est généralement livré en 3 à 5 semaines. Un e-commerce ou un projet complexe peut prendre 6 à 10 semaines. Nous définissons ensemble un calendrier précis dès le départ.' },
  { q: 'Comment est structuré le paiement ?', a: 'Un acompte de 25% du montant TTC est demandé avant le démarrage. Le solde est exigible à la livraison. Le paiement en 4x sans frais est disponible via Alma sur certains projets.' },
  { q: 'Proposez-vous de la maintenance après livraison ?', a: 'Oui, nous proposons des forfaits de maintenance dès 50€/mois. Ils incluent les mises à jour de sécurité, les sauvegardes et du temps de développement mensuel selon la formule choisie.' },
  { q: 'Travaillez-vous uniquement à Avignon ?', a: 'Non, nous intervenons sur toute la région PACA et au-delà. Nous travaillons à distance quand c\'est plus efficace, et en présentiel pour les projets qui nécessitent une compréhension fine de votre métier.' },
  { q: 'Comment démarrer un projet avec vous ?', a: "Remplissez notre formulaire de devis en ligne. Répondez à quelques questions simples sur votre projet et nous vous envoyons un devis personnalisé sous 24h — sans engagement." },
]

function AccordionItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-border">
      <button onClick={() => setOpen(!open)} className="w-full text-left flex items-center justify-between py-5 text-base font-medium text-foreground hover:text-foreground/80 transition-colors">
        {q}
        <ChevronDown className={`w-4 h-4 flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <div className="pb-5 text-sm text-muted-foreground leading-relaxed">{a}</div>}
    </div>
  )
}

export default function FaqSection() {
  return (
    <section className="py-24 bg-background">
      <div className="max-w-3xl mx-auto px-6">
        <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground leading-tight">
          Des questions ?<br />Voici les <span className="font-heading italic font-normal">réponses</span>
        </motion.h2>
        <div className="mt-12">{FAQS.map((faq, i) => <AccordionItem key={i} q={faq.q} a={faq.a} />)}</div>
      </div>
    </section>
  )
}
