'use client'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Star } from 'lucide-react'
import { temoignagesService } from '@/services/supabase.service'

const GOOGLE_REVIEWS_URL = 'https://g.page/r/CVrzNHW-E9f0EAE/review'
const COLORS = ['bg-violet-100 text-violet-700', 'bg-orange-100 text-orange-700', 'bg-green-100 text-green-700', 'bg-pink-100 text-pink-700']
const STATIC = [
  { name: 'Marie L.', company: 'Maison Sud', text: "Le site reflète enfin notre univers. C'est clair, élégant, et les demandes entrantes sont beaucoup plus qualifiées.", initial: 'M', color: COLORS[0] },
  { name: 'Thomas D.', company: 'TechFlow', text: "On a senti un vrai accompagnement, pas une livraison automatique. Les choix étaient expliqués, précis, utiles.", initial: 'T', color: COLORS[1] },
  { name: 'Sophie B.', company: 'Atelier Vert', text: 'Le rendu est sur-mesure et très propre. Rien à voir avec les templates qu\'on nous proposait ailleurs.', initial: 'S', color: COLORS[2] },
  { name: 'Karim H.', company: 'Immo Prestige', text: "Le site inspire davantage confiance. Les pages sont rapides, lisibles, et les clients comprennent mieux notre offre.", initial: 'K', color: COLORS[3] },
]

function Stars() {
  return <div className="flex gap-0.5">{[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />)}</div>
}

export default function TestimonialsSection() {
  const [items, setItems] = useState(STATIC)
  useEffect(() => {
    temoignagesService.getActive(7).then(data => {
      if (data && data.length >= 3) {
        setItems(data.map((t, i) => ({ name: t.nom, company: t.entreprise || '', text: t.texte.replace(/<[^>]+>/g, ''), initial: (t.nom || '?')[0].toUpperCase(), color: COLORS[i % 4] })))
      }
    }).catch(() => {})
  }, [])

  return (
    <section className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-6">
        <motion.a href={GOOGLE_REVIEWS_URL} target="_blank" rel="noopener noreferrer"
          initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="inline-flex items-center gap-3 bg-white border border-border rounded-full px-5 py-2.5 shadow-sm mb-8 hover:shadow-md transition-all cursor-pointer">
          <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          <div className="flex items-center gap-2"><Stars /><span className="text-sm font-bold text-foreground">5.0</span><span className="text-sm text-muted-foreground">· Avis Google vérifiés</span></div>
        </motion.a>
        <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground max-w-2xl leading-tight">
          Ce que disent mes clients <span className="font-heading italic font-normal">satisfaits</span>
        </motion.h2>
        <div className="grid md:grid-cols-2 gap-6 mt-14">
          <motion.a href={GOOGLE_REVIEWS_URL} target="_blank" rel="noopener noreferrer"
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="rounded-2xl border border-border bg-white p-8 md:p-10 flex flex-col justify-between min-h-[280px] shadow-sm hover:shadow-md transition-all cursor-pointer">
            <Stars />
            <div className="mt-4">
              <p className="text-xl md:text-2xl text-foreground leading-relaxed font-light">"{items[0]?.text}"</p>
              <div className="mt-6 flex items-center gap-3">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold ${items[0]?.color}`}>{items[0]?.initial}</div>
                <div><p className="text-sm font-semibold text-foreground">{items[0]?.name}</p><p className="text-xs text-muted-foreground">{items[0]?.company}</p></div>
              </div>
            </div>
          </motion.a>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
            className="rounded-2xl overflow-hidden border border-border min-h-[280px] relative">
            <img src="/images/09bd18d81_p1049296-high-8vjn4x.webp" alt="Customer story" className="w-full h-full object-cover absolute inset-0" />
            <div className="absolute inset-0 bg-black/30" />
            <div className="relative p-8 md:p-10 flex flex-col justify-between h-full min-h-[280px]">
              <Stars />
              <div className="mt-auto">
                <p className="text-7xl md:text-8xl font-bold text-white">5.0<span className="text-3xl text-white/50">/5</span></p>
                <p className="text-white/70 mt-2">sur Google · avis vérifiés</p>
              </div>
            </div>
          </motion.div>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {items.slice(1, 7).map((t, i) => (
            <motion.a key={i} href={GOOGLE_REVIEWS_URL} target="_blank" rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.05 * i }}
              className="rounded-2xl border border-border bg-white p-8 shadow-sm min-h-[220px] flex flex-col justify-between hover:shadow-md transition-all cursor-pointer">
              <Stars />
              <p className="text-lg text-foreground leading-relaxed font-light mt-4">"{t?.text}"</p>
              <div className="mt-6 flex items-center gap-3">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold ${t?.color}`}>{t?.initial}</div>
                <div><p className="text-sm font-semibold text-foreground">{t?.name}</p><p className="text-xs text-muted-foreground">{t?.company}</p></div>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  )
}
