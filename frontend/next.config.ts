import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Metadata (title/description) bloqueante para todos los clientes: queda en el <head>
  // desde el primer byte y los auditores SEO (Lighthouse) la ven siempre.
  output: "standalone",
  htmlLimitedBots: /.*/,
  images: {
    // Hosts de imágenes que usa la API: el ProductSeeder usa picsum.photos y el ProductFactory
    // (faker) genera URLs de via.placeholder.com. Agrega más si hace falta.
    remotePatterns: [
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "fastly.picsum.photos" },
      { protocol: "https", hostname: "via.placeholder.com" },
    ],
  },
};

export default nextConfig;
