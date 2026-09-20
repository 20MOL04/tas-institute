"use client";

import Link from "next/link";
import { useLang } from "../LangProvider";
import PageHero from "../components/PageHero";
import PhotoFrame from "../components/PhotoFrame";
import StatsBand from "../components/StatsBand";
import { IconBook, IconGlobe, IconPeople, IconPin } from "../components/icons";
import { useSiteContent } from "../lib/useSiteContent";
import { whatsappUrlFromDisplay } from "../lib/siteStore";

const VALUE_ICONS = [IconBook, IconPeople, IconGlobe, IconPin];

const CAMPUS = [
  "/images/campus-video-thumbnail.png",
  "/images/classroom-1.jpg",
  "/images/computer-lab.jpg",
  "/images/library-study.jpg",
];

export default function AboutContent() {
  const { t } = useLang();
  const a = t.about;
  const site = useSiteContent();
  const wa = whatsappUrlFromDisplay(site.whatsapp);

  return (
    <>
      <PageHero src="/images/hero-about.png" alt="" eyebrow={a.heroEyebrow} title={a.heroTitle} subtitle={a.heroSubtitle} />

      {/* WHO IS TAS + HEADLINE FIGURES */}
      <section className="section">
        <div className="container">
          <div className="section-head-center reveal">
            <span className="sec-kicker">{a.whoEyebrow}</span>
            <h2>{a.whoTitle}</h2>
            <p className="lede">{a.whoText}</p>
          </div>
          <StatsBand />
        </div>
      </section>

      {/* WHY TAS — the school's own three arguments */}
      <section className="section section-alt">
        <div className="container">
          <div className="section-head-center reveal">
            <span className="sec-kicker">{a.whyEyebrow}</span>
            <h2>{a.whyTitle}</h2>
            <p className="lede">{a.whyText}</p>
          </div>
          <div className="home-cards-3 reveal reveal-stagger">
            {a.why.map((item, i) => {
              const Icon = VALUE_ICONS[i % VALUE_ICONS.length];
              return (
                <article key={item.title} className="card card-pad">
                  <span className="icon-badge">
                    <Icon />
                  </span>
                  <h3>{item.title}</h3>
                  <p className="small muted">{item.text}</p>
                </article>
              );
            })}
          </div>
          <div className="section-foot reveal">
            <Link href="/programs" className="btn btn-primary">
              {a.ctaButton}
            </Link>
          </div>
        </div>
      </section>

      {/* MISSION & VISION */}
      <section className="section section-glow">
        <div className="container">
          <div className="mv-split reveal">
            <PhotoFrame src="/images/gallery-campus.png" alt="" ratio="4-3" sizes="(max-width: 1023px) 92vw, 44vw" />
            <div className="mv-stack">
              <article className="card card-pad">
                <h3>{a.missionTitle}</h3>
                <p className="small muted">{a.missionText}</p>
              </article>
              <article className="card card-pad">
                <h3>{a.visionTitle}</h3>
                <p className="small muted">{a.visionText}</p>
              </article>
            </div>
          </div>
        </div>
      </section>

      {/* TEACHING APPROACH */}
      <section className="section section-navy">
        <div className="container">
          <div className="section-head-center reveal">
            <span className="sec-kicker">{a.philosophyEyebrow}</span>
            <h2>{a.philosophyTitle}</h2>
            <p className="lede">{a.philosophyText}</p>
          </div>
          <ol className="step-rail step-rail-3 reveal reveal-stagger">
            {a.philosophySteps.map((step, i) => (
              <li key={step.title}>
                <span className="sec-step">{i + 1}</span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* VALUES */}
      <section className="section">
        <div className="container">
          <div className="section-head-center reveal">
            <span className="sec-kicker">{a.valuesEyebrow}</span>
            <h2>{a.valuesTitle}</h2>
          </div>
          <ul className="feature-strip feature-strip-4 reveal reveal-stagger">
            {a.values.map((value, i) => {
              const Icon = VALUE_ICONS[i % VALUE_ICONS.length];
              return (
                <li key={value.title}>
                  <span className="icon-badge">
                    <Icon />
                  </span>
                  <div>
                    <strong>{value.title}</strong>
                    <span>{value.text}</span>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* CAMPUS */}
      <section className="section section-alt">
        <div className="container">
          <div className="section-head-center reveal">
            <span className="sec-kicker">{a.campusEyebrow}</span>
            <h2>{a.campusTitle}</h2>
            <p className="lede">{a.campusText}</p>
          </div>
          <div className="home-mosaic reveal reveal-stagger">
            {CAMPUS.map((src) => (
              <div key={src} className="card card-hover">
                <PhotoFrame src={src} alt="" sizes="(max-width: 1023px) 50vw, 33vw" />
              </div>
            ))}
          </div>
          <div className="section-foot reveal">
            <Link href="/gallery" className="btn btn-secondary">
              {t.gallery.heroEyebrow}
            </Link>
          </div>
        </div>
      </section>

      {/* TEAM TEASER */}
      <section className="section">
        <div className="container">
          <div className="section-head-center reveal">
            <span className="sec-kicker">{a.teachersEyebrow}</span>
            <h2>{a.teachersTitle}</h2>
            <p className="lede">{a.teachersText}</p>
            <Link href="/teachers" className="btn btn-primary">
              {a.teachersCta}
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section section-navy">
        <div className="container">
          <div className="section-head-center reveal" style={{ marginBottom: 0 }}>
            <span className="sec-kicker">{a.journeyEyebrow}</span>
            <h2>{a.ctaTitle}</h2>
            <p className="lede">{a.ctaText}</p>
            <div className="steps-actions">
              <Link href="/apply" className="btn btn-primary">
                {t.common.applyNowCta}
              </Link>
              <a href={wa} className="btn btn-outline-white" target="_blank" rel="noopener noreferrer">
                {t.common.whatsappCta}
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
