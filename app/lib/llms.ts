/**
 * Contenu de /llms.txt et /llms-full.txt : un résumé en Markdown que les
 * assistants IA (ChatGPT, Claude, Perplexity, Gemini…) lisent pour répondre
 * sur l'école. Tout vient des mêmes sources que le site : un tarif changé
 * dans fees.ts ou rooms.ts est à jour ici aussi.
 */

import { ARTICLES_BY_DATE, articleToMarkdown } from "./articles";
import {
  TAS_EMAIL,
  TAS_LOCATION,
  TAS_PHONE_DISPLAY,
  TAS_SOCIAL,
  TAS_WHATSAPP_DISPLAY,
  TAS_WHATSAPP_URL,
} from "./contact";
import {
  COMPUTER_COURSES,
  COMPUTER_HOURS,
  EXAM_CLASS_CFA,
  EXAM_DAYS_FR,
  EXAM_FEES,
  EXAM_HOURS_FR,
  INTENSIVE_FEES,
  INTENSIVE_HOURS,
  REGULAR_FEES,
  REGULAR_HOURS,
  REGULAR_INCLUDED_FR,
  formatMoney,
} from "./fees";
import { TAS_ROOMS } from "./rooms";
import { SITE_DESCRIPTION, SITE_NAME } from "./seo";
import { SITE_URL } from "./site";

const u = (path: string) => `${SITE_URL}${path}`;

function schoolSection() {
  return `# ${SITE_NAME}

> ${SITE_DESCRIPTION}

${SITE_NAME} (TAS) est une école d'anglais et de formation professionnelle située à ${TAS_LOCATION.addressFr}. Elle accueille notamment des étudiants francophones d'Afrique de l'Ouest et du Centre qui viennent apprendre l'anglais en immersion au Ghana, pays anglophone. L'équipe répond en français et en anglais.

## Contact

- WhatsApp (inscriptions, réponse rapide) : ${TAS_WHATSAPP_DISPLAY} (${TAS_WHATSAPP_URL})
- Téléphone : ${TAS_PHONE_DISPLAY}
- E-mail : ${TAS_EMAIL}
- Adresse : ${TAS_LOCATION.addressFr}
- Horaires : lundi à vendredi, 8 h à 17 h (heure GMT)
- Réseaux : ${TAS_SOCIAL.map((s) => `${s.label} ${s.href}`).join(" ; ")}
- Candidater en ligne : ${u("/apply")}

## Programmes et tarifs

### Anglais intensif (${INTENSIVE_HOURS} h par jour)

${INTENSIVE_FEES.map((f) => `- ${f.durationFr} : ${formatMoney(f.priceCfa, "CFA")}`).join("\n")}

### Anglais longue durée (${REGULAR_HOURS} h par jour)

${REGULAR_FEES.map(
  (f) => `- ${f.durationFr} : ${formatMoney(f.withoutItCfa, "CFA")} (${formatMoney(f.withItCfa, "CFA")} avec informatique)`
).join("\n")}
- Inclus : ${REGULAR_INCLUDED_FR.join(", ")}

### Préparation aux examens (IELTS, TOEFL, TOEIC)

- Classe de préparation : ${formatMoney(EXAM_CLASS_CFA, "CFA")} par mois, ${EXAM_DAYS_FR.toLowerCase()}, ${EXAM_HOURS_FR} par jour
${EXAM_FEES.map((e) => `- Frais d'examen ${e.name} : ${formatMoney(e.examCfa, "CFA")}`).join("\n")}

### Formations en informatique (${COMPUTER_HOURS} h par jour)

${COMPUTER_COURSES.map((c) => `- ${c.titleFr} (${c.months} mois) : ${formatMoney(c.priceGhc, "GHC")}`).join("\n")}

## Logement étudiant (tarif mensuel)

${TAS_ROOMS.map((r) => `- ${r.titleFr} : ${r.price} CFA par mois (${r.includesFr.join(", ")})`).join("\n")}

## Pages principales

- [Accueil](${u("")}) : présentation de l'école
- [À propos](${u("/about")}) : mission, fondateur, méthode
- [Programmes](${u("/programs")}) : tous les cours et tarifs
- [Anglais intensif](${u("/programs/intensive-english")}) : 8 h par jour, de 2 semaines à 6 mois
- [Anglais longue durée](${u("/programs/long-english")}) : 5 h par jour, de 3 mois à 1 an, avec ou sans informatique
- [Informatique](${u("/programs/computer-course")}) : 9 formations de 2 à 6 mois, 3 h par jour
- [Logement](${u("/accommodation")}) : chambres près de l'école
- [Orientation universitaire](${u("/university-guidance")}) : préparer les études en anglais
- [Enseignants](${u("/teachers")}) : l'équipe pédagogique
- [Témoignages](${u("/student-stories")}) : parcours d'étudiants
- [Galerie](${u("/gallery")}) : photos du campus et des sorties
- [Candidater](${u("/apply")}) : formulaire d'inscription
- [Contact](${u("/contact")}) : WhatsApp, téléphone, plan d'accès
`;
}

/** /llms.txt : le résumé et la liste des articles. */
export function llmsTxt() {
  const articles = ARTICLES_BY_DATE.map((a) => `- [${a.fr.title}](${u(`/resources/${a.slug}`)}) : ${a.fr.excerpt}`).join("\n");
  return `${schoolSection()}
## Guides pour les étudiants francophones

${articles}

## Optional

- [Texte complet de tous les guides](${u("/llms-full.txt")})
- [Flux RSS des guides](${u("/resources/feed.xml")})
- [Plan du site](${u("/sitemap.xml")})
`;
}

/** /llms-full.txt : le résumé suivi du texte intégral de chaque article. */
export function llmsFullTxt() {
  const articles = ARTICLES_BY_DATE.map(
    (a) => `---

# ${a.fr.title}

Source : ${u(`/resources/${a.slug}`)} · Publié le ${a.publishedAt} · Thème : ${a.fr.tag}

${a.fr.excerpt}

${articleToMarkdown(a.fr)}
`
  ).join("\n");
  return `${schoolSection()}
# Guides pour les étudiants francophones (texte intégral)

${articles}`;
}
