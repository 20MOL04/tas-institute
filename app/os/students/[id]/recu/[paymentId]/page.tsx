"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import {
  CAMPUSES,
  PAYMENTS,
  PROGRAMS,
  SCHOOLS,
  STUDENTS,
  fmtDate,
  fmtMoney,
  fmtMonthLong,
  fmtTime,
  readExtraPayments,
  readExtraStudents,
  remainingDue,
  type Payment,
  type Student,
} from "../../../../_data";
import { useOs } from "../../../../_components/OsProvider";
import { shareReceiptImage } from "../../../../_lib/shareReceiptImage";
import BrandIcon from "../../../../../components/BrandIcon";

export default function ReceiptPage({ params }: { params: { id: string; paymentId: string } }) {
  const pathname = usePathname() || "";
  const { session } = useOs();
  const parts = pathname.split("/").filter(Boolean);
  const studentId = params.id || parts[2] || "";
  const paymentId = params.paymentId || parts[4] || "";
  const [payment, setPayment] = useState<Payment | null | undefined>(undefined);
  const [student, setStudent] = useState<Student | null>(null);
  const [extra, setExtra] = useState<Payment[]>([]);

  useEffect(() => {
    const extras = readExtraPayments();
    setExtra(extras);
    const row =
      extras.find((p) => p.id === paymentId) ??
      extras.find((p) => p.receipt === paymentId) ??
      PAYMENTS.find((p) => p.id === paymentId) ??
      PAYMENTS.find((p) => p.receipt === paymentId) ??
      null;
    setPayment(row);
    const live = readExtraStudents().find((s) => s.id === studentId);
    setStudent(live ?? STUDENTS.find((s) => s.id === studentId) ?? STUDENTS.find((s) => s.id === row?.studentId) ?? null);
  }, [studentId, paymentId]);

  if (payment === undefined) return <p className="os-muted">Chargement du reçu.</p>;
  if (!payment || !student) {
    return <p className="os-empty">Reçu introuvable.</p>;
  }

  const program = PROGRAMS.find((p) => p.id === student.programId)?.name ?? student.programId;
  const campus = CAMPUSES.find((c) => c.id === student.campusId)?.name ?? "";
  const school = SCHOOLS.find((s) => s.id === student.schoolId);
  const due = remainingDue(student, extra);
  const clerk = session?.name || payment.recordedBy;

  return (
    <>
      <div className="os-page-actions" style={{ justifyContent: "flex-end" }}>
        <button
          type="button"
          className="os-btn"
          onClick={() =>
            void shareReceiptImage({
              school: school?.name ?? "TAS English Institute",
              campus,
              receipt: payment.receipt,
              student: student.name,
              matricule: student.matricule,
              program,
              month: fmtMonthLong(payment.date),
              date: fmtDate(payment.date),
              time: payment.time || fmtTime(student.enrolledAt) || "Non indiquée",
              purpose: payment.purpose,
              method: payment.method,
              amount: fmtMoney(payment.amount),
              due: due === 0 ? "Aucun" : fmtMoney(due),
              clerk,
            })
          }
        >
          Partager
        </button>
        <button type="button" className="os-btn os-btn-primary" onClick={() => window.print()}>
          Imprimer
        </button>
      </div>
      <article className="os-receipt">
        <header className="os-receipt-brand">
          <div className="os-doc-brand">
            <BrandIcon size={48} />
            <div>
              <strong>{school?.name ?? "TAS English Institute"}</strong>
              <span className="os-muted">{campus}</span>
            </div>
          </div>
          <div>
            <strong>{payment.receipt}</strong>
            <span className="os-muted">Reçu de paiement</span>
          </div>
        </header>
        <div className="os-receipt-meta">
          <div>
            <span>Élève</span>
            <b>{student.name}</b>
          </div>
          <div>
            <span>Matricule</span>
            <b>{student.matricule}</b>
          </div>
          <div>
            <span>Programme</span>
            <b>{program}</b>
          </div>
          <div>
            <span>Mois</span>
            <b>{fmtMonthLong(payment.date)}</b>
          </div>
          <div>
            <span>Date</span>
            <b>{fmtDate(payment.date)}</b>
          </div>
          <div>
            <span>Heure</span>
            <b>{payment.time || fmtTime(student.enrolledAt) || "Non indiquée"}</b>
          </div>
          <div>
            <span>Objet</span>
            <b>{payment.purpose}</b>
          </div>
          <div>
            <span>Moyen</span>
            <b>{payment.method}</b>
          </div>
        </div>
        <div className="os-receipt-pay">
          <span>Montant reçu</span>
          <span>{fmtMoney(payment.amount)}</span>
        </div>
        <div className="os-receipt-pay">
          <span>Reste à payer</span>
          <span>{due === 0 ? "Aucun" : fmtMoney(due)}</span>
        </div>
        <div className="os-receipt-sign">
          <div>
            <p>{"L'élève"}</p>
            <b>{student.name}</b>
          </div>
          <div>
            <p>Administration, signature</p>
            <b>{clerk}</b>
          </div>
        </div>
      </article>
    </>
  );
}
