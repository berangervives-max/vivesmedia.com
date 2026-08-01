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
