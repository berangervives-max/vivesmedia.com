# Calibrage Cal.com — vivesmedia.com

> Synthèse de 7 sources (Cal.com Docs, blog Event Types, blog Event Settings, Ultimate setup guide, FAQ, Embed, comparatifs Koalendar/Zapier/Efficient.app). 28/06/2026.
> Objectif : avoir **3 outils de RDV** propres et cohérents — Calendly (déjà en place), Google Agenda + Meet (déjà en place), **Cal.com (à finaliser)** — affichés avec leurs vrais logos dans `/cms/agenda`.

## Pourquoi Cal.com en plus de Calendly
- **Plan gratuit le plus généreux du marché** : réservations illimitées, connexions agenda illimitées, workflows (rappels SMS/email), paiements Stripe — là où Calendly bride le plan gratuit à 1 type d'événement.
- **Open-source / self-host possible**, marque blanche, URL propre `cal.com/vivesmedia`.
- Sert de **filet** si quota/limite Calendly, et de **preuve de modernité** (outil tech).

## Étapes de configuration (≈ 15 min — connexion requise, toi seul)

1. **Créer le compte** sur https://cal.com → réserver le username **`vivesmedia`** → ton lien public devient `https://cal.com/vivesmedia` (déjà câblé par défaut dans Paramètres → Liens connectés).
2. **Connecter Google Agenda** (App Store Cal.com → Google Calendar) : sync temps réel + anti-conflit. Choisir l'agenda où écrire les RDV. → évite le double-booking avec Calendly.
3. **Connecter la visio** : Google Meet (ou Cal Video natif) comme lieu par défaut → lien visio généré à chaque réservation.
4. **Disponibilités** : créer un planning « Heures pro » (ex. Lun–Ven 9h–18h), fuseau Europe/Paris, + *date overrides* pour congés. Cal.com convertit automatiquement au fuseau du prospect.
5. **Créer les 3 types d'événement** (identiques à la logique Calendly, voir `/cms/agenda`) :
   - **Appel découverte — 30 min** (lieu : Meet) — le principal, pour les prospects.
   - **Présentation maquette — 45 min** (lieu : Meet).
   - **Formation admin — 1h à 2h** (lieu : Meet).
   - Buffers : 10 min avant/après. Préavis mini : 4 h. Fenêtre de réservation : 30 jours glissants.
6. **Workflows (rappels)** : activer rappel email J-1 + rappel SMS H-1 (gratuit sur Cal.com), + email de remerciement après le RDV.
7. **Champs de réservation** : Nom, Email, + question « Décris ton projet en 1 phrase » + champ « Site actuel (si existant) » → qualifie le lead avant l'appel.
8. **Branding** : couleur d'accent `#F4521E` (orange vivesmedia), logo, masquer la mention « Cal.com » si plan le permet.
9. **UTM / attribution** : Cal.com capture utm_source/medium/campaign → utile pour mesurer d'où viennent les réservations (réseaux, site, prospection).

## Bonnes pratiques observées (sources)
- **Embed inline** de la page de réservation directement sur le site (déjà fait pour Calendly dans `/cms/agenda`) → +conversion, le prospect ne quitte pas la page.
- **Prefill** nom/email via query params (`?name=…&email=…`) quand on connaît déjà le prospect (ex. depuis un email de prospection) → réservation en 1 clic.
- **Un seul agenda source de vérité** (Google Agenda) connecté aux deux outils → jamais de double réservation.
- **Round-robin / collective** : inutile en solo, à activer seulement si l'agence grossit.

## État côté code (fait automatiquement)
- ✅ Lien par défaut `https://cal.com/vivesmedia` câblé (`/cms/agenda` + `/cms/settings`).
- ✅ Vrais logos (Calendly bleu #006BFF, Google Agenda 4 couleurs, Cal.com noir) sur les 3 cartes — `src/components/BrandLogos.tsx`.
- ⏳ **À faire par toi** : créer réellement le compte `cal.com/vivesmedia` (étapes 1–8). Tant que le compte n'existe pas, le lien public renverra une page « utilisateur introuvable » → fais-le avant de mettre le lien en avant publiquement.
