import { Suspense } from "react";
import { PageHead } from "../../_components/ui";
import LeadsTable from "../LeadsTable";

export const metadata = { title: "Inscriptions en ligne" };

export default function CrmListPage() {
  return (
    <>
      <PageHead title="Inscriptions en ligne" />
      <Suspense fallback={<p className="os-muted">Chargement de la file.</p>}>
        <LeadsTable />
      </Suspense>
    </>
  );
}
