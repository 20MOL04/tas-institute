import type { Metadata } from "next";
import ContactContent from "./contact-content";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact TAS English Institute in Accra, Ghana.",
};

export default function ContactPage() {
  return <ContactContent />;
}
