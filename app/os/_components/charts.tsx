"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { IcTrend } from "./icons";

/* ----- helpers ----------------------------------------------------------- */

/** Graduations « rondes » (0, 1 M, 2 M...) : retourne le maximum d'axe et le pas. */
export function niceScale(max: number, ticks = 4, integer = false): { max: number; step: number; values: number[] } {
  if (!Number.isFinite(max) || max <= 0) return { max: 1, step: 1, values: [0, 1] };
  const raw = max / ticks;
  const pow = Math.pow(10, Math.floor(Math.log10(raw)));
  const frac = raw / pow;
  let mult = 10;
  for (const m of [1, 2, 2.5, 5, 10]) {
    if (frac <= m) {
      mult = m;
      break;
    }
  }
  let step = mult * pow;
  if (integer) step = Math.max(1, Math.ceil(step));
  const top = Math.ceil(max / step) * step;
  const values: number[] = [];
  for (let v = 0; v <= top + step / 1000; v += step) values.push(Math.round(v * 1000) / 1000);
  return { max: top, step, values };
}

function useWidth<T extends HTMLElement>(): [React.RefObject<T>, number] {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    setWidth(el.clientWidth);
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver((entries) => {
      const w = Math.round(entries[0].contentRect.width);
      setWidth((prev) => (Math.abs(prev - w) > 1 ? w : prev));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, width];
}

export function EmptyState({ title = "Aucune donnée sur la période", text, icon }: { title?: string; text?: string; icon?: ReactNode }) {
  return (
    <div className="fx-empty">
      <span className="fx-empty-icon">{icon ?? <IcTrend />}</span>
      <strong>{title}</strong>
      <span>{text ?? "Choisissez une autre période ou un autre campus."}</span>
    </div>
  );
}

/* ----- segmented control -------------------------------------------------- */

export function Segmented<T extends string>({
  value,
  onChange,
  options,
  label,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string; count?: number }[];
  label: string;
}) {
  return (
    <div className="fx-seg" role="group" aria-label={label}>
      {options.map((o) => (
        <button key={o.value} type="button" aria-pressed={value === o.value} className={value === o.value ? "is-on" : ""} onClick={() => onChange(o.value)}>
          {o.label}
          {o.count !== undefined ? <em>{o.count}</em> : null}
        </button>
      ))}
    </div>
  );
}

/* ----- combo chart: bars + comparison line ---------------------------------- */

export type ComboProps = {
  labels: string[];
  longLabels: string[];
  values: number[];
  previousValues?: (number | null)[] | null;
  previousLabels?: (string | null)[] | null;
  name: string;
  previousName?: string;
  format: (n: number) => string;
  axisFormat?: (n: number) => string;
  unit?: "money" | "count" | "pct";
  ariaLabel: string;
  empty?: boolean;
  emptyText?: string;
};

