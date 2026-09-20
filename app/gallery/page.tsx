import type { Metadata } from "next";
import GalleryContent from "./gallery-content";

export const metadata: Metadata = {
  title: "Gallery",
  description: "Campus life and student moments at TAS English Institute in Accra.",
};

export default function GalleryPage() {
  return <GalleryContent />;
}
