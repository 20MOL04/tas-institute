"use client";

import { useMemo, useState } from "react";
import { TIMELINE, fmtInt, isFormLead, isWhatsAppLead, type Kpi } from "../_data";
import { KpiCard, LineChart, OsCard, PageHead, QueueCard } from "../_components/ui";
import PeriodSelector, { usePeriodState } from "../_components/PeriodSelector";
import { useLiveLeads } from "../_components/useLiveLeads";
import { inRange, monthOverlaps } from "../_lib/period";
import { PanelButton } from "../_components/EnrollPanels";

const METRIC_COLOR = "#1d4ed8";

export default function CrmPage() {
  const { period, customStart, customEnd, range, onApply } = usePeriodState();
  const allLeads = useLiveLeads();
  const [metric, setMetric] = useState("all");

  const leads = useMemo(
    () => allLeads.filter((l) => inRange(l.createdAt, range.start, range.end)),
    [allLeads, range],
  );

  const view = useMemo(() => {
    const months = TIMELINE.filter((t) => monthOverlaps(t.key, range.start, range.end));
    const formSeries = months.map((m) => leads.filter((l) => l.createdAt.startsWith(m.key) && isFormLead(l.source)).length);
    const waSeries = months.map((m) => leads.filter((l) => l.createdAt.startsWith(m.key) && isWhatsAppLead(l.source)).length);
    const allSeries = months.map((m) => leads.filter((l) => l.createdAt.startsWith(m.key)).length);
    const readySeries = months.map((m) =>
      leads.filter((l) => l.createdAt.startsWith(m.key) && l.stage === "approved").length,
    );
    const form = leads.filter((l) => isFormLead(l.source)).length;
    const wa = leads.filter((l) => isWhatsAppLead(l.source)).length;
    const readyCount = leads.filter((l) => l.stage === "approved").length;
    const kpis: Kpi[] = [
      { id: "form", label: "Formulaire", value: fmtInt(form), raw: form, delta: null, hint: "", spark: formSeries },
      { id: "wa", label: "WhatsApp", value: fmtInt(wa), raw: wa, delta: null, hint: "", spark: waSeries },
      { id: "all", label: "Demandes", value: fmtInt(leads.length), raw: leads.length, delta: null, hint: "", spark: allSeries },
      {
        id: "ready",
        label: "Prêtes à inscrire",
        value: fmtInt(readyCount),
        raw: readyCount,
        delta: null,
        hint: "",
        spark: readySeries,
      },
    ];
    const series: Record<string, number[]> = {
      form: formSeries,
      wa: waSeries,
      all: allSeries,
      ready: readySeries,
    };
    return { labels: months.map((m) => m.label), kpis, series };
  }, [leads, range]);

  const overdue = leads.filter((l) => l.overdue).length;
  const neu = leads.filter((l) => l.stage === "new").length;
  const contacted = leads.filter((l) => l.stage === "contacted").length;
  const visit = leads.filter((l) => l.stage === "visit").length;
  const ready = leads.filter((l) => l.stage === "approved").length;
  const total = overdue + neu + contacted + visit + ready;
  const active = view.kpis.find((k) => k.id === metric) ?? view.kpis[0];
  const values = view.series[active.id] ?? view.series.all;

  return (
    <>
      <PageHead title="Inscriptions en ligne">
        <PanelButton panel="lead">Nouvelle demande</PanelButton>
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
      <QueueCard
        title="À traiter"
        href="/os/crm/list"
        total={total}
        items={[
          {
            href: "/os/crm/list?bucket=overdue",
            label: "À relancer",
            hint: "Pas de réponse, à rappeler",
            count: overdue,
          },
          {
            href: "/os/crm/list?bucket=new",
            label: "Nouvelles demandes",
            hint: "Arrivées, pas encore contactées",
            count: neu,
          },
          {
            href: "/os/crm/list?bucket=contacted",
            label: "Contactées",
            hint: "En attente d'une suite",
            count: contacted,
          },
          {
            href: "/os/crm/list?bucket=visit",
            label: "Visites à confirmer",
            hint: "Venue au campus à honorer",
            count: visit,
          },
          {
            href: "/os/crm/list?bucket=approved",
            label: "Prêtes à inscrire",
            hint: "Acceptées, inscription à clôturer",
            count: ready,
          },
        ]}
      />
    </>
  );
}
