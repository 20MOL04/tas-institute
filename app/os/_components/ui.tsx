import type { CSSProperties, ReactNode } from "react";
import Link from "next/link";
import { IcAlert } from "./icons";
import type {
  ApplicationStatus,
  DocumentRow,
  Intake,
  Kpi,
  PaymentStatus,
  StudentStatus,
  Teacher,
} from "../_data";

export function DemoBanner() {
  return null;
}

export function PageHead({
  title,
  lead,
  children,
}: {
  title: string;
  lead?: string;
  children?: ReactNode;
}) {
  return (
    <div className="os-page-head">
      <div>
        <h1>{title}</h1>
        {lead ? <p>{lead}</p> : null}
      </div>
      {children ? <div className="os-page-actions">{children}</div> : null}
    </div>
  );
}

export function Badge({
  tone = "neutral",
  children,
  plain,
}: {
  tone?: "neutral" | "blue" | "green" | "amber" | "red" | "violet";
  children: ReactNode;
  plain?: boolean;
}) {
  return <span className={`os-badge os-badge-${tone}${plain ? " os-badge-plain" : ""}`}>{children}</span>;
}

export const STUDENT_STATUS_FR: Record<StudentStatus, string> = {
  active: "Actif",
  applicant: "Candidat",
  completed: "Terminé",
  dropped: "Abandon",
};

export const PAYMENT_STATUS_FR: Record<PaymentStatus, string> = {
  paid: "À jour",
  partial: "Partiel",
  unpaid: "Impayé",
};

export const TEACHER_STATUS_FR: Record<Teacher["status"], string> = {
  active: "Actif",
  leave: "Congé",
};

export const APPLICATION_STATUS_FR: Record<ApplicationStatus, string> = {
  new: "Nouveau",
  reviewing: "En revue",
  documents: "Documents",
  approved: "Acceptée",
  enrolled: "Inscrite",
  rejected: "Rejetée",
};

export const APPLICATION_PIPELINE: ApplicationStatus[] = ["new", "reviewing", "documents", "approved", "enrolled"];

export const INTAKE_STATUS_FR: Record<Intake["status"], string> = {
  open: "Ouverte",
  filling: "En remplissage",
  full: "Complète",
  closed: "Fermée",
};

export const DOCUMENT_STATUS_FR: Record<DocumentRow["status"], string> = {
  generated: "Généré",
  pending: "En attente",
  missing: "Manquant",
};

export function statusTone(status: string): "neutral" | "blue" | "green" | "amber" | "red" | "violet" {
  const s = status.toLowerCase();
  if (["active", "paid", "approved", "accepted", "accepté", "enrolled", "published", "online", "ok", "closed", "à jour", "présent", "present", "generated", "généré"].includes(s)) return "green";
  if (["filling", "partial", "review", "reviewing", "visit", "qualified", "draft", "investigating", "partiel", "leave", "congé", "late", "retard"].includes(s)) return "amber";
  if (["full", "unpaid", "rejected", "refused", "refusé", "lost", "dropped", "offline", "denied", "open", "missing", "impayé", "absent", "abandon"].includes(s)) return "red";
  if (["new", "contacted", "documents", "pending", "paused", "scheduled", "applicant", "candidat"].includes(s)) return "blue";
  if (["completed", "terminé"].includes(s)) return "violet";
  return "neutral";
}

export function VoirLink({ href }: { href: string }) {
  return (
    <Link href={href} className="os-btn os-btn-sm">
      Voir
    </Link>
  );
}

export type QueueItem = {
  href: string;
  label: string;
  hint: string;
  count: number;
};

export function QueueCard({
  title,
  href,
  total,
  items,
}: {
  title: string;
  href?: string;
  total: number;
  items: QueueItem[];
}) {
  return (
    <section className="os-queue">
      <header className="os-queue-head">
        {href ? (
          <Link href={href} className="os-queue-title">
            <h2>{title}</h2>
          </Link>
        ) : (
          <h2>{title}</h2>
        )}
        <span className="os-nav-badge">{total}</span>
      </header>
      {items.map((item) => (
        <Link key={item.href + item.label} href={item.href} className="os-queue-row">
          <span className="os-queue-copy">
            <strong>{item.label}</strong>
            <span>{item.hint}</span>
          </span>
          <span className="os-queue-count">{item.count}</span>
        </Link>
      ))}
    </section>
  );
}

