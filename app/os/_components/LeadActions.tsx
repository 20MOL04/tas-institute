"use client";

import { updateLead, type Lead } from "../_data";
import { useOs } from "./OsProvider";

export default function LeadActions({ lead }: { lead: Lead }) {
  const { openPanel } = useOs();
  const closed = lead.stage === "enrolled" || lead.stage === "paid" || lead.stage === "lost";

  function contact() {
    updateLead(lead.id, { stage: "contacted", overdue: false });
  }

  function ready() {
    updateLead(lead.id, { stage: "approved", overdue: false });
  }

  function enroll() {
    openPanel("student", {
      name: lead.name,
      phone: lead.phone,
      country: lead.country,
      leadId: lead.id,
      source: lead.source,
    });
  }

  if (closed) return <p className="os-muted os-small">Déjà inscrite ou close.</p>;

  return (
    <div className="os-page-actions">
      <button type="button" className="os-btn os-btn-sm" onClick={contact}>
        Marquer contacté
      </button>
      <button type="button" className="os-btn os-btn-sm" onClick={ready}>
        Prêt à inscrire
      </button>
      <button type="button" className="os-btn os-btn-primary os-btn-sm" onClick={enroll}>
        Inscrire
      </button>
    </div>
  );
}
