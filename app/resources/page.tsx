import JsonLd from "../components/JsonLd";
import { breadcrumbJsonLd, pageMetadata } from "../lib/seo";
import ResourcesContent from "./resources-content";

export const metadata = pageMetadata({
  title: "Ressources : guides pour apprendre l'anglais",
  description:
    "Conseils gratuits pour les francophones : progresser en anglais, préparer l'IELTS ou le TOEFL, éviter les erreurs courantes et réussir son séjour à Accra, au Ghana.",
  path: "/resources",
  og: "resources",
});

export default function ResourcesPage() {
  return (
    <>
      <JsonLd data={breadcrumbJsonLd([{ name: "Accueil", path: "" }, { name: "Ressources", path: "/resources" }])} />
      <ResourcesContent />
    </>
  );
}
