# vivesmedia.com — Partenariats (backlinks + leads) & Affiliation
> 17/06/2026 · Objectif : backlinks dofollow de gros domaines + leads + revenus passifs
> ⚠️ Règle d'or : n'afficher un badge « Partner / Certifié » qu'APRÈS validation officielle du compte.

---

## PARTIE 1 — Programmes partenaires (= backlinks dofollow + leads)

### Priorité #1 — Shopify Partners ⭐
**Pourquoi** : tu fais du Hydrogen/Shopify → profil dans l'annuaire Shopify (gros DR) + clients qui cherchent un expert.
**Lien** : partners.shopify.com → « Become a partner »
**Ce dont tu as besoin (toi)** : email pro, SIRET, vivesmedia.com, ~15 min.

**Texte de profil PRÊT À COLLER :**

- **Business name** : vivesmedia.com
- **Tagline (≤ 60 car.)** : `Sites Shopify sur-mesure, pensés pour convertir`
- **Bio courte** :
> vivesmedia.com est un studio web freelance basé à Avignon (full remote, partout en France). Nous concevons des boutiques Shopify et Hydrogen sur-mesure, rapides et orientées conversion : design premium, SEO technique, intégration CRM et automatisation IA. Un interlocuteur unique du brief à la livraison, sans sous-traitance cachée.
- **Services à cocher** : Store setup · Custom storefront / Hydrogen · Theme development · SEO · Migration · Marketing & automation
- **Spécialités** : Hydrogen (Remix), TypeScript, Tailwind, SEO e-commerce, Klaviyo, CRM/IA
- **Zone** : France (full remote)
- **Langues** : Français, Anglais

### Autres programmes (par ordre d'intérêt backlink + lead)
| Programme | Lien | Backlink annuaire | Intérêt |
|---|---|---|---|
| **Klaviyo Partner** | klaviyo.com/partners | ✅ profil agence | tu fais déjà du Klaviyo |
| **Webflow Experts** | webflow.com/experts | ✅ (selon palier) | annuaire visité par prospects |
| **Framer Partners** | framer.com/partners | ✅ | tu utilises déjà Framer |
| **Vercel Partners** | vercel.com/partners | ✅ | crédibilité technique (tu héberges là) |
| **HubSpot Solutions** | hubspot.com/partners | ✅ annuaire | leads B2B |
| **Stripe Partners** | stripe.com/partners | ⚠️ variable | crédibilité paiement |
| **Malt / Codeur / Sortlist** | profils freelance | ✅ dofollow | leads directs + backlink |

> Astuce SEO : avec Ahrefs, vérifier lesquels de ces annuaires pointent déjà vers tes concurrents (agences web Avignon) → prioriser ceux-là.

---

## PARTIE 2 — Affiliation (= revenus passifs, PAS de SEO)

Liens en `nofollow`/`sponsored` (obligatoire) → aucun effet ranking, juste des commissions.
- **Réseaux** : Awin, Effiliation, Affilae, Kwanko (FR) · Impact, PartnerStack, ShareASale (intl)
- **Programmes directs pertinents pour ton audience** : Shopify, Hostinger, o2switch, LemonSqueezy, Framer, Notion, Webflow
- **Où les placer** : dans les articles de blog (« les outils que j'utilise »), jamais en bannière sur les pages commerciales.
- **Obligation légale** : page de divulgation → ✅ DÉJÀ CRÉÉE (`/divulgation`) + lien footer.

---

## PARTIE 3 — Mise en évidence sur le site

### ✅ Déjà fait (cette session)
- Page **`/divulgation`** (divulgation d'affiliation & partenariats) — `src/app/(public)/divulgation/page.tsx`
- **Lien footer** vers `/divulgation`

### ⏳ À activer APRÈS validation des comptes partenaires (sinon = fausse certif)
Le composant `LogoMarquee` existant (« Des outils fiables, intégrés proprement ») reste OK tel quel.
Quand tes comptes Shopify Partner / Klaviyo seront validés, ajouter un bandeau **Certifications** sous le Hero. Composant prêt à créer : `src/components/home/CertificationsSection.tsx`

```tsx
// À CRÉER une fois les partenariats VALIDÉS (badges officiels fournis par chaque programme)
const BADGES = [
  // { src: '/badges/shopify-partner.svg', alt: 'Shopify Partner', href: 'https://partners.shopify.com' },
  // { src: '/badges/klaviyo-partner.svg', alt: 'Klaviyo Partner', href: 'https://www.klaviyo.com/partners' },
]

export default function CertificationsSection() {
  if (BADGES.length === 0) return null
  return (
    <section className="py-12 bg-white border-y border-border">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-6">Partenaire certifié</p>
        <div className="flex flex-wrap items-center justify-center gap-10">
          {BADGES.map((b) => (
            <a key={b.alt} href={b.href} target="_blank" rel="noopener noreferrer">
              <img src={b.src} alt={b.alt} className="h-10 w-auto object-contain" />
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
// puis l'importer dans src/app/(public)/page.tsx, juste après <HeroSection />
```

### Galeries de design (backlinks white-hat — soumettre une réalisation)
À soumettre (compte toi, contenu moi) : **Awwwards** (~35 $/soumission), **CSS Design Awards**, **Land-book** (gratuit), **Lapa.ninja**, **One Page Love**, **Httpster**.
→ Projet conseillé à soumettre : ta meilleure réalisation (ex. `realisations/sesame-informatique`).
→ Si primé : ajouter les badges « Awwwards » dans le même `CertificationsSection`.

---

## CHECKLIST D'ACTION
- [ ] (Toi) Créer compte **Shopify Partners** avec le texte ci-dessus
- [ ] (Toi) Créer comptes Klaviyo Partner + Malt/Codeur
- [ ] (Moi) Vérifier via Ahrefs les annuaires qui lient les concurrents
- [ ] (Toi) S'inscrire à 1–2 réseaux d'affiliation → récupérer les IDs
- [ ] (Moi) Rédiger 1er article blog avec liens affiliés + activer le composant Certifications une fois validé
- [ ] (Toi) Soumettre 1 réalisation à Land-book (gratuit) pour 1er backlink galerie
