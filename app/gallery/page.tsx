import JsonLd from "../components/JsonLd";
import { breadcrumbJsonLd, pageMetadata } from "../lib/seo";
import GalleryContent from "./gallery-content";

export const metadata = pageMetadata({
  title: "Galerie : la vie étudiante à TAS en images",
  description:
    "Salles de classe, campus, sorties à Cape Coast et Kakum : découvrez en photos la vie des étudiants de TAS English Institute à Accra, au Ghana.",
  path: "/gallery",
  og: "gallery",
});

export default function GalleryPage() {
  return (
    <>
      <JsonLd data={breadcrumbJsonLd([{ name: "Accueil", path: "" }, { name: "Galerie", path: "/gallery" }])} />
      <GalleryContent />
    </>
  );
}
