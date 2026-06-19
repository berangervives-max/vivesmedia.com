# vivesmedia.com — Plan pour être CERTIFIÉ (badges légitimes sur le site)
> 17/06/2026 · Sources vérifiées (Shopify/Klaviyo/Google/HubSpot)
> Règle : on n'affiche un badge QUE lorsqu'il est réellement obtenu.

## Réalité : qui fait quoi
- **Toi (irremplaçable)** : créer les comptes, passer les examens (auth + identité).
- **Moi (tout le reste)** : pré-remplir les inscriptions, te fournir une **fiche de révision par examen** pour réussir du 1er coup, coder l'affichage des badges sur le site.

---

## Les certifications à viser (ordre = rapport crédibilité / effort / coût)

| # | Certification | Coût | Effort | Pourquoi pour toi |
|---|---|---|---|---|
| 1 | **Shopify Partner Program** (adhésion) | Gratuit, instantané | 15 min | Pré-requis ; débloque l'Academy + annuaire (backlink) |
| 2 | **Shopify Foundations** (Partner Academy) | Gratuit | ~2-3 h | Badge officiel Shopify, base de tout |
| 3 | **Shopify Theme Development / Liquid** | Gratuit | ~4-6 h | Colle à ton métier (Hydrogen/Liquid) |
| 4 | **Klaviyo Product Certification** (Klaviyo Academy) | Gratuit | ~2 h | Tu fais déjà du Klaviyo → badge email/CRM |
| 5 | **Google Ads Search + GA4** (Skillshop) | Gratuit | ~3-4 h | Tu fais du Google Ads → badges reconnus |
| 6 | **HubSpot — Inbound / Email Marketing** (Academy) | Gratuit | ~2-3 h | Badges marketing très connus, crédibilité B2B |
| 7 | **Meta Blueprint** | Payant (~99 $/exam) | — | Optionnel, plus tard |

> 4 « blocs » suffisent pour une page Certifications crédible : **Shopify + Klaviyo + Google + HubSpot**. Tout gratuit.

---

## Parcours détaillé

### 1. Shopify Partner Program (à faire en premier)
- **Lien** : partners.shopify.com → « Join now »
- **Toi** : email pro, vivesmedia.com, SIRET, accepter les CGU.
- **Profil prêt à coller** : voir [PARTENARIATS_ET_AFFILIATION.md](./PARTENARIATS_ET_AFFILIATION.md)
- **Gain immédiat** : test stores illimités + accès **Shopify Partner Academy** + **listing annuaire (backlink dofollow)**.

### 2-3. Shopify Partner Academy (examens gratuits)
- **Accès** : academy.shopify.com (ou onglet Academy du dashboard Partner)
- **Ordre conseillé** : Foundations → Theme Development → Liquid → (Marketing).
- **Format** : cours + study guide + examen QCM en ligne, gratuit, repassable.
- **Moi** : je te génère une **fiche de révision condensée par examen** (points clés + pièges du QCM).

### 4. Klaviyo (Academy + K:Partners)
- **Certif individuelle** : academy.klaviyo.com → « Klaviyo Product Certification » (gratuit).
- **Programme agence** : klaviyo.com/partners/become-a-partner → « As a service partner » (accepter les terms).
- **Moi** : fiche de révision Klaviyo + texte de candidature agence.

### 5. Google Skillshop
- **Lien** : skillshop.withgoogle.com → Google Ads Search Certification + GA4.
- **Moi** : fiche de révision Ads + GA4.

### 6. HubSpot Academy
- **Lien** : academy.hubspot.com → Inbound + Email Marketing (gratuit).
- **Moi** : fiche de révision.

---

## Affichage sur le site (une fois les badges OBTENUS)
- Composant **`CertificationsSection`** prêt (code dans [PARTENARIATS_ET_AFFILIATION.md](./PARTENARIATS_ET_AFFILIATION.md)) → bandeau sous le Hero.
- Chaque programme fournit un **badge officiel** (image/lien) à déposer dans `public/badges/`.
- Optionnel : page `/certifications` (je la code sur le modèle de `/divulgation`).

---

## Checklist
- [ ] (Toi) Shopify Partner Program — inscription
- [ ] (Moi) Fiches de révision : Shopify Foundations, Theme/Liquid, Klaviyo, Google Ads, GA4, HubSpot
- [ ] (Toi) Passer les examens dans l'ordre
- [ ] (Toi) Récupérer les badges officiels → `public/badges/`
- [ ] (Moi) Activer `CertificationsSection` + (option) page `/certifications`
