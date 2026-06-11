# RAPPORT — vivesmedia.com v2.0
**Date :** 02/06/2026  
**Statut :** Prêt à tester en local · Déploiement Vercel à configurer

---

## Ce qui a été construit

### Infrastructure
- `src/lib/supabase.ts` — Client Supabase (browser + serveur + service role)
- `src/types/index.ts` — Types TypeScript complets (Client, Devis, Facture, Commande, Article, Service, Temoignage)
- `src/services/supabase.service.ts` — CRUD complet pour toutes les tables
- `src/services/email.service.ts` — Resend : devis reçu, facture, relance, témoignage, digest newsletter, alerte impayées, rapport mensuel

### Layout & Navigation
- `src/components/layout/Navbar.tsx` — Navbar flottante avec menu mobile
- `src/components/layout/Footer.tsx` — Footer avec newsletter connectée à Supabase
- `src/components/layout/SmoothScroll.tsx` — Lenis smooth scroll
- `src/app/layout.tsx` — Layout principal + Google Analytics G-516900135 + fonts Inter

### Pages publiques (route group `(public)`)
- `/` — Home complète : Hero, LogoMarquee, About (CountUp animé), Services, Work, Testimonials (Supabase + fallback statique), FAQ accordion, CTA
- `/blog` — Liste articles (Supabase + fallback statique), card featured
- `/blog/[slug]` — Article complet avec metadata dynamique + CTA final
- `/services` — 5 services détaillés avec features
- `/tarifs` — 3 plans + maintenance + CTA
- `/contact` — Formulaire devis multi-étapes (type projet + budget + coordonnées) → Supabase + email Resend
- `/a-propos` — Timeline parcours + 4 piliers + CTA
- `/realisations` — 4 projets avec images

### CMS Admin (route group `(cms)`)
- `/cms/login` — Auth Supabase (email + mot de passe)
- `/cms/dashboard` — Stats temps réel (clients, devis non lus, factures en retard, revenu mois)
- `/cms/clients` — CRUD complet avec recherche et filtres statut
- `/cms/devis` — Vue inbox avec gestion statut (nouveau → accepté/refusé)
- `/cms/factures` — CRUD complet + calcul automatique HT/TVA/TTC + envoi email Resend
- `/cms/commandes` — Vue lecture seule des paiements Stripe
- `/cms/articles` — CRUD complet avec éditeur HTML + slug auto-généré + toggle publié
- `/cms/temoignages` — CRUD avec étoiles interactives + toggle actif
- `/cms/newsletter` — Liste abonnés + export CSV

### API Routes
- `POST /api/devis` — Reçoit formulaire → Supabase + email admin + confirmation client
- `POST /api/newsletter` — Subscribe email → Supabase (upsert)
- `POST /api/stripe/webhook` — Checkout completed → Commande Supabase · Payment failed → Facture en_retard

### SEO
- `src/app/sitemap.ts` — Sitemap dynamique (pages statiques + articles Supabase)
- `src/app/robots.ts` — CMS et API exclus du crawl
- Metadata complète sur chaque page (title, description, canonical, openGraph)
- Google Analytics GA4 : G-516900135

### Base de données
- `backend/supabase/migrations/001_schema.sql` — Schéma complet (8 tables + triggers + RLS)
- `backend/supabase/migrations/002_automations.sql` — pg_cron automations

---

## Variables d'env à compléter dans `.env.local`

```
STRIPE_WEBHOOK_SECRET=whsec_PLACEHOLDER   ← Dashboard Stripe → Webhooks → endpoint secret
RESEND_API_KEY=re_PLACEHOLDER             ← resend.com → API Keys
```

(Supabase et Stripe publishable/secret sont déjà configurés)

---

## Base de données Supabase — À configurer

1. Aller sur https://supabase.com/dashboard/project/qoaxrllceanazcregkvy
2. SQL Editor → Coller et exécuter `backend/supabase/migrations/001_schema.sql`
3. SQL Editor → Coller et exécuter `backend/supabase/migrations/002_automations.sql`
4. Authentication → Users → Créer l'admin : `contact@vivesmedia.com`
5. Extensions → Activer `pg_cron` (pour les automations)

---

## Automations — Ce qui est configuré

| Automation | Déclencheur | Email |
|-----------|-------------|-------|
| Devis abandonné 48h | pg_cron tous les 2j 10h | Relance au lead |
| Facture impayée | pg_cron chaque jour 9h | Alerte admin |
| Rapport mensuel | pg_cron 1er du mois 8h | Rapport admin |
| Devis reçu | API /api/devis (immédiat) | Admin + client |
| Facture envoyée | Bouton CMS manuel | Client |
| Paiement Stripe | Webhook automatique | — |
| Demande témoignage 30j | À configurer via n8n | Client |
| Upsell maintenance 6m | À configurer via n8n | Client |
| Digest newsletter 15/mois | À configurer via Vercel cron | Abonnés |

---

## Google OAuth — À configurer manuellement

Les intégrations suivantes nécessitent une configuration OAuth manuelle :
- **Gmail** — Google Cloud Console → OAuth 2.0 → compte `contact@vivesmedia.com`
- **Google Sheets** — Même OAuth
- **Google Drive** — Même OAuth  
- **Google Calendar** — Même OAuth
- **Google Analytics** — Déjà intégré via GA4 tag G-516900135

---

## Déploiement Vercel

```bash
# 1. Installer Vercel CLI
npm i -g vercel

# 2. Déployer
cd vivesmedia.com/app
vercel

# 3. Ajouter les env vars dans Vercel Dashboard :
#    NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY,
#    SUPABASE_SERVICE_ROLE_KEY, NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
#    STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, RESEND_API_KEY,
#    NEXT_PUBLIC_SITE_URL=https://vivesmedia.com

# 4. Configurer le webhook Stripe
#    Dashboard Stripe → Webhooks → Add endpoint
#    URL : https://vivesmedia.com/api/stripe/webhook
#    Events : checkout.session.completed, payment_intent.succeeded, payment_intent.payment_failed
```

---

## Lancer en local

```bash
cd "C:\Users\beran\OneDrive\Bureau\SHOPIFY HYDROGEN\vivesmedia.com\app"
npm run dev
# → localhost:3000
```

---

*Rapport généré automatiquement — 02/06/2026*
