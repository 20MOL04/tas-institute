"use client";

import Link from "next/link";
import { useLang } from "../LangProvider";
import PhotoFrame from "../components/PhotoFrame";
import type { CSSProperties } from "react";

// Brief rule 9 / spec rule 9: never invent testimonials or results. This
// page shows the intended layout fully styled, but every piece of story
// copy is a visible, labeled placeholder ("Example — replace with a real
// student story") rather than a fabricated testimonial presented as real.
export default function StudentStoriesContent() {
  const { t } = useLang();
  const f = t.stories.featured;

  return (
    <>
      <section className="section-tight hero-halo">
        <div className="container">
          <div className="section-head center">
            <span className="eyebrow">{t.stories.heroEyebrow}</span>
            <h1>{t.stories.heroTitle}</h1>
            <p className="lede">{t.stories.heroSubtitle}</p>
          </div>
        </div>
      </section>

      {/* FEATURED STORY */}
      <section className="section">
        <div className="container">
          <div className="stack" style={{ gap: "var(--space-2)", marginBottom: "var(--space-3)" }}>
            <span className="eyebrow">{t.stories.featuredTitle}</span>
            <span className="placeholder-note">{t.stories.placeholderLabel}</span>
          </div>

          <div className="card split" style={{ "--split-ratio": "1fr 1.2fr", gap: "var(--space-5)", padding: "var(--space-4)" } as CSSProperties}>
            <PhotoFrame src="/images/student-story-1.jpg" alt={f.imageAlt} ratio="4-3" />
            <div className="stack">
              <div className="grid grid-2 small muted">
                <span>
                  {f.studentLabel}: {f.studentPlaceholder}
                </span>
                <span>
                  {f.countryLabel}: {f.countryPlaceholder}
                </span>
                <span>
                  {f.programLabel}: {f.programPlaceholder}
                </span>
                <span>
                  {f.durationLabel}: {f.durationPlaceholder}
                </span>
              </div>

              <hr className="divider" />

              <div>
                <h3>{f.challengeTitle}</h3>
                <p className="small muted">{f.challengeText}</p>
              </div>
              <div>
                <h3>{f.experienceTitle}</h3>
                <p className="small muted">{f.experienceText}</p>
              </div>
              <div>
                <h3>{f.transformationTitle}</h3>
                <p className="small muted">{f.transformationText}</p>
              </div>

              <blockquote
                className="small"
                style={{
                  borderLeft: "2px solid var(--tas-accent-2)",
                  paddingLeft: "var(--space-2)",
                  color: "#455061",
                  fontStyle: "italic",
                  margin: 0,
                }}
              >
                {f.quotePlaceholder}
              </blockquote>
            </div>
          </div>
        </div>
      </section>

      {/* OTHER STORIES */}
      <section className="section section-alt">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">{t.stories.otherTitle}</span>
          </div>
          <div className="grid grid-3">
            {t.stories.other.map((story, i) => (
              <div key={story.studentPlaceholder + i} className="card card-hover stack">
                <PhotoFrame src="/images/student-story-2.jpg" alt={story.imageAlt} ratio="4-3" />
                <span className="placeholder-note">{t.stories.placeholderLabel}</span>
                <h3 style={{ fontSize: "1rem" }}>{story.studentPlaceholder}</h3>
                <p className="small muted">{story.programPlaceholder}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-navy section-tight">
        <div className="container" style={{ textAlign: "center" }}>
          <h2>{t.stories.ctaTitle}</h2>
          <Link href="/apply" className="btn btn-primary" style={{ marginTop: "var(--space-3)" }}>
            {t.stories.ctaButton}
          </Link>
        </div>
      </section>
    </>
  );
}
