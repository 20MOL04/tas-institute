/**
 * FICTIONAL operations data: payments, documents, notifications, transfers.
 *
 * No real transaction.
 */

import { PROGRAMS, TIMELINE, between, fmtMoney, nowStamp, pick, rng } from "./core";
import { STUDENTS, liveStudents, patchExtraStudent, type Student } from "./people";
import { overlayById, readJson, writeJson } from "./persist";
import { appendAudit } from "./audit";
import { WORLD } from "./world";
import { addDays, localIso } from "../_lib/dates";

/* ----- payments ----------------------------------------------------------- */

export type PaymentMethod = "Mobile Money" | "Espèces" | "Virement" | "Carte";

export type Payment = {
  id: string;
  receipt: string;
  studentId: string;
  studentName: string;
  programId: string;
  amount: number;
  method: PaymentMethod;
  date: string;
  time: string;
  purpose: "Scolarité" | "Logement" | "Inscription" | "Examen";
  campusId: string;
  recordedBy: string;
};

const METHODS: PaymentMethod[] = ["Mobile Money", "Espèces", "Virement", "Carte"];

/** ~4 000 fictional payments over the last 18 months, never dated in the future. */
export const PAYMENTS: Payment[] = WORLD.payments;

const EXTRA_PAYMENTS_KEY = "tas-os-extra-payments";
export const PAYMENTS_CHANGED = "tas-payments-changed";

export function readExtraPayments(): Payment[] {
  return readJson<Payment[]>(EXTRA_PAYMENTS_KEY, []);
}

const DELETED_PAYMENTS_KEY = "tas-os-deleted-payments";

function readDeletedPayments(): string[] {
  return readJson<string[]>(DELETED_PAYMENTS_KEY, []);
}

export function livePayments(): Payment[] {
  const merged = overlayById(PAYMENTS, readExtraPayments());
  const deleted = readDeletedPayments();
  if (deleted.length === 0) return merged;
  const gone = new Set(deleted);
  return merged.filter((p) => !gone.has(p.id));
}

function receiptNumber(code: string) {
  const m = /^REC-\d\d-(\d+)$/.exec(code);
  return m ? Number(m[1]) : 0;
}

export function nextReceipt() {
  const used = [...PAYMENTS, ...readExtraPayments()].map((p) => p.receipt);
  const set = new Set(used);
  let n = Math.max(1001, ...used.map(receiptNumber)) + 1;
  const yy = localIso().slice(2, 4);
  let code = `REC-${yy}-${String(n).padStart(5, "0")}`;
  while (set.has(code)) {
    n += 1;
    code = `REC-${yy}-${String(n).padStart(5, "0")}`;
  }
  return code;
}

/** Reste dû par l'élève : total de la formation moins tous ses paiements (jamais négatif). */
export function remainingDue(student: Student, _extra?: Payment[]) {
  void _extra;
  const paid = livePayments()
    .filter((p) => p.studentId === student.id)
    .reduce((s, p) => s + p.amount, 0);
  return Math.max(0, student.feeTotal - paid);
}

/** Recalcule solde et statut de paiement d'un élève à partir de ses paiements. */
export function refreshStudentFinance(studentId: string) {
  const student = liveStudents().find((s) => s.id === studentId);
  if (!student) return;
  const paid = livePayments()
    .filter((p) => p.studentId === studentId)
    .reduce((s, p) => s + p.amount, 0);
  const due = Math.max(0, student.feeTotal - paid);
  patchExtraStudent(studentId, {
    balance: due,
    paymentStatus: due === 0 ? "paid" : paid === 0 ? "unpaid" : "partial",
  });
}

export function addPayment(input: {
  student: Student;
  amount: number;
  method: PaymentMethod;
  purpose: Payment["purpose"];
  recordedBy: string;
}): Payment {
  const extra = readExtraPayments();
  const stamp = nowStamp();
  const payment: Payment = {
    id: `p-live-${Date.now()}-${extra.length + 1}`,
    receipt: nextReceipt(),
    studentId: input.student.id,
    studentName: input.student.name,
    programId: input.student.programId,
    amount: input.amount,
    method: input.method,
    date: stamp.date,
    time: stamp.time,
    purpose: input.purpose,
    campusId: input.student.campusId,
    recordedBy: input.recordedBy,
  };
  extra.unshift(payment);
  writeJson(EXTRA_PAYMENTS_KEY, extra, PAYMENTS_CHANGED);
  refreshStudentFinance(input.student.id);
  appendAudit({
    actor: input.recordedBy,
    type: "payment",
    action: "Paiement enregistré",
    detail: `${fmtMoney(input.amount)} · ${input.student.name} · ${payment.receipt}`,
    href: `/os/students/${input.student.id}/recu/${payment.id}`,
  });
  return payment;
}

