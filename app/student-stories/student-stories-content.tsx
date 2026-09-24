"use client";

import Link from "next/link";
import { useLang } from "../LangProvider";
import PageHero from "../components/PageHero";
import PhotoFrame from "../components/PhotoFrame";
import TestimonialSlider from "../components/TestimonialSlider";
import { GRADUATION_PHOTOS, PUBLISHED_TESTIMONIALS } from "../lib/testimonials";
import CtaBackdrop from "../components/CtaBackdrop";

// Uniquement des témoignages et photos réels, fournis par l'école (lib/testimonials.ts).
export default function StudentStoriesContent() {
  const { t, lang } = useLang();

  return (
    <>
      <PageHero
        src="/images/hero-stories.jpg"
        alt=""
        eyebrow={t.stories.heroEyebrow}
        title={t.stories.heroTitle}
        subtitle={t.stories.heroSubtitle}
        objectPosition="70% 58%"
      />

      <section className="section">
        <div className="container">
          <div className="section-head-center">
            <h2>{t.stories.testimonialsTitle}</h2>
            <p className="lede">{t.stories.testimonialsText}</p>
          </div>
          <TestimonialSlider items={PUBLISHED_TESTIMONIALS} />
        </div>
      </section>

      <section className="section section-alt">
        <div className="container">
          <div className="section-head-center">
            <h2>{t.stories.graduationTitle}</h2>
            <p className="lede">{t.stories.graduationText}</p>
          </div>
          <div className="graduation-grid">
            {GRADUATION_PHOTOS.map((photo) => (
              <div key={photo.src} className="card">
                <PhotoFrame
                  src={photo.src}
                  alt={lang === "fr" ? photo.altFr : photo.altEn}
                  ratio="1-1"
                  sizes="(max-width: 767px) 46vw, 33vw"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-navy section-tight cta-photo">
        <CtaBackdrop src="/images/tas/graduation-diploma-3.jpg" />
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
