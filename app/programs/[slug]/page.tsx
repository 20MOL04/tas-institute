import type { Metadata } from "next";
import { notFound } from "next/navigation";
import GeneralEnglishContent from "./general-english-content";

// Reusable Program Detail template. Only "general-english" is fully
// populated for the deadline (brief: "un seul programme rempli en
// exemple"); any other slug renders the real Next.js not-found boundary
// (app/programs/[slug]/not-found.tsx) instead of crashing.
const POPULATED_SLUGS = ["general-english"] as const;

export function generateStaticParams() {
  return POPULATED_SLUGS.map((slug) => ({ slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  if (params.slug === "general-english") {
    return {
      title: "General English Course",
      description:
        "General English Course at TAS English Institute — a complete program covering listening, speaking, reading and writing, from beginner to advanced.",
    };
  }
  return { title: "Program" };
}

export default function ProgramDetailPage({ params }: { params: { slug: string } }) {
  if (params.slug !== "general-english") {
    notFound();
  }

  return <GeneralEnglishContent />;
}
