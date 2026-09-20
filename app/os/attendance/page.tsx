"use client";

import { useEffect, useState } from "react";
import {
  ATTENDANCE_CHANGED,
  GROUPS,
  fmtDate,
  fmtPct,
  liveAttendance,
  sessionAttendanceRate,
  type AttendanceRow,
} from "../_data";
import { KpiCard, OsCard, PageHead } from "../_components/ui";
import { PanelButton } from "../_components/EnrollPanels";
import { useOs } from "../_components/OsProvider";
import { useOsT } from "../_components/useOsT";

export default function AttendancePage() {
  const { t } = useOsT();
  const { session } = useOs();
  const [rows, setRows] = useState<AttendanceRow[]>([]);

  useEffect(() => {
    const myGroups =
      session?.role === "teacher" ? GROUPS.filter((g) => g.teacherId === session.personId) : GROUPS;
    const ids = new Set(myGroups.map((g) => g.id));
    const refresh = () => {
      setRows(
        liveAttendance()
          .filter((r) => ids.has(r.groupId))
          .sort((a, b) => (a.date === b.date ? a.groupId.localeCompare(b.groupId) : a.date < b.date ? 1 : -1))
          .slice(0, 24),
      );
    };
    refresh();
    window.addEventListener(ATTENDANCE_CHANGED, refresh);
    return () => window.removeEventListener(ATTENDANCE_CHANGED, refresh);
  }, [session]);

  const canMark = session?.role === "teacher" || session?.role === "admin";
  const present = rows.reduce((s, r) => s + r.present, 0);
  const absent = rows.reduce((s, r) => s + r.absent, 0);
  const late = rows.reduce((s, r) => s + r.late, 0);
  const rate = present + absent === 0 ? 0 : (present / (present + absent)) * 100;
  const kpis = [
    { id: "sess", label: "Séances", value: String(rows.length), raw: rows.length, delta: null, hint: "" },
    { id: "p", label: "Présents", value: String(present), raw: present, delta: null, hint: "" },
    { id: "a", label: "Absents", value: String(absent), raw: absent, delta: null, hint: "" },
    { id: "r", label: "Taux", value: fmtPct(rate, 0), raw: rate, delta: null, hint: "" },
  ];

  return (
    <>
      <PageHead title={t.nav.attendance}>
        {canMark ? <PanelButton panel="attendance">{t.teacher.markAttendance}</PanelButton> : null}
      </PageHead>
      <div className="os-kpi-grid">
        {kpis.map((kpi) => (
          <KpiCard key={kpi.id} kpi={kpi} />
        ))}
      </div>
      <OsCard title={t.nav.attendance} hint={`${late} retard(s)`}>
        <div className="os-table-wrap">
          <table className="os-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Groupe</th>
                <th className="num">P</th>
                <th className="num">A</th>
                <th className="num">R</th>
                <th className="num">%</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const group = GROUPS.find((g) => g.id === row.groupId);
                return (
                  <tr key={`${row.groupId}-${row.date}`}>
                    <td>{fmtDate(row.date)}</td>
                    <td className="os-table-strong">{group?.name ?? row.groupId}</td>
                    <td className="num">{row.present}</td>
                    <td className="num">{row.absent}</td>
                    <td className="num">{row.late}</td>
                    <td className="num">{fmtPct(sessionAttendanceRate(row), 0)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </OsCard>
    </>
  );
}
