import {
  CAMPUSES,
  GROUPS,
  PAYMENTS,
  SCHOOLS,
  STUDENTS,
  STUDENTS_BY_SCHOOL,
  TEACHERS,
  fmtCompactMoney,
  fmtInt,
  fmtPct,
} from "../_data";
import { Badge, DemoBanner, OsCard, PageHead } from "../_components/ui";

const campusRows = CAMPUSES.map((campus) => {
  const school = SCHOOLS.find((s) => s.id === campus.schoolId);
  const students = STUDENTS.filter((st) => st.campusId === campus.id);
  const revenue = PAYMENTS.filter((p) => p.campusId === campus.id).reduce((sum, p) => sum + p.amount, 0);
  return {
    campus,
    school,
    students: students.length,
    active: students.filter((st) => st.status === "active").length,
    teachers: TEACHERS.filter((t) => t.campusId === campus.id).length,
    groups: GROUPS.filter((g) => g.campusId === campus.id).length,
    rooms: campus.rooms,
    revenue,
    attendance:
      students.reduce((sum, st) => sum + st.attendanceRate, 0) / Math.max(1, students.length),
  };
});

export default function SchoolsPage() {
  return (
    <>
      <DemoBanner />
      <PageHead title="Écoles et campus" lead="TAS English Institute à Accra, Alajo et Kotobabi." />

      <div className="os-grid os-grid-2 os-mb">
        {STUDENTS_BY_SCHOOL.map((row) => (
          <OsCard
            key={row.school.id}
            title={row.school.name}
            hint={`${row.school.city}, ${row.school.country}`}
            action={
              row.school.isReal ? (
                <Badge tone="green">Accra</Badge>
              ) : (
                <Badge tone="violet">Autre école</Badge>
              )
            }
          >
            <div className="os-grid os-grid-2">
              <div>
                <div className="os-kpi-label">Étudiants</div>
                <div className="os-kpi-value">{fmtInt(row.students)}</div>
                <div className="os-kpi-hint">{fmtInt(row.active)} actifs</div>
              </div>
              <div>
                <div className="os-kpi-label">Revenu</div>
                <div className="os-kpi-value">{fmtCompactMoney(row.revenue)} CFA</div>
                <div className="os-kpi-hint">{fmtInt(row.applications)} candidatures</div>
              </div>
              <div>
                <div className="os-kpi-label">Enseignants</div>
                <div className="os-kpi-value">{fmtInt(row.teachers)}</div>
                <div className="os-kpi-hint">{fmtInt(row.groups)} groupes</div>
              </div>
              <div>
                <div className="os-kpi-label">Présence</div>
                <div className="os-kpi-value">{fmtPct(row.attendance, 0)}</div>
                <div className="os-kpi-hint">Moyenne des dossiers</div>
              </div>
            </div>
          </OsCard>
        ))}
      </div>

      <OsCard
        title="Comparaison des campus"
        hint="Étudiants, paiements et groupes, campus par campus."
        foot="TAS Alajo et Kotobabi, plus le second établissement."
      >
        <div className="os-table-wrap">
          <table className="os-table">
            <thead>
              <tr>
                <th>Campus</th>
                <th>École</th>
                <th className="num">Salles</th>
                <th className="num">Groupes</th>
                <th className="num">Enseignants</th>
                <th className="num">Étudiants</th>
                <th className="num">Actifs</th>
                <th className="num">Présence</th>
                <th className="num">Revenu</th>
              </tr>
            </thead>
            <tbody>
              {campusRows.map((row) => (
                <tr key={row.campus.id}>
                  <td>
                    <strong className="os-table-strong">{row.campus.name}</strong>
                    <div className="os-muted os-small">{row.campus.area}</div>
                  </td>
                  <td>
                    {row.school?.short ?? "Sans école"}
                    {row.school && !row.school.isReal ? (
                      <div className="os-muted os-small">Autre école</div>
                    ) : null}
                  </td>
                  <td className="num">{fmtInt(row.rooms)}</td>
                  <td className="num">{fmtInt(row.groups)}</td>
                  <td className="num">{fmtInt(row.teachers)}</td>
                  <td className="num">{fmtInt(row.students)}</td>
                  <td className="num">{fmtInt(row.active)}</td>
                  <td className="num">{fmtPct(row.attendance, 0)}</td>
                  <td className="num">{fmtCompactMoney(row.revenue)} CFA</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </OsCard>
    </>
  );
}
