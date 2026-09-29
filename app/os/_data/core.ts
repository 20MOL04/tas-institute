/**
 * FICTIONAL demo data for the TAS Digital OS prototype.
 *
 * Nothing here is production data: no real student, no real payment, no real
 * camera. Verified facts about the school (three courses, 18 teachers, housing
 * prices) are used as a skeleton so the demo feels true to the institution;
 * everything else is invented for the prototype and flagged as such in the UI
 * through the <DemoBanner /> component.
 *
 * All generators are pure and deterministic (seeded PRNG) so that the server
 * render and the client hydration produce identical numbers.
 */

/* ----- deterministic randomness ------------------------------------------ */

/** mulberry32: tiny, fast, stable across runs. */
export function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function pick<T>(list: readonly T[], r: () => number): T {
  return list[Math.floor(r() * list.length)];
}

export function between(r: () => number, min: number, max: number) {
  return Math.round(min + r() * (max - min));
}

/* ----- organisation ------------------------------------------------------- */

export type School = {
  id: string;
  name: string;
  short: string;
  city: string;
  country: string;
  isReal: boolean;
  campuses: Campus[];
};

export type Campus = { id: string; schoolId: string; name: string; area: string; rooms: number };

export const SCHOOLS: School[] = [
  {
    id: "tas",
    name: "TAS English Institute",
    short: "TAS",
    city: "Accra",
    country: "Ghana",
    isReal: true,
    campuses: [
      { id: "tas-alajo", schoolId: "tas", name: "Campus Alajo", area: "Alajo Polo Junction", rooms: 18 },
      { id: "tas-kotobabi", schoolId: "tas", name: "Campus Kotobabi", area: "Kotobabi New Town", rooms: 6 },
    ],
  },
  {
    id: "abla",
    name: "Accra Business & Language Academy",
    short: "ABLA",
    city: "Accra",
    country: "Ghana",
    isReal: false,
    campuses: [{ id: "abla-osu", schoolId: "abla", name: "Campus Osu", area: "Osu", rooms: 6 }],
  },
];

export const CAMPUSES: Campus[] = SCHOOLS.flatMap((s) => s.campuses);

export function schoolOf(campusId: string) {
  return SCHOOLS.find((s) => s.campuses.some((c) => c.id === campusId));
}

/* ----- academic offer ----------------------------------------------------- */

export type Program = {
  id: string;
  schoolId: string;
  name: string;
  category: "english" | "computer";
  hoursPerDay: number;
  /** Tarif affiche 2024, référence 3 mois. */
  mockFee: number;
  levels: string[];
};

export const PROGRAMS: Program[] = [
  {
    id: "eng-intensive",
    schoolId: "tas",
    name: "Anglais intensif",
    category: "english",
    hoursPerDay: 8,
    mockFee: 445000,
    levels: ["B1", "B2", "B3", "I1", "I2", "I3", "P1", "P2", "P3"],
  },
  {
    id: "eng-long",
    schoolId: "tas",
    name: "Anglais longue durée",
    category: "english",
    hoursPerDay: 5,
    mockFee: 170000,
    levels: ["B1", "B2", "B3", "I1", "I2", "I3", "P1", "P2", "P3"],
  },
  {
    id: "computer",
    schoolId: "tas",
    name: "Informatique",
    category: "computer",
    hoursPerDay: 3,
    mockFee: 180000,
    levels: ["Débutant", "Intermédiaire", "Avancé"],
  },
  {
    id: "abla-business",
    schoolId: "abla",
    name: "Business English",
    category: "english",
    hoursPerDay: 4,
    mockFee: 380000,
    levels: ["B1", "B2", "C1"],
  },
];

/** Below 10/20 the student stays. Otherwise the next month is the next level. */
export const PASSING_GRADE = 10;

export function passedThisMonth(grade: number) {
  return grade >= PASSING_GRADE;
}

