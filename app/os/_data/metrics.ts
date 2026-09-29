/**
 * SELECTORS — the single source of truth for every number of the founder space.
 *
 * Each function takes the repository snapshot, a date range (whole days, inclusive)
 * and a campus filter, and returns figures computed from the records. The dashboard,
 * Finances, Rapports and the bell all call the same functions, so they agree to the franc.
 *
 * Definitions (also shown in the UI):
 *  - Élèves actifs      : inscrits (hors candidats) qui n'ont pas quitté la formation à la date.
 *  - Encaissé           : somme des paiements enregistrés dans la période.
 *  - Attendu            : somme des échéances dont la date tombe dans la période.
 *  - Reste à recouvrer  : total dû moins total payé, à la date de fin (tous élèves hors candidats).
 *  - Remplissage        : places prises / places des sessions en cours ou ouvertes aux inscriptions.
 *  - Conversion         : parmi les demandes reçues dans la période, part devenue élève inscrit.
 *  - Présence           : présents / (présents + absents) sur les feuilles d'appel de la période.
 *  - Élève en danger    : élève en formation dont la présence est sous le seuil, ou avec un impayé
 *                         échu depuis le seuil de jours (Paramètres).
 */

import type { Snapshot } from "./repo";
import type { Application, Lead } from "./growth";
import type { Intake } from "./core";
import type { Payment } from "./ops";
import type { Student } from "./people";
import { overdueAt, installments } from "./finance";
import {
  addDays,
  addMonths,
  daysBetween,
  dayNum,
  fmtDay,
  fmtMonthShort,
  fmtMonthYear,
  fmtWeekdayDay,
  monthEnd,
  monthStart,
  weekStart,
  weekday,
} from "../_lib/dates";
import { getDateRange, type Period } from "../_lib/period";

export type Range = { start: string; end: string };
export type CampusFilter = string;

/* ----- ranges and buckets --------------------------------------------------- */

function firstDate(snap: Snapshot): string {
  let min = snap.today;
  for (const s of snap.students) if (s.enrolledAt.slice(0, 10) < min) min = s.enrolledAt.slice(0, 10);
  for (const l of snap.leads) if (l.createdAt < min) min = l.createdAt;
  return min;
}

/** Plage en jours entiers pour une période, bornée à aujourd'hui. */
export function resolveRange(period: Period, snap: Snapshot, customStart?: string, customEnd?: string): Range {
  const r = getDateRange(period, customStart, customEnd);
  let { start, end } = r;
  if (period === "all") start = firstDate(snap);
  if (end > snap.today) end = snap.today;
  if (start > end) start = end;
  return { start, end };
}

/** Période équivalente juste avant (même durée, ou même durée calendaire décalée). null = pas de comparaison. */
export function previousRange(range: Range, period: Period): Range | null {
  if (period === "all") return null;
  const shifts: Partial<Record<Period, number>> = { thisMonth: 1, lastMonth: 1, thisQuarter: 3, thisYear: 12, lastYear: 12 };
  let k = shifts[period];
  const aligned = range.start.endsWith("-01");
  if (k === undefined && aligned && range.end === monthEnd(range.end)) {
    const months = (Number(range.end.slice(0, 4)) - Number(range.start.slice(0, 4))) * 12 + Number(range.end.slice(5, 7)) - Number(range.start.slice(5, 7)) + 1;
    if (months >= 1) k = months;
  }
  if (k !== undefined && aligned) {
    const start = addMonths(range.start, -k);
    const end = range.end === monthEnd(range.end) ? monthEnd(addMonths(range.end, -k)) : addMonths(range.end, -k);
    return { start, end };
  }
  const len = daysBetween(range.start, range.end) + 1;
  const end = addDays(range.start, -1);
  return { start: addDays(end, -(len - 1)), end };
}

export function previousLabel(period: Period): string {
  return period === "thisYear" || period === "lastYear" ? "année précédente" : "période précédente";
}

