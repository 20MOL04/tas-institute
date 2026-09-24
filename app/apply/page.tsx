import JsonLd from "../components/JsonLd";
import { breadcrumbJsonLd, pageMetadata } from "../lib/seo";
import ApplyContent from "./apply-content";

export const metadata = pageMetadata({
  title: "Candidater : inscription en ligne à TAS",
  description:
    "Inscrivez-vous en quelques minutes aux cours d'anglais ou d'informatique de TAS English Institute à Accra. Formulaire simple, réponse rapide sur WhatsApp.",
  path: "/apply",
  og: "apply",
});

export default function ApplyPage() {
  return (
    <>
      <JsonLd data={breadcrumbJsonLd([{ name: "Accueil", path: "" }, { name: "Candidater", path: "/apply" }])} />
      <ApplyContent />
    </>
  );
}
