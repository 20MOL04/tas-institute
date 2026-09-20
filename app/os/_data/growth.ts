/**
 * FICTIONAL acquisition data: traffic, sources, campaigns, leads, applications.
 *
 * The funnel is built so the numbers add up across screens: traffic totals feed
 * the funnel, the funnel feeds enrollments, enrollments feed revenue. Rates are
 * plausible for a language school, not flattering.
 */

import { PROGRAMS, TIMELINE, between, pick, rng, type Intake } from "./core";
import { COUNTRIES, LEAD_SOURCES } from "./people";
import { overlayById, readJson, writeJson } from "./persist";

/* ----- traffic by source -------------------------------------------------- */

export type SourceRow = {
  source: string;
  medium: string;
  visits: number;
  engaged: number;
  leads: number;
  qualified: number;
  applications: number;
  enrollments: number;
  revenue: number;
  spend: number | null;
};

/**
 * Deliberately uneven: TikTok brings the most visits and few students, referral
 * brings few visits and converts best. That contrast is the point of the screen.
 */
export const SOURCES: SourceRow[] = [
  { source: "Facebook", medium: "paid_social", visits: 6820, engaged: 2140, leads: 268, qualified: 141, applications: 78, enrollments: 41, revenue: 41 * 380000, spend: 2450000 },
  { source: "Instagram", medium: "paid_social", visits: 5410, engaged: 1980, leads: 233, qualified: 128, applications: 71, enrollments: 38, revenue: 38 * 395000, spend: 2130000 },
  { source: "TikTok", medium: "organic_social", visits: 9240, engaged: 1610, leads: 149, qualified: 52, applications: 24, enrollments: 9, revenue: 9 * 330000, spend: 480000 },
  { source: "Google", medium: "organic_search", visits: 3180, engaged: 1490, leads: 176, qualified: 112, applications: 69, enrollments: 37, revenue: 37 * 410000, spend: null },
  { source: "YouTube", medium: "organic_social", visits: 1460, engaged: 520, leads: 54, qualified: 27, applications: 14, enrollments: 6, revenue: 6 * 360000, spend: 190000 },
  { source: "WhatsApp", medium: "messaging", visits: 2270, engaged: 1310, leads: 214, qualified: 158, applications: 96, enrollments: 58, revenue: 58 * 405000, spend: null },
  { source: "Bouche-à-oreille", medium: "referral", visits: 890, engaged: 640, leads: 132, qualified: 114, applications: 88, enrollments: 62, revenue: 62 * 430000, spend: null },
  { source: "Ancien étudiant", medium: "referral", visits: 610, engaged: 470, leads: 98, qualified: 88, applications: 71, enrollments: 54, revenue: 54 * 435000, spend: null },
  { source: "Walk-in", medium: "offline", visits: 0, engaged: 0, leads: 87, qualified: 79, applications: 64, enrollments: 46, revenue: 46 * 420000, spend: null },
  { source: "Agent", medium: "partner", visits: 240, engaged: 160, leads: 61, qualified: 49, applications: 34, enrollments: 21, revenue: 21 * 390000, spend: 620000 },
  { source: "Direct", medium: "direct", visits: 2640, engaged: 980, leads: 96, qualified: 54, applications: 29, enrollments: 14, revenue: 14 * 375000, spend: null },
];

export const TRAFFIC_TOTALS = SOURCES.reduce(
  (acc, s) => ({
    visits: acc.visits + s.visits,
    engaged: acc.engaged + s.engaged,
    leads: acc.leads + s.leads,
    qualified: acc.qualified + s.qualified,
    applications: acc.applications + s.applications,
    enrollments: acc.enrollments + s.enrollments,
    revenue: acc.revenue + s.revenue,
    spend: acc.spend + (s.spend ?? 0),
  }),
  { visits: 0, engaged: 0, leads: 0, qualified: 0, applications: 0, enrollments: 0, revenue: 0, spend: 0 },
);

/* ----- monthly series ----------------------------------------------------- */

export type Series = { label: string; values: number[] };

/** Seasonality: peaks before the October and January intakes, trough in August. */
const SEASON = [1.18, 0.74, 0.69, 0.82, 0.88, 0.93, 0.86, 0.71, 1.06, 1.31, 1.12, 0.95];

export const MONTHLY = {
  labels: TIMELINE.map((t) => t.label),
  visitors: TIMELINE.map((_, i) => Math.round(2350 * SEASON[i] + i * 58)),
  leads: TIMELINE.map((_, i) => Math.round(126 * SEASON[i] + i * 2.4)),
  applications: TIMELINE.map((_, i) => Math.round(58 * SEASON[i] + i * 1.1)),
  enrollments: TIMELINE.map((_, i) => Math.round(31 * SEASON[i] + i * 0.7)),
  revenue: TIMELINE.map((_, i) => Math.round((31 * SEASON[i] + i * 0.7) * 398000)),
  students: TIMELINE.map((_, i) => 168 + Math.round(i * 7.4 + SEASON[i] * 6)),
};

