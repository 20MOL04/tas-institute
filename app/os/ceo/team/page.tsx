"use client";

import Link from "next/link";
import { useState } from "react";
import { Badge } from "../../_components/ui";
import { KpiCard } from "../../_components/ui";
import OsDrawer from "../../_components/OsDrawer";
import { useOs } from "../../_components/OsProvider";
import { useToast } from "../../_components/Toast";
import { IcPlus } from "../../_components/icons";
import { CAMPUSES } from "../../_data/core";
import { changeAdminCampus, resetAdminPassword, suspendAdmin, type AdminRow } from "../../_data/repo";
import { FounderHeader, Panel } from "../_components/Bits";
import { useFounderFilters } from "../_lib/useFilters";

const campusName = (id: string) => CAMPUSES.find((c) => c.id === id)?.name ?? "Toute l'école";

export default function TeamPage() {
  const { snap } = useFounderFilters();
  const { openPanel, session } = useOs();
  const toast = useToast();
  const actor = session?.name || "Fondateur TAS";
  const [secret, setSecret] = useState<{ name: string; matricule: string; password: string } | null>(null);
  const [confirm, setConfirm] = useState<{ row: AdminRow; action: "suspend" | "reactivate" | "reset" } | null>(null);

  const admins = snap.admins;
  const active = admins.filter((a) => a.status === "active").length;
  const suspended = admins.filter((a) => a.status === "suspended").length;
  const pending = admins.filter((a) => a.status === "pending").length;
  const teachers = snap.teachers;
  const onLeave = teachers.filter((t) => t.status === "leave").length;

  function run() {
    if (!confirm) return;
    const { row, action } = confirm;
    if (action === "suspend") {
      suspendAdmin(row.matricule, true, actor);
      toast.success(`${row.name} est suspendu ✓`);
    } else if (action === "reactivate") {
      suspendAdmin(row.matricule, false, actor);
      toast.success(`${row.name} est réactivé ✓`);
    } else {
      const password = resetAdminPassword(row.matricule, actor);
      setSecret({ name: row.name, matricule: row.matricule, password });
    }
    setConfirm(null);
  }

  const base = { compare: false, hint: "", delta: null } as const;
  return (
    <>
      <FounderHeader title="Équipe" subtitle="Administrateurs du bureau et enseignants">
        <button type="button" className="os-btn os-btn-primary" onClick={() => openPanel("admin")}>
          <IcPlus /> Créer un administrateur
        </button>
      </FounderHeader>
      <section className="fx-kpis" aria-label="Équipe en chiffres">
        <KpiCard size="mini" kpi={{ ...base, id: "a", label: "Administrateurs actifs", value: String(active), raw: active }} />
        <KpiCard size="mini" kpi={{ ...base, id: "s", label: "Suspendus", value: String(suspended), raw: suspended }} />
        <KpiCard size="mini" kpi={{ ...base, id: "t", label: "Enseignants", value: String(teachers.length), raw: teachers.length }} />
        <KpiCard size="mini" kpi={{ ...base, id: "l", label: "Enseignants en congé", value: String(onLeave), raw: onLeave, sub: pending ? `${pending} compte(s) à valider` : undefined }} />
      </section>

      <Panel title="Administrateurs" hint="Un compte suspendu ne peut plus se connecter">
        <div className="fx-table-wrap">
          <table className="fx-table">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Matricule</th>
                <th>Campus</th>
                <th>Statut</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {admins.map((a) => (
                <tr key={a.matricule}>
                  <td>
                    <div className="fx-cell-main">
                      <strong>{a.name}</strong>
                      <span>{a.roleLabel}</span>
                    </div>
                  </td>
                  <td className="nowrap">{a.matricule}</td>
                  <td>
                    {a.status === "pending" ? (
                      campusName(a.campusId)
                    ) : (
                      <select
                        className="fx-select"
                        aria-label={`Campus de ${a.name}`}
                        value={a.campusId}
                        onChange={(e) => {
                          changeAdminCampus(a.matricule, e.target.value, actor);
                          toast.success("Campus modifié ✓");
                        }}
                      >
                        {a.matricule.startsWith("FIN") ? <option value="">Toute l&apos;école</option> : null}
                        {CAMPUSES.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    )}
                  </td>
                  <td>
                    <Badge tone={a.status === "active" ? "green" : a.status === "suspended" ? "red" : "blue"}>{a.status === "active" ? "Actif" : a.status === "suspended" ? "Suspendu" : "À valider"}</Badge>
                  </td>
                  <td className="nowrap">
                    {a.status === "pending" ? (
                      <Link className="os-btn" href="/os/ceo/validations?kind=admin">
                        Valider
                      </Link>
                    ) : (
                      <>
                        <button type="button" className="os-btn" onClick={() => setConfirm({ row: a, action: a.status === "suspended" ? "reactivate" : "suspend" })}>
                          {a.status === "suspended" ? "Réactiver" : "Suspendre"}
                        </button>{" "}
                        <button type="button" className="os-btn" onClick={() => setConfirm({ row: a, action: "reset" })}>
                          Mot de passe
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <Panel title="Enseignants" hint="Lecture seule · charge = classes et élèves suivis">
        <div className="fx-table-wrap">
          <table className="fx-table">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Spécialité</th>
                <th>Campus</th>
                <th className="num">Classes</th>
                <th className="num">Élèves</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              {teachers.map((t) => (
                <tr key={t.id}>
                  <td>
                    <div className="fx-cell-main">
                      <strong>{t.name}</strong>
                      <span>{t.staffId}</span>
                    </div>
                  </td>
                  <td>{t.specialty}</td>
                  <td>{campusName(t.campusId)}</td>
                  <td className="num">{t.groups.length}</td>
                  <td className="num">{t.students}</td>
                  <td>
                    <Badge tone={t.status === "active" ? "green" : "amber"}>{t.status === "active" ? "Actif" : "Congé"}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      <OsDrawer
        open={!!confirm}
        compact
        fit
        title={confirm?.action === "suspend" ? "Suspendre le compte" : confirm?.action === "reactivate" ? "Réactiver le compte" : "Réinitialiser le mot de passe"}
        onClose={() => setConfirm(null)}
      >
        <div className="os-form-stack">
          <p className="os-small">
            {confirm?.action === "suspend"
              ? `${confirm.row.name} ne pourra plus se connecter tant que le compte est suspendu.`
              : confirm?.action === "reactivate"
                ? `${confirm?.row.name} pourra de nouveau se connecter.`
                : `Un mot de passe provisoire sera créé pour ${confirm?.row.name}. Il ne sera affiché qu'une seule fois.`}
          </p>
          <button type="button" className="os-btn os-btn-primary" onClick={run} data-autofocus>
            Confirmer
          </button>
        </div>
      </OsDrawer>

      <OsDrawer open={!!secret} compact fit title="Mot de passe provisoire" onClose={() => setSecret(null)}>
        {secret ? (
          <div className="fx-secret">
            <p className="os-small">
              {secret.name} · {secret.matricule}
            </p>
            <code>{secret.password}</code>
            <p className="os-small">Notez-le maintenant : il ne sera plus affiché.</p>
            <button type="button" className="os-btn os-btn-primary" onClick={() => setSecret(null)}>
              J&apos;ai noté le mot de passe
            </button>
          </div>
        ) : null}
      </OsDrawer>
    </>
  );
}
