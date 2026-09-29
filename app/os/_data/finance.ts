/**
 * Échéancier d'un élève : ce qui devait être payé, et quand.
 * Source unique pour « attendu », « reste à recouvrer » et l'ancienneté des impayés.
 */

import { addDays } from "../_lib/dates";
import { REG_FEE } from "./settings";

export type Installment = { date: string; amount: number };

type Plan = { enrolledAt: string; feeTotal: number; plan: number };

const round500 = (n: number) => Math.round(n / 500) * 500;

/** Frais d'inscription à la date d'inscription, puis la scolarité en `plan` parts espacées de 30 jours. */
export function installments(student: Plan): Installment[] {
  const date0 = student.enrolledAt.slice(0, 10);
  const reg = Math.min(REG_FEE, student.feeTotal);
  const tuition = Math.max(0, student.feeTotal - reg);
  const n = Math.max(1, student.plan);
  const part = round500(tuition / n);
  const out: Installment[] = [];
  let left = tuition;
  for (let k = 0; k < n; k++) {
    const amount = k === n - 1 ? left : Math.min(part, left);
    left -= amount;
    out.push({ date: addDays(date0, 30 * k), amount: amount + (k === 0 ? reg : 0) });
  }
  return out;
}

/** Somme due à une date (incluse). */
export function dueBy(student: Plan, day: string): number {
  let sum = 0;
  for (const i of installments(student)) if (i.date <= day) sum += i.amount;
  return sum;
}

/**
 * Impayé échu à `day` : montant en retard et date de la plus ancienne échéance non couverte.
 * Les paiements couvrent les échéances dans l'ordre.
 */
export function overdueAt(student: Plan, paid: number, day: string): { amount: number; since: string | null } {
  let covered = paid;
  let amount = 0;
  let since: string | null = null;
  for (const i of installments(student)) {
    if (i.date > day) break;
    if (covered >= i.amount) {
      covered -= i.amount;
      continue;
    }
    amount += i.amount - covered;
    if (!since) since = i.date;
    covered = 0;
  }
  return { amount, since };
}