export type Bucket = { key: string; label: string; long: string; start: string; end: string };
export type Buckets = { unit: "day" | "week" | "month"; items: Bucket[]; indexOf: (iso: string) => number };

/** Fenêtre du graphique : au moins 7 jours pour qu'un « aujourd'hui » ne soit pas une barre seule. */
export function chartWindow(range: Range): Range {
  const len = daysBetween(range.start, range.end) + 1;
  if (len >= 7) return range;
  return { start: addDays(range.end, -6), end: range.end };
}

export function makeBuckets(range: Range): Buckets {
  const days = daysBetween(range.start, range.end) + 1;
  const items: Bucket[] = [];
  if (days <= 31) {
    for (let i = 0; i < days; i++) {
      const d = addDays(range.start, i);
      items.push({ key: d, label: days <= 8 ? fmtWeekdayDay(d) : String(Number(d.slice(8))), long: fmtDay(d), start: d, end: d });
    }
    const s0 = dayNum(range.start);
    return { unit: "day", items, indexOf: (iso) => dayNum(iso) - s0 };
  }
  if (days <= 100) {
    let cur = weekStart(range.start);
    while (cur <= range.end) {
      const s = cur < range.start ? range.start : cur;
      const eNat = addDays(cur, 6);
      const e = eNat > range.end ? range.end : eNat;
      items.push({ key: cur, label: fmtDay(s), long: `Semaine du ${fmtDay(s)} au ${fmtDay(e)}`, start: s, end: e });
      cur = addDays(cur, 7);
    }
    const w0 = dayNum(weekStart(range.start));
    return { unit: "week", items, indexOf: (iso) => Math.floor((dayNum(iso) - w0) / 7) };
  }
  let cur = monthStart(range.start);
  const yearsSpan = Number(range.end.slice(0, 4)) - Number(range.start.slice(0, 4));
  while (cur <= range.end) {
    const s = cur < range.start ? range.start : cur;
    const eNat = monthEnd(cur);
    const e = eNat > range.end ? range.end : eNat;
    const label = yearsSpan >= 1 ? `${fmtMonthShort(cur)} ${cur.slice(2, 4)}` : fmtMonthShort(cur);
    items.push({ key: cur.slice(0, 7), label, long: fmtMonthYear(cur), start: s, end: e });
    cur = addMonths(cur, 1);
  }
  const m0 = Number(range.start.slice(0, 4)) * 12 + Number(range.start.slice(5, 7));
  return { unit: "month", items, indexOf: (iso) => Number(iso.slice(0, 4)) * 12 + Number(iso.slice(5, 7)) - m0 };
}

/** Aligne les seaux de la période précédente sur ceux de la période courante (par rang). */
export function previousBuckets(cur: Buckets, prevWindow: Range | null): Bucket[] | null {
  if (!prevWindow) return null;
  const p = makeBuckets(prevWindow);
  return cur.items.map((_, i) => p.items[i] ?? null) as Bucket[];
}

const inR = (day: string, r: Range) => day >= r.start && day <= r.end;

/* ----- scoped model (cached per snapshot) ----------------------------------- */

type Info = { begin: string; leftAt: string | null; perWeek: number };

type Model = {
  info: Map<string, Info>;
  expected: { date: string; amount: number; campusId: string; studentId: string }[];
  scoped: Map<string, Student[]>;
};

const MODELS = new WeakMap<Snapshot, Model>();

