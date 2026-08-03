/**
 * Préparation du HTML d'un article de blog avant injection.
 *
 * Le contenu vient de Supabase (`articles.contenu`) sous forme de HTML brut,
 * rédigé dans le /cms. Il n'a donc aucune classe : la mise en forme est portée
 * par `.article-content` dans globals.css.
 *
 * Seul cas qui ne se règle pas en CSS pur : un tableau ne peut pas défiler
 * horizontalement sans conteneur. Sur mobile (~342px de large utile), un
 * tableau à 3 colonnes s'écrase en colonnes de ~100px illisibles. On l'enveloppe
 * donc dans un `.article-table` qui gère le scroll horizontal.
 *
 * Volontairement une simple substitution de chaînes plutôt qu'un parseur :
 * le contenu est généré depuis du Markdown (pas de <table> imbriqué), et une
 * imbrication mal fermée serait de toute façon rattrapée par le parseur HTML
 * du navigateur.
 */
export function enhanceArticleHtml(html: string | null | undefined): string {
  if (!html) return ''
  return html
    .replace(/<table(?=[\s>])/gi, '<div class="article-table"><table')
    .replace(/<\/table\s*>/gi, '</table></div>')
}

export type ArticleHeading = { id: string; text: string; level: 2 | 3 }

// Combining diacritical marks (U+0300–U+036F) — construit via fromCharCode pour
// éviter tout risque d'encodage silencieux d'un caractère combinant littéral en source.
const DIACRITICS_RE = new RegExp('[' + String.fromCharCode(0x0300) + '-' + String.fromCharCode(0x036f) + ']', 'g')

function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD').replace(DIACRITICS_RE, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'section'
}

/**
 * Injecte un `id` sur chaque h2/h3 (ancres du sommaire) et retourne la liste
 * des titres dans le même passage — un seul walk du HTML garantit que les
 * slugs du sommaire et ceux injectés dans le DOM ne peuvent jamais diverger.
 */
export function processArticleHtml(html: string | null | undefined): { html: string; headings: ArticleHeading[] } {
  if (!html) return { html: '', headings: [] }
  const headings: ArticleHeading[] = []
  const seen = new Map<string, number>()
  const withIds = html.replace(/<h([23])((?:\s[^>]*)?)>([\s\S]*?)<\/h\1>/gi, (_m, lvl: string, attrs: string, inner: string) => {
    const text = inner.replace(/<[^>]+>/g, '').trim()
    if (!text) return `<h${lvl}${attrs}>${inner}</h${lvl}>`
    let slug = slugifyHeading(text)
    const count = seen.get(slug) ?? 0
    seen.set(slug, count + 1)
    if (count > 0) slug = `${slug}-${count}`
    headings.push({ id: slug, text, level: Number(lvl) as 2 | 3 })
    return `<h${lvl}${attrs} id="${slug}">${inner}</h${lvl}>`
  })
  return { html: enhanceArticleHtml(withIds), headings }
}

/** Temps de lecture estimé — 200 mots/minute (moyenne lecture silencieuse FR). */
export function estimateReadingTime(html: string | null | undefined): number {
  if (!html) return 1
  const words = html.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.round(words / 200))
}
