/**
 * REPOSITORY LAYER — the only door between the screens and the data.
 *
 * Today the data lives in the browser: a seeded, deterministic "world" (world.ts)
 * with a localStorage overlay for everything that is created or changed after load
 * (persist.ts). Every read (`getSnapshot`, `useRepo`) and every write (`recordPayment`,
 * `decideApproval`, `assignTeacher`, ...) of the founder space goes through this file.
 *
 * Swapping to a real backend (Supabase or other) later means re-implementing the
 * function bodies below — same names, same argument and return types — and turning
 * `getSnapshot()` into a cached fetch. Pages, selectors (metrics.ts) and components
 * never touch localStorage or the seed directly, so they do not change.
 */

import { useMemo, useSyncExternalStore } from "react";
import { CAMPUSES, PROGRAMS, fmtMoney, type Group, type Intake } from "./core";
import { GROUPS, INTAKES } from "./groups";
import { readSettings, writeSettings, type Settings } from "./settings";
import {
  ACCOUNTS,
  adminCampus,
  adminStatus,
  extraAdmins,
  resetAdminPassword as resetPassword,
  setAdminCampus,
  setAdminSuspended,
  type AdminStatus,
} from "./auth";
import { appendAudit, readExtraAudit, type AuditEntry } from "./audit";
import { liveApprovals, setApprovalStatus, type Approval, type ApprovalStatus } from "./approvals";
import { liveApplications, liveLeads, type Application, type Lead } from "./growth";
import { addPayment, deletePayment, livePayments, type Payment, type PaymentMethod } from "./ops";
import { liveAttendance, liveStudents, liveTeachers, type AttendanceRow, type Student, type Teacher } from "./people";
import { DATA_EVENT, readJson, writeJson } from "./persist";
import { WORLD } from "./world";
import { localIso } from "../_lib/dates";

/* ----- snapshot ------------------------------------------------------------ */

export type AdminRow = {
  matricule: string;
  name: string;
  roleLabel: string;
  campusId: string;
  status: AdminStatus | "pending";
  pendingApprovalId?: string;
};

export type Snapshot = {
  version: number;
  today: string;
  settings: Settings;
  students: Student[];
  payments: Payment[];
  attendance: AttendanceRow[];
  leads: Lead[];
  applications: Application[];
  sessions: Intake[];
  groups: Group[];
  teachers: Teacher[];
  approvals: Approval[];
  audit: AuditEntry[];
  admins: AdminRow[];
  /** Index for fast lookups. */
  studentById: Map<string, Student>;
  paymentsByStudent: Map<string, Payment[]>;
  groupById: Map<string, Group>;
  sessionById: Map<string, Intake>;
  teacherById: Map<string, Teacher>;
  absences: Record<string, string[]>;
  holidays: string[];
};

let version = 0;
let cached: Snapshot | null = null;
const listeners = new Set<() => void>();
let wired = false;

function bump() {
  version += 1;
  cached = null;
  listeners.forEach((l) => l());
}

function wire() {
  if (wired || typeof window === "undefined") return;
  wired = true;
  window.addEventListener(DATA_EVENT, bump);
  window.addEventListener("storage", bump);
}