function model(snap: Snapshot): Model {
  const known = MODELS.get(snap);
  if (known) return known;
  const info = new Map<string, Info>();
  const expected: Model["expected"] = [];
  for (const s of snap.students) {
    const enrolled = s.enrolledAt.slice(0, 10);
    const start = snap.sessionById.get(s.intakeId)?.start ?? enrolled;
    const begin = enrolled > start ? enrolled : start;
    let leftAt: string | null = null;
    if (s.status === "completed") leftAt = addDays(addMonths(start, s.durationMonths), -1);
    else if (s.status === "dropped" || s.status === "paused") leftAt = s.exitedAt ?? enrolled;
    info.set(s.id, { begin, leftAt, perWeek: s.programId === "abla-business" ? 4 : 5 });
    if (s.status !== "applicant") {
      for (const i of installments(s)) expected.push({ date: i.date, amount: i.amount, campusId: s.campusId, studentId: s.id });
    }
  }
  const m: Model = { info, expected, scoped: new Map() };
  MODELS.set(snap, m);
  return m;
}

export function studentsIn(snap: Snapshot, campus: CampusFilter): Student[] {
  if (campus === "all") return snap.students;
  const m = model(snap);
  let list = m.scoped.get(campus);
  if (!list) {
    list = snap.students.filter((s) => s.campusId === campus);
    m.scoped.set(campus, list);
  }
  return list;
}

function leadCampus(l: Lead): string {
  return l.campusId ?? (l.programId === "computer" ? "tas-kotobabi" : l.programId === "abla-business" ? "abla-osu" : "tas-alajo");
}

const okCampus = (campus: CampusFilter, id: string) => campus === "all" || id === campus;

export function studentInfo(snap: Snapshot, s: Student): Info {
  return model(snap).info.get(s.id) ?? { begin: s.enrolledAt.slice(0, 10), leftAt: null, perWeek: 5 };
}

/** Inscrit à la date et pas encore parti (hors candidats en attente de validation). */
export function enrolledOn(snap: Snapshot, s: Student, day: string): boolean {
  if (s.status === "applicant") return false;
  if (s.enrolledAt.slice(0, 10) > day) return false;
  const left = studentInfo(snap, s).leftAt;
  return left === null || day <= left;
}

function paidUpTo(snap: Snapshot, studentId: string, day: string): number {
  const list = snap.paymentsByStudent.get(studentId);
  if (!list) return 0;
  let sum = 0;
  for (const p of list) if (p.date <= day) sum += p.amount;
  return sum;
}

/* ----- attendance per student ------------------------------------------------ */

function schoolDays(a: string, b: string, perWeek: number, holidays: string[]): number {
  if (b < a) return 0;
  const total = daysBetween(a, b) + 1;
  let count = Math.floor(total / 7) * perWeek;
  const rest = total % 7;
  for (let i = 0; i < rest; i++) if (weekday(addDays(a, i + Math.floor(total / 7) * 7)) < perWeek) count += 1;
  for (const h of holidays) if (h >= a && h <= b && weekday(h) < perWeek) count -= 1;
  return count;
}

/** Taux de présence de l'élève à une date (null tant qu'il a moins de 5 jours de cours). */
export function attendanceRateOn(snap: Snapshot, s: Student, day: string): number | null {
  const i = studentInfo(snap, s);
  if (i.begin > day) return null;
  const stop = i.leftAt && i.leftAt < day ? i.leftAt : day;
  const total = schoolDays(i.begin, stop, i.perWeek, snap.holidays);
  if (total < 5) return null;
  const abs = snap.absences[s.id];
  let absent = 0;
  if (abs) for (const d of abs) if (d <= stop) absent += 1;
  return Math.max(0, Math.round(((total - absent) / total) * 100));
}

/* ----- stocks and flows ------------------------------------------------------ */

export function activeCount(snap: Snapshot, campus: CampusFilter, day: string): number {
  let n = 0;
  for (const s of studentsIn(snap, campus)) if (enrolledOn(snap, s, day)) n += 1;
  return n;
}

export function newEnrollments(snap: Snapshot, campus: CampusFilter, r: Range): number {
  let n = 0;
  for (const s of studentsIn(snap, campus)) {
    if (s.status !== "applicant" && inR(s.enrolledAt.slice(0, 10), r)) n += 1;
  }
  return n;
}

