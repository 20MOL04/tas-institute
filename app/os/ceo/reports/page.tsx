"use client";

import { useMemo } from "react";
import { KpiCard, fmtDelta } from "../../_components/ui";
import { ComboChart, FillBars, Funnel } from "../../_components/charts";
import { IcDownload, IcFile } from "../../_components/icons";
import { useToast } from "../../_components/Toast";
import { downloadCsv } from "../../_lib/exportFile";
import { fmtAxisMoney, fmtMoney } from "../../_data/core";
import { founderKpis } from "../../_data/kpis";
import { AGING_LABEL, agingOn, computeAlerts, fillOn, funnelIn, seriesFor, type AgingKey } from "../../_data/metrics";
import { fmtDayYear } from "../../_lib/dates";
import { FounderHeader, FiltersBar, Panel } from "../_components/Bits";
import { useFounderFilters } from "../_lib/useFilters";

export default function ReportPage() {
  const f = useFounderFilters("thisMonth");
  const { snap, campus, range, prev } = f;
  const toast = useToast();
  const kpis = useMemo(() => founderKpis(snap, campus, range, prev, f.compareLabel), [snap, campus, range, prev, f.compareLabel]);
  const series = useMemo(() => seriesFor(snap, campus, "encaisse", range, prev), [snap, campus, range, prev]);
  const aging = useMemo(() => agingOn(snap, campus, snap.today), [snap, campus]);
  const fill = useMemo(() => fillOn(snap, campus, range.end), [snap, campus, range.end]);
  const funnel = useMemo(() => funnelIn(snap, campus, range), [snap, campus, range]);
  const alerts = useMemo(() => computeAlerts(snap, campus), [snap, campus]);
  const title = `Rapport · ${fmtDayYear(range.start)}${range.start !== range.end ? ` au ${fmtDayYear(range.end)}` : ""}`;

  function exportCsv() {
    const before = prev ? founderKpis(snap, campus, prev, null) : null;
    const all = [...kpis.hero, ...kpis.mini];
    downloadCsv(
      `rapport-${range.start}-${range.end}`,
      ["Indicateur", "Valeur", "Période précédente", "Variation"],
      all.map((k, i) => [k.label, k.value, before ? [...before.hero, ...before.mini][i].value : "—", fmtDelta(k.delta, k.deltaUnit)]),
    );
    toast.success("Rapport exporté ✓");
  }

  return (
    <div className="fx-report">
      <div className="fx-report-title">
        <h1>TAS English Institute — {title}</h1>
        <p>Généré le {fmtDayYear(snap.today)} à partir des mêmes données que le tableau de bord.</p>
      </div>
      <div className="fx-noprint">
        <FounderHeader title="Rapports" subtitle={`${title.replace("Rapport · ", "")} · rapport d'une page`}>
          <button type="button" className="os-btn" onClick={exportCsv}>
            <IcDownload /> Exporter (CSV)
          </button>
          <button type="button" className="os-btn os-btn-primary" onClick={() => window.print()}>
            <IcFile /> Imprimer / PDF
          </button>
        </FounderHeader>
        <div style={{ marginTop: 12 }}>
          <FiltersBar filters={f} />
        </div>
      </div>

      <section className="fx-keyfigs" aria-label="Chiffres clés">
        {[...kpis.hero, ...kpis.mini].map((k) => (
          <KpiCard key={k.id} kpi={k} size="mini" />
        ))}
      </section>

      <Panel title="Encaissé" hint={f.phrase}>
        <ComboChart
          labels={series.buckets.map((b) => b.label)}
          longLabels={series.buckets.map((b) => b.long)}
          values={series.values}
          previousValues={series.previousValues}
          name="Encaissé"
          previousName={f.compareLabel.replace("vs ", "").replace(/^./, (c) => c.toUpperCase())}
          format={fmtMoney}
          axisFormat={fmtAxisMoney}
          unit="money"
          ariaLabel="Encaissé"
          empty={series.empty}
        />
      </Panel>

      <div className="fx-duo">
        <Panel title="Impayés par ancienneté">
          <ul className="fx-list">
            {(Object.keys(aging) as AgingKey[]).map((k) => (
              <li key={k}>
                <div className="fx-row">
                  <span className="fx-row-main"><strong>{AGING_LABEL[k]}</strong><span>{aging[k].count} élève{aging[k].count > 1 ? "s" : ""}</span></span>
                  <span className="fx-row-side"><strong>{fmtMoney(aging[k].amount)}</strong></span>
                </div>
              </li>
            ))}
          </ul>
        </Panel>
        <Panel title="Du contact à l'inscription">
          <Funnel steps={[{ label: "Demandes", value: funnel.demandes }, { label: "Dossiers", value: funnel.dossiers }, { label: "Inscrits", value: funnel.inscrits }, { label: "Ont payé", value: funnel.payes }]} />
        </Panel>
      </div>

      <div className="fx-duo">
        <Panel title="Remplissage des sessions">
          <FillBars threshold={snap.settings.fillPct} rows={fill.rows.map((r) => ({ id: r.session.id, label: r.session.name, taken: r.taken, capacity: r.capacity }))} />
        </Panel>
        <Panel title="Alertes principales">
          {alerts.length === 0 ? (
            <p className="fx-pad fx-muted">Aucune alerte.</p>
          ) : (
            <ul className="fx-list">
              {alerts.map((a) => (
                <li key={a.id}>
                  <div className="fx-alert"><span className={`fx-alert-dot fx-lvl-${a.level}`} /><span><strong>{a.title}</strong><span>{a.detail}</span></span></div>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  );
}
