"use client";

import { useMemo, useState } from "react";
import { Badge, KpiCard } from "../../_components/ui";
import { FillBars, Segmented } from "../../_components/charts";
import OsDrawer from "../../_components/OsDrawer";
import { useOs } from "../../_components/OsProvider";
import { useToast } from "../../_components/Toast";
import { CAMPUSES, PROGRAMS } from "../../_data/core";
import { assignTeacher, setGroupOpen } from "../../_data/repo";
import { fillOn } from "../../_data/metrics";
import { fmtDayYear } from "../../_lib/dates";
import { FounderHeader, FiltersBar, Panel } from "../_components/Bits";
import { useFounderFilters } from "../_lib/useFilters";
import type { Group } from "../../_data";

const program = (id: string) => PROGRAMS.find((p) => p.id === id)?.name ?? id;
const campusName = (id: string) => CAMPUSES.find((c) => c.id === id)?.name ?? id;

export default function SessionsPage() {
  const f = useFounderFilters();
  const { snap, campus } = f;
  const { session } = useOs();
  const toast = useToast();
  const actor = session?.name || "Fondateur TAS";
  const [tab, setTab] = useState<"sessions" | "classes" | "teachers">(() =>
    typeof window !== "undefined" && new URLSearchParams(window.location.search).get("tab") === "classes" ? "classes" : "sessions",
  );
  const [edit, setEdit] = useState<Group | null>(null);
  const [teacherId, setTeacherId] = useState("");

  const sessions = useMemo(() => snap.sessions.filter((s) => campus === "all" || s.campusId === campus).sort((a, b) => (a.start < b.start ? 1 : -1)), [snap.sessions, campus]);
  const groups = useMemo(() => snap.groups.filter((g) => campus === "all" || g.campusId === campus), [snap.groups, campus]);
  const teachers = useMemo(() => snap.teachers.filter((t) => campus === "all" || t.campusId === campus), [snap.teachers, campus]);
  const fill = fillOn(snap, campus, snap.today);
  const uncovered = groups.filter((g) => g.students > 0 && (!g.teacherId || snap.teacherById.get(g.teacherId)?.status === "leave")).length;
  const base = { compare: false, hint: "", delta: null } as const;

  function sessionLabel(s: (typeof sessions)[number]) {
    if (s.end < snap.today) return { tone: "neutral" as const, text: "Fermée" };
    if (s.enrolled >= s.capacity) return { tone: "red" as const, text: "Pleine" };
    return { tone: "green" as const, text: s.start > snap.today ? "Ouverte" : "En cours" };
  }

  function saveTeacher() {
    if (!edit) return;
    assignTeacher(edit.id, teacherId, actor);
    toast.success("Enseignant assigné ✓");
    setEdit(null);
  }

  return (
    <>
      <FounderHeader title="Sessions et classes" subtitle="Remplissage, classes et charge des enseignants" />
      <FiltersBar filters={f} period={false} />
      <section className="fx-kpis" aria-label="Sessions en chiffres">
        <KpiCard size="mini" kpi={{ ...base, id: "f", label: "Remplissage", value: fill.pct === null ? "—" : `${Math.round(fill.pct)} %`, raw: fill.pct ?? 0, sub: `${fill.taken} / ${fill.capacity} places` }} />
        <KpiCard size="mini" kpi={{ ...base, id: "s", label: "Sessions ouvertes ou en cours", value: String(fill.rows.length), raw: fill.rows.length }} />
        <KpiCard size="mini" kpi={{ ...base, id: "c", label: "Classes ouvertes", value: String(groups.filter((g) => g.open !== false).length), raw: 0 }} />
        <KpiCard size="mini" kpi={{ ...base, id: "u", label: "Classes à couvrir", value: String(uncovered), raw: uncovered, sub: "sans enseignant ou en congé" }} />
      </section>
      <Segmented
        label="Vue"
        value={tab}
        onChange={setTab}
        options={[
          { value: "sessions", label: "Sessions", count: sessions.length },
          { value: "classes", label: "Classes", count: groups.length },
          { value: "teachers", label: "Enseignants", count: teachers.length },
        ]}
      />

      {tab === "sessions" ? (
        <Panel title="Remplissage des sessions" hint={`Repère à ${snap.settings.fillPct} %`}>
          <FillBars
            threshold={snap.settings.fillPct}
            rows={fill.rows.map((r) => ({ id: r.session.id, label: r.session.name, hint: program(r.session.programId), taken: r.taken, capacity: r.capacity }))}
          />
        </Panel>
      ) : null}

      {tab === "sessions" ? (
        <Panel title="Sessions" hint="Places prises sur capacité">
          <div className="fx-table-wrap">
            <table className="fx-table">
              <thead>
                <tr><th>Session</th><th>Dates</th><th className="num">Inscrits</th><th className="num">Capacité</th><th className="num">Remplissage</th><th>Statut</th></tr>
              </thead>
              <tbody>
                {sessions.map((s) => {
                  const st = sessionLabel(s);
                  return (
                    <tr key={s.id}>
                      <td><div className="fx-cell-main"><strong>{s.name}</strong><span>{program(s.programId)} · {campusName(s.campusId)}</span></div></td>
                      <td className="nowrap">{fmtDayYear(s.start)} → {fmtDayYear(s.end)}</td>
                      <td className="num">{s.enrolled}</td>
                      <td className="num">{s.capacity}</td>
                      <td className="num">{Math.round((s.enrolled / s.capacity) * 100)} %</td>
                      <td><Badge tone={st.tone}>{st.text}</Badge></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Panel>
      ) : null}

      {tab === "classes" ? (
        <Panel title="Classes" hint="Ouvrir ou fermer une classe, assigner un enseignant">
          <div className="fx-table-wrap">
            <table className="fx-table">
              <thead>
                <tr><th>Classe</th><th>Enseignant</th><th>Salle et horaire</th><th className="num">Élèves</th><th>Statut</th><th /></tr>
              </thead>
              <tbody>
                {groups.map((g) => {
                  const t = snap.teacherById.get(g.teacherId);
                  const problem = !g.teacherId || t?.status === "leave";
                  return (
                    <tr key={g.id}>
                      <td><div className="fx-cell-main"><strong>{g.name}</strong><span>{program(g.programId)} · {campusName(g.campusId)}</span></div></td>
                      <td>{t ? t.name : <span className="fx-tag">Sans enseignant</span>}{t?.status === "leave" ? <span className="fx-tag fx-tag-amber" style={{ marginLeft: 6 }}>En congé</span> : null}{problem ? null : null}</td>
                      <td><div className="fx-cell-main"><strong>{g.room}</strong><span>{g.schedule}</span></div></td>
                      <td className="num">{g.students} / {g.capacity}</td>
                      <td><Badge tone={g.open === false ? "neutral" : "green"}>{g.open === false ? "Fermée" : "Ouverte"}</Badge></td>
                      <td className="nowrap">
                        <button type="button" className="os-btn" onClick={() => { setEdit(g); setTeacherId(g.teacherId); }}>Enseignant</button>{" "}
                        <button type="button" className="os-btn" onClick={() => { setGroupOpen(g.id, g.open === false, actor); toast.success(g.open === false ? "Classe ouverte ✓" : "Classe fermée ✓"); }}>
                          {g.open === false ? "Ouvrir" : "Fermer"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Panel>
      ) : null}

      {tab === "teachers" ? (
        <Panel title="Charge des enseignants">
          <div className="fx-table-wrap">
            <table className="fx-table">
              <thead>
                <tr><th>Enseignant</th><th>Campus</th><th className="num">Classes</th><th className="num">Élèves</th><th>Statut</th></tr>
              </thead>
              <tbody>
                {teachers.map((t) => (
                  <tr key={t.id}>
                    <td><div className="fx-cell-main"><strong>{t.name}</strong><span>{t.specialty}</span></div></td>
                    <td>{campusName(t.campusId)}</td>
                    <td className="num">{t.groups.length}</td>
                    <td className="num">{t.students}</td>
                    <td><Badge tone={t.status === "active" ? "green" : "amber"}>{t.status === "active" ? "Actif" : "Congé"}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      ) : null}

      <OsDrawer open={!!edit} compact fit title={`Assigner un enseignant · ${edit?.name ?? ""}`} onClose={() => setEdit(null)}>
        <div className="os-form-stack">
          <label className="fx-field">
            Enseignant
            <select className="fx-select" value={teacherId} onChange={(e) => setTeacherId(e.target.value)} data-autofocus>
              <option value="">Aucun</option>
              {snap.teachers.filter((t) => t.campusId === edit?.campusId).map((t) => (
                <option key={t.id} value={t.id}>{t.name}{t.status === "leave" ? " (en congé)" : ""} · {t.groups.length} classe(s)</option>
              ))}
            </select>
          </label>
          <button type="button" className="os-btn os-btn-primary" onClick={saveTeacher}>Enregistrer</button>
        </div>
      </OsDrawer>
    </>
  );
}
