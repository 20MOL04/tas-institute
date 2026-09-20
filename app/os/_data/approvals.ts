/**
 * File unique des décisions réservées au fondateur.
 * L'administration prépare ; elle n'accepte pas, ne refuse pas.
 */

import type { Role } from "./core";
import { GROUPS, PROGRAMS } from "./core";
import { APPLICATIONS, patchApplication } from "./growth";
import { PENDING_TRANSFERS, TRANSFERS } from "./ops";
import { STUDENTS, liveStudents, patchStudent } from "./people";
import { addExtraAdmin } from "./auth";
import { overlayById, readJson, writeJson } from "./persist";

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
};

function programName(programId: string) {
  return PROGRAMS.find((p) => p.id === programId)?.name ?? programId;
}

function groupName(groupId: string) {
  return GROUPS.find((g) => g.id === groupId)?.name ?? groupId;
}

function studentOf(id: string) {
  return liveStudents().find((s) => s.id === id) ?? STUDENTS.find((s) => s.id === id);
}

const approvedApps = APPLICATIONS.filter((a) => a.status === "approved");

function fromApplication(app: (typeof APPLICATIONS)[number], kind: "enroll" | "reject", id: string): Approval {
  return {
    id,
    kind,
    status: "pending",
    subjectName: app.name,
    subjectRef: app.ref,
    summary: programName(app.programId),
    requestedBy: app.assignee,
    date: app.submittedAt,
    relatedId: app.id,
  };
}

const excludeStudent = studentOf("s-008");
const unblockStudent = studentOf("s-015");

export const APPROVALS: Approval[] = [
  ...PENDING_TRANSFERS.map((t) => ({
    id: `ap-${t.id}`,
    kind: "transfer" as const,
    status: "pending" as const,
    subjectName: t.studentName,
    subjectRef: t.matricule,
    summary: `${groupName(t.fromGroupId)} vers ${groupName(t.toGroupId)}`,
    requestedBy: t.requestedBy,
    date: t.date,
    relatedId: t.id,
  })),
  ...approvedApps.slice(0, 2).map((app, i) => fromApplication(app, "enroll", `ap-enroll-${i + 1}`)),
  ...(approvedApps[2] ? [fromApplication(approvedApps[2], "reject", "ap-reject-01")] : []),
  {
    id: "ap-ex-01",
    kind: "exclude",
    status: "pending",
    subjectName: excludeStudent?.name ?? "Kwame Boateng",
    subjectRef: excludeStudent?.matricule ?? "TAS-26-0008",
    summary: "Absences répétées, demande de l'administration",
    requestedBy: "Administration",
    date: "2026-09-18",
    relatedId: excludeStudent?.id ?? "s-008",
  },
  {
    id: "ap-ub-01",
    kind: "unblock",
    status: "pending",
    subjectName: unblockStudent?.name ?? "Mariam Sow",
    subjectRef: unblockStudent?.matricule ?? "TAS-26-0015",
    summary: "Dossier réglé, demande de réouverture",
    requestedBy: "Administration",
    date: "2026-09-17",
    relatedId: unblockStudent?.id ?? "s-015",
  },
  {
    id: "ap-ad-01",
    kind: "admin",
    status: "pending",
    subjectName: "Abena Owusu",
    subjectRef: "ADM-26-0003",
    summary: "Campus Alajo",
    requestedBy: "Directrice TAS",
    date: "2026-09-16",
    relatedId: "",
  },
  {
    id: "ap-th-01",
    kind: "teacher",
    status: "pending",
    subjectName: "Kodjo Mensah",
    subjectRef: "ENS-26-0019",
    summary: "Anglais, campus Alajo",
    requestedBy: "Directrice TAS",
    date: "2026-09-15",
    relatedId: "",
  },
  {
    id: "ap-th-02",
    kind: "teacher",
    status: "pending",
    subjectName: "Salimata Cissé",
    subjectRef: "ENS-26-0020",
    summary: "Informatique, campus Kotobabi",
    requestedBy: "Administration",
    date: "2026-09-14",
    relatedId: "",
  },
];

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

function applyDecision(row: Approval) {
  if (row.status === "pending") return;
  if (row.kind === "enroll" || row.kind === "reject") {
    patchApplication(row.relatedId, { status: row.status === "accepted" ? "approved" : "rejected" });
  }
  if (row.kind === "transfer" && row.status === "accepted") {
    const transfer = TRANSFERS.find((t) => t.id === row.relatedId);
    if (transfer) patchStudent(transfer.studentId, { groupId: transfer.toGroupId });
  }
  if (row.kind === "exclude" && row.status === "accepted") {
    patchStudent(row.relatedId, { status: "dropped" });
  }
  if (row.kind === "unblock" && row.status === "accepted") {
    patchStudent(row.relatedId, { status: "active" });
  }
  if (row.kind === "admin" && row.status === "accepted") {
    addExtraAdmin({ name: row.subjectName, matricule: row.subjectRef });
  }
}

export function setApprovalStatus(id: string, status: ApprovalStatus) {
  const row = liveApprovals().find((item) => item.id === id);
  if (!row) return;
  const next = { ...row, status };
  writeApproval(next);
  applyDecision(next);
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
  };
  writeApproval(row);
  if (row.status !== "pending") applyDecision(row);
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
      return "/os/ceo/admins";
    case "teacher":
      return "/os/teachers";
  }
}
