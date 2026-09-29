/**
 * The eight founder KPIs (4 hero + 4 mini), built once from the selectors so the
 * dashboard, the report and the export show the very same figures.
 */

import type { Kpi } from "./index";
import type { Snapshot } from "./repo";
import { delta, kpiValues, type CampusFilter, type KpiValues, type Range } from "./metrics";
import { fmtInt, fmtMoney } from "./core";
import { fmtDayYear } from "../_lib/dates";

const NB = " ";

function pct(n: number | null, digits = 0): string {
  return n === null ? "—" : `${n.toFixed(digits).replace(".", ",")}${NB}%`;
}

function pts(cur: number | null, prev: number | null | undefined): number | null {
  return cur === null || prev === null || prev === undefined ? null : cur - prev;
}

export type FounderKpis = { hero: Kpi[]; mini: Kpi[]; cur: KpiValues; prev: KpiValues | null };

export function founderKpis(snap: Snapshot, campus: CampusFilter, range: Range, prevRange: Range | null, compareLabel = "vs période précédente"): FounderKpis {
  const cur = kpiValues(snap, campus, range);
  const prev = prevRange ? kpiValues(snap, campus, prevRange) : null;
  const { attendancePct, unpaidDays } = snap.settings;
  const base = { compare: true, compareLabel } as const;

  const hero: Kpi[] = [
    {
      ...base,
      id: "actifs",
      label: "Élèves actifs",
      value: fmtInt(cur.actifs),
      raw: cur.actifs,
      delta: delta(cur.actifs, prev?.actifs),
      hint: "",
      sub: `au ${fmtDayYear(range.end)}`,
    },
    {
      ...base,
      id: "encaisse",
      label: "Encaissé",
      value: fmtMoney(cur.encaisse),
      raw: cur.encaisse,
      delta: delta(cur.encaisse, prev?.encaisse),
      hint: "",
      sub: "paiements reçus sur la période",
    },
    {
      ...base,
      id: "reste",
      label: "Reste à recouvrer",
      value: fmtMoney(cur.reste),
      raw: cur.reste,
      delta: delta(cur.reste, prev?.reste),
      invert: true,
      hint: "",
      sub: `sur ${fmtInt(cur.resteEleves)} élève${cur.resteEleves > 1 ? "s" : ""}`,
    },
    {
      ...base,
      id: "remplissage",
      label: "Remplissage des sessions",
      value: pct(cur.fillPct),
      raw: cur.fillPct ?? 0,
      delta: pts(cur.fillPct, prev?.fillPct),
      deltaUnit: "pts",
      hint: "",
      sub: `${fmtInt(cur.fillTaken)} / ${fmtInt(cur.fillCap)} places`,
    },
  ];

  const mini: Kpi[] = [
    {
      ...base,
      id: "inscriptions",
      label: "Nouvelles inscriptions",
      value: fmtInt(cur.inscriptions),
      raw: cur.inscriptions,
      delta: delta(cur.inscriptions, prev?.inscriptions),
      hint: "",
    },
    {
      ...base,
      id: "conversion",
      label: "Taux de conversion",
      value: pct(cur.conversion, 1),
      raw: cur.conversion ?? 0,
      delta: pts(cur.conversion, prev?.conversion),
      deltaUnit: "pts",
      hint: "",
      sub: `${fmtInt(cur.inscrits)} inscrits / ${fmtInt(cur.demandes)} demandes`,
    },
    {
      ...base,
      id: "presence",
      label: "Taux de présence",
      value: pct(cur.presence, 1),
      raw: cur.presence ?? 0,
      delta: pts(cur.presence, prev?.presence),
      deltaUnit: "pts",
      hint: "",
    },
    {
      ...base,
      id: "danger",
      label: "Élèves en danger",
      value: fmtInt(cur.danger),
      raw: cur.danger,
      delta: delta(cur.danger, prev?.danger),
      invert: true,
      hint: "",
      sub: `présence < ${attendancePct} % ou impayé ≥ ${unpaidDays} j`,
    },
  ];
  return { hero, mini, cur, prev };
}
