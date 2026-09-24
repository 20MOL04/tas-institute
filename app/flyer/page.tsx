/* eslint-disable @next/next/no-img-element -- <img> simple : le flyer est imprimé en PDF, toutes les images doivent être chargées d'avance. */
import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./flyer.css";
import { dictionaries } from "../i18n";
import {
  COMPUTER_CERTIFICATE_GHC,
  COMPUTER_COURSES,
  COMPUTER_ENROLLMENT_GHC,
  COMPUTER_HOURS,
  EXAM_CLASS_CFA,
  EXAM_DAYS_FR,
  EXAM_FEES,
  EXAM_HOURS_FR,
  INTENSIVE_FEES,
  INTENSIVE_HOURS,
  REGULAR_CERTIFICATE_GHC,
  REGULAR_ENROLLMENT_CFA,
  REGULAR_FEES,
  REGULAR_HOURS,
  REGULAR_INCLUDED_FR,
  formatMoney,
} from "../lib/fees";
import { ROOM_INSTALLATION_CFA, ROOM_INSTALLATION_SLUGS, ROOM_AMENITY_PHOTOS, TAS_RESIDENCES, TAS_ROOMS } from "../lib/rooms";
import { GRADUATION_PHOTOS, PUBLISHED_TESTIMONIALS } from "../lib/testimonials";
import { TEACHER_PHOTOS } from "../lib/teachers";
import {
  TAS_EMAIL,
  TAS_LOCATION,
  TAS_PHONE_DISPLAY,
  TAS_SCHOOL_PHONES,
  TAS_SOCIAL,
  TAS_WEBSITE,
  TAS_WHATSAPP_DISPLAY,
} from "../lib/contact";

/**
 * Flyer TAS (brochure des formations et tarifs), 13 diapositives 16:9.
 * Toutes les données viennent des mêmes fichiers que le site : un tarif changé
 * dans lib/fees.ts ou lib/rooms.ts change aussi le flyer.
 * Export PDF : scripts/flyer-pdf.ps1.
 */
export const metadata: Metadata = {
  title: "Flyer",
  robots: { index: false, follow: false },
};

const TOTAL = 13;
const cfa = (n: number) => formatMoney(n, "CFA");
const ghc = (n: number) => formatMoney(n, "GHC");
const STEPS = dictionaries.fr.home.steps;

function Slide({ n, className, children }: { n: number; className?: string; children: ReactNode }) {
  return (
    <section className={`slide${className ? ` ${className}` : ""}`}>
      {children}
      {n > 1 ? (
        <footer className="slide-foot">
          <img src="/brand/tas-logo-480.png" alt="" className="slide-foot-logo" />
          <span>{TAS_WEBSITE}</span>
          <span className="slide-foot-n">
            {String(n).padStart(2, "0")} / {String(TOTAL).padStart(2, "0")}
          </span>
        </footer>
      ) : null}
    </section>
  );
}

function Head({ kicker, title, accent, text }: { kicker: string; title: string; accent?: string; text?: string }) {
  return (
    <header className="slide-head">
      <span className="kicker">{kicker}</span>
      <h2>
        {title} {accent ? <em>{accent}</em> : null}
      </h2>
      {text ? <p className="lead">{text}</p> : null}
    </header>
  );
}

