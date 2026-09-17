"use client";

import { useLang } from "../LangProvider";
import PhotoFrame from "../components/PhotoFrame";

const IMAGES = ["/images/teacher-1.jpg", "/images/teacher-2.jpg", "/images/teacher-3.jpg"];

export default function TeachersContent() {
  const { t } = useLang();

  return (
    <>
      <section className="section-tight hero-halo">
        <div className="container">
          <div className="section-head center">
            <span className="eyebrow">{t.teachers.heroEyebrow}</span>
            <h1>{t.teachers.heroTitle}</h1>
            <p className="lede">{t.teachers.heroSubtitle}</p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="grid grid-3">
            {t.teachers.list.map((teacher, i) => (
              <div key={teacher.name} className="card card-hover stack">
                <PhotoFrame src={IMAGES[i]} alt={teacher.imageAlt} ratio="1-1" className="stack" />
                <h3>{teacher.name}</h3>
                <span className="badge">{teacher.specialty}</span>
                <p className="small muted">{teacher.bio}</p>
                <p className="small" style={{ color: "#8a93a3" }}>
                  {t.teachers.experienceNote}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
