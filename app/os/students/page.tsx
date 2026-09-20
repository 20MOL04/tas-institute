"use client";

import {
  STUDENTS_CHANGED,
  TEACHERS,
  fmtMoney,
  liveStudents,
  scopedStudents,
  type Kpi,
} from "../_data";
import { DemoBanner, KpiCard, PageHead } from "../_components/ui";
import StudentsTable from "./StudentsTable";
import { PanelButton } from "../_components/EnrollPanels";
import { useOs } from "../_components/OsProvider";
import { useStoreTick } from "../_components/useStoreTick";
import { downloadCsv, printTable } from "../_lib/exportFile";

export default function StudentsPage() {
  const { user } = useOs();
  useStoreTick(STUDENTS_CHANGED);
  const teacherId = user.role === "teacher" ? TEACHERS.find((t) => t.campusId === user.campusId)?.id : undefined;
  const rows = scopedStudents(user.role, {
    schoolId: user.schoolId,
    campusId: user.campusId,
    teacherId,
  });
  const unpaid = rows.filter((s) => s.paymentStatus === "unpaid");
  const applicants = rows.filter((s) => s.status === "applicant");
  const dropped = rows.filter((s) => s.status === "dropped");
  const active = rows.filter((s) => s.status === "active");

  const kpis: Kpi[] = [
    {
      id: "active",
      label: "Actifs",
      value: String(active.length),
      raw: active.length,
      delta: null,
      hint: `sur ${rows.length} dossiers`,
    },
    {
      id: "applicants",
      label: "Candidats",
      value: String(applicants.length),
      raw: applicants.length,
      delta: null,
      hint: "Dossier ouvert, pas encore inscrit",
    },
    {
      id: "dropped",
      label: "Abandons",
      value: String(dropped.length),
      raw: dropped.length,
      delta: null,
      hint: "Sortis sans terminer le programme",
    },
    {
      id: "unpaid",
      label: "Impayés",
      value: String(unpaid.length),
      raw: unpaid.length,
      delta: null,
      hint: `${fmtMoney(unpaid.reduce((sum, s) => sum + s.balance, 0))} restants`,
    },
  ];

  const exportRows = liveStudents().map((s) => [s.matricule, s.name, s.status, s.paymentStatus, s.phone]);

  return (
    <>
      <DemoBanner />
      <PageHead title="Étudiants">
        <button
          type="button"
          className="os-btn os-btn-sm"
          onClick={() => downloadCsv("etudiants", ["Matricule", "Nom", "Statut", "Paiement", "Téléphone"], exportRows)}
        >
          Excel
        </button>
        <button
          type="button"
          className="os-btn os-btn-sm"
          onClick={() => printTable("Étudiants", ["Matricule", "Nom", "Statut", "Paiement", "Téléphone"], exportRows)}
        >
          Imprimer
        </button>
        <PanelButton panel="student">Inscrire un élève</PanelButton>
      </PageHead>
      <div className="os-kpi-grid">
        {kpis.map((kpi) => (
          <KpiCard key={kpi.id} kpi={kpi} />
        ))}
      </div>
      <StudentsTable />
    </>
  );
}