/** Annule un paiement enregistré par erreur (trace conservée dans le journal). */
export function deletePayment(id: string, actor: string, reason?: string) {
  const row = livePayments().find((p) => p.id === id);
  if (!row) return;
  const extra = readExtraPayments().filter((p) => p.id !== id);
  writeJson(EXTRA_PAYMENTS_KEY, extra, PAYMENTS_CHANGED);
  const deleted = readDeletedPayments();
  if (!deleted.includes(id)) writeJson(DELETED_PAYMENTS_KEY, [...deleted, id], PAYMENTS_CHANGED);
  refreshStudentFinance(row.studentId);
  appendAudit({
    actor,
    type: "payment",
    action: "Paiement supprimé",
    detail: `${fmtMoney(row.amount)} · ${row.studentName} · ${row.receipt}${reason ? ` · ${reason}` : ""}`,
  });
}

export function findPayment(id: string): Payment | undefined {
  return livePayments().find((p) => p.id === id);
}

export const REVENUE_TOTAL = PAYMENTS.reduce((s, p) => s + p.amount, 0);

export const OUTSTANDING_TOTAL = STUDENTS.reduce((s, st) => s + st.balance, 0);

export function liveOutstandingTotal() {
  return liveStudents().reduce((sum, st) => sum + st.balance, 0);
}

export const REVENUE_BY_PROGRAM = PROGRAMS.map((p) => ({
  programId: p.id,
  name: p.name,
  revenue: PAYMENTS.filter((pay) => pay.programId === p.id).reduce((s, pay) => s + pay.amount, 0),
}));

export const REVENUE_BY_METHOD = METHODS.map((m) => ({
  method: m,
  revenue: PAYMENTS.filter((p) => p.method === m).reduce((s, p) => s + p.amount, 0),
  count: PAYMENTS.filter((p) => p.method === m).length,
}));

export const REVENUE_MONTHLY = TIMELINE.map((t, i) => {
  const key = t.key;
  return {
    label: t.label,
    value: PAYMENTS.filter((p) => p.date.startsWith(key)).reduce((s, p) => s + p.amount, 0),
  };
});

/* ----- documents ---------------------------------------------------------- */

export type DocumentRow = {
  id: string;
  type: "Carte étudiant" | "Reçu" | "Attestation" | "Certificat" | "Pièce d'identité";
  studentName: string;
  matricule: string;
  status: "generated" | "pending" | "missing";
  date: string;
};

export const DOCUMENTS: DocumentRow[] = Array.from({ length: 48 }, (_, i) => {
  const r = rng(6200 + i * 5);
  const student = STUDENTS[Math.floor(r() * STUDENTS.length)];
  const roll = r();
  return {
    id: `d-${String(i + 1).padStart(3, "0")}`,
    type: pick(["Carte étudiant", "Reçu", "Attestation", "Certificat", "Pièce d'identité"] as const, r),
    studentName: student.name,
    matricule: student.matricule,
    status: roll > 0.72 ? "pending" : roll > 0.6 ? "missing" : "generated",
    date: addDays(localIso(), -between(r, 1, 19)),
  };
});

/* ----- notifications ------------------------------------------------------ */

export type NotifCategory = "Admissions" | "Finance" | "Académique" | "Opérations" | "Système";

export type Notification = {
  id: string;
  category: NotifCategory;
  title: string;
  detail: string;
  at: string;
  priority: "high" | "normal" | "low";
  read: boolean;
};

export const NOTIFICATIONS: Notification[] = [
  { id: "n-01", category: "Admissions", title: "12 candidatures en attente de revue", detail: "Rentrée octobre, campus Alajo", at: "il y a 14 min", priority: "high", read: false },
  { id: "n-02", category: "Finance", title: "9 étudiants avec un solde impayé", detail: "Total 2,1M CFA sur le programme intensif", at: "il y a 42 min", priority: "high", read: false },
  { id: "n-03", category: "Opérations", title: "Groupe INF-D-1 à capacité", detail: "15/15 places occupées, prévoir un second groupe", at: "il y a 1 h", priority: "normal", read: false },
  { id: "n-04", category: "Admissions", title: "7 dossiers incomplets", detail: "Pièce d'identité ou photo manquante", at: "il y a 2 h", priority: "normal", read: false },
  { id: "n-05", category: "Académique", title: "Présence en baisse, LNG-B1-1", detail: "82 % cette semaine contre 91 % la précédente", at: "il y a 3 h", priority: "normal", read: true },
  { id: "n-06", category: "Opérations", title: "TikTok : beaucoup de visites, peu d'inscriptions", detail: "9 240 visites pour 9 inscriptions ce trimestre", at: "il y a 5 h", priority: "normal", read: true },
  { id: "n-07", category: "Système", title: "Sauvegarde quotidienne terminée", detail: "Aucune erreur signalée", at: "hier", priority: "low", read: true },
  { id: "n-08", category: "Finance", title: "Reçu REC-26-01042 généré", detail: "Scolarité, 150 000 CFA", at: "hier", priority: "low", read: true },
];

/* ----- group transfers (admin/CEO validation) ----------------------------- */

export type TransferStatus = "pending" | "approved" | "rejected";

export type Transfer = {
  id: string;
  studentId: string;
  studentName: string;
  matricule: string;
  fromGroupId: string;
  toGroupId: string;
  reason: string;
  requestedBy: string;
  status: TransferStatus;
  date: string;
};

export const TRANSFERS: Transfer[] = WORLD.transfers;

export const PENDING_TRANSFERS = TRANSFERS.filter((t) => t.status === "pending");
