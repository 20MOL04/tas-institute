"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { fmtInt, fmtMoney, liveOutstandingTotal, liveStudents, MONTHLY, TIMELINE, type Kpi } from "../_data";
import { KpiCard, LineChart, OsCard } from "../_components/ui";
import { HomeBoard, deskQueue } from "../_components/HomeBoard";
import { useLiveLeads } from "../_components/useLiveLeads";
import { useLivePayments } from "../_components/useLivePayments";
import { useOs } from "../_components/OsProvider";
import { useOsT } from "../_components/useOsT";
import PeriodSelector, { usePeriodState } from "../_components/PeriodSelector";
import { monthOverlaps } from "../_lib/period";
import { palette } from "../../lib/theme";

const METRIC_COLOR = palette.blue;

export default function DeskHome() {
  const { t } = useOsT();
  const { session } = useOs();
  const leads = useLiveLeads();
  const payments = useLivePayments();
  const finance = session?.role === "finance";
  const queue = deskQueue(leads);

  if (finance) {
    return <FinanceHome paymentsTotal={payments.reduce((s, p) => s + p.amount, 0)} />;
  }

  return (
    <HomeBoard
      title={t.desk.title}
      actions={[
        { panel: "student", label: t.desk.enrollStudent },
        { panel: "lead", label: "Nouvelle demande" },
        { href: "/os/crm", label: t.nav.online },
        { href: "/os/students", label: t.nav.students },
      ]}
      queue={queue}
    />
  );
}

function FinanceHome({ paymentsTotal }: { paymentsTotal: number }) {
  const { period, customStart, customEnd, range, onApply } = usePeriodState("thisYear");
  const [metric, setMetric] = useState("cash");
  const students = liveStudents();
  const unpaid = students.filter((s) => s.paymentStatus === "unpaid");
  const partial = students.filter((s) => s.paymentStatus === "partial");
  const outstanding = liveOutstandingTotal();

  const view = useMemo(() => {
    const idxs = TIMELINE.map((row, i) => (monthOverlaps(row.key, range.start, range.end) ? i : -1)).filter((i) => i >= 0);
    const slice = (arr: number[]) => (idxs.length ? idxs.map((i) => arr[i]) : arr);
    const labels = idxs.length ? idxs.map((i) => TIMELINE[i].label) : MONTHLY.labels;
    const cash = slice(MONTHLY.revenue);
    return { labels, cash };
  }, [range]);

  const kpis: Kpi[] = [
    {
      id: "cash",
      label: "Encaissé",
      value: fmtMoney(paymentsTotal),
      raw: paymentsTotal,
      delta: null,
      hint: "",
      spark: view.cash,
    },
    { id: "due", label: "Reste à recouvrer", value: fmtMoney(outstanding), raw: outstanding, delta: null, hint: "" },
    { id: "unpaid", label: "Impayés", value: fmtInt(unpaid.length), raw: unpaid.length, delta: null, hint: "" },
    { id: "part", label: "Partiels", value: fmtInt(partial.length), raw: partial.length, delta: null, hint: "" },
  ];

  return (
    <>
      <div className="os-page-head">
        <h1>Comptabilité</h1>
        <div className="os-page-actions">
          <PeriodSelector period={period} customStart={customStart} customEnd={customEnd} onApply={onApply} />
        </div>
      </div>
      <div className="os-tiles">
        <Link href="/os/finance" className="os-tile">
          Paiements
        </Link>
        <Link href="/os/students" className="os-tile">
          Élèves
        </Link>
        <Link href="/os/reports" className="os-tile">
          Rapports
        </Link>
        <Link href="/os/applications" className="os-tile">
          Candidatures
        </Link>
      </div>
      <div className="os-kpi-grid">
        {kpis.map((kpi) => (
          <KpiCard key={kpi.id} kpi={kpi} active={kpi.id === metric} onSelect={() => setMetric(kpi.id)} />
        ))}
      </div>
      <OsCard title={metric === "cash" ? "Encaissé" : kpis.find((k) => k.id === metric)?.label ?? "Encaissé"}>
        <LineChart
          labels={view.labels}
          series={[{ label: "Encaissé", values: view.cash, color: METRIC_COLOR }]}
          height={280}
          filled
        />
      </OsCard>
    </>
  );
}