/* ----- campaigns ---------------------------------------------------------- */

export type Campaign = {
  id: string;
  name: string;
  channel: string;
  objective: string;
  start: string;
  end: string;
  status: "active" | "paused" | "ended";
  spend: number;
  impressions: number;
  clicks: number;
  leads: number;
  applications: number;
  enrollments: number;
  revenue: number;
  creative: string;
  utm: string;
};

export const CAMPAIGNS: Campaign[] = [
  { id: "c-01", name: "Rentrée Octobre — Intensif", channel: "Facebook", objective: "Leads", start: "2026-08-01", end: "2026-10-05", status: "active", spend: 1240000, impressions: 186000, clicks: 4120, leads: 148, applications: 47, enrollments: 26, revenue: 26 * 430000, creative: "Creative 05 — témoignage", utm: "utm_source=facebook&utm_medium=paid_social&utm_campaign=rentree_oct_2026&utm_content=creative_05" },
  { id: "c-02", name: "Rentrée Octobre — Reels", channel: "Instagram", objective: "Leads", start: "2026-08-01", end: "2026-10-05", status: "active", spend: 980000, impressions: 152000, clicks: 3480, leads: 121, applications: 39, enrollments: 21, revenue: 21 * 415000, creative: "Reel 03 — journée à TAS", utm: "utm_source=instagram&utm_medium=paid_social&utm_campaign=rentree_oct_2026&utm_content=reel_03" },
  { id: "c-03", name: "Accra English — TikTok", channel: "TikTok", objective: "Notoriété", start: "2026-07-15", end: "2026-09-30", status: "active", spend: 480000, impressions: 421000, clicks: 6900, leads: 84, applications: 14, enrollments: 5, revenue: 5 * 330000, creative: "Video 02 — avant/après", utm: "utm_source=tiktok&utm_medium=paid_social&utm_campaign=accra_english&utm_content=video_02" },
  { id: "c-04", name: "Informatique — Janvier", channel: "Facebook", objective: "Leads", start: "2026-09-01", end: "2026-12-20", status: "active", spend: 310000, impressions: 48000, clicks: 1140, leads: 52, applications: 18, enrollments: 8, revenue: 8 * 180000, creative: "Creative 09 — modules", utm: "utm_source=facebook&utm_medium=paid_social&utm_campaign=informatique_jan_2027&utm_content=creative_09" },
  { id: "c-05", name: "Logement étudiant", channel: "Instagram", objective: "Trafic", start: "2026-06-01", end: "2026-07-31", status: "ended", spend: 220000, impressions: 61000, clicks: 1880, leads: 44, applications: 11, enrollments: 4, revenue: 4 * 390000, creative: "Carrousel 02 — chambres", utm: "utm_source=instagram&utm_medium=paid_social&utm_campaign=logement&utm_content=carousel_02" },
  { id: "c-06", name: "Partenariat agents CI", channel: "Agent", objective: "Inscriptions", start: "2026-05-01", end: "2026-12-31", status: "active", spend: 620000, impressions: 0, clicks: 240, leads: 61, applications: 34, enrollments: 21, revenue: 21 * 390000, creative: "Brochure agents", utm: "utm_source=agent&utm_medium=partner&utm_campaign=agents_ci&utm_content=brochure" },
  { id: "c-07", name: "YouTube — visite du campus", channel: "YouTube", objective: "Notoriété", start: "2026-04-01", end: "2026-09-30", status: "paused", spend: 190000, impressions: 74000, clicks: 1460, leads: 54, applications: 14, enrollments: 6, revenue: 6 * 360000, creative: "Tour du campus 4:12", utm: "utm_source=youtube&utm_medium=organic_social&utm_campaign=campus_tour&utm_content=video_01" },
];

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
};

const OWNERS = ["Administration", "Directrice TAS", "Admissions"];
const NOTES = [
  "Souhaite commencer en janvier, demande les tarifs.",
  "Veut le programme intensif, niveau débutant.",
  "Demande s'il reste des places en informatique.",
  "A besoin d'une attestation pour le visa.",
  "Cherche un logement climatisé pour 4 mois.",
  "Compare avec une école à Kumasi.",
  "Arrive d'Abidjan le mois prochain.",
  "Ne répond plus depuis trois relances.",
  "Documents incomplets : pièce d'identité manquante.",
  "Parent qui inscrit son fils, veut visiter le campus.",
];

const STAGE_WEIGHTS: [LeadStage, number][] = [
  ["new", 18],
  ["contacted", 16],
  ["qualified", 14],
  ["visit", 8],
  ["application", 12],
  ["approved", 8],
  ["enrolled", 9],
  ["paid", 7],
  ["lost", 14],
];

function weightedStage(r: () => number): LeadStage {
  const total = STAGE_WEIGHTS.reduce((s, [, w]) => s + w, 0);
  let x = r() * total;
  for (const [stage, w] of STAGE_WEIGHTS) {
    x -= w;
    if (x <= 0) return stage;
  }
  return "new";
}

