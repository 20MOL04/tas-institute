import type { Metadata } from "next";
import AboutContent from "./about-content";

export const metadata: Metadata = {
  title: "About",
  description:
    "Learn about TAS English Institute's mission, values and teaching philosophy in Accra, Ghana.",
};

export default function AboutPage() {
  return <AboutContent />;
}
