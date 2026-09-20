"use client";

import Link from "next/link";
import { useLang } from "../LangProvider";
import PageHero from "../components/PageHero";
import PhotoFrame from "../components/PhotoFrame";
import StatsBand from "../components/StatsBand";
import { TAS_WHATSAPP_URL } from "../lib/contact";

export default function ProgramsContent() {
  const { t } = useLang();
  const p = t.programs;

  return (
    <>
      <PageHero src="/images/hero-programs.png" alt="" eyebrow={p.heroEyebrow} title={p.heroTitle} subtitle={p.heroSubtitle} />

      {/* OFFICIAL FIGURES */}
      <section className="section">
        <div className="container">
          <div className="section-head-center reveal">
            <span className="sec-kicker">{p.statsKicker}</span>
            <h2>{p.statsTitle}</h2>
            <p className="lede">{p.statsText}</p>
          </div>
          <StatsBand />
        </div>
      </section>

      {/* THE THREE COURSES */}
      <section className="section section-alt">
        <div className="container">
          <div className="section-head-center reveal">
            <span className="sec-kicker">{p.listKicker}</span>
            <h2>{p.listTitle}</h2>
            <p className="lede">{p.listText}</p>
          </div>
          <div className="home-cards-3 reveal reveal-stagger">
            {p.programs.map((program) => (
              <article key={program.slug} className="card card-hover">
                <PhotoFrame src={program.image} alt="" ratio="16-10" sizes="(max-width: 1023px) 78vw, 33vw" />
                <div className="card-body">
                  <h3>{program.title}</h3>
                  <p className="small muted">{program.description}</p>
                  <dl className="spec-list">
                    <div>
                      <dt>{p.hoursLabel}</dt>
                      <dd>{program.hours}</dd>
                    </div>
                    <div>
                      <dt>{p.levelLabel}</dt>
                      <dd>{program.level}</dd>
                    </div>
                  </dl>
                  <p className="small muted">{program.content}</p>
                </div>
              </article>
            ))}
          </div>
          <div className="section-foot reveal">
            <Link href="/apply" className="btn btn-primary">
              {p.ctaButton}
            </Link>
          </div>
        </div>
      </section>

      {/* ENGLISH SKILLS */}
      <section className="section section-glow">
        <div className="container">
          <div className="section-head-center reveal">
            <span className="sec-kicker">{p.skillsKicker}</span>
            <h2>{p.skillsTitle}</h2>
            <p className="lede">{p.skillsText}</p>
          </div>
          <ol className="skill-grid reveal reveal-stagger">
            {p.skills.map((skill, i) => (
              <li key={skill.title}>
                <span className="sec-step">{i + 1}</span>
                <div>
                  <strong>{skill.title}</strong>
                  <span>{skill.text}</span>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* COMPUTER MODULES */}
      <section className="section section-alt">
        <div className="container">
          <div className="section-head-center reveal">
            <span className="sec-kicker">{p.modulesKicker}</span>
            <h2>{p.modulesTitle}</h2>
            <p className="lede">{p.modulesText}</p>
          </div>
          <div className="module-split reveal">
            <PhotoFrame src="/images/program-computer.png" alt="" ratio="4-3" sizes="(max-width: 1023px) 92vw, 40vw" />
            <ol className="skill-grid skill-grid-1 reveal-stagger">
              {p.modules.map((module, i) => (
                <li key={module.title}>
                  <span className="sec-step">{i + 1}</span>
                  <div>
                    <strong>{module.title}</strong>
                    <span>{module.text}</span>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* COMPARISON TABLE */}
      <section className="section">
        <div className="container">
          <div className="section-head-center reveal">
            <span className="sec-kicker">{p.compareKicker}</span>
            <h2>{p.compareTitle}</h2>
            <p className="lede">{p.compareText}</p>
          </div>
          <div className="compare-wrap reveal">
            <table className="compare-table">
              <thead>
                <tr>
                  <th scope="col">
                    <span className="sr-only">{p.compareKicker}</span>
                  </th>
                  {p.programs.map((program) => (
                    <th key={program.slug} scope="col">
                      {program.title}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {p.compareRows.map((row) => (
                  <tr key={row.label}>
                    <th scope="row">{row.label}</th>
                    {row.values.map((value, i) => (
                      <td key={`${row.label}-${i}`}>{value}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* TUITION */}
      <section className="section section-alt">
        <div className="container">
          <div className="section-head-center reveal">
            <span className="sec-kicker">{p.priceKicker}</span>
            <h2>{p.priceTitle}</h2>
            <p className="lede">{p.priceText}</p>
            <a href={TAS_WHATSAPP_URL} className="btn btn-secondary" target="_blank" rel="noopener noreferrer">
              {p.priceCta}
            </a>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section section-navy">
        <div className="container">
          <div className="section-head-center reveal" style={{ marginBottom: 0 }}>
            <span className="sec-kicker">{p.ctaKicker}</span>
            <h2>{p.ctaTitle}</h2>
            <p className="lede">{p.ctaText}</p>
            <div className="steps-actions">
              <Link href="/apply" className="btn btn-primary">
                {p.ctaButton}
              </Link>
              <a href={TAS_WHATSAPP_URL} className="btn btn-outline-white" target="_blank" rel="noopener noreferrer">
                {t.common.whatsappCta}
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
