/**
 * Single entry point for the prototype's demo data.
 *
 * UI code should import from here (`../_data`) and never mutate anything: the
 * modules export frozen-by-convention constants shared across every screen, so
 * the totals on the CEO dashboard match the rows in the tables underneath.
 */

export * from "./core";
export * from "./people";
export * from "./growth";
export * from "./ops";
export * from "./auth";
export * from "./approvals";

import { STUDENTS, ACTIVE_STUDENTS, TEACHERS, GRADE_DISTRIBUTION } from "./people";
import { APPLICATIONS, MONTHLY, TRAFFIC_TOTALS } from "./growth";
import { OUTSTANDING_TOTAL, REVENUE_TOTAL, PAYMENTS } from "./ops";
import { CAMPUSES, GROUPS, INTAKES, PROGRAMS, SCHOOLS } from "./core";

/* ----- headline KPIs ------------------------------------------------------ */

export type Kpi = {
  id: string;
  label: string;
  value: string;
  raw: number;
  /** Variation vs the previous comparable period, in points of percent. */
  delta: number | null;
  hint: string;
  spark?: number[];
};

const prevRatio = (series: number[]) => {
  const last = series[series.length - 1];
  const prev = series[series.length - 2] || last;
  return prev === 0 ? 0 : ((last - prev) / prev) * 100;
};

export const CEO_KPIS: Kpi[] = [
  {
    id: "students",
    label: "Étudiants actifs",
    value: String(ACTIVE_STUDENTS.length),
    raw: ACTIVE_STUDENTS.length,
    delta: prevRatio(MONTHLY.students),
    hint: `${STUDENTS.length} dossiers au total, toutes écoles`,
    spark: MONTHLY.students,
  },
  {
    id: "enrollments",
    label: "Inscriptions (30 j)",
    value: String(MONTHLY.enrollments[MONTHLY.enrollments.length - 1]),
    raw: MONTHLY.enrollments[MONTHLY.enrollments.length - 1],
    delta: prevRatio(MONTHLY.enrollments),
    hint: "Confirmées et payées au moins partiellement",
    spark: MONTHLY.enrollments,
  },
  {
    id: "applications",
    label: "Candidatures ouvertes",
    value: String(APPLICATIONS.filter((a) => a.status !== "enrolled" && a.status !== "rejected").length),
    raw: APPLICATIONS.filter((a) => a.status !== "enrolled" && a.status !== "rejected").length,
    delta: prevRatio(MONTHLY.applications),
    hint: `dont ${APPLICATIONS.filter((a) => a.status === "documents").length} en attente de documents`,
    spark: MONTHLY.applications,
  },
  {
    id: "revenue",
    label: "Revenu encaissé (12 mois)",
    value: `${(REVENUE_TOTAL / 1_000_000).toFixed(1).replace(".", ",")}M CFA`,
    raw: REVENUE_TOTAL,
    delta: prevRatio(MONTHLY.revenue),
    hint: `${(OUTSTANDING_TOTAL / 1_000_000).toFixed(1).replace(".", ",")}M CFA restent à recouvrer`,
    spark: MONTHLY.revenue,
  },
  {
    id: "leads",
    label: "Inscriptions en ligne (12 mois)",
    value: String(TRAFFIC_TOTALS.leads),
    raw: TRAFFIC_TOTALS.leads,
    delta: prevRatio(MONTHLY.leads),
    hint: `${TRAFFIC_TOTALS.qualified} qualifiés`,
    spark: MONTHLY.leads,
  },
  {
    id: "conversion",
    label: "Inscriptions en ligne → inscription",
    value: `${((TRAFFIC_TOTALS.enrollments / TRAFFIC_TOTALS.leads) * 100).toFixed(1).replace(".", ",")} %`,
    raw: (TRAFFIC_TOTALS.enrollments / TRAFFIC_TOTALS.leads) * 100,
    delta: 1.8,
    hint: "Toutes sources confondues",
  },
];

/* ----- distributions ------------------------------------------------------ */

export const STUDENTS_BY_PROGRAM = PROGRAMS.map((p) => ({
  label: p.name,
  value: STUDENTS.filter((s) => s.programId === p.id).length,
}));

export const STUDENTS_BY_COUNTRY = Object.entries(
  STUDENTS.reduce<Record<string, number>>((acc, s) => {
    acc[s.country] = (acc[s.country] ?? 0) + 1;
    return acc;
  }, {}),
)
  .map(([label, value]) => ({ label, value }))
  .sort((a, b) => b.value - a.value);

export const STUDENTS_BY_SCHOOL = SCHOOLS.map((s) => ({
  school: s,
  students: STUDENTS.filter((st) => st.schoolId === s.id).length,
  active: ACTIVE_STUDENTS.filter((st) => st.schoolId === s.id).length,
  applications: APPLICATIONS.filter((a) => CAMPUSES.find((c) => c.id === a.campusId)?.schoolId === s.id).length,
  revenue: PAYMENTS.filter((p) => {
    const student = STUDENTS.find((st) => st.id === p.studentId);
    return student?.schoolId === s.id;
  }).reduce((sum, p) => sum + p.amount, 0),
  teachers: TEACHERS.filter((t) => t.schoolId === s.id).length,
  groups: GROUPS.filter((g) => g.schoolId === s.id).length,
  attendance:
    STUDENTS.filter((st) => st.schoolId === s.id).reduce((sum, st) => sum + st.attendanceRate, 0) /
    Math.max(1, STUDENTS.filter((st) => st.schoolId === s.id).length),
}));

export const PAYMENT_MIX = (["paid", "partial", "unpaid"] as const).map((status) => ({
  label: status === "paid" ? "À jour" : status === "partial" ? "Partiel" : "Impayé",
  value: STUDENTS.filter((s) => s.paymentStatus === status).length,
}));

export const ATTENDANCE_TREND = MONTHLY.labels.map((label, i) => ({
  label,
  value: Math.round(88 + Math.sin(i / 1.7) * 4 - (i > 9 ? 2 : 0)),
}));

/* ----- alerts ------------------------------------------------------------- */

export type Alert = { id: string; level: "high" | "medium" | "low"; label: string; detail: string; href: string };

export const ALERTS: Alert[] = [
  {
    id: "al-01",
    level: "high",
    label: `${APPLICATIONS.filter((a) => a.status === "documents").length} dossiers bloqués faute de documents`,
    detail: "Chaque jour d'attente augmente le risque d'abandon.",
    href: "/os/applications",
  },
  {
    id: "al-02",
    level: "high",
    label: `${STUDENTS.filter((s) => s.paymentStatus === "unpaid").length} étudiants sans paiement enregistré`,
    detail: `${(OUTSTANDING_TOTAL / 1_000_000).toFixed(1).replace(".", ",")}M CFA à recouvrer.`,
    href: "/os/finance",
  },
  {
    id: "al-03",
    level: "medium",
    label: `${INTAKES.filter((i) => i.status === "full").length} session(s) à capacité`,
    detail: "Ouvrir un groupe supplémentaire ou basculer sur la rentrée suivante.",
    href: "/os/intakes",
  },
  {
    id: "al-04",
    level: "medium",
    label: "TikTok : 9 240 visites, 9 inscriptions",
    detail: "Volume élevé, conversion faible : revoir le ciblage ou la page d'arrivée.",
    href: "/os/ceo/traffic",
  },
];

export { GRADE_DISTRIBUTION };
