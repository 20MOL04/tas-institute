"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  APPLICATIONS,
  LEADS,
  PAYMENTS,
  STUDENTS,
  TEACHERS,
  leadSourceLabel,
  readExtraLeads,
  readExtraPayments,
  readExtraStudents,
} from "../_data";
import { IcSearch } from "./icons";

type Hit = {
  href: string;
  title: string;
  hint: string;
  group: string;
};

function compact(value: string) {
  return value.toLowerCase().replace(/[\s.+-]/g, "");
}

function matches(query: string, ...fields: string[]) {
  const q = query.trim().toLowerCase();
  const qn = compact(query);
  if (!q) return false;
  return fields.some((field) => {
    const f = field.toLowerCase();
    return f.includes(q) || compact(field).includes(qn);
  });
}

function collect(query: string): Hit[] {
  if (!query.trim()) return [];
  const hits: Hit[] = [];
  const students = [...readExtraStudents(), ...STUDENTS];
  const payments = [...readExtraPayments(), ...PAYMENTS];
  const leads = [...readExtraLeads(), ...LEADS];

  for (const s of students) {
    if (matches(query, s.name, s.matricule, s.phone, s.email)) {
      hits.push({
        href: `/os/students/${s.id}`,
        title: s.name,
        hint: `${s.matricule}, ${s.phone}`,
        group: "Élèves",
      });
    }
    if (hits.length > 24) break;
  }

  for (const t of TEACHERS) {
    if (matches(query, t.name, t.staffId, t.phone, t.email)) {
      hits.push({
        href: `/os/teachers/${t.id}`,
        title: t.name,
        hint: `${t.staffId}, ${t.phone}`,
        group: "Enseignants",
      });
    }
  }

  for (const p of payments) {
    if (matches(query, p.receipt, p.studentName, p.studentId)) {
      hits.push({
        href: `/os/students/${p.studentId}/recu/${p.id}`,
        title: p.receipt,
        hint: `${p.studentName}, ${p.purpose}`,
        group: "Reçus",
      });
    }
    if (hits.filter((h) => h.group === "Reçus").length >= 8) break;
  }

  for (const l of leads) {
    if (matches(query, l.name, l.phone, l.note)) {
      hits.push({
        href: `/os/crm/${l.id}`,
        title: l.name,
        hint: `${leadSourceLabel(l.source)}, ${l.phone}`,
        group: "Inscriptions en ligne",
      });
    }
  }

  for (const a of APPLICATIONS) {
    if (matches(query, a.name, a.ref, a.country)) {
      hits.push({
        href: `/os/applications/${a.id}`,
        title: a.name,
        hint: a.ref,
        group: "Candidatures",
      });
    }
  }

  const seen = new Set<string>();
  return hits.filter((h) => {
    if (seen.has(h.href)) return false;
    seen.add(h.href);
    return true;
  }).slice(0, 12);
}

export default function GlobalSearch() {
  const router = useRouter();
  const root = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const hits = useMemo(() => collect(query), [query, open]);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  function go(href: string) {
    setOpen(false);
    setQuery("");
    router.push(href);
  }

  const groups = useMemo(() => {
    const order = ["Élèves", "Enseignants", "Reçus", "Inscriptions en ligne", "Candidatures"];
    return order
      .map((group) => ({ group, items: hits.filter((h) => h.group === group) }))
      .filter((g) => g.items.length > 0);
  }, [hits]);

  return (
    <div className="os-omni" ref={root}>
      <label className="os-omni-field">
        <IcSearch />
        <span className="os-sr-only">Rechercher</span>
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "Escape") setOpen(false);
            if (e.key === "Enter" && hits[0]) {
              e.preventDefault();
              go(hits[0].href);
            }
          }}
          placeholder="Élève, matricule, reçu, téléphone"
          autoComplete="off"
        />
      </label>
      {open && query.trim() ? (
        <div className="os-omni-panel" role="listbox">
          {groups.length === 0 ? (
            <p className="os-omni-empty">Aucun résultat pour cette recherche.</p>
          ) : (
            groups.map((g) => (
              <div key={g.group}>
                <div className="os-omni-label">{g.group}</div>
                {g.items.map((hit) => (
                  <button key={hit.href} type="button" className="os-omni-hit" onClick={() => go(hit.href)}>
                    <strong>{hit.title}</strong>
                    <span>{hit.hint}</span>
                  </button>
                ))}
              </div>
            ))
          )}
        </div>
      ) : null}
    </div>
  );
}
