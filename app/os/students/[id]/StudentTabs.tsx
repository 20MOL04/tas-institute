"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import Link from "next/link";
import {
  addPayment,
  fmtDate,
  fmtGrade,
  fmtMoney,
  fmtPct,
  fmtTime,
  nextLevelFor,
  passedThisMonth,
  remainingDue,
  sessionAttendanceRate,
  type AttendanceRow,
  type DocumentRow,
  type Payment,
  type PaymentMethod,
  type Student,
} from "../../_data";
import {
  Badge,
  DOCUMENT_STATUS_FR,
  OsCard,
  PAYMENT_STATUS_FR,
  STUDENT_STATUS_FR,
  statusTone,
} from "../../_components/ui";
import { useOs } from "../../_components/OsProvider";
import { useLivePayments } from "../../_components/useLivePayments";
import OsConfirm from "../../_components/OsConfirm";

type Tab = "overview" | "payments" | "documents" | "attendance" | "grades";

const TABS: { id: Tab; label: string }[] = [
  { id: "overview", label: "Aperçu" },
  { id: "payments", label: "Paiements" },
  { id: "documents", label: "Documents" },
  { id: "attendance", label: "Présence" },
  { id: "grades", label: "Notes" },
];

const CAN_PAY = new Set(["admin", "founder", "director", "superadmin", "finance"]);
const METHODS: PaymentMethod[] = ["Mobile Money", "Espèces", "Virement", "Carte"];
const PURPOSES: Payment["purpose"][] = ["Scolarité", "Logement", "Inscription", "Examen"];

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <div className="os-small os-muted">{label}</div>
      <div className="os-table-strong">{children}</div>
    </div>
  );
}

