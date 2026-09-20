import { MONTHLY, TIMELINE } from "../_data";
import { monthOverlaps } from "./period";

export function monthlySlice(start: Date, end: Date) {
  const idxs = TIMELINE.map((t, i) => (monthOverlaps(t.key, start, end) ? i : -1)).filter((i) => i >= 0);
  const slice = (arr: number[]) => (idxs.length ? idxs.map((i) => arr[i]) : arr);
  const labels = idxs.length ? idxs.map((i) => TIMELINE[i].label) : MONTHLY.labels;
  const visitors = slice(MONTHLY.visitors);
  const enrollments = slice(MONTHLY.enrollments);
  const leads = slice(MONTHLY.leads);
  const applications = slice(MONTHLY.applications);
  const revenue = slice(MONTHLY.revenue);
  const sum = (arr: number[]) => arr.reduce((s, n) => s + n, 0);
  return {
    labels,
    visitors,
    enrollments,
    leads,
    applications,
    revenue,
    totals: {
      visitors: sum(visitors),
      enrollments: sum(enrollments),
      leads: sum(leads),
      applications: sum(applications),
      revenue: sum(revenue),
    },
  };
}
