/**
 * File unique des décisions réservées au fondateur.
 * L'administration prépare ; elle n'accepte pas, ne refuse pas.
 *
 * Chaque décision a un effet réel sur les données (élève activé, transfert appliqué,
 * compte créé...) et laisse une trace dans le journal d'activité.
 */

import type { Role } from "./core";
import { CAMPUSES, PROGRAMS } from "./core";
import { GROUPS } from "./groups";
import { liveApplications, liveLeads, patchApplication, updateLead } from "./growth";
import { addExtraTeacher, addStudent, patchStudent } from "./people";
import { addExtraAdmin, addExtraStudentAccount } from "./auth";
import { appendAudit } from "./audit";
import { WORLD } from "./world";
import { overlayById, readJson, writeJson } from "./persist";
import { localIso } from "../_lib/dates";

export type ApprovalKind = "transfer" | "enroll" | "reject" | "exclude" | "unblock" | "admin" | "teacher";

export type ApprovalStatus = "pending" | "accepted" | "refused";

export type Approval = {
  id: string;
  kind: ApprovalKind;
  status: ApprovalStatus;
  subjectName: string;
  subjectRef: string;
  summary: string;
  requestedBy: string;
  date: string;
  relatedId: string;
  /** Élève concerné, quand il existe déjà. */
  studentId?: string;
  decidedAt?: string;
  decidedBy?: string;
  /** Motif (obligatoire pour un refus). */
  reason?: string;
};

export const APPROVALS: Approval[] = WORLD.approvals;

export function pendingApprovals(list: readonly Approval[] = liveApprovals()) {
  return list.filter((row) => row.status === "pending");
}

export function countPending(list: readonly Approval[] = liveApprovals()) {
  return pendingApprovals(list).length;
}

export function canDecideApprovals(role: Role | undefined | null) {
  return role === "founder" || role === "director" || role === "superadmin";
}

export function findApplicationApproval(applicationId: string, list: readonly Approval[] = liveApprovals()) {
  return list.find((row) => (row.kind === "enroll" || row.kind === "reject") && row.relatedId === applicationId);
}

export function findTransferApproval(transferId: string, list: readonly Approval[] = liveApprovals()) {
  return list.find((row) => row.kind === "transfer" && row.relatedId === transferId);
}

const EXTRA_APPROVALS_KEY = "tas-os-extra-approvals";
export const APPROVALS_CHANGED = "tas-approvals-changed";

export function liveApprovals(): Approval[] {
  return overlayById(APPROVALS, readJson<Approval[]>(EXTRA_APPROVALS_KEY, []));
}

function writeApproval(next: Approval) {
  const extra = readJson<Approval[]>(EXTRA_APPROVALS_KEY, []);
  const idx = extra.findIndex((row) => row.id === next.id);
  if (idx >= 0) extra[idx] = next;
  else extra.unshift(next);
  writeJson(EXTRA_APPROVALS_KEY, extra, APPROVALS_CHANGED);
}

function programName(id: string) {
  return PROGRAMS.find((p) => p.id === id)?.name ?? id;
}

/** Classe d'entrée d'un nouvel élève : premier niveau de la formation, la moins remplie. */
function entryGroupFor(programId: string, campusId: string) {
  const pool = GROUPS.filter((g) => g.programId === programId && g.campusId === campusId);
  const firstLevel = PROGRAMS.find((p) => p.id === programId)?.levels[0];
  const level = pool.filter((g) => g.level === firstLevel);
  const list = level.length ? level : pool;
  return list.reduce<(typeof GROUPS)[number] | undefined>((a, b) => (!a || b.students < a.students ? b : a), undefined) ?? GROUPS[0];
}

