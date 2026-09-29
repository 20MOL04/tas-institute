"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import PeriodSelector from "../../_components/PeriodSelector";
import { CAMPUSES } from "../../_data/core";
import type { Filters } from "../_lib/useFilters";

/** En-tête commun : titre, une ligne de contexte, boutons à droite. */
export function FounderHeader({ title, subtitle, children }: { title: string; subtitle?: string; children?: ReactNode }) {
  return (
    <div className="fx-header">
      <div>
        <h1>{title}</h1>
        {subtitle ? <p>{subtitle}</p> : null}
      </div>
      {children ? <div className="fx-header-actions">{children}</div> : null}
    </div>
  );
}

export function CampusSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <select className="fx-select" aria-label="Campus" value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="all">Tous les campus</option>
      {CAMPUSES.map((c) => (
        <option key={c.id} value={c.id}>
          {c.name}
          {c.schoolId !== "tas" ? " (ABLA)" : ""}
        </option>
      ))}
    </select>
  );
}

export function FiltersBar({ filters, campus = true, period = true, children }: { filters: Filters; campus?: boolean; period?: boolean; children?: ReactNode }) {
  return (
    <div className="fx-toolbar">
      {period ? <PeriodSelector period={filters.period} customStart={filters.customStart} customEnd={filters.customEnd} onApply={filters.onApply} /> : null}
      {campus ? <CampusSelect value={filters.campus} onChange={filters.setCampus} /> : null}
      {children}
    </div>
  );
}

/** Carte : titre, aide, action à droite, contenu. */
export function Panel({ title, hint, action, children, className, id, foot }: { title: string; hint?: string; action?: ReactNode; children: ReactNode; className?: string; id?: string; foot?: ReactNode }) {
  return (
    <section className={`os-card${className ? ` ${className}` : ""}`} id={id}>
      <div className="fx-card-head">
        <div>
          <h2>{title}</h2>
          {hint ? <p>{hint}</p> : null}
        </div>
        {action}
      </div>
      {children}
      {foot}
    </section>
  );
}

export function SeeAll({ href, children = "Tout voir" }: { href: string; children?: ReactNode }) {
  return (
    <Link href={href} className="fx-card-link">
      {children} <span aria-hidden="true">→</span>
    </Link>
  );
}

export function usePaged<T>(rows: T[], size = 25) {
  const [page, setPage] = useState(0);
  const pages = Math.max(1, Math.ceil(rows.length / size));
  const safe = Math.min(page, pages - 1);
  return {
    rows: rows.slice(safe * size, safe * size + size),
    page: safe,
    pages,
    from: rows.length === 0 ? 0 : safe * size + 1,
    to: Math.min(rows.length, safe * size + size),
    total: rows.length,
    setPage,
  };
}

export function Pager({ paged, noun = "lignes" }: { paged: ReturnType<typeof usePaged<never>>; noun?: string }) {
  return (
    <div className="fx-pager">
      <span>
        {paged.from}–{paged.to} sur {paged.total} {noun}
      </span>
      <div className="os-page-actions">
        <button type="button" className="os-btn" disabled={paged.page <= 0} onClick={() => paged.setPage(paged.page - 1)}>
          Précédent
        </button>
        <button type="button" className="os-btn" disabled={paged.page >= paged.pages - 1} onClick={() => paged.setPage(paged.page + 1)}>
          Suivant
        </button>
      </div>
    </div>
  );
}
