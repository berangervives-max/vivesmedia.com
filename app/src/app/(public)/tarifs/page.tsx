import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowUpRight, Check, Minus } from 'lucide-react'
import { creationFormules, recurrentServices, maintenancePlans, tarifsFaq } from '@/data/tarifs-data'
import TrackView from '@/components/analytics/TrackView'

export const metadata: Metadata = {
  title: 'Tarifs création de site internet à Avignon — prix transparents',
  description:
    'Combien coûte un site web ? Site vitrine dès 1 800€, catalogue 2 740€, e-commerce 3 840€. Paiement unique ou abonnement dès 89€/mois. Comparatif des formules + FAQ prix. Devis gratuit 24h.',
  alternates: { canonical: 'https://vivesmedia.com/tarifs' },
}

// Comparatif honnête, dérivé de creationFormules — c'est la valeur ajoutée vs /services.
const comparison = {
  rows: [
    { label: 'Paiement unique', values: ['1 800€', '2 740€', '3 840€'] },
    { label: 'En abonnement', values: ['89€/mois', '—', '149€/mois'] },
    { label: 'Idéal pour', values: ['Présenter une activité', 'Artisans & fabricants', 'Vendre en ligne'] },
    { label: 'Pages / produits', values: ['5 pages sur-mesure', "Jusqu'à 250 produits", "Boutique + 50 produits"] },
    { label: 'Paiement en ligne (Stripe)', values: [false, false, true] },
    { label: 'Gestion des stocks temps réel', values: [false, false, true] },
    { label: 'Hébergement 1ʳᵉ année offerte', values: [true, false, false] },
    { label: 'Accompagnement', values: ['Formation admin', 'Support prioritaire', 'Support 6 mois'] },
  ],
}

function Cell({ value }: { value: string | boolean }) {
  if (value === true) return <Check className="w-4 h-4 mx-auto" style={{ color: '#F4521E' }} />
  if (value === false) return <Minus className="w-4 h-4 mx-auto text-muted-foreground/40" />
  return <span>{value}</span>
}

