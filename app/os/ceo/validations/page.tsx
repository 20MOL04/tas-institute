"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { approvalHref, canDecideApprovals, type Approval, type ApprovalKind } from "../../_data";
import { decideApproval, decideMany } from "../../_data/repo";
import { Badge, statusTone } from "../../_components/ui";
import { EmptyState, Segmented } from "../../_components/charts";
import OsDrawer from "../../_components/OsDrawer";
import { useOs } from "../../_components/OsProvider";
import { useToast } from "../../_components/Toast";
import { IcCheckCircle } from "../../_components/icons";
import { fmtMoney } from "../../_data/core";
import { fmtDayYear } from "../../_lib/dates";
import { FounderHeader, Pager, Panel, usePaged } from "../_components/Bits";
import { useFounderFilters } from "../_lib/useFilters";

const KIND_LABEL: Record<ApprovalKind, string> = {
  enroll: "Inscription",
  transfer: "Transfert",
  admin: "Nouvel administrateur",
  teacher: "Nouvel enseignant",
  exclude: "Exclusion",
  unblock: "Déblocage",
  reject: "Refus de candidature",
};

const KINDS = Object.keys(KIND_LABEL) as ApprovalKind[];

export default function ValidationsPage() {
  const { snap } = useFounderFilters();
  const { session } = useOs();
  const toast = useToast();
  const canDecide = canDecideApprovals(session?.role);
  const actor = session?.name || "Fondateur TAS";
  const [tab, setTab] = useState<"pending" | "history">("pending");
  const [kind, setKind] = useState<ApprovalKind | "all">(() => {
    if (typeof window === "undefined") return "all";
    const k = new URLSearchParams(window.location.search).get("kind");
    return (KINDS as string[]).includes(k ?? "") ? (k as ApprovalKind) : "all";
  });
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [open, setOpen] = useState<Approval | null>(null);
  const [refuse, setRefuse] = useState<{ ids: string[]; label: string } | null>(null);
  const [reason, setReason] = useState("");

  const pending = useMemo(() => snap.approvals.filter((a) => a.status === "pending").sort((a, b) => (a.date < b.date ? 1 : -1)), [snap.approvals]);
  const history = useMemo(() => snap.approvals.filter((a) => a.status !== "pending").sort((a, b) => ((a.decidedAt ?? a.date) < (b.decidedAt ?? b.date) ? 1 : -1)), [snap.approvals]);
  const counts = useMemo(() => {
    const m = new Map<string, number>();
    for (const a of pending) m.set(a.kind, (m.get(a.kind) ?? 0) + 1);
    return m;
  }, [pending]);
  const list = (tab === "pending" ? pending : history).filter((a) => kind === "all" || a.kind === kind);
  const paged = usePaged(list, 25);
  const selectable = paged.rows.filter((a) => a.status === "pending");
  const allChecked = selectable.length > 0 && selectable.every((a) => selected.has(a.id));

  function toggle(id: string) {
    setSelected((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  }

  function accept(ids: string[]) {
    const n = decideMany(ids, "accepted", { actor });
    setSelected(new Set());
    setOpen(null);
    toast.success(n > 1 ? `${n} décisions acceptées ✓` : "Décision acceptée ✓");
  }

  function confirmRefuse() {
    if (!refuse) return;
    if (reason.trim().length < 3) return;
    if (refuse.ids.length === 1) decideApproval(refuse.ids[0], "refused", { reason, actor });
    else decideMany(refuse.ids, "refused", { reason, actor });
    toast.success(refuse.ids.length > 1 ? `${refuse.ids.length} demandes refusées ✓` : "Demande refusée ✓");
    setRefuse(null);
    setReason("");
    setSelected(new Set());
    setOpen(null);
  }

  const student = open?.studentId ? snap.studentById.get(open.studentId) : undefined;
  const chosen = Array.from(selected).filter((id) => pending.some((a) => a.id === id));

  return (
    <>
      <FounderHeader title="À valider" subtitle={`${pending.length} décision${pending.length > 1 ? "s" : ""} en attente · les décisions sont appliquées tout de suite`} />

      <Segmented
        label="Vue"
        value={tab}
        onChange={(v) => {
          setTab(v);
          paged.setPage(0);
        }}
        options={[
          { value: "pending", label: "En attente", count: pending.length },
          { value: "history", label: "Historique", count: history.length },
        ]}
      />

      <div className="fx-chips" role="group" aria-label="Type de demande">
        <button type="button" className="fx-chip" aria-pressed={kind === "all"} onClick={() => { setKind("all"); paged.setPage(0); }}>
          Tout <em>{tab === "pending" ? pending.length : history.length}</em>
        </button>
        {KINDS.map((k) => {
          const n = tab === "pending" ? counts.get(k) ?? 0 : history.filter((a) => a.kind === k).length;
          return (
            <button key={k} type="button" className="fx-chip" aria-pressed={kind === k} onClick={() => { setKind(k); paged.setPage(0); }}>
              {KIND_LABEL[k]} <em>{n}</em>
            </button>
          );
        })}
      </div>

      <Panel title={tab === "pending" ? "Demandes à traiter" : "Décisions prises"} foot={list.length > 0 ? <Pager paged={paged as never} noun="demandes" /> : undefined}>
        {chosen.length > 0 && canDecide ? (
          <div className="fx-bulk">
            <span>{chosen.length} sélectionnée{chosen.length > 1 ? "s" : ""}</span>
            <button type="button" className="os-btn os-btn-primary" onClick={() => accept(chosen)}>
              Accepter
            </button>
            <button type="button" className="os-btn" onClick={() => setRefuse({ ids: chosen, label: `${chosen.length} demandes` })}>
              Refuser
            </button>
          </div>
        ) : null}
        {list.length === 0 ? (
          <EmptyState title={tab === "pending" ? "Rien à valider" : "Aucune décision"} text={tab === "pending" ? "Toutes les demandes ont reçu une réponse." : "Les décisions prises apparaîtront ici."} icon={<IcCheckCircle />} />
        ) : (
          <div className="fx-table-wrap">
            <table className="fx-table">
              <thead>
                <tr>
                  {tab === "pending" && canDecide ? (
                    <th style={{ width: 44 }}>
                      <input type="checkbox" className="fx-check" aria-label="Tout sélectionner" checked={allChecked} onChange={() => setSelected(allChecked ? new Set() : new Set(selectable.map((a) => a.id)))} />
                    </th>
                  ) : null}
                  <th>Qui</th>
                  <th>Quoi</th>
                  <th>Demandé par</th>
                  <th>{tab === "pending" ? "Date" : "Décision"}</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {paged.rows.map((a) => (
                  <tr key={a.id}>
                    {tab === "pending" && canDecide ? (
                      <td>
                        <input type="checkbox" className="fx-check" aria-label={`Sélectionner ${a.subjectName}`} checked={selected.has(a.id)} onChange={() => toggle(a.id)} />
                      </td>
                    ) : null}
                    <td>
                      <div className="fx-cell-main">
                        <strong>{a.subjectName}</strong>
                        <span>{a.subjectRef}</span>
                      </div>
                    </td>
                    <td>
                      <div className="fx-cell-main">
                        <strong>{KIND_LABEL[a.kind]}</strong>
                        <span>{a.summary}</span>
                      </div>
                    </td>
                    <td className="nowrap">{a.requestedBy}</td>
                    <td className="nowrap">
                      {tab === "pending" ? (
                        fmtDayYear(a.date)
                      ) : (
                        <div className="fx-cell-main">
                          <Badge tone={statusTone(a.status === "accepted" ? "accepted" : "refused")}>{a.status === "accepted" ? "Accepté" : "Refusé"}</Badge>
                          <span>
                            {a.decidedBy ?? "—"} · {a.decidedAt ? `${fmtDayYear(a.decidedAt.slice(0, 10))} ${a.decidedAt.slice(11, 16)}` : ""}
                          </span>
                          {a.reason ? <span>Motif : {a.reason}</span> : null}
                        </div>
                      )}
                    </td>
                    <td className="nowrap">
                      <button type="button" className="os-btn" onClick={() => setOpen(a)}>
                        {tab === "pending" ? "Examiner" : "Détails"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      <OsDrawer open={!!open} title={open ? `${KIND_LABEL[open.kind]} · ${open.subjectName}` : "Demande"} onClose={() => setOpen(null)}>
        {open ? (
          <div className="os-grid" style={{ gap: 14 }}>
            <dl className="os-kv-grid">
              <div>
                <dt>Personne</dt>
                <dd>{open.subjectName}</dd>
              </div>
              <div>
                <dt>Référence</dt>
                <dd>{open.subjectRef}</dd>
              </div>
              <div>
                <dt>Détail</dt>
                <dd>{open.summary}</dd>
              </div>
              <div>
                <dt>Demandé par</dt>
                <dd>
                  {open.requestedBy} · {fmtDayYear(open.date)}
                </dd>
              </div>
              {student ? (
                <>
                  <div>
                    <dt>Formation</dt>
                    <dd>
                      {student.level} · {student.country}
                    </dd>
                  </div>
                  <div>
                    <dt>Présence</dt>
                    <dd>{student.attendanceRate} %</dd>
                  </div>
                  <div>
                    <dt>Solde</dt>
                    <dd>{fmtMoney(student.balance)}</dd>
                  </div>
                </>
              ) : null}
              {open.status !== "pending" ? (
                <div>
                  <dt>Décision</dt>
                  <dd>
                    {open.status === "accepted" ? "Accepté" : "Refusé"} par {open.decidedBy}
                    {open.reason ? ` · ${open.reason}` : ""}
                  </dd>
                </div>
              ) : null}
            </dl>
            <Link href={approvalHref(open)} className="os-btn" onClick={() => setOpen(null)}>
              Ouvrir le dossier complet
            </Link>
            {open.status === "pending" && canDecide ? (
              <div className="os-page-actions">
                <button type="button" className="os-btn os-btn-primary" onClick={() => accept([open.id])}>
                  Accepter
                </button>
                <button type="button" className="os-btn" onClick={() => setRefuse({ ids: [open.id], label: open.subjectName })}>
                  Refuser
                </button>
              </div>
            ) : null}
          </div>
        ) : null}
      </OsDrawer>

      <OsDrawer open={!!refuse} compact fit title="Refuser la demande" onClose={() => setRefuse(null)}>
        <form
          className="os-form-stack"
          onSubmit={(e) => {
            e.preventDefault();
            confirmRefuse();
          }}
        >
          <p className="os-small">Le motif est obligatoire : il est conservé dans l&apos;historique. Concerne : {refuse?.label}.</p>
          <label className="fx-field">
            Motif du refus
            <textarea className="os-input" style={{ height: 96, padding: 10 }} value={reason} onChange={(e) => setReason(e.target.value)} required minLength={3} data-autofocus />
          </label>
          <button type="submit" className="os-btn os-btn-primary" disabled={reason.trim().length < 3}>
            Confirmer le refus
          </button>
        </form>
      </OsDrawer>
    </>
  );
}
