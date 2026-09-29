import type { Metadata } from "next";
import LiveStudentProfile from "./LiveStudentProfile";

export const metadata: Metadata = { title: "Étudiant" };

/**
 * The record is read in the browser (live data: payments and changes made after load),
 * so the page is rendered on demand instead of being generated for every student.
 */
export default function StudentProfilePage({ params }: { params: { id: string } }) {
  return <LiveStudentProfile id={params.id} />;
}
