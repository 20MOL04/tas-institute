"use client";

import { useLang } from "../LangProvider";
import PageHero from "../components/PageHero";
import PhotoFrame from "../components/PhotoFrame";
import { TEACHER_PHOTOS } from "../components/TeacherMarquee";
import FinalCta from "../components/FinalCta";

// Vraies photos de l'équipe (même liste que la bande défilante de l'accueil).
// Pas de noms ni de biographies tant que l'école ne les a pas fournis.
export default function TeachersContent() {
  const { t } = useLang();

  return (
    <>
      <PageHero
        src="/images/hero-teachers.jpg"
        alt=""
        eyebrow={t.teachers.heroEyebrow}
        title={t.teachers.heroTitle}
        subtitle={t.teachers.heroSubtitle}
        objectPosition="68% 8%"
      />

      <section className="section">
        <div className="container">
          <div className="section-head-center">
            <h2>{t.teachers.teamTitle}</h2>
            <p className="lede">{t.teachers.teamText}</p>
          </div>
          <div className="team-grid">
            {TEACHER_PHOTOS.map((src) => (
              <div key={src} className="card card-hover">
                <PhotoFrame
                  src={src}
                  alt={t.teachers.photoAlt}
                  ratio="4-5"
                  sizes="(max-width: 767px) 50vw, 25vw"
                  className="is-face"
                />
              </div>
            ))}
          </div>
        </div>
      </section>
      <FinalCta image="/images/tas/graduation-class-hall.jpg" />
    </>
  );
}
