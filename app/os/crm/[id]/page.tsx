import LiveLeadProfile from "./LiveLeadProfile";
import { LEADS } from "../../_data";

export function generateStaticParams() {
  return LEADS.map((l) => ({ id: l.id }));
}

export function generateMetadata({ params }: { params: { id: string } }) {
  const lead = LEADS.find((l) => l.id === params.id);
  return { title: lead ? lead.name : "Inscription en ligne" };
}

export default function LeadDetailPage({ params }: { params: { id: string } }) {
  return <LiveLeadProfile id={params.id} />;
}