export default function TarifsPage() {
  const formules = creationFormules // [ecommerce, catalogue, vitrine]
  // Ordre d'affichage du comparatif : vitrine → catalogue → e-commerce (prix croissant)
  const ordered = [formules[2], formules[1], formules[0]]

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: tarifsFaq.map(f => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  }

  return (
    <div className="min-h-screen bg-background pt-28 pb-20">
      <TrackView event="pricing_viewed" />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        {/* ── 1. HERO ── */}
        <div className="mb-12 md:mb-16">
          <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#F4521E' }}>Tarifs</p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground leading-tight max-w-2xl">
            Des prix clairs, <span className="italic font-normal">sans surprise.</span>
          </h1>
          <p className="mt-4 text-muted-foreground max-w-xl text-sm sm:text-base">
            Tout est annoncé d'avance : prix de création, options d'abonnement, frais récurrents. Vous savez exactement ce que vous payez, et pourquoi.
          </p>
        </div>

        {/* ── 2. COMPARATIF DES FORMULES ── */}
        <p className="text-xs font-semibold uppercase tracking-widest mb-6" style={{ color: '#F4521E' }}>Comparatif création de sites</p>

        {/* Desktop : tableau */}
        <div className="hidden md:block rounded-2xl border border-border overflow-hidden mb-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-foreground text-white">
                <th className="text-left font-medium p-5 w-[26%]"></th>
                {ordered.map((f, i) => (
                  <th key={f.slug} className="p-5 text-center align-bottom">
                    <span className="block text-base font-bold">{f.title.replace('Site ', '')}</span>
                    {i === 2 && (
                      <span className="mt-2 inline-block text-[10px] font-semibold px-2.5 py-0.5 rounded-full" style={{ backgroundColor: '#F4521E', color: '#fff' }}>
                        Le plus populaire
                      </span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {comparison.rows.map((row, ri) => (
                <tr key={row.label} className={ri % 2 === 1 ? 'bg-muted/30' : 'bg-white'}>
                  <td className="p-5 font-medium text-foreground">{row.label}</td>
                  {row.values.map((v, ci) => (
                    <td key={ci} className={`p-5 text-center ${ri === 0 ? 'font-bold text-base' : 'text-muted-foreground'}`} style={ri === 0 ? { color: '#F4521E' } : undefined}>
                      <Cell value={v} />
                    </td>
                  ))}
                </tr>
              ))}
              <tr className="bg-white border-t border-border">
                <td className="p-5"></td>
                {ordered.map(f => (
                  <td key={f.slug} className="p-5 text-center">
                    <Link href={`/contact?service=${f.slug}`} className="inline-flex items-center gap-2 bg-foreground text-white font-semibold px-5 py-2.5 rounded-full text-xs hover:bg-foreground/90 transition-colors">
                      Devis <ArrowUpRight className="w-3 h-3" />
                    </Link>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        {/* Mobile : cartes empilées */}
        <div className="md:hidden grid grid-cols-1 gap-4 mb-4">
          {ordered.map(f => (
            <div key={f.slug} className="rounded-2xl border border-border bg-white p-6">
              <h2 className="text-lg font-bold text-foreground">{f.title}</h2>
              <p className="text-2xl font-bold mt-1" style={{ color: '#F4521E' }}>{f.price}</p>
              <p className="text-xs text-muted-foreground">{f.priceNote}</p>
              {f.sub && <p className="text-xs font-medium mt-1" style={{ color: '#F4521E' }}>{f.sub}</p>}
              <ul className="space-y-2 mt-4 mb-5">
                {f.features.map(feat => (
                  <li key={feat} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="w-3.5 h-3.5 shrink-0" style={{ color: '#F4521E' }} /> {feat}
                  </li>
                ))}
              </ul>
              <Link href={`/contact?service=${f.slug}`} className="flex items-center justify-center gap-2 bg-foreground text-white font-semibold px-5 py-2.5 rounded-full text-sm hover:bg-foreground/90 transition-colors">
                Demander un devis <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ))}
        </div>

        <p className="text-xs text-muted-foreground mb-16">
          Besoin du détail de chaque offre ?{' '}
          <Link href="/services" className="underline font-medium hover:text-foreground transition-colors">Voir la page Services</Link>.
        </p>

        {/* ── 3. PAIEMENT UNIQUE VS ABONNEMENT ── */}
        <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: '#F4521E' }}>Deux façons de payer</p>
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-8">
          Au comptant ou <span className="italic font-normal">en abonnement.</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-16">
          <div className="rounded-2xl border border-border bg-white p-7">
            <h3 className="text-lg font-bold text-foreground mb-2">Paiement unique</h3>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              Vous réglez le site une bonne fois pour toutes. Le tarif affiché est le prix final : conception, développement, mise en ligne. Idéal si vous préférez ne plus y penser ensuite.
            </p>
            <ul className="space-y-2">
              {['Prix total connu d\'avance', 'Aucun engagement de durée', 'Le site vous appartient'].map(f => (
                <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Check className="w-3.5 h-3.5 shrink-0" style={{ color: '#F4521E' }} /> {f}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl bg-foreground p-7">
            <h3 className="text-lg font-bold text-white mb-2">En abonnement</h3>
            <p className="text-sm text-white/70 leading-relaxed mb-4">
              Un acompte à la commande, puis des mensualités (dès 89€/mois pour un vitrine, 149€/mois pour un e-commerce). Vous lissez le coût et restez accompagné, avec un engagement de 24 mois minimum.
            </p>
            <ul className="space-y-2">
              {['Acompte réduit au démarrage', 'Mensualités lissées', 'Accompagnement continu inclus'].map(f => (
                <li key={f} className="flex items-center gap-2 text-sm text-white/70">
                  <Check className="w-3.5 h-3.5 shrink-0" style={{ color: '#F4521E' }} /> {f}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ── 4. SERVICES RÉCURRENTS + MAINTENANCE ── */}
        <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: '#F4521E' }}>Abonnements optionnels</p>
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
          Pour aller <span className="italic font-normal">plus loin.</span>
        </h2>
        <p className="text-sm text-muted-foreground mb-8 max-w-xl">Des services mensuels facultatifs, à activer quand vous en avez besoin. Aucun n'est obligatoire.</p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          {recurrentServices.map(s => (
            <div key={s.slug} className="rounded-2xl border border-border bg-white p-6 flex flex-col">
              <h3 className="text-base font-bold text-foreground mb-1">{s.title}</h3>
              <p className="text-xl font-bold mb-3" style={{ color: '#F4521E' }}>{s.price}</p>
              <p className="text-sm text-muted-foreground leading-relaxed flex-1">{s.desc}</p>
              <Link href={`/services/${s.slug}`} className="mt-4 text-xs font-medium inline-flex items-center gap-1 hover:gap-2 transition-all" style={{ color: '#F4521E' }}>
                Détails <ArrowUpRight className="w-3 h-3" />
              </Link>
            </div>
          ))}
        </div>

        {/* Paliers maintenance */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4 mt-4">
          {maintenancePlans.map(m => (
            <div key={m.name} className={`rounded-2xl border p-7 bg-white flex flex-col ${m.recommended ? 'border-foreground ring-1 ring-foreground' : 'border-border'}`}>
              {m.recommended && <span className="text-xs font-semibold px-3 py-1 rounded-full mb-4 inline-block w-fit" style={{ backgroundColor: '#F4521E', color: '#fff' }}>Recommandé</span>}
              <p className="font-bold text-foreground text-lg">Maintenance {m.name}</p>
              <p className="text-3xl font-bold text-foreground mt-1 mb-6">{m.price}</p>
              <ul className="space-y-3 flex-1">
                {m.features.map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="w-3.5 h-3.5 shrink-0" style={{ color: '#F4521E' }} />{f}
                  </li>
                ))}
              </ul>
              <Link href="/contact?service=maintenance" className="mt-8 flex items-center justify-center gap-2 bg-foreground text-white font-semibold px-5 py-2.5 rounded-full text-sm hover:bg-foreground/90 transition-colors">
                Choisir ce plan <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ))}
        </div>

        <p className="text-xs text-muted-foreground mb-16 mt-2">
          Vidéo IA, visibilité IA, formation… le catalogue complet est sur la{' '}
          <Link href="/services" className="underline font-medium hover:text-foreground transition-colors">page Services</Link>.
        </p>

        {/* ── 5. FAQ TARIFS ── */}
        <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: '#F4521E' }}>Questions fréquentes</p>
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-8">
          Tout savoir <span className="italic font-normal">sur les prix.</span>
        </h2>
        <div className="divide-y divide-border border-y border-border mb-16">
          {tarifsFaq.map(f => (
            <details key={f.q} className="group py-5">
              <summary className="flex items-center justify-between cursor-pointer list-none">
                <span className="font-semibold text-foreground text-sm sm:text-base pr-6">{f.q}</span>
                <span className="shrink-0 text-muted-foreground transition-transform group-open:rotate-45" style={{ color: '#F4521E' }}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 1v14M1 8h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
                </span>
              </summary>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed pr-8">{f.a}</p>
            </details>
          ))}
        </div>

        {/* ── 6. CTA ── */}
        <div className="rounded-2xl bg-foreground p-8 md:p-10 text-center">
          <h3 className="text-xl sm:text-2xl font-bold text-white mb-3">Un projet en tête ?</h3>
          <p className="text-white/60 mb-6 text-sm">Devis gratuit et personnalisé sous 24h — sans engagement.</p>
          <Link href="/contact" className="inline-flex items-center gap-2 bg-white text-foreground font-semibold px-6 sm:px-8 py-3 sm:py-4 rounded-full hover:bg-white/90 transition-all text-sm sm:text-base">
            Demander mon devis <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

      </div>
    </div>
  )
}