export function nextLevelFor(programId: string, currentLevel: string, grade: number) {
  const program = PROGRAMS.find((p) => p.id === programId);
  if (!program) return currentLevel;
  if (!passedThisMonth(grade)) return currentLevel;
  const idx = program.levels.indexOf(currentLevel);
  if (idx < 0 || idx >= program.levels.length - 1) return currentLevel;
  return program.levels[idx + 1];
}

export const ENGLISH_SKILLS = [
  "Grammaire",
  "Vocabulaire",
  "Lecture",
  "Écriture",
  "Écoute",
  "Oral",
  "Débat",
] as const;

export const COMPUTER_MODULES = [
  "Microsoft Office Admin",
  "Infographie",
  "Réparation d'ordinateurs",
  "Excel financier",
  "VBA Excel",
  "Oracle",
  "Réseaux MCITP",
  "Sites web",
  "Réseaux Cisco",
] as const;

/* ----- intakes ------------------------------------------------------------ */

export type Intake = {
  id: string;
  schoolId: string;
  campusId: string;
  programId: string;
  name: string;
  start: string;
  end: string;
  capacity: number;
  applications: number;
  enrolled: number;
  status: "open" | "filling" | "full" | "closed";
  /** Fermée à la main par le fondateur. */
  closedManually?: boolean;
};

/* ----- rooms and groups --------------------------------------------------- */

export type Group = {
  id: string;
  schoolId: string;
  campusId: string;
  programId: string;
  level: string;
  name: string;
  /** Vide = classe sans enseignant. */
  teacherId: string;
  room: string;
  capacity: number;
  students: number;
  schedule: string;
  /** Classe ouverte aux nouvelles affectations (défaut : oui). */
  open?: boolean;
};

export const CLASS_CODES = ["B1", "B2", "B3", "I1", "I2", "I3", "P1", "P2", "P3"] as const;

export type ClassCode = (typeof CLASS_CODES)[number];

export function groupMenuLabel(group: Group) {
  const program = PROGRAMS.find((p) => p.id === group.programId)?.name ?? group.programId;
  const campus = CAMPUSES.find((c) => c.id === group.campusId)?.name ?? group.campusId;
  return `${group.name}, ${program}, ${campus}`;
}

export function groupMenuOption(group: Group) {
  const program = PROGRAMS.find((p) => p.id === group.programId)?.name ?? group.programId;
  const campus = CAMPUSES.find((c) => c.id === group.campusId)?.name ?? group.campusId;
  return { value: group.id, label: group.name, hint: `${program}, ${campus}` };
}

/* ----- users and roles ---------------------------------------------------- */

export type Role =
  | "founder"
  | "director"
  | "admin"
  | "teacher"
  | "finance"
  | "marketing"
  | "student"
  | "superadmin";

export type OsUser = {
  id: string;
  name: string;
  role: Role;
  roleLabel: string;
  scope: "global" | "school" | "campus" | "own";
  schoolId?: string;
  campusId?: string;
  initials: string;
};

export const OS_USERS: OsUser[] = [
  { id: "u-ceo", name: "Fondateur", role: "founder", roleLabel: "Fondateur / CEO", scope: "global", initials: "FD" },
  { id: "u-dir", name: "Directrice TAS", role: "director", roleLabel: "Directrice d'école", scope: "school", schoolId: "tas", initials: "DT" },
  { id: "u-adm", name: "Administration", role: "admin", roleLabel: "Administration", scope: "campus", schoolId: "tas", campusId: "tas-alajo", initials: "AD" },
  { id: "u-fin", name: "Comptabilité", role: "finance", roleLabel: "Finance", scope: "school", schoolId: "tas", initials: "FI" },
  { id: "u-mkt", name: "Growth", role: "marketing", roleLabel: "Marketing / Growth", scope: "global", initials: "GR" },
  { id: "u-tea", name: "Enseignant", role: "teacher", roleLabel: "Enseignant", scope: "own", schoolId: "tas", campusId: "tas-alajo", initials: "EN" },
  { id: "u-stu", name: "Étudiant", role: "student", roleLabel: "Étudiant", scope: "own", schoolId: "tas", campusId: "tas-alajo", initials: "ET" },
];

/* ----- formatting helpers ------------------------------------------------- */