export function paymentsIn(snap: Snapshot, campus: CampusFilter, r: Range): Payment[] {
  const out: Payment[] = [];
  for (const p of snap.payments) if (inR(p.date, r) && okCampus(campus, p.campusId)) out.push(p);
  return out;
}

export function collected(snap: Snapshot, campus: CampusFilter, r: Range): number {
  let sum = 0;
  for (const p of snap.payments) if (inR(p.date, r) && okCampus(campus, p.campusId)) sum += p.amount;
  return sum;
}

export function expectedIn(snap: Snapshot, campus: CampusFilter, r: Range): number {
  let sum = 0;
  for (const e of model(snap).expected) if (inR(e.date, r) && okCampus(campus, e.campusId)) sum += e.amount;
  return sum;
}

export function outstandingOn(snap: Snapshot, campus: CampusFilter, day: string): { amount: number; students: number } {
  let amount = 0;
  let students = 0;
  for (const s of studentsIn(snap, campus)) {
    if (s.status === "applicant" || s.enrolledAt.slice(0, 10) > day) continue;
    const due = s.feeTotal - paidUpTo(snap, s.id, day);
    if (due > 0) {
      amount += due;
      students += 1;
    }
  }
  return { amount, students };
}

export function payersIn(snap: Snapshot, campus: CampusFilter, r: Range): number {
  const seen = new Set<string>();
  for (const p of snap.payments) if (inR(p.date, r) && okCampus(campus, p.campusId)) seen.add(p.studentId);
  return seen.size;
}

export function attendanceIn(snap: Snapshot, campus: CampusFilter, r: Range): { rate: number | null; present: number; absent: number } {
  let present = 0;
  let absent = 0;
  for (const row of snap.attendance) {
    if (!inR(row.date, r)) continue;
    if (campus !== "all" && snap.groupById.get(row.groupId)?.campusId !== campus) continue;
    present += row.present;
    absent += row.absent;
  }
  return { rate: present + absent === 0 ? null : (present / (present + absent)) * 100, present, absent };
}

/* ----- sessions fill ---------------------------------------------------------- */

/** Sessions comptées dans le remplissage : en cours, ou qui commencent dans les 60 jours. */
export function fillSessions(snap: Snapshot, campus: CampusFilter, day: string): Intake[] {
  const horizon = addDays(day, 60);
  return snap.sessions.filter((i) => i.end >= day && i.start <= horizon && okCampus(campus, i.campusId));
}

function seatedOn(s: Student, day: string): boolean {
  if (s.status === "applicant") return false;
  if (s.enrolledAt.slice(0, 10) > day) return false;
  if ((s.status === "dropped" || s.status === "paused") && (s.exitedAt ?? "") <= day) return false;
  return true;
}

export type FillRow = { session: Intake; taken: number; capacity: number; pct: number };

export function fillOn(snap: Snapshot, campus: CampusFilter, day: string): { pct: number | null; taken: number; capacity: number; rows: FillRow[] } {
  const sessions = fillSessions(snap, campus, day);
  const takenBy = new Map<string, number>();
  const ids = new Set(sessions.map((s) => s.id));
  for (const s of snap.students) if (ids.has(s.intakeId) && seatedOn(s, day)) takenBy.set(s.intakeId, (takenBy.get(s.intakeId) ?? 0) + 1);
  let taken = 0;
  let capacity = 0;
  const rows = sessions.map((session) => {
    const t = takenBy.get(session.id) ?? 0;
    taken += t;
    capacity += session.capacity;
    return { session, taken: t, capacity: session.capacity, pct: session.capacity ? (t / session.capacity) * 100 : 0 };
  });
  return { pct: capacity ? (taken / capacity) * 100 : null, taken, capacity, rows };
}

/* ----- recruitment funnel ----------------------------------------------------- */

const OPEN_STAGES = new Set(["new", "contacted", "qualified", "visit"]);

