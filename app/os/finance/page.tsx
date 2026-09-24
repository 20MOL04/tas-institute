"use client";

import { useMemo, useState } from "react";
import {
  OUTSTANDING_TOTAL,
  PAYMENTS_CHANGED,
  TIMELINE,
  fmtCompactMoney,
  fmtInt,
  fmtMoney,
  fmtPct,
  liveOutstandingTotal,
  type Kpi,
} from "../_data";
import { BarList, DemoBanner, KpiCard, LineChart, OsCard, PageHead } from "../_components/ui";
import PeriodSelector, { usePeriodState } from "../_components/PeriodSelector";
import { inRange, monthOverlaps } from "../_lib/period";
import PaymentsTable from "./PaymentsTable";
import { useLivePayments } from "../_components/useLivePayments";
import { useStoreTick } from "../_components/useStoreTick";
import { downloadCsv, printTable } from "../_lib/exportFile";
import { palette } from "../../lib/theme";

export default function FinancePage() {
  const { period, customStart, customEnd, range, onApply } = usePeriodState();
  const allPayments = useLivePayments();
  useStoreTick(PAYMENTS_CHANGED);
  const outstanding = typeof window === "undefined" ? OUTSTANDING_TOTAL : liveOutstandingTotal();
  const [metric, setMetric] = useState("revenue");

  const view = useMemo(() => {
    const payments = allPayments.filter((p) => inRange(p.date, range.start, range.end));
    const revenue = payments.reduce((s, p) => s + p.amount, 0);
    const methods = ["Mobile Money", "Espèces", "Virement", "Carte"] as const;
    const byMethod = methods
      .map((method) => ({
        method,
        revenue: payments.filter((p) => p.method === method).reduce((s, p) => s + p.amount, 0),
      }))
      .filter((m) => m.revenue > 0);
    const topMethod = byMethod.reduce(
      (a, b) => (a.revenue >= b.revenue ? a : b),
      byMethod[0] ?? { method: "Aucune", revenue: 0 },
    );
    const monthly = TIMELINE.filter((t) => monthOverlaps(t.key, range.start, range.end)).map((t) => ({
      label: t.label,
      value: payments.filter((p) => p.date.startsWith(t.key)).reduce((s, p) => s + p.amount, 0),
      count: payments.filter((p) => p.date.startsWith(t.key)).length,
    }));

    const kpis: Kpi[] = [
      {
        id: "revenue",
        label: "Encaissé",
        value: `${fmtCompactMoney(revenue)} CFA`,
        raw: revenue,
        delta: null,
        hint: "Somme des paiements de la période",
        spark: monthly.map((m) => m.value),
      },
      {
        id: "outstanding",
        label: "Reste à recouvrer",
        value: fmtMoney(outstanding),
        raw: outstanding,
        delta: null,
        hint: "Soldes étudiants impayés ou partiels",
      },
      {
        id: "count",
        label: "Paiements",
        value: fmtInt(payments.length),
        raw: payments.length,
        delta: null,
        hint: "Transactions de la période",
        spark: monthly.map((m) => m.count),
      },
      {
        id: "mix",
        label: "Méthode dominante",
        value: topMethod.method,
        raw: topMethod.revenue,
        delta: null,
        hint: revenue > 0 ? `${fmtPct((topMethod.revenue / revenue) * 100, 0)} de l'encaissé` : "",
      },
    ];

    return { payments, revenue, byMethod, monthly, kpis };
  }, [range, allPayments, outstanding]);

  const exportRows = view.payments.map((p) => [p.receipt, p.studentName, p.purpose, p.amount, p.method, p.date]);
  const active = view.kpis.find((k) => k.id === metric) ?? view.kpis[0];
  const chartValues =
    active.id === "count" ? view.monthly.map((r) => r.count) : view.monthly.map((r) => r.value);

  return (
    <>
      <DemoBanner />
      <PageHead title="Paiements">
        <button type="button" className="os-btn os-btn-sm" onClick={() => downloadCsv("paiements", ["Reçu", "Élève", "Objet", "Montant", "Méthode", "Date"], exportRows)}>
          Excel
        </button>
        <button type="button" className="os-btn os-btn-sm" onClick={() => printTable("Paiements", ["Reçu", "Élève", "Objet", "Montant", "Méthode", "Date"], exportRows)}>
          Imprimer
        </button>
        <PeriodSelector period={period} customStart={customStart} customEnd={customEnd} onApply={onApply} />
      </PageHead>

      <div className="os-kpi-grid">
        {view.kpis.map((kpi) => (
          <KpiCard key={kpi.id} kpi={kpi} active={kpi.id === active.id} onSelect={() => setMetric(kpi.id)} />
        ))}
      </div>

      <div className="os-grid os-grid-main os-mb">
        <OsCard title={active.id === "count" ? "Paiements mensuels" : "Encaissements mensuels"}>
          {view.monthly.length === 0 ? (
            <div className="os-empty">Aucun encaissement sur cette période.</div>
          ) : (
            <LineChart
              labels={view.monthly.map((r) => r.label)}
              series={[{ label: active.label, values: chartValues, color: palette.success }]}
              height={280}
              filled
            />
          )}
        </OsCard>
        <OsCard title="Mix des méthodes">
          <BarList
            rows={view.byMethod.map((m) => ({ label: m.method, value: m.revenue }))}
            format={(n) => `${fmtCompactMoney(n)} CFA`}
          />
        </OsCard>
      </div>

      <OsCard title="Derniers paiements">
        <PaymentsTable payments={view.payments} />
      </OsCard>
    </>
  );
}
