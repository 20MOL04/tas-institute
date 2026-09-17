"use client";

import Link from "next/link";
import { useLang } from "../LangProvider";
import PhotoFrame from "../components/PhotoFrame";
import type { CSSProperties } from "react";

export default function AboutContent() {
  const { t } = useLang();

  return (
    <>
      <section className="section-tight hero-halo">
        <div className="container">
          <div className="section-head center">
            <span className="eyebrow">{t.about.heroEyebrow}</span>
            <h1>{t.about.heroTitle}</h1>
            <p className="lede">{t.about.heroSubtitle}</p>
          </div>
          <PhotoFrame
            src="/images/about-campus.jpg"
            alt="Extérieur du bâtiment de l'école"
            ratio="21-9"
          />
        </div>
      </section>

      {/* WHO IS TAS */}
      <section className="section">
        <div className="container split" style={{ "--split-ratio": "1fr 1fr", alignItems: "center", gap: "var(--space-6)" } as CSSProperties}>
          <div className="stack">
            <span className="eyebrow">{t.about.whoEyebrow}</span>
            <h2>{t.about.whoTitle}</h2>
            <p className="lede">{t.about.whoText}</p>
          </div>
          <PhotoFrame src="/images/classroom-1.jpg" alt="Salle de classe, étudiants engagés" ratio="4-3" />
        </div>
      </section>

      {/* MISSION / VISION */}
      <section className="section section-alt">
        <div className="container grid grid-2">
          <div className="card stack">
            <h3>{t.about.missionTitle}</h3>
            <p className="small muted">{t.about.missionText}</p>
          </div>
          <div className="card stack">
            <h3>{t.about.visionTitle}</h3>
            <p className="small muted">{t.about.visionText}</p>
          </div>
        </div>
      </section>

      {/* VALUES */}
      <section className="section">
        <div className="container">
          <div className="section-head center">
            <span className="eyebrow">{t.about.valuesEyebrow}</span>
            <h2>{t.about.valuesTitle}</h2>
          </div>
          <div className="grid grid-4">
            {t.about.values.map((v) => (
              <div key={v.title} className="stack" style={{ gap: 6 }}>
                <span className="icon-check">✓</span>
                <h3>{v.title}</h3>
                <p className="small muted">{v.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PHILOSOPHY */}
      <section className="section section-alt">
        <div className="container">
          <div className="section-head" style={{ maxWidth: 720 }}>
            <span className="eyebrow">{t.about.philosophyEyebrow}</span>
            <h2>{t.about.philosophyTitle}</h2>
            <p className="lede">{t.about.philosophyText}</p>
          </div>
        </div>
      </section>

      {/* JOURNEY */}
      <section className="section">
        <div className="container">
          <div className="section-head" style={{ maxWidth: 720 }}>
            <span className="eyebrow">{t.about.journeyEyebrow}</span>
            <h2>{t.about.journeyTitle}</h2>
            <p className="lede">{t.about.journeyText}</p>
          </div>
        </div>
      </section>

      {/* CAMPUS */}
      <section className="section section-alt">
        <div className="container split" style={{ "--split-ratio": "1fr 1fr", alignItems: "center", gap: "var(--space-6)" } as CSSProperties}>
          <PhotoFrame src="/images/library-study.jpg" alt="Espace bibliothèque, étudiants concentrés" ratio="4-3" />
          <div className="stack">
            <span className="eyebrow">{t.about.campusEyebrow}</span>
            <h2>{t.about.campusTitle}</h2>
            <p className="lede">{t.about.campusText}</p>
          </div>
        </div>
      </section>

      {/* TEACHERS TEASER */}
      <section className="section">
        <div className="container">
          <div className="section-head center">
            <span className="eyebrow">{t.about.teachersEyebrow}</span>
            <h2>{t.about.teachersTitle}</h2>
            <p className="lede">{t.about.teachersText}</p>
          </div>
          <div style={{ textAlign: "center" }}>
            <Link href="/teachers" className="btn btn-secondary">
              {t.about.teachersCta}
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-navy section-tight">
        <div className="container" style={{ textAlign: "center" }}>
          <h2>{t.about.ctaTitle}</h2>
          <p className="lede" style={{ margin: "var(--space-2) auto", color: "rgba(255,255,255,0.75)" }}>
            {t.about.ctaText}
          </p>
          <Link href="/programs" className="btn btn-primary" style={{ marginTop: "var(--space-2)" }}>
            {t.about.ctaButton}
          </Link>
        </div>
      </section>
    </>
  );
}
