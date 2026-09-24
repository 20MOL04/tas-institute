import JsonLd from "../components/JsonLd";
import { breadcrumbJsonLd, pageMetadata } from "../lib/seo";
import StudentStoriesContent from "./student-stories-content";

export const metadata = pageMetadata({
  title: "Témoignages d'étudiants de TAS English Institute",
  description:
    "Des étudiants francophones venus apprendre l'anglais à Accra racontent leur parcours à TAS English Institute : arrivée, cours, vie au Ghana et résultats.",
  path: "/student-stories",
  og: "student-stories",
});

export default function StudentStoriesPage() {
  return (
    <>
      <JsonLd data={breadcrumbJsonLd([{ name: "Accueil", path: "" }, { name: "Témoignages", path: "/student-stories" }])} />
      <StudentStoriesContent />
    </>
  );
}
