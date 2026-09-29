"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Badge } from "../../_components/ui";
import { EmptyState } from "../../_components/charts";
import { IcClock, IcDownload } from "../../_components/icons";
import { downloadCsv } from "../../_lib/exportFile";
import { AUDIT_TYPE_FR, type AuditType } from "../../_data/audit";
import { fmtDayYear } from "../../_lib/dates";
import { FounderHeader, Pager, Panel, usePaged } from "../_components/Bits";
import { useFounderFilters } from "../_lib/useFilters";

export default function JournalPage() {
  const { snap } = useFounderFilters();
  const [actor, setActor] = useState("all");
  const [type, setType] = useState("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const actors = useMemo(() => Array.from(new Set(snap.audit.map((e) => e.actor))).sort(), [snap.audit]);
  const rows = useMemo(
    () =>
      snap.audit.filter(
        (e) => (actor === "all" || e.actor === actor) && (type === "all" || e.type === type) && (!from || e.at.slice(0, 10) >= from) && (!to || e.at.slice(0, 10) <= to),
      ),
    [snap.audit, actor, type, from, to],
  );
  const paged = usePaged(rows, 25);
  const reset = () => paged.setPage(0);

  return (
    <>
      <FounderHeader title="Journal d'activité" subtitle="Qui a fait quoi, et quand">
        <button
          type="button"
          className="os-btn"
          onClick={() => downloadCsv("journal", ["Date", "Heure", "Qui", "Type", "Action", "Détail"], rows.map((e) => [e.at.slice(0, 10), e.at.slice(11, 16), e.actor, AUDIT_TYPE_FR[e.type], e.action, e.detail]))}
        >
          <IcDownload /> Exporter
        </button>
      </FounderHeader>
      <Panel title="Événements" hint={`${rows.length.toLocaleString("fr-FR")} entrée${rows.length > 1 ? "s" : ""}`} foot={rows.length ? <Pager paged={paged as never} noun="entrées" /> : undefined}>
        <div className="fx-filterbar">
          <select className="fx-select" aria-label="Personne" value={actor} onChange={(e) => { setActor(e.target.value); reset(); }}>
            <option value="all">Toutes les personnes</option>
            {actors.map((a) => <option key={a}>{a}</option>)}
          </select>
          <select className="fx-select" aria-label="Type d'action" value={type} onChange={(e) => { setType(e.target.value); reset(); }}>
            <option value="all">Tous les types</option>
            {(Object.keys(AUDIT_TYPE_FR) as AuditType[]).map((t) => <option key={t} value={t}>{AUDIT_TYPE_FR[t]}</option>)}
          </select>
          <label className="fx-field" style={{ flexDirection: "row", alignItems: "center" }}>
            Du <input className="os-input" style={{ width: 150 }} type="date" max={snap.today} value={from} onChange={(e) => { setFrom(e.target.value); reset(); }} />
          </label>
          <label className="fx-field" style={{ flexDirection: "row", alignItems: "center" }}>
            au <input className="os-input" style={{ width: 150 }} type="date" min={from || undefined} max={snap.today} value={to} onChange={(e) => { setTo(e.target.value); reset(); }} />
          </label>
        </div>
        {rows.length === 0 ? (
          <EmptyState title="Aucune entrée" text="Aucune action ne correspond à ces filtres." icon={<IcClock />} />
        ) : (
          <div className="fx-table-wrap">
            <table className="fx-table">
              <thead>
                <tr><th>Quand</th><th>Qui</th><th>Type</th><th>Quoi</th></tr>
              </thead>
              <tbody>
                {paged.rows.map((e) => (
                  <tr key={e.id}>
                    <td className="nowrap">{fmtDayYear(e.at.slice(0, 10))} · {e.at.slice(11, 16)}</td>
                    <td className="nowrap">{e.actor}</td>
                    <td><Badge tone="blue">{AUDIT_TYPE_FR[e.type]}</Badge></td>
                    <td>
                      <div className="fx-cell-main" style={{ minWidth: 220 }}>
                        <strong>{e.href ? <Link href={e.href}>{e.action}</Link> : e.action}</strong>
                        <span>{e.detail}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>
    </>
  );
}
