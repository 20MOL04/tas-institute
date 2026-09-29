/** FICTIONAL students and teachers for the prototype. No real person. */

import { CAMPUSES, PROGRAMS, type Role } from "./core";
import { appendAudit } from "./audit";
import { feeFor, readSettings } from "./settings";
import { overlayById, readJson, writeJson } from "./persist";
import { type CourseDurationMonths } from "../../lib/course-duration";
import { localIso } from "../_lib/dates";
import { GROUPS } from "./groups";

import { WORLD, COUNTRY_LIST, LEAD_SOURCE_LIST } from "./world";

export const COUNTRIES = COUNTRY_LIST.map((c) => ({ code: c.code, name: c.name, weight: c.weight }));

/* ----- teachers ----------------------------------------------------------- */

export type Teacher = {
  id: string;
  staffId: string;
  name: string;
  initials: string;
  specialty: string;
  schoolId: string;
  campusId: string;
  phone: string;
  email: string;
  groups: string[];
  students: number;
  status: "active" | "leave";
  since: string;
};

/** 18 teachers: the headcount the school itself gives. Names are fictional. */
export const TEACHERS: Teacher[] = WORLD.teachers;

const EXTRA_TEACHERS_KEY = "tas-os-extra-teachers";
export const TEACHERS_CHANGED = "tas-teachers-changed";

export function readExtraTeachers(): Teacher[] {
  return readJson<Teacher[]>(EXTRA_TEACHERS_KEY, []);
}

export function liveTeachers(): Teacher[] {
  return [...readExtraTeachers(), ...TEACHERS];
}

export function addExtraTeacher(input: { name: string; staffId: string; specialty: string; campusId: string }) {
  const extra = readExtraTeachers();
  if (extra.some((t) => t.staffId === input.staffId)) return;
  const campus = CAMPUSES.find((c) => c.id === input.campusId);
  extra.unshift({
    id: `t-live-${Date.now()}`,
    staffId: input.staffId,
    name: input.name,
    initials: input.name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase(),
    specialty: input.specialty,
    schoolId: campus?.schoolId ?? "tas",
    campusId: input.campusId,
    phone: "",
    email: "",
    groups: [],
    students: 0,
    status: "active",
    since: localIso(),
  });
  writeJson(EXTRA_TEACHERS_KEY, extra, TEACHERS_CHANGED);
}

/* ----- students ----------------------------------------------------------- */

export type PaymentStatus = "paid" | "partial" | "unpaid";
export type StudentStatus = "active" | "applicant" | "completed" | "dropped" | "paused";

export type Student = {
  id: string;
  matricule: string;
  name: string;
  initials: string;
  gender: "F" | "M";
  countryCode: string;
  country: string;
  phone: string;
  email: string;
  schoolId: string;
  campusId: string;
  programId: string;
  level: string;
  groupId: string;
  status: StudentStatus;
  paymentStatus: PaymentStatus;
  enrolledAt: string;
  attendanceRate: number;
  averageGrade: number;
  balance: number;
  source: string;
  durationMonths: CourseDurationMonths;
  /** Total dû pour la formation (inscription + scolarité). */
  feeTotal: number;
  /** Nombre d'échéances de paiement (1 à 4). */
  plan: number;
  /** Session d'entrée. */
  intakeId: string;
  leadId?: string;
  applicationId?: string;
  /** Date de départ ou de mise en pause. */
  exitedAt?: string;
};

export const LEAD_SOURCES = LEAD_SOURCE_LIST;

/** ~1 200 fictional student records, generated from the seeded world. */
export const STUDENTS: Student[] = WORLD.students;

export const ACTIVE_STUDENTS = STUDENTS.filter((s) => s.status === "active");

const EXTRA_STUDENTS_KEY = "tas-os-extra-students";
const STUDENTS_EVENT = "tas-students-changed";

export function readExtraStudents(): Student[] {
  return readJson<Student[]>(EXTRA_STUDENTS_KEY, []);
}

export function nextMatricule(year = localIso().slice(2, 4)) {
  const prefix = `TAS-${year}-`;
  let max = 0;
  for (const st of [...STUDENTS, ...readExtraStudents()]) {
    if (st.matricule.startsWith(prefix)) max = Math.max(max, Number(st.matricule.slice(prefix.length)) || 0);
  }
  return `${prefix}${String(max + 1).padStart(4, "0")}`;
}

