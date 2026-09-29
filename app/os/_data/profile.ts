/**
 * Nom affiché du compte connecté (message d'accueil). Modifiable dans Paramètres :
 * il est gardé sur cet appareil, par matricule, et ne change pas le compte lui-même.
 */

import { readJson, writeJson } from "./persist";

const KEY = "tas-os-display-names";
export const PROFILE_CHANGED = "tas-profile-changed";

export function readDisplayName(matricule: string | undefined, fallback: string): string {
  if (!matricule) return fallback;
  const map = readJson<Record<string, string>>(KEY, {});
  return map[matricule]?.trim() || fallback;
}

export function saveDisplayName(matricule: string, name: string) {
  const map = readJson<Record<string, string>>(KEY, {});
  const clean = name.trim();
  if (clean) map[matricule] = clean;
  else delete map[matricule];
  writeJson(KEY, map, PROFILE_CHANGED);
}
