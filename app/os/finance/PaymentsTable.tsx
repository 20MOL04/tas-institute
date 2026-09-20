"use client";

import { useMemo, useState } from "react";
import {
  PAYMENTS,
  fmtMoney,
  type Payment,
  type PaymentMethod,
} from "../_data";
import { PersonCell } from "../_components/ui";
import Link from "next/link";

type PurposeFilter = "all" | Payment["purpose"];
type MethodFilter = "all" | PaymentMethod;

const PURPOSES: PurposeFilter[] = ["all", "Scolarité", "Logement", "Inscription", "Examen"];
const METHODS: MethodFilter[] = ["all", "Mobile Money", "Espèces", "Virement", "Carte"];

function initials(name: string) {
  const parts = name.split(" ");
  return `${parts[0]?.[0] ?? ""}${parts[1]?.[0] ?? ""}`;
}

export default function PaymentsTable({ payments = PAYMENTS }: { payments?: Payment[] }) {
  const [purpose, setPurpose] = useState<PurposeFilter>("all");
  const [method, setMethod] = useState<MethodFilter>("all");

  const rows = useMemo(() => {
    return [...payments]
      .sort((a, b) => (a.date === b.date ? b.id.localeCompare(a.id) : b.date.localeCompare(a.date)))
      .filter((p) => purpose === "all" || p.purpose === purpose)
      .filter((p) => method === "all" || p.method === method)
      .slice(0, 40);
  }, [purpose, method, payments]);

  return (
    <>
      <div className="os-filters">
        <select
          className="os-select"
          aria-label="Filtrer par objet"
          value={purpose}
          onChange={(e) => {
            const next = e.target.value;
            if ((PURPOSES as readonly string[]).includes(next)) setPurpose(next as PurposeFilter);
          }}
        >
          {PURPOSES.map((p) => (
            <option key={p} value={p}>
              {p === "all" ? "Tous les objets" : p}
            </option>
          ))}
        </select>
        <select
          className="os-select"
          aria-label="Filtrer par méthode"
          value={method}
          onChange={(e) => {
            const next = e.target.value;
            if ((METHODS as readonly string[]).includes(next)) setMethod(next as MethodFilter);
          }}
        >
          {METHODS.map((m) => (
            <option key={m} value={m}>
              {m === "all" ? "Toutes les méthodes" : m}
            </option>
          ))}
        </select>
        <span className="os-muted os-small">{rows.length} paiement(s) affichés</span>
      </div>
      {rows.length === 0 ? (
        <div className="os-empty">Aucun paiement pour ce filtre.</div>
      ) : (
        <div className="os-table-wrap">
          <table className="os-table">
            <thead>
              <tr>
                <th>Étudiant</th>
                <th>Objet</th>
                <th className="num">Montant</th>
                <th className="os-th-action">Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p.id}>
                  <td>
                    <PersonCell initials={initials(p.studentName)} name={p.studentName} meta={p.receipt} />
                  </td>
                  <td>{p.purpose}</td>
                  <td className="num">{fmtMoney(p.amount)}</td>
                  <td className="os-td-action">
                    <Link href={`/os/students/${p.studentId}/recu/${p.id}`} className="os-btn os-btn-sm">
                      Imprimer
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
