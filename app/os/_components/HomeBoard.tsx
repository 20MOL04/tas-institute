"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  MONTHLY,
  TIMELINE,
  countPending,
  fmtCompactMoney,
  fmtInt,
  type Kpi,
  type Lead,
} from "../_data";
import { KpiCard, LineChart, OsCard, PageHead, QueueCard, type QueueItem } from "./ui";
import { useOs, type OsPanel } from "./OsProvider";
import PeriodSelector, { usePeriodState } from "./PeriodSelector";
import { monthOverlaps } from "../_lib/period";

export type HomeAction = { label: string; href?: string; panel?: Exclude<OsPanel, null> };

const METRIC_COLOR = "#1d4ed8";

export function HomeBoard({
  title,
  actions,
  queue,
}: {
  title: string;
  actions: HomeAction[];
  queue?: { title: string; href: string; total: number; items: QueueItem[] };
}) {
  const { period, customStart, customEnd, range, onApply } = usePeriodState("thisYear");
  const [metric, setMetric] = useState("enroll");
  const { openPanel } = useOs();

  const view = useMemo(() => {
    const idxs = TIMELINE.map((t, i) => (monthOverlaps(t.key, range.start, range.end) ? i : -1)).filter((i) => i >= 0);
    const slice = (arr: number[]) => (idxs.length ? idxs.map((i) => arr[i]) : arr);
    const labels = idxs.length ? idxs.map((i) => TIMELINE[i].label) : MONTHLY.labels;
    const enroll = slice(MONTHLY.enrollments);
    const cash = slice(MONTHLY.revenue);
    const leads = slice(MONTHLY.leads);
    const apps = slice(MONTHLY.applications);
    const sum = (arr: number[]) => arr.reduce((s, n) => s + n, 0);

    const kpis: Kpi[] = [
      {
        id: "enroll",
        label: "Inscriptions",
        value: fmtInt(sum(enroll)),
        raw: sum(enroll),
        delta: null,
        hint: "",
        spark: enroll,
      },
      {
        id: "cash",
        label: "En caisse",
        value: `${fmtCompactMoney(sum(cash))} CFA`,
        raw: sum(cash),
        delta: null,
        hint: "",
        spark: cash,
      },
      {
        id: "leads",
        label: "Inscriptions en ligne",
        value: fmtInt(sum(leads)),
        raw: sum(leads),
        delta: null,
        hint: "",
        spark: leads,
      },
      {
        id: "apps",
        label: "Candidatures",
        value: fmtInt(sum(apps)),
        raw: sum(apps),
        delta: null,
        hint: "",
        spark: apps,
      },
    ];

    const series: Record<string, number[]> = { enroll, cash, leads, apps };
    return { labels, kpis, series };
  }, [range]);

  const active = view.kpis.find((k) => k.id === metric) ?? view.kpis[0];
  const values = view.series[active.id] ?? view.series.enroll;

  return (
    <>
      <PageHead title={title}>
        <PeriodSelector period={period} customStart={customStart} customEnd={customEnd} onApply={onApply} />
      </PageHead>
      {actions.length ? (
        <div className="os-tiles">
          {actions.map((action) => {
            if (action.panel) {
              const kind = action.panel;
              return (
                <button key={action.label} type="button" className="os-tile" onClick={() => openPanel(kind)}>
                  {action.label}
                </button>
              );
            }
            return (
              <Link key={action.href} href={action.href ?? "/os"} className="os-tile">
                {action.label}
              </Link>
            );
          })}
        </div>
      ) : null}
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
      {queue ? <QueueCard title={queue.title} href={queue.href} total={queue.total} items={queue.items} /> : null}
    </>
  );
}

export function founderQueue(): { title: string; href: string; total: number; items: QueueItem[] } {
  const review = countPending();
  const items: QueueItem[] = [
    { href: "/os/ceo/validations", label: "À valider", hint: "Décisions en attente du fondateur", count: review },
  ];
  return { title: "À valider", href: "/os/ceo/validations", total: review, items };
}

export function deskQueue(leads: Lead[]): { title: string; href: string; total: number; items: QueueItem[] } {
  const overdue = leads.filter((l) => l.overdue).length;
  const neu = leads.filter((l) => l.stage === "new").length;
  const ready = leads.filter((l) => l.stage === "approved").length;
  const items: QueueItem[] = [
    { href: "/os/crm/list?bucket=overdue", label: "À relancer", hint: "Inscriptions en ligne sans réponse", count: overdue },
    { href: "/os/crm/list?bucket=new", label: "Nouvelles demandes", hint: "Arrivées, pas encore prises", count: neu },
    { href: "/os/crm/list?bucket=approved", label: "Prêtes à inscrire", hint: "À ouvrir dans le panneau", count: ready },
  ];
  return {
    title: "À traiter",
    href: "/os/crm",
    total: overdue + neu + ready,
    items,
  };
}