export default function FlyerPage() {
  return (
    <div className="flyer">
      {/* 1. Couverture */}
      <Slide n={1} className="cover">
        <img src="/images/tas/graduation-caps-yellow.jpg" alt="" className="cover-photo" />
        <div className="cover-veil" />
        <div className="cover-body">
          <img src="/brand/tas-logo-white-480.png" alt="TAS English Institute" className="cover-logo" />
          <h1>
            Apprenez l&apos;anglais à Accra.
            <br />
            <em>Construisez votre avenir.</em>
          </h1>
          <p className="lead">Formations, tarifs et logements</p>
          <div className="cover-chips">
            <span>Anglais intensif</span>
            <span>Anglais longue durée</span>
            <span>TOEFL · IELTS · TOEIC</span>
            <span>Informatique</span>
            <span>Logement</span>
          </div>
        </div>
        <div className="cover-contact">
          <strong>WhatsApp {TAS_WHATSAPP_DISPLAY}</strong>
          <span>{TAS_LOCATION.landmarkFr}, Ghana</span>
        </div>
      </Slide>

      {/* 2. L'école */}
      <Slide n={2} className="fl-split">
        <div className="fl-copy">
          <Head
            kicker="L'école"
            title="Une école d'anglais pensée pour les"
            accent="francophones."
            text="TAS English Institute accueille à Accra des étudiants venus de toute l'Afrique francophone. Des cours d'anglais adaptés à vos objectifs, études ou travail, et une immersion complète dans un pays anglophone."
          />
          <ul className="pillars">
            <li>
              <strong>Anglais intensif</strong>
              <span>{INTENSIVE_HOURS} h de cours par jour, de 2 semaines à 6 mois</span>
            </li>
            <li>
              <strong>Anglais longue durée</strong>
              <span>{REGULAR_HOURS} h par jour, de 3 mois à 1 an, avec ou sans informatique</span>
            </li>
            <li>
              <strong>TOEFL, IELTS, TOEIC</strong>
              <span>Préparation aux examens internationaux</span>
            </li>
            <li>
              <strong>Logement</strong>
              <span>Chambres et appartement à Alajo et Kotobabi</span>
            </li>
          </ul>
        </div>
        <div className="mosaic">
          <img src="/images/tas/class-red.jpg" alt="" className="m-a" />
          <img src="/images/tas/class-white.jpg" alt="" className="m-b" />
          <img src="/images/tas/computer-lab.jpg" alt="" className="m-c" />
        </div>
      </Slide>

      {/* 3. Anglais intensif */}
      <Slide n={3} className="fl-split">
        <div className="fl-copy">
          <Head
            kicker="Programme 1"
            title="Anglais"
            accent="intensif"
            text={`${INTENSIVE_HOURS} heures de cours par jour. Cours académiques et pratique de l'oral, pour progresser vite.`}
          />
          <div className="facts">
            <div>
              <b>{INTENSIVE_HOURS} h</b>
              <span>par jour</span>
            </div>
            <div>
              <b>2 sem.</b>
              <span>à 6 mois</span>
            </div>
            <div>
              <b>Académique</b>
              <span>+ oral</span>
            </div>
          </div>
          <img src="/images/programs/english-intensive.jpg" alt="" className="side-photo" />
        </div>
        <table className="price-table">
          <thead>
            <tr>
              <th>Durée</th>
              <th>Prix</th>
            </tr>
          </thead>
          <tbody>
            {INTENSIVE_FEES.map((f) => (
              <tr key={f.durationFr}>
                <td>{f.durationFr}</td>
                <td>{cfa(f.priceCfa)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Slide>

      {/* 4. Anglais longue durée */}
      <Slide n={4} className="fl-split">
        <div className="fl-copy">
          <Head
            kicker="Programme 2"
            title="Anglais"
            accent="longue durée"
            text={`${REGULAR_HOURS} heures par jour, sur 3 mois à 1 an. Option informatique pour partir avec deux compétences.`}
          />
          <div className="note-box">
            <div>
              <span>Frais d&apos;inscription</span>
              <b>{cfa(REGULAR_ENROLLMENT_CFA)}</b>
            </div>
            <div>
              <span>Certificat ou diplôme</span>
              <b>{ghc(REGULAR_CERTIFICATE_GHC)}</b>
            </div>
            <div className="note-wide">
              <span>Offert</span>
              <b>{REGULAR_INCLUDED_FR.join(" · ")}</b>
            </div>
          </div>
          <img src="/images/programs/english-long.jpg" alt="" className="side-photo is-short" />
        </div>
        <table className="price-table">
          <thead>
            <tr>
              <th>Durée</th>
              <th>Sans informatique</th>
              <th>Avec informatique</th>
            </tr>
          </thead>
          <tbody>
            {REGULAR_FEES.map((f) => (
              <tr key={f.durationFr}>
                <td>{f.durationFr}</td>
                <td>{cfa(f.withoutItCfa)}</td>
                <td>{cfa(f.withItCfa)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Slide>

      {/* 5. Examens */}
      <Slide n={5}>
        <Head
          kicker="Programme 3"
          title="Préparation"
          accent="TOEFL · IELTS · TOEIC"
          text={`${EXAM_DAYS_FR}, ${EXAM_HOURS_FR} par jour. La même classe de préparation pour les trois examens.`}
        />
        <div className="exam-row">
          <div className="exam-card is-main">
            <span>Classe de préparation</span>
            <b>{cfa(EXAM_CLASS_CFA)}</b>
            <small>par mois</small>
          </div>
          {EXAM_FEES.map((e) => (
            <div key={e.name} className="exam-card">
              <span>Frais d&apos;examen {e.name}</span>
              <b>{cfa(e.examCfa)}</b>
              <small>par examen</small>
            </div>
          ))}
        </div>
        <div className="photo-band">
          <img src="/images/tas/class-poster.jpg" alt="" />
          <img src="/images/tas/graduation-diploma-1.jpg" alt="" />
          <img src="/images/tas/advising-office.jpg" alt="" />
        </div>
      </Slide>

      {/* 6. Informatique */}
      <Slide n={6} className="fl-split">
        <div className="fl-copy">
          <Head
            kicker="Programme 4"
            title="Formations en"
            accent="informatique"
            text={`${COMPUTER_HOURS} heures par jour. Des compétences concrètes, demandées par les employeurs.`}
          />
          <div className="note-box">
            <div>
              <span>Frais d&apos;inscription</span>
              <b>{ghc(COMPUTER_ENROLLMENT_GHC)}</b>
            </div>
            <div>
              <span>Certificat ou diplôme</span>
              <b>{ghc(COMPUTER_CERTIFICATE_GHC)}</b>
            </div>
          </div>
          <img src="/images/programs/computer.jpg" alt="" className="side-photo" />
        </div>
        <table className="price-table is-compact">
          <thead>
            <tr>
              <th>Formation</th>
              <th>Durée</th>
              <th>Prix</th>
            </tr>
          </thead>
          <tbody>
            {COMPUTER_COURSES.map((c) => (
              <tr key={c.id}>
                <td>{c.titleFr}</td>
                <td>{c.months} mois</td>
                <td>{ghc(c.priceGhc)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Slide>

      {/* 7. Logement */}
      <Slide n={7}>
        <Head
          kicker="Logement"
          title="Se loger près de"
          accent="l'école"
          text="Quatre formules meublées à Alajo et Kotobabi. Tarifs par mois."
        />
        <div className="fl-rooms">
          {TAS_ROOMS.map((r) => (
            <article key={r.slug} className="fl-room">
              <img src={r.image} alt="" />
              <div className="fl-room-body">
                <b className="fl-price">
                  {r.price} CFA<small>{r.slug === "shared" ? " / pers. / mois" : " / mois"}</small>
                </b>
                <strong>{r.titleFr}</strong>
                <span>{r.includesFr.join(" · ")}</span>
              </div>
            </article>
          ))}
        </div>
        <p className="band-note">
          Installation : <b>{cfa(ROOM_INSTALLATION_CFA)}</b> par étudiant, une seule fois (
          {TAS_ROOMS.filter((r) => (ROOM_INSTALLATION_SLUGS as readonly string[]).includes(r.slug))
            .map((r) => r.titleFr.split(",")[0].toLowerCase())
            .join(", ")}
          ).
        </p>
      </Slide>

      {/* 8. Nos résidences */}
      <Slide n={8}>
        <Head kicker="Logement" title="Nos" accent="résidences" text="Des immeubles récents, à quelques minutes de l'école." />
        <div className="residences">
          {TAS_RESIDENCES.map((r) => (
            <figure key={r.image}>
              <img src={r.image} alt="" />
              <figcaption>
                <strong>{r.labelFr}</strong>
                <span>{r.areaFr}, Accra</span>
              </figcaption>
            </figure>
          ))}
        </div>
        <div className="amenities">
          {ROOM_AMENITY_PHOTOS.map((a) => (
            <figure key={a.src}>
              <img src={a.src} alt="" />
              <figcaption>{a.labelFr}</figcaption>
            </figure>
          ))}
        </div>
      </Slide>

      {/* 9. L'équipe */}
      <Slide n={9}>
        <Head kicker="L'équipe" title="Des enseignants" accent="engagés" text="Ils font parler, écrire et débattre les étudiants, tous les jours, à Accra." />
        <div className="team">
          {TEACHER_PHOTOS.map((src) => (
            <img key={src} src={src} alt="" />
          ))}
        </div>
      </Slide>

      {/* 10. Témoignages */}
      <Slide n={10} className="fl-split">
        <div className="fl-copy">
          <Head kicker="Ils en parlent" title="Nos" accent="diplômés" />
          <div className="quotes">
            {PUBLISHED_TESTIMONIALS.map((q) => (
              <figure key={q.id} className="quote">
                <img src={q.photo} alt="" style={{ objectPosition: q.photoPosition }} />
                <div>
                  <blockquote>« {q.quoteFr} »</blockquote>
                  <figcaption>
                    <strong>{q.name}</strong> · {q.programFr}
                  </figcaption>
                </div>
              </figure>
            ))}
          </div>
        </div>
        <div className="grads">
          {GRADUATION_PHOTOS.slice(0, 4).map((p) => (
            <img key={p.src} src={p.src} alt="" />
          ))}
        </div>
      </Slide>

      {/* 11. La vie à TAS */}
      <Slide n={11}>
        <Head kicker="La vie à TAS" title="Apprendre, sortir," accent="réussir." text="Sorties à Cape Coast, Kakum et sur la côte. Remise des diplômes à chaque fin de session." />
        <div className="life">
          <img src="/images/outings/beach-tug-of-war-poster.jpg" alt="" className="l-a" />
          <img src="/images/outings/cape-coast-steps.jpg" alt="" className="l-b" />
          <img src="/images/outings/kakum-selfie.jpg" alt="" className="l-c" />
          <img src="/images/tas/graduate-duo.jpg" alt="" className="l-d" />
          <img src="/images/tas/graduation-class-hall.jpg" alt="" className="l-e" />
        </div>
      </Slide>

      {/* 12. S'inscrire */}
      <Slide n={12} className="fl-split">
        <div className="fl-copy">
          <Head kicker="Admission" title="Rejoindre TAS en" accent="quatre étapes" />
          <ol className="fl-steps">
            {STEPS.map((s, i) => (
              <li key={s.title}>
                <span>{i + 1}</span>
                <div>
                  <strong>{s.title}</strong>
                  <p>{s.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
        <img src="/images/tas/graduation-hijab.jpg" alt="" className="tall-photo" />
      </Slide>

      {/* 13. Contact */}
      <Slide n={13} className="contact">
        <img src="/images/tas/class-red.jpg" alt="" className="cover-photo" />
        <div className="cover-veil" />
        <div className="contact-body">
          <img src="/brand/tas-logo-white-480.png" alt="TAS English Institute" className="cover-logo" />
          <h2>
            Parlons de votre <em>projet.</em>
          </h2>
          <div className="contact-grid">
            <div className="contact-main">
              <span>WhatsApp</span>
              <b>{TAS_WHATSAPP_DISPLAY}</b>
            </div>
            <div>
              <span>Téléphone</span>
              {[TAS_PHONE_DISPLAY, ...TAS_SCHOOL_PHONES].map((p) => (
                <b key={p}>{p}</b>
              ))}
            </div>
            <div>
              <span>Adresse</span>
              <b>{TAS_LOCATION.addressFr}</b>
            </div>
            <div>
              <span>En ligne</span>
              <b>{TAS_WEBSITE}</b>
              <b>{TAS_EMAIL}</b>
              <b>{TAS_SOCIAL.map((s) => s.label).join(" · ")} : TAS English Institute</b>
            </div>
          </div>
        </div>
      </Slide>
    </div>
  );
}