export function leadsIn(snap: Snapshot, campus: CampusFilter, r: Range): Lead[] {
  return snap.leads.filter((l) => inR(l.createdAt, r) && okCampus(campus, leadCampus(l)));
}

function leadEnrolled(snap: Snapshot, l: Lead): Student | null {
  if (l.studentId) {
    const s = snap.studentById.get(l.studentId);
    return s && s.status !== "applicant" ? s : null;
  }
  return null;
}

export type Funnel = { demandes: number; dossiers: number; inscrits: number; payes: number; conversion: number | null };

export function funnelIn(snap: Snapshot, campus: CampusFilter, r: Range): Funnel {
  const leads = leadsIn(snap, campus, r);
  let dossiers = 0;
  let inscrits = 0;
  let payes = 0;
  for (const l of leads) {
    const s = leadEnrolled(snap, l);
    const enrolled = s !== null || (!l.studentId && (l.stage === "enrolled" || l.stage === "paid"));
    if (l.applicationId || enrolled) dossiers += 1;
    if (enrolled) {
      inscrits += 1;
      if (s ? (snap.paymentsByStudent.get(s.id)?.length ?? 0) > 0 : l.stage === "paid") payes += 1;
    }
  }
  return { demandes: leads.length, dossiers, inscrits, payes, conversion: leads.length ? (inscrits / leads.length) * 100 : null };
}

export type SourceRow = { source: string; demandes: number; dossiers: number; inscrits: number; taux: number | null };

export function bySource(snap: Snapshot, campus: CampusFilter, r: Range): SourceRow[] {
  const map = new Map<string, SourceRow>();
  for (const l of leadsIn(snap, campus, r)) {
    const key = l.source === "Direct" ? "Formulaire" : l.source;
    const row = map.get(key) ?? { source: key, demandes: 0, dossiers: 0, inscrits: 0, taux: null };
    row.demandes += 1;
    const s = leadEnrolled(snap, l);
    const enrolled = s !== null || (!l.studentId && (l.stage === "enrolled" || l.stage === "paid"));
    if (l.applicationId || enrolled) row.dossiers += 1;
    if (enrolled) row.inscrits += 1;
    map.set(key, row);
  }
  const rows = Array.from(map.values());
  for (const row of rows) row.taux = row.demandes ? (row.inscrits / row.demandes) * 100 : null;
  return rows.sort((a, b) => b.demandes - a.demandes);
}

export function staleLeads(snap: Snapshot, campus: CampusFilter): Lead[] {
  const limit = snap.settings.callbackDays;
  return snap.leads.filter(
    (l) => OPEN_STAGES.has(l.stage) && daysBetween(l.lastContact, snap.today) > limit && okCampus(campus, leadCampus(l)),
  );
}

export function applicationsIn(snap: Snapshot, campus: CampusFilter, r: Range): Application[] {
  return snap.applications.filter((a) => inR(a.submittedAt, r) && okCampus(campus, a.campusId));
}

/* ----- students at risk and unpaid aging -------------------------------------- */

export type DangerReason = { kind: "attendance" | "unpaid"; label: string };
export type DangerRow = {
  student: Student;
  rate: number | null;
  overdue: number;
  overdueDays: number;
  reasons: DangerReason[];
};

function fmtCfa(n: number) {
  return `${Math.round(n).toLocaleString("fr-FR").replace(/\s/g, " ")} CFA`;
}

