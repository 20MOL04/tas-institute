"use client";

import { GROUPS, TEACHERS } from "../../_data";
import { OsCard, PageHead } from "../../_components/ui";
import { useOsT } from "../../_components/useOsT";
import BrandIcon from "../../../components/BrandIcon";

export default function PrintTeachersPage() {
  const { t } = useOsT();
  const tas = TEACHERS.filter((x) => x.schoolId === "tas");

  return (
    <>
      <PageHead title={t.print.title}>
        <button type="button" className="os-btn os-btn-primary" onClick={() => window.print()}>
          {t.print.print}
        </button>
      </PageHead>
      <div className="os-print-grid">
        {tas.map((teacher) => {
          const groups = GROUPS.filter((g) => g.teacherId === teacher.id);
          return (
            <article key={teacher.id} className="os-print-sheet">
              <header>
                <span className="os-doc-brand">
                  <BrandIcon size={24} />
                  <strong>TAS English Institute</strong>
                </span>
                <span>{teacher.campusId}</span>
              </header>
              <h2>{teacher.name}</h2>
              <p className="os-print-id">{teacher.staffId}</p>
              <ul>
                {groups.length === 0 ? <li>Aucun groupe</li> : groups.map((g) => <li key={g.id}>{g.name}</li>)}
              </ul>
              <footer>
                <div>{t.print.first}</div>
                <div>{t.print.returning}</div>
              </footer>
            </article>
          );
        })}
      </div>
    </>
  );
}
