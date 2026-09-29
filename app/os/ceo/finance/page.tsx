"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { KpiCard } from "../../_components/ui";
import { ComboChart, EmptyState } from "../../_components/charts";
import { IcCoins, IcDownload, IcTrend, IcUsers, IcWallet } from "../../_components/icons";
import { useOs } from "../../_components/OsProvider";
import { useToast } from "../../_components/Toast";
import { downloadCsv } from "../../_lib/exportFile";
import { PROGRAMS, fmtAxisMoney, fmtInt, fmtMoney } from "../../_data/core";
import { delta, seriesFor, agingOn, byMethod, byProgramme, collected, expectedIn, payersIn, outstandingOn, AGING_LABEL, paymentsIn, type AgingKey } from "../../_data/metrics";
import { voidPayment } from "../../_data/repo";
import type { Kpi } from "../../_data";
import { fmtDayYear } from "../../_lib/dates";
import { FounderHeader, FiltersBar, Pager, Panel, usePaged } from "../_components/Bits";
import { useFounderFilters } from "../_lib/useFilters";

const NAMES = Object.fromEntries(PROGRAMS.map((p) => [p.id, p.name]));

function Bars({ rows, format }: { rows: { label: string; value: number; count: number }[]; format: (n: number) => string }) {
  if (!rows.length) return <EmptyState text="Aucun paiement sur la période." />;
  const max = Math.max(...rows.map((r) => r.value), 1);
  return (
    <div className="fx-bars">
      {rows.map((r) => (
        <div key={r.label} className="fx-bars-row">
          <span>
            {r.label} <span className="fx-muted">· {r.count} paiement{r.count > 1 ? "s" : ""}</span>
          </span>
          <strong>{format(r.value)}</strong>
          <div className="fx-bars-track">
            <div style={{ width: `${(r.value / max) * 100}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function FinancePage() {
  const f = useFounderFilters("thisMonth");
  const { snap, range, prev, campus } = f;
  const { session } = useOs();
  const toast = useToast();
  const [q, setQ] = useState("");
  const [method, setMethod] = useState("all");
  const [programme, setProgramme] = useState("all");
  const [aging, setAging] = useState<AgingKey | "late" | null>(() => {
    if (typeof window === "undefined") return null;
    const a = new URLSearchParams(window.location.search).get("aging");
    return a === "late" ? "late" : null;
  });

  const kpis = useMemo(() => {
    const cur = { enc: collected(snap, campus, range), att: expectedIn(snap, campus, range), pay: payersIn(snap, campus, range), out: outstandingOn(snap, campus, range.end) };
    const p = prev ? { enc: collected(snap, campus, prev), att: expectedIn(snap, campus, prev), pay: payersIn(snap, campus, prev), out: outstandingOn(snap, campus, prev.end) } : null;
    const rec = cur.att ? (cur.enc / cur.att) * 100 : null;
    const recP = p && p.att ? (p.enc / p.att) * 100 : null;
    const avg = cur.pay ? cur.enc / cur.pay : null;
    const avgP = p && p.pay ? p.enc / p.pay : null;
    const base = { compare: true, compareLabel: f.compareLabel, hint: "" } as const;
    const list: Kpi[] = [
      { ...base, id: "enc", label: "Encaissé", value: fmtMoney(cur.enc), raw: cur.enc, delta: delta(cur.enc, p?.enc), sub: `attendu : ${fmtMoney(cur.att)}` },
      { ...base, id: "rest", label: "Reste à recouvrer", value: fmtMoney(cur.out.amount), raw: cur.out.amount, delta: delta(cur.out.amount, p?.out.amount), invert: true, sub: `sur ${fmtInt(cur.out.students)} élèves` },
      { ...base, id: "rec", label: "Taux de recouvrement", value: rec === null ? "—" : `${rec.toFixed(0)} %`, raw: rec ?? 0, delta: rec !== null && recP !== null ? rec - recP : null, deltaUnit: "pts", sub: "encaissé / attendu" },
      { ...base, id: "avg", label: "Paiement moyen par élève", value: avg === null ? "—" : fmtMoney(avg), raw: avg ?? 0, delta: delta(avg, avgP), sub: `${fmtInt(cur.pay)} élève${cur.pay > 1 ? "s" : ""} ont payé` },
    ];
    return list;
  }, [snap, campus, range, prev, f.compareLabel]);

  const enc = useMemo(() => seriesFor(snap, campus, "encaisse", range, null), [snap, campus, range]);
  const att = useMemo(() => seriesFor(snap, campus, "attendu", range, null), [snap, campus, range]);
  const ag = useMemo(() => agingOn(snap, campus, snap.today), [snap, campus]);
  const methods = useMemo(() => byMethod(snap, campus, range), [snap, campus, range]);
  const progs = useMemo(() => byProgramme(snap, campus, range, NAMES), [snap, campus, range]);

  const payments = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return paymentsIn(snap, campus, range)
      .filter((p) => (method === "all" || p.method === method) && (programme === "all" || p.programId === programme))
      .filter((p) => !needle || `${p.studentName} ${p.receipt}`.toLowerCase().includes(needle))
      .sort((a, b) => (a.date + a.time < b.date + b.time ? 1 : -1));
  }, [snap, campus, range, q, method, programme]);
  const paged = usePaged(payments, 25);

  const agingRows = useMemo(() => {
    if (!aging) return [];
    if (aging === "late") return [...ag.d30_60.rows, ...ag.gt60.rows].filter((r) => r.days >= snap.settings.unpaidDays).sort((a, b) => b.days - a.days);
    return ag[aging].rows;
  }, [aging, ag, snap.settings.unpaidDays]);
  const agingPaged = usePaged(agingRows, 10);

  function exportPayments() {
    downloadCsv(
      `paiements-${range.start}-${range.end}`,
      ["Reçu", "Date", "Heure", "Élève", "Formation", "Objet", "Mode", "Montant (CFA)", "Enregistré par"],
      payments.map((p) => [p.receipt, p.date, p.time, p.studentName, NAMES[p.programId] ?? p.programId, p.purpose, p.method, p.amount, p.recordedBy]),
    );
    toast.success("Export des paiements prêt ✓");
  }

  function cancel(id: string) {
    const reason = window.prompt("Motif de l'annulation de ce paiement :");
    if (!reason || !reason.trim()) return;
    voidPayment(id, session?.name || "Fondateur TAS", reason.trim());
    toast.success("Paiement annulé, trace conservée dans le journal ✓");
  }

  const hasData = enc.values.some((v) => v > 0) || att.values.some((v) => v > 0);

  return (
    <>
      <FounderHeader title="Finances" subtitle={`Encaissements et recouvrement · ${f.phrase}`}>
        <button type="button" className="os-btn" onClick={exportPayments}>
          <IcDownload /> Exporter les paiements
        </button>
        <Link href={`/os/ceo/reports?${f.query}`} className="os-btn os-btn-primary">
          Rapport
        </Link>
      </FounderHeader>
      <FiltersBar filters={f} />
      <section className="fx-kpis" aria-label="Indicateurs financiers">
        {kpis.map((k, i) => (
          <KpiCard key={k.id} kpi={k} size="hero" icon={[<IcWallet key="a" />, <IcCoins key="b" />, <IcTrend key="c" />, <IcUsers key="d" />][i]} />
        ))}
      </section>

      <Panel title="Encaissé et attendu" hint="Barres : encaissé · ligne : échéances attendues">
        <ComboChart
          labels={enc.buckets.map((b) => b.label)}
          longLabels={enc.buckets.map((b) => b.long)}
          values={enc.values}
          previousValues={att.values}
          name="Encaissé"
          previousName="Attendu"
          format={fmtMoney}
          axisFormat={fmtAxisMoney}
          unit="money"
          ariaLabel={`Encaissé et attendu, ${f.phrase}`}
          empty={!hasData}
        />
      </Panel>

      <Panel title="Impayés par ancienneté" hint="Montants échus non réglés à ce jour · cliquez pour voir la liste">
        <div className="fx-aging">
          {(Object.keys(ag) as AgingKey[]).map((k) => (
            <button key={k} type="button" aria-pressed={aging === k} className={k !== "lt30" ? "is-late" : ""} onClick={() => { setAging(aging === k ? null : k); agingPaged.setPage(0); }}>
              <span>{AGING_LABEL[k]}</span>
              <strong>{fmtMoney(ag[k].amount)}</strong>
              <em>{ag[k].count} élève{ag[k].count > 1 ? "s" : ""}</em>
            </button>
          ))}
        </div>
        {aging ? (
          <>
            <div className="fx-table-wrap">
              <table className="fx-table">
                <thead>
                  <tr>
                    <th>Élève</th>
                    <th>Échu depuis</th>
                    <th className="num">Retard</th>
                    <th className="num">Montant échu</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {agingPaged.rows.map((r) => (
                    <tr key={r.student.id}>
                      <td>
                        <div className="fx-cell-main">
                          <strong>{r.student.name}</strong>
                          <span>{r.student.matricule} · {r.student.phone}</span>
                        </div>
                      </td>
                      <td className="nowrap">{fmtDayYear(r.since)}</td>
                      <td className="num">{r.days} j</td>
                      <td className="num">{fmtMoney(r.amount)}</td>
                      <td>
                        <Link className="os-btn" href={`/os/students/${r.student.id}`}>
                          Dossier
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pager paged={agingPaged as never} noun="élèves" />
          </>
        ) : null}
      </Panel>

      <div className="fx-duo">
        <Panel title="Par mode de paiement">
          <Bars rows={methods} format={fmtMoney} />
        </Panel>
        <Panel title="Par formation">
          <Bars rows={progs} format={fmtMoney} />
        </Panel>
      </div>

      <Panel title="Paiements" hint={`${fmtInt(payments.length)} paiement${payments.length > 1 ? "s" : ""} · ${fmtMoney(payments.reduce((s, p) => s + p.amount, 0))}`} foot={payments.length ? <Pager paged={paged as never} noun="paiements" /> : undefined}>
        <div className="fx-filterbar">
          <input className="os-input" type="search" placeholder="Rechercher un élève ou un reçu" aria-label="Rechercher un paiement" value={q} onChange={(e) => { setQ(e.target.value); paged.setPage(0); }} />
          <select className="fx-select" aria-label="Mode de paiement" value={method} onChange={(e) => { setMethod(e.target.value); paged.setPage(0); }}>
            <option value="all">Tous les modes</option>
            <option>Mobile Money</option>
            <option>Espèces</option>
            <option>Virement</option>
            <option>Carte</option>
          </select>
          <select className="fx-select" aria-label="Formation" value={programme} onChange={(e) => { setProgramme(e.target.value); paged.setPage(0); }}>
            <option value="all">Toutes les formations</option>
            {PROGRAMS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
        {payments.length === 0 ? (
          <EmptyState text="Aucun paiement pour ces filtres." icon={<IcWallet />} />
        ) : (
          <div className="fx-table-wrap">
            <table className="fx-table">
              <thead>
                <tr>
                  <th>Élève</th>
                  <th>Date</th>
                  <th>Objet</th>
                  <th>Mode</th>
                  <th className="num">Montant</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {paged.rows.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <div className="fx-cell-main">
                        <strong>{p.studentName}</strong>
                        <span>{p.receipt} · {NAMES[p.programId] ?? p.programId}</span>
                      </div>
                    </td>
                    <td className="nowrap">{fmtDayYear(p.date)} {p.time}</td>
                    <td>{p.purpose}</td>
                    <td>{p.method}</td>
                    <td className="num">{fmtMoney(p.amount)}</td>
                    <td className="nowrap">
                      <Link className="os-btn" href={`/os/students/${p.studentId}/recu/${p.id}`}>
                        Reçu
                      </Link>{" "}
                      <button type="button" className="os-btn" onClick={() => cancel(p.id)}>
                        Annuler
                      </button>
                    </td>
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
