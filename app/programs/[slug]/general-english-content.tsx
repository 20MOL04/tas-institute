"use client";

import Link from "next/link";
import { useLang } from "../../LangProvider";
import PhotoFrame from "../../components/PhotoFrame";
import Faq from "../../components/Faq";
import { IconCheck } from "../../components/icons";
import type { CSSProperties } from "react";

// The one populated Program Detail page (brief: reusable template, only
// General English Course fully filled in as the example). Every section
// below follows the exact structure given in spec-uiux-master.txt under
// "PROGRAM DETAIL": Overview, Who is it for?, What you will learn,
// Curriculum, Requirements, What is included?, FAQ, CTA.
export default function GeneralEnglishContent() {
  const { t } = useLang();
  const p = t.programDetail.generalEnglish;

  return (
    <>
      <section className="section-tight hero-halo">
        <div className="container">
          <div className="small muted" style={{ marginBottom: "var(--space-2)" }}>
            <Link href="/programs">{t.programDetail.breadcrumbPrograms}</Link> / {p.title}
          </div>
          <div className="split" style={{ "--split-ratio": "1.1fr 1fr", alignItems: "center", gap: "var(--space-6)" } as CSSProperties}>
            <div className="stack">
              <span className="badge">{p.category}</span>
              <h1>{p.title}</h1>
              <div className="tag-list small muted">
                <span>
                  {t.programDetail.levelLabel}: {p.level}
                </span>
                <span>·</span>
                <span>
                  {t.programDetail.durationLabel}: {p.duration}
                </span>
              </div>
              <Link href="/apply" className="btn btn-primary" style={{ marginTop: "var(--space-2)", alignSelf: "start" }}>
                {t.common.applyNowCta}
              </Link>
            </div>
            <PhotoFrame src="/images/program-english-short.png" alt={p.heroImageAlt} ratio="4-3" priority />
          </div>
        </div>
      </section>

      {/* OVERVIEW */}
      <section className="section">
        <div className="container">
          <div className="section-head" style={{ maxWidth: 720 }}>
            <span className="eyebrow">{p.overviewEyebrow}</span>
            <h2>{p.overviewTitle}</h2>
            <p className="lede">{p.overviewText}</p>
          </div>
        </div>
      </section>

      {/* WHO IS IT FOR */}
      <section className="section section-alt">
        <div className="container">
          <h2 style={{ marginBottom: "var(--space-3)" }}>{p.whoTitle}</h2>
          <ul className="grid grid-2">
            {p.whoItems.map((item) => (
              <li key={item} style={{ display: "flex", gap: 10 }}>
                <span className="icon-check"><IconCheck /></span>
                <span className="small muted">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* WHAT YOU WILL LEARN */}
      <section className="section">
        <div className="container">
          <h2 style={{ marginBottom: "var(--space-3)" }}>{p.learnTitle}</h2>
          <ul className="grid grid-2">
            {p.learnItems.map((item) => (
              <li key={item} style={{ display: "flex", gap: 10 }}>
                <span className="icon-check"><IconCheck /></span>
                <span className="small muted">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* CURRICULUM */}
      <section className="section section-alt">
        <div className="container">
          <h2 style={{ marginBottom: "var(--space-3)" }}>{p.curriculumTitle}</h2>
          <div className="grid grid-3">
            {p.curriculumItems.map((item, i) => (
              <div key={item} className="card stack" style={{ gap: 6 }}>
                <span className="small" style={{ color: "var(--tas-blue)", fontWeight: 700 }}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p className="small muted">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* REQUIREMENTS */}
      <section className="section">
        <div className="container grid grid-2">
          <div>
            <h2 style={{ marginBottom: "var(--space-3)" }}>{p.requirementsTitle}</h2>
            <ul className="stack">
              {p.requirementsItems.map((item) => (
                <li key={item} style={{ display: "flex", gap: 10 }}>
                  <span className="icon-check"><IconCheck /></span>
                  <span className="small muted">{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 style={{ marginBottom: "var(--space-3)" }}>{p.includedTitle}</h2>
            <ul className="stack">
              {p.includedItems.map((item) => (
                <li key={item} style={{ display: "flex", gap: 10 }}>
                  <span className="icon-check"><IconCheck /></span>
                  <span className="small muted">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section section-alt">
        <div className="container" style={{ maxWidth: 780 }}>
          <h2 style={{ marginBottom: "var(--space-3)" }}>{p.faqTitle}</h2>
          <Faq items={p.faq} />
        </div>
      </section>

      {/* CTA */}
      <section className="section-navy section-tight">
        <div className="container" style={{ textAlign: "center" }}>
          <h2>{p.ctaTitle}</h2>
          <p className="lede" style={{ margin: "var(--space-2) auto", color: "var(--tas-on-navy-muted)" }}>
            {p.ctaText}
          </p>
          <Link href="/apply" className="btn btn-primary" style={{ marginTop: "var(--space-2)" }}>
            {t.common.applyNowCta}
          </Link>
        </div>
      </section>

      <div className="sticky-cta">
        <Link href="/apply" className="btn btn-primary">
          {t.common.applyNowCta}
        </Link>
      </div>
    </>
  );
}
