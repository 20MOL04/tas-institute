"use client";

import {
  APPLICATIONS_CHANGED,
  applicationsByStatus,
  fmtDate,
  fmtInt,
  liveApplications,
  type ApplicationStatus,
  type Kpi,
} from "../_data";
import {
  APPLICATION_STATUS_FR,
  Badge,
  KpiCard,
  OsCard,
  PageHead,
  PersonCell,
  VoirLink,
  statusTone,
} from "../_components/ui";
import { useStoreTick } from "../_components/useStoreTick";
import { downloadCsv, printTable } from "../_lib/exportFile";
import { durationLabelFr, isCourseDuration } from "../../lib/course-duration";

const STATUS_ORDER: ApplicationStatus[] = ["new", "reviewing", "documents", "approved"];

const PRIORITY_ORDER: ApplicationStatus[] = ["documents", "new", "reviewing", "approved", "enrolled", "rejected"];

export default function ApplicationsPage() {
  useStoreTick(APPLICATIONS_CHANGED);
  const kpis: Kpi[] = STATUS_ORDER.map((status) => {
    const count = applicationsByStatus(status).length;
    return {
      id: status,
      label: APPLICATION_STATUS_FR[status],
      value: fmtInt(count),
      raw: count,
      delta: null,
      hint: "",
    };
  });
  const rows = [...liveApplications()].sort((a, b) => {
    const byStatus = PRIORITY_ORDER.indexOf(a.status) - PRIORITY_ORDER.indexOf(b.status);
    if (byStatus !== 0) return byStatus;
    return b.submittedAt.localeCompare(a.submittedAt);
  });
  const exportRows = rows.map((row) => [
    row.ref,
    row.name,
    row.durationMonths && isCourseDuration(row.durationMonths) ? durationLabelFr(row.durationMonths) : "Non indiquée",
    APPLICATION_STATUS_FR[row.status],
    row.submittedAt,
  ]);

  return (
    <>
      <PageHead title="Candidatures">
        <button type="button" className="os-btn os-btn-sm" onClick={() => downloadCsv("candidatures", ["Référence", "Nom", "Durée", "Statut", "Date"], exportRows)}>
          Excel
        </button>
        <button type="button" className="os-btn os-btn-sm" onClick={() => printTable("Candidatures", ["Référence", "Nom", "Durée", "Statut", "Date"], exportRows)}>
          Imprimer
        </button>
      </PageHead>

      <div className="os-kpi-grid">
        {kpis.map((kpi) => (
          <KpiCard key={kpi.id} kpi={kpi} />
        ))}
      </div>

      <OsCard title="Dossiers">
        <div className="os-table-wrap">
          <table className="os-table">
            <thead>
              <tr>
                <th>Candidat</th>
                <th>Durée</th>
                <th>Statut</th>
                <th>Date</th>
                <th className="os-th-action">Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td>
                    <PersonCell initials={row.initials} name={row.name} meta={row.ref} />
                  </td>
                  <td>{row.durationMonths && isCourseDuration(row.durationMonths) ? durationLabelFr(row.durationMonths) : "Non indiquée"}</td>
                  <td>
                    <Badge tone={statusTone(row.status)}>{APPLICATION_STATUS_FR[row.status]}</Badge>
                  </td>
                  <td>{fmtDate(row.submittedAt)}</td>
                  <td className="os-td-action">
                    <VoirLink href={`/os/applications/${row.id}`} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </OsCard>
    </>
  );
}