export function ComboChart({ labels, longLabels, values, previousValues, previousLabels, name, previousName = "Période précédente", format, axisFormat, unit = "count", ariaLabel, empty, emptyText }: ComboProps) {
  const [host, width] = useWidth<HTMLDivElement>();
  const [active, setActive] = useState<number>(-1);
  const [focusIdx, setFocusIdx] = useState(0);
  const refs = useRef<(SVGGElement | null)[]>([]);
  const compact = width > 0 && width < 520;
  const height = compact ? 240 : 320;
  const hasPrev = !!previousValues && previousValues.some((v) => v !== null && v !== 0);

  const allMax = Math.max(...values, ...(hasPrev ? (previousValues as (number | null)[]).map((v) => v ?? 0) : [0]), 0);
  const scale = useMemo(() => niceScale(unit === "pct" ? Math.max(allMax, 10) : allMax, 4, unit === "count"), [allMax, unit]);
  const axisFmt = axisFormat ?? format;
  const yLabels = scale.values.map(axisFmt);
  const maxLabel = Math.max(...yLabels.map((l) => l.length), 1);
  const pad = { t: 14, r: compact ? 8 : 16, b: 30, l: Math.max(30, maxLabel * 7 + 14) };
  const innerW = Math.max(width - pad.l - pad.r, 10);
  const innerH = height - pad.t - pad.b;
  const n = labels.length;
  const step = innerW / Math.max(n, 1);
  const barW = Math.max(3, Math.min(compact ? 30 : 46, step * 0.62));
  const y = (v: number) => pad.t + innerH - (v / scale.max) * innerH;
  const xc = (i: number) => pad.l + step * i + step / 2;

  const labelChars = Math.max(...labels.map((l) => l.length), 1);
  const stride = Math.max(1, Math.ceil((labelChars * 6.4 + 10) / step));

  const summary = useMemo(() => {
    if (!values.length) return ariaLabel;
    const total = values.reduce((s, v) => s + v, 0);
    const maxI = values.indexOf(Math.max(...values));
    return `${ariaLabel}. ${values.length} points. ${unit === "count" || unit === "money" ? `Total ${format(total)}. ` : ""}Maximum ${format(values[maxI])} ${longLabels[maxI] ? `(${longLabels[maxI]})` : ""}.`;
  }, [values, ariaLabel, format, longLabels, unit]);

  const describe = useCallback(
    (i: number) => {
      const prev = previousValues?.[i];
      let text = `${longLabels[i]} : ${format(values[i])}`;
      if (prev !== undefined && prev !== null) {
        const d = prev === 0 ? null : ((values[i] - prev) / Math.abs(prev)) * 100;
        text += `, ${previousName.toLowerCase()} ${format(prev)}${d === null ? "" : `, ${d >= 0 ? "+" : "−"}${Math.abs(d).toFixed(Math.abs(d) >= 10 ? 0 : 1).replace(".", ",")} %`}`;
      }
      return text;
    },
    [longLabels, previousValues, values, format, previousName],
  );

  function moveFocus(next: number) {
    const clamped = Math.max(0, Math.min(n - 1, next));
    setFocusIdx(clamped);
    setActive(clamped);
    refs.current[clamped]?.focus();
  }

  function onPointer(e: React.PointerEvent<SVGSVGElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - pad.l;
    const i = Math.floor(x / step);
    setActive(i >= 0 && i < n ? i : -1);
  }

  if (empty || n === 0 || values.every((v) => v === 0)) {
    return <EmptyState text={emptyText} />;
  }

  const tip = active >= 0 && active < n ? active : -1;
  const tipLeft = tip >= 0 ? Math.min(Math.max(xc(tip), 84), Math.max(width - 84, 84)) : 0;
  const prevAtTip = tip >= 0 ? previousValues?.[tip] : undefined;
  const dTip = tip >= 0 && prevAtTip !== undefined && prevAtTip !== null && prevAtTip !== 0 ? ((values[tip] - prevAtTip) / Math.abs(prevAtTip)) * 100 : null;

  const linePoints: string[] = [];
  let seg: string[] = [];
  if (hasPrev) {
    (previousValues as (number | null)[]).forEach((v, i) => {
      if (v === null || v === undefined) {
        if (seg.length) linePoints.push(seg.join(" "));
        seg = [];
      } else seg.push(`${xc(i).toFixed(1)},${y(v).toFixed(1)}`);
    });
    if (seg.length) linePoints.push(seg.join(" "));
  }

  return (
    <div className="fx-chart" ref={host}>
      <div className="fx-legend" aria-hidden="true">
        <span>
          <i className="fx-sw-bar" />
          {name}
        </span>
        {hasPrev ? (
          <span>
            <i className="fx-sw-line" />
            {previousName}
          </span>
        ) : null}
      </div>
      <p className="os-sr-only" aria-live="polite">
        {tip >= 0 ? describe(tip) : ""}
      </p>
      {width > 0 ? (
        <div className="fx-chart-plot" style={{ height }}>
          <svg
            width={width}
            height={height}
            viewBox={`0 0 ${width} ${height}`}
            role="group"
            aria-label={summary}
            onPointerMove={onPointer}
            onPointerDown={onPointer}
            onPointerLeave={(e) => {
              if (e.pointerType === "mouse") setActive(-1);
            }}
          >
            {scale.values.map((v, i) => (
              <g key={v}>
                <line x1={pad.l} x2={width - pad.r} y1={y(v)} y2={y(v)} className={i === 0 ? "fx-axis" : "fx-grid"} />
                <text x={pad.l - 8} y={y(v) + 4} textAnchor="end" className="fx-tick">
                  {yLabels[i]}
                </text>
              </g>
            ))}
            {tip >= 0 ? <rect x={pad.l + step * tip} y={pad.t} width={step} height={innerH} className="fx-hl" /> : null}
            {labels.map((l, i) =>
              i % stride === 0 || (i === n - 1 && (n - 1) % stride >= Math.ceil(stride / 2)) ? (
                <text key={`${l}-${i}`} x={xc(i)} y={height - 9} textAnchor="middle" className="fx-tick">
                  {l}
                </text>
              ) : null,
            )}
            {values.map((v, i) => {
              const h = Math.max(v > 0 ? 2 : 0, innerH - (y(v) - pad.t));
              return (
                <rect key={i} x={xc(i) - barW / 2} y={pad.t + innerH - h} width={barW} height={h} rx={Math.min(4, barW / 2)} className={`fx-bar${tip === i ? " is-on" : ""}`} />
              );
            })}
            {linePoints.map((pts, i) => (
              <polyline key={i} points={pts} className="fx-prev-line" />
            ))}
            {hasPrev
              ? (previousValues as (number | null)[]).map((v, i) =>
                  v === null || v === undefined ? null : <circle key={i} cx={xc(i)} cy={y(v)} r={tip === i ? 4.5 : n > 40 ? 0 : 2.8} className="fx-prev-dot" />,
                )
              : null}
            {labels.map((_, i) => (
              <g
                key={i}
                ref={(el) => {
                  refs.current[i] = el;
                }}
                tabIndex={i === focusIdx ? 0 : -1}
                role="img"
                aria-label={describe(i)}
                className="fx-point"
                onFocus={() => {
                  setActive(i);
                  setFocusIdx(i);
                }}
                onBlur={() => setActive(-1)}
                onKeyDown={(e) => {
                  if (e.key === "ArrowRight") moveFocus(i + 1);
                  else if (e.key === "ArrowLeft") moveFocus(i - 1);
                  else if (e.key === "Home") moveFocus(0);
                  else if (e.key === "End") moveFocus(n - 1);
                  else return;
                  e.preventDefault();
                }}
              >
                <rect x={pad.l + step * i} y={pad.t} width={step} height={innerH} fill="transparent" />
              </g>
            ))}
          </svg>
          {tip >= 0 ? (
            <div className="fx-tip" style={{ left: tipLeft, top: Math.max(4, y(Math.max(values[tip], prevAtTip ?? 0)) - 8) }} role="presentation">
              <strong>{longLabels[tip]}</strong>
              <span>
                <i className="fx-sw-bar" />
                {format(values[tip])}
              </span>
              {prevAtTip !== undefined && prevAtTip !== null ? (
                <span>
                  <i className="fx-sw-line" />
                  {format(prevAtTip)}
                  {previousLabels?.[tip] ? <em> · {previousLabels[tip]}</em> : null}
                </span>
              ) : null}
              {dTip !== null ? <b className={dTip >= 0 ? "up" : "down"}>{dTip >= 0 ? "↑" : "↓"}&nbsp;{Math.abs(dTip).toFixed(Math.abs(dTip) >= 10 ? 0 : 1).replace(".", ",")}&nbsp;%</b> : null}
            </div>
          ) : null}
        </div>
      ) : (
        <div style={{ height }} />
      )}
    </div>
  );
}

