import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    // Ancienne URL "agence" → nouvelle URL "freelance" (positionnement réel), 301 permanent.
    return [
      { source: "/agence-web-vaucluse", destination: "/freelance-web-vaucluse", permanent: true },
      // /devis n'a JAMAIS existé (404 en prod) alors que 3 articles publiés y envoient
      // leur CTA de fin : geo-tpe-pme-chatgpt-perplexity-2026,
      // prix-site-ecommerce-shopify-2026, shopify-woocommerce-prestashop-comparatif-2026.
      // 301 vers /contact pour récupérer ces clics au lieu de les perdre sur un 404.
      { source: "/devis", destination: "/contact", permanent: true },
    ];
  },
  async headers() {
    // noindex sur tout ce qui ne doit JAMAIS apparaître dans Google : back-office,
    // API, Hub, page de remerciement. Couplé au robots.txt (qui autorise désormais
    // le crawl de /cms pour que Google VOIE ce noindex et retire les URLs indexées).
    const noindex = [{ key: "X-Robots-Tag", value: "noindex, nofollow" }];
    // CSP en Report-Only : elle NE BLOQUE RIEN, elle signale seulement les
    // violations (visibles en console). Objectif : observer en prod avec la
    // liste blanche des scripts tiers réels, puis basculer en CSP « enforce »
    // (renommer la clé en "Content-Security-Policy") une fois zéro faux positif.
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://*.i.posthog.com https://analytics.ahrefs.com https://cdn.brevo.com https://sibautomation.com https://js.stripe.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https://images.unsplash.com https://*.supabase.co https://www.googletagmanager.com https://www.google-analytics.com https://*.g.doubleclick.net https://analytics.ahrefs.com",
      "font-src 'self' data:",
      // ATTENTION — deux origines ci-dessous ont été ajoutées après avoir OBSERVÉ de
      // VRAIES violations en production (console Chrome sur /contact, 31/07/2026) :
      //  · https://*.analytics.google.com → GA4 poste ses hits sur
      //    region1.analytics.google.com, qui n'est PAS couvert par *.google-analytics.com
      //    (domaine différent). Sans cette entrée, basculer la CSP en « enforce »
      //    coupait TOUTE la mesure GA4, en silence.
      //  · https://*.brevo.com → le tracking Brevo appelle in-automate.brevo.com,
      //    alors que seul api.brevo.com était autorisé.
      "connect-src 'self' https://*.i.posthog.com https://www.google-analytics.com https://*.google-analytics.com https://*.analytics.google.com https://*.supabase.co https://analytics.ahrefs.com https://sibautomation.com https://*.brevo.com https://*.stripe.com",
      "frame-src https://js.stripe.com https://hooks.stripe.com",
      "frame-ancestors 'self'",
      "base-uri 'self'",
      "object-src 'none'",
    ].join("; ");
    // Headers de sécurité appliqués à TOUTES les routes. On reste sur les protections
    // « sans risque » (aucune ne casse PostHog/Stripe/Supabase).
    const security = [
      // Force HTTPS pendant 2 ans (préchargeable). Vercel sert déjà tout en HTTPS.
      { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
      // Empêche le navigateur de « deviner » un type MIME (anti-injection).
      { key: "X-Content-Type-Options", value: "nosniff" },
      // Anti-clickjacking : le site ne peut pas être chargé dans une iframe externe.
      { key: "X-Frame-Options", value: "SAMEORIGIN" },
      // Ne fuit pas l'URL complète vers les sites tiers.
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      // Coupe les API sensibles non utilisées par le site.
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()" },
      { key: "X-DNS-Prefetch-Control", value: "on" },
      // Isole le contexte de navigation : une fenêtre ouverte depuis le site (ou qui
      // ouvre le site) ne peut plus manipuler notre `window` (protection tabnabbing /
      // fuites cross-origin). `same-origin-allow-popups` et non `same-origin` pour ne
      // PAS casser les popups de paiement Stripe, qui ont besoin du lien opener.
      { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
      // NB : on n'ajoute PAS Cross-Origin-Resource-Policy. En "same-site" il
      // empêcherait tout site tiers de charger nos images/polices (aperçus,
      // partenaires, articles qui nous citent) pour un gain faible ici, le site
      // n'étant de toute façon pas cross-origin isolated. À n'activer que si un
      // besoin d'isolation (SharedArrayBuffer) apparaît.
      // CSP TOUJOURS en observation (ne bloque rien) — VOLONTAIRE, voir le rapport :
      // deux violations réelles (GA4 region1 + Brevo in-automate) tournaient en prod ;
      // elles sont corrigées ci-dessus, mais il faut une fenêtre d'observation sur les
      // pages non testées (articles, réalisations, /cms, /hub, tunnel Stripe) avant de
      // basculer. Pour passer en blocage : renommer cette clé en
      // "Content-Security-Policy" — et seulement après 0 violation constatée.
      { key: "Content-Security-Policy-Report-Only", value: csp },
    ];
    return [
      { source: "/:path*", headers: security },
      { source: "/cms", headers: noindex },
      { source: "/cms/:path*", headers: noindex },
      { source: "/api/:path*", headers: noindex },
      { source: "/hub", headers: noindex },
      { source: "/hub/:path*", headers: noindex },
      { source: "/merci", headers: [{ key: "X-Robots-Tag", value: "noindex" }] },
    ];
  },
  async rewrites() {
    // DÉBRANCHEMENT : la fusion est terminée. Tout /hub (espace client) ET toute
    // l'administration (Projets, invitation, inscription cours, génération IA) sont
    // désormais NATIFS dans cette appli. Plus aucun proxy vers vivesmedia-hub.
    // L'ancien back-office externe /hub/admin (doublon du /cms) n'est plus servi.
    return [];
  },
};

export default nextConfig;
