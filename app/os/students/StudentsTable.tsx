"use client";

import { useMemo, useState } from "react";
import {
  PROGRAMS,
  STUDENTS,
  STUDENTS_CHANGED,
  TEACHERS,
  scopedStudents,
  type StudentStatus,
} from "../_data";
import { useOs } from "../_components/OsProvider";
import {
  Badge,
  OsCard,
  PAYMENT_STATUS_FR,
  PersonCell,
  STUDENT_STATUS_FR,
  VoirLink,
  statusTone,
} from "../_components/ui";
import { useStoreTick } from "../_components/useStoreTick";
import { downloadCsv, printTable } from "../_lib/exportFile";

const PAGE_SIZE = 20;
const STATUS_FILTERS: { id: "all" | StudentStatus; label: string }[] = [
  { id: "all", label: "Tous" },
  { id: "active", label: STUDENT_STATUS_FR.active },
  { id: "applicant", label: STUDENT_STATUS_FR.applicant },
  { id: "completed", label: STUDENT_STATUS_FR.completed },
  { id: "dropped", label: STUDENT_STATUS_FR.dropped },
];

export default function StudentsTable() {
  const { user } = useOs();
  const [status, setStatus] = useState<"all" | StudentStatus>("all");
  const [programId, setProgramId] = useState("all");
  const [page, setPage] = useState(0);
  const tick = useStoreTick(STUDENTS_CHANGED);

  const scoped = useMemo(() => {
    const teacherId =
      user.role === "teacher" ? TEACHERS.find((t) => t.campusId === user.campusId)?.id : undefined;
    return scopedStudents(user.role, {
      schoolId: user.schoolId,
      campusId: user.campusId,
      teacherId,
    });
  }, [user, tick]);

  const filtered = useMemo(() => {
    return scoped.filter((s) => {
      if (status !== "all" && s.status !== status) return false;
      if (programId !== "all" && s.programId !== programId) return false;
      return true;
    });
  }, [scoped, status, programId]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages - 1);
  const rows = filtered.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE);
  const from = filtered.length === 0 ? 0 : safePage * PAGE_SIZE + 1;
  const to = Math.min(filtered.length, safePage * PAGE_SIZE + PAGE_SIZE);

  function setStatusFilter(next: "all" | StudentStatus) {
    setStatus(next);
    setPage(0);
  }

  function setProgramFilter(next: string) {
    setProgramId(next);
    setPage(0);
  }

  const exportRows = filtered.map((s) => [s.matricule, s.name, STUDENT_STATUS_FR[s.status], PAYMENT_STATUS_FR[s.paymentStatus]]);

  return (
    <OsCard
      title="Dossiers"
      hint={
        scoped.length === STUDENTS.length
          ? "Filtre statut et programme, 20 lignes par page."
          : `${scoped.length} dossiers dans le périmètre du rôle ${user.roleLabel}.`
      }
      action={
        <span className="os-page-actions">
          <button type="button" className="os-btn os-btn-sm" onClick={() => downloadCsv("dossiers-etudiants", ["Matricule", "Nom", "Statut", "Paiement"], exportRows)}>
            Excel
          </button>
          <button type="button" className="os-btn os-btn-sm" onClick={() => printTable("Dossiers étudiants", ["Matricule", "Nom", "Statut", "Paiement"], exportRows)}>
            Imprimer
          </button>
          <select
            className="os-select"
            aria-label="Programme"
            value={programId}
            onChange={(e) => setProgramFilter(e.target.value)}
          >
            <option value="all">Tous les programmes</option>
            {PROGRAMS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </span>
      }
      foot={
        <>
          <span className="os-num">
            {from}–{to} sur {filtered.length}
          </span>
          <div className="os-page-actions">
            <button
              type="button"
              className="os-btn os-btn-sm"
              disabled={safePage <= 0}
              onClick={() => setPage(safePage - 1)}
            >
              Précédent
            </button>
            <button
              type="button"
              className="os-btn os-btn-sm"
              disabled={safePage >= totalPages - 1}
              onClick={() => setPage(safePage + 1)}
            >
              Suivant
            </button>
          </div>
        </>
      }
    >
      <div className="os-filters">
        <div className="os-seg" role="group" aria-label="Statut">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              aria-pressed={status === f.id}
              onClick={() => setStatusFilter(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>
      {rows.length === 0 ? (
        <p className="os-empty">Aucun dossier pour ces filtres.</p>
      ) : (
        <div className="os-table-wrap">
          <table className="os-table">
            <thead>
              <tr>
                <th>Étudiant</th>
                <th>Statut</th>
                <th>Paiement</th>
                <th className="os-th-action">Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((s) => (
                  <tr key={s.id}>
                    <td>
                      <PersonCell initials={s.initials} name={s.name} meta={s.matricule} />
                    </td>
                    <td>
                      <Badge tone={statusTone(s.status)}>{STUDENT_STATUS_FR[s.status]}</Badge>
                    </td>
                    <td>
                      <Badge tone={statusTone(s.paymentStatus)}>{PAYMENT_STATUS_FR[s.paymentStatus]}</Badge>
                    </td>
                    <td className="os-td-action">
                      <VoirLink href={`/os/students/${s.id}`} />
                    </td>
                  </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </OsCard>
  );
}
