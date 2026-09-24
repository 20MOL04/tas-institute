/**
 * Adresse publique du site, pour les liens absolus (Open Graph, sitemap, JSON-LD).
 * Réglez NEXT_PUBLIC_SITE_URL sur Vercel quand le domaine définitif est branché ;
 * sinon on prend le domaine de production Vercel, puis localhost en dev.
 */
function resolveSiteUrl() {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/$/, "");
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL;
  if (vercel) return `https://${vercel}`;
  return "http://localhost:3000";
}

export const SITE_URL = resolveSiteUrl();
