"use client";

import { useEffect, useState } from "react";
import {
  APPLICATIONS_CHANGED,
  APPROVALS_CHANGED,
  PROGRAMS,
  addApproval,
  canDecideApprovals,
  findApplicationApproval,
  liveApplications,
  patchApplication,
  setApprovalStatus,
  type Application,
} from "../../_data";
import { useOs } from "../../_components/OsProvider";
import { useOsT } from "../../_components/useOsT";
import { IcCheckCircle, IcClose, IcFile } from "../../_components/icons";
import OsConfirm from "../../_components/OsConfirm";

function programName(programId: string) {
  return PROGRAMS.find((p) => p.id === programId)?.name ?? programId;
}

export default function ApplicationActions({ application }: { application: Application }) {
  const { t } = useOsT();
  const { session } = useOs();
  const canDecide = canDecideApprovals(session?.role);
  const isAdmin = session?.role === "admin";
  const [app, setApp] = useState(application);

  useEffect(() => {
    function refresh() {
      const live = liveApplications().find((row) => row.id === application.id);
      if (live) setApp(live);
    }
    refresh();
    window.addEventListener(APPLICATIONS_CHANGED, refresh);
    window.addEventListener(APPROVALS_CHANGED, refresh);
    return () => {
      window.removeEventListener(APPLICATIONS_CHANGED, refresh);
      window.removeEventListener(APPROVALS_CHANGED, refresh);
    };
  }, [application.id]);

  const closed = app.status === "enrolled" || app.status === "rejected";
  const seeded = findApplicationApproval(app.id);
  const missing = app.missingDocs.length > 0;

  const [outcome, setOutcome] = useState<"none" | "accepted" | "refused" | "sent">(
    seeded?.status === "accepted" ? "accepted" : seeded?.status === "refused" ? "refused" : seeded?.status === "pending" ? "sent" : "none",
  );
  const [docsAsked, setDocsAsked] = useState(false);
  const [ask, setAsk] = useState<"accept" | "refuse" | null>(null);

  const decided = closed || outcome === "accepted" || outcome === "refused";

  function sendToFounder() {
    patchApplication(app.id, { status: missing ? "documents" : "reviewing" });
    addApproval({
      kind: "enroll",
      subjectName: app.name,
      subjectRef: app.ref,
      summary: programName(app.programId),
      requestedBy: session?.name || "Administration",
      date: new Date().toISOString().slice(0, 10),
      relatedId: app.id,
    });
    setOutcome("sent");
  }

  function decide(status: "accepted" | "refused") {
    const existing = findApplicationApproval(app.id);
    if (existing) setApprovalStatus(existing.id, status);
    else {
      addApproval({
        kind: status === "accepted" ? "enroll" : "reject",
        status,
        subjectName: app.name,
        subjectRef: app.ref,
        summary: programName(app.programId),
        requestedBy: session?.name || "Fondateur",
        date: new Date().toISOString().slice(0, 10),
        relatedId: app.id,
      });
    }
    setOutcome(status);
  }

  if (decided) {
    const accepted = outcome === "accepted" || app.status === "enrolled" || app.status === "approved";
    return <p className="os-muted">{accepted ? t.actions.accepted : t.actions.refused}</p>;
  }

  if (canDecide) {
    return (
      <>
        <div className="os-action-stack">
          <button type="button" className="os-btn os-btn-primary" onClick={() => setAsk("accept")}>
            <IcCheckCircle />
            {t.actions.accept}
          </button>
          <button type="button" className="os-btn os-btn-danger" onClick={() => setAsk("refuse")}>
            <IcClose />
            {t.actions.refuse}
          </button>
        </div>
        <OsConfirm
          open={ask === "accept"}
          title="Accepter la candidature"
          body="Confirmez l'acceptation de ce dossier."
          confirmLabel="Accepter"
          onConfirm={() => {
            setAsk(null);
            decide("accepted");
          }}
          onCancel={() => setAsk(null)}
        />
        <OsConfirm
          open={ask === "refuse"}
          title="Refuser la candidature"
          body="Confirmez le refus de ce dossier."
          confirmLabel="Refuser"
          onConfirm={() => {
            setAsk(null);
            decide("refused");
          }}
          onCancel={() => setAsk(null)}
        />
      </>
    );
  }

  if (!session || !isAdmin) return null;

  return (
    <>
      <div className="os-action-stack">
        <button type="button" className="os-btn" onClick={() => setDocsAsked(true)} disabled={docsAsked}>
          <IcFile />
          {docsAsked ? t.actions.docsRequested : t.actions.requestDocs}
        </button>
        <button
          type="button"
          className="os-btn os-btn-primary"
          onClick={sendToFounder}
          disabled={missing || outcome === "sent"}
        >
          {outcome === "sent" ? t.actions.sentToFounder : t.actions.sendToFounder}
        </button>
        {missing ? <p className="os-muted">{t.actions.completeDocs}</p> : null}
      </div>
    </>
  );
}