const NBSP = "\u00a0";
const NBSP_WORD = "\u00a0";

export function fmtInt(n: number) {
  return Math.round(n).toLocaleString("fr-FR").replace(/\s/g, NBSP);
}

/** Money in CFA, the currency the school quotes its housing in. */
export function fmtMoney(n: number) {
  return `${fmtInt(n)}${NBSP_WORD}CFA`;
}

export function fmtCompactMoney(n: number) {
  if (Math.abs(n) >= 1_000_000) return `${(n / 1_000_000).toFixed(n >= 10_000_000 ? 0 : 1).replace(".", ",")}M`;
  if (Math.abs(n) >= 1000) return `${Math.round(n / 1000)}k`;
  return String(Math.round(n));
}

export function fmtPct(n: number, digits = 1) {
  return `${n.toFixed(digits).replace(".", ",")}${NBSP}%`;
}

export function fmtGrade(n: number) {
  return n.toFixed(1).replace(".", ",");
}

export function parseWhen(iso: string) {
  if (!iso) return new Date();
  if (iso.includes("T")) return new Date(iso);
  return new Date(`${iso}T00:00:00Z`);
}

export function fmtDate(iso: string) {
  return parseWhen(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
}

export function fmtDateShort(iso: string) {
  return parseWhen(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" });
}

export function fmtTime(isoOrHm: string) {
  if (/^\d{1,2}:\d{2}/.test(isoOrHm)) return isoOrHm.slice(0, 5);
  if (!isoOrHm.includes("T")) return "";
  return parseWhen(isoOrHm).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

export function fmtMonthLong(iso: string) {
  const text = parseWhen(iso).toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function nowStamp() {
  const d = new Date();
  const date = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const time = d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", hour12: false });
  return { date, time, iso: d.toISOString() };
}

/* ----- shared time axis --------------------------------------------------- */

export const MONTHS_FR = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];

const CURRENT_YEAR = new Date().getFullYear();

/** Current calendar year, so monthly series line up with payment dates. */
export const TIMELINE = MONTHS_FR.map((label, month) => ({
  key: `${CURRENT_YEAR}-${String(month + 1).padStart(2, "0")}`,
  label,
  year: CURRENT_YEAR,
  month,
}));

/* ----- founder formatting -------------------------------------------------- */

function trimDecimals(n: number, digits: number) {
  return n.toFixed(digits).replace(/\.?0+$/, "").replace(".", ",");
}

/** Montant compact : "4,35 M CFA" (à réserver aux endroits où la place manque). */
export function fmtMoneyCompact(n: number) {
  const abs = Math.abs(n);
  const sign = n < 0 ? "-" : "";
  if (abs >= 1_000_000_000) return `${sign}${trimDecimals(abs / 1_000_000_000, 2)}${NBSP_WORD}Md${NBSP_WORD}CFA`;
  if (abs >= 1_000_000) return `${sign}${trimDecimals(abs / 1_000_000, 2)}${NBSP_WORD}M${NBSP_WORD}CFA`;
  if (abs >= 10_000) return `${sign}${trimDecimals(abs / 1000, 0)}${NBSP_WORD}k${NBSP_WORD}CFA`;
  return fmtMoney(n);
}

/** Graduation d'axe : 0, 500 k, 1 M, 1,5 M... */
export function fmtAxisMoney(n: number) {
  const abs = Math.abs(n);
  if (abs === 0) return "0";
  if (abs >= 1_000_000_000) return `${trimDecimals(abs / 1_000_000_000, 2)}${NBSP_WORD}Md`;
  if (abs >= 1_000_000) return `${trimDecimals(abs / 1_000_000, 2)}${NBSP_WORD}M`;
  if (abs >= 1000) return `${trimDecimals(abs / 1000, 0)}${NBSP_WORD}k`;
  return String(Math.round(abs));
}

/** Variation en pourcentage entre deux valeurs, null si la base est nulle. */
export function pctChange(current: number, previous: number): number | null {
  if (!previous) return null;
  return ((current - previous) / Math.abs(previous)) * 100;
}
