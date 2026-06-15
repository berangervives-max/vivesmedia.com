export type ServiceData = {
  slug: string
  num: string
  title: string
  badge?: string
  price: string
  priceNote: string
  tagline: string
  problem?: string
  description: string
  heroImage?: string
  features: { title: string; desc: string }[]
  forWhom?: { yes: string[]; no?: { text: string; link?: string }[] }
  pricing?: { name: string; price: string; note?: string; features: string[]; highlighted?: boolean }[]
  process: { step: string; title: string; desc: string }[]
  testimonials: { name: string; company: string; text: string; avatar?: string }[]
  stats: { value: string; label: string }[]
  faq: { q: string; a: string }[]
}

export const SERVICES_DATA: ServiceData[] = [
  {
    slug: 'site-ecommerce',
    num: '01',
    badge: 'Le plus populaire',
    title: 'Site E-Commerce',
    heroImage: '/images/services/hero-ecommerce.png',
    price: 'dès 3 840€',
    priceNote: 'paiement unique ou en abonnement dès 149€/mois · livraison en 3 semaines',
    tagline: 'Votre boutique en ligne prête à vendre dès le premier jour.',
    problem: 'Vous voulez vendre en ligne, mais Shopify en autonomie semble compliqué, les agences demandent 8 000€ minimum, et vous ne savez pas par où commencer. Résultat : vous attendez, vos concurrents vendent.',
    description:
      'Un site e-commerce qui convertit — pas juste un catalogue en ligne. Paiement Stripe intégré, gestion des stocks temps réel, dashboard admin complet, emails transactionnels et conformité RGPD. Je prends en charge tout, du design au déploiement. Vous recevez une formation de 2h — et vous êtes autonome dès le premier jour.',
    features: [
      { title: 'Paiement Stripe & PayPal', desc: 'Encaissement sécurisé dès le lancement — les 2 modes préférés des acheteurs français. Frais Stripe : 1,4% + 0,25€ par transaction.' },
      { title: 'Gestion des stocks temps réel', desc: 'Stock mis à jour automatiquement à chaque vente. Plus jamais de produit vendu à rupture. Alertes configurables.' },
      { title: 'Dashboard admin complet', desc: 'Gérez commandes, clients, stocks et promotions sans toucher une ligne de code.' },
      { title: "Jusqu'à 50 produits inclus", desc: 'Import CSV disponible pour les catalogues existants. Extensible sans frais de développement supplémentaires.' },
      { title: 'Emails transactionnels inclus', desc: 'Confirmation de commande, expédition, relance panier abandonné — automatiques et à votre image.' },
      { title: 'Tunnel de commande optimisé', desc: 'Page panier + checkout optimisé pour maximiser le taux de conversion. Frais de livraison configurables par zone.' },
      { title: 'Blog intégré', desc: 'Publiez des articles SEO directement depuis votre admin pour attirer du trafic qualifié.' },
      { title: 'Conformité RGPD incluse', desc: 'CGV, mentions légales e-commerce, politique de confidentialité — conformes à la législation française.' },
      { title: 'Support 6 mois inclus', desc: 'Corrections, mises à jour et questions — réponse sous 24h ouvrées.' },
    ],
    forWhom: {
      yes: [
        'Créateurs, artisans ou marques avec des produits physiques ou numériques à vendre',
        'Boutiques physiques qui veulent ouvrir un canal digital',
        'Entrepreneurs avec un produit validé, prêts à vendre en ligne',
        'Catalogues jusqu\'à 50 références au lancement',
      ],
      no: [
        { text: 'Vous avez + de 100 références ou un besoin très spécifique → devis sur mesure' },
        { text: 'Vous voulez présenter sans vendre → voir Site Catalogue', link: '/services/site-catalogue' },
      ],
    },
    pricing: [
      {
        name: 'Paiement unique',
        price: 'dès 3 840€',
        note: 'une seule fois · vous possédez la boutique',
        features: [
          'Boutique e-commerce complète sur-mesure',
          'Paiement Stripe & PayPal, gestion des stocks',
          'Jusqu’à 50 produits inclus',
          '6 mois de support inclus',
          'Aucun frais mensuel',
        ],
      },
      {
        name: 'En abonnement',
        price: '149€/mois',
        note: 'Acompte 790€ au démarrage · engagement 24 mois minimum',
        highlighted: true,
        features: [
          'La même boutique, sans gros budget de départ',
          'Hébergement + nom de domaine inclus',
          'Mises à jour & maintenance incluses',
          '1h de modifications/mois incluse',
          'Support prioritaire continu',
          'Le site reste actif tant que l’abonnement court',
        ],
      },
    ],
    process: [
      { step: '01', title: 'Appel découverte', desc: "30 minutes pour comprendre votre activité, vos produits et vos objectifs. Gratuit, sans engagement. Devis sous 24h." },
      { step: '02', title: 'Maquette & validation', desc: "Je vous présente le design de votre boutique. Vous validez avant que j'écrive la première ligne de code. 2 rounds de corrections inclus." },
      { step: '03', title: 'Développement', desc: "Intégration, paiement, stocks, emails, admin. Je vous tiens informé à chaque étape clé." },
      { step: '04', title: 'Formation & livraison', desc: "2h de formation sur votre admin (produits, commandes, promotions), puis mise en ligne. Vous êtes autonome dès le premier jour." },
    ],
    testimonials: [
      { name: 'Sophie Vidal', company: 'Fleurs de Vigne', text: 'Refonte complète en 3 semaines. Notre taux de conversion a augmenté de 34% en 60 jours. On avait peur du digital, maintenant on ne pourrait plus s\'en passer.' },
      { name: 'Marie Lauzon', company: 'La Maison du Terroir', text: '12 000€ de chiffre d\'affaires dès le premier mois. L\'intégration Stripe était parfaite, zéro problème technique.' },
      { name: 'David Arnaud', company: 'Cycles Arnaud', text: 'Le dashboard admin est vraiment simple. Ma femme gère les commandes toute seule maintenant, sans moi.' },
    ],
    stats: [
      { value: '3 sem', label: 'de A à Z, livraison garantie' },
      { value: '+34%', label: 'conversion (ex. Fleurs de Vigne)' },
      { value: '50', label: 'produits inclus au lancement' },
      { value: '6 mois', label: 'de support inclus post-livraison' },
    ],
    faq: [
      { q: 'Pourquoi ne pas utiliser Shopify directement ?', a: 'Shopify coûte 29 à 79€/mois + les apps + le thème premium. Nous construisons votre boutique sur mesure — vous payez une seule fois, et profitez d\'un design unique qui ne ressemble à aucun autre template.' },
      { q: 'Quels sont les frais Stripe ?', a: 'Stripe prend 1,4% + 0,25€ par transaction en France. Pour 10 000€ de ventes, cela représente environ 165€ de frais. C\'est le coût standard du paiement en ligne, sans surprise.' },
      { q: 'Est-ce que je peux gérer mon site seul après livraison ?', a: 'Oui. Une formation admin de 2h est incluse. Vous pouvez ajouter des produits, gérer les commandes et publier des articles sans toucher au code.' },
      { q: 'Et si j\'ai déjà un site ou une boutique Shopify ?', a: 'On peut migrer votre catalogue existant. Je récupère vos produits, vos clients et vos commandes en cours.' },
      { q: 'Combien de temps pour la livraison ?', a: 'En moyenne 3 semaines. Le délai dépend de la rapidité avec laquelle vous me fournissez les visuels et les textes.' },
      { q: 'Que se passe-t-il après les 6 mois de support ?', a: 'Vous pouvez souscrire à un plan maintenance (dès 55€/mois) ou simplement me contacter au besoin, à la carte à 60€/h.' },
    ],
  },
  {
    slug: 'site-catalogue',
    num: '02',
    title: 'Site Catalogue',
    heroImage: '/images/services/hero-site-catalogue.png',
    price: 'dès 2 740€',
    priceNote: 'paiement unique · livraison en 2 semaines',
    tagline: 'Présentez vos produits professionnellement, sans vendre en ligne.',
    problem: 'Vous avez des dizaines ou centaines de références, mais aucun moyen de les présenter en ligne de façon professionnelle sans ouvrir une vraie boutique e-commerce. Vos commerciaux perdent du temps à envoyer des PDF de catalogues par email.',
    description:
      "Vous avez 50, 100 ou 250 références et vous voulez les présenter à vos clients B2B ou en showroom ? Le site catalogue est fait pour vous. Pas de panier, pas de paiement — une vitrine efficace avec filtres de recherche avancés, fiches techniques téléchargeables et formulaire de demande de devis par produit.",
    features: [
      { title: 'Jusqu\'à 250 produits', desc: '250 fiches produits avec photos, descriptions, caractéristiques techniques et prix ou "Sur devis".' },
      { title: 'Filtres de recherche avancés', desc: 'Vos visiteurs trouvent le bon produit en 2 clics — filtres par catégorie, matière, dimension, couleur, prix...' },
      { title: 'Fiches techniques PDF', desc: 'Chaque produit peut avoir sa fiche PDF téléchargeable — parfait pour les achats B2B et les rendez-vous commerciaux.' },
      { title: 'Formulaire de devis par produit', desc: 'Bouton "Demander un devis" sur chaque fiche produit. Notifications email instantanées.' },
      { title: 'Import CSV', desc: 'Pour les grandes gammes (+ de 100 références), import en masse via fichier Excel ou CSV.' },
      { title: 'Design responsive premium', desc: 'Parfait sur mobile, tablette et desktop. Navigable en déplacement chez un client.' },
      { title: 'SEO optimisé', desc: 'Chaque fiche produit est indexable par Google. Vos références apparaissent dans les recherches spécifiques.' },
      { title: 'Support prioritaire 3 mois', desc: 'Réponse sous 24h pendant 3 mois après livraison. 5 sessions de modifications incluses dans les 60 jours.' },
    ],
    forWhom: {
      yes: [
        'Fabricants avec un catalogue de références à présenter',
        'Grossistes ou distributeurs B2B',
        'Artisans avec une gamme étendue (poterie, meubles, textile...)',
        'Professionnels qui veulent montrer leurs produits sans vendre en ligne',
      ],
      no: [
        { text: 'Vous souhaitez vendre directement en ligne → voir Site E-Commerce', link: '/services/site-ecommerce' },
      ],
    },
    process: [
      { step: '01', title: 'Appel découverte', desc: 'On définit ensemble les filtres, les catégories, la structure et le nombre de références. Devis sous 24h.' },
      { step: '02', title: 'Design & validation', desc: 'Maquette de la page produit type et de la navigation. Vous validez avant développement.' },
      { step: '03', title: 'Import des produits', desc: 'Via CSV ou saisie manuelle selon votre catalogue. Création des fiches PDF si besoin.' },
      { step: '04', title: 'Livraison & formation', desc: 'Mise en ligne + 45 minutes de formation pour ajouter et modifier des produits vous-même.' },
    ],
    testimonials: [
      { name: 'Pierre Merle', company: 'Méca3D Industries', text: 'Nos commerciaux utilisent le catalogue depuis 6 mois en rendez-vous client. Les fiches PDF automatiques sont un gain de temps énorme.' },
      { name: 'Laurent Faure', company: 'Faure Menuiserie', text: 'On a enfin une vitrine professionnelle. Les clients arrivent au showroom en ayant déjà sélectionné leurs finitions.' },
      { name: 'Isabelle Cros', company: 'Studio Textile Sud', text: 'Mise en ligne en 12 jours. Les filtres fonctionnent parfaitement même avec 180 références.' },
    ],
    stats: [
      { value: '12j', label: 'délai moyen livraison' },
      { value: '250', label: 'produits max supportés' },
      { value: '5.0/5', label: 'sur Google' },
      { value: '3 mois', label: 'support inclus' },
    ],
    faq: [
      { q: 'Quelle est la différence avec un site e-commerce ?', a: "Le catalogue présente vos produits et génère des demandes de devis. Pas de paiement en ligne, pas de gestion de commandes. Idéal pour les artisans, fabricants ou showrooms qui traitent les commandes par devis ou en magasin." },
      { q: 'Et si j\'ai plus de 250 produits ?', a: "Au-delà de 250 références, nous adaptons le devis selon le volume. Contactez-nous avec votre catalogue." },
      { q: 'Je peux ajouter des produits moi-même ?', a: "Oui, via un admin simple. Une formation de 45 minutes est incluse à la livraison. Changer une photo ou un prix prend 2 minutes." },
      { q: 'Est-ce que les fiches PDF sont personnalisables ?', a: "Oui, avec votre logo, vos couleurs et votre charte graphique." },
      { q: 'Les clients peuvent commander directement ?', a: "Non — le site catalogue redirige vers un formulaire de demande de devis. Si vous souhaitez activer la vente en ligne, le Site E-Commerce est plus adapté." },
    ],
  },
  {
    slug: 'site-vitrine',
    num: '03',
    title: 'Site Vitrine',
    heroImage: '/images/services/hero-site-vitrine.png',
    price: 'dès 1 800€',
    priceNote: 'paiement unique ou en abonnement dès 89€/mois · livraison en 10 jours',
    tagline: 'Votre première impression en ligne, irréprochable.',
    problem: 'Votre site actuel ne vous rapporte rien. Les visiteurs arrivent, ne comprennent pas ce que vous faites, et repartent. Vous perdez des devis tous les jours — sans même le savoir.',
    description:
      "Un site vitrine qui donne confiance et génère des contacts. 5 pages sur-mesure, SEO local intégré, formulaire de contact, hébergement 1 an offert. Livré en 10 jours. Aucun template revendu — chaque page est créée pour vous, de A à Z.",
    features: [
      { title: 'Design 100% sur-mesure', desc: 'Aucun template revendu. Chaque page est créée pour votre activité, vos clients et vos objectifs.' },
      { title: 'SEO local optimisé', desc: 'Votre entreprise visible sur Google quand un client cherche votre métier dans votre ville.' },
      { title: '5 pages professionnelles', desc: 'Accueil, À propos, Services, Réalisations/Galerie, Contact — structurées pour capter et convaincre.' },
      { title: 'Formulaire de contact', desc: 'Notifications email instantanées + protection anti-spam. Chaque demande vous parvient directement.' },
      { title: 'Hébergement 1 an offert', desc: 'Nom de domaine et hébergement haute performance inclus la première année (valeur 228€).' },
      { title: 'Certificat SSL inclus', desc: 'Sécurisation HTTPS obligatoire — rassure vos visiteurs et Google.' },
      { title: 'Google Analytics intégré', desc: 'Vous savez combien de visiteurs arrivent sur votre site et d\'où ils viennent.' },
      { title: 'Pages légales RGPD', desc: 'Politique de confidentialité et mentions légales conformes — incluses sans supplément.' },
      { title: 'Formation admin incluse', desc: '1h de formation en visio pour gérer vos textes et photos en autonomie après livraison.' },
    ],
    forWhom: {
      yes: [
        'Artisans, thérapeutes, consultants, prestataires de services',
        'Vous n\'avez pas encore de site ou votre site actuel vous fait honte',
        'Vous voulez être trouvé sur Google dans votre ville',
        'Vous n\'avez pas le temps de gérer un site compliqué',
      ],
      no: [
        { text: 'Vous vendez des produits en ligne → voir Site E-Commerce', link: '/services/site-ecommerce' },
        { text: 'Vous avez des centaines de références → voir Site Catalogue', link: '/services/site-catalogue' },
      ],
    },
    pricing: [
      {
        name: 'Paiement unique',
        price: 'dès 1 800€',
        note: 'une seule fois · vous possédez le site',
        features: [
          '5 pages sur-mesure + SEO local',
          'Hébergement 1 an offert',
          'Formation admin incluse',
          '30 jours de corrections après livraison',
          'Aucun frais mensuel',
        ],
      },
      {
        name: 'En abonnement',
        price: '89€/mois',
        note: 'Acompte 490€ au démarrage · engagement 24 mois minimum',
        highlighted: true,
        features: [
          'Le même site vitrine, sans gros budget de départ',
          'Hébergement + nom de domaine inclus',
          'Maintenance & mises à jour sécurité incluses',
          '1h de modifications/mois incluse',
          'Support sous 24h',
          'Le site reste actif tant que l’abonnement court',
        ],
      },
    ],
    process: [
      { step: '01', title: 'Brief en 30 minutes', desc: 'Appel pour comprendre votre activité, vos clients et ce qui vous différencie. Devis sous 24h.' },
      { step: '02', title: 'Maquette en 48h', desc: 'Je vous présente le design. Vous me donnez vos retours. 2 rounds de corrections inclus.' },
      { step: '03', title: 'Développement', desc: 'Intégration, SEO, performances, pages légales. Tout est optimisé avant livraison.' },
      { step: '04', title: 'Mise en ligne', desc: 'Votre site est live. Je reste disponible 30 jours après pour toute correction.' },
    ],
    testimonials: [
      { name: 'Thomas Durand', company: 'Cabinet Durand Expertises', text: 'Site livré en 9 jours, exactement comme prévu. Nos appels entrants ont doublé le mois suivant.' },
      { name: 'Camille Roux', company: 'Studio Forma Yoga', text: 'Enfin un site qui me ressemble. Mes clients me disent souvent qu\'ils ont pris rendez-vous à cause du site.' },
      { name: 'Nicolas Blanc', company: 'Blanc Plomberie', text: 'Je voulais quelque chose de simple et professionnel. C\'est exactement ce que j\'ai eu, sans surprise sur la facture.' },
    ],
    stats: [
      { value: '10j', label: 'délai moyen garanti' },
      { value: '×2', label: 'appels entrants en moyenne' },
      { value: '0', label: 'site livré en retard' },
      { value: '228€', label: 'd\'hébergement offert la 1re année' },
    ],
    faq: [
      { q: 'Pourquoi ne pas faire Wix moi-même ?', a: "Wix est gratuit mais lent, mal référencé et vous passez des semaines dessus. Un site vivesmedia.com est livré en 10 jours, optimisé pour Google dès le départ, et vous n'y touchez plus à moins de vouloir modifier vos textes." },
      { q: '1 800€, c\'est cher pour un site vitrine ?', a: "Ramenez ça sur 3 ans : 50€/mois. Un seul client supplémentaire par mois rembourse l'investissement. Et contrairement à Wix, vous possédez votre site." },
      { q: 'Est-ce que 5 pages c\'est suffisant ?', a: "Pour la grande majorité des artisans et TPE, oui. Si vous avez besoin de plus, on peut ajouter des pages à partir de 150€ supplémentaire." },
      { q: "L'hébergement est vraiment offert ?", a: "Oui, la première année (valeur 228€). Ensuite, vous pouvez continuer avec mon hébergement (environ 120€/an) ou migrer où vous voulez." },
      { q: 'Je fournis quoi de mon côté ?', a: "Vos textes (je peux vous aider à les rédiger), vos photos ou votre logo. Pour les photos, je peux vous recommander des alternatives IA professionnelles." },
      { q: 'Je peux modifier le contenu moi-même ?', a: "Oui — vous recevez une formation de 1h en visio. Changer un texte ou une photo prend 2 minutes depuis votre interface admin." },
    ],
  },
  {
    slug: 'formation-ia',
    num: '07',
    badge: 'Nouveau',
    title: 'Formation & Accompagnement IA',
    heroImage: '/images/services/hero-formation-ia.png',
    price: 'dès 290€/session',
    priceNote: 'session individuelle 2h · pack 5 sessions à 1 290€',
    tagline: 'Apprenez à utiliser l\'IA comme un professionnel, pas comme un amateur.',
    problem: 'Claude, ChatGPT, agents IA — vous savez que ces outils existent, mais vous les utilisez à 10% de leur potentiel, ou vous ne savez pas par où commencer. Pendant ce temps, vos concurrents gagnent des heures chaque semaine.',
    description:
      "En 2h de Zoom, je vous montre comment tirer un avantage concret de l'IA sur votre activité — sur VOS cas d'usage réels, pas des exemples génériques. Automatisations, prompts efficaces, agents IA : vous repartez avec des outils opérationnels dès le lendemain.",
    features: [
      { title: 'Session Zoom individuelle 2h', desc: 'Cas d\'usage concrets adaptés à votre métier. Pas de théorie abstraite — que du pratique.' },
      { title: 'Workbook exercices inclus', desc: 'Exercices pratiques à refaire seul après la session pour ancrer les apprentissages.' },
      { title: 'Cheat sheet prompts', desc: '20+ prompts prêts à l\'emploi pour votre secteur, personnalisés pendant la session.' },
      { title: 'Replay vidéo disponible', desc: 'La session est enregistrée — vous la revoyez quand vous voulez, autant de fois que nécessaire.' },
      { title: 'Support entre les sessions', desc: 'Questions par email sous 48h entre les sessions. Vous n\'êtes pas seul face aux blocages.' },
      { title: 'Pack 5 sessions disponible', desc: '5 sessions Zoom + tous les supports pour 1 290€ — économisez 160€ vs séances à l\'unité.' },
    ],
    process: [
      { step: '01', title: 'Questionnaire préparatoire', desc: '10 minutes pour que je comprenne votre activité et vos blocages actuels. La session est déjà adaptée avant qu\'on se connecte.' },
      { step: '02', title: 'Session Zoom 2h', desc: 'On travaille directement sur vos cas d\'usage réels. Résultats concrets dès la session.' },
      { step: '03', title: 'Ressources envoyées', desc: 'Workbook, cheat sheet prompts et replay dans les 24h suivant la session.' },
      { step: '04', title: 'Suivi 30 jours', desc: 'Questions par email pendant 30 jours. Vous n\'êtes pas seul face aux blocages.' },
    ],
    testimonials: [
      { name: 'Camille Roux', company: 'Studio Forma Yoga', text: 'En 2h j\'ai automatisé mes relances clients et mes posts Instagram. Je gagnais déjà 3h par semaine le lendemain.', avatar: '/images/social-proof/avatar-1.png' },
      { name: 'Marc Tissier', company: 'Tissier Immobilier', text: 'Je savais vaguement ce qu\'était ChatGPT. Après la session, j\'ai un système de rédaction d\'annonces en 5 minutes.' },
      { name: 'Julie Fontaine', company: 'Coach Fontaine', text: 'Le replay m\'a été précieux. Je l\'ai revu 3 fois pour bien intégrer les automatisations.' },
    ],
    stats: [
      { value: '3h', label: 'gagnées/semaine en moyenne' },
      { value: '4.9/5', label: 'satisfaction' },
      { value: '2h', label: 'pour changer vos habitudes' },
      { value: '30j', label: 'de suivi post-session inclus' },
    ],
    faq: [
      { q: 'Je n\'y connais rien en IA, c\'est pour moi ?', a: "C'est exactement pour vous. Je commence toujours depuis zéro et j'adapte le niveau en temps réel. Aucun prérequis technique." },
      { q: 'Quelle différence avec une formation en groupe ?', a: "On travaille sur VOS cas d'usage, VOS blocages, VOS outils. Pas sur des exemples génériques qui ne correspondent pas à votre réalité." },
      { q: 'Que se passe-t-il si je veux continuer après la session ?', a: "Le pack 5 sessions vous donne accès à un accompagnement sur 10 semaines, avec des exercices entre les sessions et un suivi personnalisé." },
      { q: 'Les outils IA sont-ils payants ?', a: "ChatGPT Free suffit pour commencer. Pour les automatisations avancées, des abonnements à 20€/mois peuvent être utiles — je vous guide sur ce qui vaut vraiment le coup." },
    ],
  },
  {
    slug: 'video-contenu-ia',
    num: '05',
    badge: 'Nouveau',
    title: 'Vidéo & Contenu IA',
    heroImage: '/images/services/hero-video-ia.png',
    price: 'dès 490€/mois',
    priceNote: '8 vidéos/mois · livraison chaque semaine',
    tagline: 'Des Reels qui scrollent pas, qui arrêtent.',
    problem: 'Vous savez qu\'il faut du contenu vidéo pour exister sur les réseaux. Mais filmer, monter, écrire les accroches — vous n\'avez pas le temps. Résultat : votre compte Instagram dort, vos concurrents publient chaque semaine.',
    description:
      "Je génère des Reels Instagram, des vidéos produit et des backgrounds cinématiques par IA — livrés chaque semaine en MP4, prêts à publier. Zéro temps de votre côté. Calendrier éditorial inclus. Copywriting inclus.",
    features: [
      { title: '8 à 16 vidéos/mois', desc: 'Selon votre formule, une à deux livraisons par semaine. Toujours du nouveau contenu.' },
      { title: 'Format Reels 9:16', desc: 'Optimisé Instagram, TikTok et YouTube Shorts. Le format qui performe en 2025.' },
      { title: 'Format desktop 16:9', desc: 'Pour LinkedIn, votre site web et vos présentations.' },
      { title: 'Calendrier éditorial mensuel', desc: 'Je planifie les sujets un mois à l\'avance selon votre secteur et vos temps forts.' },
      { title: 'Copywriting inclus', desc: 'Textes, sous-titres, accroches et légendes pour chaque vidéo — optimisés pour l\'engagement.' },
      { title: 'Livraison MP4 prêts', desc: 'Vous postez directement, sans retouche nécessaire. Ou je publie pour vous si vous le souhaitez.' },
    ],
    process: [
      { step: '01', title: 'Brief marque', desc: 'Vos couleurs, votre ton, vos thèmes. On définit votre style vidéo une fois pour toutes.' },
      { step: '02', title: 'Calendrier du mois', desc: 'Je vous soumet 4 semaines de contenu. Vous approuvez ou ajustez avant production.' },
      { step: '03', title: 'Production IA', desc: 'Génération des vidéos, sous-titres, musique, textes avec des outils pro (Higgsfield, Kling). Tout est inclus.' },
      { step: '04', title: 'Livraison hebdomadaire', desc: 'MP4 + textes de publication dans votre boîte mail chaque lundi.' },
    ],
    testimonials: [
      { name: 'Anaïs Morel', company: 'Morel Cosmétiques', text: 'Mes Reels ont triplé en portée organique en 6 semaines. Et je n\'y passe plus aucun temps.' },
      { name: 'Kevin Salles', company: 'KS Personal Training', text: 'Avant je postais une fois par mois parce que filmer c\'était trop long. Maintenant j\'ai du contenu toutes les semaines.' },
      { name: 'Elodie Vernet', company: 'Vernet Architecture', text: 'Les vidéos background de mes projets sont vraiment cinématiques. Mes clients pensent que j\'ai engagé une équipe de production.' },
    ],
    stats: [
      { value: '×3', label: 'portée organique moyenne' },
      { value: '16', label: 'vidéos max/mois' },
      { value: '0h', label: 'de votre temps' },
      { value: '48h', label: 'de préavis pour modifier' },
    ],
    faq: [
      { q: 'Est-ce que les vidéos ressemblent à du contenu IA générique ?', a: "Non. Les vidéos sont générées avec des outils professionnels (Higgsfield, Kling) qui produisent du contenu cinématique de qualité broadcast. Brief marque personnalisé à la création." },
      { q: 'Je peux demander des modifications ?', a: "Oui, jusqu'à 2 révisions par vidéo comprises dans l'abonnement." },
      { q: 'Engagement minimum ?', a: "3 mois minimum pour avoir des effets visibles sur l'algorithme. Après, résiliable à tout moment avec 30 jours de préavis." },
      { q: 'Puis-je fournir mes propres images ou vidéos source ?', a: "Oui — si vous avez des photos ou des clips bruts, je les intègre dans la production IA pour un résultat encore plus personnalisé." },
    ],
  },
  {
    slug: 'visibilite-ia',
    num: '06',
    badge: 'Nouveau',
    title: 'Visibilité IA (AEO/GEO)',
    heroImage: '/images/services/hero-visibilite-ia.png',
    price: '490€/mois',
    priceNote: 'abonnement mensuel · rapport chaque mois',
    tagline: 'Quand quelqu\'un interroge ChatGPT sur votre secteur, c\'est votre nom qui doit apparaître.',
    problem: 'Google, c\'est bien. Mais vos clients demandent aussi à ChatGPT, Perplexity, Gemini et Claude de recommander des prestataires. Si vous n\'y êtes pas, c\'est votre concurrent qui ramasse les demandes.',
    description:
      "Je vous audite, j'optimise votre contenu pour être cité par les moteurs IA, et je vous envoie un rapport chaque mois. Vous voyez précisément où vous apparaissez dans ChatGPT, Perplexity, Gemini et Claude — et ce qu'on fait pour améliorer ça.",
    features: [
      { title: 'Audit citations IA initial', desc: 'Où apparaissez-vous (ou pas) dans ChatGPT, Perplexity, Gemini, Claude. Rapport complet avec 50+ requêtes testées.' },
      { title: 'Tracking mensuel', desc: 'Évolution de votre visibilité dans les moteurs IA mois par mois. Vous suivez votre progression.' },
      { title: 'Optimisation contenu AEO', desc: 'Réécriture ou création de pages optimisées pour répondre aux questions des IA dans votre secteur.' },
      { title: 'Rapport Brand Radar', desc: 'Qui vous cite, à quelle fréquence, dans quel contexte positif ou négatif.' },
      { title: 'Schema.org implémenté', desc: 'Données structurées pour faciliter la lecture et la citation par les moteurs IA.' },
      { title: 'Alertes mentions IA', desc: 'Notification quand votre marque est citée ou au contraire évitée par une IA majeure.' },
    ],
    process: [
      { step: '01', title: 'Audit initial', desc: 'Je teste 50+ requêtes liées à votre secteur dans chaque IA. Vous recevez un rapport complet dès la première semaine.' },
      { step: '02', title: 'Plan d\'action', desc: 'Liste priorisée des pages à créer ou optimiser pour être cité dans les bonnes réponses.' },
      { step: '03', title: 'Optimisation contenu', desc: 'Je rédige ou améliore les pages clés de votre site pour qu\'elles soient sources de réponses IA.' },
      { step: '04', title: 'Rapport mensuel', desc: 'Évolution de votre présence dans les IA, nouvelles citations, prochaines actions du mois.' },
    ],
    testimonials: [
      { name: 'Rémi Gautier', company: 'Gautier Conseil RH', text: 'En 2 mois, quand on demande à ChatGPT un consultant RH en Provence, mon nom apparaît dans les suggestions.' },
      { name: 'Nathalie Serra', company: 'Clinique Serra', text: 'Le rapport mensuel est très clair. On voit exactement où on progresse et ce qui reste à faire.' },
      { name: 'Julien Fabre', company: 'Fabre & Associés', text: 'Perplexity nous citait déjà mais dans un mauvais contexte. Après optimisation, le contexte est exactement celui qu\'on voulait.' },
    ],
    stats: [
      { value: '50+', label: 'requêtes testées/mois' },
      { value: '4 IA', label: 'trackées (GPT, Perplexity, Gemini, Claude)' },
      { value: '6–12 sem', label: 'pour les premières citations IA' },
      { value: '3 mois', label: 'pour des résultats durables' },
    ],
    faq: [
      { q: 'C\'est quoi la différence avec le SEO classique ?', a: "Le SEO cible Google. L'AEO/GEO cible les moteurs IA (ChatGPT, Perplexity, Gemini). Les deux sont complémentaires — le SEO nourrit l'AEO." },
      { q: 'Les résultats sont garantis ?', a: "Pas de garantie de citation — aucun prestataire honnête ne peut en donner. Ce que je garantis : un audit rigoureux, des actions documentées et un suivi mensuel transparent." },
      { q: 'En combien de temps on voit des résultats ?', a: "Les premières citations apparaissent généralement entre 6 et 12 semaines après les optimisations." },
      { q: 'Dois-je aussi faire du SEO classique en parallèle ?', a: "Idéalement oui — le SEO et l'AEO se renforcent. Si vous n'avez pas encore de stratégie SEO, je peux les combiner dans une offre groupée." },
    ],
  },
  {
    slug: 'seo',
    num: '08',
    title: 'Référencement SEO',
    price: '274€/mois',
    priceNote: 'abonnement mensuel · sans engagement après 3 mois',
    tagline: 'Page 1 de Google, durablement.',
    problem: 'Votre site existe depuis 2 ans et vous n\'apparaissez pas sur Google. Vos concurrents sont devant vous sur tous les mots-clés qui comptent — et leurs clients vous passent sous le nez.',
    description:
      "Le SEO n'est pas de la magie — c'est de la méthode. Audit technique, optimisation on-page, articles ciblés et suivi mensuel des positions. Je travaille sur votre référencement comme si c'était mon propre site, avec un rapport transparent chaque mois.",
    features: [
      { title: 'Audit SEO complet (mois 1)', desc: 'Audit technique, analyse des mots-clés, audit des 3 concurrents principaux sur Google. Rapport avec feuille de route.' },
      { title: 'Optimisation technique', desc: 'Vitesse, Core Web Vitals, balises title/meta, structure des URL, liens internes.' },
      { title: '2 articles de blog/mois', desc: "800 à 1200 mots, optimisés pour vos mots-clés prioritaires. Publiés sur votre site." },
      { title: 'Suivi rankings mensuels', desc: 'Rapport de positions sur vos 20 mots-clés cibles + évolution du trafic organique.' },
      { title: 'SEO local inclus', desc: 'Google Business Profile optimisé si vous avez une adresse physique. Pack local Maps.' },
      { title: 'Backlinks qualitatifs', desc: 'Acquisition de liens sur des sites de votre secteur pour renforcer votre autorité.' },
      { title: 'Google Search Console & Analytics', desc: 'Connexion et analyse des données réelles de votre site. Décisions basées sur les chiffres.' },
      { title: 'Rapport mensuel', desc: 'Évolution du trafic, positions gagnées, actions réalisées, plan du mois suivant. Transparent.' },
    ],
    forWhom: {
      yes: [
        'Vous avez déjà un site web (ou vous en commandez un avec vivesmedia.com)',
        'Vous voulez attirer des clients qui cherchent activement votre service sur Google',
        'Vous êtes prêt à investir sur le long terme (résultats visibles dès 2-4 mois)',
        'Votre secteur a une demande de recherche active en ligne',
      ],
      no: [
        { text: 'Vous cherchez des résultats en 2 semaines → Google Ads est plus adapté' },
      ],
    },
    process: [
      { step: '01', title: 'Audit initial', desc: 'État des lieux complet de votre référencement actuel. Mots-clés, technique, concurrents.' },
      { step: '02', title: 'Quick wins', desc: 'Les corrections rapides qui donnent des résultats dans les 30 premiers jours.' },
      { step: '03', title: 'Stratégie contenu', desc: 'Articles ciblés publiés chaque mois pour capturer du trafic qualifié et durable.' },
      { step: '04', title: 'Rapport & ajustements', desc: 'Bilan mensuel, recalibrage de la stratégie si besoin, plan du mois suivant.' },
    ],
    testimonials: [
      { name: 'Amandine Gros', company: 'Gros Traiteur', text: '+420% de trafic organique en 8 mois. On est maintenant premier sur "traiteur Montpellier" et les demandes de devis ont explosé.' },
      { name: 'Franck Meyer', company: 'Meyer Électricité', text: 'J\'avais un site mais personne ne le trouvait. En 4 mois j\'étais sur la première page pour mes 3 mots-clés prioritaires.' },
      { name: 'Céline Arnal', company: 'Arnal Kinésithérapie', text: 'Le rapport mensuel est très pédagogique. Je comprends ce qui est fait et pourquoi.' },
    ],
    stats: [
      { value: '+420%', label: 'trafic max observé (Gros Traiteur)' },
      { value: '274€', label: 'par mois tout inclus' },
      { value: '4 mois', label: 'pour des positions page 1' },
      { value: '20', label: 'mots-clés suivis/mois' },
    ],
    faq: [
      { q: 'Ça prend combien de temps avant de voir des résultats ?', a: "Premiers résultats visibles à 2 mois. Positions stables à 4-6 mois. Le SEO est un marathon, pas un sprint — mais les résultats continuent à travailler même quand vous dormez." },
      { q: 'Pourquoi ne pas faire Google Ads plutôt que le SEO ?', a: "Ads s'arrête quand vous arrêtez de payer. Le SEO continue à travailler. Les deux sont complémentaires — le SEO construit votre audience organique, Ads accélère les résultats à court terme." },
      { q: 'Comment je vois les résultats ?', a: "Rapport mensuel avec vos positions sur chaque mot-clé cible, le trafic organique et les actions réalisées. Transparent, mesurable et sans jargon." },
      { q: 'Et si ça ne fonctionne pas ?', a: "Sans engagement après 3 mois. Si vous ne voyez pas d'évolution après le premier trimestre, vous arrêtez quand vous voulez." },
      { q: 'Je dois vous donner accès à mon site ?', a: "Oui, un accès admin en lecture pour l'audit. Pour les optimisations, j'ai besoin d'un accès éditeur. Tout se passe en toute sécurité." },
    ],
  },
  {
    slug: 'crm-automatisation',
    num: '04',
    title: 'CRM & Automatisation IA',
    heroImage: '/images/services/hero-crm-automatisation.png',
    price: 'Sur Devis',
    priceNote: 'projet sur mesure · devis sous 48h',
    tagline: 'Transformez votre business en machine de croissance qui tourne sans vous.',
    problem: 'Vous passez 3h par jour sur des tâches répétitives : répondre aux mêmes emails, relancer des prospects, saisir des données dans des tableaux. Vous travaillez pour votre CRM — au lieu de travailler pour vos clients.',
    description:
      "Prospection automatique, relances intelligentes, reporting CRM, synchronisation entre vos outils — tout ce que vous faites de répétitif peut être automatisé. Je construis les workflows et les agents IA qui travaillent pendant que vous dormez. Votre rôle : superviser. Pas exécuter.",
    features: [
      { title: 'Agents IA 24/7', desc: 'Répondent aux demandes, qualifient les leads, envoient des devis automatiquement.' },
      { title: 'Séquences de prospection', desc: 'Emails personnalisés avec relances automatiques J+3, J+7, J+14 selon le comportement du prospect.' },
      { title: 'CRM intelligent', desc: 'Scoring automatique des leads (chaud/tiède/froid), alertes quand un prospect interagit.' },
      { title: 'Workflows n8n sur-mesure', desc: 'Connecté à tous vos outils existants : Gmail, Calendly, Notion, HubSpot, Shopify, Stripe...' },
      { title: 'Devis automatisés', desc: 'Devis généré automatiquement depuis un formulaire. Confirmation de RDV + rappels SMS/email.' },
      { title: 'Onboarding client sans friction', desc: 'Tout le parcours post-signature automatisé : accueil, documents, relances.' },
      { title: 'Tableau de bord KPIs', desc: 'CA, leads, taux de conversion, temps de réponse moyen — en temps réel.' },
      { title: 'Formation & documentation', desc: 'Formation sur votre nouveau système + documentation des workflows. 1 mois de suivi inclus.' },
    ],
    forWhom: {
      yes: [
        'Entrepreneurs ou TPE avec une force de vente à optimiser',
        'Freelances qui perdent du temps sur les relances et le suivi client',
        'E-commerçants qui veulent automatiser le SAV et les emails post-achat',
        'Agences B2B avec un cycle de vente supérieur à 2 semaines',
      ],
      no: [
        { text: 'Moins de 10 contacts/mois → l\'automatisation n\'a pas encore de sens à ce stade' },
      ],
    },
    pricing: [
      {
        name: 'Démarrage',
        price: '800 – 1 200€',
        note: '+ 150€/mois',
        features: [
          '1 à 2 workflows automatisés',
          'Connexion à vos outils existants',
          'Formation 1h incluse',
          'Support 1 mois',
        ],
      },
      {
        name: 'Croissance',
        price: '2 000 – 3 500€',
        note: '+ 300€/mois',
        highlighted: true,
        features: [
          'CRM complet + pipeline de vente',
          '3 à 5 automatisations',
          'Scoring automatique des leads',
          'Tableau de bord KPIs',
          'Formation 3h + documentation',
          'Support 1 mois',
        ],
      },
      {
        name: 'Full-Stack',
        price: 'Sur devis',
        features: [
          'Système complet sur mesure',
          'Agents IA multi-canaux',
          'Intégrations illimitées',
          'Accompagnement long terme',
        ],
      },
    ],
    process: [
      { step: '01', title: 'Audit des processus', desc: "On identifie ensemble ce qui vous fait perdre le plus de temps. ROI estimé pour chaque automatisation." },
      { step: '02', title: 'Proposition technique', desc: "Je vous propose les automatisations prioritaires avec ROI estimé. Devis sous 48h." },
      { step: '03', title: 'Développement', desc: "Construction des workflows et des agents. Tests en sandbox avant mise en production." },
      { step: '04', title: 'Formation & suivi', desc: "Formation sur votre nouveau système. Documentation. 1 mois de suivi post-livraison." },
    ],
    testimonials: [
      { name: 'Alexandre Pont', company: 'Pont Consulting', text: 'Mon pipeline de prospection est entièrement automatisé. Je reçois chaque matin une liste de leads qualifiés avec les angles d\'approche.' },
      { name: 'Sandrine Levy', company: 'Levy Formation', text: 'Les relances automatiques après inscription ont multiplié par 2 notre taux de présence aux formations.' },
      { name: 'Christophe Vial', company: 'Vial & Partners', text: '3 semaines de mise en place pour économiser 2 jours de travail par semaine. Le ROI était là au premier mois.' },
    ],
    stats: [
      { value: '2j', label: 'économisés/semaine en moyenne' },
      { value: '×2', label: 'taux de conversion leads' },
      { value: '24/7', label: 'vos agents travaillent' },
      { value: '48h', label: 'pour recevoir un devis' },
    ],
    faq: [
      { q: 'C\'est compliqué à mettre en place ?', a: "Non, vous n'avez rien à configurer. On installe, on paramètre, on vous montre comment surveiller. Tout roule." },
      { q: 'Et si l\'IA fait une erreur ?', a: "Chaque workflow a des garde-fous humains aux étapes critiques. L'IA automatise le répétitif — pas les décisions importantes." },
      { q: 'Je dois changer d\'outils ?', a: "Non. On s'intègre à vos outils existants : Gmail, Calendly, Notion, HubSpot, Shopify... Plus de 400 connecteurs disponibles via n8n." },
      { q: 'Combien ça coûte en moyenne ?', a: "Un projet Démarrage (1-2 automatisations) : 800-1200€ setup + 150€/mois. Un projet Croissance (CRM + 3-5 automatisations) : 2000-3500€ setup + 300€/mois. Devis précis sous 48h." },
      { q: 'C\'est compliqué à maintenir après livraison ?', a: "Non. Les workflows sont documentés et vous avez accès à tout. Je forme votre équipe sur l'admin. Si quelque chose change, une intervention ponctuelle suffit." },
    ],
  },
  {
    slug: 'maintenance',
    num: '09',
    title: 'Maintenance',
    heroImage: '/images/services/hero-maintenance.png',
    price: 'dès 55€/mois',
    priceNote: 'sans engagement · résiliable à tout moment',
    tagline: 'Votre site en bonne santé, sans y penser.',
    problem: 'Votre site est en ligne, mais vous avez peur qu\'il tombe, qu\'il se fasse pirater ou qu\'une mise à jour critique passe à la trappe. Et quand quelque chose plante, vous ne savez pas vers qui vous tourner.',
    description:
      "Un site non maintenu, c'est un site qui ralentit, devient vulnérable, et finit par tomber. Je m'en occupe pour vous — mises à jour, sauvegardes, monitoring 24/7 et modifications incluses. Vous ne pensez plus à votre site. Moi si.",
    features: [
      { title: 'Mises à jour sécurité', desc: 'Patches appliqués sous 48h après publication. Votre site protégé contre les failles connues.' },
      { title: 'Sauvegardes régulières', desc: 'Quotidiennes, hebdomadaires ou mensuelles selon le plan. Restauration possible en cas de problème.' },
      { title: 'Monitoring 24/7', desc: 'Alerte immédiate si votre site tombe — même à 3h du matin. Intervention prioritaire.' },
      { title: 'Vérification SSL', desc: 'Certificat HTTPS surveillé. Jamais de message "site non sécurisé" pour vos visiteurs.' },
      { title: 'Support prioritaire', desc: 'Réponse sous 48h (Essentiel), 24h (Pro) ou visio dédiée (Premium).' },
      { title: 'Modifications incluses', desc: "De 1h à 5h selon votre formule — textes, images, pages, promotions." },
      { title: 'Rapport mensuel', desc: 'Uptime, performances, actions réalisées. Vous savez ce qui a été fait.' },
      { title: 'Sites tiers acceptés', desc: 'Site créé sur WordPress, Shopify ou Webflow — diagnostic initial offert.' },
    ],
    forWhom: {
      yes: [
        'Tout site professionnel en ligne : vitrine, e-commerce, catalogue',
        'E-commerçants : une panne = des ventes perdues → le plan Pro est indispensable',
        'Artisans et prestataires : votre site est votre carte de visite, il doit toujours être disponible',
        'Sites créés sur WordPress, Shopify ou Webflow (diagnostic initial offert)',
      ],
    },
    pricing: [
      {
        name: 'Essentiel',
        price: '55€',
        note: '/mois · sans engagement',
        features: [
          'Mises à jour sécurité',
          'Sauvegarde mensuelle',
          '1h de modifications/mois',
          'Vérification SSL',
          'Rapport mensuel',
          'Support email (réponse 48h)',
        ],
      },
      {
        name: 'Pro',
        price: '110€',
        note: '/mois · sans engagement',
        highlighted: true,
        features: [
          'Tout l\'Essentiel +',
          'Sauvegarde hebdomadaire',
          'Monitoring uptime 24/7',
          '3h de modifications/mois',
          'Support prioritaire (réponse 24h)',
        ],
      },
      {
        name: 'Premium',
        price: '165€',
        note: '/mois · sans engagement',
        features: [
          'Tout le Pro +',
          'Sauvegarde quotidienne',
          'Audit sécurité mensuel',
          '5h de modifications/mois',
          'Support visio dédié',
        ],
      },
    ],
    process: [
      { step: '01', title: 'Audit initial', desc: "Je vérifie l'état de santé de votre site avant de démarrer. Corrections initiales incluses dans le premier mois." },
      { step: '02', title: 'Mise en conformité', desc: "Corrections des problèmes existants identifiés lors de l'audit." },
      { step: '03', title: 'Suivi mensuel', desc: "Mises à jour, sauvegardes, rapport mensuel. Tout est documenté." },
      { step: '04', title: 'Modifications', desc: "Vous m'envoyez vos demandes, je les intègre dans vos heures incluses selon votre plan." },
    ],
    testimonials: [
      { name: 'Bernard Chaix', company: 'Chaix Plomberie Chauffage', text: 'Mon site est tombé une nuit — j\'ai reçu un SMS à 3h du matin et il était remonté avant mon réveil.' },
      { name: 'Virginie Sorel', company: 'Cabinet Sorel Notaires', text: 'Je n\'ai plus à me préoccuper des mises à jour. Je sais que c\'est géré, et ça n\'a pas de prix.' },
      { name: 'Maxime Aubert', company: 'Aubert Auto', text: 'Les 3h de modifications mensuelles sont très utiles. Je change mes offres et promos sans avoir à appeler un développeur.' },
    ],
    stats: [
      { value: '99.9%', label: 'uptime garanti' },
      { value: '< 1h', label: 'temps de réaction moyen' },
      { value: '55€', label: 'dès par mois' },
      { value: '0', label: 'site perdu sous notre maintenance' },
    ],
    faq: [
      { q: 'Mon hébergeur ne s\'en occupe pas déjà ?', a: "L'hébergeur protège les serveurs. Personne ne protège votre site lui-même : ses plugins, son code, sa base de données. C'est notre rôle." },
      { q: 'Ça fait cher juste pour des mises à jour', a: "55€/mois = 1,83€/jour. Le prix d'un café pour avoir l'esprit tranquille. Un site piraté ou hors ligne 24h coûte en moyenne 3 à 10× le prix d'un mois de maintenance." },
      { q: 'Je peux faire les mises à jour moi-même ?', a: "Techniquement oui. Mais une mise à jour mal faite peut casser votre site — plugins incompatibles, thème qui plante. Ça arrive plus souvent qu'on ne le croit." },
      { q: 'Mon site n\'a pas été créé par vous, vous pouvez quand même assurer la maintenance ?', a: "Oui. Je commence par un audit de l'existant (offert). Selon l'état du site, des corrections initiales peuvent être nécessaires et sont incluses dans le premier mois." },
      { q: 'Que se passe-t-il si je dépasse mes heures de modifications ?', a: "Je vous préviens avant. Les heures supplémentaires sont facturées à 60€/h, validées par devis." },
      { q: 'Je peux changer de formule ?', a: "Oui, à tout moment. Upgrader prend effet immédiatement, réduire prend effet au prochain renouvellement." },
    ],
  },
]

export function getServiceBySlug(slug: string): ServiceData | undefined {
  return SERVICES_DATA.find(s => s.slug === slug)
}
