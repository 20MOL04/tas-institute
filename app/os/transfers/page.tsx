"use client";

import { useState } from "react";
import {
  GROUPS,
  TRANSFERS,
  canDecideApprovals,
  findTransferApproval,
  fmtInt,
  setApprovalStatus,
  type Kpi,
  type TransferStatus,
} from "../_data";
import { Badge, KpiCard, OsCard, PageHead, VoirLink, statusTone } from "../_components/ui";
import { useOs } from "../_components/OsProvider";
import { useOsT } from "../_components/useOsT";

function groupName(id: string) {
  return GROUPS.find((g) => g.id === id)?.name ?? id;
}

function transferToneStatus(status: TransferStatus) {
  if (status === "approved") return "accepted";
  if (status === "rejected") return "refused";
  return status;
}

export default function TransfersPage() {
  const { t } = useOsT();
  const { session } = useOs();
  const canDecide = canDecideApprovals(session?.role);
  const [rows, setRows] = useState(() =>
    TRANSFERS.map((row) => {
      const approval = findTransferApproval(row.id);
      if (!approval) return row;
      const status: TransferStatus = approval.status === "pending" ? "pending" : approval.status === "accepted" ? "approved" : "rejected";
      return { ...row, status };
    }),
  );

  function setStatus(id: string, status: TransferStatus) {
    setRows((list) => list.map((r) => (r.id === id ? { ...r, status } : r)));
    const approval = findTransferApproval(id);
    if (approval) setApprovalStatus(approval.id, status === "approved" ? "accepted" : "refused");
  }

  function statusLabel(status: TransferStatus) {
    if (status === "pending") return t.transfers.pending;
    if (status === "approved") return t.actions.accepted;
    return t.actions.refused;
  }

  const pending = rows.filter((r) => r.status === "pending").length;
  const approved = rows.filter((r) => r.status === "approved").length;
  const rejected = rows.filter((r) => r.status === "rejected").length;
  const kpis: Kpi[] = [
    { id: "all", label: "Demandes", value: fmtInt(rows.length), raw: rows.length, delta: null, hint: "" },
    { id: "p", label: t.transfers.pending, value: fmtInt(pending), raw: pending, delta: null, hint: "" },
    { id: "ok", label: t.actions.accepted, value: fmtInt(approved), raw: approved, delta: null, hint: "" },
    { id: "no", label: t.actions.refused, value: fmtInt(rejected), raw: rejected, delta: null, hint: "" },
  ];

  return (
    <>
      <PageHead title={t.transfers.title} lead="Changements de groupe, en attente ou déjà tranchés." />
      <div className="os-kpi-grid">
        {kpis.map((kpi) => (
          <KpiCard key={kpi.id} kpi={kpi} />
        ))}
      </div>
      <OsCard title={t.transfers.pending}>
        <div className="os-table-wrap">
          <table className="os-table">
            <thead>
              <tr>
                <th>Élève</th>
                <th>De</th>
                <th>Vers</th>
                <th></th>
                <th className="os-th-action">Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td>
                    <strong>{r.studentName}</strong>
                    <div className="os-muted">{r.matricule}</div>
                  </td>
                  <td>{groupName(r.fromGroupId)}</td>
                  <td>{groupName(r.toGroupId)}</td>
                  <td>
                    {r.status === "pending" && canDecide ? (
                      <div className="os-page-actions">
                        <button type="button" className="os-btn os-btn-primary os-btn-sm" onClick={() => setStatus(r.id, "approved")}>
                          {t.actions.accept}
                        </button>
                        <button type="button" className="os-btn os-btn-sm" onClick={() => setStatus(r.id, "rejected")}>
                          {t.actions.refuse}
                        </button>
                      </div>
                    ) : (
                      <Badge tone={statusTone(transferToneStatus(r.status))}>{statusLabel(r.status)}</Badge>
                    )}
                  </td>
                  <td className="os-td-action">
                    <VoirLink href={`/os/students/${r.studentId}`} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </OsCard>
    </>
  );
}
