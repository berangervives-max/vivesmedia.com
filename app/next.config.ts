import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    // Ancienne URL "agence" → nouvelle URL "freelance" (positionnement réel), 301 permanent.
    return [
      { source: "/agence-web-vaucluse", destination: "/freelance-web-vaucluse", permanent: true },
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
      "connect-src 'self' https://*.i.posthog.com https://www.google-analytics.com https://*.google-analytics.com https://*.supabase.co https://analytics.ahrefs.com https://sibautomation.com https://api.brevo.com https://*.stripe.com",
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
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
      { key: "X-DNS-Prefetch-Control", value: "on" },
      // CSP en observation (ne bloque pas). À passer en "Content-Security-Policy" plus tard.
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
    // MIGRATION EN COURS : fusion du Hub Client (vivesmedia-hub) dans cette appli.
    // Le rewrite est en `beforeFiles` → l'ancien Hub externe garde TOUJOURS la main
    // sur /hub/* pendant qu'on construit les routes natives dormantes à côté.
    // Bascule finale : retirer ces deux entrées → le natif prend le relais (zéro downtime).
    return {
      beforeFiles: [
        {
          source: "/hub",
          destination: "https://vivesmedia-hub.vercel.app/hub",
        },
        {
          source: "/hub/:path*",
          destination: "https://vivesmedia-hub.vercel.app/hub/:path*",
        },
      ],
    };
  },
};

export default nextConfig;
