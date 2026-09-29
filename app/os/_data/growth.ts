/**
 * Acquisition data: demandes (leads) and dossiers (applications).
 *
 * The records come from the seeded world (see world.ts): every enrolled student
 * has a dossier and a demande behind them, so funnels add up across screens.
 */

import { PROGRAMS, TIMELINE, type Intake } from "./core";
import { WORLD } from "./world";
import { appendAudit } from "./audit";
import { overlayById, readJson, writeJson } from "./persist";
import { localIso } from "../_lib/dates";
import { type CourseDurationMonths } from "../../lib/course-duration";
import { INTAKES } from "./groups";

/* ----- leads and applications -------------------------------------------- */

export type LeadStage =
  | "new"
  | "contacted"
  | "qualified"
  | "visit"
  | "application"
  | "approved"
  | "enrolled"
  | "paid"
  | "lost";

export const LEAD_STAGES: { key: LeadStage; label: string }[] = [
  { key: "new", label: "Nouveau" },
  { key: "contacted", label: "Contacté" },
  { key: "qualified", label: "Qualifié" },
  { key: "visit", label: "Visite" },
  { key: "application", label: "Candidature" },
  { key: "approved", label: "Accepté" },
  { key: "enrolled", label: "Inscrit" },
  { key: "paid", label: "Payé" },
  { key: "lost", label: "Perdu" },
];

export type Lead = {
  id: string;
  name: string;
  initials: string;
  phone: string;
  country: string;
  countryCode: string;
  source: string;
  campaign: string | null;
  programId: string;
  stage: LeadStage;
  owner: string;
  createdAt: string;
  lastContact: string;
  nextFollowUp: string | null;
  overdue: boolean;
  note: string;
  durationMonths: CourseDurationMonths;
  campusId?: string;
  applicationId?: string;
  studentId?: string;
};

export const LEADS: Lead[] = WORLD.leads;

export function leadsByStage(stage: LeadStage) {
  return LEADS.filter((l) => l.stage === stage);
}

export function leadSourceLabel(source: string) {
  return source === "Direct" ? "Formulaire" : source;
}

export function isFormLead(source: string) {
  return source === "Formulaire" || source === "Direct" || source === "Contact";
}

export function isWhatsAppLead(source: string) {
  return source === "WhatsApp";
}

const EXTRA_LEADS_KEY = "tas-os-extra-leads";
export const LEADS_CHANGED = "tas-leads-changed";

export function programIdFromApplySlug(value: string) {
  const v = value.toLowerCase();
  if (v.includes("long") || v.includes("longue")) return "eng-long";
  if (v.includes("computer") || v.includes("informatique")) return "computer";
  return "eng-intensive";
}

export function readExtraLeads(): Lead[] {
  return readJson<Lead[]>(EXTRA_LEADS_KEY, []);
}

export function addLead(input: {
  name: string;
  phone: string;
  country: string;
  programId: string;
  note: string;
  source?: string;
  durationMonths?: CourseDurationMonths;
}): Lead {
  const extra = readExtraLeads();
  const parts = input.name.trim().split(/\s+/);
  const first = parts[0] ?? "D";
  const last = parts[1] ?? parts[0] ?? "D";
  const today = localIso();
  const lead: Lead = {
    id: `l-live-${Date.now()}`,
    name: input.name.trim(),
    initials: `${first[0] ?? "D"}${last[0] ?? "D"}`.toUpperCase(),
    phone: input.phone.trim(),
    country: input.country,
    countryCode: "",
    source: input.source ?? "Formulaire",
    campaign: null,
    campusId: PROGRAMS.find((p) => p.id === input.programId)?.id === "computer" ? "tas-kotobabi" : "tas-alajo",
    programId: input.programId,
    stage: "new",
    owner: "Administration",
    createdAt: today,
    lastContact: today,
    nextFollowUp: today,
    overdue: false,
    note: input.note,
    durationMonths: input.durationMonths ?? 3,
  };
  extra.unshift(lead);
  writeJson(EXTRA_LEADS_KEY, extra, LEADS_CHANGED);
  appendAudit({ actor: "Administration", type: "lead", action: "Demande reçue", detail: `${lead.name} · ${lead.source}`, href: `/os/crm/${lead.id}` });
  return lead;
}

export function liveLeads(): Lead[] {
  return overlayById(LEADS, readExtraLeads());
}

export function updateLead(id: string, patch: Partial<Lead>): Lead | undefined {
  const extra = readExtraLeads();
  const idx = extra.findIndex((row) => row.id === id);
  const base = idx >= 0 ? extra[idx] : LEADS.find((row) => row.id === id);
  if (!base) return undefined;
  const next: Lead = {
    ...base,
    ...patch,
    lastContact: patch.lastContact ?? localIso(),
  };
  if (idx >= 0) extra[idx] = next;
  else extra.unshift(next);
  writeJson(EXTRA_LEADS_KEY, extra, LEADS_CHANGED);
  return next;
}

