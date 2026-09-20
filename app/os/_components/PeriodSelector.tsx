"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  PERIOD_PRESETS,
  getPeriodRange,
  type Period,
} from "../_lib/period";
import { useOsT } from "./useOsT";
import { useOs } from "./OsProvider";

export type { Period };

function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function sameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

type Copy = ReturnType<typeof useOsT>["t"];

function periodLabel(period: Period, t: Copy): string {
  switch (period) {
    case "today":
      return t.period.today;
    case "yesterday":
      return t.period.yesterday;
    case "7d":
      return t.period.d7;
    case "30d":
      return t.period.d30;
    case "thisMonth":
      return t.period.thisMonth;
    case "lastMonth":
      return t.period.lastMonth;
    case "thisYear":
      return t.period.thisYear;
    case "lastYear":
      return t.period.lastYear;
    case "all":
      return t.period.all;
    case "custom":
      return t.period.custom;
  }
}

export function usePeriodState(initial: Period = "thisYear") {
  const [period, setPeriod] = useState<Period>(initial);
  const [customStart, setCustomStart] = useState<string | undefined>();
  const [customEnd, setCustomEnd] = useState<string | undefined>();
  const range = useMemo(
    () => getPeriodRange(period, customStart, customEnd),
    [period, customStart, customEnd],
  );

  function onApply(next: Period, cStart?: string, cEnd?: string) {
    setPeriod(next);
    setCustomStart(cStart);
    setCustomEnd(cEnd);
  }

  return { period, customStart, customEnd, range, onApply };
}

type Props = {
  period: Period;
  customStart?: string;
  customEnd?: string;
  onApply: (p: Period, cStart?: string, cEnd?: string) => void;
};

