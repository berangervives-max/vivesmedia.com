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
    // Headers de sécurité appliqués à TOUTES les routes. On reste sur les protections
    // « sans risque » (aucune ne casse PostHog/Stripe/Supabase). Le CSP strict n'est PAS
    // activé ici car il bloquerait les scripts tiers tant qu'il n'est pas finement réglé
    // (TODO : ajouter une Content-Security-Policy en Report-Only d'abord, puis l'appliquer).
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
    // Le Hub Client (projet Vercel vivesmedia-hub, basePath /hub) est servi
    // sous la même adresse que le site et le CMS → une seule session admin.
    return [
      {
        source: "/hub",
        destination: "https://vivesmedia-hub.vercel.app/hub",
      },
      {
        source: "/hub/:path*",
        destination: "https://vivesmedia-hub.vercel.app/hub/:path*",
      },
    ];
  },
};

export default nextConfig;
