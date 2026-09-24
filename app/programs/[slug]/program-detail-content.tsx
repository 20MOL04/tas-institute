"use client";

import Link from "next/link";
import { useLang } from "../../LangProvider";
import PhotoFrame from "../../components/PhotoFrame";
import FadeImage from "../../components/FadeImage";
import Faq from "../../components/Faq";
import CtaBackdrop from "../../components/CtaBackdrop";
import { IconCheck } from "../../components/icons";
import { getProgramDetail, PROGRAM_DETAILS, type ProgramSlug } from "../../lib/programDetails";
import {
  COMPUTER_CERTIFICATE_GHC,
  COMPUTER_COURSES,
  COMPUTER_HOURS,
  INTENSIVE_FEES,
  INTENSIVE_HOURS,
  REGULAR_CERTIFICATE_GHC,
  REGULAR_FEES,
  REGULAR_HOURS,
  REGULAR_INCLUDED_EN,
  REGULAR_INCLUDED_FR,
  formatMoney,
} from "../../lib/fees";
import { useSiteContent } from "../../lib/useSiteContent";
import { whatsappLinkFromDisplay } from "../../lib/siteStore";

const cfa = (n: number) => formatMoney(n, "CFA");
const ghc = (n: number) => formatMoney(n, "GHC");

function facts(slug: ProgramSlug, fr: boolean) {
  if (slug === "intensive-english") {
    return [
      { value: `${INTENSIVE_HOURS} h`, label: fr ? "par jour" : "a day" },
      { value: fr ? "2 sem. à 6 mois" : "2 wks to 6 mo.", label: fr ? "au choix" : "your choice" },
      { value: fr ? "Débutant → avancé" : "Beginner → advanced", label: fr ? "tous niveaux" : "all levels" },
      { value: cfa(Math.min(...INTENSIVE_FEES.map((f) => f.priceCfa))), label: fr ? "à partir de" : "from" },
    ];
  }
  if (slug === "long-english") {
    return [
      { value: `${REGULAR_HOURS} h`, label: fr ? "par jour" : "a day" },
      { value: fr ? "3 mois à 1 an" : "3 months to 1 yr", label: fr ? "au choix" : "your choice" },
      { value: fr ? "+ informatique" : "+ computing", label: fr ? "en option" : "optional" },
      { value: cfa(Math.min(...REGULAR_FEES.map((f) => f.withoutItCfa))), label: fr ? "à partir de" : "from" },
    ];
  }
  return [
    { value: `${COMPUTER_HOURS} h`, label: fr ? "par jour" : "a day" },
    { value: fr ? "2 à 6 mois" : "2 to 6 months", label: fr ? "selon le module" : "by module" },
    { value: `${COMPUTER_COURSES.length}`, label: fr ? "formations" : "courses" },
    { value: ghc(Math.min(...COMPUTER_COURSES.map((c) => c.priceGhc))), label: fr ? "à partir de" : "from" },
  ];
}

