"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import {
  CAMPUSES,
  COUNTRIES,
  GROUPS,
  PROGRAMS,
  addPayment,
  addStudent,
  updateLead,
  type Student,
} from "../_data";
import { addExtraStudentAccount } from "../_data/auth";
import { useOs } from "../_components/OsProvider";
import { useOsT } from "../_components/useOsT";
import OsConfirm from "../_components/OsConfirm";

export default function EnrollStudentForm() {
  const { t } = useOsT();
  const { user, session, enrollDraft, closePanel } = useOs();
  const groups = GROUPS.filter((g) => g.schoolId === "tas");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState<string>(COUNTRIES[0].name);
  const [groupId, setGroupId] = useState(groups[0]?.id ?? "");
  const [created, setCreated] = useState<Student | null>(null);
  const [amount, setAmount] = useState("");
  const [paymentId, setPaymentId] = useState("");
  const [askEnroll, setAskEnroll] = useState(false);
  const [askPay, setAskPay] = useState(false);

  useEffect(() => {
    if (!enrollDraft) return;
    setName(enrollDraft.name);
    setPhone(enrollDraft.phone);
    if (enrollDraft.country) setCountry(enrollDraft.country);
  }, [enrollDraft]);

  if (user.role === "teacher" || user.role === "student") return null;

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;
    setAskEnroll(true);
  }

  function confirmEnroll() {
    setAskEnroll(false);
    const countryRow = COUNTRIES.find((c) => c.name === country) ?? COUNTRIES[0];
    const student = addStudent({
      name: name.trim(),
      phone: phone.trim(),
      country: countryRow.name,
      countryCode: countryRow.code,
      groupId,
      source: enrollDraft?.source ?? "Walk-in",
    });
    addExtraStudentAccount({
      matricule: student.matricule,
      name: student.name,
      space: "student",
      role: "student",
      personId: student.id,
      firstLoginDefault: true,
    });
    if (enrollDraft?.leadId) updateLead(enrollDraft.leadId, { stage: "enrolled", overdue: false });
    setCreated(student);
    setName("");
    setPhone("");
  }

  function pay(e: FormEvent) {
    e.preventDefault();
    if (!created) return;
    const n = Number(amount.replace(/\s/g, ""));
    if (!n) return;
    setAskPay(true);
  }

  function confirmPay() {
    if (!created) return;
    setAskPay(false);
    const n = Number(amount.replace(/\s/g, ""));
    if (!n) return;
    const payment = addPayment({
      student: created,
      amount: n,
      method: "Mobile Money",
      purpose: "Inscription",
      recordedBy: session?.name || "Administration",
    });
    setPaymentId(payment.id);
  }

  if (created) {
    return (
      <div className="os-stack-form">
        <p className="os-small">Dossier créé, matricule {created.matricule}.</p>
        {paymentId ? (
          <Link className="os-btn os-btn-primary" href={`/os/students/${created.id}/recu/${paymentId}`} onClick={closePanel}>
            Imprimer le reçu
          </Link>
        ) : (
          <form className="os-form-stack" onSubmit={pay}>
            <label className="os-field">
              <span>Premier paiement (CFA)</span>
              <input className="os-input" inputMode="numeric" value={amount} onChange={(ev) => setAmount(ev.target.value)} />
            </label>
            <button type="submit" className="os-btn os-btn-primary">
              Enregistrer le paiement
            </button>
          </form>
        )}
        <OsConfirm
          open={askPay}
          title="Enregistrer le paiement"
          body="Confirmez ce premier paiement."
          onConfirm={confirmPay}
          onCancel={() => setAskPay(false)}
        />
      </div>
    );
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
        <span>Groupe</span>
        <select className="os-input" value={groupId} onChange={(ev) => setGroupId(ev.target.value)}>
          {groups.map((g) => {
            const program = PROGRAMS.find((p) => p.id === g.programId)?.name ?? g.programId;
            const campus = CAMPUSES.find((c) => c.id === g.campusId)?.name ?? g.campusId;
            return (
              <option key={g.id} value={g.id}>
                {g.name}, {program}, {campus}
              </option>
            );
          })}
        </select>
      </label>
      <button type="submit" className="os-btn os-btn-primary">
        {t.desk.enrollStudent}
      </button>
    </form>
    <OsConfirm
      open={askEnroll}
      title="Enregistrer l'inscription"
      body="Confirmez l'inscription de cet élève."
      onConfirm={confirmEnroll}
      onCancel={() => setAskEnroll(false)}
    />
    </>
  );
}
