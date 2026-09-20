"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import {
  GROUPS,
  addPayment,
  addStudent,
  updateLead,
  groupMenuOption,
  type Student,
} from "../_data";
import { addExtraStudentAccount } from "../_data/auth";
import { COURSE_DURATION_MONTHS, durationLabelFr, type CourseDurationMonths } from "../../lib/course-duration";
import { useOs } from "../_components/OsProvider";
import { useOsT } from "../_components/useOsT";
import OsConfirm from "../_components/OsConfirm";
import SelectMenu from "../../components/ui/SelectMenu";
import CountryField from "../../components/ui/CountryField";

export default function EnrollStudentForm() {
  const { t } = useOsT();
  const { user, session, enrollDraft, closePanel } = useOs();
  const groups = GROUPS.filter((g) => g.schoolId === "tas");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("");
  const [groupId, setGroupId] = useState(groups[0]?.id ?? "");
  const [durationMonths, setDurationMonths] = useState<CourseDurationMonths>(3);
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
    if (enrollDraft.durationMonths) setDurationMonths(enrollDraft.durationMonths);
  }, [enrollDraft]);

  if (user.role === "teacher" || user.role === "student") return null;

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !country.trim()) return;
    setAskEnroll(true);
  }

  function confirmEnroll() {
    setAskEnroll(false);
    const student = addStudent({
      name: name.trim(),
      phone: phone.trim(),
      country: country.trim(),
      countryCode: "",
      groupId,
      source: enrollDraft?.source ?? "Walk-in",
      durationMonths,
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
        <CountryField value={country} onChange={setCountry} required />
      </label>
      <label className="os-field">
        <span>Classe</span>
        <SelectMenu
          value={groupId}
          onChange={setGroupId}
          searchable
          options={groups.map(groupMenuOption)}
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
