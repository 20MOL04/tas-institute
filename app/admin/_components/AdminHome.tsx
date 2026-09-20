"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  APPLICATIONS_CHANGED,
  APPROVALS_CHANGED,
  INTAKES,
  PENDING_TRANSFERS,
  STUDENTS_CHANGED,
  fillRate,
  fmtCompactMoney,
  fmtInt,
  liveApplications,
  liveStudents,
  pendingApprovals,
  type Kpi,
} from "../../os/_data";
import { KpiCard, LineChart, OsCard, PageHead, QueueCard, type QueueItem } from "../../os/_components/ui";
import PeriodSelector, { usePeriodState } from "../../os/_components/PeriodSelector";
import { monthlySlice } from "../../os/_lib/monthlySlice";
import { useStoreTick } from "../../os/_components/useStoreTick";

const METRIC_COLOR = "#1d4ed8";

const LINKS = [
  { href: "/admin/pages", label: "Pages du site" },
  { href: "/admin/media", label: "Médias" },
  { href: "/admin/traffic", label: "Trafic" },
  { href: "/admin/blockages", label: "Blocages" },
];

function watchQueue() {
  const stuck = liveApplications().filter((a) => a.status === "documents").length;
  const waiting = pendingApprovals().length;
  const transfers = PENDING_TRANSFERS.length;
  const unpaid = liveStudents().filter((s) => s.paymentStatus === "unpaid").length;
  const full = INTAKES.filter((i) => i.status === "full" || fillRate(i) >= 100).length;
  const items: QueueItem[] = [
    { href: "/admin/blockages", label: "Dossiers coincés", hint: "Pièces manquantes", count: stuck },
    { href: "/admin/blockages", label: "À valider", hint: "Le fondateur tranche", count: waiting },
    { href: "/admin/blockages", label: "Transferts", hint: "Changements de groupe", count: transfers },
    { href: "/admin/blockages", label: "Impayés", hint: "Frais non réglés", count: unpaid },
    { href: "/admin/blockages", label: "Sessions pleines", hint: "Plus de places", count: full },
  ];
  return {
    title: "À suivre",
    href: "/admin/blockages",
    total: stuck + waiting + transfers + unpaid + full,
    items,
  };
}

export default function AdminHome() {
  const { period, customStart, customEnd, range, onApply } = usePeriodState("thisYear");
  const [metric, setMetric] = useState("visits");
  const tick = useStoreTick(APPLICATIONS_CHANGED, APPROVALS_CHANGED, STUDENTS_CHANGED);
  const queue = useMemo(() => watchQueue(), [tick]);

  const view = useMemo(() => {
    const sliced = monthlySlice(range.start, range.end);
    const kpis: Kpi[] = [
      {
        id: "visits",
        label: "Visites",
        value: fmtInt(sliced.totals.visitors),
        raw: sliced.totals.visitors,
        delta: null,
        hint: "",
        spark: sliced.visitors,
      },
      {
        id: "enroll",
        label: "Inscriptions",
        value: fmtInt(sliced.totals.enrollments),
        raw: sliced.totals.enrollments,
        delta: null,
        hint: "",
        spark: sliced.enrollments,
      },
      {
        id: "leads",
        label: "Inscriptions en ligne",
        value: fmtInt(sliced.totals.leads),
        raw: sliced.totals.leads,
        delta: null,
        hint: "",
        spark: sliced.leads,
      },
      {
        id: "rev",
        label: "Ça rapporte",
        value: `${fmtCompactMoney(sliced.totals.revenue)} CFA`,
        raw: sliced.totals.revenue,
        delta: null,
        hint: "",
        spark: sliced.revenue,
      },
    ];
    const series: Record<string, number[]> = {
      visits: sliced.visitors,
      enroll: sliced.enrollments,
      leads: sliced.leads,
      rev: sliced.revenue,
    };
    return { labels: sliced.labels, kpis, series };
  }, [range]);

  const active = view.kpis.find((k) => k.id === metric) ?? view.kpis[0];
  const values = view.series[active.id] ?? view.series.visits;

  return (
    <>
      <PageHead title="Vue d'ensemble">
        <PeriodSelector period={period} customStart={customStart} customEnd={customEnd} onApply={onApply} />
      </PageHead>
      <div className="os-tiles">
        {LINKS.map((link) => (
          <Link key={link.href} href={link.href} className="os-tile">
            {link.label}
          </Link>
        ))}
      </div>
      <div className="os-kpi-grid">
        {view.kpis.map((kpi) => (
          <KpiCard key={kpi.id} kpi={kpi} active={kpi.id === active.id} onSelect={() => setMetric(kpi.id)} />
        ))}
      </div>
      <OsCard title={active.label}>
        <LineChart
          labels={view.labels}
          series={[{ label: active.label, values, color: METRIC_COLOR }]}
          height={280}
          filled
        />
      </OsCard>
      <QueueCard title={queue.title} href={queue.href} total={queue.total} items={queue.items} />
    </>
  );
}
