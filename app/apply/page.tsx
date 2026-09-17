import type { Metadata } from "next";
import ApplyContent from "./apply-content";

export const metadata: Metadata = {
  title: "Apply",
  description: "Apply to TAS English Institute in Accra, Ghana — a simple, step-by-step application form.",
};

export default function ApplyPage() {
  return <ApplyContent />;
}
