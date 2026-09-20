export type Period =
  | "today"
  | "yesterday"
  | "7d"
  | "30d"
  | "thisMonth"
  | "lastMonth"
  | "thisYear"
  | "lastYear"
  | "all"
  | "custom";

export const PERIOD_PRESETS: Exclude<Period, "custom">[] = [
  "today",
  "yesterday",
  "7d",
  "30d",
  "thisMonth",
  "lastMonth",
  "thisYear",
  "lastYear",
  "all",
];

const PERIOD_IDS: readonly Period[] = [...PERIOD_PRESETS, "custom"];

export function isPeriod(value: string | null | undefined): value is Period {
  return !!value && (PERIOD_IDS as readonly string[]).includes(value);
}

/** Date locale YYYY-MM-DD (évite le décalage UTC de toISOString). */
export function localIsoDate(d: Date = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function endOfToday(): Date {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d;
}

function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

export function getPeriodRange(period: Period, cStart?: string, cEnd?: string): { start: Date; end: Date } {
  const now = new Date();
  const today0 = startOfToday();
  const todayEnd = endOfToday();

  switch (period) {
    case "today":
      return { start: today0, end: todayEnd };
    case "yesterday": {
      const s = new Date(today0);
      s.setDate(s.getDate() - 1);
      const e = new Date(s);
      e.setHours(23, 59, 59, 999);
      return { start: s, end: e };
    }
    case "7d": {
      const s = new Date(today0);
      s.setDate(s.getDate() - 6);
      return { start: s, end: todayEnd };
    }
    case "30d": {
      const s = new Date(today0);
      s.setDate(s.getDate() - 29);
      return { start: s, end: todayEnd };
    }
    case "thisMonth": {
      const s = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
      return { start: s, end: todayEnd };
    }
    case "lastMonth": {
      const s = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0);
      const e = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
      return { start: s, end: e };
    }
    case "thisYear": {
      const s = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
      return { start: s, end: todayEnd };
    }
    case "lastYear": {
      const s = new Date(now.getFullYear() - 1, 0, 1, 0, 0, 0, 0);
      const e = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59, 999);
      return { start: s, end: e };
    }
    case "all": {
      const s = new Date(2000, 0, 1, 0, 0, 0, 0);
      return { start: s, end: todayEnd };
    }
    case "custom": {
      if (cStart && cEnd) return { start: new Date(cStart + "T00:00:00"), end: new Date(cEnd + "T23:59:59") };
      return { start: today0, end: todayEnd };
    }
    default:
      return { start: today0, end: todayEnd };
  }
}

export function getDateRange(period: Period, cStart?: string, cEnd?: string): { start: string; end: string } {
  const { start, end } = getPeriodRange(period, cStart, cEnd);
  return { start: localIsoDate(start), end: localIsoDate(end) };
}

export function inRange(iso: string, start: Date, end: Date): boolean {
  const day = iso.slice(0, 10);
  if (day.length < 10) return false;
  return day >= localIsoDate(start) && day <= localIsoDate(end);
}

/** Clé mois YYYY-MM qui chevauche [start, end] (inclus). */
export function monthOverlaps(key: string, start: Date, end: Date): boolean {
  const [ys, ms] = key.split("-");
  const y = Number(ys);
  const m = Number(ms);
  if (!y || !m) return false;
  const last = new Date(y, m, 0).getDate();
  const monthStart = `${key}-01`;
  const monthEnd = `${key}-${String(last).padStart(2, "0")}`;
  const a = localIsoDate(start);
  const b = localIsoDate(end);
  return monthStart <= b && monthEnd >= a;
}
