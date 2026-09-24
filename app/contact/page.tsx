import JsonLd from "../components/JsonLd";
import { breadcrumbJsonLd, pageMetadata } from "../lib/seo";
import ContactContent from "./contact-content";

export const metadata = pageMetadata({
  title: "Contact et adresse de l'école à Accra",
  description:
    "Contactez TAS English Institute : WhatsApp, téléphone, e-mail et plan d'accès à Alajo Polo Junction, Kotobabi, Accra. L'équipe répond en français et en anglais.",
  path: "/contact",
  og: "contact",
});

export default function ContactPage() {
  return (
    <>
      <JsonLd data={breadcrumbJsonLd([{ name: "Accueil", path: "" }, { name: "Contact", path: "/contact" }])} />
      <ContactContent />
    </>
  );
}