/* ----- trend chart: smooth line + light area + previous period ------------------------ */

/** Courbe lissée qui ne dépasse jamais les points (interpolation monotone). */
function smoothPath(pts: { x: number; y: number }[]): string {
  const n = pts.length;
  if (n === 0) return "";
  if (n === 1) return `M${pts[0].x.toFixed(1)},${pts[0].y.toFixed(1)}`;
  const dx: number[] = [];
  const m: number[] = [];
  for (let i = 0; i < n - 1; i++) {
    dx.push(pts[i + 1].x - pts[i].x || 1);
    m.push((pts[i + 1].y - pts[i].y) / dx[i]);
  }
  const t: number[] = [m[0]];
  for (let i = 1; i < n - 1; i++) t.push(m[i - 1] * m[i] <= 0 ? 0 : (m[i - 1] + m[i]) / 2);
  t.push(m[n - 2]);
  for (let i = 0; i < n - 1; i++) {
    if (m[i] === 0) {
      t[i] = 0;
      t[i + 1] = 0;
      continue;
    }
    const a = t[i] / m[i];
    const b = t[i + 1] / m[i];
    const h = Math.hypot(a, b);
    if (h > 3) {
      t[i] = (3 * a * m[i]) / h;
      t[i + 1] = (3 * b * m[i]) / h;
    }
  }
  let d = `M${pts[0].x.toFixed(1)},${pts[0].y.toFixed(1)}`;
  for (let i = 0; i < n - 1; i++) {
    const c = dx[i] / 3;
    d += `C${(pts[i].x + c).toFixed(1)},${(pts[i].y + t[i] * c).toFixed(1)} ${(pts[i + 1].x - c).toFixed(1)},${(pts[i + 1].y - t[i + 1] * c).toFixed(1)} ${pts[i + 1].x.toFixed(1)},${pts[i + 1].y.toFixed(1)}`;
  }
  return d;
}