export function dangerOn(snap: Snapshot, campus: CampusFilter, day: string): DangerRow[] {
  const out: DangerRow[] = [];
  const { attendancePct, unpaidDays } = snap.settings;
  for (const s of studentsIn(snap, campus)) {
    if (s.status === "applicant" || !enrolledOn(snap, s, day)) continue;
    const info = studentInfo(snap, s);
    if (info.begin > day) continue;
    const rate = attendanceRateOn(snap, s, day);
    const od = overdueAt(s, paidUpTo(snap, s.id, day), day);
    const overdueDays = od.since ? daysBetween(od.since, day) : 0;
    const reasons: DangerReason[] = [];
    if (rate !== null && rate < attendancePct) reasons.push({ kind: "attendance", label: `présence ${rate} %` });
    if (od.amount > 0 && overdueDays >= unpaidDays) reasons.push({ kind: "unpaid", label: `doit ${fmtCfa(od.amount)} depuis ${overdueDays} j` });
    if (reasons.length) out.push({ student: s, rate, overdue: od.amount, overdueDays, reasons });
  }
  return out.sort((a, b) => b.reasons.length - a.reasons.length || b.overdue - a.overdue);
}

export type AgingKey = "lt30" | "d30_60" | "gt60";
export type AgingRow = { student: Student; amount: number; days: number; since: string };
export type Aging = Record<AgingKey, { count: number; amount: number; rows: AgingRow[] }>;

export const AGING_LABEL: Record<AgingKey, string> = { lt30: "Moins de 30 j", d30_60: "30 à 60 j", gt60: "Plus de 60 j" };

export function agingOn(snap: Snapshot, campus: CampusFilter, day: string): Aging {
  const out: Aging = { lt30: { count: 0, amount: 0, rows: [] }, d30_60: { count: 0, amount: 0, rows: [] }, gt60: { count: 0, amount: 0, rows: [] } };
  for (const s of studentsIn(snap, campus)) {
    if (s.status === "applicant" || s.enrolledAt.slice(0, 10) > day) continue;
    const od = overdueAt(s, paidUpTo(snap, s.id, day), day);
    if (od.amount <= 0 || !od.since) continue;
    const days = daysBetween(od.since, day);
    const key: AgingKey = days < 30 ? "lt30" : days <= 60 ? "d30_60" : "gt60";
    out[key].count += 1;
    out[key].amount += od.amount;
    out[key].rows.push({ student: s, amount: od.amount, days, since: od.since });
  }
  (Object.keys(out) as AgingKey[]).forEach((k) => out[k].rows.sort((a, b) => b.days - a.days));
  return out;
}

/* ----- breakdowns -------------------------------------------------------------- */

export function byMethod(snap: Snapshot, campus: CampusFilter, r: Range) {
  const map = new Map<string, { label: string; value: number; count: number }>();
  for (const p of paymentsIn(snap, campus, r)) {
    const row = map.get(p.method) ?? { label: p.method, value: 0, count: 0 };
    row.value += p.amount;
    row.count += 1;
    map.set(p.method, row);
  }
  return Array.from(map.values()).sort((a, b) => b.value - a.value);
}

export function byProgramme(snap: Snapshot, campus: CampusFilter, r: Range, names: Record<string, string>) {
  const map = new Map<string, { label: string; value: number; count: number }>();
  for (const p of paymentsIn(snap, campus, r)) {
    const row = map.get(p.programId) ?? { label: names[p.programId] ?? p.programId, value: 0, count: 0 };
    row.value += p.amount;
    row.count += 1;
    map.set(p.programId, row);
  }
  return Array.from(map.values()).sort((a, b) => b.value - a.value);
}

export function paymentMix(snap: Snapshot, campus: CampusFilter, day: string) {
  const rows = { paid: { count: 0, amount: 0 }, partial: { count: 0, amount: 0 }, unpaid: { count: 0, amount: 0 } };
  for (const s of studentsIn(snap, campus)) {
    if (!enrolledOn(snap, s, day) || s.status === "completed") continue;
    const paid = paidUpTo(snap, s.id, day);
    const due = Math.max(0, s.feeTotal - paid);
    const key = due === 0 ? "paid" : paid === 0 ? "unpaid" : "partial";
    rows[key].count += 1;
    rows[key].amount += due;
  }
  return rows;
}

/* ----- KPI sets (period and previous period) ------------------------------------ */

