/**
 * Prototype accounts. Passwords never leave the browser (localStorage).
 * Demo returning password: tas2026 — not a production secret.
 */

import type { Role } from "./core";
import { OS_USERS } from "./core";
import { STUDENTS, TEACHERS } from "./people";
import { readJson, writeJson } from "./persist";

export type Space = "ceo" | "admin" | "teacher" | "student";

export type Account = {
  matricule: string;
  name: string;
  space: Space;
  role: Role;
  personId: string;
  /** True until a password is stored locally. */
  firstLoginDefault: boolean;
};

export const DEMO_PASSWORD = "tas2026";

const STAFF: Account[] = [
  { matricule: "CEO-26-0001", name: "Fondateur TAS", space: "ceo", role: "founder", personId: "u-ceo", firstLoginDefault: false },
  { matricule: "ADM-26-0001", name: "Administration Alajo", space: "admin", role: "admin", personId: "u-adm", firstLoginDefault: false },
  { matricule: "ADM-26-0002", name: "Admissions", space: "admin", role: "admin", personId: "u-adm", firstLoginDefault: true },
  { matricule: "FIN-26-0001", name: "Comptabilité", space: "admin", role: "finance", personId: "u-fin", firstLoginDefault: false },
];

const TEACHER_ACCOUNTS: Account[] = TEACHERS.map((t, i) => ({
  matricule: t.staffId,
  name: t.name,
  space: "teacher" as const,
  role: "teacher" as const,
  personId: t.id,
  firstLoginDefault: i === 0,
}));

const STUDENT_ACCOUNTS: Account[] = STUDENTS.filter((s) => s.schoolId === "tas").map((s, i) => ({
  matricule: s.matricule,
  name: s.name,
  space: "student" as const,
  role: "student" as const,
  personId: s.id,
  firstLoginDefault: i < 2,
}));

export const ACCOUNTS: Account[] = [...STAFF, ...TEACHER_ACCOUNTS, ...STUDENT_ACCOUNTS];

export function lookupAccount(matricule: string, space: Space): Account | undefined {
  const key = matricule.trim().toUpperCase();
  const seeded = ACCOUNTS.find((a) => a.matricule === key && a.space === space);
  if (seeded) return seeded;
  if (space === "admin") {
    const extra = extraAdmins().find((a) => a.matricule === key);
    if (extra) {
      return {
        matricule: extra.matricule,
        name: extra.name,
        space: "admin",
        role: "admin",
        personId: `u-extra-${extra.matricule}`,
        firstLoginDefault: true,
      };
    }
  }
  if (space === "student") {
    const extra = extraStudentAccounts().find((a) => a.matricule === key);
    if (extra) return extra;
  }
  return undefined;
}

export function lookupAny(matricule: string): Account | undefined {
  const key = matricule.trim().toUpperCase();
  const seeded = ACCOUNTS.find((a) => a.matricule === key);
  if (seeded) return seeded;
  const admin = extraAdmins().find((a) => a.matricule === key);
  if (admin) {
    return {
      matricule: admin.matricule,
      name: admin.name,
      space: "admin",
      role: "admin",
      personId: `u-extra-${admin.matricule}`,
      firstLoginDefault: true,
    };
  }
  return extraStudentAccounts().find((a) => a.matricule === key);
}

export const SPACE_HOME: Record<Space, string> = {
  ceo: "/os/ceo",
  admin: "/os/desk",
  teacher: "/os/teacher",
  student: "/os/student",
};

export function osUserForAccount(account: { role: Role }) {
  return OS_USERS.find((u) => u.role === account.role) ?? OS_USERS[0];
}

const EXTRA_ADMINS_KEY = "tas-os-extra-admins";
const ADMINS_EVENT = "tas-os-admins";

export type ExtraAdmin = { name: string; matricule: string };

function readExtraAdmins(): ExtraAdmin[] {
  return readJson<ExtraAdmin[]>(EXTRA_ADMINS_KEY, []);
}

export function extraAdmins() {
  return readExtraAdmins();
}

export function nextAdminMatricule() {
  const used = new Set([
    ...ACCOUNTS.filter((a) => a.space === "admin").map((a) => a.matricule),
    ...readExtraAdmins().map((a) => a.matricule),
  ]);
  let n = used.size + 1;
  let code = `ADM-26-${String(n).padStart(4, "0")}`;
  while (used.has(code)) {
    n += 1;
    code = `ADM-26-${String(n).padStart(4, "0")}`;
  }
  return code;
}

export function addExtraAdmin(row: ExtraAdmin) {
  const extra = readExtraAdmins();
  if (extra.some((a) => a.matricule === row.matricule)) return;
  extra.unshift(row);
  writeJson(EXTRA_ADMINS_KEY, extra, ADMINS_EVENT);
}

const EXTRA_STU_ACC_KEY = "tas-os-extra-student-accounts";
export const STUDENT_ACCOUNTS_CHANGED = "tas-student-accounts-changed";

export function extraStudentAccounts(): Account[] {
  return readJson<Account[]>(EXTRA_STU_ACC_KEY, []);
}

export function addExtraStudentAccount(row: Account) {
  const extra = extraStudentAccounts();
  if (extra.some((a) => a.matricule === row.matricule)) return;
  extra.unshift(row);
  writeJson(EXTRA_STU_ACC_KEY, extra, STUDENT_ACCOUNTS_CHANGED);
}

export const ADMINS_CHANGED = ADMINS_EVENT;
