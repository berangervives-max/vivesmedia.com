// Connexion /cms/services -> pages publiques /services & /tarifs, en ISR.
// Lit la table `services` (Supabase REST) au build + rafraichissement horaire,
// et SURCHARGE le prix d'une formule quand un service du catalogue porte le meme nom.
// Repli integral sur les valeurs statiques de tarifs-data.ts : SEO et build restent surs.
import type { Formule } from '@/data/tarifs-data'

type LivePrice = { prix: number; prix_mensuel: number }

const norm = (s: string) =>
  (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]/g, '')

const formatEUR = (n: number) => `${new Intl.NumberFormat('fr-FR').format(Math.round(n))}€`

/** Prix vivants du catalogue /cms/services, indexes par nom normalise. Vide si indisponible. */
export async function getLivePrices(): Promise<Map<string, LivePrice>> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const out = new Map<string, LivePrice>()
  if (!url || !key) return out
  try {
    const res = await fetch(
      `${url}/rest/v1/services?select=nom,prix,prix_mensuel&actif=eq.true`,
      { headers: { apikey: key, Authorization: `Bearer ${key}` }, next: { revalidate: 3600 } },
    )
    if (!res.ok) return out
    const rows = (await res.json()) as { nom: string; prix: number | null; prix_mensuel: number | null }[]
    for (const r of rows) out.set(norm(r.nom), { prix: Number(r.prix) || 0, prix_mensuel: Number(r.prix_mensuel) || 0 })
  } catch { /* repli statique */ }
  return out
}

/** Renvoie les formules avec le prix (paiement unique) surcharge par le catalogue quand il existe. */
export function applyLivePrices(formules: Formule[], live: Map<string, LivePrice>): Formule[] {
  if (!live.size) return formules
  return formules.map(f => {
    const hit = live.get(norm(f.title))
    return hit && hit.prix > 0 ? { ...f, price: formatEUR(hit.prix) } : f
  })
}