export function subscribe(listener: () => void) {
  wire();
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/* ----- group and session patches ------------------------------------------- */

type GroupPatch = { open?: boolean; teacherId?: string };
const GROUP_PATCH_KEY = "tas-os-group-patches";
const GROUPS_CHANGED = "tas-groups-changed";

function readGroupPatches(): Record<string, GroupPatch> {
  return readJson<Record<string, GroupPatch>>(GROUP_PATCH_KEY, {});
}

const SEATED = new Set(["active", "paused", "completed"]);

function sessionStatus(it: Intake, enrolled: number, today: string): Intake["status"] {
  if (it.end < today) return "closed";
  if (enrolled >= it.capacity) return "full";
  if (enrolled / it.capacity >= 0.6) return "filling";
  return "open";
}

function build(): Snapshot {
  const today = localIso();
  const settings = readSettings();
  const students = liveStudents();
  const payments = livePayments();
  const studentById = new Map(students.map((s) => [s.id, s] as const));
  const paymentsByStudent = new Map<string, Payment[]>();
  for (const p of payments) {
    const list = paymentsByStudent.get(p.studentId);
    if (list) list.push(p);
    else paymentsByStudent.set(p.studentId, [p]);
  }
  paymentsByStudent.forEach((list) => list.sort((a, b) => (a.date + a.time < b.date + b.time ? -1 : 1)));

  const enrolledBy = new Map<string, number>();
  for (const s of students) if (SEATED.has(s.status)) enrolledBy.set(s.intakeId, (enrolledBy.get(s.intakeId) ?? 0) + 1);
  const applications = liveApplications();
  const appsBy = new Map<string, number>();
  for (const a of applications) appsBy.set(a.intakeId, (appsBy.get(a.intakeId) ?? 0) + 1);
  const sessions = INTAKES.map((it) => {
    const enrolled = enrolledBy.get(it.id) ?? 0;
    return { ...it, enrolled, applications: appsBy.get(it.id) ?? 0, status: sessionStatus(it, enrolled, today) };
  });
  const sessionById = new Map(sessions.map((s) => [s.id, s] as const));

  // A student "fills" a class only once the session has started.
  const inClass = new Map<string, number>();
  for (const s of students) {
    if (s.status !== "active" || !s.groupId) continue;
    const start = sessionById.get(s.intakeId)?.start ?? s.enrolledAt.slice(0, 10);
    const begin = s.enrolledAt.slice(0, 10) > start ? s.enrolledAt.slice(0, 10) : start;
    if (begin <= today) inClass.set(s.groupId, (inClass.get(s.groupId) ?? 0) + 1);
  }
  const patches = readGroupPatches();
  const groups: Group[] = GROUPS.map((g) => ({ ...g, ...patches[g.id], students: inClass.get(g.id) ?? 0 }));
  const groupById = new Map(groups.map((g) => [g.id, g] as const));

  const teachers = liveTeachers().map((t) => {
    const mine = groups.filter((g) => g.teacherId === t.id);
    return { ...t, groups: mine.map((g) => g.name), students: mine.reduce((sum, g) => sum + g.students, 0) };
  });
  const teacherById = new Map(teachers.map((t) => [t.id, t] as const));

  const approvals = liveApprovals();
  const pendingAdmins = approvals.filter((a) => a.kind === "admin" && a.status === "pending");
  const seeded: AdminRow[] = ACCOUNTS.filter((a) => a.space === "admin").map((a) => ({
    matricule: a.matricule,
    name: a.name,
    roleLabel: a.role === "finance" ? "Comptabilité" : "Administrateur",
    campusId: adminCampus(a.matricule),
    status: adminStatus(a.matricule),
  }));
  const extras: AdminRow[] = extraAdmins().map((a) => ({
    matricule: a.matricule,
    name: a.name,
    roleLabel: "Administrateur",
    campusId: adminCampus(a.matricule) || a.campusId || "tas-alajo",
    status: adminStatus(a.matricule),
  }));
  const admins: AdminRow[] = [
    ...pendingAdmins.map((a) => ({
      matricule: a.subjectRef,
      name: a.subjectName,
      roleLabel: "Administrateur",
      campusId: CAMPUSES.find((c) => c.name === a.summary)?.id ?? "",
      status: "pending" as const,
      pendingApprovalId: a.id,
    })),
    ...extras,
    ...seeded,
  ].filter((row, i, all) => all.findIndex((x) => x.matricule === row.matricule) === i);

  const audit = [...readExtraAudit(), ...WORLD.audit];
  audit.sort((a, b) => (a.at < b.at ? 1 : a.at > b.at ? -1 : 0));

  return {
    version,
    today,
    settings,
    students,
    payments,
    attendance: liveAttendance(),
    leads: liveLeads(),
    applications,
    sessions,
    groups,
    teachers,
    approvals,
    audit,
    admins,
    studentById,
    paymentsByStudent,
    groupById,
    sessionById,
    teacherById,
    absences: WORLD.absences,
    holidays: WORLD.holidays,
  };
}

/** Current data, computed once per change (cheap to call from anywhere). */
export function getSnapshot(): Snapshot {
  if (!cached) cached = build();
  return cached;
}

/** React hook: re-renders on every write, from this tab or another one. */
export function useRepo(): Snapshot {
  const v = useSyncExternalStore(
    subscribe,
    () => version,
    () => 0,
  );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => getSnapshot(), [v]);
}

/* ----- writes -------------------------------------------------------------- */