function nowLocalStamp() {
  const d = new Date();
  return `${localIso(d)}T${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

/** Applique l'effet d'une décision. Retourne une phrase décrivant ce qui a changé. */
function applyDecision(row: Approval, actor: string): string {
  if (row.status === "pending") return "";
  const ok = row.status === "accepted";
  const today = localIso();
  switch (row.kind) {
    case "enroll": {
      if (row.studentId) {
        if (ok) {
          patchStudent(row.studentId, { status: "active", enrolledAt: today, exitedAt: undefined });
          patchApplication(row.relatedId, { status: "enrolled" });
          return "Élève activé";
        }
        patchStudent(row.studentId, { status: "dropped", exitedAt: today });
        patchApplication(row.relatedId, { status: "rejected" });
        return "Dossier refusé";
      }
      const app = liveApplications().find((a) => a.id === row.relatedId);
      if (!app) return "";
      if (!ok) {
        patchApplication(app.id, { status: "rejected" });
        return "Dossier refusé";
      }
      const group = entryGroupFor(app.programId, app.campusId);
      const lead = app.leadId ? liveLeads().find((l) => l.id === app.leadId) : undefined;
      const student = addStudent({
        name: app.name,
        phone: lead?.phone ?? "",
        country: app.country,
        countryCode: lead?.countryCode ?? "",
        groupId: group.id,
        source: app.source,
        durationMonths: app.durationMonths,
        actor,
      });
      patchStudent(student.id, { intakeId: app.intakeId, applicationId: app.id, leadId: app.leadId });
      addExtraStudentAccount({
        matricule: student.matricule,
        name: student.name,
        space: "student",
        role: "student",
        personId: student.id,
        firstLoginDefault: true,
      });
      patchApplication(app.id, { status: "enrolled", studentId: student.id });
      if (app.leadId) updateLead(app.leadId, { stage: "enrolled", studentId: student.id, overdue: false });
      return `Élève créé (${student.matricule})`;
    }
    case "reject": {
      patchApplication(row.relatedId, { status: ok ? "rejected" : "reviewing" });
      return ok ? "Dossier rejeté" : "Dossier remis en revue";
    }
    case "transfer": {
      if (!ok) return "Transfert refusé";
      const transfer = WORLD.transfers.find((t) => t.id === row.relatedId);
      const to = GROUPS.find((g) => g.id === transfer?.toGroupId);
      if (transfer && to) {
        patchStudent(transfer.studentId, {
          groupId: to.id,
          campusId: to.campusId,
          schoolId: to.schoolId,
          programId: to.programId,
          level: to.level,
        });
        return `Élève déplacé vers ${to.name}`;
      }
      return "";
    }
    case "exclude": {
      if (!ok) return "Exclusion refusée";
      patchStudent(row.relatedId, { status: "dropped", exitedAt: today });
      return "Élève exclu";
    }
    case "unblock": {
      if (!ok) return "Réouverture refusée";
      patchStudent(row.relatedId, { status: "active", exitedAt: undefined });
      return "Élève réactivé";
    }
    case "admin": {
      if (!ok) return "Compte refusé";
      const campusId = CAMPUSES.find((c) => c.name === row.summary)?.id;
      addExtraAdmin({ name: row.subjectName, matricule: row.subjectRef, campusId });
      return "Compte administrateur activé";
    }
    case "teacher": {
      if (!ok) return "Candidature refusée";
      const campusId = CAMPUSES.find((c) => row.summary.includes(c.name.replace("Campus ", "")))?.id ?? "tas-alajo";
      addExtraTeacher({ name: row.subjectName, staffId: row.subjectRef, specialty: row.summary.split(",")[0] ?? "Anglais", campusId });
      return "Enseignant ajouté à l'équipe";
    }
  }
}

export type DecideOptions = { reason?: string; actor?: string };

/** Décide d'une demande : effet sur les données + trace dans le journal. */
export function setApprovalStatus(id: string, status: ApprovalStatus, options: DecideOptions = {}) {
  const row = liveApprovals().find((item) => item.id === id);
  if (!row) return;
  const actor = options.actor ?? "Fondateur TAS";
  const next: Approval = {
    ...row,
    status,
    decidedAt: status === "pending" ? undefined : nowLocalStamp(),
    decidedBy: status === "pending" ? undefined : actor,
    reason: options.reason?.trim() || row.reason,
  };
  writeApproval(next);
  const effect = applyDecision(next, actor);
  if (status !== "pending") {
    appendAudit({
      actor,
      type: "approval",
      action: status === "accepted" ? "Décision : accepté" : "Décision : refusé",
      detail: `${row.subjectName} · ${row.summary}${effect ? ` · ${effect}` : ""}${options.reason ? ` · ${options.reason.trim()}` : ""}`,
    });
  }
  return next;
}

export function addApproval(input: Omit<Approval, "id" | "status"> & { id?: string; status?: ApprovalStatus }): Approval {
  const existing = input.relatedId
    ? liveApprovals().find((row) => row.kind === input.kind && row.relatedId === input.relatedId && row.status === "pending")
    : undefined;
  if (existing) return existing;

  const row: Approval = {
    id: input.id ?? `ap-${input.kind}-${Date.now()}`,
    status: input.status ?? "pending",
    kind: input.kind,
    subjectName: input.subjectName,
    subjectRef: input.subjectRef,
    summary: input.summary,
    requestedBy: input.requestedBy,
    date: input.date,
    relatedId: input.relatedId,
    studentId: input.studentId,
  };
  if (row.status !== "pending") {
    row.decidedAt = nowLocalStamp();
    row.decidedBy = input.requestedBy;
  }
  writeApproval(row);
  if (row.status !== "pending") {
    const effect = applyDecision(row, input.requestedBy);
    appendAudit({
      actor: input.requestedBy,
      type: row.kind === "admin" ? "admin" : "approval",
      action: row.kind === "admin" ? "Administrateur créé" : "Décision enregistrée",
      detail: `${row.subjectName} · ${row.summary}${effect ? ` · ${effect}` : ""}`,
    });
  } else {
    appendAudit({
      actor: input.requestedBy,
      type: "approval",
      action: "Demande envoyée au fondateur",
      detail: `${row.subjectName} · ${row.summary}`,
    });
  }
  return row;
}

export function approvalHref(row: Approval): string {
  switch (row.kind) {
    case "transfer":
      return "/os/transfers";
    case "enroll":
    case "reject":
      return row.relatedId ? `/os/applications/${row.relatedId}` : "/os/applications";
    case "exclude":
    case "unblock":
      return row.relatedId ? `/os/students/${row.relatedId}` : "/os/students";
    case "admin":
      return "/os/ceo/team";
    case "teacher":
      return "/os/ceo/team";
  }
}
