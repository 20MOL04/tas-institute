/**
 * Legacy site-analytics mock (visits by source), used only by the public Back office
 * (/admin). The founder space no longer reads it: its recruitment page counts the
 * real demandes and dossiers instead.
 */

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

