"use client";

import { useEffect, useState } from "react";
import { useOs } from "../../_components/OsProvider";
import { useToast } from "../../_components/Toast";
import { CAMPUSES, PROGRAMS, fmtMoney } from "../../_data/core";
import { saveSettings } from "../../_data/repo";
import { saveDisplayName } from "../../_data/profile";
import { useDisplayName } from "../_lib/useDisplayName";
import type { Settings } from "../../_data/settings";
import { FounderHeader, Panel } from "../_components/Bits";
import { useFounderFilters } from "../_lib/useFilters";

export default function SettingsPage() {
  const { snap } = useFounderFilters();
  const { session } = useOs();
  const toast = useToast();
  const [draft, setDraft] = useState<Settings>(snap.settings);
  const [errors, setErrors] = useState<string[]>([]);
  const shownName = useDisplayName();
  const [nameDraft, setNameDraft] = useState("");
  useEffect(() => setNameDraft(shownName), [shownName]);
  useEffect(() => setDraft(snap.settings), [snap.settings]);

  const num = (v: string) => (v === "" ? 0 : Number(v.replace(/\s/g, "")));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const errs: string[] = [];
    if (!/^\d{4}-\d{4}$/.test(draft.schoolYear)) errs.push("L'année scolaire s'écrit 2026-2027.");
    if (draft.unpaidDays < 1 || draft.unpaidDays > 365) errs.push("Le délai d'impayé doit être entre 1 et 365 jours.");
    if (draft.fillPct < 1 || draft.fillPct > 100) errs.push("Le seuil de remplissage doit être entre 1 et 100 %.");
    if (draft.attendancePct < 1 || draft.attendancePct > 100) errs.push("Le seuil de présence doit être entre 1 et 100 %.");
    if (draft.callbackDays < 1 || draft.callbackDays > 60) errs.push("Le délai de rappel doit être entre 1 et 60 jours.");
    for (const p of PROGRAMS) if (!(draft.fees[p.id] > 0)) errs.push(`Le tarif « ${p.name} » doit être supérieur à 0.`);
    setErrors(errs);
    if (errs.length) {
      toast.error("Vérifiez les champs signalés.");
      return;
    }
    saveSettings(draft, session?.name || "Fondateur TAS");
    if (session?.matricule) saveDisplayName(session.matricule, nameDraft);
    toast.success("Paramètres enregistrés ✓");
  }

  const field = (label: string, value: number, key: keyof Settings, hint: string) => (
    <label className="fx-field">
      {label}
      <input className="os-input" inputMode="numeric" value={value} onChange={(e) => setDraft({ ...draft, [key]: num(e.target.value) })} />
      <small>{hint}</small>
    </label>
  );

  return (
    <form onSubmit={submit} className="os-grid" style={{ gap: 14 }}>
      <FounderHeader title="Paramètres" subtitle="Frais, année scolaire et seuils d'alerte">
        <button type="submit" className="os-btn os-btn-primary">Enregistrer</button>
      </FounderHeader>
      {errors.length ? (
        <div className="os-card fx-pad" role="alert">
          {errors.map((e) => <p key={e} className="os-field-error" style={{ margin: 0 }}>{e}</p>)}
        </div>
      ) : null}
      <Panel title="Votre profil" hint="Ce nom apparaît dans le message d'accueil du tableau de bord">
        <div className="fx-form fx-form-2">
          <label className="fx-field">
            Nom affiché
            <input className="os-input" value={nameDraft} maxLength={60} onChange={(e) => setNameDraft(e.target.value)} placeholder={session?.name ?? ""} />
            <small>Laissez vide pour reprendre le nom du compte ({session?.name}).</small>
          </label>
        </div>
      </Panel>
      <Panel title="Seuils d'alerte" hint="Utilisés par la cloche, les alertes du tableau de bord et « élève en danger »">
        <div className="fx-form fx-form-2">
          {field("Impayé signalé après (jours)", draft.unpaidDays, "unpaidDays", "Un impayé échu depuis ce nombre de jours déclenche l'alerte.")}
          {field("Session presque pleine (%)", draft.fillPct, "fillPct", "Alerte à partir de ce taux de remplissage.")}
          {field("Présence minimale (%)", draft.attendancePct, "attendancePct", "En dessous, l'élève est en danger.")}
          {field("Rappel des demandes (jours)", draft.callbackDays, "callbackDays", "Une demande non rappelée depuis ce délai est signalée.")}
        </div>
      </Panel>
      <Panel title="Frais par formation" hint="Tarif de référence pour 3 mois. 6 et 9 mois en découlent. S'applique aux nouvelles inscriptions.">
        <div className="fx-form fx-form-2">
          {PROGRAMS.map((p) => (
            <label key={p.id} className="fx-field">
              {p.name}
              <input className="os-input" inputMode="numeric" value={draft.fees[p.id] ?? 0} onChange={(e) => setDraft({ ...draft, fees: { ...draft.fees, [p.id]: num(e.target.value) } })} />
              <small>{fmtMoney(draft.fees[p.id] ?? 0)}</small>
            </label>
          ))}
        </div>
      </Panel>
      <Panel title="École">
        <div className="fx-form fx-form-2">
          <label className="fx-field">
            Année scolaire
            <input className="os-input" value={draft.schoolYear} onChange={(e) => setDraft({ ...draft, schoolYear: e.target.value })} placeholder="2026-2027" />
          </label>
          <div className="fx-field">
            Campus
            <ul className="fx-list" style={{ fontWeight: 500 }}>
              {CAMPUSES.map((c) => (
                <li key={c.id} className="fx-row" style={{ minHeight: 40, padding: "6px 0" }}>
                  <span className="fx-row-main"><strong>{c.name}</strong><span>{c.area} · {c.rooms} salles</span></span>
                </li>
              ))}
            </ul>
            <small>Liste en lecture seule.</small>
          </div>
        </div>
      </Panel>
    </form>
  );
}
