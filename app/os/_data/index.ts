/**
 * Single entry point for the demo data.
 *
 * UI code should import from here (`../_data`). The records come from the seeded
 * world (world.ts); every read and write of the founder space goes through the
 * repository layer (repo.ts) and every number is computed by metrics.ts.
 */

export * from "./core";
export * from "./groups";
export * from "./people";
export * from "./growth";
export * from "./traffic";
export * from "./ops";
export * from "./auth";
export * from "./approvals";
export * from "./audit";
export * from "./settings";

import { STUDENTS, ACTIVE_STUDENTS, TEACHERS, GRADE_DISTRIBUTION } from "./people";
import { APPLICATIONS } from "./growth";
import { PAYMENTS } from "./ops";
import { CAMPUSES, SCHOOLS, TIMELINE } from "./core";
import { GROUPS } from "./groups";
import { ATTENDANCE } from "./people";

/* ----- headline KPIs ------------------------------------------------------ */

export type Kpi = {
  id: string;
  label: string;
  value: string;
  raw: number;
  /** Variation vs the previous comparable period, in percent (null = not comparable). */
  delta: number | null;
  hint: string;
  spark?: number[];
  /** Show the comparison line ("↑ 12 % vs période précédente"), with "—" when delta is null. */
  compare?: boolean;
  /** When true a rise is bad news (unpaid, students at risk...). */
  invert?: boolean;
  /** Small line under the value ("sur 312 élèves"). */
  sub?: string;
  /** Label of the comparison ("vs période précédente"). */
  compareLabel?: string;
  /** "pts" when the delta is a difference in percentage points (rates). */
  deltaUnit?: "%" | "pts";
};

/* ----- distributions ------------------------------------------------------ */

export const STUDENTS_BY_SCHOOL = SCHOOLS.map((s) => ({
  school: s,
  students: STUDENTS.filter((st) => st.schoolId === s.id).length,
  active: ACTIVE_STUDENTS.filter((st) => st.schoolId === s.id).length,
  applications: APPLICATIONS.filter((a) => CAMPUSES.find((c) => c.id === a.campusId)?.schoolId === s.id).length,
  revenue: PAYMENTS.filter((p) => CAMPUSES.find((c) => c.id === p.campusId)?.schoolId === s.id).reduce((sum, p) => sum + p.amount, 0),
  teachers: TEACHERS.filter((t) => t.schoolId === s.id).length,
  groups: GROUPS.filter((g) => g.schoolId === s.id).length,
  attendance:
    STUDENTS.filter((st) => st.schoolId === s.id && st.status === "active").reduce((sum, st) => sum + st.attendanceRate, 0) /
    Math.max(1, STUDENTS.filter((st) => st.schoolId === s.id && st.status === "active").length),
}));

/** Monthly attendance rate of the current calendar year, from the attendance records. */
export const ATTENDANCE_TREND = TIMELINE.map((t) => {
  let present = 0;
  let absent = 0;
  for (const row of ATTENDANCE) {
    if (row.date.startsWith(t.key)) {
      present += row.present;
      absent += row.absent;
    }
  }
  return { label: t.label, value: present + absent === 0 ? 0 : Math.round((present / (present + absent)) * 100) };
});

export { GRADE_DISTRIBUTION };
