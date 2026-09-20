/**
 * FICTIONAL operations data: payments, documents, notifications, transfers.
 *
 * No real transaction.
 */

import { PROGRAMS, TIMELINE, between, nowStamp, pick, rng } from "./core";
import { STUDENTS, liveStudents, patchExtraStudent, type Student } from "./people";
import { overlayById, readJson, writeJson } from "./persist";

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
const PURPOSES: Payment["purpose"][] = ["Scolarité", "Logement", "Inscription", "Examen"];

export const PAYMENTS: Payment[] = Array.from({ length: 180 }, (_, i) => {
  const r = rng(8800 + i * 17);
  const student = STUDENTS[Math.floor(r() * STUDENTS.length)];
  const program = PROGRAMS.find((p) => p.id === student.programId) ?? PROGRAMS[0];
  const purpose = pick(PURPOSES, r);
  const amount =
    purpose === "Scolarité"
      ? Math.round(program.mockFee / pick([1, 2, 3], r))
      : purpose === "Logement"
        ? pick([60000, 100000, 130000], r)
        : purpose === "Inscription"
          ? 25000
          : 15000;

  const month = between(r, 0, 11);
  return {
    id: `p-${String(i + 1).padStart(3, "0")}`,
    receipt: `REC-26-${String(i + 1001).padStart(5, "0")}`,
    studentId: student.id,
    studentName: student.name,
    programId: student.programId,
    amount,
    method: pick(METHODS, r),
    date: `2026-${String(month + 1).padStart(2, "0")}-${String(between(r, 1, 28)).padStart(2, "0")}`,
    time: `${String(between(r, 8, 17)).padStart(2, "0")}:${pick(["00", "15", "30", "45"], r)}`,
    purpose,
    campusId: student.campusId,
    recordedBy: pick(["Administration", "Comptabilité", "Directrice TAS"], r),
  };
});

const EXTRA_PAYMENTS_KEY = "tas-os-extra-payments";
export const PAYMENTS_CHANGED = "tas-payments-changed";

export function readExtraPayments(): Payment[] {
  return readJson<Payment[]>(EXTRA_PAYMENTS_KEY, []);
}

export function livePayments(): Payment[] {
  return overlayById(PAYMENTS, readExtraPayments());
}

function receiptNumber(code: string) {
  const m = /^REC-26-(\d+)$/.exec(code);
  return m ? Number(m[1]) : 0;
}

export function nextReceipt() {
  const used = [...PAYMENTS, ...readExtraPayments()].map((p) => p.receipt);
  const set = new Set(used);
  let n = Math.max(1001, ...used.map(receiptNumber)) + 1;
  let code = `REC-26-${String(n).padStart(5, "0")}`;
  while (set.has(code)) {
    n += 1;
    code = `REC-26-${String(n).padStart(5, "0")}`;
  }
  return code;
}

export function remainingDue(student: Student, extra: Payment[]) {
  const extraSum = extra.filter((p) => p.studentId === student.id).reduce((s, p) => s + p.amount, 0);
  if (student.id.startsWith("s-live")) {
    const fee = PROGRAMS.find((p) => p.id === student.programId)?.mockFee ?? student.balance + extraSum;
    return Math.max(0, fee - extraSum);
  }
  return Math.max(0, student.balance - extraSum);
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
    id: `p-live-${extra.length + PAYMENTS.length + 1}`,
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
  const due = remainingDue(input.student, extra);
  patchExtraStudent(input.student.id, {
    balance: due,
    paymentStatus: due === 0 ? "paid" : "partial",
  });
  return payment;
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
  const key = `2026-${String(i + 1).padStart(2, "0")}`;
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
    date: `2026-09-${String(between(r, 1, 19)).padStart(2, "0")}`,
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

export const TRANSFERS: Transfer[] = [
  { id: "tr-01", studentId: "s-004", studentName: "Awa Mensah", matricule: "TAS-26-0004", fromGroupId: "g-01", toGroupId: "g-02", reason: "Niveau trop bas après test de mi-parcours.", requestedBy: "Enseignant INT-A1-1", status: "pending", date: "2026-09-18" },
  { id: "tr-02", studentId: "s-012", studentName: "Ibrahim Diallo", matricule: "TAS-26-0012", fromGroupId: "g-04", toGroupId: "g-05", reason: "Demande de l'étudiant, même programme longue durée.", requestedBy: "Administration", status: "pending", date: "2026-09-17" },
  { id: "tr-03", studentId: "s-021", studentName: "Fatou Koné", matricule: "TAS-26-0021", fromGroupId: "g-02", toGroupId: "g-03", reason: "Progression validée par l'enseignant.", requestedBy: "Enseignant INT-A2-1", status: "approved", date: "2026-09-12" },
  { id: "tr-04", studentId: "s-033", studentName: "Kwame Asante", matricule: "TAS-26-0033", fromGroupId: "g-06", toGroupId: "g-07", reason: "Informatique : passage intermédiaire.", requestedBy: "Administration", status: "rejected", date: "2026-09-10" },
];

export const PENDING_TRANSFERS = TRANSFERS.filter((t) => t.status === "pending");
