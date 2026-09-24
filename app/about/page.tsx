import JsonLd from "../components/JsonLd";
import { breadcrumbJsonLd, pageMetadata } from "../lib/seo";
import AboutContent from "./about-content";

export const metadata = pageMetadata({
  title: "À propos : une école d'anglais sérieuse à Accra",
  description:
    "TAS English Institute forme en anglais et en informatique les étudiants francophones d'Afrique à Accra, au Ghana : mission, valeurs, fondateur et méthode d'enseignement.",
  path: "/about",
  og: "about",
});

export default function AboutPage() {
  return (
    <>
      <JsonLd data={breadcrumbJsonLd([{ name: "Accueil", path: "" }, { name: "À propos", path: "/about" }])} />
      <AboutContent />
    </>
  );
}
