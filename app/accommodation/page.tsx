import type { Metadata } from "next";
import AccommodationContent from "./accommodation-content";

export const metadata: Metadata = {
  title: "Accommodation",
  description: "Student accommodation options near TAS English Institute in Accra, Ghana.",
};

export default function AccommodationPage() {
  return <AccommodationContent />;
}
