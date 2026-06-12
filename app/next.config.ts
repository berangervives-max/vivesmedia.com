import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
