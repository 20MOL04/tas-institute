import type { Metadata } from "next";
import ResourcesContent from "./resources-content";

export const metadata: Metadata = {
  title: "Resources",
  description: "Guides and tips for English learners at TAS English Institute.",
};

export default function ResourcesPage() {
  return <ResourcesContent />;
}
