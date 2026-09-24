import type { Metadata } from "next";
import { notFound } from "next/navigation";
import JsonLd from "../../components/JsonLd";
import { dictionaries } from "../../i18n";
import { ORGANIZATION_REF, breadcrumbJsonLd, faqJsonLd, pageMetadata } from "../../lib/seo";
import { SITE_URL } from "../../lib/site";
import GeneralEnglishContent from "./general-english-content";

// Reusable Program Detail template. Only "general-english" is fully
// populated for the deadline (brief: "un seul programme rempli en
// exemple"); any other slug renders the real Next.js not-found boundary
// (app/programs/[slug]/not-found.tsx) instead of crashing.
const POPULATED_SLUGS = ["general-english"] as const;

const TITLE = "Cours d'anglais général (General English), débutant à avancé";
const DESCRIPTION =
  "Cours d'anglais général à Accra : compréhension orale, expression orale, lecture et écriture, du niveau débutant à avancé. Programme, prérequis, inclus et FAQ.";

export function generateStaticParams() {
  return POPULATED_SLUGS.map((slug) => ({ slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  if (params.slug === "general-english") {
    return pageMetadata({ title: TITLE, description: DESCRIPTION, path: "/programs/general-english", og: "programs" });
  }
  return { title: "Programme" };
}

export default function ProgramDetailPage({ params }: { params: { slug: string } }) {
  if (params.slug !== "general-english") {
    notFound();
  }

  const p = dictionaries.fr.programDetail.generalEnglish;
  const course = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: TITLE,
    description: DESCRIPTION,
    url: `${SITE_URL}/programs/general-english`,
    inLanguage: "en",
    availableLanguage: ["en", "fr"],
    provider: ORGANIZATION_REF,
    hasCourseInstance: {
      "@type": "CourseInstance",
      courseMode: "onsite",
      location: { "@type": "Place", name: "TAS English Institute", address: "Alajo Polo Junction, Kotobabi, Accra, Ghana" },
    },
  };

  return (
    <>
      <JsonLd data={course} />
      <JsonLd data={faqJsonLd(p.faq)} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Accueil", path: "" },
          { name: "Programmes", path: "/programs" },
          { name: "General English", path: "/programs/general-english" },
        ])}
      />
      <GeneralEnglishContent />
    </>
  );
}
