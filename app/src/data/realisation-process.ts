// Démarche projet affichée sur chaque fiche réalisation (« le comment »).
// Indépendant de la base (pas de colonne SQL) : process standard de l'agence,
// avec surcharges optionnelles par projet.

export type ProcessStep = { step: string; title: string; desc: string }

const DEFAULT_PROCESS: ProcessStep[] = [
  { step: '01', title: 'Brief & cadrage', desc: "On commence par comprendre le métier, la cible et l'objectif business : qui doit convertir, sur quoi se joue la confiance, quels concurrents. Le périmètre et l'arborescence sont fixés avant la moindre ligne de code." },
  { step: '02', title: 'Direction artistique', desc: "Moodboard, palette, typographie et maquette du parcours — validés bloc par bloc. La DA est pensée pour le secteur et pour convertir, jamais un template générique revendu." },
  { step: '03', title: 'Développement sur-mesure', desc: "Intégration en Next.js + TypeScript + Tailwind, responsive pixel-perfect, animations et performances soignées. Code propre, statique quand c'est possible, zéro page lente." },
  { step: '04', title: 'SEO & contenu', desc: "Metadata, Open Graph, Schema.org, structure de contenu et maillage interne pensés pour le référencement dès le départ. Objectif Lighthouse SEO > 90." },
  { step: '05', title: 'Livraison & déploiement', desc: "Audit qualité et sécurité, déploiement sur Vercel, configuration du domaine + HTTPS, puis prise en main. Le site est livré prêt à performer." },
]

// Surcharges par projet (optionnel). Sinon, démarche standard ci-dessus.
const OVERRIDES: Record<string, ProcessStep[]> = {}

export function getProcess(slug: string): ProcessStep[] {
  return OVERRIDES[slug] ?? DEFAULT_PROCESS
}
