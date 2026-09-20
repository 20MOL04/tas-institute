"use client";

import { DOCUMENTS, STUDENTS, fmtDate, type Kpi } from "../../_data";
import { Badge, DOCUMENT_STATUS_FR, KpiCard, OsCard, PageHead, statusTone } from "../../_components/ui";
import { useOs } from "../../_components/OsProvider";
import { useOsT } from "../../_components/useOsT";

export default function StudentDocsPage() {
  const { t } = useOsT();
  const { session } = useOs();
  const student = STUDENTS.find((s) => s.id === session?.personId) ?? STUDENTS[0];
  const docs = DOCUMENTS.filter((d) => d.matricule === student.matricule);
  const generated = docs.filter((d) => d.status === "generated").length;
  const pending = docs.filter((d) => d.status === "pending").length;
  const missing = docs.filter((d) => d.status === "missing").length;
  const kpis: Kpi[] = [
    { id: "all", label: t.nav.documents, value: String(docs.length), raw: docs.length, delta: null, hint: "" },
    { id: "ok", label: DOCUMENT_STATUS_FR.generated, value: String(generated), raw: generated, delta: null, hint: "" },
    { id: "wait", label: DOCUMENT_STATUS_FR.pending, value: String(pending), raw: pending, delta: null, hint: "" },
    { id: "miss", label: DOCUMENT_STATUS_FR.missing, value: String(missing), raw: missing, delta: null, hint: "" },
  ];

  return (
    <>
      <PageHead title={t.nav.documents} lead={student.matricule} />
      <div className="os-kpi-grid">
        {kpis.map((kpi) => (
          <KpiCard key={kpi.id} kpi={kpi} />
        ))}
      </div>
      <OsCard title={student.name} hint={`${docs.length} document(s)`}>
        {docs.length === 0 ? (
          <p className="os-empty">Aucun document pour ce matricule.</p>
        ) : (
          <div className="os-table-wrap">
            <table className="os-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Date</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                {docs.map((d) => (
                  <tr key={d.id}>
                    <td className="os-table-strong">{d.type}</td>
                    <td>{fmtDate(d.date)}</td>
                    <td>
                      <Badge tone={statusTone(d.status)}>{DOCUMENT_STATUS_FR[d.status]}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </OsCard>
    </>
  );
}
