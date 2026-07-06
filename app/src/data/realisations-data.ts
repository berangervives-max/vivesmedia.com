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
  gallery: { src: string; caption: string; mobile?: boolean; rationale?: string; before?: string }[]
  testimonial?: { text: string; name: string; role: string }
  stack: string[]
  services: { label: string; href: string }[]
  /** Parti pris design — nuancier de la charte du site livré (swatches). */
  palette?: { hex: string; name: string; text?: 'light' | 'dark' }[]
  /** Parti pris design — spécimens typographiques (police + rôle + échantillon). */
  typography?: { font: string; role: string; sample: string; note?: string; serif?: boolean }[]
  /** Les détails qui comptent — gros plans annotés sur des choix d'UI/ergonomie. */
  uiDetails?: { title: string; why: string; image?: string; mobile?: boolean }[]
}

export const REALISATIONS_DATA: RealisationData[] = [
  {
    slug: 'cadence',
    name: 'CADENCE',
    type: 'Concept & Site · Studio Multisport',
    year: '2026',
    tags: ['Concept', 'Direction Artistique', 'Sport & Bien-être', 'SEO'],
    heroImage: '/images/realisations/cadence-desktop.png',
    liveUrl: 'https://cadence-ashen-five.vercel.app',
    intro: "Un concept original imaginé ET prototypé de A à Z par vivesmedia.com : CADENCE, un studio multisport premium qui réunit 6 disciplines (running, Hyrox, CrossFit, force, yoga, mobilité) sous un même toit, avec un bar healthy et une vraie communauté. Au-delà du site, c'est une marque, une direction artistique éditoriale noir & blanc, une architecture complète (18+ pages) et un dossier business — la démonstration qu'on sait penser un projet de bout en bout pour un secteur précis, et le matérialiser en un site qui donne envie de s'abonner.",
    context: {
      client: "CADENCE est un concept maison de vivesmedia.com — pas un client, mais un prototype de marque pensé pour le secteur du sport et du bien-être. L'idée : prouver qu'on peut concevoir pour une salle de sport, un club de running, une box CrossFit ou un studio de yoga un site à la hauteur des meilleures marques lifestyle, et même imaginer le concept commercial qui va avec.",
      problem: "Les sites de salles de sport se ressemblent tous : sombres, génériques, datés. Le défi était double — créer une direction artistique forte, premium et différenciante (à des années-lumière du fitness low-cost), et bâtir un site complet et fonctionnel (disciplines, planning, abonnements, communauté, blog, réservation) capable de convertir et de servir d'exemple sectoriel.",
    },
    solution: [
      { title: 'Le parti pris : une marque lifestyle, pas une salle de sport', desc: "Direction artistique éditoriale mono — noir, blanc, gris — inspirée des marques running premium (Bandit, Tracksmith). Typographie XXL qui déborde du viewport, filets fins, photos couleur sur chrome noir & blanc, vidéos hero passées en N&B. Aux antipodes du fitness générique : on vend une appartenance, pas un abonnement." },
      { title: 'Direction artistique & branding complet', desc: "Logo (monogramme 3 chevrons + wordmark Archivo), système de couleurs en tokens, pairing typographique Archivo / Inter, style photo défini, ton de voix. Un mini-brandkit cohérent, décliné jusqu'à une page charte intégrée au site." },
      { title: 'Une architecture complète (18+ pages)', desc: "Accueil, 6 pages disciplines dédiées, planning, Le Comptoir (bar healthy), communauté, abonnements + 4 fiches formules, journal + articles, contact, réservation. Un vrai site d'exploitation, pas une plaquette." },
      { title: 'Pages disciplines approfondies', desc: "Chaque discipline a sa page : intro, chiffres, « pour qui » (tunnels de conversion par cible), contenu inclus, galerie, et un bloc coach avec photo de profil et liens Strava / Instagram — la dimension communautaire incarnée." },
      { title: 'Le concept du Comptoir & la communauté', desc: "Un bar à matcha / café de spécialité (Le Comptoir) et des fonctionnalités communautaires (s'entraîner entre potes, visibilité opt-in, apps connectées) qui différencient radicalement le concept des chaînes anonymes." },
      { title: 'Contenu & SEO / AEO', desc: "6 articles de blog rédigés et optimisés pour le référencement classique ET les moteurs IA (balisage Schema.org Article + FAQ), métadonnées complètes, sitemap — pensé pour être trouvé sur Google comme cité par les IA." },
      { title: 'Tunnel de conversion fonctionnel', desc: "Sélecteur « trouve ton parcours », formules détaillées (dont tarif étudiant et duo), et un tunnel de réservation d'essai gratuit fonctionnel avec confirmation. De la découverte à la prise de contact, sans friction." },
      { title: 'Conçu, développé et déployé en un temps record', desc: "Stack moderne (Next.js 16, React 19, Tailwind CSS v4), médias sourcés et calibrés, build statique optimisé, déploiement Vercel. Le tout doublé d'un dossier d'étude de marché et de faisabilité — la preuve d'une approche projet globale." },
    ],
    results: [
      { value: '18+', label: 'pages, architecture multi-secteurs complète' },
      { value: 'Mono', label: 'DA éditoriale noir & blanc premium' },
      { value: 'SEO + IA', label: 'articles balisés Schema (Article + FAQ)' },
      { value: 'Concept', label: 'marque + site + dossier business de A à Z' },
    ],
    gallery: [
      { src: '/images/realisations/cadence-desktop.png', caption: "Page d'accueil · Desktop" },
      { src: '/images/realisations/cadence-disciplines.png', caption: 'Disciplines · grille éditoriale' },
      { src: '/images/realisations/cadence-mobile.png', caption: 'Version mobile · 390px', mobile: true },
    ],
    testimonial: {
      text: "CADENCE résume ce que sait faire vivesmedia.com : penser un concept de marque pour un secteur, lui donner une direction artistique forte, et le matérialiser en un site complet et fonctionnel — du premier pixel au déploiement.",
      name: 'Béranger Vives',
      role: 'Fondateur, vivesmedia.com',
    },
    stack: ['Next.js 16', 'React 19', 'TypeScript', 'Tailwind CSS v4', 'Vercel'],
    services: [
      { label: 'Site Vitrine', href: '/services/site-vitrine' },
      { label: 'Référencement SEO', href: '/services/seo' },
    ],
  },
  {
    slug: 'marine-caro',
    name: 'Marine Caro',
    type: 'Site Vitrine · Architecte en Provence',
    year: '2026',
    tags: ['Site Vitrine', 'Architecture', 'Direction Artistique', 'SEO'],
    heroImage: '/images/realisations/marine-desktop.jpg',
    liveUrl: 'https://marine-caro.vercel.app',
    intro: "Refonte complète du site d'une architecte en Provence — un portfolio premium pensé comme un magazine d'architecture, qui révèle l'excellence de son travail et transforme le visiteur en prise de contact. Tout part d'un parti pris fort : effacer le \"décor web\" pour laisser parler la pierre, la lumière et le paysage. Direction artistique éditoriale minimale, vidéo d'ambiance générée en IA, vraies photos de chantiers et un parcours entièrement orienté vers le booking de projet.",
    context: {
      client: "Marine Caro (Architecte Horizon) est architecte en Provence — Vaucluse, Gard, Bouches-du-Rhône. Elle conçoit des villas neuves, rénove des mas et restaure des bâtisses en secteur sauvegardé, dans le respect du patrimoine et des matériaux nobles (pierre, chaux, bois massif, travertin).",
      problem: "Son ancien site WordPress, basique et daté, ne reflétait en rien la qualité de ses réalisations. Dans un métier où la confiance se gagne sur l'image, un site générique fait perdre des projets haut de gamme. Il fallait une vitrine à la hauteur de son travail, qui inspire et déclenche la demande.",
    },
    solution: [
      { title: 'Le parti pris : un magazine d\'architecture, pas un site', desc: "Le choix fondateur : traiter le site comme une revue d'architecture haut de gamme. Beaucoup de blanc, de grandes images plein cadre, une mise en page éditoriale qui respire. On ne \"remplit\" pas l'écran — on le laisse vide à dessein, pour que chaque projet ait le poids d'une double page imprimée." },
      { title: 'Direction artistique & branding', desc: "Palette volontairement quasi-monochrome — noir (#000), beige doux (#f6f6f1), gris stone (#707070) et blanc — sans couleur \"accent\" tape-à-l'œil : la couleur, ce sont les photos de chantiers. Typographie Geist (sans-serif contemporaine, lisible et neutre) pour ne jamais voler la vedette à l'architecture. Animations lentes et fluides (courbe d'accélération sur-mesure) qui donnent une sensation premium et posée." },
      { title: 'Les valeurs incarnées dans le design', desc: "Le métier de Marine — respect du patrimoine, matériaux nobles (pierre, chaux, bois massif, travertin), justesse — devait se ressentir avant même la lecture. D'où le minimalisme, la sobriété et la lenteur assumée : un design qui inspire la confiance et le sérieux, à l'image de son travail sur des mas et bâtisses en secteur sauvegardé." },
      { title: 'Page Accueil : l\'accroche cinématographique', desc: "Une vidéo d'ouverture (mas provençal au coucher de soleil) générée et upscalée en IA, en plein écran, pour happer en 2 secondes. Puis une descente éditoriale vers les projets phares — l'internaute \"feuillette\" et a immédiatement envie de voir plus." },
      { title: 'Projets & fiches détaillées', desc: "Chaque réalisation a sa fiche : grandes photos, contexte, matériaux, démarche. C'est le cœur de la preuve — on montre le \"avant/après\" et le soin du détail qui justifie le positionnement haut de gamme." },
      { title: 'Galerie & Agence : la preuve et l\'histoire', desc: "La Galerie regroupe les visuels les plus forts (parcours visuel pur). La page Agence raconte qui est Marine, sa vision et ses valeurs — l'étape qui transforme l'admiration en confiance avant la prise de contact." },
      { title: 'Médias 100% maîtrisés (IA + vrai)', desc: "Vidéo d'ambiance générée en IA + vraies photographies des chantiers livrés. Aucune banque d'images générique : chaque visuel est cohérent avec l'univers de l'architecte, ce qui renforce l'authenticité et le premium." },
      { title: 'Parcours orienté booking', desc: "Chaque page guide vers le contact : CTA permanents, formulaire qualifié par type de projet (neuf, rénovation, restauration), coordonnées directes. La découverte mène naturellement à l'échange — l'objectif business est tenu sans jamais casser l'esthétique." },
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
    intro: "Un site premium pour une marque de logistique full-service — pensé pour inspirer une confiance immédiate en B2B et transformer le visiteur en demande de devis ou en rendez-vous. Le défi : en logistique, la décision se joue sur la crédibilité perçue en quelques secondes. Réponse : une direction artistique industrielle cinématographique, des médias 100% générés en IA, une architecture de plus de 10 pages et un tunnel de conversion complet — du premier scroll jusqu'à la prise de contact.",
    context: {
      client: "Stoop est une marque de logistique full-service : entreposage, transport de fret, livraison dernier kilomètre et orchestration de supply-chain 4PL. Sa cible : des expéditeurs de toutes tailles, du petit e-commerce à l'industriel, qui choisissent leur prestataire logistique sur le professionnalisme et la confiance dégagés en ligne.",
      problem: "En logistique B2B, la décision se joue sur la crédibilité perçue. Un site daté ou générique fait fuir des prospects à fort potentiel vers des concurrents mieux présentés. Il fallait un site qui projette immédiatement une image solide, pro et premium — et qui guide vers la prise de contact.",
    },
    solution: [
      { title: 'Le parti pris : crédibilité B2B en 2 secondes', desc: "En logistique, un site daté = un prospect qui fuit vers un concurrent mieux présenté. Le choix : projeter immédiatement une image solide, industrielle et premium, qui rassure des expéditeurs (du e-commerce à l'industriel) avant même qu'ils lisent un mot." },
      { title: 'Direction artistique industrielle premium', desc: "Palette crème (#f4f0e7) / ink (#131110) / orange brûlé (#e8500c) — chaleureuse mais sérieuse. Double typographie : DM Sans (corps, technique et lisible) + Instrument Serif (titres, touche éditoriale). Animations au scroll fluides (easing expo), sections services \"pinnées\". Le résultat est cinématographique sans jamais être gadget." },
      { title: 'Les valeurs : fiabilité, échelle, maîtrise', desc: "Tout le design traduit les valeurs d'un logisticien : rigueur, fiabilité, capacité à gérer du volume. D'où les statistiques animées, les visuels d'entrepôts et de flux, et une mise en page carrée qui inspire le contrôle et le professionnalisme." },
      { title: 'Pages Services & Industries : l\'offre en clair', desc: "Des pages services détaillées (+ fiches par service) et des pages par industrie : chaque cible se reconnaît et trouve sa réponse. C'est ce qui fait passer d'un \"joli site\" à un site qui qualifie et convertit." },
      { title: 'Page Pricing : la transparence qui rassure', desc: "Des offres tarifées affichées clairement — rare en logistique B2B. La transparence est ici un argument de confiance : le prospect se projette et arrive au contact déjà convaincu." },
      { title: 'Insights (blog) : autorité & SEO', desc: "Une section articles qui installe l'expertise et capte du trafic organique sur les requêtes du secteur — l'autorité se construit en plus de la vitrine." },
      { title: 'Médias 100% générés en IA', desc: "Vidéos hero et CTA en boucle + visuels (entrepôt, fret, dernier kilomètre) créés puis upscalés en 4K via IA. Zéro banque d'images générique : chaque média colle à la marque, ce qui renforce l'authenticité." },
      { title: 'Tunnel de conversion + performance', desc: "Preuves sociales (stats animées, témoignages chiffrés, logos partenaires), formulaire qualifié et réservation d'appel — tout mène au contact. Build statique, metadata complètes et Schema.org : score SEO/Lighthouse au plafond." },
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
      text: "Ce projet incarne ma promesse : une direction artistique premium, des médias créés en IA et un tunnel de conversion complet — conçu, développé et déployé en un temps record.",
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
    intro: "Un guide touristique de Rome pensé comme un média éditorial premium — articles longs, photos prises sur le terrain, fiches de lieux et itinéraires testés à pied, le tout menant à la réservation de visites privées. Le défi : exister face aux mastodontes du voyage (TripAdvisor, GetYourGuide) sans un euro de pub. La réponse : un site éditorial plus profond, plus authentique et techniquement plus rapide que la concurrence — qui capte le trafic Google francophone sur les requêtes romaines et le transforme en réservations.",
    context: {
      client: "Vives Reports est un projet éditorial indépendant : un guide de Rome écrit sur le terrain, avec des photos originales et des itinéraires testés à pied — loin des contenus génériques générés en masse par les gros sites de voyage.",
      problem: "Le marché des guides touristiques en ligne est dominé par des mastodontes (TripAdvisor, GetYourGuide, blogs établis depuis 10 ans). Sans budget publicitaire, la seule voie d'entrée était le SEO éditorial : des contenus plus profonds, mieux structurés et plus authentiques que la concurrence.",
    },
    solution: [
      { title: 'Le parti pris : un média, pas une plaquette', desc: "Le marché est verrouillé par des mastodontes au budget illimité. La seule porte d'entrée sans pub : devenir un vrai média de référence sur Rome. D'où le choix de tout miser sur la profondeur éditoriale et l'authentique terrain — l'inverse exact des contenus génériques produits en masse par les gros sites." },
      { title: 'Direction artistique éditoriale', desc: "Une mise en page de magazine de voyage : grandes photos plein cadre prises sur place, titres affirmés, beaucoup d'espace pour laisser respirer le contenu. Sobre et lisible, le design met le lieu et le récit en avant — jamais le \"décor web\". L'objectif : qu'on ait envie de lire, puis de réserver." },
      { title: 'Les valeurs : authenticité & terrain', desc: "Tout le projet repose sur le vécu : visites testées à pied, quartiers méconnus (Garbatella, Testaccio, Trastevere) plutôt que les pièges à touristes, max 8 personnes. Le design et le contenu traduisent cette promesse — c'est ce qui crée la confiance et différencie d'un guide générique." },
      { title: 'Architecture en silos SEO', desc: "Structure en silos thématiques — quartiers, monuments, itinéraires, gastronomie. Chaque silo nourrit une page pilier optimisée sur une requête principale à fort volume, et capte autour d'elle des dizaines de requêtes longue traîne." },
      { title: 'Fiches de lieux & itinéraires détaillés', desc: "Des fiches par point d'intérêt et des itinéraires complets, jour par jour, réellement parcourus. C'est le contenu utile, concret, que Google et les voyageurs récompensent — et qui donne envie de passer à la visite guidée." },
      { title: 'Contenu de terrain & photos originales', desc: "Articles de 1 500 à 3 000 mots, illustrés exclusivement de photos prises sur place. Zéro banque d'images : un signal d'authenticité fort pour les lecteurs comme pour les algorithmes, face à des concurrents qui recyclent les mêmes visuels." },
      { title: 'Performance technique & maillage', desc: "Site React rapide, images optimisées WebP, Core Web Vitals au vert — sur des requêtes concurrentielles, la vitesse fait la différence. Et un maillage interne systématique (chaque page renvoie vers 3 à 5 contenus connexes) qui retient le visiteur et signale à Google la profondeur thématique." },
      { title: 'Parcours vers la réservation', desc: "Toute la lecture converge vers un objectif business : réserver une visite privée. CTA contextuels dans les articles, fiches visites claires et formulaire de réservation — le trafic SEO gratuit se transforme en demandes qualifiées (réponse sous 24h)." },
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
    heroImage: '/images/44abc6e41_p1049264-high-o0dyng.png',
    liveUrl: 'https://paul-louis-sport.vercel.app',
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
      { src: '/images/realisations/paul-live-1.jpeg', caption: 'Page d\'accueil · Desktop' },
      { src: '/images/44abc6e41_p1049264-high-o0dyng.png', caption: 'Hero — immersion terrain' },
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

// ── PARTI PRIS DESIGN par projet (palette réelle extraite du site livré + typo + choix d'ergonomie) ──
// Séparé du contenu éditorial ci-dessus pour rester lisible. Fusionné dans getRealisationBySlug.
type DesignData = Pick<RealisationData, 'palette' | 'typography' | 'uiDetails'>

const DESIGN_BY_SLUG: Record<string, DesignData> = {
  cadence: {
    palette: [
      { hex: '#000000', name: 'Noir absolu' },
      { hex: '#151515', name: 'Encre' },
      { hex: '#7F7C81', name: 'Gris cendre' },
      { hex: '#F9F9F9', name: 'Blanc cassé' },
      { hex: '#FFFFFF', name: 'Blanc' },
    ],
    typography: [
      { role: 'Titres', font: 'Archivo', sample: 'Trouve ta cadence.', note: 'Grotesque à chasse large — titres XXL qui débordent du viewport pour l’énergie.' },
      { role: 'Corps', font: 'Inter', sample: 'Bouger, performer, récupérer.', note: 'Sans-serif neutre et lisible, au service du contenu.' },
    ],
    uiDetails: [
      { title: 'Un sélecteur « par où tu commences ? »', why: 'Plutôt qu’un mur de formules, 3 profils (remise en forme, sportif confirmé, compétition) orientent chacun vers les bonnes disciplines et la bonne formule. On réduit la charge de décision : le visiteur se reconnaît en un clic.', image: '/images/realisations/cadence-detail-parcours.png' },
      { title: 'Une grille éditoriale de disciplines', why: 'Chaque discipline = une image plein cadre + un verbe d’action (« Découvrir »). On navigue à l’instinct, comme on feuillette un magazine, pas comme on lit un menu déroulant.', image: '/images/realisations/cadence-detail-disciplines.png' },
      { title: 'Une typographie qui déborde de l’écran', why: 'Les titres géants coupés par le bord du viewport créent du mouvement et de la tension — un code emprunté aux marques running premium, à l’opposé du fitness low-cost.' },
      { title: 'Un bandeau d’essai gratuit permanent', why: 'L’offre « 1re séance offerte » reste visible en haut de chaque page : le call-to-action principal ne quitte jamais l’écran, sans jamais gêner la lecture.' },
    ],
  },
  'marine-caro': {
    palette: [
      { hex: '#000000', name: 'Encre' },
      { hex: '#707070', name: 'Pierre' },
      { hex: '#F6F6F1', name: 'Beige doux' },
      { hex: '#FFFFFF', name: 'Blanc' },
    ],
    typography: [
      { role: 'Titres & corps', font: 'Geist', sample: 'Architecte en Provence', note: 'Sans-serif contemporaine, neutre et lisible — elle ne vole jamais la vedette à l’architecture.' },
    ],
    uiDetails: [
      { title: 'Le vide comme parti pris', why: 'Beaucoup de blanc, de grandes images plein cadre : chaque projet a le poids d’une double page imprimée. On ne remplit pas l’écran, on le laisse respirer — c’est ce qui signale le haut de gamme.' },
      { title: 'Des animations lentes, courbe sur-mesure', why: 'Les transitions posées (easing custom) donnent une sensation premium et sérieuse, à l’image d’un travail sur des mas en secteur sauvegardé. La lenteur est un choix, pas un défaut.' },
      { title: 'Un formulaire qualifié par type de projet', why: 'Neuf, rénovation ou restauration : le visiteur se classe lui-même, et Marine reçoit une demande déjà cadrée plutôt qu’un simple « bonjour ».' },
    ],
  },
  stoop: {
    palette: [
      { hex: '#F4F0E7', name: 'Crème' },
      { hex: '#131110', name: 'Ink' },
      { hex: '#E8500C', name: 'Orange brûlé' },
      { hex: '#FFFFFF', name: 'Blanc' },
    ],
    typography: [
      { role: 'Titres', font: 'Instrument Serif', sample: 'Seamless process.', serif: true, note: 'Serif éditoriale — la touche premium qui casse la froideur industrielle.' },
      { role: 'Corps', font: 'DM Sans', sample: 'Entreposage, fret, dernier kilomètre.', note: 'Sans-serif technique et très lisible pour les contenus B2B.' },
    ],
    uiDetails: [
      { title: 'Des sections services « pinnées » au scroll', why: 'Le contenu se fige et défile par blocs : on impose un rythme cinématographique qui retient l’attention sur chaque service, sans noyer le prospect.' },
      { title: 'Des statistiques animées comme preuve', why: 'Les chiffres qui montent au scroll matérialisent la fiabilité et l’échelle — exactement ce qu’un expéditeur cherche à vérifier avant de confier sa logistique.' },
      { title: 'Une page pricing transparente', why: 'Afficher des offres tarifées, rare en logistique B2B, transforme l’opacité habituelle en argument de confiance : le prospect se projette et arrive au contact déjà convaincu.' },
    ],
  },
  'yannis-amielh': {
    palette: [
      { hex: '#121211', name: 'Nuit' },
      { hex: '#FF3D1F', name: 'Rouge manga' },
      { hex: '#E9A23B', name: 'Soleil méditerranéen' },
      { hex: '#F4F2EE', name: 'Craie' },
    ],
    typography: [
      { role: 'Titres & corps', font: 'General Sans', sample: 'Editorial · Campagne · Runway', note: 'Sans-serif éditoriale au caractère marqué — le book se lit comme un magazine de mode.' },
    ],
    uiDetails: [
      { title: 'Une signature 3D temps réel', why: 'Un élément 3D dans le navigateur donne le ton « objet web » dès la première seconde — le book se démarque de centaines de fiches d’agence plates.' },
      { title: 'Un book rangé par registre', why: 'Categories editorial / campagne / runway / lifestyle : le directeur de casting trouve en un regard le registre qu’il cherche, sans scroller au hasard.' },
      { title: 'Pensé pouce d’abord', why: 'Les décideurs scrollent sur mobile : navigation au pouce, photos plein écran, contact accessible en permanence.' },
    ],
  },
  'vives-reports': {
    palette: [
      { hex: '#0A0A0A', name: 'Nuit romaine' },
      { hex: '#E63946', name: 'Rouge Rome' },
      { hex: '#FACC15', name: 'Or' },
      { hex: '#FFFFFF', name: 'Blanc' },
    ],
    typography: [
      { role: 'Titres & corps', font: 'Inter', sample: 'Rome, testée à pied.', note: 'Sans-serif sobre et rapide — priorité à la lisibilité des longs contenus éditoriaux.' },
    ],
    uiDetails: [
      { title: 'Une architecture en silos SEO', why: 'Quartiers, monuments, itinéraires, gastronomie : chaque silo nourrit une page pilier et capte la longue traîne autour. La structure sert le référencement autant que la lecture.' },
      { title: 'Un maillage interne systématique', why: 'Chaque page renvoie vers 3 à 5 contenus connexes : le visiteur reste, et Google lit la profondeur thématique du site.' },
      { title: 'Des CTA contextuels vers la réservation', why: 'Au fil de l’article, des appels à réserver une visite privée transforment un lecteur curieux en demande qualifiée, sans casser la lecture.' },
    ],
  },
  'paul-et-louis-sport': {
    palette: [
      { hex: '#0D0D0D', name: 'Noir terrain' },
      { hex: '#C8E600', name: 'Vert padel' },
      { hex: '#F5F5F5', name: 'Gris clair' },
      { hex: '#FFFFFF', name: 'Blanc' },
    ],
    typography: [
      { role: 'Titres & corps', font: 'Inter', sample: 'Réserve ton terrain.', note: 'Sans-serif impactante et directe — l’énergie du jeu, sans fioriture.' },
    ],
    uiDetails: [
      { title: 'Un CTA « Réserver un terrain » permanent', why: 'L’action principale suit le visiteur : de la découverte à la réservation en 2 clics maximum, on ne laisse jamais l’envie retomber.' },
      { title: 'Pensé mobile d’abord', why: '80 % des joueurs consultent entre deux matchs, sur téléphone : chaque écran est calibré pour le pouce avant le desktop.' },
      { title: 'Un SEO local padel', why: 'Optimisation « padel + ville » + Google Business : le club apparaît au moment exact où un joueur cherche un terrain dans la zone.' },
    ],
  },
  ecoserre: {
    uiDetails: [
      { title: 'La pédagogie avant le prix', why: 'Sur un achat réfléchi à plusieurs milliers d’euros, on explique le fonctionnement bioclimatique et les économies d’énergie avant d’aborder le tarif : le prospect comprend la valeur d’abord.' },
      { title: 'Un tunnel de devis progressif', why: 'Un formulaire en plusieurs étapes courtes, moins intimidant qu’un long questionnaire — meilleur taux de complétion sur un cycle de décision long.' },
      { title: 'Une esthétique naturelle premium', why: 'Palette végétale, photos lumineuses, beaucoup d’espace blanc : le design incarne les valeurs écologiques du produit avant même la lecture.' },
    ],
  },
  'wood-design': {
    uiDetails: [
      { title: 'Un devis pré-rempli par produit', why: 'Chaque fiche a son bouton « Demander un devis » avec la référence déjà remplie : l’artisan reçoit des demandes qualifiées au lieu de questions vagues.' },
      { title: 'Des filtres simples (type, essence, prix)', why: 'Pas de panier ni de complexité e-commerce : le visiteur trouve sa pièce en quelques secondes, l’artisan garde la main sur le prix au projet.' },
      { title: 'La mise en valeur du savoir-faire', why: 'Photos macro du grain du bois, des assemblages, de l’atelier : le site vend l’artisanat autant que le meuble.' },
    ],
  },
}

export function getRealisationBySlug(slug: string): RealisationData | undefined {
  const base = REALISATIONS_DATA.find(r => r.slug === slug)
  if (!base) return undefined
  const design = DESIGN_BY_SLUG[slug]
  return design ? { ...base, ...design } : base
}
