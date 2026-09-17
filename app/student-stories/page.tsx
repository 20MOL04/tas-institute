import type { Metadata } from "next";
import StudentStoriesContent from "./student-stories-content";

export const metadata: Metadata = {
  title: "Student Stories",
  description: "Student stories from TAS English Institute in Accra, Ghana.",
};

export default function StudentStoriesPage() {
  return <StudentStoriesContent />;
}