export default function PeriodSelector({ period, customStart, customEnd, onApply }: Props) {
  const { t, lang } = useOsT();
  const { theme } = useOs();
  const dateLocale = lang === "en" ? "en-US" : "fr-FR";
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const [draftPeriod, setDraftPeriod] = useState<Period>(period);
  const [draftStart, setDraftStart] = useState<string>(customStart ?? "");
  const [draftEnd, setDraftEnd] = useState<string>(customEnd ?? "");

  const initRange = getPeriodRange(period, customStart, customEnd);
  const [vy, setVy] = useState(initRange.end.getFullYear());
  const [vm, setVm] = useState(initRange.end.getMonth());

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function fmtShort(d: Date): string {
    return d.toLocaleDateString(dateLocale, { day: "numeric", month: "short" });
  }

  function openMenu() {
    setDraftPeriod(period);
    setDraftStart(customStart ?? "");
    setDraftEnd(customEnd ?? "");
    const todayInit = startOfToday();
    setVy(todayInit.getFullYear());
    setVm(todayInit.getMonth());
    setOpen(true);
  }

  const draftRange = (() => {
    if (draftPeriod === "custom") {
      return {
        start: draftStart ? new Date(draftStart + "T12:00:00") : null,
        end: draftEnd ? new Date(draftEnd + "T12:00:00") : null,
      };
    }
    const r = getPeriodRange(draftPeriod);
    return { start: r.start, end: r.end };
  })();

  const today = startOfToday();
  const daysInMonth = new Date(vy, vm + 1, 0).getDate();
  const firstDow = (new Date(vy, vm, 1).getDay() + 6) % 7;
  const cells: (number | null)[] = [...Array(firstDow).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];

  function pickDay(day: number) {
    const date = new Date(vy, vm, day);
    if (date > today) return;
    const ds = `${vy}-${String(vm + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    setDraftPeriod("custom");
    if (!draftStart || (draftStart && draftEnd)) {
      setDraftStart(ds);
      setDraftEnd("");
    } else if (ds < draftStart) {
      setDraftEnd(draftStart);
      setDraftStart(ds);
    } else {
      setDraftEnd(ds);
    }
  }

  function selectPreset(p: Period) {
    setDraftPeriod(p);
    setDraftStart("");
    setDraftEnd("");
    const r = getPeriodRange(p);
    setVy(r.end.getFullYear());
    setVm(r.end.getMonth());
  }

  function apply() {
    if (draftPeriod === "custom") {
      if (draftStart && draftEnd) onApply("custom", draftStart, draftEnd);
      else if (draftStart) onApply("custom", draftStart, draftStart);
      else return;
    } else {
      onApply(draftPeriod);
    }
    setOpen(false);
  }

  const monthLabel = new Date(vy, vm, 1).toLocaleDateString(dateLocale, { month: "long", year: "numeric" });

  const triggerLabel =
    period === "custom" && customStart
      ? customEnd && customEnd !== customStart
        ? `${fmtShort(new Date(customStart + "T12:00:00"))} ${t.period.rangeJoin} ${fmtShort(new Date(customEnd + "T12:00:00"))}`
        : fmtShort(new Date(customStart + "T12:00:00"))
      : periodLabel(period, t);

  const panel = open ? (
    <div className="os-sheet-host" data-theme={theme}>
    <div className="ps-overlay">
      <button type="button" className="ps-veil" aria-label={t.period.close} onClick={() => setOpen(false)} />
      <div className="ps-dialog" role="dialog" aria-modal="true" aria-labelledby="ps-title" aria-label={t.period.title}>
        <div className="ps-panel">
          <div className="ps-panel__head">
            <h2 id="ps-title" className="ps-panel__title">
              {t.period.title}
            </h2>
          </div>
          <div className="ps-presets">
            {PERIOD_PRESETS.map((id) => (
              <button
                key={id}
                type="button"
                className={`ps-preset${draftPeriod === id ? " active" : ""}`}
                onClick={() => selectPreset(id)}
              >
                {periodLabel(id, t)}
              </button>
            ))}
          </div>

          <div className="ps-cal">
            <div className="ps-cal__nav">
              <button
                type="button"
                className="ps-navbtn"
                onClick={() => {
                  const d = new Date(vy, vm - 1, 1);
                  setVy(d.getFullYear());
                  setVm(d.getMonth());
                }}
                aria-label={t.period.prevMonth}
              >
                ‹
              </button>
              <span className="ps-cal__month">{monthLabel}</span>
              <button
                type="button"
                className="ps-navbtn"
                onClick={() => {
                  const d = new Date(vy, vm + 1, 1);
                  setVy(d.getFullYear());
                  setVm(d.getMonth());
                }}
                aria-label={t.period.nextMonth}
              >
                ›
              </button>
            </div>

            <div className="ps-grid ps-grid--head">
              {t.period.weekdays.map((d) => (
                <div key={d} className="ps-weekday">
                  {d}
                </div>
              ))}
            </div>

            <div className="ps-grid">
              {cells.map((day, i) => {
                if (!day) return <div key={i} />;
                const date = new Date(vy, vm, day);
                const isFuture = date > today;
                const rs = draftRange.start;
                const re = draftRange.end;
                const isStart = rs ? sameDay(date, rs) : false;
                const isEnd = re ? sameDay(date, re) : false;
                const inMid = rs && re ? date > rs && date < re : false;
                const isToday = sameDay(date, today);
                const endpoint = isStart || isEnd;
                return (
                  <button
                    key={i}
                    type="button"
                    className={[
                      "ps-day",
                      endpoint ? "is-endpoint" : "",
                      inMid ? "is-mid" : "",
                      isStart && !isEnd ? "is-range-start" : "",
                      isEnd && !isStart ? "is-range-end" : "",
                      isToday && !endpoint ? "is-today" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                    disabled={isFuture}
                    onClick={() => pickDay(day)}
                  >
                    {day}
                  </button>
                );
              })}
            </div>

            <div className="ps-panel__foot">
              <button type="button" className="ps-foot-cancel" onClick={() => setOpen(false)}>
                {t.period.cancel}
              </button>
              <button type="button" className="ps-foot-apply" onClick={apply}>
                {t.period.apply}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  ) : null;

  return (
    <div className="ps-root">
      <button
        type="button"
        className={`ps-trigger${open ? " is-open" : ""}`}
        onClick={() => (open ? setOpen(false) : openMenu())}
        aria-expanded={open}
        aria-haspopup="dialog"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
        {triggerLabel}
        <span className={`ps-caret${open ? " is-open" : ""}`} aria-hidden="true" />
      </button>
      {mounted && panel ? createPortal(panel, document.body) : null}
    </div>
  );
}
