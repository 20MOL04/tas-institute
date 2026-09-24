import JsonLd from "../components/JsonLd";
import { breadcrumbJsonLd, pageMetadata } from "../lib/seo";
import TeachersContent from "./teachers-content";

export const metadata = pageMetadata({
  title: "Nos enseignants d'anglais et d'informatique",
  description:
    "Rencontrez l'équipe pédagogique de TAS English Institute à Accra : des enseignants expérimentés qui accompagnent les étudiants francophones du niveau débutant à avancé.",
  path: "/teachers",
  og: "teachers",
});

export default function TeachersPage() {
  return (
    <>
      <JsonLd data={breadcrumbJsonLd([{ name: "Accueil", path: "" }, { name: "Enseignants", path: "/teachers" }])} />
      <TeachersContent />
    </>
  );
}
