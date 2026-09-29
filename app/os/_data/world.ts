/**
 * FICTIONAL world of the school, generated once per page load from a fixed seed.
 *
 * Everything is consistent with everything else:
 *   demandes (leads) -> dossiers (applications) -> élèves -> paiements -> présences,
 *   sessions (intakes) and classes (groups) hold the students, approvals and the
 *   audit log point to real records.
 *
 * Dates are RELATIVE TO TODAY (the day the page loads), so "Aujourd'hui",
 * "Cette année" or "Année dernière" always show real, different values. The shape
 * is deterministic (seeded), only the calendar slides with the current date.
 *
 * Nothing here is production data.
 */

import { CAMPUSES, PROGRAMS, between, pick, rng, type Group, type Intake } from "./core";
import { REG_FEE, DEFAULT_SETTINGS, feeFor } from "./settings";
import { installments } from "./finance";
import { addDays, addMonths, daysBetween, localIso, weekday } from "../_lib/dates";
import type { AuditEntry } from "./audit";
import type { Approval } from "./approvals";
import type { Application, Lead, LeadStage } from "./growth";
import type { Payment, PaymentMethod, Transfer } from "./ops";
import type { AttendanceRow, PaymentStatus, Student, StudentStatus, Teacher } from "./people";
import type { CourseDurationMonths } from "../../lib/course-duration";

/* ----- name pools ---------------------------------------------------------- */

const FIRST_F = ["Aminata", "Fatoumata", "Awa", "Mariam", "Rokhaya", "Adjoa", "Akosua", "Chantal", "Bintou", "Nafissatou", "Grâce", "Yasmine", "Salimata", "Abena", "Ama", "Kadidia", "Sokhna", "Odile", "Mireille", "Nadège", "Félicité", "Ramatou", "Hawa", "Djénéba", "Assétou", "Aïcha", "Estelle", "Prisca", "Carine", "Solange", "Rosine", "Flora", "Christelle", "Laetitia", "Djamila", "Kadiatou", "Oumou", "Safiatou", "Zeinab", "Habiba", "Marième", "Ndeye", "Coumba", "Tenin", "Fanta", "Aïssata", "Mariama", "Ruth", "Séraphine", "Judith"];
const FIRST_M = ["Ibrahim", "Moussa", "Kwame", "Amadou", "Souleymane", "Kofi", "Boubacar", "Yao", "Mamadou", "Cheikh", "Serge", "Ousmane", "Kojo", "Sékou", "Abdoul", "Issouf", "Lassina", "Seydou", "Drissa", "Adama", "Yacouba", "Bakary", "Aliou", "Modibo", "Mahamadou", "Idrissa", "Harouna", "Salif", "Ismaël", "Kader", "Arnaud", "Cédric", "Wilfried", "Landry", "Hervé", "Éric", "Franck", "Gildas", "Rodrigue", "Koffi", "Konan", "Kouadio", "Alassane", "Youssouf", "Daouda", "Karim", "Oumar", "Mohamed", "Thierno", "Lamine", "Abdoulaye", "Fodé", "Sidiki", "Célestin", "Parfait", "Judicaël", "Steve", "Marius"];

export const COUNTRY_LIST = [
  { code: "CI", name: "Côte d'Ivoire", weight: 25, dial: "+225", last: ["Koné", "Kouassi", "Bamba", "Ouattara", "Coulibaly", "Touré", "Yao", "N'Guessan", "Kouamé", "Konan", "Konaté", "Diabaté", "Traoré", "Kouadio", "Aka"] },
  { code: "BF", name: "Burkina Faso", weight: 14, dial: "+226", last: ["Ouédraogo", "Sawadogo", "Compaoré", "Kaboré", "Zongo", "Tapsoba", "Nikiéma", "Ilboudo", "Savadogo", "Zoungrana", "Belem", "Traoré"] },
  { code: "SN", name: "Sénégal", weight: 10, dial: "+221", last: ["Diop", "Fall", "Gueye", "Sarr", "Ba", "Sy", "Seck", "Mbaye", "Diouf", "Faye", "Ndiaye", "Sow", "Diallo"] },
  { code: "ML", name: "Mali", weight: 10, dial: "+223", last: ["Keïta", "Sangaré", "Diarra", "Sanogo", "Doumbia", "Tounkara", "Sidibé", "Maïga", "Traoré", "Coulibaly", "Dembélé", "Cissé"] },
  { code: "GN", name: "Guinée", weight: 9, dial: "+224", last: ["Camara", "Barry", "Bah", "Baldé", "Diallo", "Sylla", "Soumah", "Condé", "Bangoura", "Touré", "Kourouma"] },
  { code: "TG", name: "Togo", weight: 9, dial: "+228", last: ["Agbodjan", "Adjovi", "Amouzou", "Kpodar", "Ayivi", "Dosseh", "Tchalla", "Akakpo", "Agbéko", "Kodjo", "Mensah", "Lawson"] },
  { code: "BJ", name: "Bénin", weight: 9, dial: "+229", last: ["Houngbo", "Dossou", "Tchibozo", "Amoussou", "Assogba", "Zannou", "Hounkpatin", "Gbaguidi", "Adéchian", "Sohou", "Agossou"] },
  { code: "NE", name: "Niger", weight: 4, dial: "+227", last: ["Abdou", "Issoufou", "Boureima", "Moussa", "Harouna", "Amadou", "Garba", "Maman", "Oumarou", "Hamidou"] },
  { code: "CM", name: "Cameroun", weight: 6, dial: "+237", last: ["Nkoulou", "Mbarga", "Fotso", "Tagne", "Kamga", "Ngono", "Mvondo", "Essomba", "Tchoumi", "Nana"] },
  { code: "GH", name: "Ghana", weight: 4, dial: "+233", last: ["Mensah", "Asante", "Boateng", "Owusu", "Agyemang", "Osei", "Appiah", "Adjei", "Danso", "Quaye"] },
] as const;

