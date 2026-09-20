"use client";

import { useState, type FormEvent } from "react";
import { COUNTRIES, PROGRAMS, addLead } from "../_data";
import OsConfirm from "./OsConfirm";

export default function LeadCaptureForm({ onDone }: { onDone?: () => void }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState<string>(COUNTRIES[0].name);
  const [source, setSource] = useState("WhatsApp");
  const [programId, setProgramId] = useState(PROGRAMS[0]?.id ?? "eng-intensive");
  const [note, setNote] = useState("");
  const [ask, setAsk] = useState(false);

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;
    setAsk(true);
  }

  function confirmAdd() {
    setAsk(false);
    addLead({
      name: name.trim(),
      phone: phone.trim(),
      country,
      programId,
      note: note.trim() || "Demande enregistrée au bureau.",
      source,
    });
    setName("");
    setPhone("");
    setNote("");
    onDone?.();
  }

  return (
    <>
    <form className="os-form-stack" onSubmit={submit}>
      <label className="os-field">
        <span>Nom</span>
        <input className="os-input" value={name} onChange={(ev) => setName(ev.target.value)} required />
      </label>
      <label className="os-field">
        <span>Téléphone</span>
        <input className="os-input" value={phone} onChange={(ev) => setPhone(ev.target.value)} required />
      </label>
      <label className="os-field">
        <span>Pays</span>
        <select className="os-input" value={country} onChange={(ev) => setCountry(ev.target.value)}>
          {COUNTRIES.map((c) => (
            <option key={c.code} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>
      </label>
      <label className="os-field">
        <span>Source</span>
        <select className="os-input" value={source} onChange={(ev) => setSource(ev.target.value)}>
          <option value="WhatsApp">WhatsApp</option>
          <option value="Formulaire">Formulaire</option>
          <option value="Contact">Contact</option>
          <option value="Walk-in">Sur place</option>
        </select>
      </label>
      <label className="os-field">
        <span>Programme</span>
        <select className="os-input" value={programId} onChange={(ev) => setProgramId(ev.target.value)}>
          {PROGRAMS.filter((p) => p.schoolId === "tas").map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </label>
      <label className="os-field">
        <span>Note</span>
        <textarea className="os-input" value={note} onChange={(ev) => setNote(ev.target.value)} rows={2} />
      </label>
      <button type="submit" className="os-btn os-btn-primary">
        Ajouter à la file
      </button>
    </form>
    <OsConfirm
      open={ask}
      title="Enregistrer la demande"
      body="Confirmez l'ajout de cette demande à la file."
      confirmLabel="Ajouter"
      onConfirm={confirmAdd}
      onCancel={() => setAsk(false)}
    />
    </>
  );
}
