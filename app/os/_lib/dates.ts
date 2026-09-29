/**
 * Dates au jour près, sans piège de fuseau : tout est en "YYYY-MM-DD" local,
 * les calculs passent par un numéro de jour UTC (pas de décalage d'heure d'été).
 */

const DAY = 86_400_000;

export function localIso(d: Date = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function dayNum(iso: string): number {
  const y = Number(iso.slice(0, 4));
  const m = Number(iso.slice(5, 7));
  const d = Number(iso.slice(8, 10));
  return Math.round(Date.UTC(y, m - 1, d) / DAY);
}

export function fromDayNum(n: number): string {
  const d = new Date(n * DAY);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
}

export function addDays(iso: string, n: number): string {
  return fromDayNum(dayNum(iso) + n);
}

export function daysBetween(fromIso: string, toIso: string): number {
  return dayNum(toIso) - dayNum(fromIso);
}

/** 0 = lundi ... 6 = dimanche. */
export function weekday(iso: string): number {
  return (new Date(dayNum(iso) * DAY).getUTCDay() + 6) % 7;
}

export function addMonths(iso: string, n: number): string {
  const y = Number(iso.slice(0, 4));
  const m = Number(iso.slice(5, 7)) - 1;
  const d = Number(iso.slice(8, 10));
  const total = y * 12 + m + n;
  const ny = Math.floor(total / 12);
  const nm = total % 12;
  const last = new Date(Date.UTC(ny, nm + 1, 0)).getUTCDate();
  return `${ny}-${String(nm + 1).padStart(2, "0")}-${String(Math.min(d, last)).padStart(2, "0")}`;
}

export function monthKey(iso: string): string {
  return iso.slice(0, 7);
}

export function monthStart(iso: string): string {
  return `${iso.slice(0, 7)}-01`;
}

export function monthEnd(iso: string): string {
  return addDays(addMonths(monthStart(iso), 1), -1);
}

/** Lundi de la semaine qui contient la date. */
export function weekStart(iso: string): string {
  return addDays(iso, -weekday(iso));
}

const MONTHS_SHORT = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."];
const MONTHS_LONG = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
const WEEKDAYS_SHORT = ["lun.", "mar.", "mer.", "jeu.", "ven.", "sam.", "dim."];

export function fmtDay(iso: string): string {
  return `${Number(iso.slice(8, 10))} ${MONTHS_SHORT[Number(iso.slice(5, 7)) - 1]}`;
}

export function fmtDayYear(iso: string): string {
  return `${fmtDay(iso)} ${iso.slice(0, 4)}`;
}

export function fmtWeekdayDay(iso: string): string {
  return `${WEEKDAYS_SHORT[weekday(iso)]} ${Number(iso.slice(8, 10))}`;
}

export function fmtMonthShort(iso: string): string {
  return MONTHS_SHORT[Number(iso.slice(5, 7)) - 1];
}

export function fmtMonthYear(iso: string): string {
  const m = MONTHS_LONG[Number(iso.slice(5, 7)) - 1];
  return `${m.charAt(0).toUpperCase()}${m.slice(1)} ${iso.slice(0, 4)}`;
}

export function fmtHm(time: string): string {
  return time.slice(0, 5);
}

/** "il y a 3 jours" à partir d'un ISO date ou datetime. */
export function ago(iso: string, today: string): string {
  const d = daysBetween(iso.slice(0, 10), today);
  if (d <= 0) return "aujourd'hui";
  if (d === 1) return "hier";
  if (d < 30) return `il y a ${d} jours`;
  const mo = Math.round(d / 30);
  return `il y a ${mo} mois`;
}
