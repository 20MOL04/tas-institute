"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { KpiCard, fmtDelta } from "../_components/ui";
import { ComboChart, Donut, EmptyState, Funnel, FillBars, Segmented } from "../_components/charts";
import { IcAlert, IcCalendar, IcCheckCircle, IcCoins, IcDownload, IcFile, IcFunnel, IcTrend, IcUser, IcUsers, IcWallet } from "../_components/icons";
import { useOs } from "../_components/OsProvider";
import { useToast } from "../_components/Toast";
import { downloadCsv } from "../_lib/exportFile";
import { fmtAxisMoney, fmtInt, fmtMoney } from "../_data/core";
import { founderKpis } from "../_data/kpis";
import { computeAlerts, fillOn, funnelIn, paymentMix, pendingByKind, seriesFor, type SeriesMetric } from "../_data/metrics";
import { ago } from "../_lib/dates";
import { FounderHeader, FiltersBar, Panel, SeeAll } from "./_components/Bits";
import { useFounderFilters } from "./_lib/useFilters";

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
  { value: "actifs", label: "Élèves actifs" },
  { value: "encaisse", label: "Encaissé" },
  { value: "reste", label: "Reste à recouvrer" },
  { value: "remplissage", label: "Remplissage" },
  { value: "inscriptions", label: "Inscriptions" },
];

const HERO_ICON = { actifs: <IcUsers />, encaisse: <IcWallet />, reste: <IcCoins />, remplissage: <IcCalendar /> } as const;
const MINI_ICON = { inscriptions: <IcUser />, conversion: <IcFunnel />, presence: <IcCheckCircle />, danger: <IcAlert /> } as const;

