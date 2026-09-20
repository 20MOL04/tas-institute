import type { Metadata } from "next";
import {
  ATTENDANCE,
  CAMPUSES,
  DOCUMENTS,
  GROUPS,
  PAYMENTS,
  PROGRAMS,
  SCHOOLS,
  STUDENTS,
  TEACHERS,
} from "../../_data";
import { DemoBanner, PageHead, Badge, PAYMENT_STATUS_FR, STUDENT_STATUS_FR, statusTone } from "../../_components/ui";
import LiveStudentProfile from "./LiveStudentProfile";
import StudentTabs from "./StudentTabs";

export function generateStaticParams() {
  return STUDENTS.map((s) => ({ id: s.id }));
}

export function generateMetadata({ params }: { params: { id: string } }): Metadata {
  const student = STUDENTS.find((s) => s.id === params.id);
  return { title: student ? student.name : "Étudiant" };
}

export default function StudentProfilePage({ params }: { params: { id: string } }) {
  const student = STUDENTS.find((s) => s.id === params.id);
  if (!student) return <LiveStudentProfile id={params.id} />;

  const program = PROGRAMS.find((p) => p.id === student.programId);
  const group = GROUPS.find((g) => g.id === student.groupId);
  const teacher = group ? TEACHERS.find((t) => t.id === group.teacherId) : undefined;
  const campus = CAMPUSES.find((c) => c.id === student.campusId);
  const school = SCHOOLS.find((s) => s.id === student.schoolId);
  const payments = PAYMENTS.filter((p) => p.studentId === student.id).sort((a, b) => (a.date < b.date ? 1 : -1));
  const documents = DOCUMENTS.filter((d) => d.matricule === student.matricule);
  const attendance = ATTENDANCE.filter((row) => row.groupId === student.groupId).sort((a, b) =>
    a.date < b.date ? 1 : -1,
  );

  return (
    <>
      <DemoBanner />
      <PageHead title={student.name}>
        <Badge tone={statusTone(student.status)}>{STUDENT_STATUS_FR[student.status]}</Badge>
        <Badge tone={statusTone(student.paymentStatus)}>{PAYMENT_STATUS_FR[student.paymentStatus]}</Badge>
      </PageHead>
      <StudentTabs
        student={student}
        programName={program?.name ?? "Non indiqué"}
        groupName={group?.name ?? "Non indiqué"}
        groupRoom={group?.room ?? "Non indiquée"}
        groupSchedule={group?.schedule ?? "Non indiqués"}
        teacherName={teacher?.name ?? "Non indiqué"}
        campusName={campus?.name ?? "Non indiqué"}
        schoolName={school?.short ?? "Non indiquée"}
        payments={payments}
        documents={documents}
        attendance={attendance}
      />
    </>
  );
}
