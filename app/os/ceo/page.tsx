"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { KpiCard, fmtDelta } from "../_components/ui";
import { EmptyState, Segmented, TrendChart } from "../_components/charts";
import { IcAlert, IcArrowUpRight, IcCheckCircle, IcCoins, IcDownload, IcFile, IcGlobe, IcInbox, IcCalendar, IcTrend, IcUser, IcUsers, IcWallet } from "../_components/icons";
import { useOs } from "../_components/OsProvider";
import { useToast } from "../_components/Toast";
import { downloadCsv } from "../_lib/exportFile";
import { fmtAxisMoney, fmtInt, fmtMoney } from "../_data/core";
import { founderKpis } from "../_data/kpis";
import { computeAlerts, pendingByKind, seriesFor, type SeriesMetric } from "../_data/metrics";
import { ago } from "../_lib/dates";
import { FiltersBar, Panel, SeeAll } from "./_components/Bits";
import { useFounderFilters } from "./_lib/useFilters";
import { useDisplayName } from "./_lib/useDisplayName";

const KIND_LABEL: Record<string, string> = {
  enroll: "Inscriptions",
  transfer: "Transferts",
  admin: "Nouveaux administrateurs",
  teacher: "Nouveaux enseignants",
  exclude: "Exclusions",
  unblock: "Déblocages",
  reject: "Refus de candidature",
};

const METRICS: { value: SeriesMetric; label: string }[] = [
  { value: "encaisse", label: "Montant encaissé" },
  { value: "inscriptions", label: "Inscriptions" },
  { value: "enligne", label: "Inscriptions en ligne" },
  { value: "encours", label: "Demandes en cours" },
  { value: "presence", label: "Taux de présence" },
];

/** Carte -> courbe : seuls les indicateurs qui ont une série dans le temps sont cliquables. */
const CARD_METRIC: Record<string, SeriesMetric> = { encaisse: "encaisse", enligne: "enligne", encours: "encours", presence: "presence" };

const CARD_ICON: Record<string, React.ReactNode> = {
  effectif: <IcUsers />,
  encaisse: <IcWallet />,
  enligne: <IcGlobe />,
  encours: <IcInbox />,
  reste: <IcCoins />,
  remplissage: <IcCalendar />,
  presence: <IcCheckCircle />,
  danger: <IcAlert />,
};

function greeting(): string {
  return new Date().getHours() >= 18 ? "Bonsoir" : "Bonjour";
}

