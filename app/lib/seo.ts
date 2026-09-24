/**
 * SEO du site public : métadonnées de page et données structurées (schema.org).
 * Le site s'affiche en français par défaut, donc tout ce que lisent Google,
 * les réseaux sociaux et les IA est en français, avec des mots-clés que
 * tapent les étudiants francophones (« apprendre l'anglais au Ghana », etc.).
 */

import type { Metadata } from "next";
import {
  TAS_EMAIL,
  TAS_LOCATION,
  TAS_PHONE_DISPLAY,
  TAS_SCHOOL_PHONES,
  TAS_SOCIAL,
  TAS_WHATSAPP_DISPLAY,
} from "./contact";
import { SITE_URL } from "./site";

export const SITE_NAME = "TAS English Institute";

export const SITE_DESCRIPTION =
  "École d'anglais et de formation professionnelle à Accra, au Ghana. Cours intensifs et longue durée, préparation IELTS, TOEFL et TOEIC, formations en informatique et logement étudiant, pour les étudiants francophones d'Afrique.";

export const SITE_KEYWORDS = [
  "apprendre l'anglais au Ghana",
  "école d'anglais Accra",
  "cours d'anglais intensif",
  "séjour linguistique Ghana",
  "anglais pour francophones",
  "préparation IELTS Accra",
  "préparation TOEFL",
  "TOEIC",
  "formation informatique Accra",
  "logement étudiant Accra",
  "étudier au Ghana",
  "TAS English Institute",
  "English school Accra",
  "learn English in Ghana",
];

interface PageMetaInput {
  title: string;
  description: string;
  /** Chemin de la page, ex. "/about". "" pour l'accueil. */
  path: string;
  /** Nom du fichier dans public/images/og/ (généré par scripts/og-images.ps1). */
  og: string;
  ogAlt?: string;
}

/** Métadonnées complètes d'une page : canonique, aperçu Facebook/WhatsApp, carte X. */
export function pageMetadata({ title, description, path, og, ogAlt }: PageMetaInput): Metadata {
  const url = path || "/";
  const image = { url: `/images/og/${og}.jpg`, width: 1200, height: 630, alt: ogAlt ?? title };
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      url,
      title,
      description,
      siteName: SITE_NAME,
      locale: "fr_FR",
      alternateLocale: ["en_GB"],
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image.url],
    },
  };
}

const ORG_ID = `${SITE_URL}/#organization`;

/** L'école, telle que Google Maps, le Knowledge Graph et les IA doivent la comprendre. */
export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["LanguageSchool", "EducationalOrganization", "LocalBusiness"],
        "@id": ORG_ID,
        name: SITE_NAME,
        alternateName: ["TAS", "TAS English Institut", "TAS Institute Accra"],
        url: SITE_URL,
        logo: { "@type": "ImageObject", url: `${SITE_URL}/brand/tas-icon-512.png`, width: 512, height: 512 },
        image: `${SITE_URL}/images/og/home.jpg`,
        description: SITE_DESCRIPTION,
        email: TAS_EMAIL,
        telephone: TAS_PHONE_DISPLAY.replace(/\s/g, ""),
        address: {
          "@type": "PostalAddress",
          streetAddress: "Alajo Polo Junction, Kotobabi New Town",
          addressLocality: "Accra",
          addressRegion: "Greater Accra",
          addressCountry: "GH",
        },
        geo: { "@type": "GeoCoordinates", latitude: TAS_LOCATION.lat, longitude: TAS_LOCATION.lng },
        hasMap: `https://www.google.com/maps/search/?api=1&query=${TAS_LOCATION.lat},${TAS_LOCATION.lng}`,
        openingHoursSpecification: {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
          opens: "08:00",
          closes: "17:00",
        },
        contactPoint: [
          {
            "@type": "ContactPoint",
            contactType: "admissions",
            telephone: TAS_WHATSAPP_DISPLAY.replace(/\s/g, ""),
            availableLanguage: ["French", "English"],
          },
        ],
        areaServed: ["Ghana", "Côte d'Ivoire", "Togo", "Bénin", "Burkina Faso", "Sénégal", "Mali", "Niger", "Guinée", "Cameroun", "Gabon", "Congo", "Tchad"],
        knowsLanguage: ["en", "fr"],
        sameAs: TAS_SOCIAL.map((s) => s.href),
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: SITE_NAME,
        description: SITE_DESCRIPTION,
        inLanguage: ["fr", "en"],
        publisher: { "@id": ORG_ID },
      },
    ],
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${SITE_URL}${item.path || "/"}`,
    })),
  };
}

/** Les FAQ en données structurées : Google et les IA peuvent reprendre les réponses telles quelles. */
export function faqJsonLd(items: readonly { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
}

export const ORGANIZATION_REF = { "@id": ORG_ID };
