"use client";

import { useMemo, useState } from "react";
import {
  APPLICATIONS,
  INTAKES,
  MONTHLY,
  OUTSTANDING_TOTAL,
  PAYMENTS,
  PROGRAMS,
  STUDENTS,
  TIMELINE,
  fillRate,
  fmtCompactMoney,
  fmtInt,
  fmtMoney,
  fmtPct,
  type Kpi,
} from "../_data";
import { BarList, KpiCard, LineChart, OsCard, PageHead } from "../_components/ui";
import PeriodSelector, { usePeriodState } from "../_components/PeriodSelector";
import { inRange, monthOverlaps } from "../_lib/period";

const METRIC_COLOR = "#1d4ed8";

export default function ReportsPage() {
  const { period, customStart, customEnd, range, onApply } = usePeriodState();
  const [metric, setMetric] = useState("enroll");

  const view = useMemo(() => {
    const leads = TIMELINE.reduce(
      (s, t, i) => (monthOverlaps(t.key, range.start, range.end) ? s + MONTHLY.leads[i] : s),
      0,
    );
    const enrollments = TIMELINE.reduce(
      (s, t, i) => (monthOverlaps(t.key, range.start, range.end) ? s + MONTHLY.enrollments[i] : s),
      0,
    );
    const revenue = TIMELINE.reduce(
      (s, t, i) => (monthOverlaps(t.key, range.start, range.end) ? s + MONTHLY.revenue[i] : s),
      0,
    );
    const applications = APPLICATIONS.filter((a) => inRange(a.submittedAt, range.start, range.end));
    const openApplications = applications.filter((a) => a.status !== "enrolled" && a.status !== "rejected");
    const periodPayments = PAYMENTS.filter((p) => inRange(p.date, range.start, range.end));
    const unpaid = STUDENTS.filter((s) => s.paymentStatus === "unpaid");
    const partial = STUDENTS.filter((s) => s.paymentStatus === "partial");
    const monthly = TIMELINE.filter((t) => monthOverlaps(t.key, range.start, range.end)).map((t) => {
      const i = TIMELINE.indexOf(t);
      return {
        label: t.label,
        enroll: MONTHLY.enrollments[i] ?? 0,
        cash: MONTHLY.revenue[i] ?? 0,
        leads: MONTHLY.leads[i] ?? 0,
        apps: MONTHLY.applications[i] ?? 0,
      };
    });

    const paymentMix = (["paid", "partial", "unpaid"] as const).map((status) => ({
      label: status === "paid" ? "À jour" : status === "partial" ? "Partiel" : "Impayé",
      value: STUDENTS.filter((s) => s.paymentStatus === status).length,
    }));

    const kpis: Kpi[] = [
      {
        id: "leads",
        label: "Inscriptions en ligne",
        value: fmtInt(leads),
        raw: leads,
        delta: null,
        hint: "",
        spark: monthly.map((m) => m.leads),
      },
      {
        id: "enroll",
        label: "Inscriptions",
        value: fmtInt(enrollments),
        raw: enrollments,
        delta: null,
        hint: "",
        spark: monthly.map((m) => m.enroll),
      },
      {
        id: "cash",
        label: "En caisse",
        value: `${fmtCompactMoney(revenue)} CFA`,
        raw: revenue,
        delta: null,
        hint: "",
        spark: monthly.map((m) => m.cash),
      },
      {
        id: "open",
        label: "Candidatures ouvertes",
        value: fmtInt(openApplications.length),
        raw: openApplications.length,
        delta: null,
        hint: "",
        spark: monthly.map((m) => m.apps),
      },
    ];

    const series: Record<string, number[]> = {
      leads: monthly.map((m) => m.leads),
      enroll: monthly.map((m) => m.enroll),
      cash: monthly.map((m) => m.cash),
      open: monthly.map((m) => m.apps),
    };

    return {
      kpis,
      labels: monthly.map((m) => m.label),
      series,
      periodCash: periodPayments.reduce((s, p) => s + p.amount, 0),
      unpaid: unpaid.length,
      partial: partial.length,
      paymentMix,
    };
  }, [range]);

  const active = view.kpis.find((k) => k.id === metric) ?? view.kpis[0];
  const values = view.series[active.id] ?? view.series.enroll;

  return (
    <>
      <PageHead title="Rapports">
        <PeriodSelector period={period} customStart={customStart} customEnd={customEnd} onApply={onApply} />
      </PageHead>

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

      <div className="os-grid os-grid-2">
        <OsCard title="Sessions">
          <div className="os-table-wrap">
            <table className="os-table">
              <thead>
                <tr>
                  <th>Session</th>
                  <th className="num">Places</th>
                  <th className="num">Remplissage</th>
                </tr>
              </thead>
              <tbody>
                {INTAKES.map((intake) => (
                  <tr key={intake.id}>
                    <td>
                      <strong className="os-table-strong">{PROGRAMS.find((p) => p.id === intake.programId)?.name ?? intake.programId}</strong>
                      <div className="os-muted os-small">{intake.name}</div>
                    </td>
                    <td className="num">
                      {intake.enrolled}/{intake.capacity}
                    </td>
                    <td className="num">{fmtPct(fillRate(intake), 0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </OsCard>

        <OsCard title="Paiements">
          <div className="os-mb">
            <div className="os-kpi-label">Reste à recouvrer</div>
            <div className="os-kpi-value">{fmtMoney(OUTSTANDING_TOTAL)}</div>
            <p className="os-small os-muted">
              {fmtInt(view.unpaid)} impayés, {fmtInt(view.partial)} dossiers partiels. Encaissé sur la période :{" "}
              {fmtCompactMoney(view.periodCash)} CFA.
            </p>
          </div>
          <BarList rows={view.paymentMix} />
        </OsCard>
      </div>
    </>
  );
}
