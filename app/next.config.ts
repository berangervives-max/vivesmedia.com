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
    return [
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
