/** FICTIONAL students and teachers for the prototype. No real person. */

import { GROUPS, PROGRAMS, between, pick, rng, type Role } from "./core";
import { overlayById, readJson, writeJson } from "./persist";
import { COURSE_DURATION_MONTHS, type CourseDurationMonths } from "../../lib/course-duration";

/* ----- name pools ---------------------------------------------------------- */

const FIRST_F = ["Aminata", "Fatoumata", "Awa", "Mariam", "Rokhaya", "Adjoa", "Akosua", "Chantal", "Bintou", "Nafissatou", "Grâce", "Yasmine", "Salimata", "Abena", "Ama"];
const FIRST_M = ["Ibrahim", "Moussa", "Kwame", "Amadou", "Souleymane", "Kofi", "Boubacar", "Yao", "Mamadou", "Cheikh", "Serge", "Ousmane", "Kojo", "Sékou", "Abdoul"];
const LAST = ["Diallo", "Traoré", "Mensah", "Ouédraogo", "Koné", "Asante", "Bamba", "Sow", "Cissé", "Boateng", "Kouassi", "Ndiaye", "Sylla", "Owusu", "Dembélé", "Fofana", "Agyemang", "Barry"];

export const COUNTRIES = [
  { code: "CI", name: "Côte d'Ivoire", weight: 22 },
  { code: "BF", name: "Burkina Faso", weight: 16 },
  { code: "SN", name: "Sénégal", weight: 14 },
  { code: "ML", name: "Mali", weight: 11 },
  { code: "GH", name: "Ghana", weight: 10 },
  { code: "GN", name: "Guinée", weight: 8 },
  { code: "TG", name: "Togo", weight: 7 },
  { code: "BJ", name: "Bénin", weight: 6 },
  { code: "NE", name: "Niger", weight: 4 },
  { code: "CM", name: "Cameroun", weight: 2 },
] as const;

function weightedCountry(r: () => number) {
  const total = COUNTRIES.reduce((s, c) => s + c.weight, 0);
  let x = r() * total;
  for (const c of COUNTRIES) {
    x -= c.weight;
    if (x <= 0) return c;
  }
  return COUNTRIES[0];
}

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

const SPECIALTIES = [
  "Expression orale",
  "Grammaire",
  "Compréhension écrite",
  "Écoute",
  "Débat",
  "Vocabulaire",
  "MS Office",
  "Graphisme",
  "Bases de données",
  "Marketing digital",
  "Réseaux",
];

/** 18 teachers: the headcount the school itself gives. Names are fictional. */
export const TEACHERS: Teacher[] = Array.from({ length: 18 }, (_, i) => {
  const r = rng(700 + i);
  const female = r() > 0.55;
  const name = `${pick(female ? FIRST_F : FIRST_M, r)} ${pick(LAST, r)}`;
  const id = `t-${String(i + 1).padStart(2, "0")}`;
  const mine = GROUPS.filter((g) => g.teacherId === id);
  const isAbla = i >= 13;
  return {
    id,
    staffId: `ENS-26-${String(i + 1).padStart(4, "0")}`,
    name,
    initials: name.split(" ").map((w) => w[0]).join(""),
    specialty: SPECIALTIES[i % SPECIALTIES.length],
    schoolId: isAbla ? "abla" : "tas",
    campusId: isAbla ? "abla-osu" : i % 3 === 2 ? "tas-kotobabi" : "tas-alajo",
    phone: `+233 2${between(r, 10, 59)} ${between(r, 100, 999)} ${between(r, 100, 999)}`,
    email: `${name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z]+/g, ".")}@demo.tas`,
    groups: mine.map((g) => g.name),
    students: mine.reduce((s, g) => s + g.students, 0),
    status: i === 11 ? "leave" : "active",
    since: `20${between(r, 18, 25)}-0${between(r, 1, 9)}-1${between(r, 0, 9)}`,
  };
});

/* ----- students ----------------------------------------------------------- */

export type PaymentStatus = "paid" | "partial" | "unpaid";
export type StudentStatus = "active" | "applicant" | "completed" | "dropped";

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
};

export const LEAD_SOURCES = [
  "Formulaire",
  "WhatsApp",
  "Facebook",
  "Instagram",
  "TikTok",
  "Google",
  "YouTube",
  "Bouche-à-oreille",
  "Ancien étudiant",
  "Walk-in",
  "Agent",
] as const;

