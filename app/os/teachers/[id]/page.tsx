import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { CAMPUSES, GROUPS, SCHOOLS, STUDENTS, TEACHERS, type Kpi } from "../../_data";
import { Badge, KpiCard, OsCard, PageHead, TEACHER_STATUS_FR, VoirLink, statusTone } from "../../_components/ui";

export function generateStaticParams() {
  return TEACHERS.map((t) => ({ id: t.id }));
}

export function generateMetadata({ params }: { params: { id: string } }) {
  const teacher = TEACHERS.find((t) => t.id === params.id);
  return { title: teacher ? teacher.name : "Enseignant" };
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <div className="os-small os-muted">{label}</div>
      <div className="os-table-strong">{children}</div>
    </div>
  );
}

export default function TeacherDetailPage({ params }: { params: { id: string } }) {
  const teacher = TEACHERS.find((t) => t.id === params.id);
  if (!teacher) notFound();

  const campus = CAMPUSES.find((c) => c.id === teacher.campusId);
  const school = SCHOOLS.find((s) => s.id === teacher.schoolId);
  const groups = GROUPS.filter((g) => g.teacherId === teacher.id);
  const students = STUDENTS.filter((s) => groups.some((g) => g.id === s.groupId));
  const active = students.filter((s) => s.status === "active").length;
  const kpis: Kpi[] = [
    { id: "g", label: "Groupes", value: String(groups.length), raw: groups.length, delta: null, hint: "" },
    { id: "s", label: "Élèves", value: String(students.length), raw: students.length, delta: null, hint: "" },
    { id: "a", label: "Actifs", value: String(active), raw: active, delta: null, hint: "" },
    { id: "r", label: "Salles", value: String(new Set(groups.map((g) => g.room)).size), raw: groups.length, delta: null, hint: "" },
  ];

  return (
    <>
      <PageHead title={teacher.name}>
        <Badge tone={statusTone(teacher.status)}>{TEACHER_STATUS_FR[teacher.status]}</Badge>
      </PageHead>
      <div className="os-kpi-grid">
        {kpis.map((kpi) => (
          <KpiCard key={kpi.id} kpi={kpi} />
        ))}
      </div>
      <OsCard title="Fiche">
        <div className="os-grid os-grid-2">
          <Field label="Matricule">{teacher.staffId}</Field>
          <Field label="Spécialité">{teacher.specialty}</Field>
          <Field label="École">{school?.name ?? teacher.schoolId}</Field>
          <Field label="Campus">{campus?.name ?? "Sans campus"}</Field>
          <Field label="Téléphone">{teacher.phone}</Field>
          <Field label="E-mail">{teacher.email}</Field>
          <Field label="Groupes">{teacher.groups.length ? teacher.groups.join(", ") : "Aucun"}</Field>
          <Field label="Élèves">{teacher.students}</Field>
        </div>
      </OsCard>
      {students.length > 0 ? (
        <OsCard title="Élèves du groupe">
          <div className="os-table-wrap">
            <table className="os-table">
              <thead>
                <tr>
                  <th>Élève</th>
                  <th>Groupe</th>
                  <th className="os-th-action">Action</th>
                </tr>
              </thead>
              <tbody>
                {students.slice(0, 40).map((s) => {
                  const group = groups.find((g) => g.id === s.groupId);
                  return (
                    <tr key={s.id}>
                      <td>
                        <strong className="os-table-strong">{s.name}</strong>
                        <div className="os-muted">{s.matricule}</div>
                      </td>
                      <td>{group?.name ?? s.groupId}</td>
                      <td className="os-td-action">
                        <VoirLink href={`/os/students/${s.id}`} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </OsCard>
      ) : null}
    </>
  );
}
