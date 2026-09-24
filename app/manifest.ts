import type { MetadataRoute } from "next";
import { SITE_DESCRIPTION } from "./lib/seo";
import { palette } from "./lib/theme";

// Permet d'ajouter le site à l'écran d'accueil du téléphone, avec l'icône TAS.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "TAS English Institute",
    short_name: "TAS",
    description: SITE_DESCRIPTION,
    lang: "fr",
    start_url: "/",
    display: "standalone",
    background_color: palette.white,
    theme_color: palette.blue,
    icons: [
      { src: "/brand/tas-icon-128.png", sizes: "128x128", type: "image/png" },
      { src: "/brand/tas-icon-256.png", sizes: "256x256", type: "image/png" },
      { src: "/brand/tas-icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