export type KpiValues = {
  actifs: number;
  encaisse: number;
  reste: number;
  resteEleves: number;
  fillPct: number | null;
  fillTaken: number;
  fillCap: number;
  inscriptions: number;
  conversion: number | null;
  demandes: number;
  inscrits: number;
  presence: number | null;
  danger: number;
  attendu: number;
  recouvrement: number | null;
  paiementMoyen: number | null;
};

export function kpiValues(snap: Snapshot, campus: CampusFilter, r: Range): KpiValues {
  const f = funnelIn(snap, campus, r);
  const out = outstandingOn(snap, campus, r.end);
  const fill = fillOn(snap, campus, r.end);
  const enc = collected(snap, campus, r);
  const att = expectedIn(snap, campus, r);
  const payers = payersIn(snap, campus, r);
  return {
    actifs: activeCount(snap, campus, r.end),
    encaisse: enc,
    reste: out.amount,
    resteEleves: out.students,
    fillPct: fill.pct,
    fillTaken: fill.taken,
    fillCap: fill.capacity,
    inscriptions: newEnrollments(snap, campus, r),
    conversion: f.conversion,
    demandes: f.demandes,
    inscrits: f.inscrits,
    presence: attendanceIn(snap, campus, r).rate,
    danger: dangerOn(snap, campus, r.end).length,
    attendu: att,
    recouvrement: att > 0 ? (enc / att) * 100 : null,
    paiementMoyen: payers ? enc / payers : null,
  };
}

/** Variation en % (null si la période précédente vaut 0 ou n'existe pas). */
export function delta(current: number | null, previous: number | null | undefined): number | null {
  if (current === null || previous === null || previous === undefined || previous === 0) return null;
  return ((current - previous) / Math.abs(previous)) * 100;
}

/* ----- chart series --------------------------------------------------------------- */

export type SeriesMetric = "actifs" | "encaisse" | "reste" | "remplissage" | "inscriptions" | "demandes" | "attendu";

export type Series = {
  buckets: Bucket[];
  previous: (Bucket | null)[] | null;
  values: number[];
  previousValues: (number | null)[] | null;
  /** true si l'ensemble des valeurs est nul : afficher l'état vide. */
  empty: boolean;
  window: Range;
};

function valueFor(snap: Snapshot, campus: CampusFilter, metric: SeriesMetric, b: Bucket): number {
  switch (metric) {
    case "actifs":
      return activeCount(snap, campus, b.end);
    case "encaisse":
      return collected(snap, campus, b);
    case "reste":
      return outstandingOn(snap, campus, b.end).amount;
    case "remplissage": {
      const f = fillOn(snap, campus, b.end);
      return f.pct === null ? 0 : Math.round(f.pct * 10) / 10;
    }
    case "inscriptions":
      return newEnrollments(snap, campus, b);
    case "demandes":
      return leadsIn(snap, campus, b).length;
    case "attendu":
      return expectedIn(snap, campus, b);
  }
}

export function seriesFor(snap: Snapshot, campus: CampusFilter, metric: SeriesMetric, range: Range, prev: Range | null): Series {
  const window = chartWindow(range);
  const cur = makeBuckets(window);
  const prevWindow = prev ? (window === range ? prev : { start: addDays(prev.end, -6), end: prev.end }) : null;
  const previous = previousBuckets(cur, prevWindow);
  const values = cur.items.map((b) => valueFor(snap, campus, metric, b));
  const previousValues = previous ? previous.map((b) => (b ? valueFor(snap, campus, metric, b) : null)) : null;
  const empty = values.every((v) => v === 0) && (previousValues ?? []).every((v) => !v);
  return { buckets: cur.items, previous, values, previousValues, empty, window };
}

/* ----- alerts (also feed the bell) ----------------------------------------------------- */

export type AlertItem = {
  id: string;
  level: "high" | "medium" | "low";
  title: string;
  detail: string;
  count: number;
  href: string;
  /** Change quand le contenu de l'alerte change : sert à l'état « lu ». */
  signature: string;
};