export type TrendProps = ComboProps & {
  /** Traite 0 comme « pas de mesure » (taux) : la courbe s'interrompt. */
  gapZero?: boolean;
  emptyIcon?: ReactNode;
};

export function TrendChart({ labels, longLabels, values, previousValues, previousLabels, name, previousName = "Période précédente", format, axisFormat, unit = "count", ariaLabel, empty, emptyText, gapZero, emptyIcon }: TrendProps) {
  const [host, width] = useWidth<HTMLDivElement>();
  const [active, setActive] = useState<number>(-1);
  const [focusIdx, setFocusIdx] = useState(0);
  const refs = useRef<(SVGGElement | null)[]>([]);
  const uid = useMemo(() => `tc${Math.random().toString(36).slice(2, 8)}`, []);
  const compact = width > 0 && width < 520;
  const height = compact ? 236 : 276;
  const n = labels.length;
  const prevArr = previousValues ?? null;
  const hasPrev = !!prevArr && prevArr.some((v) => v !== null && v !== 0);

  const allMax = Math.max(...values, ...(hasPrev ? (prevArr as (number | null)[]).map((v) => v ?? 0) : [0]), 0);
  const scale = useMemo(() => niceScale(unit === "pct" ? Math.max(allMax, 10) : allMax, 4, unit === "count"), [allMax, unit]);
  const axisFmt = axisFormat ?? format;
  const yLabels = scale.values.map(axisFmt);
  const maxLabel = Math.max(...yLabels.map((l) => l.length), 1);
  const pad = { t: 12, r: compact ? 12 : 18, b: 30, l: Math.max(30, maxLabel * 7.4 + 14) };
  const innerW = Math.max(width - pad.l - pad.r, 10);
  const innerH = height - pad.t - pad.b;
  const step = innerW / Math.max(n, 1);
  const y = (v: number) => pad.t + innerH - (v / scale.max) * innerH;
  const xc = (i: number) => pad.l + step * i + step / 2;
  const showDots = n <= 31;

  const labelChars = Math.max(...labels.map((l) => l.length), 1);
  const stride = Math.max(1, Math.ceil((labelChars * 7 + 14) / step));

  const summary = useMemo(() => {
    if (!values.length) return ariaLabel;
    const total = values.reduce((sum, v) => sum + v, 0);
    const maxI = values.indexOf(Math.max(...values));
    return `${ariaLabel}. ${values.length} points. ${unit === "count" || unit === "money" ? `Total ${format(total)}. ` : ""}Maximum ${format(values[maxI])} ${longLabels[maxI] ? `(${longLabels[maxI]})` : ""}.`;
  }, [values, ariaLabel, format, longLabels, unit]);

  const change = useCallback(
    (i: number) => {
      const prev = prevArr?.[i];
      if (prev === undefined || prev === null || prev === 0) return null;
      return ((values[i] - prev) / Math.abs(prev)) * 100;
    },
    [prevArr, values],
  );
  const fmtChange = (d: number) => `${d >= 0 ? "+" : "−"}${Math.abs(d).toFixed(Math.abs(d) >= 10 ? 0 : 1).replace(".", ",")} %`;

  const describe = useCallback(
    (i: number) => {
      const prev = prevArr?.[i];
      let text = `${longLabels[i]} : ${format(values[i])}`;
      if (prev !== undefined && prev !== null) {
        const d = change(i);
        text += `, ${previousName.toLowerCase()} ${format(prev)}${d === null ? "" : `, ${fmtChange(d)}`}`;
      }
      return text;
    },
    [longLabels, prevArr, values, format, previousName, change],
  );

  function moveFocus(next: number) {
    const clamped = Math.max(0, Math.min(n - 1, next));
    setFocusIdx(clamped);
    setActive(clamped);
    refs.current[clamped]?.focus();
  }

  function onPointer(e: React.PointerEvent<SVGSVGElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const i = Math.floor((e.clientX - rect.left - pad.l) / step);
    setActive(i >= 0 && i < n ? i : -1);
  }

  if (empty || n === 0 || values.every((v) => v === 0)) {
    return <EmptyState text={emptyText ?? "Aucune valeur enregistrée pour cette période. Choisissez une autre période ou un autre campus."} icon={emptyIcon} />;
  }

  const tip = active >= 0 && active < n ? active : -1;
  const prevAtTip = tip >= 0 ? prevArr?.[tip] : undefined;
  const dTip = tip >= 0 ? change(tip) : null;
  const tipW = compact ? 200 : 236;
  const tipRight = tip >= 0 && xc(tip) + 14 + tipW <= width;
  const tipX = tip >= 0 ? (tipRight ? xc(tip) + 14 : xc(tip) - 14) : 0;

  // Courbe principale, interrompue aux mesures absentes.
  const curSegs: { x: number; y: number; i: number }[][] = [];
  let run: { x: number; y: number; i: number }[] = [];
  values.forEach((v, i) => {
    if (gapZero && v === 0) {
      if (run.length) curSegs.push(run);
      run = [];
    } else run.push({ x: xc(i), y: y(v), i });
  });
  if (run.length) curSegs.push(run);

  const prevSegs: { x: number; y: number }[][] = [];
  let prun: { x: number; y: number }[] = [];
  if (hasPrev) {
    (prevArr as (number | null)[]).forEach((v, i) => {
      if (v === null || v === undefined || (gapZero && v === 0)) {
        if (prun.length) prevSegs.push(prun);
        prun = [];
      } else prun.push({ x: xc(i), y: y(v) });
    });
    if (prun.length) prevSegs.push(prun);
  }
  const baseY = pad.t + innerH;

  return (
    <div className="fx-chart" ref={host}>
      <div className="fx-legend" aria-hidden="true">
        <span>
          <i className="fx-sw-cur" />
          {name}
        </span>
        {hasPrev ? (
          <span>
            <i className="fx-sw-prev" />
            {previousName}
          </span>
        ) : null}
      </div>
      <p className="os-sr-only" aria-live="polite">
        {tip >= 0 ? describe(tip) : ""}
      </p>
      {width > 0 ? (
        <div className="fx-chart-plot" style={{ height }}>
          <svg
            width={width}
            height={height}
            viewBox={`0 0 ${width} ${height}`}
            role="group"
            aria-label={summary}
            onPointerMove={onPointer}
            onPointerDown={onPointer}
            onPointerLeave={(e) => {
              if (e.pointerType === "mouse") setActive(-1);
            }}
          >
            <defs>
              <linearGradient id={`${uid}-g`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" className="fx-area-top" />
                <stop offset="100%" className="fx-area-bottom" />
              </linearGradient>
            </defs>
            {scale.values.map((v, i) => (
              <g key={v}>
                <line x1={pad.l} x2={width - pad.r} y1={y(v)} y2={y(v)} className={i === 0 ? "fx-axis" : "fx-grid"} />
                <text x={pad.l - 10} y={y(v) + 4} textAnchor="end" className="fx-tick">
                  {yLabels[i]}
                </text>
              </g>
            ))}
            {labels.map((l, i) =>
              i % stride === 0 || (i === n - 1 && (n - 1) % stride >= Math.ceil(stride / 2)) ? (
                <text key={`${l}-${i}`} x={xc(i)} y={height - 9} textAnchor="middle" className="fx-tick">
                  {l}
                </text>
              ) : null,
            )}
            {prevSegs.map((seg, i) => (seg.length > 1 ? <path key={i} d={smoothPath(seg)} className="fx-prev-dash" /> : null))}
            {curSegs.map((seg, i) =>
              seg.length > 1 ? (
                <g key={i}>
                  <path d={`${smoothPath(seg)}L${seg[seg.length - 1].x.toFixed(1)},${baseY}L${seg[0].x.toFixed(1)},${baseY}Z`} fill={`url(#${uid}-g)`} />
                  <path d={smoothPath(seg)} className="fx-line" />
                </g>
              ) : null,
            )}
            {tip >= 0 ? <line x1={xc(tip)} x2={xc(tip)} y1={pad.t} y2={baseY} className="fx-guide" /> : null}
            {showDots
              ? values.map((v, i) => (gapZero && v === 0 ? null : <circle key={i} cx={xc(i)} cy={y(v)} r={tip === i ? 5 : 2.6} className={`fx-dot${tip === i ? " is-on" : ""}`} />))
              : tip >= 0 && !(gapZero && values[tip] === 0)
                ? <circle cx={xc(tip)} cy={y(values[tip])} r={5} className="fx-dot is-on" />
                : null}
            {tip >= 0 && prevAtTip !== undefined && prevAtTip !== null && hasPrev ? <circle cx={xc(tip)} cy={y(prevAtTip)} r={3.5} className="fx-dot-prev" /> : null}
            {labels.map((_, i) => (
              <g
                key={i}
                ref={(el) => {
                  refs.current[i] = el;
                }}
                tabIndex={i === focusIdx ? 0 : -1}
                role="img"
                aria-label={describe(i)}
                className="fx-point"
                onFocus={() => {
                  setActive(i);
                  setFocusIdx(i);
                }}
                onBlur={() => setActive(-1)}
                onKeyDown={(e) => {
                  if (e.key === "ArrowRight") moveFocus(i + 1);
                  else if (e.key === "ArrowLeft") moveFocus(i - 1);
                  else if (e.key === "Home") moveFocus(0);
                  else if (e.key === "End") moveFocus(n - 1);
                  else if (e.key === "Escape") setActive(-1);
                  else return;
                  e.preventDefault();
                }}
              >
                <rect x={pad.l + step * i} y={pad.t} width={step} height={innerH} fill="transparent" />
              </g>
            ))}
          </svg>
          {tip >= 0 ? (
            <div
              className="fx-tip fx-tip-card"
              style={{ left: tipX, top: pad.t + 4, transform: tipRight ? "none" : "translateX(-100%)" }}
              role="presentation"
            >
              <strong>{longLabels[tip]}</strong>
              <span className="fx-tip-row">
                <i className="fx-sw-cur" />
                <em>{name}</em>
                <b>{format(values[tip])}</b>
              </span>
              {prevAtTip !== undefined && prevAtTip !== null ? (
                <span className="fx-tip-row">
                  <i className="fx-sw-prev" />
                  <em>{previousName}</em>
                  <b>{format(prevAtTip)}</b>
                </span>
              ) : null}
              {dTip !== null ? <span className={`fx-tip-change ${dTip >= 0 ? "up" : "down"}`}>{dTip >= 0 ? "↑" : "↓"}&nbsp;{fmtChange(dTip).slice(1).trim()} vs période précédente</span> : null}
            </div>
          ) : null}
        </div>
      ) : (
        <div style={{ height }} />
      )}
    </div>
  );
}

/* ----- funnel ----------------------------------------------------------------- */

export function Funnel({ steps }: { steps: { label: string; value: number; hint?: string }[] }) {
  const top = Math.max(steps[0]?.value ?? 0, 1);
  if (!steps.length || steps[0].value === 0) return <EmptyState text="Aucune demande reçue sur la période." />;
  return (
    <ol className="fx-funnel">
      {steps.map((s, i) => {
        const prev = i > 0 ? steps[i - 1].value : null;
        const rate = prev ? Math.round((s.value / prev) * 100) : null;
        return (
          <li key={s.label}>
            {rate !== null ? (
              <div className="fx-funnel-rate" aria-label={`${rate} % de l'étape précédente`}>
                <span aria-hidden="true">↓</span> {rate}&nbsp;%
              </div>
            ) : null}
            <div className="fx-funnel-row">
              <div className="fx-funnel-head">
                <span>{s.label}</span>
                <strong>{s.value.toLocaleString("fr-FR")}</strong>
              </div>
              <div className="fx-funnel-track">
                <div className="fx-funnel-fill" style={{ width: `${Math.max(2, (s.value / top) * 100)}%`, opacity: 1 - i * 0.16 }} />
              </div>
              {s.hint ? <span className="fx-funnel-hint">{s.hint}</span> : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

/* ----- donut ------------------------------------------------------------------- */

export type DonutPart = { label: string; count: number; amount?: string; color: string };

export function Donut({ parts, centerLabel }: { parts: DonutPart[]; centerLabel: string }) {
  const total = parts.reduce((s, p) => s + p.count, 0);
  if (total === 0) return <EmptyState text="Aucun élève concerné." />;
  const r = 52;
  const c = 2 * Math.PI * r;
  let offset = 0;
  return (
    <div className="fx-donut">
      <svg viewBox="0 0 140 140" role="img" aria-label={parts.map((p) => `${p.label} : ${p.count}`).join(", ")}>
        <circle cx="70" cy="70" r={r} className="fx-donut-bg" />
        {parts.map((p) => {
          const len = (p.count / total) * c;
          const el = (
            <circle
              key={p.label}
              cx="70"
              cy="70"
              r={r}
              fill="none"
              style={{ stroke: p.color }}
              strokeWidth="18"
              strokeDasharray={`${Math.max(len - 1.5, 0)} ${c - Math.max(len - 1.5, 0)}`}
              strokeDashoffset={-offset}
              transform="rotate(-90 70 70)"
            />
          );
          offset += len;
          return el;
        })}
        <text x="70" y="68" textAnchor="middle" className="fx-donut-total">
          {total.toLocaleString("fr-FR")}
        </text>
        <text x="70" y="86" textAnchor="middle" className="fx-donut-sub">
          {centerLabel}
        </text>
      </svg>
      <ul className="fx-donut-legend">
        {parts.map((p) => (
          <li key={p.label}>
            <i style={{ background: p.color }} />
            <span>{p.label}</span>
            <strong>{p.count.toLocaleString("fr-FR")}</strong>
            {p.amount ? <em>{p.amount}</em> : null}
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ----- fill bars ----------------------------------------------------------------- */

export function FillBars({ rows, threshold }: { rows: { id: string; label: string; hint?: string; taken: number; capacity: number }[]; threshold: number }) {
  if (!rows.length) return <EmptyState text="Aucune session en cours ou ouverte." />;
  return (
    <ul className="fx-fill">
      {rows.map((r) => {
        const pct = r.capacity ? (r.taken / r.capacity) * 100 : 0;
        const tone = pct >= threshold ? "hot" : pct >= 50 ? "ok" : "low";
        return (
          <li key={r.id}>
            <div className="fx-fill-head">
              <span>
                {r.label}
                {r.hint ? <em>{r.hint}</em> : null}
              </span>
              <strong>
                {Math.round(pct)}&nbsp;% · {r.taken}/{r.capacity}
              </strong>
            </div>
            <div className="fx-fill-track" role="img" aria-label={`${r.label} : ${Math.round(pct)} % rempli, ${r.taken} places sur ${r.capacity}`}>
              <div className={`fx-fill-bar fx-fill-${tone}`} style={{ width: `${Math.min(100, pct)}%` }} />
              <i style={{ left: `${Math.min(100, threshold)}%` }} aria-hidden="true" />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
