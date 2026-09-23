"use client";

import Link from "next/link";
import { useLang } from "../LangProvider";
import PageHero from "../components/PageHero";
import PhotoFrame from "../components/PhotoFrame";
import type { CSSProperties } from "react";

export default function UniversityGuidanceContent() {
  const { t } = useLang();

  return (
    <>
      <PageHero
        src="/images/hero-university.jpg"
        alt=""
        eyebrow={t.universityGuidance.heroEyebrow}
        title={t.universityGuidance.heroTitle}
        subtitle={t.universityGuidance.heroSubtitle}
        objectPosition="68% 46%"
      />

      <section className="section">
        <div className="container">
          <div className="section-head center">
            <h2>{t.universityGuidance.stepsTitle}</h2>
          </div>
          <div className="grid grid-4">
            {t.universityGuidance.steps.map((step, i) => (
              <div key={step.title} className="card stack">
                <span className="badge">{String(i + 1).padStart(2, "0")}</span>
                <h3 style={{ fontSize: "1.05rem" }}>{step.title}</h3>
                <p className="small muted">{step.text}</p>
              </div>
            ))}
          </div>
          <p style={{ marginTop: "var(--space-4)", textAlign: "center" }}>
            <span className="placeholder-note">{t.universityGuidance.note}</span>
          </p>
        </div>
      </section>

      <section className="section section-alt">
        <div
          className="container split"
          style={{ "--split-ratio": "1fr 1fr", alignItems: "center", gap: "var(--space-6)" } as CSSProperties}
        >
          <PhotoFrame src="/images/library-study.jpg" alt="" ratio="4-3" />
          <div className="stack">
            <h2>{t.universityGuidance.ctaTitle}</h2>
            <p className="lede">{t.home.heroSubtitle}</p>
            <Link href="/apply" className="btn btn-primary" style={{ alignSelf: "start" }}>
              {t.universityGuidance.ctaButton}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