export function addStudent(input: {
  name: string;
  phone: string;
  email?: string;
  country: string;
  countryCode: string;
  groupId: string;
  source?: string;
  durationMonths?: CourseDurationMonths;
  actor?: string;
}): Student {
  const group = GROUPS.find((g) => g.id === input.groupId) ?? GROUPS[0];
  const months = input.durationMonths ?? 3;
  const settings = readSettings();
  const feeTotal = feeFor(group.programId, months, settings.fees) + (group.schoolId === "tas" ? 25_000 : 20_000);
  const now = new Date();
  const stamp = `${localIso(now)}T${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  const extra = readExtraStudents();
  const parts = input.name.trim().split(/\s+/);
  const first = parts[0] ?? "E";
  const last = parts[1] ?? parts[0] ?? "E";
  const student: Student = {
    id: `s-live-${Date.now()}`,
    matricule: nextMatricule(),
    name: input.name.trim(),
    initials: `${first[0] ?? "E"}${last[0] ?? "E"}`.toUpperCase(),
    gender: "M",
    countryCode: input.countryCode,
    country: input.country,
    phone: input.phone.trim(),
    email: input.email?.trim() || `${first.toLowerCase()}.${last.toLowerCase()}@tas.local`,
    schoolId: group.schoolId,
    campusId: group.campusId,
    programId: group.programId,
    level: group.level,
    groupId: group.id,
    status: "active",
    paymentStatus: "unpaid",
    enrolledAt: stamp,
    attendanceRate: 100,
    averageGrade: 0,
    balance: feeTotal,
    source: input.source ?? "Walk-in",
    durationMonths: months,
    feeTotal,
    plan: 1,
    intakeId: upcomingIntakeId(group.programId),
  };
  extra.unshift(student);
  writeJson(EXTRA_STUDENTS_KEY, extra, STUDENTS_EVENT);
  appendAudit({
    actor: input.actor ?? "Administration",
    type: "enrollment",
    action: "Élève inscrit",
    detail: `${student.name} · ${PROGRAMS.find((p) => p.id === group.programId)?.name ?? group.programId}`,
    href: `/os/students/${student.id}`,
  });
  return student;
}

/** Prochaine session (ou session en cours) de la formation. */
export function upcomingIntakeId(programId: string): string {
  const today = localIso();
  const list = WORLD.intakes.filter((i) => i.programId === programId && i.end >= today).sort((a, b) => (a.start < b.start ? -1 : 1));
  return (list.find((i) => i.start >= today) ?? list[0] ?? WORLD.intakes[0])?.id ?? "";
}

export function liveStudents(): Student[] {
  return overlayById(STUDENTS, readExtraStudents());
}

export function patchStudent(id: string, patch: Partial<Student>) {
  const extra = readExtraStudents();
  const idx = extra.findIndex((s) => s.id === id);
  const base = idx >= 0 ? extra[idx] : STUDENTS.find((s) => s.id === id);
  if (!base) return;
  const next = { ...base, ...patch };
  if (idx >= 0) extra[idx] = next;
  else extra.unshift(next);
  writeJson(EXTRA_STUDENTS_KEY, extra, STUDENTS_EVENT);
}

export function patchExtraStudent(id: string, patch: Partial<Student>) {
  patchStudent(id, patch);
}

export const STUDENTS_CHANGED = STUDENTS_EVENT;

export function studentsOfSchool(schoolId: string | "all") {
  return schoolId === "all" ? STUDENTS : STUDENTS.filter((s) => s.schoolId === schoolId);
}

/* ----- attendance and grades --------------------------------------------- */

export type AttendanceRow = { date: string; groupId: string; present: number; absent: number; late: number };

/** Présents / (présents + absents). Les retards sont un sous-ensemble des présents. */
export function sessionAttendanceRate(row: Pick<AttendanceRow, "present" | "absent">) {
  const denom = row.present + row.absent;
  return denom === 0 ? 0 : (row.present / denom) * 100;
}

export const ATTENDANCE: AttendanceRow[] = WORLD.attendance;

const EXTRA_ATT_KEY = "tas-os-extra-attendance";
const ATT_EVENT = "tas-os-attendance";

function readExtraAttendance(): AttendanceRow[] {
  return readJson<AttendanceRow[]>(EXTRA_ATT_KEY, []);
}

export function addAttendance(row: AttendanceRow) {
  const extra = readExtraAttendance();
  const idx = extra.findIndex((item) => item.groupId === row.groupId && item.date === row.date);
  if (idx >= 0) extra[idx] = row;
  else extra.unshift(row);
  writeJson(EXTRA_ATT_KEY, extra, ATT_EVENT);
  return row;
}

export function liveAttendance(): AttendanceRow[] {
  const extra = readExtraAttendance();
  const keys = new Set(extra.map((row) => `${row.groupId}-${row.date}`));
  return [...extra, ...ATTENDANCE.filter((row) => !keys.has(`${row.groupId}-${row.date}`))];
}

export const ATTENDANCE_CHANGED = ATT_EVENT;

const BANDS: { band: string; label: string; min: number; max: number }[] = [
  { band: "0–8", label: "Insuffisant", min: 0, max: 8 },
  { band: "8–10", label: "Fragile", min: 8, max: 10 },
  { band: "10–12", label: "Correct", min: 10, max: 12 },
  { band: "12–14", label: "Bien", min: 12, max: 14 },
  { band: "14–16", label: "Très bien", min: 14, max: 16 },
  { band: "16–20", label: "Excellent", min: 16, max: 20.1 },
];

export const GRADE_DISTRIBUTION = BANDS.map((b) => ({
  band: b.band,
  label: b.label,
  count: STUDENTS.filter((s) => s.status === "active" && s.averageGrade > 0 && s.averageGrade >= b.min && s.averageGrade < b.max).length,
}));

/* ----- role-scoped helpers ------------------------------------------------ */

/** Least privilege applied to the demo data: a teacher only ever sees their own
 *  groups, an admin their campus, a director their school. */
export function scopedStudents(role: Role, opts: { schoolId?: string; campusId?: string; teacherId?: string }) {
  const all = liveStudents();
  if (role === "teacher" && opts.teacherId) {
    const mine = GROUPS.filter((g) => g.teacherId === opts.teacherId).map((g) => g.id);
    return all.filter((s) => mine.includes(s.groupId));
  }
  if (role === "admin" && opts.campusId) return all.filter((s) => s.campusId === opts.campusId);
  if ((role === "director" || role === "finance") && opts.schoolId) {
    return all.filter((s) => s.schoolId === opts.schoolId);
  }
  return all;
}
