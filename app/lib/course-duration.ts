/** Durées proposées à l'inscription, site et app. Une seule liste. */
export const COURSE_DURATION_MONTHS = [3, 6, 9] as const;

export type CourseDurationMonths = (typeof COURSE_DURATION_MONTHS)[number];

export function isCourseDuration(value: number): value is CourseDurationMonths {
  return value === 3 || value === 6 || value === 9;
}

export function durationLabelFr(months: CourseDurationMonths) {
  return `${months} mois`;
}

export function durationLabelEn(months: CourseDurationMonths) {
  return `${months} months`;
}

export function parseDuration(value: string): CourseDurationMonths | null {
  const n = Number(value);
  return isCourseDuration(n) ? n : null;
}