export default function StudentTabs({
  student,
  programName,
  groupName,
  groupRoom,
  groupSchedule,
  teacherName,
  campusName,
  schoolName,
  payments,
  documents,
  attendance,
}: {
  student: Student;
  programName: string;
  groupName: string;
  groupRoom: string;
  groupSchedule: string;
  teacherName: string;
  campusName: string;
  schoolName: string;
  payments: Payment[];
  documents: DocumentRow[];
  attendance: AttendanceRow[];
}) {
  const { session, user } = useOs();
  const livePayments = useLivePayments();
  const extra = livePayments.filter((p) => p.id.startsWith("p-live") && p.studentId === student.id);
  const allPayments = [...extra, ...payments.filter((p) => p.studentId === student.id)];
  const due = remainingDue(student, extra);
  const [tab, setTab] = useState<Tab>("overview");
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<PaymentMethod>("Mobile Money");
  const [purpose, setPurpose] = useState<Payment["purpose"]>("Scolarité");
  const [askPay, setAskPay] = useState(false);
  const paidTotal = allPayments.reduce((sum, p) => sum + p.amount, 0);
  const nextLevel = nextLevelFor(student.programId, student.level, student.averageGrade);
  const stays = student.status === "active" && !passedThisMonth(student.averageGrade);
  const lastLevel =
    student.status === "active" && passedThisMonth(student.averageGrade) && nextLevel === student.level;
  const enrolledTime = fmtTime(student.enrolledAt);

  function savePay(e: FormEvent) {
    e.preventDefault();
    const value = Number(amount.replace(",", "."));
    if (!Number.isFinite(value) || value <= 0) return;
    setAskPay(true);
  }

  function confirmPay() {
    const value = Number(amount.replace(",", "."));
    if (!Number.isFinite(value) || value <= 0) return;
    setAskPay(false);
    addPayment({
      student,
      amount: value,
      method,
      purpose,
      recordedBy: session?.name || user.name,
    });
    setAmount("");
  }

  return (
    <>
      <div className="os-tabs" role="tablist" aria-label="Dossier étudiant">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-pressed={tab === t.id}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "overview" ? (
        <div className="os-grid os-grid-2">
          <OsCard title="Identité">
            <div className="os-grid os-grid-2">
              <Field label="Matricule">{student.matricule}</Field>
              <Field label="Genre">{student.gender === "F" ? "Femme" : "Homme"}</Field>
              <Field label="Téléphone">{student.phone}</Field>
              <Field label="E-mail">{student.email}</Field>
              <Field label="Pays">{student.country}</Field>
              <Field label="Source">{student.source}</Field>
              <Field label="Statut">
                <Badge tone={statusTone(student.status)}>{STUDENT_STATUS_FR[student.status]}</Badge>
              </Field>
              <Field label="Inscription">
                {fmtDate(student.enrolledAt)}
                {enrolledTime ? `, ${enrolledTime}` : ""}
              </Field>
            </div>
          </OsCard>
          <OsCard title="Scolarité">
            <div className="os-grid os-grid-2">
              <Field label="École">{schoolName}</Field>
              <Field label="Campus">{campusName}</Field>
              <Field label="Programme">{programName}</Field>
              <Field label="Niveau">{student.level}</Field>
              <Field label="Mois suivant">
                {student.status !== "active"
                  ? "Hors parcours"
                  : stays
                    ? `Reste en ${student.level}`
                    : lastLevel
                      ? "Dernier niveau"
                      : nextLevel}
              </Field>
              <Field label="Groupe">{groupName}</Field>
              <Field label="Enseignant du groupe">{teacherName}</Field>
              <Field label="Salle">{groupRoom}</Field>
              <Field label="Horaires">{groupSchedule}</Field>
              <Field label="Paiement">
                <Badge tone={statusTone(due === 0 ? "paid" : student.paymentStatus)}>
                  {PAYMENT_STATUS_FR[due === 0 ? "paid" : student.paymentStatus]}
                </Badge>
              </Field>
              <Field label="Reste à payer">{due === 0 ? "Aucun" : fmtMoney(due)}</Field>
              <Field label="Présence">{fmtPct(student.attendanceRate, 0)}</Field>
              <Field label="Moyenne">{fmtGrade(student.averageGrade)} / 20</Field>
            </div>
          </OsCard>
        </div>
      ) : null}

      {tab === "payments" ? (
        <OsCard
          title="Paiements"
          foot={`${allPayments.length} reçu(s), ${fmtMoney(paidTotal)} encaissés, reste à payer ${due === 0 ? "aucun" : fmtMoney(due)}`}
        >
          {CAN_PAY.has(user.role) ? (
            <form className="os-form-compact" onSubmit={savePay} style={{ marginBottom: 16 }}>
              <label className="os-field">
                <span>Montant</span>
                <input
                  className="os-input"
                  inputMode="decimal"
                  value={amount}
                  onChange={(ev) => setAmount(ev.target.value)}
                  required
                />
              </label>
              <label className="os-field">
                <span>Objet</span>
                <select className="os-input" value={purpose} onChange={(ev) => setPurpose(ev.target.value as Payment["purpose"])}>
                  {PURPOSES.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </label>
              <label className="os-field">
                <span>Moyen</span>
                <select className="os-input" value={method} onChange={(ev) => setMethod(ev.target.value as PaymentMethod)}>
                  {METHODS.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </label>
              <button type="submit" className="os-btn os-btn-primary">
                Enregistrer le paiement
              </button>
            </form>
          ) : null}
          <OsConfirm
            open={askPay}
            title="Enregistrer le paiement"
            body="Confirmez ce paiement."
            onConfirm={confirmPay}
            onCancel={() => setAskPay(false)}
          />
          {allPayments.length === 0 ? (
            <p className="os-empty">Aucun paiement lié à cet étudiant.</p>
          ) : (
            <div className="os-table-wrap">
              <table className="os-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Reçu</th>
                    <th>Objet</th>
                    <th>Moyen</th>
                    <th>Saisi par</th>
                    <th className="num">Montant</th>
                    <th className="os-th-action">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {allPayments.map((p) => (
                    <tr key={p.id}>
                      <td>
                        {fmtDate(p.date)}
                        <div className="os-muted os-small">{p.time}</div>
                      </td>
                      <td className="os-table-strong">{p.receipt}</td>
                      <td>{p.purpose}</td>
                      <td>{p.method}</td>
                      <td>{p.recordedBy}</td>
                      <td className="num">{fmtMoney(p.amount)}</td>
                      <td className="os-td-action">
                        <Link href={`/os/students/${student.id}/recu/${p.id}`} className="os-btn os-btn-sm">
                          Imprimer
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </OsCard>
      ) : null}

      {tab === "documents" ? (
        <OsCard title="Documents">
          {documents.length === 0 ? (
            <p className="os-empty">Aucun document rattaché à ce matricule.</p>
          ) : (
            <div className="os-table-wrap">
              <table className="os-table">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Date</th>
                    <th>Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {documents.map((d) => (
                    <tr key={d.id}>
                      <td className="os-table-strong">{d.type}</td>
                      <td>{fmtDate(d.date)}</td>
                      <td>
                        <Badge tone={statusTone(d.status)}>{DOCUMENT_STATUS_FR[d.status]}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </OsCard>
      ) : null}

      {tab === "attendance" ? (
        <OsCard title="Présence du groupe">
          {attendance.length === 0 ? (
            <p className="os-empty">Aucune séance pour ce groupe.</p>
          ) : (
            <div className="os-table-wrap">
              <table className="os-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Présents</th>
                    <th>Absents</th>
                    <th>Retards</th>
                    <th className="num">Taux</th>
                  </tr>
                </thead>
                <tbody>
                  {attendance.map((row) => (
                    <tr key={`${row.groupId}-${row.date}`}>
                      <td>{fmtDate(row.date)}</td>
                      <td>
                        <Badge tone={statusTone("present")}>Présent {row.present}</Badge>
                      </td>
                      <td>
                        <Badge tone={statusTone("absent")}>Absent {row.absent}</Badge>
                      </td>
                      <td>
                        <Badge tone={statusTone("late")}>Retard {row.late}</Badge>
                      </td>
                      <td className="num">{fmtPct(sessionAttendanceRate(row), 0)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </OsCard>
      ) : null}

      {tab === "grades" ? (
        <OsCard title="Notes" hint={`${student.level}, ${programName}`}>
          <div className="os-grid os-grid-2">
            <Field label="Moyenne">{fmtGrade(student.averageGrade)} / 20</Field>
            <Field label="Présence">{fmtPct(student.attendanceRate, 0)}</Field>
            <Field label="Niveau">{student.level}</Field>
            <Field label="Mois suivant">
              {student.status !== "active"
                ? "Hors parcours"
                : stays
                  ? `Reste en ${student.level}`
                  : lastLevel
                    ? "Dernier niveau"
                    : nextLevel}
            </Field>
            <Field label="Programme">{programName}</Field>
            <Field label="Groupe">{groupName}</Field>
            <Field label="Salle">{groupRoom}</Field>
            <Field label="Horaires">{groupSchedule}</Field>
          </div>
        </OsCard>
      ) : null}
    </>
  );
}
