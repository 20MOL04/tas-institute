"use client";

import { useEffect, useState } from "react";
import {
  ATTENDANCE,
  CAMPUSES,
  DOCUMENTS,
  GROUPS,
  PAYMENTS,
  PROGRAMS,
  SCHOOLS,
  TEACHERS,
  readExtraStudents,
  type Student,
} from "../../_data";
import { Badge, PageHead, PAYMENT_STATUS_FR, STUDENT_STATUS_FR, statusTone } from "../../_components/ui";
import StudentTabs from "./StudentTabs";

export default function LiveStudentProfile({ id }: { id: string }) {
  const [student, setStudent] = useState<Student | null | undefined>(undefined);

  useEffect(() => {
    setStudent(readExtraStudents().find((s) => s.id === id) ?? null);
  }, [id]);

  if (student === undefined) return <p className="os-muted">Chargement du dossier.</p>;
  if (!student) return <p className="os-empty">Dossier introuvable.</p>;

  const program = PROGRAMS.find((p) => p.id === student.programId);
  const group = GROUPS.find((g) => g.id === student.groupId);
  const teacher = group ? TEACHERS.find((t) => t.id === group.teacherId) : undefined;
  const campus = CAMPUSES.find((c) => c.id === student.campusId);
  const school = SCHOOLS.find((s) => s.id === student.schoolId);
  const payments = PAYMENTS.filter((p) => p.studentId === student.id);
  const documents = DOCUMENTS.filter((d) => d.matricule === student.matricule);
  const attendance = ATTENDANCE.filter((row) => row.groupId === student.groupId);

  return (
    <>
      <PageHead title={student.name}>
        <Badge tone={statusTone(student.status)}>{STUDENT_STATUS_FR[student.status]}</Badge>
        <Badge tone={statusTone(student.paymentStatus)}>{PAYMENT_STATUS_FR[student.paymentStatus]}</Badge>
      </PageHead>
      <StudentTabs
        student={student}
        programName={program?.name ?? student.programId}
        groupName={group?.name ?? student.groupId}
        groupRoom={group?.room ?? ""}
        groupSchedule={group?.schedule ?? ""}
        teacherName={teacher?.name ?? ""}
        campusName={campus?.name ?? ""}
        schoolName={school?.short ?? ""}
        payments={payments}
        documents={documents}
        attendance={attendance}
      />
    </>
  );
}
