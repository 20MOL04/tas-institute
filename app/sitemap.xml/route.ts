import { ARTICLES, ARTICLES_BY_DATE } from "../lib/articles";
import { SITE_URL } from "../lib/site";

// Écrit à la main : le sitemap intégré de Next 14 ignore les images,
// et on veut que Google Images indexe les photos des articles.
export const dynamic = "force-static";

type Entry = { path: string; priority: number; freq: string; image: string; imageTitle: string; lastmod?: string };

const PAGES: Omit<Entry, "lastmod">[] = [
  { path: "", priority: 1, freq: "weekly", image: "/images/og/home.jpg", imageTitle: "TAS English Institute, Accra" },
  { path: "/programs", priority: 0.9, freq: "monthly", image: "/images/og/programs.jpg", imageTitle: "Programmes d'anglais et d'informatique" },
  { path: "/programs/intensive-english", priority: 0.8, freq: "monthly", image: "/images/programs/english-intensive.jpg", imageTitle: "Anglais intensif à Accra" },
  { path: "/programs/long-english", priority: 0.8, freq: "monthly", image: "/images/programs/english-long.jpg", imageTitle: "Anglais longue durée à Accra" },
  { path: "/programs/computer-course", priority: 0.8, freq: "monthly", image: "/images/programs/computer.jpg", imageTitle: "Formations en informatique à Accra" },
  { path: "/apply", priority: 0.9, freq: "monthly", image: "/images/og/apply.jpg", imageTitle: "Candidater à TAS" },
  { path: "/accommodation", priority: 0.8, freq: "monthly", image: "/images/og/accommodation.jpg", imageTitle: "Logement étudiant à Accra" },
  { path: "/resources", priority: 0.8, freq: "weekly", image: "/images/og/resources.jpg", imageTitle: "Guides pour apprendre l'anglais" },
  { path: "/about", priority: 0.7, freq: "monthly", image: "/images/og/about.jpg", imageTitle: "À propos de TAS English Institute" },
  { path: "/university-guidance", priority: 0.7, freq: "monthly", image: "/images/og/university-guidance.jpg", imageTitle: "Orientation universitaire" },
  { path: "/contact", priority: 0.7, freq: "yearly", image: "/images/og/contact.jpg", imageTitle: "Contact TAS English Institute" },
  { path: "/teachers", priority: 0.6, freq: "monthly", image: "/images/og/teachers.jpg", imageTitle: "Enseignants de TAS" },
  { path: "/student-stories", priority: 0.6, freq: "monthly", image: "/images/og/student-stories.jpg", imageTitle: "Témoignages d'étudiants" },
  { path: "/gallery", priority: 0.5, freq: "monthly", image: "/images/og/gallery.jpg", imageTitle: "Galerie photos TAS" },
];

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");

export function GET() {
  const latest = ARTICLES_BY_DATE[0].publishedAt;
  const entries: Entry[] = [
    ...PAGES.map((p) => ({ ...p, lastmod: p.path === "" || p.path === "/resources" ? latest : undefined })),
    ...ARTICLES.map((a) => ({
      path: `/resources/${a.slug}`,
      priority: 0.7,
      freq: "monthly",
      image: a.image,
      imageTitle: a.fr.imageAlt,
      lastmod: a.updatedAt ?? a.publishedAt,
    })),
  ];

  const urls = entries
    .map(
      (e) => `  <url>
    <loc>${esc(`${SITE_URL}${e.path}`)}</loc>${e.lastmod ? `\n    <lastmod>${e.lastmod}</lastmod>` : ""}
    <changefreq>${e.freq}</changefreq>
    <priority>${e.priority}</priority>
    <image:image>
      <image:loc>${esc(`${SITE_URL}${e.image}`)}</image:loc>
      <image:title>${esc(e.imageTitle)}</image:title>
    </image:image>
  </url>`
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls}
</urlset>
`;
  return new Response(xml, { headers: { "Content-Type": "application/xml; charset=utf-8" } });
}
