"use client";

import { useLang } from "../LangProvider";
import PageHero from "../components/PageHero";
import PhotoFrame from "../components/PhotoFrame";

const IMAGES = ["/images/teacher-1.jpg", "/images/teacher-2.jpg", "/images/teacher-3.jpg"];

// Brief rule 9 / spec rule 9: never invent named people. These three
// profiles are plausible examples of the page's intended layout, not real
// staff — same rule Student Stories already follows. Each card now carries
// the same visible .placeholder-note used there, instead of presenting
// invented names, specialties and bios as if they were real hires.
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
          <div className="grid grid-3">
            {t.teachers.list.map((teacher, i) => (
              <div key={teacher.name} className="card card-hover">
                <PhotoFrame src={IMAGES[i]} alt={teacher.imageAlt} ratio="1-1" />
                <div className="card-body">
                  <span className="placeholder-note">{t.teachers.placeholderLabel}</span>
                  <h3>{teacher.name}</h3>
                  <span className="badge">{teacher.specialty}</span>
                  <p className="small muted">{teacher.bio}</p>
                  <p className="small" style={{ color: "var(--tas-gray-mid)" }}>
                    {t.teachers.experienceNote}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
