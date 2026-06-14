export type RealisationData = {
  slug: string
  name: string
  type: string
  year: string
  tags: string[]
  heroImage: string
  liveUrl?: string
  intro: string
  context: { client: string; problem: string }
  solution: { title: string; desc: string }[]
  results: { value: string; label: string }[]
  gallery: { src: string; caption: string; mobile?: boolean }[]
  testimonial?: { text: string; name: string; role: string }
  stack: string[]
  services: { label: string; href: string }[]
}

export const REALISATIONS_DATA: RealisationData[] = [
  {
    slug: 'marine-caro',
    name: 'Marine Caro',
    type: 'Site Vitrine · Architecte en Provence',
    year: '2026',
    tags: ['Site Vitrine', 'Architecture', 'Direction Artistique', 'SEO'],
    heroImage: '/images/realisations/marine-desktop.jpg',
    liveUrl: 'https://marine-caro.vercel.app',
    intro: "Refonte du site d'une architecte en Provence — un portfolio premium qui révèle l'excellence de son travail et transforme le visiteur en prise de contact. Direction artistique éditoriale minimale, vidéo d'ambiance générée en IA et vraies photos de chantiers.",
    context: {
      client: "Marine Caro (Architecte Horizon) est architecte en Provence — Vaucluse, Gard, Bouches-du-Rhône. Elle conçoit des villas neuves, rénove des mas et restaure des bâtisses en secteur sauvegardé, dans le respect du patrimoine et des matériaux nobles (pierre, chaux, bois massif, travertin).",
      problem: "Son ancien site WordPress, basique et daté, ne reflétait en rien la qualité de ses réalisations. Dans un métier où la confiance se gagne sur l'image, un site générique fait perdre des projets haut de gamme. Il fallait une vitrine à la hauteur de son travail, qui inspire et déclenche la demande.",
    },
    solution: [
      { title: 'Direction artistique éditoriale', desc: "DA minimale et élégante (typographie Geist, beige doux & noir, grandes images), pensée comme un magazine d'architecture. Le site respire et met la pierre, la lumière et le paysage au premier plan." },
      { title: 'Vidéo IA + vraies photos', desc: "Une vidéo d'ouverture cinématographique (mas provençal au coucher de soleil) générée et upscalée en IA, combinée aux véritables photographies des chantiers livrés de l'architecte." },
      { title: 'Architecture multi-pages', desc: "Accueil, Projets et fiches détaillées, Agence, Services, Galerie et Contact — une structure claire qui valorise chaque réalisation et raconte la démarche." },
      { title: 'Parcours vers le contact', desc: "Chaque page guide vers la prise de contact : CTA permanents, formulaire qualifié par type de projet, coordonnées directes. La découverte mène naturellement à l'échange." },
    ],
    results: [
      { value: '100%', label: 'refonte sur-mesure (ex-WordPress basique)' },
      { value: 'Vidéo IA', label: "d'ambiance 2K + vraies photos de chantiers" },
      { value: 'Multi-pages', label: 'projets, agence, services, galerie, contact' },
      { value: 'Geist', label: 'DA éditoriale minimale & responsive' },
    ],
    gallery: [
      { src: '/images/realisations/marine-desktop.jpg', caption: "Page d'accueil · Desktop" },
      { src: '/images/realisations/marine-projets.jpg', caption: "Réalisations · projets en Provence" },
      { src: '/images/realisations/marine-mobile.jpg', caption: 'Version mobile · 390px', mobile: true },
    ],
    testimonial: {
      text: "Une refonte qui change tout : le travail de Marine est enfin présenté avec l'élégance qu'il mérite. DA éditoriale, vidéo IA et vraies photos — conçu et déployé en un temps record.",
      name: 'Béranger Vives',
      role: 'Fondateur, vivesmedia.com',
    },
    stack: ['Next.js 16', 'TypeScript', 'Tailwind CSS', 'GSAP / Lenis', 'Higgsfield AI', 'Vercel'],
    services: [
      { label: 'Site Vitrine', href: '/services/site-vitrine' },
      { label: 'Référencement SEO', href: '/services/seo' },
    ],
  },
  {
    slug: 'stoop',
    name: 'Stoop',
    type: 'Site Vitrine · Logistique & Transport',
    year: '2026',
    tags: ['Site Vitrine', 'Direction Artistique', 'Animation', 'SEO'],
    heroImage: '/images/realisations/stoop-desktop.jpg',
    liveUrl: 'https://stoop-logistics.vercel.app',
    intro: "Un site vitrine premium pour une entreprise de logistique full-service — pensé pour inspirer confiance en quelques secondes et transformer le visiteur en demande de devis ou en rendez-vous. Direction artistique cinématographique, médias 100% générés en IA, et un tunnel de conversion complet.",
    context: {
      client: "Stoop est une marque de logistique full-service : entreposage, transport de fret, livraison dernier kilomètre et orchestration de supply-chain 4PL. Sa cible : des expéditeurs de toutes tailles, du petit e-commerce à l'industriel, qui choisissent leur prestataire logistique sur le professionnalisme et la confiance dégagés en ligne.",
      problem: "En logistique B2B, la décision se joue sur la crédibilité perçue. Un site daté ou générique fait fuir des prospects à fort potentiel vers des concurrents mieux présentés. Il fallait un site qui projette immédiatement une image solide, pro et premium — et qui guide vers la prise de contact.",
    },
    solution: [
      { title: 'Direction artistique industrielle premium', desc: "Base crème / ink / orange brûlé, typographie DM Sans, sections services pinnées au scroll et icônes fines. Une DA cinématographique qui inspire la confiance avant même la lecture." },
      { title: 'Médias 100% générés en IA', desc: "Vidéos hero et CTA en boucle + visuels (entrepôt, fret, dernier kilomètre) créés puis upscalés en 4K via IA. Zéro banque d'images générique : chaque média est cohérent avec la marque." },
      { title: 'Architecture multi-pages SEO', desc: "Plus de 10 pages (services + fiches détaillées, industries, tarifs, à propos, blog + articles, contact), metadata complètes et Schema.org, build 100% statique pour la performance." },
      { title: 'Tunnel de conversion complet', desc: "Vraies offres tarifées, preuves sociales (statistiques animées, témoignages chiffrés, logos partenaires), formulaire qualifié et réservation d'appel — tout mène à la prise de contact." },
    ],
    results: [
      { value: 'SEO 100', label: 'score Lighthouse SEO (Best Practices 100)' },
      { value: '100%', label: 'médias générés en IA (vidéos + visuels 4K)' },
      { value: '10+', label: 'pages, architecture multi-pages optimisée' },
      { value: 'GSAP', label: 'animations scroll premium (Lenis)' },
    ],
    gallery: [
      { src: '/images/realisations/stoop-desktop.jpg', caption: "Page d'accueil · Desktop" },
      { src: '/images/realisations/stoop-services.jpg', caption: 'Section services · scroll horizontal' },
      { src: '/images/realisations/stoop-mobile.jpg', caption: 'Version mobile · 390px', mobile: true },
    ],
    testimonial: {
      text: "Ce projet incarne la promesse de l'agence : une direction artistique premium, des médias créés en IA et un tunnel de conversion complet — conçu, développé et déployé en un temps record.",
      name: 'Béranger Vives',
      role: 'Fondateur, vivesmedia.com',
    },
    stack: ['Next.js 16', 'TypeScript', 'Tailwind CSS', 'GSAP / Lenis', 'Higgsfield AI', 'Vercel'],
    services: [
      { label: 'Site Vitrine', href: '/services/site-vitrine' },
      { label: 'Référencement SEO', href: '/services/seo' },
    ],
  },
  {
    slug: 'yannis-amielh',
    name: 'Yannis Amielh',
    type: 'Portfolio · Mannequin Éditorial',
    year: '2026',
    tags: ['Portfolio', 'Direction Artistique', 'Animation', '3D'],
    heroImage: '/images/realisations/yannis-site-desktop.jpg',
    liveUrl: 'https://yannis-portfolio-xi.vercel.app',
    intro: "Un portfolio haut de gamme pour un mannequin éditorial — pensé comme une expérience cinématographique. Objectif : convaincre agences et marques en quelques secondes et déclencher la prise de contact pour un booking.",
    context: {
      client: "Yannis Amielh est un mannequin basé entre Marseille et Paris (editorial, campagne, runway). Son univers mêle l'énergie Japon / manga / streetwear et l'art de vivre méditerranéen — une identité forte qu'aucune fiche d'agence standard ne pouvait restituer.",
      problem: "Dans le mannequinat, les directeurs de casting décident en quelques secondes. Sans un site qui projette immédiatement une image premium et une vraie direction artistique, un profil se noie parmi des centaines de books génériques. Il fallait un objet web qui se démarque et inspire confiance instantanément.",
    },
    solution: [
      { title: 'Direction artistique signature', desc: "Base sombre cinématographique, typographie editorial, accents rouge manga et soleil méditerranéen. Le site raconte une identité, pas seulement une galerie de photos." },
      { title: 'Expérience animée premium', desc: "Animations au scroll (GSAP + Lenis), transitions fluides, signature 3D temps réel. Chaque interaction renforce l'impression de soin et de haut de gamme." },
      { title: 'Mise en valeur des visuels', desc: "Photos hi-res plein écran, catégories editorial / campagne / runway / lifestyle. Le book respire et chaque cliché est présenté comme une pièce de campagne." },
      { title: 'Conversion vers le booking', desc: "Parcours orienté prise de contact : formulaire de booking, accès direct Instagram et coordonnées agence. La découverte mène naturellement à la demande." },
    ],
    results: [
      { value: '100%', label: 'photos originales hi-res' },
      { value: '< 3s', label: 'pour saisir l\'univers de marque' },
      { value: '3D', label: 'signature temps réel dans le navigateur' },
      { value: 'Mobile', label: 'expérience pensée pouce d\'abord' },
    ],
    gallery: [
      { src: '/images/realisations/yannis-site-desktop.jpg', caption: 'Page d\'accueil · Desktop' },
      { src: '/images/realisations/yannis-site-2.jpg', caption: 'Section Work · grille projets' },
      { src: '/images/realisations/yannis-site-mobile.jpg', caption: 'Version mobile · 390px', mobile: true },
    ],
    stack: ['Next.js', 'TypeScript', 'Tailwind CSS', 'GSAP / Lenis', 'React Three Fiber'],
    services: [
      { label: 'Site Vitrine', href: '/services/site-vitrine' },
      { label: 'Référencement SEO', href: '/services/seo' },
    ],
  },
  {
    slug: 'vives-reports',
    name: 'Vives Reports',
    type: 'Site Éditorial · Guide Touristique Rome',
    year: '2022',
    tags: ['Éditorial', 'SEO', 'React'],
    heroImage: '/images/realisations/vivesreports-desktop.png',
    liveUrl: 'https://vivesreports.com',
    intro: "Un guide touristique de Rome pensé comme un média éditorial premium — articles longs, photos originales, itinéraires détaillés. Objectif : capter le trafic Google francophone sur les requêtes touristiques romaines et le monétiser.",
    context: {
      client: "Vives Reports est un projet éditorial indépendant : un guide de Rome écrit sur le terrain, avec des photos originales et des itinéraires testés à pied — loin des contenus génériques générés en masse par les gros sites de voyage.",
      problem: "Le marché des guides touristiques en ligne est dominé par des mastodontes (TripAdvisor, GetYourGuide, blogs établis depuis 10 ans). Sans budget publicitaire, la seule voie d'entrée était le SEO éditorial : des contenus plus profonds, mieux structurés et plus authentiques que la concurrence.",
    },
    solution: [
      { title: 'Architecture éditoriale SEO', desc: "Structure en silos thématiques : quartiers, monuments, itinéraires, gastronomie. Chaque silo nourrit une page pilier optimisée sur une requête principale à fort volume." },
      { title: 'Contenu de terrain', desc: "Articles de 1 500 à 3 000 mots avec photos originales prises sur place — un signal d'authenticité que Google et les lecteurs récompensent face aux banques d'images." },
      { title: 'Performance technique', desc: "Site React rapide, images optimisées WebP, Core Web Vitals au vert. Sur des requêtes concurrentielles, la vitesse fait la différence dans le classement." },
      { title: 'Maillage interne systématique', desc: "Chaque article renvoie vers 3 à 5 contenus connexes. Le visiteur reste, Google comprend la profondeur thématique du site." },
    ],
    results: [
      { value: '#2.4', label: 'position moyenne Google sur "guide touristique Rome"' },
      { value: '18,4%', label: 'de CTR sur la requête principale' },
      { value: '4 mois', label: 'pour atteindre la page 1' },
      { value: '100%', label: 'photos originales prises sur le terrain' },
    ],
    gallery: [
      { src: '/images/realisations/vivesreports-desktop.png', caption: 'Page d\'accueil · Desktop 1440px' },
      { src: '/images/realisations/vivesreports-mobile.png', caption: 'Version mobile · 390px', mobile: true },
    ],
    testimonial: {
      text: "Ce projet est la preuve par l'exemple de la méthode SEO vivesmedia.com : il a atteint la page 1 de Google sur une requête ultra-concurrentielle, sans un euro de publicité.",
      name: 'Béranger Vives',
      role: 'Fondateur, vivesmedia.com',
    },
    stack: ['React', 'SEO éditorial', 'Photographie originale', 'Google Search Console'],
    services: [
      { label: 'Référencement SEO', href: '/services/seo' },
      { label: 'Site Vitrine', href: '/services/site-vitrine' },
    ],
  },
  {
    slug: 'paul-et-louis-sport',
    name: 'Paul & Louis Sport',
    type: 'Site Vitrine · Club Padel',
    year: '2024',
    tags: ['Site Vitrine', 'Sport', 'Design'],
    heroImage: 'https://media.base44.com/images/public/69f3530cd3a27defe3c78f69/44abc6e41_p1049264-high-o0dyng.png',
    intro: "Un site vitrine pour un club de padel qui devait faire deux choses : donner envie de jouer dès la première seconde, et transformer cette envie en réservation de terrain.",
    context: {
      client: "Paul & Louis Sport est un club de padel en pleine croissance, porté par l'explosion de ce sport en France. Terrains neufs, ambiance conviviale, mais aucune présence en ligne à la hauteur.",
      problem: "Le padel attire un public jeune et connecté qui compare les clubs sur Google et Instagram avant de réserver. Sans site professionnel, le club perdait des joueurs au profit de concurrents moins bien équipés mais plus visibles en ligne.",
    },
    solution: [
      { title: 'Design immersif sport', desc: "Photos plein écran des terrains et des matchs, palette énergique, typographie impactante. Le site transmet l'adrénaline du jeu avant même la visite." },
      { title: 'Parcours de réservation direct', desc: "CTA 'Réserver un terrain' visible en permanence. Le visiteur passe de la découverte à la réservation en 2 clics maximum." },
      { title: 'SEO local padel', desc: "Optimisation sur les requêtes 'padel + ville' et intégration Google Business Profile. Le club apparaît quand un joueur cherche un terrain dans la zone." },
      { title: 'Mobile-first', desc: "80% des joueurs consultent depuis leur téléphone, souvent entre deux matchs. Chaque page est pensée pouce d'abord, desktop ensuite." },
    ],
    results: [
      { value: '10j', label: 'de la commande à la mise en ligne' },
      { value: '2 clics', label: 'de l\'accueil à la réservation' },
      { value: '100%', label: 'responsive mobile, tablette, desktop' },
      { value: 'Top 3', label: 'Google Maps sur "padel" dans la zone' },
    ],
    gallery: [
      { src: 'https://media.base44.com/images/public/69f3530cd3a27defe3c78f69/44abc6e41_p1049264-high-o0dyng.png', caption: 'Page d\'accueil — immersion terrain' },
    ],
    testimonial: {
      text: "Le site donne exactement l'image qu'on voulait : moderne, sportive, pro. Les nouvelles têtes nous disent souvent qu'elles nous ont trouvés sur Google.",
      name: 'Paul & Louis',
      role: 'Fondateurs du club',
    },
    stack: ['Next.js', 'Tailwind CSS', 'SEO local', 'Google Business Profile'],
    services: [
      { label: 'Site Vitrine', href: '/services/site-vitrine' },
      { label: 'Référencement SEO', href: '/services/seo' },
    ],
  },
  {
    slug: 'ecoserre',
    name: 'Ecoserre',
    type: 'Site Vitrine · Habitat Durable',
    year: '2024',
    tags: ['Site Vitrine', 'Green', 'SEO'],
    heroImage: '/images/realisations/ecoserre-desktop.png',
    intro: "Un site vitrine pour un spécialiste de l'habitat durable et des serres bioclimatiques — un secteur où la confiance et la pédagogie font la vente.",
    context: {
      client: "Ecoserre conçoit des serres bioclimatiques et des solutions d'habitat durable. Un produit d'investissement (plusieurs milliers d'euros) avec un cycle de décision long, où le client compare, se renseigne et mûrit son projet pendant des semaines.",
      problem: "Sur un achat réfléchi de ce type, un site daté détruit la confiance instantanément. Ecoserre avait besoin d'un site qui rassure, éduque et accompagne le prospect jusqu'à la demande de devis — pas d'une simple plaquette.",
    },
    solution: [
      { title: 'Pédagogie avant la vente', desc: "Sections explicatives sur le fonctionnement bioclimatique, les matériaux, les économies d'énergie. Le prospect comprend la valeur avant de voir le prix." },
      { title: 'Esthétique naturelle premium', desc: "Palette végétale, photos lumineuses, beaucoup d'espace blanc. Le design incarne les valeurs écologiques du produit." },
      { title: 'Tunnel de devis progressif', desc: "Formulaire de demande de devis en plusieurs étapes courtes — moins intimidant qu'un long formulaire, meilleur taux de complétion." },
      { title: 'SEO de niche', desc: "Optimisation sur 'serre bioclimatique', 'serre adossée' et les requêtes longue traîne du secteur — moins de volume mais une intention d'achat très forte." },
    ],
    results: [
      { value: '×2', label: 'demandes de devis vs ancien site' },
      { value: 'Page 1', label: 'Google sur les requêtes de niche ciblées' },
      { value: '< 2s', label: 'de chargement sur mobile' },
      { value: '95+', label: 'score Lighthouse performance' },
    ],
    gallery: [
      { src: '/images/realisations/ecoserre-desktop.png', caption: 'Page d\'accueil · Desktop 1440px' },
      { src: '/images/realisations/ecoserre-mobile.png', caption: 'Version mobile · 390px', mobile: true },
    ],
    testimonial: {
      text: "Nos clients arrivent en rendez-vous en ayant déjà tout compris du produit. Le site fait la moitié du travail de vente à notre place.",
      name: 'Ecoserre',
      role: 'Direction',
    },
    stack: ['Next.js', 'Tailwind CSS', 'SEO de niche', 'Formulaires progressifs'],
    services: [
      { label: 'Site Vitrine', href: '/services/site-vitrine' },
      { label: 'Référencement SEO', href: '/services/seo' },
    ],
  },
  {
    slug: 'wood-design',
    name: 'Wood Design',
    type: 'Site Catalogue · Artisan Bois',
    year: '2024',
    tags: ['Catalogue', 'Artisan', 'Design'],
    heroImage: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=1600&q=80',
    intro: "Un site catalogue pour un artisan du bois : présenter toute la gamme de créations, générer des demandes de devis — sans la complexité d'une boutique en ligne.",
    context: {
      client: "Wood Design crée du mobilier et des aménagements sur mesure en bois massif. Chaque pièce est unique ou fabriquée en petite série, avec des prix qui varient selon les essences, dimensions et finitions.",
      problem: "Impossible de vendre ce type de produit avec un panier classique : les prix dépendent du projet. Mais sans présence en ligne, l'artisan dépendait du bouche-à-oreille et passait des heures à envoyer des photos par email à chaque prospect.",
    },
    solution: [
      { title: 'Catalogue structuré par collections', desc: "Tables, assises, rangements, aménagements — chaque collection avec ses fiches produit : photos, essences disponibles, dimensions, finitions." },
      { title: 'Demande de devis par produit', desc: "Chaque fiche a son bouton 'Demander un devis' pré-rempli avec la référence. L'artisan reçoit des demandes qualifiées au lieu de questions vagues." },
      { title: 'Mise en valeur artisanale', desc: "Photos macro du grain du bois, des assemblages, de l'atelier. Le site vend le savoir-faire autant que le produit." },
      { title: 'Filtres simples et efficaces', desc: "Par type de meuble, essence de bois et gamme de prix. Le visiteur trouve sa pièce en quelques secondes." },
    ],
    results: [
      { value: '12j', label: 'de mise en ligne' },
      { value: '+60%', label: 'de demandes de devis qualifiées' },
      { value: '0', label: 'email de photos à envoyer manuellement' },
      { value: '45 min', label: 'de formation pour gérer le catalogue seul' },
    ],
    gallery: [
      { src: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=1200&q=80', caption: 'Mise en valeur du savoir-faire artisanal' },
    ],
    testimonial: {
      text: "Avant, je passais mes soirées à envoyer des photos par email. Maintenant les clients arrivent en sachant exactement ce qu'ils veulent, avec la référence.",
      name: 'Wood Design',
      role: 'Artisan fondateur',
    },
    stack: ['Next.js', 'Tailwind CSS', 'Catalogue dynamique', 'Formulaires devis'],
    services: [
      { label: 'Site Catalogue', href: '/services/site-catalogue' },
      { label: 'Site Vitrine', href: '/services/site-vitrine' },
    ],
  },
]

export function getRealisationBySlug(slug: string): RealisationData | undefined {
  return REALISATIONS_DATA.find(r => r.slug === slug)
}
