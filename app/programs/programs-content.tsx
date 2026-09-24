"use client";

import Link from "next/link";
import { useLang } from "../LangProvider";
import PageHero from "../components/PageHero";
import PhotoFrame from "../components/PhotoFrame";
import StatsBand from "../components/StatsBand";
import { TAS_WHATSAPP_URL } from "../lib/contact";
import CtaBackdrop from "../components/CtaBackdrop";
import {
  COMPUTER_CERTIFICATE_GHC,
  COMPUTER_COURSES,
  COMPUTER_HOURS,
  EXAM_CLASS_CFA,
  EXAM_DAYS_EN,
  EXAM_DAYS_FR,
  EXAM_FEES,
  EXAM_HOURS_EN,
  EXAM_HOURS_FR,
  INTENSIVE_FEES,
  INTENSIVE_HOURS,
  REGULAR_CERTIFICATE_GHC,
  REGULAR_FEES,
  REGULAR_HOURS,
  REGULAR_INCLUDED_EN,
  REGULAR_INCLUDED_FR,
  formatMoney,
} from "../lib/fees";

export default function ProgramsContent() {
  const { t, lang } = useLang();
  const p = t.programs;
  const fr = lang === "fr";

  return (
    <>
      <PageHero
        src="/images/hero-programs.jpg"
        alt=""
        eyebrow={p.heroEyebrow}
        title={p.heroTitle}
        subtitle={p.heroSubtitle}
        objectPosition="72% 58%"
      />

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

      <section className="section section-alt">
        <div className="container">
          <div className="section-head-center reveal">
            <span className="sec-kicker">{p.modulesKicker}</span>
            <h2>{p.modulesTitle}</h2>
            <p className="lede">{p.modulesText}</p>
          </div>
          <div className="compare-wrap reveal">
            <table className="compare-table fee-table">
              <thead>
                <tr>
                  <th scope="col">{p.listKicker}</th>
                  <th scope="col">{p.feesColDuration}</th>
                  <th scope="col">{p.feesColHours}</th>
                  <th scope="col">{p.feesColPrice}</th>
                </tr>
              </thead>
              <tbody>
                {COMPUTER_COURSES.map((course) => (
                  <tr key={course.id}>
                    <th scope="row">{fr ? course.titleFr : course.titleEn}</th>
                    <td>
                      {course.months} {p.feesMonthsShort}
                    </td>
                    <td>{COMPUTER_HOURS} h</td>
                    <td className="fee-num">{formatMoney(course.priceGhc, "GHC")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="section-note reveal">
            {p.feesCertificate} :{" "}
            {formatMoney(COMPUTER_CERTIFICATE_GHC, "GHC")}.
          </p>
        </div>
      </section>

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

      <section className="section section-alt">
        <div className="container">
          <div className="section-head-center reveal">
            <span className="sec-kicker">{p.priceKicker}</span>
            <h2>{p.priceTitle}</h2>
            <p className="lede">{p.priceText}</p>
          </div>

          <div className="fee-block reveal">
            <h3 className="fee-heading">{p.feesIntensiveTitle}</h3>
            <p className="small muted">{p.feesIntensiveText}</p>
            <div className="compare-wrap">
              <table className="compare-table fee-table">
                <thead>
                  <tr>
                    <th scope="col">{p.feesColDuration}</th>
                    <th scope="col">{p.feesColHours}</th>
                    <th scope="col">{p.feesColPrice}</th>
                  </tr>
                </thead>
                <tbody>
                  {INTENSIVE_FEES.map((row) => (
                    <tr key={row.priceCfa}>
                      <th scope="row">{fr ? row.durationFr : row.durationEn}</th>
                      <td>{INTENSIVE_HOURS} h</td>
                      <td className="fee-num">{formatMoney(row.priceCfa, "CFA")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="fee-block reveal">
            <h3 className="fee-heading">{p.feesRegularTitle}</h3>
            <p className="small muted">{p.feesRegularText}</p>
            <div className="compare-wrap">
              <table className="compare-table fee-table">
                <thead>
                  <tr>
                    <th scope="col">{p.feesColDuration}</th>
                    <th scope="col">{p.feesColHours}</th>
                    <th scope="col">{p.feesColNoIt}</th>
                    <th scope="col">{p.feesColWithIt}</th>
                  </tr>
                </thead>
                <tbody>
                  {REGULAR_FEES.map((row) => (
                    <tr key={row.withoutItCfa}>
                      <th scope="row">{fr ? row.durationFr : row.durationEn}</th>
                      <td>{REGULAR_HOURS} h</td>
                      <td className="fee-num">{formatMoney(row.withoutItCfa, "CFA")}</td>
                      <td className="fee-num">{formatMoney(row.withItCfa, "CFA")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="section-note">
              {p.feesCertificate} :{" "}
              {formatMoney(REGULAR_CERTIFICATE_GHC, "GHC")}. {p.feesIncluded} : {(fr ? REGULAR_INCLUDED_FR : REGULAR_INCLUDED_EN).join(", ")}.
            </p>
          </div>

          <div className="fee-block reveal">
            <h3 className="fee-heading">{p.feesExamTitle}</h3>
            <p className="small muted">{p.feesExamText}</p>
            <div className="compare-wrap">
              <table className="compare-table fee-table">
                <thead>
                  <tr>
                    <th scope="col">{p.listKicker}</th>
                    <th scope="col">{p.feesColDuration}</th>
                    <th scope="col">{p.feesColHours}</th>
                    <th scope="col">{p.feesColDays}</th>
                    <th scope="col">{p.feesColPrice}</th>
                    <th scope="col">{p.feesColExam}</th>
                  </tr>
                </thead>
                <tbody>
                  {EXAM_FEES.map((row) => (
                    <tr key={row.name}>
                      <th scope="row">{row.name}</th>
                      <td>{p.feesMonths}</td>
                      <td>{fr ? EXAM_HOURS_FR : EXAM_HOURS_EN}</td>
                      <td>{fr ? EXAM_DAYS_FR : EXAM_DAYS_EN}</td>
                      <td className="fee-num">{formatMoney(EXAM_CLASS_CFA, "CFA")}</td>
                      <td className="fee-num">{formatMoney(row.examCfa, "CFA")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="section-foot reveal">
            <a href={TAS_WHATSAPP_URL} className="btn btn-secondary" target="_blank" rel="noopener noreferrer">
              {p.priceCta}
            </a>
          </div>
        </div>
      </section>

      <section className="section section-navy cta-photo">
        <CtaBackdrop src="/images/tas/graduation-diploma-2.jpg" />
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
