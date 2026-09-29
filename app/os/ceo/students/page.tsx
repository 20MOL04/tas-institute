"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Badge, KpiCard, PAYMENT_STATUS_FR, STUDENT_STATUS_FR, statusTone } from "../../_components/ui";
import { EmptyState, Segmented } from "../../_components/charts";
import { IcAlert, IcDownload, IcUsers } from "../../_components/icons";
import { useToast } from "../../_components/Toast";
import { downloadCsv } from "../../_lib/exportFile";
import { PROGRAMS, fmtMoney } from "../../_data/core";
import { activeCount, dangerOn, newEnrollments, studentsIn } from "../../_data/metrics";
import type { StudentStatus } from "../../_data";
import { FounderHeader, FiltersBar, Pager, Panel, usePaged } from "../_components/Bits";
import { useFounderFilters } from "../_lib/useFilters";

export default function FounderStudents() {
  const f = useFounderFilters("thisMonth");
  const { snap, campus, range } = f;
  const toast = useToast();
  const [tab, setTab] = useState<"all" | "danger">(() =>
    typeof window !== "undefined" && new URLSearchParams(window.location.search).get("tab") === "danger" ? "danger" : "all",
  );
  const [q, setQ] = useState("");
  const [programme, setProgramme] = useState("all");
  const [status, setStatus] = useState("all");
  const [pay, setPay] = useState("all");

  const scoped = useMemo(() => studentsIn(snap, campus), [snap, campus]);
  const danger = useMemo(() => dangerOn(snap, campus, snap.today), [snap, campus]);
  const dangerById = useMemo(() => new Map(danger.map((d) => [d.student.id, d] as const)), [danger]);
  const gone = scoped.filter((s) => s.status === "paused" || s.status === "dropped").length;

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return scoped
      .filter((s) => (tab === "danger" ? dangerById.has(s.id) : true))
      .filter((s) => (programme === "all" || s.programId === programme) && (status === "all" || s.status === status) && (pay === "all" || s.paymentStatus === pay))
      .filter((s) => !needle || `${s.name} ${s.matricule} ${s.phone}`.toLowerCase().includes(needle))
      .sort((a, b) => (tab === "danger" ? (dangerById.get(b.id)?.overdue ?? 0) - (dangerById.get(a.id)?.overdue ?? 0) : a.enrolledAt < b.enrolledAt ? 1 : -1));
  }, [scoped, tab, dangerById, programme, status, pay, q]);
  const paged = usePaged(rows, 25);

  const base = { compare: true, compareLabel: f.compareLabel, hint: "" } as const;
  const cur = activeCount(snap, campus, range.end);
  const news = newEnrollments(snap, campus, range);

  function exportRows() {
    downloadCsv(
      "eleves",
      ["Matricule", "Nom", "Formation", "Niveau", "Statut", "Paiement", "Solde (CFA)", "Présence (%)", "Inscrit le"],
      rows.map((s) => [s.matricule, s.name, PROGRAMS.find((p) => p.id === s.programId)?.name ?? s.programId, s.level, STUDENT_STATUS_FR[s.status], PAYMENT_STATUS_FR[s.paymentStatus], s.balance, s.attendanceRate, s.enrolledAt.slice(0, 10)]),
    );
    toast.success("Export des élèves prêt ✓");
  }

  return (
    <>
      <FounderHeader title="Élèves" subtitle={`${scoped.length.toLocaleString("fr-FR")} dossiers · ${f.phrase}`}>
        <button type="button" className="os-btn" onClick={exportRows}>
          <IcDownload /> Exporter
        </button>
      </FounderHeader>
      <FiltersBar filters={f} />
      <section className="fx-kpis" aria-label="Élèves en chiffres">
        <KpiCard size="hero" icon={<IcUsers />} kpi={{ ...base, id: "a", label: "Élèves actifs", value: String(cur), raw: cur, delta: null }} />
        <KpiCard size="hero" icon={<IcUsers />} kpi={{ ...base, id: "n", label: "Nouveaux inscrits", value: String(news), raw: news, delta: null, sub: f.phrase }} />
        <KpiCard size="hero" icon={<IcUsers />} kpi={{ ...base, compare: false, id: "g", label: "En pause ou partis", value: String(gone), raw: gone, delta: null }} />
        <KpiCard size="hero" icon={<IcAlert />} kpi={{ ...base, compare: false, id: "d", label: "En danger", value: String(danger.length), raw: danger.length, delta: null, sub: `présence < ${snap.settings.attendancePct} % ou impayé ≥ ${snap.settings.unpaidDays} j` }} />
      </section>

      <Segmented
        label="Vue"
        value={tab}
        onChange={(v) => {
          setTab(v);
          paged.setPage(0);
        }}
        options={[
          { value: "all", label: "Tous les élèves", count: scoped.length },
          { value: "danger", label: "En danger", count: danger.length },
        ]}
      />

      <Panel title={tab === "danger" ? "Élèves en danger" : "Dossiers"} foot={rows.length ? <Pager paged={paged as never} noun="élèves" /> : undefined}>
        <div className="fx-filterbar">
          <input className="os-input" type="search" placeholder="Nom, matricule, téléphone" aria-label="Rechercher un élève" value={q} onChange={(e) => { setQ(e.target.value); paged.setPage(0); }} />
          <select className="fx-select" aria-label="Formation" value={programme} onChange={(e) => { setProgramme(e.target.value); paged.setPage(0); }}>
            <option value="all">Toutes les formations</option>
            {PROGRAMS.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <select className="fx-select" aria-label="Statut" value={status} onChange={(e) => { setStatus(e.target.value); paged.setPage(0); }}>
            <option value="all">Tous les statuts</option>
            {(Object.keys(STUDENT_STATUS_FR) as StudentStatus[]).map((s) => (
              <option key={s} value={s}>{STUDENT_STATUS_FR[s]}</option>
            ))}
          </select>
          <select className="fx-select" aria-label="Paiement" value={pay} onChange={(e) => { setPay(e.target.value); paged.setPage(0); }}>
            <option value="all">Tous les paiements</option>
            <option value="paid">À jour</option>
            <option value="partial">Partiel</option>
            <option value="unpaid">Impayé</option>
          </select>
        </div>
        {rows.length === 0 ? (
          <EmptyState title="Aucun élève" text="Aucun dossier ne correspond à ces filtres." icon={<IcUsers />} />
        ) : (
          <div className="fx-table-wrap">
            <table className="fx-table">
              <thead>
                <tr>
                  <th>Élève</th>
                  <th>Formation</th>
                  <th>Statut</th>
                  <th>Paiement</th>
                  {tab === "danger" ? <th>Raisons</th> : <th className="num">Présence</th>}
                  <th />
                </tr>
              </thead>
              <tbody>
                {paged.rows.map((s) => {
                  const d = dangerById.get(s.id);
                  return (
                    <tr key={s.id}>
                      <td>
                        <div className="fx-cell-main">
                          <strong>{s.name}</strong>
                          <span>{s.matricule} · {s.country}</span>
                        </div>
                      </td>
                      <td>
                        <div className="fx-cell-main">
                          <strong>{PROGRAMS.find((p) => p.id === s.programId)?.name}</strong>
                          <span>{s.level}</span>
                        </div>
                      </td>
                      <td><Badge tone={statusTone(s.status)}>{STUDENT_STATUS_FR[s.status]}</Badge></td>
                      <td>
                        <Badge tone={statusTone(s.paymentStatus)}>{PAYMENT_STATUS_FR[s.paymentStatus]}</Badge>
                        {s.balance > 0 ? <div className="fx-muted">reste {fmtMoney(s.balance)}</div> : null}
                      </td>
                      {tab === "danger" ? (
                        <td>
                          <div className="fx-tags">
                            {d?.reasons.map((r) => (
                              <span key={r.label} className={`fx-tag${r.kind === "attendance" ? " fx-tag-amber" : ""}`}>{r.label}</span>
                            ))}
                          </div>
                        </td>
                      ) : (
                        <td className="num">{s.attendanceRate} %</td>
                      )}
                      <td>
                        <Link className="os-btn" href={`/os/students/${s.id}`}>Ouvrir</Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </>
  );
}