export const LEAD_SOURCE_LIST = [
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

/** Poids des sources parmi les élèves inscrits, et parmi les demandes qui n'aboutissent pas. */
const SOURCE_ENROLLED: [string, number][] = [["WhatsApp", 20], ["Bouche-à-oreille", 16], ["Facebook", 12], ["Walk-in", 10], ["Ancien étudiant", 9], ["Instagram", 8], ["Google", 8], ["Formulaire", 6], ["Agent", 6], ["TikTok", 3], ["YouTube", 2]];
const SOURCE_DEAD: [string, number][] = [["TikTok", 20], ["Facebook", 19], ["Instagram", 14], ["WhatsApp", 12], ["Google", 11], ["YouTube", 7], ["Formulaire", 6], ["Walk-in", 3], ["Bouche-à-oreille", 3], ["Agent", 3], ["Ancien étudiant", 2]];

type Spec = {
  key: string;
  programId: string;
  campusId: string;
  schoolId: string;
  cap: number;
  durations: [CourseDurationMonths, number][];
  months: number;
  groupCap: number;
  schedule: string[];
  levels: string[];
  code: string;
};

const SPECS: Spec[] = [
  { key: "eng-int", programId: "eng-intensive", campusId: "tas-alajo", schoolId: "tas", cap: 90, durations: [[3, 0.72], [6, 0.22], [9, 0.06]], months: 3, groupCap: 18, schedule: ["Lun–Ven 08:00–16:00"], levels: ["B1", "B2", "B3", "I1", "I2", "I3", "P1", "P2", "P3"], code: "INT" },
  { key: "eng-long", programId: "eng-long", campusId: "tas-alajo", schoolId: "tas", cap: 58, durations: [[3, 0.25], [6, 0.45], [9, 0.3]], months: 6, groupCap: 16, schedule: ["Lun–Ven 09:00–14:00"], levels: ["B1", "B2", "B3", "I1", "I2", "I3", "P1", "P2", "P3"], code: "LNG" },
  { key: "comp", programId: "computer", campusId: "tas-kotobabi", schoolId: "tas", cap: 40, durations: [[3, 0.7], [6, 0.3]], months: 3, groupCap: 15, schedule: ["Lun–Ven 09:00–12:00", "Lun–Ven 14:00–17:00"], levels: ["Débutant", "Intermédiaire", "Avancé"], code: "INF" },
  { key: "abla", programId: "abla-business", campusId: "abla-osu", schoolId: "abla", cap: 26, durations: [[3, 0.6], [6, 0.4]], months: 3, groupCap: 14, schedule: ["Lun–Jeu 17:00–21:00"], levels: ["B1", "B2", "C1"], code: "BUS" },
];

const ENTRY_LEVEL_W: Record<string, number[]> = {
  english: [56, 14, 8, 10, 6, 3, 2, 1, 0],
  computer: [70, 22, 8],
  abla: [40, 40, 20],
};

function wpick<T>(list: readonly (readonly [T, number])[], r: () => number): T {
  const total = list.reduce((s, [, w]) => s + w, 0);
  let x = r() * total;
  for (const [v, w] of list) {
    x -= w;
    if (x <= 0) return v;
  }
  return list[0][0];
}

function pad(n: number, w = 2) {
  return String(n).padStart(w, "0");
}

function firstMonday(y: number, m: number) {
  let d = `${y}-${pad(m + 1)}-01`;
  while (weekday(d) !== 0) d = addDays(d, 1);
  return d;
}

const MONTH_NAMES = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];

function noSunday(day: string, today: string) {
  if (weekday(day) !== 6) return day;
  const next = addDays(day, 1);
  return next <= today ? next : addDays(day, -2);
}

/* ----- the generator ------------------------------------------------------- */

export type World = ReturnType<typeof generate>;

