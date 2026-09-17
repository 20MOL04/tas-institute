import type { Metadata } from "next";
import TeachersContent from "./teachers-content";

export const metadata: Metadata = {
  title: "Teachers",
  description: "Meet the teaching team at TAS English Institute in Accra, Ghana.",
};

export default function TeachersPage() {
  return <TeachersContent />;
}
