# Intégration Abby — Facturation électronique

Abby (plateforme française de facturation) est branchée au Hub pour **émettre
automatiquement une facture à chaque commande Stripe payée**.

## Ce qui a été ajouté (scaffold)

| Fichier | Rôle |
|---|---|
| `src/lib/abby.ts` | Client serveur Abby + `creerFactureAbby()` (contact → facture → ligne → finalisation) |
| `src/app/api/stripe/webhook/route.ts` | Sur `checkout.session.completed` : appelle `creerFactureAbby()` (isolé en try/catch) |
| `package.json` | Dépendance `@abby-inc/node` |

Le PDF maison (`src/lib/facture-pdf.ts`) reste en place et inchangé.

## ⚠️ Étape manuelle (Béranger uniquement)

1. Créer / se connecter au compte **Abby** lié à ton SIRET : https://abby.fr
2. Aller dans **Paramètres → Intégrations** : https://my.app-abby.com/settings/integrations
3. Générer une clé API (format `suk-…`) et **la copier immédiatement** (non récupérable ensuite).
4. Renseigner la clé comme variable d'environnement `ABBY_API_KEY` :
   - **Prod** : dashboard Vercel → Settings → Environment Variables → `ABBY_API_KEY`
   - **Dev local** : ajouter `ABBY_API_KEY=suk-…` dans `app/.env.local` (déjà gitignoré)

> Tant que `ABBY_API_KEY` n'est pas définie, l'intégration est **inactive** : les
> commandes Stripe sont enregistrées normalement, aucune facture Abby n'est créée
> (aucune erreur). Dès que la clé est présente, l'émission devient automatique.

## Hypothèse de TVA

Le code utilise `vatCode: 'FR_00HT'` = **TVA non applicable, art. 293 B du CGI**
(micro-entreprise, franchise en base). Si tu passes au régime réel, remplacer par
`FR_2000` (20 %) dans `src/lib/abby.ts`.

## Pistes d'évolution (non incluses)

- **Persister l'id de facture Abby** sur la commande (ajouter une colonne
  `abby_invoice_id` à la table `site_commandes` + l'enregistrer dans le webhook).
- **Clients B2B** : si SIRET connu, créer une `organization` Abby au lieu d'un `contact`.
- **Bouton manuel** dans le CMS factures pour émettre dans Abby les factures hors Stripe
  (virement, acompte).
- **Envoi automatique** de la facture au client par email via `abby.billing.sendByEmail`.

## Conformité

Abby se présente comme plateforme agréée pour la réforme de la facturation
électronique 2026/2027. Vérifier le statut d'immatriculation PDP à jour pour ton
cas avant de t'appuyer dessus comme unique canal légal.