function generate(today: string) {
  const R = rng(20260929);
  const ASCII = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-zA-Z]+/g, "").toLowerCase();

  /* ---- sessions (intakes) ---- */
  type IntakeSeed = Intake & { spec: Spec; f: number };
  const intakes: IntakeSeed[] = [];
  const earliest = addMonths(today, -19);
  const latest = addMonths(today, 4);
  for (let y = Number(earliest.slice(0, 4)); y <= Number(latest.slice(0, 4)); y++) {
    for (const m of [0, 3, 6, 9]) {
      const start = firstMonday(y, m);
      if (start < earliest || start > latest) continue;
      for (const spec of SPECS) {
        const program = PROGRAMS.find((p) => p.id === spec.programId)!;
        const f = 0.72 + R() * 0.3;
        const rentree = m === 0 || m === 9;
        intakes.push({
          id: `in-${y}-${pad(m + 1)}-${spec.key}`,
          schoolId: spec.schoolId,
          campusId: spec.campusId,
          programId: spec.programId,
          name: `${rentree ? "Rentrée" : "Session"} ${MONTH_NAMES[m]} ${y}`,
          start,
          end: addDays(addMonths(start, spec.months), -1),
          capacity: spec.cap,
          applications: 0,
          enrolled: 0,
          status: "open",
          spec,
          // The two sessions that started last quarter are nearly full (scenario for the alerts).
          f: (spec.key === "eng-int" || spec.key === "comp") && daysBetween(start, today) > 0 && daysBetween(start, today) < 100 ? 0.97 : Math.min(1, f),
        });
        void program;
      }
    }
  }

  /* ---- students ---- */
  type Draft = {
    intake: IntakeSeed;
    enrolledAt: string;
    months: CourseDurationMonths;
  };
  const drafts: Draft[] = [];
  for (const it of intakes) {
    const daysToStart = daysBetween(today, it.start);
    // Sessions still to come are only partly filled: the drafts dated after today are dropped below.
    const n = Math.round(it.capacity * it.f * (daysToStart > 0 ? 0.92 : 1));
    for (let i = 0; i < n; i++) {
      const roll = R();
      let off: number;
      if (roll < 0.06) off = -between(R, 60, 100);
      else if (roll < 0.55) off = -between(R, 1, 21);
      else if (roll < 0.8) off = -between(R, 22, 70);
      else off = between(R, 0, 14);
      const enrolledAt = noSunday(addDays(it.start, off), today);
      if (enrolledAt > today) continue;
      drafts.push({ intake: it, enrolledAt, months: wpick(it.spec.durations, R) });
    }
  }
  drafts.sort((a, b) => (a.enrolledAt < b.enrolledAt ? -1 : a.enrolledAt > b.enrolledAt ? 1 : 0));

  const usedNames = new Set<string>();
  const counters: Record<string, number> = {};
  const dropRate = 0.055;
  const students: Student[] = [];
  const meta = new Map<string, { begin: string; p: number; leftAt: string | null; behaviour: string; entry: number; spec: Spec }>();

  for (const d of drafts) {
    const spec = d.intake.spec;
    const idx = students.length;
    const country = wpick(COUNTRY_LIST.map((c) => [c, c.weight] as const), R);
    const female = R() < 0.52;
    let first = "";
    let last = "";
    let name = "";
    for (let tries = 0; tries < 6; tries++) {
      first = pick(female ? FIRST_F : FIRST_M, R);
      last = pick(country.last as readonly string[], R);
      name = `${first} ${last}`;
      if (!usedNames.has(name)) break;
    }
    usedNames.add(name);
    const yy = d.enrolledAt.slice(2, 4);
    counters[yy] = (counters[yy] ?? 0) + 1;
    const begin = d.enrolledAt > d.intake.start ? d.enrolledAt : d.intake.start;
    const endDate = addDays(addMonths(d.intake.start, d.months), -1);

    let status: StudentStatus;
    let leftAt: string | null = null;
    if (endDate < today) {
      if (R() < 0.08) {
        status = "dropped";
        leftAt = addDays(begin, between(R, 10, Math.max(11, daysBetween(begin, endDate))));
      } else {
        status = "completed";
        leftAt = endDate;
      }
    } else if (begin > today) {
      status = "active";
    } else {
      const x = R();
      if (x < dropRate) {
        status = "dropped";
        leftAt = addDays(begin, between(R, 8, Math.max(9, Math.min(90, daysBetween(begin, today)))));
        if (leftAt > today) leftAt = today;
      } else if (x < dropRate + 0.03) {
        status = "paused";
        leftAt = addDays(begin, between(R, 5, Math.max(6, Math.min(60, daysBetween(begin, today)))));
        if (leftAt > today) leftAt = today;
      } else {
        status = "active";
      }
    }
    const ageDays = daysBetween(d.enrolledAt, today);
    // A handful of very recent registrations wait for the founder's validation.
    if (status === "active" && ageDays <= 12 && begin > addDays(today, -1) && R() < 0.12) status = "applicant";

    const family = spec.programId === "computer" ? "computer" : spec.programId === "abla-business" ? "abla" : "english";
    const entry = wpick(ENTRY_LEVEL_W[family].map((w, i) => [i, w] as const), R);
    const elapsedMonths = Math.max(0, daysBetween(begin, leftAt && leftAt < today ? leftAt : today)) / 30;
    const pace = family === "english" ? 0.65 : 0.5;
    const levelIdx = Math.min(spec.levels.length - 1, entry + Math.floor(elapsedMonths * pace));

    // Attendance propensity: mostly regular, a tail of absentees.
    const pr = R();
    const p = pr < 0.1 ? 0.5 + R() * 0.28 : pr < 0.3 ? 0.8 + R() * 0.1 : 0.9 + R() * 0.09;

    const campusIsTas = spec.schoolId === "tas";
    const feeTotal = feeFor(spec.programId, d.months, DEFAULT_SETTINGS.fees) + (campusIsTas ? REG_FEE : 20_000);
    const planRoll = R();
    const plan = d.months >= 6 ? (planRoll < 0.15 ? 1 : planRoll < 0.45 ? 2 : planRoll < 0.8 ? 3 : 4) : planRoll < 0.34 ? 1 : planRoll < 0.72 ? 2 : 3;

    const dialLocal = `${country.dial} ${pad(between(R, 1, 9))} ${pad(between(R, 10, 99))} ${pad(between(R, 10, 99))} ${pad(between(R, 10, 99))}`;
    const student: Student = {
      id: `s-${pad(idx + 1, 4)}`,
      matricule: spec.schoolId === "tas" ? `TAS-${yy}-${pad(counters[yy], 4)}` : `ABL-${yy}-${pad(counters[yy], 4)}`,
      name,
      initials: `${first[0]}${last[0]}`.toUpperCase(),
      gender: female ? "F" : "M",
      countryCode: country.code,
      country: country.name,
      phone: dialLocal,
      email: `${ASCII(first)}.${ASCII(last)}${idx % 7 === 0 ? pad(between(R, 1, 99)) : ""}@demo.tas`,
      schoolId: spec.schoolId,
      campusId: spec.campusId,
      programId: spec.programId,
      level: spec.levels[levelIdx],
      groupId: "",
      status,
      paymentStatus: "unpaid",
      enrolledAt: d.enrolledAt,
      attendanceRate: 100,
      averageGrade: 0,
      balance: feeTotal,
      source: wpick(SOURCE_ENROLLED, R),
      durationMonths: d.months,
      feeTotal,
      plan,
      intakeId: d.intake.id,
      exitedAt: leftAt && (status === "dropped" || status === "paused") ? leftAt : undefined,
    };
    students.push(student);
    meta.set(student.id, {
      begin,
      p,
      leftAt: status === "completed" ? endDate : leftAt,
      behaviour: wpick([["good", 72], ["late", 19], ["poor", 6], ["ghost", 3]] as [string, number][], R),
      entry,
      spec,
    });
  }

  /* ---- payments ---- */
  const payments: Payment[] = [];
  const staff = ["Administration Alajo", "Admissions", "Comptabilité", "Directrice TAS"];
  const methodOf = (): PaymentMethod => wpick([["Mobile Money", 48], ["Espèces", 32], ["Virement", 19], ["Carte", 1]] as [PaymentMethod, number][], R);
  const paidBy = new Map<string, number>();
  const push = (s: Student, date: string, amount: number, purpose: Payment["purpose"]) => {
    if (amount <= 0) return;
    const day = noSunday(date, today);
    if (day > today) return;
    const limit = meta.get(s.id)?.leftAt;
    if (limit && s.status !== "completed" && day > addDays(limit, 5)) return;
    payments.push({
      id: "",
      receipt: "",
      studentId: s.id,
      studentName: s.name,
      programId: s.programId,
      amount,
      method: methodOf(),
      date: day,
      time: `${pad(between(R, 8, 17))}:${pick(["00", "05", "15", "20", "30", "40", "45", "55"], R)}`,
      purpose,
      campusId: s.campusId,
      recordedBy: s.schoolId === "abla" ? "Directrice TAS" : pick(staff, R),
    });
    paidBy.set(s.id, (paidBy.get(s.id) ?? 0) + amount);
  };
  const round500 = (n: number) => Math.round(n / 500) * 500;
  for (const s of students) {
    if (s.status === "applicant") continue;
    const m = meta.get(s.id)!;
    const sched = installments(s);
    const reg = Math.min(s.schoolId === "tas" ? REG_FEE : 20_000, s.feeTotal);
    sched.forEach((inst, k) => {
      const regPart = k === 0 ? reg : 0;
      const tuitionPart = inst.amount - regPart;
      if (inst.date > today) {
        // Some students settle everything up front.
        return;
      }
      if (m.behaviour === "ghost") {
        if (k === 0 && R() < 0.5) push(s, inst.date, regPart, "Inscription");
        return;
      }
      if (m.behaviour === "poor" && k > 0 && R() < 0.55) return;
      const delay = m.behaviour === "good" ? between(R, 0, 4) : m.behaviour === "late" ? between(R, 7, 45) : between(R, 0, 25);
      const date = addDays(inst.date, delay);
      if (date > today) return;
      if (regPart > 0) push(s, inst.date, regPart, "Inscription");
      if (tuitionPart <= 0) return;
      if (m.behaviour === "late" && R() < 0.3) {
        const first = round500(tuitionPart * (0.4 + R() * 0.3));
        push(s, date, first, "Scolarité");
        push(s, addDays(date, between(R, 6, 30)), tuitionPart - first, "Scolarité");
      } else {
        push(s, date, tuitionPart, "Scolarité");
      }
    });
  }
  // Most people who finished their course settle what they still owed.
  for (const s of students) {
    if (s.status !== "completed" || R() > 0.6) continue;
    const owed = s.feeTotal - (paidBy.get(s.id) ?? 0);
    const end = meta.get(s.id)?.leftAt;
    if (owed <= 0 || !end) continue;
    const date = addDays(end, between(R, 15, 110));
    if (date <= today) {
      const at = paidBy.get(s.id) ?? 0;
      void at;
      push(s, date, owed, "Scolarité");
    }
  }
  payments.sort((a, b) => (a.date + a.time < b.date + b.time ? -1 : 1));
  payments.forEach((p, i) => {
    p.id = `p-${pad(i + 1, 5)}`;
    p.receipt = `REC-${p.date.slice(2, 4)}-${pad(i + 1001, 5)}`;
  });
  for (const s of students) {
    const paid = paidBy.get(s.id) ?? 0;
    s.balance = Math.max(0, s.feeTotal - paid);
    s.paymentStatus = (s.balance === 0 ? "paid" : paid === 0 ? "unpaid" : "partial") as PaymentStatus;
    if (s.status === "applicant") {
      s.paymentStatus = "unpaid";
      s.balance = s.feeTotal;
    }
  }

  /* ---- groups (classes) ---- */
  const teachers: Teacher[] = buildTeachers();
  const groups: Group[] = [];
  const roomCount: Record<string, number> = {};
  const startedActive = (s: Student) => {
    const m = meta.get(s.id)!;
    return (s.status === "active" || s.status === "paused") && m.begin <= today;
  };
  for (const spec of SPECS) {
    for (let li = 0; li < spec.levels.length; li++) {
      const level = spec.levels[li];
      const all = students.filter((s) => s.programId === spec.programId && s.level === level);
      if (all.length === 0) continue;
      const nowCount = all.filter((s) => startedActive(s) && s.status === "active").length;
      const count = Math.max(1, Math.ceil(nowCount / Math.floor(spec.groupCap * 0.92)));
      for (let g = 0; g < count; g++) {
        roomCount[spec.campusId] = (roomCount[spec.campusId] ?? 0) + 1;
        const campus = CAMPUSES.find((c) => c.id === spec.campusId)!;
        const suffix = String.fromCharCode(65 + g);
        const name =
          spec.key === "comp"
            ? `INF-${level[0]}-${g + 1}`
            : spec.key === "abla"
              ? `BUS-${level}-${g + 1}`
              : `${spec.code}-${level}-${suffix}`;
        groups.push({
          id: `g-${spec.key}-${level.slice(0, 3).toLowerCase()}-${g + 1}`,
          schoolId: spec.schoolId,
          campusId: spec.campusId,
          programId: spec.programId,
          level,
          name,
          teacherId: "",
          room: spec.key === "comp" ? `Lab ${((roomCount[spec.campusId] - 1) % 4) + 1}` : `${spec.key === "abla" ? "Room" : "Salle"} ${((roomCount[spec.campusId] - 1) % campus.rooms) + 1}`,
          capacity: spec.groupCap,
          students: 0,
          schedule: spec.schedule[g % spec.schedule.length],
          open: true,
        });
      }
    }
  }
  const groupsByKey = new Map<string, Group[]>();
  for (const g of groups) {
    const k = `${g.programId}|${g.level}`;
    (groupsByKey.get(k) ?? groupsByKey.set(k, []).get(k)!).push(g);
  }
  // Students currently studying fill the classes evenly; the others just point to one of them.
  const ordered = [...students].sort((a, b) => Number(startedActive(b)) - Number(startedActive(a)));
  for (const s of ordered) {
    const list = groupsByKey.get(`${s.programId}|${s.level}`) ?? [];
    if (list.length === 0) continue;
    const g = list.reduce((a, b) => (a.students <= b.students ? a : b));
    s.groupId = g.id;
    if (startedActive(s) && s.status === "active") g.students += 1;
  }
  // Teachers: spread the classes over the teachers of the campus, with one class per case study.
  const bySchool = (campusId: string) => teachers.filter((t) => t.campusId === campusId && t.status === "active");
  const load = new Map<string, number>();
  for (const g of groups) {
    const pool = bySchool(g.campusId);
    const t = pool.reduce((a, b) => ((load.get(a.id) ?? 0) <= (load.get(b.id) ?? 0) ? a : b));
    g.teacherId = t.id;
    load.set(t.id, (load.get(t.id) ?? 0) + 1);
  }
  const leaveTeacher = teachers.find((t) => t.status === "leave");
  const alajoLong = groups.filter((g) => g.campusId === "tas-alajo" && g.programId === "eng-long");
  if (leaveTeacher && alajoLong[1]) alajoLong[1].teacherId = leaveTeacher.id;
  const alajoInt = groups.filter((g) => g.campusId === "tas-alajo" && g.programId === "eng-intensive" && g.students >= 5);
  if (alajoInt.length > 2) alajoInt[alajoInt.length - 1].teacherId = "";
  for (const t of teachers) {
    const mine = groups.filter((g) => g.teacherId === t.id);
    t.groups = mine.map((g) => g.name);
    t.students = mine.reduce((s, g) => s + g.students, 0);
  }

  /* ---- attendance ---- */
  const attRows = new Map<string, { present: number; absent: number; late: number }>();
  const absences: Record<string, string[]> = {};
  const holidays = new Set<string>();
  for (let i = 0; i < 24; i++) holidays.add(addDays(today, -between(R, 3, 560)));
  for (const s of students) {
    if (s.status === "applicant") continue;
    const m = meta.get(s.id)!;
    let day = m.begin;
    const stop = m.leftAt && m.leftAt < today ? m.leftAt : today;
    const g = s.groupId;
    if (!g) continue;
    let present = 0;
    let absent = 0;
    while (day <= stop) {
      const w = weekday(day);
      if (w < 5 && !holidays.has(day) && (m.spec.key !== "abla" || w < 4)) {
        const key = `${g}|${day}`;
        const row = attRows.get(key) ?? { present: 0, absent: 0, late: 0 };
        if (R() < m.p) {
          row.present += 1;
          present += 1;
          if (R() < 0.08) row.late += 1;
        } else {
          row.absent += 1;
          absent += 1;
          (absences[s.id] ?? (absences[s.id] = [])).push(day);
        }
        attRows.set(key, row);
      }
      day = addDays(day, 1);
    }
    const total = present + absent;
    s.attendanceRate = total === 0 ? 100 : Math.round((present / total) * 100);
    s.averageGrade = Math.round(Math.max(6, Math.min(19, 7 + (s.attendanceRate - 60) * 0.11 + R() * 5)) * 10) / 10;
    if (m.begin > today) s.averageGrade = 0;
  }
  const attendance: AttendanceRow[] = [];
  attRows.forEach((row, key) => {
    const [groupId, date] = key.split("|");
    attendance.push({ date, groupId, ...row });
  });
  attendance.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : a.groupId < b.groupId ? -1 : 1));

  /* ---- sessions: enrolled / applications counts ---- */
  const enrolledBy = new Map<string, number>();
  for (const s of students) {
    if (s.status === "active" || s.status === "paused" || s.status === "completed") enrolledBy.set(s.intakeId, (enrolledBy.get(s.intakeId) ?? 0) + 1);
  }

  /* ---- applications and leads ---- */
  const applications: Application[] = [];
  const leads: Lead[] = [];
  const owners = ["Administration Alajo", "Admissions", "Directrice TAS"];
  const NOTES = [
    "Souhaite commencer à la prochaine rentrée, demande les tarifs.",
    "Veut le programme intensif, niveau débutant.",
    "Demande s'il reste des places en informatique.",
    "A besoin d'une attestation pour le visa.",
    "Cherche un logement climatisé pour quelques mois.",
    "Compare avec une école à Kumasi.",
    "Arrive d'Abidjan le mois prochain.",
    "Ne répond plus depuis plusieurs relances.",
    "Documents incomplets : pièce d'identité manquante.",
    "Parent qui inscrit son fils, veut visiter le campus.",
    "Voudrait payer en trois fois par Mobile Money.",
    "Étudiant sur recommandation d'un ancien élève.",
  ];
  const DOCS = ["Pièce d'identité", "Photo d'identité", "Diplôme", "Justificatif de paiement", "Formulaire signé"];
  const campaigns = ["Rentrée — Facebook", "Rentrée — Reels", "Accra English — TikTok", "Informatique — Facebook", "Partenariat agents CI"];
  let appN = 0;
  let leadN = 0;
  const addLeadFor = (o: {
    name: string;
    initials: string;
    phone: string;
    country: string;
    countryCode: string;
    source: string;
    programId: string;
    campusId: string;
    createdAt: string;
    stage: LeadStage;
    months: CourseDurationMonths;
    applicationId?: string;
    studentId?: string;
    lastContact?: string;
  }): Lead => {
    leadN += 1;
    const age = daysBetween(o.createdAt, today);
    const contacted = o.stage !== "new";
    const lastContact = o.lastContact ?? (contacted ? addDays(o.createdAt, Math.min(age, between(R, 0, 4))) : o.createdAt);
    const open = !["paid", "lost", "enrolled"].includes(o.stage);
    const lead: Lead = {
      id: `l-${pad(leadN, 5)}`,
      name: o.name,
      initials: o.initials,
      phone: o.phone,
      country: o.country,
      countryCode: o.countryCode,
      source: o.source,
      campaign: ["Facebook", "Instagram", "TikTok", "YouTube", "Agent"].includes(o.source) ? pick(campaigns, R) : null,
      programId: o.programId,
      campusId: o.campusId,
      stage: o.stage,
      owner: pick(owners, R),
      createdAt: o.createdAt,
      lastContact,
      nextFollowUp: open ? addDays(lastContact, between(R, 1, 4)) : null,
      overdue: open && daysBetween(lastContact, today) > DEFAULT_SETTINGS.callbackDays,
      note: pick(NOTES, R),
      durationMonths: o.months,
      applicationId: o.applicationId,
      studentId: o.studentId,
    };
    leads.push(lead);
    return lead;
  };

  const newApp = (o: {
    name: string;
    initials: string;
    country: string;
    programId: string;
    campusId: string;
    intakeId: string;
    source: string;
    status: Application["status"];
    submittedAt: string;
    months: CourseDurationMonths;
    leadId?: string;
    studentId?: string;
  }): Application => {
    appN += 1;
    const missing = o.status === "documents" ? DOCS.filter(() => R() > 0.6).slice(0, 2) : [];
    const app: Application = {
      id: `a-${pad(appN, 5)}`,
      ref: `CAND-${o.submittedAt.slice(2, 4)}-${pad(appN + 100, 4)}`,
      name: o.name,
      initials: o.initials,
      country: o.country,
      programId: o.programId,
      campusId: o.campusId,
      intakeId: o.intakeId,
      source: o.source,
      status: o.status,
      submittedAt: o.submittedAt,
      assignee: pick(owners, R),
      missingDocs: missing.length ? missing : o.status === "documents" ? [DOCS[0]] : [],
      durationMonths: o.months,
      leadId: o.leadId,
      studentId: o.studentId,
    };
    applications.push(app);
    return app;
  };

  const hasPaid = (s: Student) => (paidBy.get(s.id) ?? 0) > 0;
  const pendingEnroll: { app: Application; student: Student }[] = [];
  for (const s of students) {
    const submitted = addDays(s.enrolledAt, -between(R, 0, 9));
    const leadAt = addDays(submitted, -between(R, 0, 8));
    const stage: LeadStage = s.status === "applicant" ? "approved" : hasPaid(s) ? "paid" : "enrolled";
    const lead = addLeadFor({
      name: s.name, initials: s.initials, phone: s.phone, country: s.country, countryCode: s.countryCode, source: s.source,
      programId: s.programId, campusId: s.campusId, createdAt: leadAt, stage, months: s.durationMonths as CourseDurationMonths, studentId: s.id,
      lastContact: s.enrolledAt,
    });
    const app = newApp({
      name: s.name, initials: s.initials, country: s.country, programId: s.programId, campusId: s.campusId, intakeId: s.intakeId,
      source: s.source, status: s.status === "applicant" ? "approved" : "enrolled", submittedAt: submitted, months: s.durationMonths as CourseDurationMonths,
      leadId: lead.id, studentId: s.id,
    });
    lead.applicationId = app.id;
    s.leadId = lead.id;
    s.applicationId = app.id;
    if (s.status === "applicant") pendingEnroll.push({ app, student: s });
  }

  // Dossiers and demandes that did not become students.
  const target = Math.round(students.length * 3.1);
  const spanStart = addDays(addMonths(today, -18), 0);
  const spanDays = daysBetween(spanStart, today);
  const visibleIntakes = intakes.filter((i) => i.end >= spanStart);
  let deadApps = 0;
  while (leads.length < target) {
    const spec = wpick(SPECS.map((sp) => [sp, sp.cap] as const), R);
    // Requests cluster before intakes: pick an intake then a date shortly before it.
    const it = pick(visibleIntakes.filter((i) => i.spec === spec), R);
    let createdAt = noSunday(addDays(it.start, -between(R, 3, 75)), today);
    if (createdAt > today || createdAt < spanStart) createdAt = addDays(spanStart, between(R, 0, spanDays));
    if (createdAt > today) createdAt = today;
    const age = daysBetween(createdAt, today);
    const country = wpick(COUNTRY_LIST.map((c) => [c, c.weight] as const), R);
    const female = R() < 0.5;
    const first = pick(female ? FIRST_F : FIRST_M, R);
    const last = pick(country.last as readonly string[], R);
    const source = wpick(SOURCE_DEAD, R);
    let stage: LeadStage;
    if (age <= 3) stage = wpick([["new", 60], ["contacted", 30], ["qualified", 6], ["lost", 4]] as [LeadStage, number][], R);
    else if (age <= 14) stage = wpick([["new", 4], ["contacted", 11], ["qualified", 7], ["visit", 4], ["application", 10], ["lost", 64]] as [LeadStage, number][], R);
    else stage = wpick([["lost", 94], ["application", 6]] as [LeadStage, number][], R);
    const months = wpick(spec.durations, R);
    const lead = addLeadFor({
      name: `${first} ${last}`, initials: `${first[0]}${last[0]}`.toUpperCase(), phone: `${country.dial} ${pad(between(R, 1, 9))} ${pad(between(R, 10, 99))} ${pad(between(R, 10, 99))} ${pad(between(R, 10, 99))}`,
      country: country.name, countryCode: country.code, source, programId: spec.programId, campusId: spec.campusId, createdAt, stage, months,
    });
    // About a third of the dead ends had a dossier opened.
    if (stage === "application" || (stage === "lost" && R() < 0.34)) {
      deadApps += 1;
      const submittedAt = addDays(createdAt, Math.min(age, between(R, 1, 8)));
      const appAge = daysBetween(submittedAt, today);
      let status: Application["status"];
      if (appAge > 30) status = R() < 0.82 ? "rejected" : "documents";
      else status = wpick([["new", 20], ["reviewing", 30], ["documents", 26], ["rejected", 24]] as [Application["status"], number][], R);
      if (stage === "application" && status === "rejected") status = "reviewing";
      const app = newApp({
        name: lead.name, initials: lead.initials, country: lead.country, programId: lead.programId, campusId: spec.campusId,
        intakeId: it.id, source, status, submittedAt, months, leadId: lead.id,
      });
      lead.applicationId = app.id;
    }
  }
  void deadApps;
  // A few dossiers accepted by the administration, waiting for the founder's decision.
  const readyApps = applications.filter((a) => (a.status === "reviewing" || a.status === "documents") && daysBetween(a.submittedAt, today) <= 25);
  readyApps.slice(0, 6).forEach((a) => (a.status = "approved"));
  const approvedNoStudent = applications.filter((a) => a.status === "approved" && !a.studentId);
  const rejectCandidates = applications.filter((a) => (a.status === "documents" || a.status === "new") && !a.studentId && daysBetween(a.submittedAt, today) <= 20);

  applications.sort((a, b) => (a.submittedAt < b.submittedAt ? 1 : -1));
  leads.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

  // Sessions: final counts.
  const appsByIntake = new Map<string, number>();
  for (const a of applications) appsByIntake.set(a.intakeId, (appsByIntake.get(a.intakeId) ?? 0) + 1);
  const outIntakes: Intake[] = intakes.map((it) => {
    const enrolled = enrolledBy.get(it.id) ?? 0;
    const finished = it.end < today;
    const status: Intake["status"] = finished ? "closed" : enrolled >= it.capacity ? "full" : enrolled / it.capacity >= 0.6 ? "filling" : "open";
    const { spec: _s, f: _f, ...plain } = it;
    void _s;
    void _f;
    return { ...plain, applications: appsByIntake.get(it.id) ?? 0, enrolled, status };
  });

  /* ---- transfers, approvals, audit ---- */
  const transfers: Transfer[] = [];
  const approvals: Approval[] = [];
  const active = students.filter((s) => s.status === "active" && startedActive(s) && s.groupId);
  const usedStudents = new Set<string>();
  const groupById = new Map(groups.map((g) => [g.id, g] as const));
  const byGroupKeyOther = (s: Student) => {
    const cur = groupById.get(s.groupId)!;
    const same = groups.filter((g) => g.programId === cur.programId && g.id !== cur.id && g.students < g.capacity);
    return same.length ? pick(same, R) : undefined;
  };
  const claim = (pred: (s: Student) => boolean) => {
    for (let i = 0; i < 4000; i++) {
      const s = pick(active, R);
      if (usedStudents.has(s.id) || !pred(s)) continue;
      usedStudents.add(s.id);
      return s;
    }
    return undefined;
  };
  const reasonsT = ["Niveau trop bas après le test de mi-parcours.", "Demande de l'élève : horaire incompatible avec son travail.", "Progression validée par l'enseignant.", "Classe trop chargée, rééquilibrage.", "Changement de campus demandé par le tuteur."];
  const requesters = ["Administration Alajo", "Admissions", "Directrice TAS"];
  const apId = (kind: string, i: number) => `ap-${kind}-${pad(i + 1)}`;

  const pushTransfer = (i: number, status: Transfer["status"], daysAgo: number) => {
    const s = claim((x) => !!byGroupKeyOther(x));
    if (!s) return;
    const to = byGroupKeyOther(s)!;
    const date = addDays(today, -daysAgo);
    const t: Transfer = {
      id: `tr-${pad(i + 1)}`,
      studentId: s.id,
      studentName: s.name,
      matricule: s.matricule,
      fromGroupId: s.groupId,
      toGroupId: to.id,
      reason: pick(reasonsT, R),
      requestedBy: pick(requesters, R),
      status,
      date,
    };
    transfers.push(t);
    const a: Approval = {
      id: `ap-${t.id}`,
      kind: "transfer",
      status: status === "pending" ? "pending" : status === "approved" ? "accepted" : "refused",
      subjectName: s.name,
      subjectRef: s.matricule,
      summary: `${groupById.get(t.fromGroupId)?.name} vers ${groupById.get(t.toGroupId)?.name}`,
      requestedBy: t.requestedBy,
      date,
      relatedId: t.id,
      studentId: s.id,
    };
    if (status !== "pending") {
      a.decidedAt = `${(addDays(date, between(R, 0, 2)) > today ? today : addDays(date, between(R, 0, 2)))}T${pad(between(R, 9, 17))}:${pad(between(R, 0, 59))}`;
      a.decidedBy = "Fondateur TAS";
      if (status === "rejected") a.reason = "Classe d'arrivée déjà complète.";
    }
    approvals.push(a);
  };
  for (let i = 0; i < 8; i++) pushTransfer(i, "pending", between(R, 0, 9));
  for (let i = 8; i < 20; i++) pushTransfer(i, i % 5 === 0 ? "rejected" : "approved", between(R, 12, 70));

  // Pending enrolment validations: the "applicant" students.
  pendingEnroll.forEach(({ app, student }, i) => {
    approvals.push({
      id: apId("enroll", i),
      kind: "enroll",
      status: "pending",
      subjectName: student.name,
      subjectRef: app.ref,
      summary: `${PROGRAMS.find((p) => p.id === student.programId)?.name} · ${outIntakes.find((x) => x.id === student.intakeId)?.name ?? ""}`,
      requestedBy: app.assignee,
      date: app.submittedAt,
      relatedId: app.id,
      studentId: student.id,
    });
  });
  approvedNoStudent.slice(0, 5).forEach((app, i) => {
    approvals.push({
      id: apId("enroll", pendingEnroll.length + i),
      kind: "enroll",
      status: "pending",
      subjectName: app.name,
      subjectRef: app.ref,
      summary: PROGRAMS.find((p) => p.id === app.programId)?.name ?? app.programId,
      requestedBy: app.assignee,
      date: app.submittedAt,
      relatedId: app.id,
    });
  });
  rejectCandidates.slice(0, 3).forEach((app, i) => {
    approvals.push({
      id: apId("reject", i),
      kind: "reject",
      status: "pending",
      subjectName: app.name,
      subjectRef: app.ref,
      summary: `Dossier incomplet · ${PROGRAMS.find((p) => p.id === app.programId)?.name}`,
      requestedBy: app.assignee,
      date: app.submittedAt,
      relatedId: app.id,
    });
  });
  // Exclusions and unblocking requests.
  const lowAtt = active.filter((s) => s.attendanceRate < 72 && !usedStudents.has(s.id)).slice(0, 4);
  lowAtt.forEach((s, i) => {
    usedStudents.add(s.id);
    approvals.push({
      id: apId("exclude", i),
      kind: "exclude",
      status: "pending",
      subjectName: s.name,
      subjectRef: s.matricule,
      summary: `Absences répétées (présence ${s.attendanceRate} %), demande de l'administration`,
      requestedBy: "Administration Alajo",
      date: addDays(today, -between(R, 0, 8)),
      relatedId: s.id,
      studentId: s.id,
    });
  });
  const pausedNow = students.filter((s) => s.status === "paused").slice(0, 3);
  pausedNow.forEach((s, i) => {
    approvals.push({
      id: apId("unblock", i),
      kind: "unblock",
      status: "pending",
      subjectName: s.name,
      subjectRef: s.matricule,
      summary: "Dossier réglé, demande de réouverture",
      requestedBy: "Administration Alajo",
      date: addDays(today, -between(R, 0, 8)),
      relatedId: s.id,
      studentId: s.id,
    });
  });
  approvals.push(
    { id: apId("admin", 0), kind: "admin", status: "pending", subjectName: "Abena Owusu", subjectRef: "ADM-26-0004", summary: "Campus Kotobabi", requestedBy: "Directrice TAS", date: addDays(today, -5), relatedId: "ADM-26-0004" },
    { id: apId("teacher", 0), kind: "teacher", status: "pending", subjectName: "Kodjo Mensah", subjectRef: "ENS-26-0019", summary: "Anglais, campus Alajo", requestedBy: "Directrice TAS", date: addDays(today, -6), relatedId: "" },
    { id: apId("teacher", 1), kind: "teacher", status: "pending", subjectName: "Salimata Cissé", subjectRef: "ENS-26-0020", summary: "Informatique, campus Kotobabi", requestedBy: "Administration Alajo", date: addDays(today, -7), relatedId: "" },
  );

  // History: decisions already taken, consistent with the data.
  const recentEnrolled = students.filter((s) => s.status === "active" && daysBetween(s.enrolledAt, today) > 3 && daysBetween(s.enrolledAt, today) < 75);
  recentEnrolled.slice(0, 22).forEach((s, i) => {
    const app = applications.find((a) => a.id === s.applicationId);
    const date = addDays(s.enrolledAt, -between(R, 1, 3));
    approvals.push({
      id: apId("enroll-h", i), kind: "enroll", status: "accepted", subjectName: s.name, subjectRef: app?.ref ?? s.matricule,
      summary: PROGRAMS.find((p) => p.id === s.programId)?.name ?? s.programId, requestedBy: app?.assignee ?? "Admissions", date,
      relatedId: app?.id ?? "", studentId: s.id, decidedAt: `${s.enrolledAt}T${pad(between(R, 8, 17))}:${pad(between(R, 0, 59))}`, decidedBy: "Fondateur TAS",
    });
  });
  const rejectedApps = applications.filter((a) => a.status === "rejected" && daysBetween(a.submittedAt, today) < 80).slice(0, 8);
  const refusalReasons = ["Documents non fournis après trois relances.", "Niveau incompatible avec le programme demandé.", "Session complète, proposé à la rentrée suivante.", "Dossier en double."];
  const cap = (day: string) => (day > today ? today : day);
  rejectedApps.forEach((a, i) => {
    approvals.push({
      id: apId("reject-h", i), kind: "reject", status: "accepted", subjectName: a.name, subjectRef: a.ref, summary: `Dossier incomplet · ${PROGRAMS.find((p) => p.id === a.programId)?.name}`,
      requestedBy: a.assignee, date: a.submittedAt, relatedId: a.id, decidedAt: `${cap(addDays(a.submittedAt, between(R, 2, 6)))}T${pad(between(R, 8, 17))}:${pad(between(R, 0, 59))}`, decidedBy: "Fondateur TAS", reason: pick(refusalReasons, R),
    });
  });
  const dropped = students.filter((s) => s.status === "dropped" && s.exitedAt && daysBetween(s.exitedAt, today) < 120).slice(0, 6);
  dropped.forEach((s, i) => {
    approvals.push({
      id: apId("exclude-h", i), kind: "exclude", status: "accepted", subjectName: s.name, subjectRef: s.matricule, summary: "Absences répétées, demande de l'administration",
      requestedBy: "Administration Alajo", date: addDays(s.exitedAt!, -2), relatedId: s.id, studentId: s.id, decidedAt: `${s.exitedAt}T${pad(between(R, 8, 17))}:${pad(between(R, 0, 59))}`, decidedBy: "Fondateur TAS",
    });
  });
  approvals.push(
    { id: apId("admin-h", 0), kind: "admin", status: "accepted", subjectName: "Kadidia Sylla", subjectRef: "ADM-26-0003", summary: "Campus Kotobabi", requestedBy: "Directrice TAS", date: addDays(today, -60), relatedId: "ADM-26-0003", decidedAt: `${addDays(today, -58)}T10:20`, decidedBy: "Fondateur TAS" },
    { id: apId("teacher-h", 0), kind: "teacher", status: "refused", subjectName: "Boris Tagne", subjectRef: "ENS-26-0018", summary: "Anglais, campus Alajo", requestedBy: "Directrice TAS", date: addDays(today, -40), relatedId: "", decidedAt: `${addDays(today, -38)}T15:05`, decidedBy: "Fondateur TAS", reason: "Profil non retenu après entretien." },
  );

  const audit: AuditEntry[] = [];
  const auditFrom = addDays(today, -90);
  let auN = 0;
  const au = (at: string, actor: string, type: AuditEntry["type"], action: string, detail: string, href?: string) => {
    auN += 1;
    audit.push({ id: `au-${pad(auN, 5)}`, at, actor, type, action, detail, href });
  };
  const fmt = (n: number) => `${Math.round(n).toLocaleString("fr-FR").replace(/\s/g, " ")} CFA`;
  for (const p of payments) {
    if (p.date < auditFrom) continue;
    au(`${p.date}T${p.time}`, p.recordedBy, "payment", "Paiement enregistré", `${fmt(p.amount)} · ${p.studentName} · ${p.receipt}`, `/os/students/${p.studentId}/recu/${p.id}`);
  }
  for (const s of students) {
    if (s.enrolledAt < auditFrom || s.status === "applicant") continue;
    au(`${s.enrolledAt}T${pad(between(R, 8, 16))}:${pad(between(R, 0, 59))}`, pick(staff.slice(0, 2), R), "enrollment", "Élève inscrit", `${s.name} · ${PROGRAMS.find((p) => p.id === s.programId)?.name}`, `/os/students/${s.id}`);
  }
  for (const a of approvals) {
    if (a.status === "pending" || !a.decidedAt) continue;
    au(a.decidedAt, a.decidedBy ?? "Fondateur TAS", "approval", a.status === "accepted" ? "Décision : accepté" : "Décision : refusé", `${a.subjectName} · ${a.summary}${a.reason ? ` · ${a.reason}` : ""}`);
  }
  au(`${addDays(today, -58)}T10:20`, "Fondateur TAS", "admin", "Administrateur créé", "Kadidia Sylla · ADM-26-0003 · Campus Kotobabi");
  au(`${addDays(today, -35)}T09:10`, "Fondateur TAS", "group", "Classe ouverte", `${groups[2]?.name ?? "INT-B3-A"} · nouvelle affectation`);
  au(`${addDays(today, -21)}T14:40`, "Fondateur TAS", "group", "Enseignant assigné", `${groups[5]?.name ?? "INT-I3-A"} · ${teachers[3].name}`);
  audit.sort((a, b) => (a.at < b.at ? 1 : a.at > b.at ? -1 : 0));

  return { today, students, payments, attendance, leads, applications, intakes: outIntakes, groups, teachers, transfers, approvals, audit, absences, holidays: Array.from(holidays).sort() };
}

