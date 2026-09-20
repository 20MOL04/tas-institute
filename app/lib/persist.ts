/**
 * Point unique d’écriture locale. Pour brancher la base : remplacer
 * readJson / writeJson par les lectures et écritures distantes.
 */

export function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function writeJson<T>(key: string, value: T, event: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new Event(event));
}

export function overlayById<T extends { id: string }>(base: readonly T[], extra: T[]): T[] {
  const map = new Map(extra.map((row) => [row.id, row]));
  const seen = new Set<string>();
  const out: T[] = [];
  for (const row of extra) {
    if (base.some((b) => b.id === row.id)) continue;
    if (seen.has(row.id)) continue;
    seen.add(row.id);
    out.push(row);
  }
  for (const row of base) {
    out.push(map.get(row.id) ?? row);
  }
  return out;
}
