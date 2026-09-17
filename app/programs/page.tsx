import type { Metadata } from "next";
import ProgramsContent from "./programs-content";

export const metadata: Metadata = {
  title: "Programs",
  description:
    "English Programs and Computer & Professional Courses offered by TAS English Institute in Accra, Ghana.",
};

export default function ProgramsPage() {
  return <ProgramsContent />;
}