export default function CeoDashboard() {
  const f = useFounderFilters("thisMonth");
  const { snap, range, prev, campus } = f;
  const { openPanel } = useOs();
  const toast = useToast();
  const name = useDisplayName();
  const [hello, setHello] = useState("Bonjour");
  useEffect(() => setHello(greeting()), []);
  const [metric, setMetric] = useState<SeriesMetric>("encaisse");

  const kpis = useMemo(() => founderKpis(snap, campus, range, prev, f.compareLabel), [snap, campus, range, prev, f.compareLabel]);
  const series = useMemo(() => seriesFor(snap, campus, metric, range, prev), [snap, campus, metric, range, prev]);
  const alerts = useMemo(() => computeAlerts(snap, campus), [snap, campus]);
  const pending = useMemo(() => pendingByKind(snap), [snap]);
  const pendingTotal = Array.from(pending.values()).reduce((s, n) => s + n, 0);
  const recent = snap.audit.slice(0, 5);

  const money = metric === "encaisse";
  const rate = metric === "presence";
  const format = money ? fmtMoney : rate ? (n: number) => `${String(Math.round(n * 10) / 10).replace(".", ",")} %` : fmtInt;
  const axisFormat = money ? fmtAxisMoney : rate ? (n: number) => `${n} %` : fmtInt;
  const metricLabel = METRICS.find((m) => m.value === metric)?.label ?? "";

  function exportKpis() {
    const before = prev ? founderKpis(snap, campus, prev, null) : null;
    const rows = [...kpis.hero, ...kpis.mini].map((k, i) => {
      const old = before ? [...before.hero, ...before.mini][i] : null;
      return [k.label, k.value, old ? old.value : "—", fmtDelta(k.delta, k.deltaUnit)];
    });
    downloadCsv(`indicateurs-${range.start}-${range.end}`, ["Indicateur", "Valeur", "Période précédente", "Variation"], rows);
    toast.success("Indicateurs exportés ✓");
  }

  const card = (k: (typeof kpis.hero)[number], size: "hero" | "mini") => {
    const target = CARD_METRIC[k.id];
    return <KpiCard key={k.id} kpi={k} size={size} icon={CARD_ICON[k.id]} active={target === metric} onSelect={target ? () => setMetric(target) : undefined} />;
  };

  return (
    <>
      <div className="fx-header fx-dash-header">
        <div>
          <h1>{name ? `${hello}, ${name}` : hello}</h1>
          <p>Votre espace en un coup d&apos;œil{f.phrase ? ` · ${f.phrase}` : ""}</p>
        </div>
        <div className="fx-header-actions fx-dash-tools">
          <FiltersBar filters={f} />
          <Link href={`/os/ceo/reports?${f.query}`} className="os-btn">
            <IcFile /> Générer le rapport
          </Link>
          <Link href="/os/ceo/validations" className="os-btn os-btn-primary">
            Valider ({pendingTotal}) <IcArrowUpRight />
          </Link>
        </div>
      </div>

      <section className="fx-kpis" aria-label="Indicateurs principaux">
        {kpis.hero.map((k) => card(k, "hero"))}
      </section>
      <section className="fx-kpis" aria-label="Autres indicateurs">
        {kpis.mini.map((k) => card(k, "mini"))}
      </section>

      <div className="fx-main">
        <Panel
          title="Activité"
          hint={series.window.start !== range.start ? `${metricLabel} · 7 derniers jours` : `${metricLabel} · ${f.phrase}`}
          className="fx-chart-card"
          action={<Segmented label="Indicateur du graphique" value={metric} onChange={setMetric} options={METRICS} />}
        >
          <TrendChart
            labels={series.buckets.map((b) => b.label)}
            longLabels={series.buckets.map((b) => b.long)}
            values={series.values}
            previousValues={series.previousValues}
            previousLabels={series.previous ? series.previous.map((b) => b?.long ?? null) : null}
            name={metricLabel}
            previousName={f.compareLabel.replace("vs ", "").replace(/^./, (c) => c.toUpperCase())}
            format={format}
            axisFormat={axisFormat}
            unit={money ? "money" : rate ? "pct" : "count"}
            gapZero={rate}
            ariaLabel={`${metricLabel}, ${f.phrase}`}
            empty={series.empty}
          />
        </Panel>

        <Panel title="Actions rapides" className="fx-actions-card">
          <div className="fx-actions">
            <Link href="/os/ceo/validations" className="fx-action">
              <IcCheckCircle /> Valider les décisions
              {pendingTotal > 0 ? <span className="fx-action-count">{pendingTotal}</span> : null}
            </Link>
            <button type="button" className="fx-action" onClick={() => openPanel("admin")}>
              <IcUser /> Créer un administrateur
            </button>
            <Link href={`/os/ceo/finance?${f.query}`} className="fx-action">
              <IcWallet /> Voir les finances
            </Link>
            <Link href="/os/ceo/reports?p=thisMonth" className="fx-action">
              <IcFile /> Rapport du mois
            </Link>
            <button type="button" className="fx-action" onClick={exportKpis}>
              <IcDownload /> Exporter (CSV)
            </button>
          </div>
        </Panel>
      </div>

      <div className="fx-duo">
        <Panel title="À décider" action={<SeeAll href="/os/ceo/validations">Tout valider</SeeAll>}>
          {pendingTotal === 0 ? (
            <EmptyState title="Rien à valider" text="Toutes les demandes ont reçu une réponse." icon={<IcCheckCircle />} />
          ) : (
            <ul className="fx-list">
              {Array.from(pending.entries()).map(([kind, n]) => (
                <li key={kind}>
                  <Link href={`/os/ceo/validations?kind=${kind}`} className="fx-row">
                    <span className="fx-row-main">
                      <strong>{KIND_LABEL[kind] ?? kind}</strong>
                    </span>
                    <span className="fx-row-count">{n}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>
        <Panel title="Alertes" hint={`${alerts.length} à surveiller`}>
          {alerts.length === 0 ? (
            <EmptyState title="Aucune alerte" text="Aucun seuil n'est dépassé." icon={<IcTrend />} />
          ) : (
            <ul className="fx-list">
              {alerts.map((a) => (
                <li key={a.id}>
                  <Link href={a.href} className="fx-alert">
                    <span className={`fx-alert-dot fx-lvl-${a.level}`} aria-hidden="true" />
                    <span>
                      <strong>{a.title}</strong>
                      <span>{a.detail}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      <Panel title="Activité récente" action={<SeeAll href="/os/ceo/journal" />}>
        {recent.length === 0 ? (
          <p className="fx-pad fx-muted">Les actions de l&apos;équipe apparaîtront ici.</p>
        ) : (
          <ul className="fx-list">
            {recent.map((e) => (
              <li key={e.id}>
                <div className="fx-row">
                  <span className="fx-row-main">
                    <strong>{e.action}</strong>
                    <span>
                      {e.actor} · {e.detail}
                    </span>
                  </span>
                  <span className="fx-row-side">
                    {ago(e.at, snap.today)}
                    <br />
                    {e.at.slice(11, 16)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </>
  );
}

