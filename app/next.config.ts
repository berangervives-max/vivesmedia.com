import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    // Ancienne URL "agence" → nouvelle URL "freelance" (positionnement réel), 301 permanent.
    return [
      { source: "/agence-web-vaucluse", destination: "/freelance-web-vaucluse", permanent: true },
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