export function KpiCard({
  kpi,
  active,
  onSelect,
}: {
  kpi: Kpi;
  active?: boolean;
  onSelect?: () => void;
}) {
  const chars = Math.max(kpi.value.replace(/\s/g, "").length, 4);
  const valueStyle = { "--kpi-chars": String(chars) } as CSSProperties;
  const inner = (
    <>
      <div className="os-kpi-label">{kpi.label}</div>
      <div className="os-kpi-value" style={valueStyle}>
        {kpi.value}
      </div>
      {kpi.spark && kpi.spark.length > 1 ? <SparkLine values={kpi.spark} active={Boolean(active)} /> : null}
    </>
  );
  if (onSelect) {
    return (
      <button
        type="button"
        className={`os-kpi os-kpi-btn${active ? " is-active" : ""}`}
        onClick={onSelect}
        aria-pressed={active}
      >
        {inner}
      </button>
    );
  }
  return <article className="os-kpi">{inner}</article>;
}

function SparkLine({ values, active }: { values: number[]; active: boolean }) {
  const w = 56;
  const h = 14;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const pts = values.map((v, i) => {
    const x = (i / Math.max(values.length - 1, 1)) * w;
    const y = h - 1.5 - ((v - min) / span) * (h - 3);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const line = pts.join(" ");
  const lastX = ((values.length - 1) / Math.max(values.length - 1, 1)) * w;
  const stroke = active ? "var(--color-accent-blue)" : "var(--color-muted)";
  return (
    <svg className="os-spark" viewBox={`0 0 ${w} ${h}`} width={w} height={h} aria-hidden="true">
      <polygon fill={stroke} fillOpacity={active ? 0.1 : 0.04} points={`0,${h} ${line} ${lastX},${h}`} />
      <polyline fill="none" stroke={stroke} strokeWidth="1.15" strokeLinejoin="round" points={line} />
    </svg>
  );
}

export function OsCard({
  title,
  hint,
  action,
  children,
  foot,
  className,
  id,
}: {
  title: string;
  hint?: string;
  action?: ReactNode;
  children: ReactNode;
  foot?: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section className={className ? `os-card ${className}` : "os-card"} id={id}>
      <div className="os-card-head">
        <div>
          <h2>{title}</h2>
          {hint ? <p>{hint}</p> : null}
        </div>
        {action ? <div className="os-card-head-actions">{action}</div> : null}
      </div>
      <div className="os-card-body">{children}</div>
      {foot ? <div className="os-card-foot">{foot}</div> : null}
    </section>
  );
}

export function PersonCell({
  initials,
  name,
  meta,
}: {
  initials: string;
  name: string;
  meta?: string;
}) {
  return (
    <div className="os-cell-person">
      <span className="os-avatar-sm">{initials}</span>
      <div>
        <strong>{name}</strong>
        {meta ? <span>{meta}</span> : null}
      </div>
    </div>
  );
}

export function BarList({
  rows,
  format = (n) => n.toLocaleString("fr-FR"),
}: {
  rows: { label: string; value: number }[];
  format?: (n: number) => string;
}) {
  const max = Math.max(...rows.map((r) => r.value), 1);
  return (
    <div className="os-bars">
      {rows.map((row) => (
        <div key={row.label} className="os-bar-row">
          <span className="os-bar-label">{row.label}</span>
          <span className="os-bar-value">{format(row.value)}</span>
          <div className="os-bar-track">
            <div className="os-bar-fill" style={{ width: `${(row.value / max) * 100}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function AlertList({
  items,
}: {
  items: { id: string; level: "high" | "medium" | "low"; label: string; detail: string; href: string }[];
}) {
  return (
    <div className="os-grid" style={{ gap: 8 }}>
      {items.map((a) => (
        <a key={a.id} href={a.href} className={`os-alert ${a.level}`}>
          <span className={`os-icon-tile ${a.level === "high" ? "red" : a.level === "medium" ? "amber" : ""}`}>
            <IcAlert />
          </span>
          <div>
            <strong>{a.label}</strong>
            <span>{a.detail}</span>
          </div>
        </a>
      ))}
    </div>
  );
}

export function LineChart({
  labels,
  series,
  height = 220,
  filled = true,
}: {
  labels: string[];
  series: { label: string; values: number[]; color?: string }[];
  height?: number;
  filled?: boolean;
}) {
  const w = 640;
  const h = height;
  const pad = { t: 12, r: 12, b: 28, l: 40 };
  const innerW = w - pad.l - pad.r;
  const innerH = h - pad.t - pad.b;
  const all = series.flatMap((s) => s.values);
  const max = Math.max(...all, 1);
  const x = (i: number, count = labels.length) => pad.l + (i / Math.max(count - 1, 1)) * innerW;
  const y = (v: number) => pad.t + innerH - (v / max) * innerH;
  const colors = ["#1d4ed8", "#10b981", "#f59e0b", "#6366f1"];
  const chartKey = `${labels.join("|")}|${series.map((s) => s.values.join(",")).join(";")}`;

  if (labels.length === 0) {
    return <p className="os-empty">Aucune donnée sur cette période.</p>;
  }

  return (
    <div key={chartKey} className="os-chart-host">
      <svg className="os-chart" viewBox={`0 0 ${w} ${h}`} role="img" aria-label={series.map((s) => s.label).join(", ")}>
        {[0.25, 0.5, 0.75, 1].map((t) => (
          <line
            key={t}
            x1={pad.l}
            x2={w - pad.r}
            y1={y(max * t)}
            y2={y(max * t)}
            stroke="var(--color-border)"
            strokeWidth="1"
          />
        ))}
        {labels.map((lab, i) =>
          i % 2 === 0 || labels.length < 4 ? (
            <text key={`${lab}-${i}`} x={labels.length === 1 ? pad.l + innerW / 2 : x(i)} y={h - 8} textAnchor="middle" fill="var(--color-muted)" fontSize="11">
              {lab}
            </text>
          ) : null,
        )}
        {series.map((s, si) => {
          const color = s.color ?? colors[si % colors.length];
          if (s.values.length <= 1) {
            const v = s.values[0] ?? 0;
            const barY = y(v);
            const barH = Math.max(innerH - (barY - pad.t), 2);
            const barW = Math.min(innerW * 0.42, 120);
            const barX = pad.l + (innerW - barW) / 2;
            return (
              <g key={s.label}>
                {filled ? (
                  <rect className="os-chart-bar" x={barX} y={barY} width={barW} height={barH} rx="6" fill={color} fillOpacity="0.42" />
                ) : null}
                <line className="os-chart-line" pathLength={1} x1={barX} y1={barY} x2={barX + barW} y2={barY} stroke={color} strokeWidth="2.4" />
              </g>
            );
          }
          const line = s.values.map((v, i) => `${i === 0 ? "M" : "L"} ${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(" ");
          const last = s.values.length - 1;
          const area = `${line} L ${x(last).toFixed(1)} ${y(0).toFixed(1)} L ${x(0).toFixed(1)} ${y(0).toFixed(1)} Z`;
          return (
            <g key={s.label}>
              {filled ? <path className="os-chart-area" d={area} fill={color} fillOpacity="0.38" stroke="none" /> : null}
              <path className="os-chart-line" pathLength={1} d={line} fill="none" stroke={color} strokeWidth="2.2" strokeLinejoin="round" />
            </g>
          );
        })}
      </svg>
      {series.length > 1 ? (
        <div className="os-legend">
          {series.map((s, si) => (
            <span key={s.label}>
              <i style={{ background: s.color ?? colors[si % colors.length] }} />
              {s.label}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}
