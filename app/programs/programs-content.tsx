"use client";

import Link from "next/link";
import { useLang } from "../LangProvider";
import PhotoFrame from "../components/PhotoFrame";
import type { CSSProperties } from "react";

export default function ProgramsContent() {
  const { t } = useLang();

  const englishPrograms = t.programs.programs.filter((p) => p.category === "english");
  const computerPrograms = t.programs.programs.filter((p) => p.category === "computer");

  return (
    <>
      <section className="section-tight hero-halo">
        <div className="container">
          <div className="section-head center">
            <span className="eyebrow">{t.programs.heroEyebrow}</span>
            <h1>{t.programs.heroTitle}</h1>
            <p className="lede">{t.programs.heroSubtitle}</p>
          </div>
          <PhotoFrame src="/images/library-study.jpg" alt="Espace d'étude, étudiants concentrés" ratio="21-9" />
        </div>
      </section>

      <section className="section-tight">
        <div className="container">
          <span className="placeholder-note">{t.programs.exampleNote}</span>
        </div>
      </section>

      {/* CATEGORY 1 — ENGLISH */}
      <section className="section">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">{t.programs.category1Eyebrow}</span>
            <h2>{t.programs.category1Title}</h2>
            <p className="lede">{t.programs.category1Text}</p>
          </div>

          <div className="split" style={{ "--split-ratio": "1fr 1.4fr", gap: "var(--space-4)", marginBottom: "var(--space-4)" } as CSSProperties}>
            <PhotoFrame src="/images/classroom-2.jpg" alt="Enseignant devant un tableau blanc" ratio="4-3" />
            <div className="grid grid-2">
              {englishPrograms.map((program) => (
                <ProgramCard key={program.slug} program={program} t={t} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORY 2 — COMPUTER & PROFESSIONAL */}
      <section className="section section-alt">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">{t.programs.category2Eyebrow}</span>
            <h2>{t.programs.category2Title}</h2>
            <p className="lede">{t.programs.category2Text}</p>
          </div>

          <div className="split" style={{ "--split-ratio": "1fr 1.4fr", gap: "var(--space-4)" } as CSSProperties}>
            <PhotoFrame src="/images/computer-lab.jpg" alt="Salle informatique, étudiants sur ordinateur" ratio="4-3" />
            <div className="grid grid-2">
              {computerPrograms.map((program) => (
                <ProgramCard key={program.slug} program={program} t={t} />
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function ProgramCard({
  program,
  t,
}: {
  program: { slug: string; title: string; level: string; duration: string; description: string };
  t: ReturnType<typeof useLang>["t"];
}) {
  // Only General English Course has a fully populated detail page for now
  // (brief: "un seul programme rempli en exemple"). Rather than link the
  // other example programs to a route that would just say "not built yet",
  // we're upfront about it directly on the card — no dead link, no
  // pretend page.
  const hasDetailPage = program.slug === "general-english";

  return (
    <div className="card card-hover stack">
      <h3>{program.title}</h3>
      <p className="small muted">{program.description}</p>
      <div className="tag-list small muted">
        <span>
          {t.programs.levelLabel}: {program.level}
        </span>
      </div>
      {hasDetailPage ? (
        <Link href={`/programs/${program.slug}`} className="btn-ghost small" style={{ marginTop: 4 }}>
          {t.common.viewProgram} →
        </Link>
      ) : (
        <span className="small" style={{ marginTop: 4, color: "#8a93a3" }}>
          {t.common.exampleBadge}
        </span>
      )}
    </div>
  );
}
