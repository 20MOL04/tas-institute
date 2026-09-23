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
      { id: "tas-alajo", schoolId: "tas", name: "Campus Alajo", area: "Alajo Polo Junction", rooms: 8 },
      { id: "tas-kotobabi", schoolId: "tas", name: "Campus Kotobabi", area: "Kotobabi New Town", rooms: 5 },
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
};

/** The real number of intakes per year is unknown — these are prototype values. */
export const INTAKES: Intake[] = [
  {
    id: "in-2026-10-eng-int",
    schoolId: "tas",
    campusId: "tas-alajo",
    programId: "eng-intensive",
    name: "Rentrée octobre 2026",
    start: "2026-10-05",
    end: "2027-01-23",
    capacity: 60,
    applications: 74,
    enrolled: 48,
    status: "filling",
  },
  {
    id: "in-2026-10-eng-long",
    schoolId: "tas",
    campusId: "tas-alajo",
    programId: "eng-long",
    name: "Rentrée octobre 2026",
    start: "2026-10-05",
    end: "2027-04-30",
    capacity: 45,
    applications: 39,
    enrolled: 27,
    status: "open",
  },
  {
    id: "in-2026-10-comp",
    schoolId: "tas",
    campusId: "tas-kotobabi",
    programId: "computer",
    name: "Rentrée octobre 2026",
    start: "2026-10-12",
    end: "2026-12-18",
    capacity: 30,
    applications: 33,
    enrolled: 29,
    status: "full",
  },
  {
    id: "in-2027-01-eng-int",
    schoolId: "tas",
    campusId: "tas-alajo",
    programId: "eng-intensive",
    name: "Rentrée janvier 2027",
    start: "2027-01-11",
    end: "2027-04-30",
    capacity: 60,
    applications: 21,
    enrolled: 6,
    status: "open",
  },
  {
    id: "in-2026-10-abla",
    schoolId: "abla",
    campusId: "abla-osu",
    programId: "abla-business",
    name: "Session octobre 2026",
    start: "2026-10-05",
    end: "2027-01-30",
    capacity: 40,
    applications: 31,
    enrolled: 22,
    status: "filling",
  },
];

/* ----- rooms and groups --------------------------------------------------- */

export type Group = {
  id: string;
  schoolId: string;
  campusId: string;
  programId: string;
  level: string;
  name: string;
  teacherId: string;
  room: string;
  capacity: number;
  students: number;
  schedule: string;
};

export const CLASS_CODES = ["B1", "B2", "B3", "I1", "I2", "I3", "P1", "P2", "P3"] as const;

export type ClassCode = (typeof CLASS_CODES)[number];

function englishClass(
  id: string,
  programId: "eng-intensive" | "eng-long",
  code: ClassCode,
  teacherId: string,
  room: string,
): Group {
  const intensive = programId === "eng-intensive";
  return {
    id,
    schoolId: "tas",
    campusId: "tas-alajo",
    programId,
    level: code,
    name: code,
    teacherId,
    room,
    capacity: intensive ? 18 : 16,
    students: intensive ? 15 : 13,
    schedule: intensive ? "Lun–Ven 08:00–16:00" : "Lun–Ven 09:00–14:00",
  };
}

export const GROUPS: Group[] = [
  englishClass("g-01", "eng-intensive", "B1", "t-01", "Salle 1"),
  englishClass("g-02", "eng-intensive", "B2", "t-02", "Salle 2"),
  englishClass("g-03", "eng-intensive", "B3", "t-03", "Salle 3"),
  englishClass("g-int-i1", "eng-intensive", "I1", "t-01", "Salle 6"),
  englishClass("g-int-i2", "eng-intensive", "I2", "t-02", "Salle 7"),
  englishClass("g-int-i3", "eng-intensive", "I3", "t-03", "Salle 8"),
  englishClass("g-int-p1", "eng-intensive", "P1", "t-04", "Salle 9"),
  englishClass("g-int-p2", "eng-intensive", "P2", "t-05", "Salle 10"),
  englishClass("g-int-p3", "eng-intensive", "P3", "t-01", "Salle 11"),
  englishClass("g-04", "eng-long", "B1", "t-04", "Salle 4"),
  englishClass("g-05", "eng-long", "B2", "t-05", "Salle 5"),
  englishClass("g-lng-b3", "eng-long", "B3", "t-04", "Salle 12"),
  englishClass("g-lng-i1", "eng-long", "I1", "t-05", "Salle 13"),
  englishClass("g-lng-i2", "eng-long", "I2", "t-04", "Salle 14"),
  englishClass("g-lng-i3", "eng-long", "I3", "t-05", "Salle 15"),
  englishClass("g-lng-p1", "eng-long", "P1", "t-02", "Salle 16"),
  englishClass("g-lng-p2", "eng-long", "P2", "t-03", "Salle 17"),
  englishClass("g-lng-p3", "eng-long", "P3", "t-04", "Salle 18"),
  { id: "g-06", schoolId: "tas", campusId: "tas-kotobabi", programId: "computer", level: "Débutant", name: "INF-D-1", teacherId: "t-06", room: "Lab 1", capacity: 15, students: 15, schedule: "Lun–Ven 14:00–17:00" },
  { id: "g-07", schoolId: "tas", campusId: "tas-kotobabi", programId: "computer", level: "Intermédiaire", name: "INF-I-1", teacherId: "t-07", room: "Lab 1", capacity: 15, students: 12, schedule: "Lun–Ven 09:00–12:00" },
  { id: "g-comp-a", schoolId: "tas", campusId: "tas-kotobabi", programId: "computer", level: "Avancé", name: "INF-A-1", teacherId: "t-06", room: "Lab 1", capacity: 15, students: 9, schedule: "Lun–Ven 14:00–17:00" },
  { id: "g-08", schoolId: "abla", campusId: "abla-osu", programId: "abla-business", level: "B2", name: "BUS-B2-1", teacherId: "t-14", room: "Room 2", capacity: 14, students: 11, schedule: "Lun–Jeu 17:00–21:00" },
];

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

const NBSP = "\u202f";

export function fmtInt(n: number) {
  return Math.round(n).toLocaleString("fr-FR").replace(/\s/g, NBSP);
}

/** Money in CFA, the currency the school quotes its housing in. */
export function fmtMoney(n: number) {
  return `${fmtInt(n)}${NBSP}CFA`;
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
  const date = d.toISOString().slice(0, 10);
  const time = d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", hour12: false });
  return { date, time, iso: d.toISOString() };
}

/* ----- shared time axis --------------------------------------------------- */

export const MONTHS_FR = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];

/** Calendar year 2026, so monthly series line up with payment dates. */
export const TIMELINE = MONTHS_FR.map((label, month) => ({
  key: `2026-${String(month + 1).padStart(2, "0")}`,
  label,
  year: 2026,
  month,
}));
