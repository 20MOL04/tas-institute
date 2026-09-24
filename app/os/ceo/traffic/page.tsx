"use client";

import { useMemo, useState } from "react";
import { MONTHLY, SOURCES, fmtInt, fmtMoney, type Kpi } from "../../_data";
import { KpiCard, LineChart, OsCard, PageHead } from "../../_components/ui";
import PeriodSelector, { usePeriodState } from "../../_components/PeriodSelector";
import { monthlySlice } from "../../_lib/monthlySlice";
import { useOsT } from "../../_components/useOsT";
import { palette } from "../../../lib/theme";

const METRIC_COLOR = palette.blue;

function sourceName(source: string) {
  if (source === "Direct") return "Formulaire";
  return source;
}

export default function CeoTrafficPage() {
  const { t } = useOsT();
  const { period, customStart, customEnd, range, onApply } = usePeriodState("thisYear");
  const [metric, setMetric] = useState("visits");

  const view = useMemo(() => {
    const sliced = monthlySlice(range.start, range.end);
    const yearVisits = MONTHLY.visitors.reduce((a, b) => a + b, 0);
    const q = yearVisits === 0 ? 0 : sliced.totals.visitors / yearVisits;

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
        value: fmtMoney(sliced.totals.revenue),
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

    const rows = [...SOURCES]
      .map((row) => ({
        ...row,
        visits: Math.round(row.visits * q),
        enrollments: Math.round(row.enrollments * q),
        revenue: Math.round(row.revenue * q),
      }))
      .sort((a, b) => b.enrollments - a.enrollments || b.revenue - a.revenue);

    return { labels: sliced.labels, kpis, series, rows };
  }, [range]);

  const active = view.kpis.find((k) => k.id === metric) ?? view.kpis[0];
  const values = view.series[active.id] ?? view.series.visits;

  return (
    <>
      <PageHead title={t.nav.traffic}>
        <PeriodSelector period={period} customStart={customStart} customEnd={customEnd} onApply={onApply} />
      </PageHead>
      <div className="os-kpi-grid">
        {view.kpis.map((k) => (
          <KpiCard key={k.id} kpi={k} active={k.id === active.id} onSelect={() => setMetric(k.id)} />
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
      <OsCard title="Sources">
        <div className="os-table-wrap">
          <table className="os-table">
            <thead>
              <tr>
                <th>Source</th>
                <th className="num">Visites</th>
                <th className="num">Inscriptions</th>
                <th className="num">Ça rapporte</th>
              </tr>
            </thead>
            <tbody>
              {view.rows.map((row) => (
                <tr key={row.source}>
                  <td className="os-table-strong">{sourceName(row.source)}</td>
                  <td className="num">{fmtInt(row.visits)}</td>
                  <td className="num">{fmtInt(row.enrollments)}</td>
                  <td className="num">{fmtMoney(row.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </OsCard>
    </>
  );
}
