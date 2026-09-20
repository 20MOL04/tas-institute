"use client";

import { GROUPS, PROGRAMS, STUDENTS, STUDENTS_CHANGED, liveStudents, fmtGrade, fmtPct, nextLevelFor, passedThisMonth, type Kpi } from "../../_data";
import { KpiCard, OsCard, PageHead } from "../../_components/ui";
import { useOs } from "../../_components/OsProvider";
import { useOsT } from "../../_components/useOsT";
import { useStoreTick } from "../../_components/useStoreTick";

export default function StudentGradesPage() {
  const { t } = useOsT();
  const { session } = useOs();
  useStoreTick(STUDENTS_CHANGED);
  const student =
    liveStudents().find((s) => s.id === session?.personId) ??
    STUDENTS.find((s) => s.id === session?.personId) ??
    STUDENTS[0];
  const group = GROUPS.find((g) => g.id === student.groupId);
  const program = PROGRAMS.find((p) => p.id === student.programId);
  const nextLevel = nextLevelFor(student.programId, student.level, student.averageGrade);
  const stays = student.status === "active" && !passedThisMonth(student.averageGrade);
  const lastLevel =
    student.status === "active" && passedThisMonth(student.averageGrade) && nextLevel === student.level;
  const nextLabel =
    student.status !== "active"
      ? "Hors parcours"
      : stays
        ? `Reste en ${student.level}`
        : lastLevel
          ? "Dernier niveau"
          : nextLevel;
  const kpis: Kpi[] = [
    { id: "gr", label: t.nav.grades, value: `${fmtGrade(student.averageGrade)} / 20`, raw: student.averageGrade, delta: null, hint: "" },
    { id: "att", label: t.nav.attendance, value: fmtPct(student.attendanceRate, 0), raw: student.attendanceRate, delta: null, hint: "" },
    { id: "lv", label: "Niveau", value: student.level, raw: 0, delta: null, hint: "" },
    { id: "gp", label: "Groupe", value: group?.name ?? "Sans groupe", raw: 0, delta: null, hint: "" },
  ];

  return (
    <>
      <PageHead title={t.nav.grades} lead={student.matricule} />
      <div className="os-kpi-grid">
        {kpis.map((k) => (
          <KpiCard key={k.id} kpi={k} />
        ))}
      </div>
      <OsCard title={student.name} hint={program?.name}>
        <div className="os-grid os-grid-2">
          <div>
            <div className="os-small os-muted">Programme</div>
            <div className="os-table-strong">{program?.name ?? "Non indiqué"}</div>
          </div>
          <div>
            <div className="os-small os-muted">Mois suivant</div>
            <div className="os-table-strong">{nextLabel}</div>
          </div>
          <div>
            <div className="os-small os-muted">Salle</div>
            <div className="os-table-strong">{group?.room ?? "Non indiquée"}</div>
          </div>
          <div>
            <div className="os-small os-muted">Horaires</div>
            <div className="os-table-strong">{group?.schedule ?? "Non indiqués"}</div>
          </div>
        </div>
      </OsCard>
    </>
  );
}
