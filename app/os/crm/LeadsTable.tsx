"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  COUNTRIES,
  LEAD_SOURCES,
  LEAD_STAGES,
  PROGRAMS,
  fmtInt,
  isFormLead,
  isWhatsAppLead,
  leadSourceLabel,
  type Kpi,
  type Lead,
  type LeadStage,
} from "../_data";
import { Badge, KpiCard, OsCard, PersonCell, VoirLink, statusTone } from "../_components/ui";
import { useLiveLeads } from "../_components/useLiveLeads";
import LeadActions from "../_components/LeadActions";
import { downloadCsv, printTable } from "../_lib/exportFile";

type Bucket = "all" | "overdue" | LeadStage;

function stageLabel(stage: LeadStage) {
  return LEAD_STAGES.find((s) => s.key === stage)?.label ?? stage;
}

function programName(programId: string) {
  return PROGRAMS.find((p) => p.id === programId)?.name ?? programId;
}

function inBucket(lead: Lead, bucket: Bucket) {
  if (bucket === "all") return true;
  if (bucket === "overdue") return lead.overdue;
  return lead.stage === bucket;
}

export default function LeadsTable() {
  const params = useSearchParams();
  const initialBucket = (params.get("bucket") as Bucket | null) ?? "all";
  const [q, setQ] = useState("");
  const [source, setSource] = useState("all");
  const [country, setCountry] = useState("all");
  const [bucket, setBucket] = useState<Bucket>(initialBucket);
  const allLeads = useLiveLeads();

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return allLeads.filter((lead) => {
      if (!inBucket(lead, bucket)) return false;
      if (source !== "all" && lead.source !== source) return false;
      if (country !== "all" && lead.country !== country) return false;
      if (!needle) return true;
      const hay = `${lead.name} ${lead.phone} ${lead.country} ${lead.note}`.toLowerCase();
      return hay.includes(needle);
    }).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [q, source, country, bucket, allLeads]);

  const kpis: Kpi[] = [
    { id: "all", label: "Demandes", value: fmtInt(allLeads.length), raw: allLeads.length, delta: null, hint: "" },
    {
      id: "form",
      label: "Formulaire",
      value: fmtInt(allLeads.filter((l) => isFormLead(l.source)).length),
      raw: allLeads.filter((l) => isFormLead(l.source)).length,
      delta: null,
      hint: "",
    },
    {
      id: "wa",
      label: "WhatsApp",
      value: fmtInt(allLeads.filter((l) => isWhatsAppLead(l.source)).length),
      raw: allLeads.filter((l) => isWhatsAppLead(l.source)).length,
      delta: null,
      hint: "",
    },
    {
      id: "over",
      label: "À relancer",
      value: fmtInt(allLeads.filter((l) => l.overdue).length),
      raw: allLeads.filter((l) => l.overdue).length,
      delta: null,
      hint: "",
    },
  ];

  return (
    <>
      <div className="os-kpi-grid">
        {kpis.map((kpi) => (
          <KpiCard key={kpi.id} kpi={kpi} />
        ))}
      </div>
    <OsCard
      title="Inscriptions"
      action={
        <span className="os-page-actions">
          <button
            type="button"
            className="os-btn os-btn-sm"
            onClick={() =>
              downloadCsv(
                "inscriptions-en-ligne",
                ["Nom", "Téléphone", "Pays", "Source", "Étape"],
                rows.map((l) => [l.name, l.phone, l.country, leadSourceLabel(l.source), stageLabel(l.stage)]),
              )
            }
          >
            Excel
          </button>
          <button
            type="button"
            className="os-btn os-btn-sm"
            onClick={() =>
              printTable(
                "Inscriptions en ligne",
                ["Nom", "Téléphone", "Pays", "Source", "Étape"],
                rows.map((l) => [l.name, l.phone, l.country, leadSourceLabel(l.source), stageLabel(l.stage)]),
              )
            }
          >
            Imprimer
          </button>
          <span className="os-muted os-small">{rows.length}</span>
        </span>
      }
    >
      <div className="os-toolbar">
        <input
          className="os-input os-search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Nom, téléphone, ville, n°"
          aria-label="Rechercher"
        />
        <select className="os-select" aria-label="Source" value={source} onChange={(e) => setSource(e.target.value)}>
          <option value="all">Toutes les sources</option>
          {LEAD_SOURCES.map((src) => (
            <option key={src} value={src}>
              {leadSourceLabel(src)}
            </option>
          ))}
        </select>
        <select
          className="os-select"
          aria-label="Pays"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
        >
          <option value="all">Tous les pays</option>
          {COUNTRIES.map((c) => (
            <option key={c.code} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>
        <select
          className="os-select"
          aria-label="File"
          value={bucket}
          onChange={(e) => setBucket(e.target.value as Bucket)}
        >
          <option value="all">Toute la file</option>
          <option value="overdue">À relancer</option>
          {LEAD_STAGES.map((s) => (
            <option key={s.key} value={s.key}>
              {s.label}
            </option>
          ))}
        </select>
      </div>
      {rows.length === 0 ? (
        <p className="os-empty">Aucune inscription pour ces filtres.</p>
      ) : (
        <div className="os-table-wrap">
          <table className="os-table">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Téléphone</th>
                <th>Source</th>
                <th>Étape</th>
                <th className="os-th-action">Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((lead) => (
                <tr key={lead.id}>
                  <td>
                    <PersonCell initials={lead.initials} name={lead.name} meta={lead.country} />
                  </td>
                  <td>{lead.phone}</td>
                  <td>{leadSourceLabel(lead.source)}</td>
                  <td>
                    <Badge tone={statusTone(lead.stage)}>{stageLabel(lead.stage)}</Badge>
                  </td>
                  <td className="os-td-action">
                    <LeadActions lead={lead} />
                    <VoirLink href={`/os/crm/${lead.id}`} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </OsCard>
    </>
  );
}
