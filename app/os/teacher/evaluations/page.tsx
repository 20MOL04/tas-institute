"use client";

import { useEffect, useState } from "react";
import { GROUPS, STUDENTS_CHANGED, TEACHERS, fmtGrade, liveStudents, patchStudent, type Kpi } from "../../_data";
import { KpiCard, OsCard, PageHead } from "../../_components/ui";
import { useOs } from "../../_components/OsProvider";
import { useOsT } from "../../_components/useOsT";
import { useStoreTick } from "../../_components/useStoreTick";
import { downloadCsv, printTable } from "../../_lib/exportFile";

export default function TeacherEvalsPage() {
  const { t } = useOsT();
  const { session } = useOs();
  const tick = useStoreTick(STUDENTS_CHANGED);
  const teacher = TEACHERS.find((x) => x.id === session?.personId) ?? TEACHERS[0];
  const groups = GROUPS.filter((g) => g.teacherId === teacher.id);
  const students = liveStudents();
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  useEffect(() => {
    const next: Record<string, string> = {};
    liveStudents().forEach((s) => {
      next[s.id] = String(s.averageGrade);
    });
    setDrafts(next);
  }, [tick]);

  function save(id: string) {
    const n = Number((drafts[id] ?? "").replace(",", "."));
    if (Number.isNaN(n) || n < 0 || n > 20) return;
    patchStudent(id, { averageGrade: Math.round(n * 10) / 10 });
  }

  const exportRows = groups.flatMap((g) =>
    students
      .filter((s) => s.groupId === g.id && s.status === "active")
      .map((s) => [g.name, s.matricule, s.name, s.averageGrade]),
  );
  const mine = students.filter((s) => groups.some((g) => g.id === s.groupId) && s.status === "active");
  const avg = mine.length ? mine.reduce((sum, s) => sum + s.averageGrade, 0) / mine.length : 0;
  const kpis: Kpi[] = [
    { id: "g", label: t.nav.groups, value: String(groups.length), raw: groups.length, delta: null, hint: "" },
    { id: "s", label: t.nav.students, value: String(mine.length), raw: mine.length, delta: null, hint: "" },
    { id: "avg", label: t.nav.grades, value: `${fmtGrade(avg)} / 20`, raw: avg, delta: null, hint: "" },
    { id: "ok", label: "Notes saisies", value: String(mine.length), raw: mine.length, delta: null, hint: "" },
  ];

  return (
    <>
      <PageHead title={t.nav.evaluations}>
        <button type="button" className="os-btn os-btn-sm" onClick={() => downloadCsv("notes", ["Groupe", "Matricule", "Nom", "Note"], exportRows)}>
          Excel
        </button>
        <button type="button" className="os-btn os-btn-sm" onClick={() => printTable("Notes", ["Groupe", "Matricule", "Nom", "Note"], exportRows)}>
          Imprimer
        </button>
      </PageHead>
      <div className="os-kpi-grid">
        {kpis.map((kpi) => (
          <KpiCard key={kpi.id} kpi={kpi} />
        ))}
      </div>
      {groups.map((g) => {
        const rows = students.filter((s) => s.groupId === g.id && s.status === "active");
        return (
          <OsCard key={g.id} title={g.name}>
            <div className="os-table-wrap">
              <table className="os-table">
                <thead>
                  <tr>
                    <th>Nom</th>
                    <th className="num">{t.nav.grades}</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((s) => (
                    <tr key={s.id}>
                      <td>{s.name}</td>
                      <td className="num">
                        <input
                          className="os-input"
                          inputMode="decimal"
                          value={drafts[s.id] ?? ""}
                          onChange={(ev) => setDrafts((prev) => ({ ...prev, [s.id]: ev.target.value }))}
                          onBlur={() => save(s.id)}
                          aria-label={`Note de ${s.name}`}
                          style={{ width: 72, marginLeft: "auto" }}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </OsCard>
        );
      })}
    </>
  );
}
