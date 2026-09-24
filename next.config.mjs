/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // AVIF puis WebP : 2 à 3 fois plus léger que le JPEG, images affichées plus vite.
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
  async redirects() {
    // L'ancienne fiche « General English » est devenue la page Anglais intensif.
    return [{ source: "/programs/general-english", destination: "/programs/intensive-english", permanent: true }];
  },
};

export default nextConfig;
