import { CAMPUSES, TEACHERS, type Kpi } from "../_data";
import {
  Badge,
  KpiCard,
  OsCard,
  PageHead,
  PersonCell,
  TEACHER_STATUS_FR,
  VoirLink,
  statusTone,
} from "../_components/ui";

const active = TEACHERS.filter((t) => t.status === "active");
const onLeave = TEACHERS.filter((t) => t.status === "leave");
const assigned = TEACHERS.filter((t) => t.groups.length > 0);

const KPIS: Kpi[] = [
  {
    id: "headcount",
    label: "Enseignants",
    value: String(TEACHERS.length),
    raw: TEACHERS.length,
    delta: null,
    hint: "",
  },
  {
    id: "active",
    label: "En poste",
    value: String(active.length),
    raw: active.length,
    delta: null,
    hint: "",
  },
  {
    id: "leave",
    label: "En congé",
    value: String(onLeave.length),
    raw: onLeave.length,
    delta: null,
    hint: "",
  },
  {
    id: "assigned",
    label: "Avec groupe",
    value: String(assigned.length),
    raw: assigned.length,
    delta: null,
    hint: "",
  },
];

export default function TeachersPage() {
  return (
    <>
      <PageHead title="Enseignants" />
      <div className="os-kpi-grid">
        {KPIS.map((kpi) => (
          <KpiCard key={kpi.id} kpi={kpi} />
        ))}
      </div>
      <OsCard title="Registre">
        <div className="os-table-wrap">
          <table className="os-table">
            <thead>
              <tr>
                <th>Enseignant</th>
                <th>Campus</th>
                <th>Statut</th>
                <th className="os-th-action">Action</th>
              </tr>
            </thead>
            <tbody>
              {TEACHERS.map((t) => {
                const campus = CAMPUSES.find((c) => c.id === t.campusId);
                return (
                  <tr key={t.id}>
                    <td>
                      <PersonCell initials={t.initials} name={t.name} meta={t.staffId} />
                    </td>
                    <td>{campus?.name ?? "Sans campus"}</td>
                    <td>
                      <Badge tone={statusTone(t.status)}>{TEACHER_STATUS_FR[t.status]}</Badge>
                    </td>
                    <td className="os-td-action">
                      <VoirLink href={`/os/teachers/${t.id}`} />
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
