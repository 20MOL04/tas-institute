"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import OsDrawer from "./OsDrawer";
import { useOs, type OsPanel } from "./OsProvider";
import { useOsT } from "./useOsT";
import EnrollStudentForm from "../students/EnrollStudentForm";
import EnrollAdminForm from "./EnrollAdminForm";
import MarkAttendanceForm from "../attendance/MarkAttendanceForm";
import LeadCaptureForm from "./LeadCaptureForm";

export function PanelButton({
  panel,
  children,
  className = "os-btn os-btn-primary",
}: {
  panel: Exclude<OsPanel, null>;
  children: string;
  className?: string;
}) {
  const { openPanel } = useOs();
  return (
    <button type="button" className={className} onClick={() => openPanel(panel)}>
      {children}
    </button>
  );
}

export default function EnrollPanels() {
  const { t } = useOsT();
  const { panel, openPanel, closePanel, session } = useOs();
  const pathname = usePathname();
  const role = session?.role;

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.location.hash === "#inscrire" && role && role !== "teacher" && role !== "student") {
      openPanel("student");
    }
  }, [pathname, openPanel, role]);

  const studentOk = role && role !== "teacher" && role !== "student";
  const adminOk = role === "founder" || role === "director" || role === "superadmin";
  const attendanceOk = role === "teacher" || role === "admin";

  return (
    <>
      {studentOk ? (
        <OsDrawer open={panel === "student"} title={t.desk.enrollStudent} onClose={closePanel} fit>
          <EnrollStudentForm />
        </OsDrawer>
      ) : null}
      {adminOk ? (
        <OsDrawer open={panel === "admin"} title={t.ceo.createAdmin} onClose={closePanel} fit>
          <EnrollAdminForm />
        </OsDrawer>
      ) : null}
      {attendanceOk ? (
        <OsDrawer open={panel === "attendance"} title={t.teacher.markAttendance} onClose={closePanel} fit>
          <MarkAttendanceForm />
        </OsDrawer>
      ) : null}
      {studentOk ? (
        <OsDrawer open={panel === "lead"} title="Nouvelle demande" onClose={closePanel} fit>
          <LeadCaptureForm onDone={closePanel} />
        </OsDrawer>
      ) : null}
    </>
  );
}