export function recordPayment(input: {
  studentId: string;
  amount: number;
  method: PaymentMethod;
  purpose: Payment["purpose"];
  actor: string;
}): Payment | undefined {
  const student = getSnapshot().studentById.get(input.studentId);
  if (!student) return undefined;
  return addPayment({ student, amount: input.amount, method: input.method, purpose: input.purpose, recordedBy: input.actor });
}

export function voidPayment(paymentId: string, actor: string, reason?: string) {
  deletePayment(paymentId, actor, reason);
}

export function decideApproval(id: string, status: ApprovalStatus, options: { reason?: string; actor: string }) {
  return setApprovalStatus(id, status, options);
}

/** Décide de plusieurs demandes d'un coup. Retourne le nombre de décisions appliquées. */
export function decideMany(ids: string[], status: ApprovalStatus, options: { reason?: string; actor: string }) {
  let done = 0;
  for (const id of ids) if (setApprovalStatus(id, status, options)) done += 1;
  return done;
}

function patchGroup(id: string, patch: GroupPatch) {
  const all = readGroupPatches();
  all[id] = { ...all[id], ...patch };
  writeJson(GROUP_PATCH_KEY, all, GROUPS_CHANGED);
}

export function setGroupOpen(groupId: string, open: boolean, actor: string) {
  const g = getSnapshot().groupById.get(groupId);
  if (!g) return;
  patchGroup(groupId, { open });
  appendAudit({ actor, type: "group", action: open ? "Classe ouverte" : "Classe fermée", detail: `${g.name} · ${g.room}` });
}

export function assignTeacher(groupId: string, teacherId: string, actor: string) {
  const snap = getSnapshot();
  const g = snap.groupById.get(groupId);
  if (!g) return;
  const t = snap.teacherById.get(teacherId);
  patchGroup(groupId, { teacherId });
  appendAudit({
    actor,
    type: "group",
    action: "Enseignant assigné",
    detail: `${g.name} · ${t ? t.name : "aucun enseignant"}`,
  });
}

export function suspendAdmin(matricule: string, suspended: boolean, actor: string) {
  const row = getSnapshot().admins.find((a) => a.matricule === matricule);
  setAdminSuspended(matricule, suspended, actor, row?.name ?? matricule);
}

export function changeAdminCampus(matricule: string, campusId: string, actor: string) {
  const row = getSnapshot().admins.find((a) => a.matricule === matricule);
  const campusName = CAMPUSES.find((c) => c.id === campusId)?.name ?? campusId;
  setAdminCampus(matricule, campusId, actor, row?.name ?? matricule, campusName);
}

export function resetAdminPassword(matricule: string, actor: string): string {
  const row = getSnapshot().admins.find((a) => a.matricule === matricule);
  return resetPassword(matricule, actor, row?.name ?? matricule);
}

export function saveSettings(next: Settings, actor: string) {
  const prev = getSnapshot().settings;
  writeSettings(next);
  const changes: string[] = [];
  if (prev.schoolYear !== next.schoolYear) changes.push(`année scolaire ${next.schoolYear}`);
  if (prev.unpaidDays !== next.unpaidDays) changes.push(`impayé > ${next.unpaidDays} j`);
  if (prev.fillPct !== next.fillPct) changes.push(`remplissage ${next.fillPct} %`);
  if (prev.attendancePct !== next.attendancePct) changes.push(`présence ${next.attendancePct} %`);
  if (prev.callbackDays !== next.callbackDays) changes.push(`rappel ${next.callbackDays} j`);
  for (const p of PROGRAMS) {
    if ((prev.fees[p.id] ?? 0) !== (next.fees[p.id] ?? 0)) changes.push(`${p.name} ${fmtMoney(next.fees[p.id] ?? 0)}`);
  }
  appendAudit({ actor, type: "setting", action: "Paramètres modifiés", detail: changes.join(" · ") || "Aucun changement" });
}

/* ----- alert read state ---------------------------------------------------- */

const READ_KEY = "tas-os-alerts-read";
const READ_CHANGED = "tas-alerts-read-changed";

export function readAlertSignatures(): string[] {
  return readJson<string[]>(READ_KEY, []);
}

export function markAlertsRead(signatures: string[]) {
  const merged = Array.from(new Set([...readAlertSignatures(), ...signatures])).slice(-200);
  writeJson(READ_KEY, merged, READ_CHANGED);
}
