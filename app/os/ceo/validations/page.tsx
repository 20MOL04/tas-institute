"use client";

import Link from "next/link";
import {
  APPROVALS_CHANGED,
  approvalHref,
  canDecideApprovals,
  fmtInt,
  liveApprovals,
  pendingApprovals,
  setApprovalStatus,
  type ApprovalKind,
  type ApprovalStatus,
  type Kpi,
} from "../../_data";
import { Badge, KpiCard, OsCard, PageHead, statusTone } from "../../_components/ui";
import { useOs } from "../../_components/OsProvider";
import { useOsT } from "../../_components/useOsT";
import { useStoreTick } from "../../_components/useStoreTick";

export default function ValidationsPage() {
  const { t } = useOsT();
  const { session } = useOs();
  useStoreTick(APPROVALS_CHANGED);
  const canDecide = canDecideApprovals(session?.role);
  const all = liveApprovals();
  const pending = pendingApprovals(all);
  const accepted = all.filter((row) => row.status === "accepted").length;
  const refused = all.filter((row) => row.status === "refused").length;
  const transfers = pending.filter((row) => row.kind === "transfer").length;
  const kpis: Kpi[] = [
    { id: "p", label: t.transfers.pending, value: fmtInt(pending.length), raw: pending.length, delta: null, hint: "" },
    { id: "tr", label: t.approvals.transfer, value: fmtInt(transfers), raw: transfers, delta: null, hint: "" },
    { id: "ok", label: t.actions.accepted, value: fmtInt(accepted), raw: accepted, delta: null, hint: "" },
    { id: "no", label: t.actions.refused, value: fmtInt(refused), raw: refused, delta: null, hint: "" },
  ];

  function decide(id: string, status: ApprovalStatus) {
    setApprovalStatus(id, status);
  }

  function kindLabel(kind: ApprovalKind) {
    return t.approvals[kind];
  }

  return (
    <>
      <PageHead title={t.nav.validations} lead="Décisions en attente du fondateur, puis historique." />
      <div className="os-kpi-grid">
        {kpis.map((kpi) => (
          <KpiCard key={kpi.id} kpi={kpi} />
        ))}
      </div>
      <OsCard title={t.nav.validations}>
        {pending.length === 0 ? (
          <p className="os-muted">{t.approvals.empty}</p>
        ) : (
          <div className="os-table-wrap">
            <table className="os-table">
              <thead>
                <tr>
                  <th>{t.approvals.who}</th>
                  <th>{t.approvals.what}</th>
                  <th>{t.approvals.requestedBy}</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {pending.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <Link href={approvalHref(row)}>
                        <strong>{row.subjectName}</strong>
                      </Link>
                      <div className="os-muted">{row.subjectRef}</div>
                    </td>
                    <td>
                      {kindLabel(row.kind)}
                      <div className="os-muted">{row.summary}</div>
                    </td>
                    <td>{row.requestedBy}</td>
                    <td>
                      {canDecide ? (
                        <div className="os-page-actions">
                          <button type="button" className="os-btn os-btn-primary os-btn-sm" onClick={() => decide(row.id, "accepted")}>
                            {t.actions.accept}
                          </button>
                          <button type="button" className="os-btn os-btn-sm" onClick={() => decide(row.id, "refused")}>
                            {t.actions.refuse}
                          </button>
                        </div>
                      ) : (
                        <Badge tone={statusTone(row.status)}>{t.transfers.pending}</Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </OsCard>
    </>
  );
}
