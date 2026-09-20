import {
  CAMPUSES,
  INTAKES,
  PROGRAMS,
  SCHOOLS,
  fillRate,
  fmtDate,
  fmtInt,
  fmtPct,
  type Intake,
  type Kpi,
} from "../_data";
import { Badge, INTAKE_STATUS_FR, KpiCard, OsCard, PageHead } from "../_components/ui";

function programName(programId: string) {
  return PROGRAMS.find((p) => p.id === programId)?.name ?? programId;
}

function campusName(campusId: string) {
  return CAMPUSES.find((c) => c.id === campusId)?.name ?? campusId;
}

function schoolName(schoolId: string) {
  return SCHOOLS.find((s) => s.id === schoolId)?.short ?? schoolId;
}

function intakeTone(status: Intake["status"]): "blue" | "amber" | "red" | "neutral" {
  if (status === "open") return "blue";
  if (status === "filling") return "amber";
  if (status === "full") return "red";
  return "neutral";
}

const FULL_INTAKES = INTAKES.filter((i) => i.status === "full");

export const metadata = { title: "Sessions" };

export default function IntakesPage() {
  const open = INTAKES.filter((i) => i.status === "open").length;
  const filling = INTAKES.filter((i) => i.status === "filling").length;
  const full = INTAKES.filter((i) => i.status === "full").length;
  const kpis: Kpi[] = [
    { id: "all", label: "Sessions", value: fmtInt(INTAKES.length), raw: INTAKES.length, delta: null, hint: "" },
    { id: "open", label: "Ouvertes", value: fmtInt(open), raw: open, delta: null, hint: "" },
    { id: "fill", label: "En remplissage", value: fmtInt(filling), raw: filling, delta: null, hint: "" },
    { id: "full", label: "Complètes", value: fmtInt(full), raw: full, delta: null, hint: "" },
  ];

  return (
    <>
      <PageHead title="Sessions" lead="Places, dates et remplissage de chaque rentrée." />
      <div className="os-kpi-grid">
        {kpis.map((kpi) => (
          <KpiCard key={kpi.id} kpi={kpi} />
        ))}
      </div>
      {FULL_INTAKES.length > 0 ? (
        <div className="os-alert high">
          <div>
            <strong>
              {programName(FULL_INTAKES[0].programId)}, {FULL_INTAKES[0].name} est complète.
            </strong>
            <span>
              {fmtInt(FULL_INTAKES[0].enrolled)} inscrits sur {fmtInt(FULL_INTAKES[0].capacity)} places,{" "}
              {campusName(FULL_INTAKES[0].campusId)}. Ouvrir un groupe ou passer à la rentrée suivante.
            </span>
          </div>
        </div>
      ) : null}
      <OsCard title="Rentrées">
        <div className="os-table-wrap">
          <table className="os-table">
            <thead>
              <tr>
                <th>Session</th>
                <th>Dates</th>
                <th className="num">Places</th>
                <th className="num">Remplissage</th>
                <th className="num">Candidatures</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              {INTAKES.map((intake) => (
                <tr key={intake.id}>
                  <td>
                    <strong className="os-table-strong">{programName(intake.programId)}</strong>
                    <div className="os-muted os-small">
                      {intake.name}, {schoolName(intake.schoolId)}, {campusName(intake.campusId)}
                    </div>
                  </td>
                  <td>
                    {fmtDate(intake.start)}
                    <div className="os-muted os-small">{fmtDate(intake.end)}</div>
                  </td>
                  <td className="num">
                    {fmtInt(intake.enrolled)}/{fmtInt(intake.capacity)}
                  </td>
                  <td className="num">{fmtPct(fillRate(intake), 0)}</td>
                  <td className="num">{fmtInt(intake.applications)}</td>
                  <td>
                    <Badge tone={intakeTone(intake.status)}>{INTAKE_STATUS_FR[intake.status]}</Badge>
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
