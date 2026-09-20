"use client";

import { useEffect, useState, type ReactNode } from "react";
import { LEADS_CHANGED, LEAD_STAGES, PROGRAMS, fmtDate, leadSourceLabel, liveLeads, type Lead } from "../../_data";
import { Badge, OsCard, PageHead, statusTone } from "../../_components/ui";
import LeadActions from "../../_components/LeadActions";
import { durationLabelFr, isCourseDuration } from "../../../lib/course-duration";

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <div className="os-small os-muted">{label}</div>
      <div className="os-table-strong">{children}</div>
    </div>
  );
}

export default function LiveLeadProfile({ id }: { id: string }) {
  const [lead, setLead] = useState<Lead | null | undefined>(undefined);

  useEffect(() => {
    function refresh() {
      setLead(liveLeads().find((row) => row.id === id) ?? null);
    }
    refresh();
    window.addEventListener(LEADS_CHANGED, refresh);
    return () => window.removeEventListener(LEADS_CHANGED, refresh);
  }, [id]);

  if (lead === undefined) return <p className="os-muted">Chargement de la demande.</p>;
  if (!lead) return <p className="os-empty">Demande introuvable.</p>;

  const program = PROGRAMS.find((p) => p.id === lead.programId);
  const stage = LEAD_STAGES.find((s) => s.key === lead.stage)?.label ?? lead.stage;

  return (
    <>
      <PageHead title={lead.name}>
        <Badge tone={statusTone(lead.stage)}>{stage}</Badge>
      </PageHead>
      <OsCard title="Demande" action={<LeadActions lead={lead} />}>
        <div className="os-grid os-grid-2">
          <Field label="Téléphone">{lead.phone}</Field>
          <Field label="Pays">{lead.country}</Field>
          <Field label="Source">{leadSourceLabel(lead.source)}</Field>
          <Field label="Programme">{program?.name ?? lead.programId}</Field>
          <Field label="Durée">{lead.durationMonths && isCourseDuration(lead.durationMonths) ? durationLabelFr(lead.durationMonths) : "Non indiquée"}</Field>
          <Field label="Reçue le">{fmtDate(lead.createdAt)}</Field>
          <Field label="Dernier contact">{fmtDate(lead.lastContact)}</Field>
          <Field label="Suivi par">{lead.owner}</Field>
          <Field label="Prochain rappel">{lead.nextFollowUp ? fmtDate(lead.nextFollowUp) : "Aucun"}</Field>
          <Field label="Campagne">{lead.campaign ?? "Sans campagne"}</Field>
          <Field label="À relancer">{lead.overdue ? "Oui" : "Non"}</Field>
        </div>
        <p className="os-small" style={{ marginTop: 12 }}>
          {lead.note}
        </p>
      </OsCard>
    </>
  );
}
