"use client";

import { useMemo } from "react";
import { KpiCard } from "../../_components/ui";
import { ComboChart, EmptyState, Funnel } from "../../_components/charts";
import { IcFunnel, IcClipboard, IcGraduation, IcTrend } from "../../_components/icons";
import { fmtInt } from "../../_data/core";
import { bySource, delta, funnelIn, seriesFor } from "../../_data/metrics";
import type { Kpi } from "../../_data";
import { FounderHeader, FiltersBar, Panel } from "../_components/Bits";
import { useFounderFilters } from "../_lib/useFilters";

export default function RecruitmentPage() {
  const f = useFounderFilters("thisYear");
  const { snap, campus, range, prev } = f;
  const cur = useMemo(() => funnelIn(snap, campus, range), [snap, campus, range]);
  const old = useMemo(() => (prev ? funnelIn(snap, campus, prev) : null), [snap, campus, prev]);
  const rows = useMemo(() => bySource(snap, campus, range), [snap, campus, range]);
  const series = useMemo(() => seriesFor(snap, campus, "demandes", range, prev), [snap, campus, range, prev]);

  const b = { compare: true, compareLabel: f.compareLabel, hint: "" } as const;
  const kpis: Kpi[] = [
    { ...b, id: "d", label: "Demandes", value: fmtInt(cur.demandes), raw: cur.demandes, delta: delta(cur.demandes, old?.demandes) },
    { ...b, id: "o", label: "Dossiers", value: fmtInt(cur.dossiers), raw: cur.dossiers, delta: delta(cur.dossiers, old?.dossiers) },
    { ...b, id: "i", label: "Inscrits", value: fmtInt(cur.inscrits), raw: cur.inscrits, delta: delta(cur.inscrits, old?.inscrits) },
    {
      ...b,
      id: "c",
      label: "Taux de conversion",
      value: cur.conversion === null ? "—" : `${cur.conversion.toFixed(1).replace(".", ",")} %`,
      raw: cur.conversion ?? 0,
      delta: cur.conversion !== null && old?.conversion != null ? cur.conversion - old.conversion : null,
      deltaUnit: "pts",
      sub: `${fmtInt(cur.inscrits)} inscrits / ${fmtInt(cur.demandes)} demandes`,
    },
  ];
  const icons = [<IcFunnel key="a" />, <IcClipboard key="b" />, <IcGraduation key="c" />, <IcTrend key="d" />];

  return (
    <>
      <FounderHeader title="Recrutement" subtitle={`Demandes, dossiers et inscriptions · ${f.phrase}`} />
      <FiltersBar filters={f} />
      <section className="fx-kpis" aria-label="Recrutement en chiffres">
        {kpis.map((k, i) => (
          <KpiCard key={k.id} kpi={k} size="hero" icon={icons[i]} />
        ))}
      </section>
      <div className="fx-main">
        <Panel title="Demandes reçues" hint="Nombre de demandes par période">
          <ComboChart
            labels={series.buckets.map((x) => x.label)}
            longLabels={series.buckets.map((x) => x.long)}
            values={series.values}
            previousValues={series.previousValues}
            name="Demandes"
            previousName={f.compareLabel.replace("vs ", "").replace(/^./, (c) => c.toUpperCase())}
            format={fmtInt}
            unit="count"
            ariaLabel={`Demandes reçues, ${f.phrase}`}
            empty={series.empty}
          />
        </Panel>
        <Panel title="Entonnoir" hint="Sur les demandes de la période">
          <Funnel
            steps={[
              { label: "Demandes", value: cur.demandes },
              { label: "Dossiers", value: cur.dossiers },
              { label: "Inscrits", value: cur.inscrits },
              { label: "Ont payé", value: cur.payes },
            ]}
          />
        </Panel>
      </div>
      <Panel title="Par source" hint="Quelle source amène des élèves, pas seulement des demandes">
        {rows.length === 0 ? (
          <EmptyState text="Aucune demande sur la période." />
        ) : (
          <div className="fx-table-wrap">
            <table className="fx-table">
              <thead>
                <tr><th>Source</th><th className="num">Demandes</th><th className="num">Dossiers</th><th className="num">Inscrits</th><th className="num">Taux</th></tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.source}>
                    <td><strong>{r.source}</strong></td>
                    <td className="num">{fmtInt(r.demandes)}</td>
                    <td className="num">{fmtInt(r.dossiers)}</td>
                    <td className="num">{fmtInt(r.inscrits)}</td>
                    <td className="num">{r.taux === null ? "—" : `${r.taux.toFixed(1).replace(".", ",")} %`}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </>
  );
}
