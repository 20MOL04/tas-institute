"use client";

import {
  APPLICATIONS_CHANGED,
  APPROVALS_CHANGED,
  CAMPUSES,
  GROUPS,
  INTAKES,
  PENDING_TRANSFERS,
  PROGRAMS,
  STUDENTS_CHANGED,
  fillRate,
  fmtInt,
  fmtMoney,
  liveApplications,
  liveStudents,
  pendingApprovals,
  type ApprovalKind,
  type Kpi,
} from "../../os/_data";
import { KpiCard } from "../../os/_components/ui";
import { useStoreTick } from "../../os/_components/useStoreTick";

const KIND_FR: Record<ApprovalKind, string> = {
  transfer: "Transfert",
  enroll: "Inscription",
  reject: "Refus",
  exclude: "Exclusion",
  unblock: "Réouverture",
  admin: "Administrateur",
  teacher: "Enseignant",
};

function programName(programId: string) {
  return PROGRAMS.find((p) => p.id === programId)?.name ?? programId;
}

function campusName(campusId: string) {
  return CAMPUSES.find((c) => c.id === campusId)?.name ?? campusId;
}

function groupName(groupId: string) {
  return GROUPS.find((g) => g.id === groupId)?.name ?? groupId;
}

export default function AdminBlockagesPage() {
  useStoreTick(APPLICATIONS_CHANGED, APPROVALS_CHANGED, STUDENTS_CHANGED);
  const stuck = liveApplications().filter((a) => a.status === "documents");
  const unpaid = liveStudents().filter((s) => s.paymentStatus === "unpaid");
  const fullSessions = INTAKES.filter((i) => i.status === "full" || fillRate(i) >= 100);
  const waiting = pendingApprovals();
  const kpis: Kpi[] = [
    { id: "wait", label: "À valider", value: fmtInt(waiting.length), raw: waiting.length, delta: null, hint: "" },
    { id: "stuck", label: "Dossiers coincés", value: fmtInt(stuck.length), raw: stuck.length, delta: null, hint: "" },
    { id: "unpaid", label: "Impayés", value: fmtInt(unpaid.length), raw: unpaid.length, delta: null, hint: "" },
    { id: "full", label: "Sessions pleines", value: fmtInt(fullSessions.length), raw: fullSessions.length, delta: null, hint: "" },
  ];

  return (
    <>
      <div className="os-page-head">
        <h1>Blocages</h1>
      </div>
      <div className="os-kpi-grid">
        {kpis.map((kpi) => (
          <KpiCard key={kpi.id} kpi={kpi} />
        ))}
      </div>

      <section className="os-section">
        <div className="os-section-head">
          <h2>À valider</h2>
          <span className="os-muted">{fmtInt(waiting.length)}</span>
        </div>
        <div className="os-section-body" style={{ padding: 0 }}>
          {waiting.length === 0 ? (
            <p className="os-muted" style={{ margin: 0, padding: "12px 16px 16px" }}>
              Rien à valider.
            </p>
          ) : (
            <div className="os-table-wrap">
              <table className="os-table">
                <thead>
                  <tr>
                    <th>Sujet</th>
                    <th>Personne</th>
                    <th>Détail</th>
                  </tr>
                </thead>
                <tbody>
                  {waiting.map((row) => (
                    <tr key={row.id}>
                      <td>{KIND_FR[row.kind]}</td>
                      <td>
                        <strong className="os-table-strong">{row.subjectName}</strong>
                        <div className="os-muted">{row.subjectRef}</div>
                      </td>
                      <td>{row.summary}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      <section className="os-section">
        <div className="os-section-head">
          <h2>Dossiers coincés</h2>
          <span className="os-muted">{fmtInt(stuck.length)}</span>
        </div>
        <div className="os-section-body" style={{ padding: 0 }}>
          {stuck.length === 0 ? (
            <p className="os-muted" style={{ margin: 0, padding: "12px 16px 16px" }}>
              Aucun dossier coincé.
            </p>
          ) : (
            <div className="os-table-wrap">
              <table className="os-table">
                <thead>
                  <tr>
                    <th>Dossier</th>
                    <th>Programme</th>
                    <th>Documents manquants</th>
                  </tr>
                </thead>
                <tbody>
                  {stuck.map((row) => (
                    <tr key={row.id}>
                      <td>
                        <strong className="os-table-strong">{row.name}</strong>
                        <div className="os-muted">{row.ref}</div>
                      </td>
                      <td>{programName(row.programId)}</td>
                      <td>{row.missingDocs.join(", ")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      <section className="os-section">
        <div className="os-section-head">
          <h2>Transferts en attente</h2>
          <span className="os-muted">{fmtInt(PENDING_TRANSFERS.length)}</span>
        </div>
        <div className="os-section-body" style={{ padding: 0 }}>
          {PENDING_TRANSFERS.length === 0 ? (
            <p className="os-muted" style={{ margin: 0, padding: "12px 16px 16px" }}>
              Aucun transfert en attente.
            </p>
          ) : (
            <div className="os-table-wrap">
              <table className="os-table">
                <thead>
                  <tr>
                    <th>Élève</th>
                    <th>De</th>
                    <th>Vers</th>
                    <th>Motif</th>
                  </tr>
                </thead>
                <tbody>
                  {PENDING_TRANSFERS.map((row) => (
                    <tr key={row.id}>
                      <td>
                        <strong className="os-table-strong">{row.studentName}</strong>
                        <div className="os-muted">{row.matricule}</div>
                      </td>
                      <td>{groupName(row.fromGroupId)}</td>
                      <td>{groupName(row.toGroupId)}</td>
                      <td>{row.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      <section className="os-section">
        <div className="os-section-head">
          <h2>Impayés</h2>
          <span className="os-muted">{fmtInt(unpaid.length)}</span>
        </div>
        <div className="os-section-body" style={{ padding: 0 }}>
          {unpaid.length === 0 ? (
            <p className="os-muted" style={{ margin: 0, padding: "12px 16px 16px" }}>
              Aucun impayé.
            </p>
          ) : (
            <div className="os-table-wrap">
              <table className="os-table">
                <thead>
                  <tr>
                    <th>Élève</th>
                    <th>Programme</th>
                    <th className="num">Reste dû</th>
                  </tr>
                </thead>
                <tbody>
                  {unpaid.map((row) => (
                    <tr key={row.id}>
                      <td>
                        <strong className="os-table-strong">{row.name}</strong>
                        <div className="os-muted">{row.matricule}</div>
                      </td>
                      <td>{programName(row.programId)}</td>
                      <td className="num">{fmtMoney(row.balance)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      <section className="os-section">
        <div className="os-section-head">
          <h2>Sessions pleines</h2>
          <span className="os-muted">{fmtInt(fullSessions.length)}</span>
        </div>
        <div className="os-section-body" style={{ padding: 0 }}>
          {fullSessions.length === 0 ? (
            <p className="os-muted" style={{ margin: 0, padding: "12px 16px 16px" }}>
              Aucune session pleine.
            </p>
          ) : (
            <div className="os-table-wrap">
              <table className="os-table">
                <thead>
                  <tr>
                    <th>Session</th>
                    <th>Campus</th>
                    <th className="num">Places</th>
                  </tr>
                </thead>
                <tbody>
                  {fullSessions.map((row) => (
                    <tr key={row.id}>
                      <td>
                        <strong className="os-table-strong">{programName(row.programId)}</strong>
                        <div className="os-muted">{row.name}</div>
                      </td>
                      <td>{campusName(row.campusId)}</td>
                      <td className="num">
                        {fmtInt(row.enrolled)} / {fmtInt(row.capacity)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