export const LEADS: Lead[] = Array.from({ length: 96 }, (_, i) => {
  const r = rng(2200 + i * 11);
  const first = pick(["Aminata", "Ibrahim", "Fatou", "Moussa", "Awa", "Kwame", "Mariam", "Amadou", "Adjoa", "Souleymane", "Bintou", "Kofi"], r);
  const last = pick(["Diallo", "Traoré", "Mensah", "Koné", "Asante", "Sow", "Cissé", "Boateng", "Ndiaye", "Sylla"], r);
  const name = `${first} ${last}`;
  const country = COUNTRIES[Math.floor(r() * COUNTRIES.length)];
  const source = pick(LEAD_SOURCES, r);
  const stage = weightedStage(r);
  const day = between(r, 1, 19);
  const overdue = stage !== "paid" && stage !== "lost" && r() > 0.72;

  return {
    id: `l-${String(i + 1).padStart(3, "0")}`,
    name,
    initials: `${first[0]}${last[0]}`,
    phone: `+233 5${between(r, 10, 99)} ${between(r, 100, 999)} ${between(r, 100, 999)}`,
    country: country.name,
    countryCode: country.code,
    source,
    campaign: ["Facebook", "Instagram", "TikTok", "YouTube", "Agent"].includes(source)
      ? pick(CAMPAIGNS.map((c) => c.name), r)
      : null,
    programId: pick(PROGRAMS.filter((p) => p.schoolId === "tas").map((p) => p.id), r),
    stage,
    owner: pick(OWNERS, r),
    createdAt: `2026-09-${String(day).padStart(2, "0")}`,
    lastContact: `2026-09-${String(Math.min(19, day + between(r, 0, 3))).padStart(2, "0")}`,
    nextFollowUp: stage === "paid" || stage === "lost" ? null : `2026-09-${String(between(r, 16, 28)).padStart(2, "0")}`,
    overdue,
    note: pick(NOTES, r),
  };
});

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
}): Lead {
  const extra = readExtraLeads();
  const n = LEADS.length + extra.length + 1;
  const parts = input.name.trim().split(/\s+/);
  const first = parts[0] ?? "D";
  const last = parts[1] ?? parts[0] ?? "D";
  const today = new Date().toISOString().slice(0, 10);
  const lead: Lead = {
    id: `l-live-${Date.now()}`,
    name: input.name.trim(),
    initials: `${first[0] ?? "D"}${last[0] ?? "D"}`.toUpperCase(),
    phone: input.phone.trim(),
    country: input.country,
    countryCode: "",
    source: input.source ?? "Formulaire",
    campaign: null,
    programId: input.programId,
    stage: "new",
    owner: "Administration",
    createdAt: today,
    lastContact: today,
    nextFollowUp: today,
    overdue: false,
    note: input.note,
  };
  extra.unshift(lead);
  writeJson(EXTRA_LEADS_KEY, extra, LEADS_CHANGED);
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
    lastContact: patch.lastContact ?? new Date().toISOString().slice(0, 10),
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
};

const DOCS = ["Pièce d'identité", "Photo d'identité", "Diplôme", "Justificatif de paiement", "Formulaire signé"];

export const APPLICATIONS: Application[] = Array.from({ length: 64 }, (_, i) => {
  const r = rng(5100 + i * 13);
  const first = pick([...["Aminata", "Ibrahim", "Fatou", "Moussa", "Awa", "Kwame", "Mariam", "Amadou"]], r);
  const last = pick(["Diallo", "Traoré", "Mensah", "Koné", "Asante", "Sow", "Cissé", "Boateng"], r);
  const roll = r();
  const status: ApplicationStatus =
    roll > 0.9 ? "rejected" : roll > 0.72 ? "enrolled" : roll > 0.55 ? "approved" : roll > 0.34 ? "documents" : roll > 0.16 ? "reviewing" : "new";
  const missing = status === "documents" ? DOCS.filter(() => r() > 0.6).slice(0, 2) : [];
  const program = pick(PROGRAMS.filter((p) => p.schoolId === "tas"), r);

  return {
    id: `a-${String(i + 1).padStart(3, "0")}`,
    ref: `CAND-26-${String(i + 101).padStart(4, "0")}`,
    name: `${first} ${last}`,
    initials: `${first[0]}${last[0]}`,
    country: COUNTRIES[Math.floor(r() * COUNTRIES.length)].name,
    programId: program.id,
    campusId: program.id === "computer" ? "tas-kotobabi" : "tas-alajo",
    intakeId: r() > 0.3 ? "in-2026-10-eng-int" : "in-2027-01-eng-int",
    source: pick(LEAD_SOURCES, r),
    status,
    submittedAt: `2026-09-${String(between(r, 1, 19)).padStart(2, "0")}`,
    assignee: pick(OWNERS, r),
    missingDocs: missing.length ? missing : status === "documents" ? [DOCS[0]] : [],
  };
});

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