export function computeAlerts(snap: Snapshot, campus: CampusFilter = "all"): AlertItem[] {
  const out: AlertItem[] = [];
  const { unpaidDays, fillPct, callbackDays } = snap.settings;

  const aging = agingOn(snap, campus, snap.today);
  const late = [...aging.d30_60.rows, ...aging.gt60.rows].filter((r) => r.days >= unpaidDays);
  if (late.length) {
    const amount = late.reduce((s, r) => s + r.amount, 0);
    out.push({
      id: "unpaid",
      level: "high",
      title: `${late.length} impayé${late.length > 1 ? "s" : ""} depuis ${unpaidDays} jours ou plus`,
      detail: `${fmtCfa(amount)} à recouvrer`,
      count: late.length,
      href: "/os/ceo/finance?aging=late",
      signature: `unpaid:${late.length}:${amount}`,
    });
  }

  const fill = fillOn(snap, campus, snap.today);
  const hot = fill.rows.filter((r) => r.pct >= fillPct);
  if (hot.length) {
    out.push({
      id: "fill",
      level: "medium",
      title: `${hot.length} session${hot.length > 1 ? "s" : ""} remplie${hot.length > 1 ? "s" : ""} à ${fillPct} % ou plus`,
      detail: hot.map((r) => `${r.session.name} ${r.taken}/${r.capacity}`).slice(0, 2).join(" · "),
      count: hot.length,
      href: "/os/ceo/sessions",
      signature: `fill:${hot.map((r) => `${r.session.id}-${r.taken}`).join(",")}`,
    });
  }

  const stale = staleLeads(snap, campus);
  if (stale.length) {
    out.push({
      id: "callback",
      level: "medium",
      title: `${stale.length} demande${stale.length > 1 ? "s" : ""} sans rappel depuis plus de ${callbackDays} jours`,
      detail: "À relancer par l'administration",
      count: stale.length,
      href: "/os/ceo/traffic",
      signature: `callback:${stale.length}`,
    });
  }

  const danger = dangerOn(snap, campus, snap.today);
  if (danger.length) {
    out.push({
      id: "danger",
      level: "high",
      title: `${danger.length} élève${danger.length > 1 ? "s" : ""} en danger`,
      detail: "Présence trop basse ou impayé ancien",
      count: danger.length,
      href: "/os/ceo/students?tab=danger",
      signature: `danger:${danger.length}`,
    });
  }

  const noTeacher = snap.groups.filter((g) => g.open !== false && okCampus(campus, g.campusId) && g.students > 0 && !g.teacherId);
  const onLeave = snap.groups.filter((g) => g.open !== false && okCampus(campus, g.campusId) && g.students > 0 && snap.teacherById.get(g.teacherId)?.status === "leave");
  if (noTeacher.length + onLeave.length) {
    const parts: string[] = [];
    if (noTeacher.length) parts.push(`${noTeacher.length} sans enseignant`);
    if (onLeave.length) parts.push(`${onLeave.length} avec enseignant en congé`);
    out.push({
      id: "classes",
      level: "high",
      title: `${noTeacher.length + onLeave.length} classe${noTeacher.length + onLeave.length > 1 ? "s" : ""} à couvrir`,
      detail: parts.join(" · "),
      count: noTeacher.length + onLeave.length,
      href: "/os/ceo/sessions?tab=classes",
      signature: `classes:${noTeacher.map((g) => g.id).join(",")}|${onLeave.map((g) => g.id).join(",")}`,
    });
  }
  return out;
}

export function pendingByKind(snap: Snapshot) {
  const map = new Map<string, number>();
  for (const a of snap.approvals) if (a.status === "pending") map.set(a.kind, (map.get(a.kind) ?? 0) + 1);
  return map;
}

export function pendingCount(snap: Snapshot): number {
  let n = 0;
  for (const a of snap.approvals) if (a.status === "pending") n += 1;
  return n;
}

