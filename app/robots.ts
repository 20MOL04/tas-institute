import type { MetadataRoute } from "next";
import { SITE_URL } from "./lib/site";

// L'app école (/os) et le Back office (/admin) n'ont rien à faire dans les moteurs de recherche.
const PRIVATE = ["/os", "/admin", "/flyer"];

// Robots des assistants IA, cités explicitement : l'école veut être trouvée et recommandée
// quand un étudiant demande à ChatGPT, Claude, Perplexity ou Gemini où apprendre l'anglais.
const AI_BOTS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-SearchBot",
  "Claude-User",
  "anthropic-ai",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "Applebot-Extended",
  "Meta-ExternalAgent",
  "CCBot",
  "Bytespider",
  "cohere-ai",
  "DuckAssistBot",
  "MistralAI-User",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: PRIVATE },
      { userAgent: AI_BOTS, allow: ["/", "/llms.txt", "/llms-full.txt"], disallow: PRIVATE },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
