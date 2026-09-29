/**
 * Journal d'activité : chaque action importante y laisse une trace (qui, quand, quoi).
 * Ce module ne dépend d'aucune autre donnée, pour que toutes les écritures puissent l'appeler.
 */

import { readJson, writeJson } from "./persist";

export type AuditType =
  | "payment"
  | "enrollment"
  | "approval"
  | "admin"
  | "group"
  | "student"
  | "lead"
  | "attendance"
  | "setting";

export const AUDIT_TYPE_FR: Record<AuditType, string> = {
  payment: "Paiement",
  enrollment: "Inscription",
  approval: "Décision",
  admin: "Équipe",
  group: "Classe",
  student: "Élève",
  lead: "Demande",
  attendance: "Présence",
  setting: "Paramètre",
};

export type AuditEntry = {
  id: string;
  /** "YYYY-MM-DDTHH:MM" heure locale. */
  at: string;
  actor: string;
  type: AuditType;
  action: string;
  detail: string;
  href?: string;
};

const KEY = "tas-os-audit";
export const AUDIT_CHANGED = "tas-audit-changed";

export function readExtraAudit(): AuditEntry[] {
  return readJson<AuditEntry[]>(KEY, []);
}

let counter = 0;

export function appendAudit(entry: Omit<AuditEntry, "id" | "at"> & { at?: string }): AuditEntry {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  const at = entry.at ?? `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  counter += 1;
  const row: AuditEntry = { ...entry, at, id: `au-live-${Date.now()}-${counter}` };
  const extra = readExtraAudit();
  extra.unshift(row);
  writeJson(KEY, extra.slice(0, 1500), AUDIT_CHANGED);
  return row;
}
