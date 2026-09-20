import { APPLICATIONS } from "../../_data";
import LiveApplicationProfile from "./LiveApplicationProfile";

type PageProps = { params: { id: string } };

export function generateStaticParams() {
  return APPLICATIONS.map((a) => ({ id: a.id }));
}

export function generateMetadata({ params }: PageProps) {
  const application = APPLICATIONS.find((a) => a.id === params.id);
  return { title: application ? `${application.ref}, candidature` : "Candidature" };
}

export default function ApplicationDetailPage({ params }: PageProps) {
  return <LiveApplicationProfile id={params.id} />;
}
