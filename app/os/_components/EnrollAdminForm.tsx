"use client";

import { useState, type FormEvent } from "react";
import { CAMPUSES, addApproval } from "../_data";
import { ADMINS_CHANGED, nextAdminMatricule } from "../_data/auth";
import { useOs } from "./OsProvider";
import { useOsT } from "./useOsT";
import OsConfirm from "./OsConfirm";

export default function EnrollAdminForm() {
  const { t } = useOsT();
  const { session } = useOs();
  const instantCreate = session?.role === "founder" || session?.role === "superadmin";
  const [name, setName] = useState("");
  const [campusId, setCampusId] = useState(CAMPUSES[0]?.id ?? "");
  const [done, setDone] = useState("");
  const [ask, setAsk] = useState(false);

  const campusName = CAMPUSES.find((c) => c.id === campusId)?.name ?? campusId;

  function add(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setAsk(true);
  }

  function confirmAdd() {
    setAsk(false);
    const matricule = nextAdminMatricule();
    addApproval({
      kind: "admin",
      status: instantCreate ? "accepted" : "pending",
      subjectName: name.trim(),
      subjectRef: matricule,
      summary: campusName,
      requestedBy: session?.name || "Direction",
      date: new Date().toISOString().slice(0, 10),
      relatedId: matricule,
    });
    if (!instantCreate) {
      window.dispatchEvent(new Event(ADMINS_CHANGED));
    }
    setDone(matricule);
    setName("");
  }

  return (
    <>
      <form className="os-form-stack" onSubmit={add}>
        <label className="os-field">
          <span>Nom</span>
          <input className="os-input" value={name} onChange={(ev) => setName(ev.target.value)} required />
        </label>
        <label className="os-field">
          <span>Campus</span>
          <select className="os-input" value={campusId} onChange={(ev) => setCampusId(ev.target.value)}>
            {CAMPUSES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <button type="submit" className="os-btn os-btn-primary">
          {instantCreate ? t.ceo.createAdmin : t.actions.requestAdmin}
        </button>
      </form>
      {done ? (
        <p className="os-small os-muted">
          {instantCreate ? `Administrateur inscrit, matricule ${done}.` : `Demande envoyée, matricule ${done}.`}
        </p>
      ) : null}
      <OsConfirm
        open={ask}
        title={instantCreate ? "Enregistrer l'administrateur" : "Envoyer pour validation"}
        body={
          instantCreate
            ? "Confirmez l'inscription de cet administrateur."
            : "Confirmez l'envoi de cette demande au fondateur."
        }
        confirmLabel={instantCreate ? "Enregistrer" : "Envoyer"}
        onConfirm={confirmAdd}
        onCancel={() => setAsk(false)}
      />
    </>
  );
}
