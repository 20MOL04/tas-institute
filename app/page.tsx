import type { Metadata } from "next";
import HomeContent from "./home-content";
import JsonLd from "./components/JsonLd";
import { dictionaries } from "./i18n";
import { SITE_DESCRIPTION, faqJsonLd, pageMetadata } from "./lib/seo";

const base = pageMetadata({
  title: "TAS English Institute | Apprendre l'anglais à Accra, Ghana",
  description: SITE_DESCRIPTION,
  path: "",
  og: "home",
});

// Titre complet sur l'accueil, sans le suffixe « | TAS English Institute » du gabarit.
export const metadata: Metadata = { ...base, title: { absolute: base.title as string } };

export default function HomePage() {
  return (
    <>
      <JsonLd data={faqJsonLd(dictionaries.fr.home.faq)} />
      <HomeContent />
    </>
  );
}
