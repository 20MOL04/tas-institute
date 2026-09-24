import type { Metadata } from "next";
import { notFound } from "next/navigation";
import JsonLd from "../../components/JsonLd";
import { PROGRAM_DETAILS, getProgramDetail } from "../../lib/programDetails";
import { ORGANIZATION_REF, breadcrumbJsonLd, faqJsonLd, pageMetadata } from "../../lib/seo";
import { SITE_URL } from "../../lib/site";
import ProgramDetailContent from "./program-detail-content";

export function generateStaticParams() {
  return PROGRAM_DETAILS.map((p) => ({ slug: p.slug }));
}

export const dynamicParams = false;

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const p = getProgramDetail(params.slug);
  if (!p) return { title: "Programme" };
  return pageMetadata({
    title: `${p.fr.title} à Accra`,
    description: p.fr.metaDescription,
    path: `/programs/${p.slug}`,
    og: "programs",
  });
}

export default function ProgramDetailPage({ params }: { params: { slug: string } }) {
  const p = getProgramDetail(params.slug);
  if (!p) notFound();
  const url = `${SITE_URL}/programs/${p.slug}`;

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Course",
          name: p.fr.title,
          description: p.fr.metaDescription,
          url,
          inLanguage: "en",
          availableLanguage: ["en", "fr"],
          provider: ORGANIZATION_REF,
          hasCourseInstance: {
            "@type": "CourseInstance",
            courseMode: "onsite",
            location: { "@type": "Place", name: "TAS English Institute", address: "Alajo Polo Junction, Kotobabi, Accra, Ghana" },
          },
        }}
      />
      <JsonLd data={faqJsonLd(p.fr.faq)} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Accueil", path: "" },
          { name: "Programmes", path: "/programs" },
          { name: p.fr.title, path: `/programs/${p.slug}` },
        ])}
      />
      <ProgramDetailContent slug={p.slug} />
    </>
  );
}
