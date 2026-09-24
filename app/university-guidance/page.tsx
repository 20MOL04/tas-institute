import JsonLd from "../components/JsonLd";
import { breadcrumbJsonLd, pageMetadata } from "../lib/seo";
import UniversityGuidanceContent from "./university-guidance-content";

export const metadata = pageMetadata({
  title: "Orientation universitaire : de TAS vers l'université",
  description:
    "Préparez vos études supérieures en anglais : niveau requis, tests IELTS et TOEFL, dossier de candidature. TAS accompagne les étudiants francophones vers l'université.",
  path: "/university-guidance",
  og: "university-guidance",
});

export default function UniversityGuidancePage() {
  return (
    <>
      <JsonLd data={breadcrumbJsonLd([{ name: "Accueil", path: "" }, { name: "Orientation universitaire", path: "/university-guidance" }])} />
      <UniversityGuidanceContent />
    </>
  );
}