/* ----- applications ------------------------------------------------------- */

export type ApplicationStatus = "new" | "reviewing" | "documents" | "approved" | "enrolled" | "rejected";

export type Application = {
  id: string;
  ref: string;
  name: string;
  initials: string;
  country: string;
  programId: string;
  campusId: string;
  intakeId: string;
  source: string;
  status: ApplicationStatus;
  submittedAt: string;
  assignee: string;
  missingDocs: string[];
  durationMonths: CourseDurationMonths;
  leadId?: string;
  studentId?: string;
};

export const APPLICATIONS: Application[] = WORLD.applications;

export function applicationsByStatus(status: ApplicationStatus) {
  return liveApplications().filter((a) => a.status === status);
}

const EXTRA_APPS_KEY = "tas-os-extra-applications";
export const APPLICATIONS_CHANGED = "tas-applications-changed";

export function readExtraApplications(): Application[] {
  return readJson<Application[]>(EXTRA_APPS_KEY, []);
}

export function liveApplications(): Application[] {
  return overlayById(APPLICATIONS, readExtraApplications());
}

export function addApplication(input: {
  name: string;
  country: string;
  programId: string;
  durationMonths: CourseDurationMonths;
  source?: string;
}): Application {
  const extra = readExtraApplications();
  const n = APPLICATIONS.length + extra.length + 101;
  const ref = `CAND-${localIso().slice(2, 4)}-${String(n).padStart(4, "0")}`;
  const parts = input.name.trim().split(/\s+/);
  const first = parts[0] ?? "C";
  const last = parts[1] ?? parts[0] ?? "C";
  const program = PROGRAMS.find((p) => p.id === input.programId);
  const today = localIso();
  const application: Application = {
    id: `a-live-${Date.now()}`,
    ref,
    name: input.name.trim(),
    initials: `${first[0] ?? "C"}${last[0] ?? "C"}`.toUpperCase(),
    country: input.country,
    programId: input.programId,
    campusId: program?.id === "computer" ? "tas-kotobabi" : "tas-alajo",
    intakeId: upcomingIntake(input.programId),
    source: input.source ?? "Formulaire",
    status: "new",
    submittedAt: today,
    assignee: "Administration",
    missingDocs: [],
    durationMonths: input.durationMonths,
  };
  extra.unshift(application);
  writeJson(EXTRA_APPS_KEY, extra, APPLICATIONS_CHANGED);
  return application;
}

function upcomingIntake(programId: string): string {
  const today = localIso();
  const list = INTAKES.filter((i) => i.programId === programId && i.end >= today).sort((a, b) => (a.start < b.start ? -1 : 1));
  return (list.find((i) => i.start >= today) ?? list[0] ?? INTAKES[0])?.id ?? "";
}

export function patchApplication(id: string, patch: Partial<Application>): Application | undefined {
  const extra = readExtraApplications();
  const idx = extra.findIndex((row) => row.id === id);
  const base = idx >= 0 ? extra[idx] : APPLICATIONS.find((row) => row.id === id);
  if (!base) return undefined;
  const next = { ...base, ...patch };
  if (idx >= 0) extra[idx] = next;
  else extra.unshift(next);
  writeJson(EXTRA_APPS_KEY, extra, APPLICATIONS_CHANGED);
  return next;
}

/* ----- intake helpers ----------------------------------------------------- */

export function fillRate(intake: Intake) {
  return (intake.enrolled / intake.capacity) * 100;
}


/* ----- calendar-year series (Bureau screens) ------------------------------- */

const yearKey = (i: number) => `${localIso().slice(0, 4)}-${String(i + 1).padStart(2, "0")}`;

/** Monthly series of the current calendar year, counted from the real records. */
const SEASON = [1.18, 0.74, 0.69, 0.82, 0.88, 0.93, 0.86, 0.71, 1.06, 1.31, 1.12, 0.95];

export const MONTHLY = {
  labels: TIMELINE.map((t) => t.label),
  /** Site visits: analytics mock (Back office only). */
  visitors: TIMELINE.map((_, i) => Math.round(2350 * SEASON[i] + i * 58)),
  leads: TIMELINE.map((_, i) => WORLD.leads.filter((l) => l.createdAt.startsWith(yearKey(i))).length),
  applications: TIMELINE.map((_, i) => WORLD.applications.filter((a) => a.submittedAt.startsWith(yearKey(i))).length),
  enrollments: TIMELINE.map((_, i) => WORLD.students.filter((s) => s.status !== "applicant" && s.enrolledAt.startsWith(yearKey(i))).length),
  revenue: TIMELINE.map((_, i) => WORLD.payments.filter((p) => p.date.startsWith(yearKey(i))).reduce((sum, p) => sum + p.amount, 0)),
  students: TIMELINE.map((_, i) => {
    const end = `${yearKey(i)}-31`;
    return WORLD.students.filter((s) => s.status !== "applicant" && s.enrolledAt <= end && (!s.exitedAt || s.exitedAt > end)).length;
  }),
};
