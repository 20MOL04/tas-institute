import type { Metadata } from "next";
import UniversityGuidanceContent from "./university-guidance-content";

export const metadata: Metadata = {
  title: "University Guidance",
  description: "University pathway guidance and English preparation at TAS English Institute, Accra.",
};

export default function UniversityGuidancePage() {
  return <UniversityGuidanceContent />;
}