export default function CeoDashboard() {
  const f = useFounderFilters("thisMonth");
  const { snap, range, prev, campus } = f;
  const { openPanel } = useOs();
  const toast = useToast();
  const [metric, setMetric] = useState<SeriesMetric>("encaisse");

  const kpis = useMemo(() => founderKpis(snap, campus, range, prev, f.compareLabel), [snap, campus, range, prev, f.compareLabel]);
  const series = useMemo(() => seriesFor(snap, campus, metric, range, prev), [snap, campus, metric, range, prev]);
  const funnel = useMemo(() => funnelIn(snap, campus, range), [snap, campus, range]);
  const mix = useMemo(() => paymentMix(snap, campus, range.end), [snap, campus, range.end]);
  const fill = useMemo(() => fillOn(snap, campus, range.end), [snap, campus, range.end]);
  const alerts = useMemo(() => computeAlerts(snap, campus), [snap, campus]);
  const pending = useMemo(() => pendingByKind(snap), [snap]);
  const pendingTotal = Array.from(pending.values()).reduce((s, n) => s + n, 0);
  const recent = snap.audit.slice(0, 5);

  const money = metric === "encaisse" || metric === "reste";
  const format = money ? fmtMoney : metric === "remplissage" ? (n: number) => `${String(Math.round(n * 10) / 10).replace(".", ",")} %` : fmtInt;
  const axisFormat = money ? fmtAxisMoney : metric === "remplissage" ? (n: number) => `${n} %` : fmtInt;
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

  return (
    <>
      <FounderHeader title="Tableau de bord" subtitle={`Vue d'ensemble · ${f.phrase}`}>
        <Link href={`/os/ceo/reports?${f.query}`} className="os-btn">
          <IcFile /> Générer le rapport
        </Link>
        <Link href="/os/ceo/validations" className="os-btn os-btn-primary">
          Valider ({pendingTotal})
        </Link>
      </FounderHeader>
      <FiltersBar filters={f} />

      <section className="fx-kpis" aria-label="Indicateurs principaux">
        {kpis.hero.map((k) => {
          const target: SeriesMetric | null = k.id === "actifs" || k.id === "encaisse" || k.id === "reste" || k.id === "remplissage" ? (k.id as SeriesMetric) : null;
          return (
            <KpiCard
              key={k.id}
              kpi={k}
              size="hero"
              icon={HERO_ICON[k.id as keyof typeof HERO_ICON]}
              active={target === metric}
              onSelect={target ? () => setMetric(target) : undefined}
            />
          );
        })}
      </section>
      <section className="fx-kpis" aria-label="Autres indicateurs">
        {kpis.mini.map((k) => (
          <KpiCard key={k.id} kpi={k} size="mini" icon={MINI_ICON[k.id as keyof typeof MINI_ICON]} />
        ))}
      </section>

      <div className="fx-main">
        <Panel
          title="Activité"
          hint={series.window.start !== range.start ? "Vue sur 7 jours pour situer la période" : `${metricLabel} · ${f.phrase}`}
          action={<Segmented label="Indicateur du graphique" value={metric} onChange={setMetric} options={METRICS} />}
        >
          <ComboChart
            labels={series.buckets.map((b) => b.label)}
            longLabels={series.buckets.map((b) => b.long)}
            values={series.values}
            previousValues={series.previousValues}
            previousLabels={series.previous ? series.previous.map((b) => b?.long ?? null) : null}
            name={metricLabel}
            previousName={f.compareLabel.replace("vs ", "").replace(/^./, (c) => c.toUpperCase())}
            format={format}
            axisFormat={axisFormat}
            unit={money ? "money" : metric === "remplissage" ? "pct" : "count"}
            ariaLabel={`${metricLabel}, ${f.phrase}`}
            empty={series.empty}
          />
        </Panel>

        <Panel title="Actions rapides">
          <div className="fx-actions">
            <Link href="/os/ceo/validations" className="fx-action">
              <IcCheckCircle /> Valider les décisions
              {pendingTotal > 0 ? <span className="fx-action-count">{pendingTotal}</span> : null}
            </Link>
            <button type="button" className="fx-action" onClick={() => openPanel("admin")}>
              <IcUser /> Créer un administrateur
            </button>
            <Link href="/os/ceo/reports?p=thisMonth" className="fx-action">
              <IcFile /> Rapport du mois
            </Link>
            <button type="button" className="fx-action" onClick={exportKpis}>
              <IcDownload /> Exporter (CSV / Excel)
            </button>
          </div>
        </Panel>
      </div>

      <div className="fx-tri">
        <Panel title="Du contact à l'inscription" hint="Demandes reçues sur la période">
          <Funnel
            steps={[
              { label: "Demandes", value: funnel.demandes },
              { label: "Dossiers", value: funnel.dossiers },
              { label: "Inscrits", value: funnel.inscrits },
              { label: "Ont payé", value: funnel.payes },
            ]}
          />
        </Panel>
        <Panel title="Statut des paiements" hint={`Élèves en formation au ${new Date(range.end + "T12:00:00").toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}`}>
          <Donut
            centerLabel="élèves"
            parts={[
              { label: "À jour", count: mix.paid.count, color: "var(--color-success)" },
              { label: "Partiel", count: mix.partial.count, amount: `reste ${fmtMoney(mix.partial.amount)}`, color: "var(--color-warning)" },
              { label: "Impayé", count: mix.unpaid.count, amount: `reste ${fmtMoney(mix.unpaid.amount)}`, color: "var(--color-danger)" },
            ]}
          />
        </Panel>
        <Panel title="Remplissage des sessions" hint={`Repère à ${snap.settings.fillPct} %`} action={<SeeAll href="/os/ceo/sessions">Sessions</SeeAll>}>
          <FillBars
            threshold={snap.settings.fillPct}
            rows={fill.rows.map((r) => ({ id: r.session.id, label: r.session.name, hint: shortProgram(r.session.programId), taken: r.taken, capacity: r.capacity }))}
          />
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

function shortProgram(id: string) {
  return id === "eng-intensive" ? "Anglais intensif" : id === "eng-long" ? "Anglais longue durée" : id === "computer" ? "Informatique" : "Business English";
}
