"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { previousLabel, previousRange, resolveRange, type CampusFilter, type Range } from "../../_data/metrics";
import { useRepo, type Snapshot } from "../../_data/repo";
import { fmtDay, fmtDayYear } from "../../_lib/dates";
import { isPeriod, type Period } from "../../_lib/period";

const KEY = "tas-founder-filters";

type Stored = { period: Period; cs?: string; ce?: string; campus: CampusFilter };

function read(defaultPeriod: Period): Stored {
  const fallback: Stored = { period: defaultPeriod, campus: "all" };
  if (typeof window === "undefined") return fallback;
  let stored: Partial<Stored> = {};
  try {
    stored = JSON.parse(window.sessionStorage.getItem(KEY) || "{}") as Partial<Stored>;
  } catch {
    stored = {};
  }
  const url = new URLSearchParams(window.location.search);
  const p = url.get("p");
  const from = url.get("from") ?? undefined;
  const to = url.get("to") ?? undefined;
  const campus = url.get("campus");
  const period: Period = isPeriod(p) ? p : isPeriod(stored.period) ? stored.period : defaultPeriod;
  return {
    period,
    cs: isPeriod(p) ? from : stored.cs,
    ce: isPeriod(p) ? to : stored.ce,
    campus: campus ?? stored.campus ?? "all",
  };
}

const PHRASE: Partial<Record<Period, string>> = {
  today: "aujourd'hui",
  yesterday: "hier",
  "7d": "7 derniers jours",
  "30d": "30 derniers jours",
  thisMonth: "ce mois",
  lastMonth: "le mois dernier",
  thisQuarter: "ce trimestre",
  thisYear: "cette année",
  lastYear: "l'année dernière",
  all: "depuis le début",
};

export function periodPhrase(period: Period, range: Range): string {
  if (period === "custom") return range.start === range.end ? `le ${fmtDayYear(range.start)}` : `du ${fmtDay(range.start)} au ${fmtDayYear(range.end)}`;
  return PHRASE[period] ?? "";
}

export type Filters = {
  snap: Snapshot;
  period: Period;
  customStart?: string;
  customEnd?: string;
  range: Range;
  prev: Range | null;
  campus: CampusFilter;
  compareLabel: string;
  phrase: string;
  onApply: (p: Period, cs?: string, ce?: string) => void;
  setCampus: (c: CampusFilter) => void;
  /** Query string that carries the current period to another page (reports). */
  query: string;
};

/** Période et campus partagés par toutes les pages Direction (mémorisés pour la session). */
export function useFounderFilters(defaultPeriod: Period = "thisMonth"): Filters {
  const snap = useRepo();
  const [state, setState] = useState<Stored>(() => read(defaultPeriod));
  useEffect(() => {
    try {
      window.sessionStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* stockage indisponible */
    }
  }, [state]);

  const range = useMemo(() => resolveRange(state.period, snap, state.cs, state.ce), [state, snap]);
  const prev = useMemo(() => previousRange(range, state.period), [range, state.period]);
  const onApply = useCallback((p: Period, cs?: string, ce?: string) => setState((s) => ({ ...s, period: p, cs, ce })), []);
  const setCampus = useCallback((campus: CampusFilter) => setState((s) => ({ ...s, campus })), []);
  const query = `p=${state.period}${state.period === "custom" && state.cs ? `&from=${state.cs}&to=${state.ce ?? state.cs}` : ""}&campus=${state.campus}`;
  return {
    snap,
    period: state.period,
    customStart: state.cs,
    customEnd: state.ce,
    range,
    prev,
    campus: state.campus,
    compareLabel: `vs ${previousLabel(state.period)}`,
    phrase: periodPhrase(state.period, range),
    onApply,
    setCampus,
    query,
  };
}
