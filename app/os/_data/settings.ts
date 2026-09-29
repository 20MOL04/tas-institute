/**
 * Réglages de l'école (frais, année scolaire, seuils d'alerte).
 * Lus par les alertes, la cloche, la notion « élève en danger » et les rapports.
 */

import { PROGRAMS } from "./core";
import { readJson, writeJson } from "./persist";

export const REG_FEE = 25_000;

/** Coefficients appliqués au tarif de référence 3 mois pour obtenir 6 et 9 mois. */
const DURATION_FACTOR: Record<string, Record<number, number>> = {
  "eng-intensive": { 3: 1, 6: 1.506, 9: 2.0 },
  "eng-long": { 3: 1, 6: 1.235, 9: 1.588 },
  computer: { 3: 1, 6: 1.78, 9: 2.5 },
  "abla-business": { 3: 1, 6: 1.71, 9: 2.37 },
};

export type Settings = {
  /** Tarif de référence (3 mois) par formation, en CFA. */
  fees: Record<string, number>;
  schoolYear: string;
  /** Impayé signalé au-delà de N jours. */
  unpaidDays: number;
  /** Session signalée à partir de N % de remplissage. */
  fillPct: number;
  /** Présence considérée trop basse sous N %. */
  attendancePct: number;
  /** Demande non rappelée depuis N jours. */
  callbackDays: number;
};

export const DEFAULT_SETTINGS: Settings = {
  fees: Object.fromEntries(PROGRAMS.map((p) => [p.id, p.mockFee])),
  schoolYear: "2026-2027",
  unpaidDays: 30,
  fillPct: 90,
  attendancePct: 80,
  callbackDays: 3,
};

export function feeFor(programId: string, months: number, fees: Record<string, number> = DEFAULT_SETTINGS.fees): number {
  const base = fees[programId] ?? DEFAULT_SETTINGS.fees[programId] ?? 0;
  const factor = DURATION_FACTOR[programId]?.[months] ?? months / 3;
  return Math.round((base * factor) / 1000) * 1000;
}

const KEY = "tas-os-settings";
export const SETTINGS_CHANGED = "tas-settings-changed";

export function readSettings(): Settings {
  const saved = readJson<Partial<Settings>>(KEY, {});
  return {
    ...DEFAULT_SETTINGS,
    ...saved,
    fees: { ...DEFAULT_SETTINGS.fees, ...(saved.fees ?? {}) },
  };
}

export function writeSettings(next: Settings) {
  writeJson(KEY, next, SETTINGS_CHANGED);
}
