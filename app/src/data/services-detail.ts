// Contenu détaillé/explicatif par service — affiché en section « En détail »
// sur la page publique /services/[slug]. Adapté des cours du Hub, version vente.

export type DeepDivePoint = { title: string; desc: string }
export type DeepDiveSection = { title: string; intro?: string; points?: DeepDivePoint[] }

export const SERVICES_DETAIL: Record<string, DeepDiveSection[]> = {
  "site-vitrine": [
    {
      title: "Comment se déroule votre projet",
      intro: "Un cadre clair en 4 étapes — vous validez à chaque palier, rien n'est imposé.",
      points: [
        { title: "1 · Brief (30 min)", desc: "On cerne votre activité, vos clients et ce qui vous différencie. Devis sous 24h, sans engagement." },
        { title: "2 · Maquette (48h)", desc: "Je vous présente le design. 2 rounds de corrections inclus. Aucune ligne de code avant votre validation." },
        { title: "3 · Développement", desc: "Intégration, SEO technique, performances, pages légales RGPD, certificat SSL." },
        { title: "4 · Mise en ligne", desc: "Votre site est live, et je reste disponible 30 jours pour tout ajustement." },
      ],
    },
    {
      title: "Ce qui rend un site vitrine performant",
      intro: "Un beau site ne suffit pas : il doit transformer un visiteur en prise de contact.",
      points: [
        { title: "Sur-mesure, jamais un template", desc: "Chaque page est pensée pour votre métier et votre façon de convaincre." },
        { title: "Orienté contact", desc: "CTA visibles, formulaire qualifié, coordonnées accessibles — le visiteur sait toujours quoi faire." },
        { title: "Rapide et mobile", desc: "La majorité de vos visiteurs sont sur mobile : performance et lisibilité prioritaires (objectif Lighthouse > 90)." },
        { title: "SEO local intégré", desc: "Visible quand un client cherche votre métier dans votre ville." },
      ],
    },
    {
      title: "Après la livraison : vous êtes autonome",
      intro: "1h de formation incluse — vous gérez vos contenus sans dépendre de personne.",
      points: [
        { title: "Modifier textes & photos", desc: "Depuis une interface simple, sans toucher au code." },
        { title: "Recevoir vos demandes", desc: "Chaque message du formulaire arrive directement par email (anti-spam inclus)." },
        { title: "Suivre vos visiteurs", desc: "Google Analytics intégré : combien de visiteurs, d'où ils viennent." },
      ],
    },
  ],

  "site-catalogue": [
    {
      title: "Catalogue ou e-commerce : la bonne brique",
      intro: "Un site catalogue présente vos produits et génère des demandes — sans paiement en ligne. Idéal en B2B et pour la vente en rendez-vous.",
      points: [
        { title: "Catalogue", desc: "On présente (photos, specs, prix ou « sur devis ») et le client demande un devis ou vient au showroom." },
        { title: "E-Commerce", desc: "On présente ET on encaisse en ligne (panier, paiement) — voir l'offre dédiée." },
      ],
    },
    {
      title: "Trouver le bon produit en 2 clics",
      intro: "La valeur d'un catalogue, c'est que le client trouve vite. On structure selon SA logique, pas votre ERP.",
      points: [
        { title: "Catégories claires", desc: "5 à 8 grandes familles valent mieux que 40 sous-catégories." },
        { title: "Filtres pertinents", desc: "Matière, dimension, couleur, prix, usage… pour réduire 200 produits à 3." },
        { title: "Jusqu'à 250 fiches", desc: "Import CSV pour les grandes gammes — pas de saisie une par une." },
      ],
    },
    {
      title: "Des fiches qui servent aussi en rendez-vous",
      points: [
        { title: "Fiche produit complète", desc: "Photos nettes, caractéristiques homogènes, et un bénéfice client en une phrase." },
        { title: "Fiche technique PDF", desc: "Téléchargeable — parfaite pour les achats B2B et les RDV commerciaux." },
        { title: "Demande de devis par produit", desc: "Bouton sur chaque fiche → notification email instantanée. Répondez vite, gagnez l'affaire." },
      ],
    },
  ],

  "site-ecommerce": [
    {
      title: "Votre boutique, vue d'ensemble",
      intro: "Une boutique en ligne est un parcours : découvrir → ajouter au panier → payer → recevoir ses emails. Chaque maillon compte.",
      points: [
        { title: "Paiement Stripe & PayPal", desc: "Les 2 modes préférés des acheteurs français, sécurisés dès le lancement." },
        { title: "Stocks temps réel", desc: "Mis à jour à chaque vente, avec alertes — fini la rupture vendue." },
        { title: "Emails transactionnels", desc: "Confirmation, expédition, relance panier abandonné — automatiques et à votre image." },
      ],
    },
    {
      title: "Gérer la boutique au quotidien",
      intro: "Tout depuis le dashboard admin, sans toucher au code. 2h de formation à la livraison.",
      points: [
        { title: "Produits", desc: "Titre, photos, variantes, prix, description SEO." },
        { title: "Commandes", desc: "Suivi du statut (payée, préparée, expédiée), envoi du suivi client." },
        { title: "Promotions", desc: "Codes promo, soldes, frais de port par zone." },
      ],
    },
    {
      title: "Vendre plus : tunnel & fidélisation",
      intro: "Le tunnel (panier → checkout → paiement) est l'endroit où l'argent rentre… ou se perd.",
      points: [
        { title: "Réduire l'abandon de panier", desc: "Frais de port affichés tôt + relance automatique (cause n°1 d'abandon = surprise au paiement)." },
        { title: "Fidéliser", desc: "Emails post-achat, retours simples : acquérir coûte cher, fidéliser est le levier le plus rentable." },
        { title: "Mesurer ce qui compte", desc: "Taux de conversion, panier moyen, produits stars — décidez avec les chiffres." },
      ],
    },
  ],

  "formation-ia": [
    {
      title: "Ce que vous saurez faire",
      intro: "Des réflexes concrets, à partir de votre métier réel — 80 % de pratique, 20 % de théorie.",
      points: [
        { title: "Comprendre l'IA générative", desc: "Ce qu'elle sait faire, ses limites, pourquoi elle se trompe parfois." },
        { title: "Rédiger de bons prompts", desc: "Une méthode claire (C.R.A.F.T.) pour un résultat exploitable en 2-3 essais, pas 20." },
        { title: "L'intégrer à votre quotidien", desc: "Emails, devis, contenus, recherche, analyse — vos tâches récurrentes." },
        { title: "Fiabiliser & rester en règle", desc: "Vérifier les résultats (anti-hallucination) et respecter RGPD / AI Act." },
      ],
    },
    {
      title: "Comment se déroule une session",
      intro: "Sessions visio de 2h, en individuel, adaptées avant même qu'on se connecte (questionnaire préparatoire).",
      points: [
        { title: "Cas d'usage réels", desc: "On travaille en direct sur VOS situations, pas des exemples génériques." },
        { title: "Vous repartez avec", desc: "Workbook d'exercices, cheat sheet de 20+ prompts, replay vidéo, plan d'action 30 jours." },
        { title: "Suivi 30 jours", desc: "Questions par email — vous n'êtes pas seul face aux blocages." },
      ],
    },
  ],

  "video-contenu-ia": [
    {
      title: "Comment vos vidéos sont produites",
      intro: "Chaque mois, 8 à 16 vidéos prêtes à poster — vous validez le plan avant production.",
      points: [
        { title: "Calendrier mensuel", desc: "Je propose 4 semaines de sujets, vous approuvez ou ajustez." },
        { title: "Production IA pro", desc: "Vidéo, sous-titres, musique, textes — outils premium (Higgsfield, Kling)." },
        { title: "Livraison hebdo", desc: "MP4 + légendes chaque lundi, prêts à publier (ou je publie pour vous)." },
      ],
    },
    {
      title: "Ce qui fait performer une vidéo",
      points: [
        { title: "Un style de marque", desc: "Couleurs, ton, thèmes définis une fois → vous êtes reconnaissable en 1 seconde." },
        { title: "Le bon format", desc: "Reels 9:16 (Insta/TikTok/Shorts) + 16:9 (LinkedIn/site)." },
        { title: "Les 3 premières secondes", desc: "Le « hook » décide de tout ; sous-titres systématiques (on regarde sans le son)." },
      ],
    },
  ],

  "visibilite-ia": [
    {
      title: "Le nouveau terrain : les moteurs IA",
      intro: "De plus en plus de gens demandent à ChatGPT, Perplexity, Gemini plutôt qu'à Google. Le but : être une source citée.",
      points: [
        { title: "SEO", desc: "Ranker sur Google — la fondation." },
        { title: "AEO", desc: "Apparaître dans les réponses / AI Overviews." },
        { title: "GEO", desc: "Être cité comme source par les IA génératives." },
      ],
    },
    {
      title: "Comment on vous rend citable",
      points: [
        { title: "Audit citations", desc: "On teste 50+ requêtes de votre secteur dans chaque IA : où apparaissez-vous (ou pas)." },
        { title: "Contenu structuré (AEO)", desc: "Réponses directes, titres clairs, FAQ, données Schema.org que les IA réutilisent." },
        { title: "Suivi mensuel + Brand Radar", desc: "Qui vous cite, à quelle fréquence, dans quel contexte — avec alertes." },
      ],
    },
  ],

  "seo": [
    {
      title: "Les 3 piliers du SEO",
      intro: "Le SEO n'est pas magique : c'est une méthode appliquée mois après mois. Premiers résultats en 30 à 90 jours.",
      points: [
        { title: "Technique", desc: "Un site rapide, propre, mobile, lisible par Google (Core Web Vitals)." },
        { title: "Contenu", desc: "Des pages qui répondent précisément aux questions de vos clients." },
        { title: "Autorité", desc: "Des liens de qualité (backlinks) d'autres sites de confiance." },
      ],
    },
    {
      title: "Viser les requêtes qui rapportent",
      points: [
        { title: "Volume ET intention", desc: "« dépannage fuite Avignon » (prêt à acheter) > « plomberie » (volume creux)." },
        { title: "On-page soigné", desc: "Title + meta = votre « pub » gratuite sur Google ; structure Hn et maillage interne." },
        { title: "2 articles/mois", desc: "Contenu ciblé publié chaque mois pour capter du trafic qualifié durable." },
      ],
    },
    {
      title: "Mesurer, en toute transparence",
      points: [
        { title: "Rapport mensuel", desc: "Positions sur 20 mots-clés, trafic, actions réalisées, plan du mois suivant." },
        { title: "L'indicateur qui compte", desc: "Pas les « jolis chiffres » : les conversions (appels, formulaires, ventes)." },
      ],
    },
  ],

  "crm-automatisation": [
    {
      title: "Automatiser pour récupérer du temps",
      intro: "On confie à des workflows et des agents IA vos tâches répétitives — ça tourne même quand vous dormez.",
      points: [
        { title: "Agents IA 24/7", desc: "Qualifient les leads, répondent, envoient des devis automatiquement." },
        { title: "Séquences de prospection", desc: "Relances automatiques J+3 / J+7 / J+14 selon le comportement du prospect." },
        { title: "CRM intelligent", desc: "Scoring chaud/tiède/froid + alertes quand un prospect interagit." },
      ],
    },
    {
      title: "Quoi automatiser en premier",
      intro: "On vise ce qui est fréquent ET chronophage — le meilleur ROI.",
      points: [
        { title: "Relances & devis", desc: "Devis généré depuis un formulaire, confirmations et rappels SMS/email." },
        { title: "Onboarding client", desc: "Tout le parcours post-signature automatisé : accueil, documents, relances." },
        { title: "Connecté à vos outils", desc: "Workflows n8n reliés à Gmail, Calendly, Notion, Shopify, Stripe…" },
      ],
    },
    {
      title: "Vous gardez la main",
      points: [
        { title: "Tableau de bord KPIs", desc: "CA, leads, taux de conversion, temps de réponse moyen — en temps réel." },
        { title: "Formation + suivi", desc: "Documentation des workflows + 1 mois de suivi inclus." },
      ],
    },
  ],

  "maintenance": [
    {
      title: "Un site n'est jamais « fini »",
      intro: "Comme une voiture, un site a besoin d'entretien — sinon failles de sécurité, pannes et perte de données.",
      points: [
        { title: "Sécurité", desc: "Patches appliqués sous 48h : protégé contre les failles connues." },
        { title: "Sauvegardes", desc: "Quotidiennes / hebdo / mensuelles selon la formule — restauration possible en cas de pépin." },
        { title: "Monitoring 24/7", desc: "Alerte immédiate si le site tombe, même à 3h du matin." },
      ],
    },
    {
      title: "Vos modifications, simplement",
      intro: "Vous envoyez vos demandes, je les intègre dans vos heures incluses.",
      points: [
        { title: "Selon votre formule", desc: "Réponse sous 48h (Essentiel), 24h (Pro) ou visio dédiée (Premium)." },
        { title: "Heures incluses", desc: "1h à 5h de modifications/mois — textes, images, pages, promos." },
        { title: "Rapport mensuel", desc: "Uptime, performances, actions réalisées : vous savez ce qui a été fait." },
      ],
    },
  ],
}

export function getServiceDetail(slug: string): DeepDiveSection[] | undefined {
  return SERVICES_DETAIL[slug]
}