/** 132 fictional student records: enough to make filters and pagination real. */
export const STUDENTS: Student[] = Array.from({ length: 132 }, (_, i) => {
  const r = rng(4000 + i * 7);
  const female = r() > 0.52;
  const first = pick(female ? FIRST_F : FIRST_M, r);
  const last = pick(LAST, r);
  const name = `${first} ${last}`;
  const country = weightedCountry(r);
  const group = GROUPS[Math.floor(r() * GROUPS.length)];
  const program = PROGRAMS.find((p) => p.id === group.programId) ?? PROGRAMS[0];

  const statusRoll = r();
  const status: StudentStatus =
    statusRoll > 0.93 ? "dropped" : statusRoll > 0.82 ? "completed" : statusRoll > 0.06 ? "active" : "applicant";

  const payRoll = r();
  const paymentStatus: PaymentStatus = payRoll > 0.72 ? "partial" : payRoll > 0.62 ? "unpaid" : "paid";
  const balance =
    paymentStatus === "paid" ? 0 : paymentStatus === "partial" ? between(r, 40, 220) * 1000 : program.mockFee;

  const month = between(r, 0, 11);
  const day = between(r, 1, 28);

  return {
    id: `s-${String(i + 1).padStart(3, "0")}`,
    matricule: `TAS-26-${String(i + 1).padStart(4, "0")}`,
    name,
    initials: `${first[0]}${last[0]}`,
    gender: female ? "F" : "M",
    countryCode: country.code,
    country: country.name,
    phone: `+233 5${between(r, 10, 99)} ${between(r, 100, 999)} ${between(r, 100, 999)}`,
    email: `${first.toLowerCase()}.${last.toLowerCase()}@demo.tas`.normalize("NFD").replace(/[\u0300-\u036f]/g, ""),
    schoolId: group.schoolId,
    campusId: group.campusId,
    programId: group.programId,
    level: group.level,
    groupId: group.id,
    status,
    paymentStatus,
    enrolledAt: `2026-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
    attendanceRate: between(r, 68, 99),
    averageGrade: between(r, 92, 178) / 10,
    balance,
    source: pick(LEAD_SOURCES, r),
    durationMonths: pick([...COURSE_DURATION_MONTHS], r),
  };
});

export const ACTIVE_STUDENTS = STUDENTS.filter((s) => s.status === "active");

const EXTRA_STUDENTS_KEY = "tas-os-extra-students";
const STUDENTS_EVENT = "tas-students-changed";

export function readExtraStudents(): Student[] {
  return readJson<Student[]>(EXTRA_STUDENTS_KEY, []);
}

export function nextMatricule() {
  const used = new Set([...STUDENTS, ...readExtraStudents()].map((s) => s.matricule));
  let n = STUDENTS.length + 1;
  let code = `TAS-26-${String(n).padStart(4, "0")}`;
  while (used.has(code)) {
    n += 1;
    code = `TAS-26-${String(n).padStart(4, "0")}`;
  }
  return code;
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
}): Student {
  const group = GROUPS.find((g) => g.id === input.groupId) ?? GROUPS[0];
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
    enrolledAt: new Date().toISOString(),
    attendanceRate: 100,
    averageGrade: 0,
    balance: PROGRAMS.find((p) => p.id === group.programId)?.mockFee ?? 0,
    source: input.source ?? "Walk-in",
    durationMonths: input.durationMonths ?? 3,
  };
  extra.unshift(student);
  writeJson(EXTRA_STUDENTS_KEY, extra, STUDENTS_EVENT);
  return student;
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

export const ATTENDANCE: AttendanceRow[] = GROUPS.flatMap((g) =>
  Array.from({ length: 14 }, (_, d) => {
    const r = rng(900 + d + g.id.length * 13);
    const absent = between(r, 0, 4);
    const late = between(r, 0, 3);
    return {
      date: `2026-09-${String(d + 1).padStart(2, "0")}`,
      groupId: g.id,
      present: g.students - absent,
      absent,
      late,
    };
  }),
);

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

export const GRADE_DISTRIBUTION = [
  { band: "0–8", label: "Insuffisant", count: 6 },
  { band: "8–10", label: "Fragile", count: 14 },
  { band: "10–12", label: "Correct", count: 31 },
  { band: "12–14", label: "Bien", count: 38 },
  { band: "14–16", label: "Très bien", count: 25 },
  { band: "16–20", label: "Excellent", count: 11 },
];

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
