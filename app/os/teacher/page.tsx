"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ATTENDANCE_TREND, GROUPS, STUDENTS, TEACHERS, TIMELINE, type Kpi } from "../_data";
import { KpiCard, LineChart, OsCard, PageHead } from "../_components/ui";
import { PanelButton } from "../_components/EnrollPanels";
import { useOs } from "../_components/OsProvider";
import { useOsT } from "../_components/useOsT";
import PeriodSelector, { usePeriodState } from "../_components/PeriodSelector";
import { monthOverlaps } from "../_lib/period";

export default function TeacherHome() {
  const { t } = useOsT();
  const { session } = useOs();
  const { period, customStart, customEnd, range, onApply } = usePeriodState("thisYear");
  const teacher = TEACHERS.find((x) => x.id === session?.personId) ?? TEACHERS[0];
  const groups = GROUPS.filter((g) => g.teacherId === teacher.id);
  const mine = STUDENTS.filter((s) => groups.some((g) => g.id === s.groupId) && s.status === "active");

  const avgAtt = mine.length ? mine.reduce((s, st) => s + st.attendanceRate, 0) / mine.length : 0;
  const avgGrade = mine.length ? mine.reduce((s, st) => s + st.averageGrade, 0) / mine.length : 0;

  const chart = useMemo(() => {
    const idxs = TIMELINE.map((row, i) => (monthOverlaps(row.key, range.start, range.end) ? i : -1)).filter((i) => i >= 0);
    const rows = idxs.length ? idxs.map((i) => ATTENDANCE_TREND[i]).filter(Boolean) : ATTENDANCE_TREND;
    return {
      labels: rows.map((row) => row.label),
      values: rows.map((row) => row.value),
    };
  }, [range]);

  const kpis: Kpi[] = [
    {
      id: "g",
      label: t.nav.groups,
      value: String(groups.length),
      raw: groups.length,
      delta: null,
      hint: "",
    },
    {
      id: "s",
      label: t.nav.students,
      value: String(mine.length),
      raw: mine.length,
      delta: null,
      hint: "",
    },
    {
      id: "att",
      label: t.nav.attendance,
      value: `${Math.round(avgAtt)} %`,
      raw: avgAtt,
      delta: null,
      hint: "",
    },
    {
      id: "gr",
      label: t.nav.grades,
      value: avgGrade.toFixed(1),
      raw: avgGrade,
      delta: null,
      hint: "",
    },
  ];

  return (
    <>
      <PageHead title={teacher.name}>
        <PeriodSelector period={period} customStart={customStart} customEnd={customEnd} onApply={onApply} />
      </PageHead>
      <div className="os-tiles">
        <PanelButton panel="attendance" className="os-tile">
          {t.teacher.markAttendance}
        </PanelButton>
        <Link href="/os/teacher/evaluations" className="os-tile">
          {t.teacher.enterGrades}
        </Link>
        <Link href="/os/groups" className="os-tile">
          {t.teacher.myGroups}
        </Link>
        <Link href="/os/attendance" className="os-tile">
          {t.nav.attendance}
        </Link>
      </div>
      <div className="os-kpi-grid">
        {kpis.map((k) => (
          <KpiCard key={k.id} kpi={k} />
        ))}
      </div>
      <OsCard title={t.nav.attendance}>
        <LineChart
          labels={chart.labels}
          series={[{ label: t.nav.attendance, values: chart.values, color: "#1d4ed8" }]}
          height={280}
          filled
        />
      </OsCard>
      <OsCard title={t.nav.groups}>
        {groups.map((g) => (
          <Link key={g.id} href="/os/groups" className="os-link-row">
            <strong>{g.name}</strong>
            <span className="os-tile-meta">
              {g.room}, {g.schedule}
            </span>
          </Link>
        ))}
      </OsCard>
    </>
  );
}
