"use client";

import { useEffect, useMemo, useState } from "react";
import { ACCOUNTS, extraAdmins, ADMINS_CHANGED, type ExtraAdmin } from "../../_data/auth";
import { APPROVALS, type Approval, type Kpi } from "../../_data";
import { Badge, KpiCard, OsCard, PageHead, statusTone } from "../../_components/ui";
import { PanelButton } from "../../_components/EnrollPanels";
import { useOsT } from "../../_components/useOsT";

export default function CeoAdminsPage() {
  const { t } = useOsT();
  const seed = useMemo(() => ACCOUNTS.filter((a) => a.space === "admin"), []);
  const [extra, setExtra] = useState<ExtraAdmin[]>([]);
  const [queued, setQueued] = useState<Approval[]>([]);

  useEffect(() => {
    const refresh = () => {
      setExtra(extraAdmins());
      setQueued(APPROVALS.filter((row) => row.kind === "admin"));
    };
    refresh();
    window.addEventListener(ADMINS_CHANGED, refresh);
    return () => window.removeEventListener(ADMINS_CHANGED, refresh);
  }, []);

  const rows = [...seed, ...extra];
  const waiting = queued.filter((row) => row.status === "pending").length;
  const kpis: Kpi[] = [
    { id: "all", label: t.nav.admins, value: String(rows.length), raw: rows.length, delta: null, hint: "" },
    { id: "seed", label: "Comptes école", value: String(seed.length), raw: seed.length, delta: null, hint: "" },
    { id: "extra", label: "Ajouts", value: String(extra.length), raw: extra.length, delta: null, hint: "" },
    { id: "wait", label: t.nav.validations, value: String(waiting), raw: waiting, delta: null, hint: "" },
  ];

  return (
    <>
      <PageHead title={t.nav.admins} lead="Comptes du bureau Administration, y compris ceux en attente.">
        <PanelButton panel="admin">{t.ceo.createAdmin}</PanelButton>
      </PageHead>
      <div className="os-kpi-grid">
        {kpis.map((kpi) => (
          <KpiCard key={kpi.id} kpi={kpi} />
        ))}
      </div>
      {queued.some((row) => row.status === "pending") ? (
        <OsCard title={t.nav.validations}>
          <div className="os-table-wrap">
            <table className="os-table">
              <thead>
                <tr>
                  <th>{t.print.staffId}</th>
                  <th>Nom</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {queued
                  .filter((row) => row.status === "pending")
                  .map((row) => (
                    <tr key={row.id}>
                      <td className="os-table-strong">{row.subjectRef}</td>
                      <td>
                        {row.subjectName}
                        <div className="os-muted">{row.summary}</div>
                      </td>
                      <td>
                        <Badge tone={statusTone(row.status)}>{t.transfers.pending}</Badge>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </OsCard>
      ) : null}
      <OsCard title={t.nav.admins}>
        <div className="os-table-wrap">
          <table className="os-table">
            <thead>
              <tr>
                <th>{t.print.staffId}</th>
                <th>Nom</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((a) => (
                <tr key={a.matricule}>
                  <td className="os-table-strong">{a.matricule}</td>
                  <td>{a.name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </OsCard>
    </>
  );
}