function PriceTable({ slug, fr }: { slug: ProgramSlug; fr: boolean }) {
  if (slug === "intensive-english") {
    return (
      <table className="compare-table fee-table">
        <thead>
          <tr>
            <th scope="col">{fr ? "Durée" : "Length"}</th>
            <th scope="col">{fr ? "Par jour" : "Per day"}</th>
            <th scope="col">{fr ? "Prix" : "Price"}</th>
          </tr>
        </thead>
        <tbody>
          {INTENSIVE_FEES.map((f) => (
            <tr key={f.durationFr}>
              <th scope="row">{fr ? f.durationFr : f.durationEn}</th>
              <td>{INTENSIVE_HOURS} h</td>
              <td className="fee-num">{cfa(f.priceCfa)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }
  if (slug === "long-english") {
    return (
      <table className="compare-table fee-table">
        <thead>
          <tr>
            <th scope="col">{fr ? "Durée" : "Length"}</th>
            <th scope="col">{fr ? "Sans informatique" : "Without computing"}</th>
            <th scope="col">{fr ? "Avec informatique" : "With computing"}</th>
          </tr>
        </thead>
        <tbody>
          {REGULAR_FEES.map((f) => (
            <tr key={f.durationFr}>
              <th scope="row">{fr ? f.durationFr : f.durationEn}</th>
              <td className="fee-num">{cfa(f.withoutItCfa)}</td>
              <td className="fee-num">{cfa(f.withItCfa)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }
  return (
    <table className="compare-table fee-table">
      <thead>
        <tr>
          <th scope="col">{fr ? "Formation" : "Course"}</th>
          <th scope="col">{fr ? "Durée" : "Length"}</th>
          <th scope="col">{fr ? "Prix" : "Price"}</th>
        </tr>
      </thead>
      <tbody>
        {COMPUTER_COURSES.map((c) => (
          <tr key={c.id}>
            <th scope="row">{fr ? c.titleFr : c.titleEn}</th>
            <td>
              {c.months} {fr ? "mois" : "months"}
            </td>
            <td className="fee-num">{ghc(c.priceGhc)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function ProgramDetailContent({ slug }: { slug: ProgramSlug }) {
  const { lang } = useLang();
  const fr = lang === "fr";
  const site = useSiteContent();
  const program = getProgramDetail(slug)!;
  const c = program[lang];
  const others = PROGRAM_DETAILS.filter((p) => p.slug !== slug);
  const ask = whatsappLinkFromDisplay(
    site.whatsapp,
    fr ? `Bonjour TAS, je voudrais des informations sur le programme « ${c.title} ».` : `Hello TAS, I'd like information about the "${c.title}" programme.`
  );

  return (
    <>
      {/* En-tête */}
      <section className="section-tight hero-halo">
        <div className="container">
          <div className="small muted" style={{ marginBottom: "var(--space-2)" }}>
            <Link href="/programs">{fr ? "Programmes" : "Programmes"}</Link> / {c.title}
          </div>
          <div className="program-hero">
            <div className="stack">
              <span className="badge">{fr ? "Programme" : "Programme"}</span>
              <h1>{c.title}</h1>
              <p className="lede">
                <strong>{c.tagline}</strong> {c.intro}
              </p>
              <div className="program-actions">
                <Link href="/apply" className="btn btn-primary">
                  {fr ? "Candidater maintenant" : "Apply now"}
                </Link>
                <a href={ask} className="btn btn-secondary" target="_blank" rel="noopener noreferrer">
                  {fr ? "Poser une question" : "Ask a question"}
                </a>
              </div>
            </div>
            <PhotoFrame src={program.image} alt={c.title} ratio="1-1" priority sizes="(max-width: 1023px) 92vw, 46vw" />
          </div>
          <div className="program-facts">
            {facts(slug, fr).map((f) => (
              <div key={f.label + f.value}>
                <b>{f.value}</b>
                <span>{f.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pour qui */}
      <section className="section">
        <div className="container program-two">
          <div>
            <span className="sec-kicker">{fr ? "Pour qui ?" : "Who is it for?"}</span>
            <h2>{fr ? "Ce programme est fait pour vous si…" : "This programme is for you if…"}</h2>
            <ul className="program-checks">
              {c.forWhom.map((item) => (
                <li key={item}>
                  <span className="icon-check">
                    <IconCheck />
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="program-photos">
            {program.photos.map((p) => (
              <FadeImage key={p.src} src={p.src} alt="" width={p.width} height={p.height} sizes="(max-width: 1023px) 92vw, 44vw" />
            ))}
          </div>
        </div>
      </section>

      {/* Ce que vous apprenez */}
      <section className="section section-alt">
        <div className="container">
          <div className="section-head-center">
            <span className="sec-kicker">{fr ? "Au programme" : "What you learn"}</span>
            <h2>{fr ? "Ce que vous allez apprendre" : "What you will learn"}</h2>
          </div>
          <div className="program-cards">
            {c.learn.map((item, i) => (
              <article key={item.title} className="card card-pad">
                <span className="program-num">{String(i + 1).padStart(2, "0")}</span>
                <h3>{item.title}</h3>
                <p className="small muted">{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Une journée / comment ça se passe */}
      <section className="section">
        <div className="container program-two">
          <div>
            <span className="sec-kicker">{fr ? "Au quotidien" : "Day to day"}</span>
            <h2>{fr ? "Comment se passe une journée" : "What a day looks like"}</h2>
            <ol className="program-timeline">
              {c.day.map((item) => (
                <li key={item.title}>
                  <strong>{item.title}</strong>
                  <span>{item.text}</span>
                </li>
              ))}
            </ol>
          </div>
          <div>
            <span className="sec-kicker">{fr ? "Progression" : "Progress"}</span>
            <h2>{fr ? "Comment vous progressez" : "How you progress"}</h2>
            <ol className="program-steps">
              {c.progress.map((item, i) => (
                <li key={item.title}>
                  <span>{i + 1}</span>
                  <div>
                    <strong>{item.title}</strong>
                    <p>{item.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* Tarifs */}
      <section className="section section-alt">
        <div className="container">
          <div className="section-head-center">
            <span className="sec-kicker">{fr ? "Tarifs" : "Fees"}</span>
            <h2>{fr ? "Durées et tarifs" : "Lengths and fees"}</h2>
          </div>
          <div className="compare-wrap program-price">
            <PriceTable slug={slug} fr={fr} />
          </div>
          <p className="section-note">
            {slug === "computer-course"
              ? `${fr ? "Certificat ou diplôme" : "Certificate or diploma"} : ${ghc(COMPUTER_CERTIFICATE_GHC)}.`
              : slug === "long-english"
                ? `${fr ? "Offert" : "Included"} : ${(fr ? REGULAR_INCLUDED_FR : REGULAR_INCLUDED_EN).join(", ")}. ${fr ? "Certificat ou diplôme" : "Certificate or diploma"} : ${ghc(REGULAR_CERTIFICATE_GHC)}.`
                : fr
                  ? "Cours académiques et pratique de l'oral, 8 heures par jour."
                  : "Academic classes and speaking practice, 8 hours a day."}
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="section">
        <div className="container" style={{ maxWidth: 820 }}>
          <div className="section-head-center">
            <span className="sec-kicker">FAQ</span>
            <h2>{fr ? "Les questions des étudiants et des parents" : "Questions from students and parents"}</h2>
          </div>
          <Faq items={c.faq} />
        </div>
      </section>

      {/* Autres programmes */}
      <section className="section section-alt">
        <div className="container">
          <div className="section-head-center">
            <h2>{fr ? "Découvrir aussi" : "Also discover"}</h2>
          </div>
          <div className="program-others">
            {others.map((o) => (
              <Link key={o.slug} href={`/programs/${o.slug}`} className="card card-hover">
                <PhotoFrame src={o.image} alt="" ratio="1-1" sizes="(max-width: 767px) 92vw, 40vw" />
                <div className="card-body">
                  <h3>{o[lang].title}</h3>
                  <p className="small muted">{o[lang].tagline}</p>
                  <span className="btn-ghost small" style={{ alignSelf: "start" }}>
                    {fr ? "Voir le programme" : "View programme"}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-navy cta-photo">
        <CtaBackdrop src="/images/tas/graduation-caps-yellow.jpg" />
        <div className="container">
          <div className="section-head-center" style={{ marginBottom: 0 }}>
            <h2>{fr ? `Prêt à commencer : ${c.title} ?` : `Ready to start: ${c.title}?`}</h2>
            <p className="lede">{fr ? "Inscrivez-vous en ligne ou posez vos questions sur WhatsApp." : "Apply online or ask your questions on WhatsApp."}</p>
            <div className="steps-actions">
              <Link href="/apply" className="btn btn-primary">
                {fr ? "Candidater maintenant" : "Apply now"}
              </Link>
              <a href={ask} className="btn btn-outline-white" target="_blank" rel="noopener noreferrer">
                {fr ? "Discuter sur WhatsApp" : "Chat on WhatsApp"}
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
