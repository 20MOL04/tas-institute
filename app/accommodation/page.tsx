import JsonLd from "../components/JsonLd";
import { breadcrumbJsonLd, pageMetadata } from "../lib/seo";
import AccommodationContent from "./accommodation-content";

export const metadata = pageMetadata({
  title: "Logement étudiant à Accra, près de l'école",
  description:
    "Chambres meublées, climatisées ou standard, près du campus TAS à Accra. Tarifs mensuels, équipements et réservation sur WhatsApp pour les étudiants étrangers.",
  path: "/accommodation",
  og: "accommodation",
});

export default function AccommodationPage() {
  return (
    <>
      <JsonLd data={breadcrumbJsonLd([{ name: "Accueil", path: "" }, { name: "Logement", path: "/accommodation" }])} />
      <AccommodationContent />
    </>
  );
}
