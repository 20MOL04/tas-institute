import { ARTICLES_BY_DATE, articleToHtml } from "../../lib/articles";
import { SITE_NAME } from "../../lib/seo";
import { SITE_URL } from "../../lib/site";

export const dynamic = "force-static";

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// Flux RSS des guides : agrégateurs, Feedly, et outils qui republient automatiquement
// les nouveaux articles sur Facebook ou Telegram.
export function GET() {
  const items = ARTICLES_BY_DATE.map((a) => {
    const url = `${SITE_URL}/resources/${a.slug}`;
    return `    <item>
      <title>${esc(a.fr.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${new Date(a.publishedAt).toUTCString()}</pubDate>
      <category>${esc(a.fr.tag)}</category>
      <description>${esc(a.fr.excerpt)}</description>
      <content:encoded><![CDATA[${articleToHtml(a.fr).replace(/]]>/g, "]]]]><![CDATA[>")}]]></content:encoded>
      <enclosure url="${SITE_URL}/images/og/article-${a.slug}.jpg" type="image/jpeg" length="0" />
    </item>`;
  }).join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>${esc(`Ressources ${SITE_NAME}`)}</title>
    <link>${SITE_URL}/resources</link>
    <atom:link href="${SITE_URL}/resources/feed.xml" rel="self" type="application/rss+xml" />
    <description>Guides gratuits pour les étudiants francophones qui apprennent l'anglais au Ghana.</description>
    <language>fr</language>
    <lastBuildDate>${new Date(ARTICLES_BY_DATE[0].publishedAt).toUTCString()}</lastBuildDate>
${items}
  </channel>
</rss>
`;
  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