function buildTeachers(): Teacher[] {
  const R = rng(700);
  const specialties = ["Expression orale", "Grammaire", "Compréhension écrite", "Écoute", "Débat", "Vocabulaire", "MS Office", "Graphisme", "Bases de données", "Marketing digital", "Réseaux"];
  return Array.from({ length: 18 }, (_, i) => {
    const r = rng(700 + i);
    void R;
    const female = r() > 0.55;
    const country = i % 3 === 0 ? COUNTRY_LIST[9] : COUNTRY_LIST[i % 10];
    const name = `${pick(female ? FIRST_F : FIRST_M, r)} ${pick(country.last as readonly string[], r)}`;
    const isComputer = i >= 5 && i <= 7;
    const isAbla = i >= 13;
    return {
      id: `t-${pad(i + 1)}`,
      staffId: `ENS-26-${pad(i + 1, 4)}`,
      name,
      initials: name.split(" ").map((w) => w[0]).join(""),
      specialty: isComputer ? ["MS Office", "Réseaux", "Graphisme"][i - 5] : specialties[i % 6],
      schoolId: isAbla ? "abla" : "tas",
      campusId: isAbla ? "abla-osu" : isComputer ? "tas-kotobabi" : "tas-alajo",
      phone: `+233 2${between(r, 10, 59)} ${between(r, 100, 999)} ${between(r, 100, 999)}`,
      email: `${name.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z]+/g, ".")}@demo.tas`,
      groups: [],
      students: 0,
      status: i === 11 ? "leave" : "active",
      since: `20${between(r, 18, 25)}-0${between(r, 1, 9)}-1${between(r, 0, 9)}`,
    } as Teacher;
  });
}

/** Generated once per page load (module scope), then shared by every screen. */
export const WORLD: World = generate(localIso());
