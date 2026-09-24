import JsonLd from "../components/JsonLd";
import { breadcrumbJsonLd, pageMetadata } from "../lib/seo";
import ProgramsContent from "./programs-content";

export const metadata = pageMetadata({
  title: "Cours d'anglais intensifs, longue durée et informatique",
  description:
    "Anglais intensif (8 h par jour), anglais longue durée, préparation IELTS, TOEFL et TOEIC, formations en informatique : tous les programmes et tarifs de TAS à Accra.",
  path: "/programs",
  og: "programs",
});

export default function ProgramsPage() {
  return (
    <>
      <JsonLd data={breadcrumbJsonLd([{ name: "Accueil", path: "" }, { name: "Programmes", path: "/programs" }])} />
      <ProgramsContent />
    </>
  );
}
