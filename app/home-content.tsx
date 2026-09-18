"use client";

import Link from "next/link";
import { useLang } from "./LangProvider";
import PhotoFrame from "./components/PhotoFrame";
import Avatar from "./components/Avatar";
import AccentTitle from "./components/AccentTitle";
import { IconBook, IconPeople, IconPin, IconGlobe } from "./components/icons";
import type { CSSProperties } from "react";

// Matches the order of t.home.trustItems — positional, not content-driven,
// since the icon a card needs depends on which of the four fixed trust
// topics it is, not on translated text.
const TRUST_ICONS = [IconBook, IconPeople, IconPin, IconGlobe];

// Purely decorative — represents "a community" in the abstract, the same
// way the reference mockup's hero avatar row does. No name is ever shown
// anywhere in the UI, only the two-letter initial each renders, so this
// never claims to depict specific real people (unlike the Teachers/
// Student Stories placeholder-note cases, which do carry visible names
// and so need explicit "example" disclosure instead).
const COMMUNITY_AVATARS = ["A B", "C D", "E F", "G H"];

export default function HomeContent() {
  const { t } = useLang();

  return (
    <>
      {/* HERO */}
      <section className="hero-halo section" style={{ paddingTop: "var(--space-8)" }}>
        <div className="container split" style={{ "--split-ratio": "1.1fr 1fr", alignItems: "center", gap: "var(--space-6)" } as CSSProperties}>
          <div className="stack" style={{ gap: "var(--space-3)" }}>
            <span className="eyebrow">{t.home.heroEyebrow}</span>
            <h1>
              <AccentTitle title={t.home.heroTitle} word={t.home.heroAccentWord} />
            </h1>
            <p className="lede">{t.home.heroSubtitle}</p>
            <div className="tag-list" style={{ marginTop: "var(--space-2)" }}>
              <Link href="/programs" className="btn btn-primary">
                {t.home.heroCtaPrimary}
              </Link>
              <Link href="/apply" className="btn btn-secondary">
                {t.home.heroCtaSecondary}
              </Link>
            </div>
            <div className="ligne" style={{ display: "flex", alignItems: "center", gap: 12, marginTop: "var(--space-2)" }}>
              <span style={{ display: "flex" }}>
                {COMMUNITY_AVATARS.map((n, i) => (
                  <Avatar key={n} name={n} size={30} overlap={i > 0} />
                ))}
              </span>
              <span className="small muted">{t.home.communityNote}</span>
            </div>
          </div>
          <PhotoFrame
            src="/images/hero-home.jpg"
            alt={t.home.heroImageAlt}
            ratio="4-3"
            priority
            sizes="(max-width: 780px) 100vw, 50vw"
          />
        </div>
      </section>

      {/* TRUST */}
      <section className="section-tight">
        <div className="container">
          <div className="section-head center">
            <span className="eyebrow">{t.home.trustEyebrow}</span>
            <h2>{t.home.trustTitle}</h2>
          </div>
          <div className="grid grid-4">
            {t.home.trustItems.map((item, i) => {
              const Icon = TRUST_ICONS[i % TRUST_ICONS.length];
              return (
                <div key={item.title} className="card">
                  <span className="icon-badge">
                    <Icon />
                  </span>
                  <h3 style={{ marginTop: 12 }}>{item.title}</h3>
                  <p className="small muted" style={{ marginTop: 8 }}>
                    {item.text}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* PROGRAMS PREVIEW */}
      <section className="section section-alt">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">{t.home.programsEyebrow}</span>
            <h2>{t.home.programsTitle}</h2>
            <p className="lede">{t.home.programsSubtitle}</p>
          </div>
          <div className="grid grid-2">
            <div className="card card-hover stack">
              <span className="badge">English</span>
              <h3>{t.home.programCategory1Title}</h3>
              <p className="small muted">{t.home.programCategory1Text}</p>
              <Link href="/programs" className="btn-ghost small" style={{ marginTop: 4 }}>
                {t.common.learnMore} →
              </Link>
            </div>
            <div className="card card-hover stack">
              <span className="badge badge-gold">Computer &amp; Professional</span>
              <h3>{t.home.programCategory2Title}</h3>
              <p className="small muted">{t.home.programCategory2Text}</p>
              <Link href="/programs" className="btn-ghost small" style={{ marginTop: 4 }}>
                {t.common.learnMore} →
              </Link>
            </div>
          </div>
          <div style={{ marginTop: "var(--space-4)", textAlign: "center" }}>
            <Link href="/programs" className="btn btn-secondary">
              {t.home.programsCta}
            </Link>
          </div>
        </div>
      </section>

      {/* WHY TAS */}
      <section className="section">
        <div className="container">
          <div className="section-head center">
            <span className="eyebrow">{t.home.whyEyebrow}</span>
            <h2>{t.home.whyTitle}</h2>
          </div>
          <div className="grid grid-4">
            {t.home.whyItems.map((item) => (
              <div key={item.title} className="stack" style={{ gap: 6 }}>
                <span className="icon-check">✓</span>
                <h3>{item.title}</h3>
                <p className="small muted">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* LEARNING EXPERIENCE */}
      <section className="section section-alt">
        <div className="container split" style={{ "--split-ratio": "1fr 1fr", alignItems: "center", gap: "var(--space-6)" } as CSSProperties}>
          <PhotoFrame
            src="/images/classroom-1.jpg"
            alt="Salle de classe, étudiants en discussion de groupe"
            ratio="4-3"
          />
          <div className="stack">
            <span className="eyebrow">{t.home.experienceEyebrow}</span>
            <h2>{t.home.experienceTitle}</h2>
            <p className="lede">{t.home.experienceText}</p>
          </div>
        </div>
      </section>

      {/* STUDENT STORY PREVIEW */}
      <section className="section">
        <div className="container">
          <div className="section-head center">
            <span className="eyebrow">{t.home.storyEyebrow}</span>
            <h2>{t.home.storyTitle}</h2>
            <p className="lede">{t.home.storyText}</p>
          </div>
          <div style={{ textAlign: "center" }}>
            <Link href="/student-stories" className="btn btn-secondary">
              {t.home.storyCta}
            </Link>
          </div>
        </div>
      </section>

      {/* TEACHERS PREVIEW */}
      <section className="section section-alt">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">{t.home.teachersEyebrow}</span>
            <h2>{t.home.teachersTitle}</h2>
            <span className="placeholder-note">{t.teachers.placeholderLabel}</span>
          </div>
          <div className="grid grid-3">
            {t.teachers.list.map((teacher) => (
              <div key={teacher.name} className="card" style={{ display: "flex", gap: "var(--space-2)", alignItems: "center" }}>
                <Avatar name={teacher.name} />
                <div>
                  <h3 style={{ fontSize: "1rem" }}>{teacher.name}</h3>
                  <p className="small muted">{teacher.specialty}</p>
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: "var(--space-4)", textAlign: "center" }}>
            <Link href="/teachers" className="btn btn-secondary">
              {t.home.teachersCta}
            </Link>
          </div>
        </div>
      </section>

      {/* CAMPUS */}
      <section className="section">
        <div className="container split" style={{ "--split-ratio": "1fr 1fr", alignItems: "center", gap: "var(--space-6)" } as CSSProperties}>
          <div className="stack">
            <span className="eyebrow">{t.home.campusEyebrow}</span>
            <h2>{t.home.campusTitle}</h2>
            <p className="lede">{t.home.campusText}</p>
          </div>
          <PhotoFrame
            src="/images/group-outdoor.jpg"
            alt="Groupe d'étudiants en extérieur, ambiance décontractée"
            ratio="3-2"
          />
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="section-navy section-tight">
        <div className="container" style={{ textAlign: "center" }}>
          <h2>{t.home.finalCtaTitle}</h2>
          <p className="lede" style={{ margin: "var(--space-2) auto", color: "var(--tas-on-navy-muted)" }}>
            {t.home.finalCtaText}
          </p>
          <Link href="/apply" className="btn btn-primary" style={{ marginTop: "var(--space-2)" }}>
            {t.home.finalCtaButton}
          </Link>
        </div>
      </section>
    </>
  );
}
