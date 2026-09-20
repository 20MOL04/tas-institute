"use client";

import Link from "next/link";
import { DOCUMENTS, GROUPS, PROGRAMS, STUDENTS, fmtMoney, fmtPct, type Kpi } from "../_data";
import { KpiCard, OsCard, PageHead } from "../_components/ui";
import { useOs } from "../_components/OsProvider";
import { useOsT } from "../_components/useOsT";

export default function StudentHome() {
  const { t } = useOsT();
  const { session } = useOs();
  const student = STUDENTS.find((s) => s.id === session?.personId) ?? STUDENTS.find((s) => s.schoolId === "tas") ?? STUDENTS[0];
  const group = GROUPS.find((g) => g.id === student.groupId);
  const program = PROGRAMS.find((p) => p.id === student.programId);
  const docs = DOCUMENTS.filter((d) => d.matricule === student.matricule);

  const kpis: Kpi[] = [
    {
      id: "att",
      label: t.student.attendance,
      value: fmtPct(student.attendanceRate, 0),
      raw: student.attendanceRate,
      delta: null,
      hint: "",
    },
    {
      id: "gr",
      label: t.nav.grades,
      value: student.averageGrade.toFixed(1),
      raw: student.averageGrade,
      delta: null,
      hint: "",
    },
    {
      id: "bal",
      label: t.student.balance,
      value: fmtMoney(student.balance),
      raw: student.balance,
      delta: null,
      hint: "",
    },
    {
      id: "docs",
      label: t.student.docs,
      value: String(docs.length),
      raw: docs.length,
      delta: null,
      hint: "",
    },
  ];

  return (
    <>
      <PageHead title={student.name} />
      <div className="os-kpi-grid">
        {kpis.map((k) => (
          <KpiCard key={k.id} kpi={k} />
        ))}
      </div>
      <OsCard title={t.student.title}>
        <div className="os-link-row">
          <strong>{student.matricule}</strong>
          <span className="os-muted">{program?.name}</span>
        </div>
        <div className="os-link-row">
          <strong>{t.student.next}</strong>
          <span className="os-muted">
            {group?.name}, {group?.room}
          </span>
        </div>
        <Link href="/os/student/grades" className="os-link-row">
          <strong>{t.nav.grades}</strong>
        </Link>
        <Link href="/os/student/documents" className="os-link-row">
          <strong>{t.student.docs}</strong>
          {docs.length ? <span className="os-nav-badge">{docs.length}</span> : null}
        </Link>
      </OsCard>
    </>
  );
}
