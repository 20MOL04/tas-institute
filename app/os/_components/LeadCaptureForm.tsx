"use client";

import { useState, type FormEvent } from "react";
import { PROGRAMS, addLead } from "../_data";
import { COURSE_DURATION_MONTHS, durationLabelFr, type CourseDurationMonths } from "../../lib/course-duration";
import OsConfirm from "./OsConfirm";
import SelectMenu from "../../components/ui/SelectMenu";
import CountryField from "../../components/ui/CountryField";

const SOURCES = [
  { value: "WhatsApp", label: "WhatsApp" },
  { value: "Formulaire", label: "Formulaire" },
  { value: "Contact", label: "Contact" },
  { value: "Walk-in", label: "Sur place" },
];

export default function LeadCaptureForm({ onDone }: { onDone?: () => void }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("");
  const [source, setSource] = useState("WhatsApp");
  const [programId, setProgramId] = useState(PROGRAMS[0]?.id ?? "eng-intensive");
  const [durationMonths, setDurationMonths] = useState<CourseDurationMonths>(3);
  const [note, setNote] = useState("");
  const [ask, setAsk] = useState(false);

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !country.trim()) return;
    setAsk(true);
  }

  function confirmAdd() {
    setAsk(false);
    addLead({
      name: name.trim(),
      phone: phone.trim(),
      country,
      programId,
      durationMonths,
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
        <CountryField value={country} onChange={setCountry} required />
      </label>
      <label className="os-field">
        <span>Source</span>
        <SelectMenu value={source} onChange={setSource} options={SOURCES} />
      </label>
      <label className="os-field">
        <span>Programme</span>
        <SelectMenu
          value={programId}
          onChange={setProgramId}
          options={PROGRAMS.filter((p) => p.schoolId === "tas").map((p) => ({ value: p.id, label: p.name }))}
        />
      </label>
      <label className="os-field">
        <span>Durée</span>
        <SelectMenu
          value={String(durationMonths)}
          onChange={(next) => setDurationMonths(Number(next) as CourseDurationMonths)}
          options={COURSE_DURATION_MONTHS.map((months) => ({
            value: String(months),
            label: durationLabelFr(months),
          }))}
        />
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
