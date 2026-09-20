import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import {
  APPLICATIONS,
  CAMPUSES,
  INTAKES,
  PROGRAMS,
  fmtDate,
  type ApplicationStatus,
} from "../../_data";
import {
  APPLICATION_PIPELINE,
  APPLICATION_STATUS_FR,
  Badge,
  OsCard,
  PageHead,
  statusTone,
} from "../../_components/ui";
import { IcCheckCircle, IcClose } from "../../_components/icons";
import ApplicationActions from "./ApplicationActions";

type PageProps = { params: { id: string } };

type TimelineState = "done" | "current" | "todo" | "rejected";

type TimelineItem = {
  key: string;
  label: string;
  state: TimelineState;
  caption: string;
};

export function generateStaticParams() {
  return APPLICATIONS.map((a) => ({ id: a.id }));
}

export const dynamicParams = false;

export function generateMetadata({ params }: PageProps) {
  const application = APPLICATIONS.find((a) => a.id === params.id);
  return { title: application ? `${application.ref}, candidature` : "Candidature" };
}

function programName(programId: string) {
  return PROGRAMS.find((p) => p.id === programId)?.name ?? programId;
}

function campusName(campusId: string) {
  return CAMPUSES.find((c) => c.id === campusId)?.name ?? campusId;
}

function intakeName(intakeId: string) {
  return INTAKES.find((i) => i.id === intakeId)?.name ?? intakeId;
}

function timelineItems(status: ApplicationStatus): TimelineItem[] {
  if (status === "rejected") {
    return [
      { key: "new", label: APPLICATION_STATUS_FR.new, state: "done", caption: "Dossier reçu" },
      ...APPLICATION_PIPELINE.slice(1).map((key) => ({
        key,
        label: APPLICATION_STATUS_FR[key],
        state: "todo" as const,
        caption: "Non atteinte",
      })),
      { key: "rejected", label: APPLICATION_STATUS_FR.rejected, state: "rejected", caption: "Étape actuelle" },
    ];
  }

  const idx = APPLICATION_PIPELINE.indexOf(status);
  return APPLICATION_PIPELINE.map((key, i) => ({
    key,
    label: APPLICATION_STATUS_FR[key],
    state: (i < idx ? "done" : i === idx ? "current" : "todo") as TimelineState,
    caption: i < idx ? "Validée" : i === idx ? "Étape actuelle" : "À venir",
  }));
}

function Kv({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="os-kv">
      <dt>{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}

export default function ApplicationDetailPage({ params }: PageProps) {
  const application = APPLICATIONS.find((a) => a.id === params.id);
  if (!application) notFound();

  const program = programName(application.programId);
  const campus = campusName(application.campusId);
  const intake = intakeName(application.intakeId);
  const steps = timelineItems(application.status);
  const missing = application.missingDocs;

  return (
    <>
      <PageHead title={application.name}>
        <Badge tone={statusTone(application.status)}>{APPLICATION_STATUS_FR[application.status]}</Badge>
      </PageHead>

      <div className="os-profile">
        <div className="os-profile-cols">
          <OsCard title="Dossier">
            <div className="os-profile-id">
              <span className="os-avatar os-avatar-lg">{application.initials}</span>
              <div>
                <strong>{application.ref}</strong>
                <span>{application.country}</span>
              </div>
            </div>
            <dl className="os-kv-grid">
              <Kv label="Programme">{program}</Kv>
              <Kv label="Campus">{campus}</Kv>
              <Kv label="Session">{intake}</Kv>
              <Kv label="Déposé le">{fmtDate(application.submittedAt)}</Kv>
              <Kv label="Assigné à">{application.assignee}</Kv>
              <Kv label="Source">{application.source}</Kv>
            </dl>
          </OsCard>

          <OsCard title="À traiter">
            <ApplicationActions application={application} />
          </OsCard>
        </div>

        <div className="os-profile-cols">
          <OsCard title="Parcours du dossier">
            <ol className="os-stepper">
              {steps.map((step) => (
                <li key={step.key} className={`os-step is-${step.state}`}>
                  <span className="os-step-dot" aria-hidden="true" />
                  <strong>{step.label}</strong>
                  <span className="os-step-cap">{step.caption}</span>
                </li>
              ))}
            </ol>
          </OsCard>

          <OsCard
            title="Pièces"
            foot={
              missing.length
                ? `${missing.length} pièce${missing.length > 1 ? "s" : ""} manquante${missing.length > 1 ? "s" : ""}. Le dossier ne peut pas avancer.`
                : "Dossier complet."
            }
          >
            <div className="os-piece-list">
              {missing.length ? (
                missing.map((doc) => (
                  <div key={doc} className="os-piece is-missing">
                    <IcClose />
                    <span>{doc}</span>
                    <Badge tone="red">Manquante</Badge>
                  </div>
                ))
              ) : (
                <div className="os-piece is-ok">
                  <IcCheckCircle />
                  <span>Toutes les pièces sont au dossier.</span>
                </div>
              )}
            </div>
          </OsCard>
        </div>
      </div>
    </>
  );
}
