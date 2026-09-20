"use client";

import { CAMPUSES, GROUPS, PROGRAMS, STUDENTS, TEACHERS, type Kpi } from "../_data";
import { KpiCard, OsCard, PageHead, VoirLink } from "../_components/ui";
import { useOs } from "../_components/OsProvider";
import { useOsT } from "../_components/useOsT";

export default function GroupsPage() {
  const { t } = useOsT();
  const { session } = useOs();
  const rows =
    session?.role === "teacher" ? GROUPS.filter((g) => g.teacherId === session.personId) : GROUPS;
  const students = STUDENTS.filter((s) => rows.some((g) => g.id === s.groupId));
  const kpis: Kpi[] = [
    { id: "g", label: "Groupes", value: String(rows.length), raw: rows.length, delta: null, hint: "" },
    { id: "s", label: "Élèves", value: String(students.length), raw: students.length, delta: null, hint: "" },
    {
      id: "cap",
      label: "Places",
      value: String(rows.reduce((sum, g) => sum + g.capacity, 0)),
      raw: rows.reduce((sum, g) => sum + g.capacity, 0),
      delta: null,
      hint: "",
    },
    {
      id: "full",
      label: "Groupes pleins",
      value: String(rows.filter((g) => g.students >= g.capacity).length),
      raw: rows.filter((g) => g.students >= g.capacity).length,
      delta: null,
      hint: "",
    },
  ];

  return (
    <>
      <PageHead title={t.nav.groups} />
      <div className="os-kpi-grid">
        {kpis.map((kpi) => (
          <KpiCard key={kpi.id} kpi={kpi} />
        ))}
      </div>
      <OsCard title={t.nav.groups}>
        <div className="os-table-wrap">
          <table className="os-table">
            <thead>
              <tr>
                <th>Groupe</th>
                <th>Salle</th>
                <th className="num">Effectif</th>
                <th className="os-th-action">Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((g) => {
                const teacher = TEACHERS.find((x) => x.id === g.teacherId);
                const campus = CAMPUSES.find((c) => c.id === g.campusId);
                const program = PROGRAMS.find((p) => p.id === g.programId);
                return (
                  <tr key={g.id}>
                    <td>
                      <strong className="os-table-strong">{g.name}</strong>
                      <div className="os-muted os-small">
                        {program?.name}, {g.level}
                        {session?.role !== "teacher" && teacher ? `, ${teacher.name}` : ""}
                        {campus ? `, ${campus.name}` : ""}
                      </div>
                    </td>
                    <td>{g.room}</td>
                    <td className="num">
                      {g.students}/{g.capacity}
                    </td>
                    <td className="os-td-action">
                      <VoirLink href={`/os/teachers/${g.teacherId}`} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </OsCard>
    </>
  );
}
