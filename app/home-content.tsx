"use client";

import Link from "next/link";
import Image from "next/image";
import { useLang } from "./LangProvider";
import PhotoFrame from "./components/PhotoFrame";
import { TwoLineHeroTitle } from "./components/AccentTitle";
import Faq from "./components/Faq";
import StatsBand from "./components/StatsBand";
import LocationCard from "./components/LocationCard";
import { IconBook, IconPeople, IconPin, IconGlobe, IconInfo } from "./components/icons";
import RoomCard from "./components/RoomCard";
import OutingCard from "./components/OutingCard";
import { TAS_ROOMS } from "./lib/rooms";
import { TAS_OUTINGS } from "./lib/excursions";
import { useSiteContent } from "./lib/useSiteContent";
import { whatsappLinkFromDisplay, whatsappUrlFromDisplay } from "./lib/siteStore";

const TRUST_ICONS = [IconBook, IconPeople, IconGlobe, IconPin];

const AVATARS = ["/images/hero-stories.png", "/images/hero-teachers.png", "/images/cta-student.png", "/images/hero-about.png"];

const PROGRAMS = [
  {
    href: "/programs",
    src: "/images/program-english-short.png",
    titleFr: "Cours intensif d'anglais",
    titleEn: "Short-duration English course",
    textFr: "Grammaire, vocabulaire, lecture, écriture, écoute, oral et débat. 8 heures par jour.",
    textEn: "Grammar, vocabulary, reading, writing, listening, speaking and debate. 8 hours per day.",
  },
  {
    href: "/programs",
    src: "/images/program-english-long.png",
    titleFr: "Cours d'anglais (durée longue)",
    titleEn: "Long-duration English course",
    textFr: "Le même socle linguistique, à un rythme de 5 heures par jour.",
    textEn: "The same language core, at a pace of 5 hours per day.",
  },
  {
    href: "/programs",
    src: "/images/program-computer.png",
    titleFr: "Cours d'informatique",
    titleEn: "Computer courses",
    textFr: "MS Office, graphisme, bases de données, marketing digital et réseaux. 3 heures par jour.",
    textEn: "MS Office, graphic design, database, digital marketing and networking. 3 hours per day.",
  },
];

const ROOM_FEATURES = [
  {
    titleFr: "Chambres meublées",
    titleEn: "Furnished rooms",
    textFr: "Lit, douche, cuisine",
    textEn: "Bed, shower, kitchen",
  },
  {
    titleFr: "Cadre sécurisé",
    titleEn: "Safe environment",
    textFr: "Pour étudier l'esprit tranquille",
    textEn: "A calm place to study",
  },
  {
    titleFr: "Proche du campus",
    titleEn: "Close to campus",
    textFr: "Alajo, Kotobabi",
    textEn: "Alajo, Kotobabi",
  },
];

const STORIES = [
  {
    src: "/images/student-story-1.jpg",
    quoteFr:
      "La formation intensive de 3 mois à TAS English Institute m'a donné une opportunité de poursuivre mes études en France.",
    quoteEn:
      "The 3-month intensive training at TAS English Institute gave me the opportunity to continue my studies in France.",
    nameFr: "Témoignage publié",
    nameEn: "Published testimonial",
    metaFr: "Site officiel TAS",
    metaEn: "Official TAS website",
  },
  {
    src: "/images/student-1.jpg",
    quoteFr: "Les cours sont structurés, l'ambiance est internationale et on progresse vraiment à l'oral.",
    quoteEn: "The classes are structured, the atmosphere is international and speaking really improves.",
    nameFr: "Étudiant(e)",
    nameEn: "Student",
    metaFr: "Avis à confirmer",
    metaEn: "Review to confirm",
  },
  {
    src: "/images/student-2.jpg",
    quoteFr: "Les enseignants sont disponibles et le campus est un vrai cadre pour apprendre.",
    quoteEn: "The teachers are available and campus is a real place to learn.",
    nameFr: "Étudiant(e)",
    nameEn: "Student",
    metaFr: "Avis à confirmer",
    metaEn: "Review to confirm",
  },
];

const GALLERY = ["/images/gallery-campus.png", "/images/classroom-1.jpg", "/images/group-outdoor.jpg", "/images/library-study.jpg"];

const BLOG = [
  {
    src: "/images/blog-speaking.png",
    titleFr: "Comment améliorer votre oral chaque jour",
    titleEn: "How to Improve Your English Speaking Skills Every Day",
    excerptFr: "Des habitudes simples pour pratiquer l'anglais en dehors des cours.",
    excerptEn: "Simple habits to keep practising English outside class.",
  },
  {
    src: "/images/hero-resources.png",
    titleFr: "À quoi s'attendre en étudiant l'anglais au Ghana",
    titleEn: "What to Expect When Studying English in Ghana",
    excerptFr: "Vie quotidienne, logement, démarches.",
    excerptEn: "Daily life, housing, paperwork.",
  },
  {
    src: "/images/hero-university.png",
    titleFr: "Choisir le bon programme d'anglais",
    titleEn: "How to Choose the Right English Program for Your Goals",
    excerptFr: "Intensif, durée longue ou informatique : comment décider.",
    excerptEn: "Intensive, long-duration or computer courses: how to decide.",
  },
];

export default function HomeContent() {
  const { t, lang } = useLang();
  const fr = lang === "fr";
  const site = useSiteContent();
  const wa = whatsappUrlFromDisplay(site.whatsapp);

  return (
    <div className="home">
      <section className="home-hero">
        <div className="home-hero-media">
          <Image src="/images/hero-tas.png" alt={t.home.heroImageAlt} fill priority sizes="100vw" />
        </div>
        <div className="home-hero-overlay" aria-hidden="true" />
        <div className="home-hero-body">
          <span className="home-chip">Accra, Ghana</span>
          <h1>
            <TwoLineHeroTitle title={fr ? site.homeHeroFr : site.homeHeroEn} />
          </h1>
          <p className="lede">{fr ? site.homeLeadFr : site.homeLeadEn}</p>
          <div className="home-hero-actions">
            <Link href="/programs" className="btn btn-primary">
              {t.home.heroCtaPrimary}
            </Link>
            <Link href="/apply" className="btn btn-outline-white">
              {t.home.heroCtaSecondary}
            </Link>
          </div>
          <div className="home-proof">
            <span className="home-avatars">
              {AVATARS.map((src) => (
                <span key={src} className="home-avatar">
                  <Image src={src} alt="" fill sizes="36px" style={{ objectFit: "cover" }} />
                </span>
              ))}
            </span>
            <span className="small" style={{ color: "rgba(255,255,255,0.9)" }}>
              {t.home.communityNote}
            </span>
          </div>
        </div>

        <div className="home-hero-overlap">
          <div className="home-benefit-band">
            {t.home.trustItems.map((item, i) => {
              const Icon = TRUST_ICONS[i % TRUST_ICONS.length];
              return (
                <article key={item.title}>
                  <span className="icon-badge">
                    <Icon />
                  </span>
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.text}</p>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section home-after-hero">
        <div className="container">
          <div className="section-head-center reveal">
            <span className="sec-kicker">{fr ? "Programmes" : "Programs"}</span>
            <h2>{fr ? "Choisissez le programme adapté à vos objectifs" : "Choose the Right Program for Your Goals"}</h2>
            <p className="lede">
              {fr
                ? "Trois parcours actuellement proposés par TAS : anglais intensif, anglais en durée longue, et informatique."
                : "Three pathways currently offered by TAS: intensive English, longer English courses, and computer courses."}
            </p>
          </div>
          <div className="home-cards-3 reveal reveal-stagger">
            {PROGRAMS.map((p) => (
              <Link key={p.src} href={p.href} className="card card-hover">
                <PhotoFrame src={p.src} alt="" ratio="16-10" sizes="(max-width: 1023px) 78vw, 30vw" />
                <div className="card-body">
                  <h3>{fr ? p.titleFr : p.titleEn}</h3>
                  <p className="small muted">{fr ? p.textFr : p.textEn}</p>
                  <span className="btn-ghost small">{t.common.learnMore}</span>
                </div>
              </Link>
            ))}
          </div>
          <div className="section-foot reveal">
            <Link href="/programs" className="btn btn-primary">
              {t.home.programsCta}
            </Link>
          </div>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container">
          <div className="section-head-center reveal">
            <span className="sec-kicker">{fr ? "Notre école" : "Our school"}</span>
            <h2>{fr ? "Une communauté accueillante au cœur d'Accra" : "A Welcoming Community in the Heart of Accra"}</h2>
            <p className="lede">
              {fr
                ? "TAS English Institute est une école de langue à Accra (Alajo, Kotobabi) qui propose des cours d'anglais et des formations professionnelles, notamment pour des étudiants francophones."
                : "TAS English Institute is a language school in Accra (Alajo, Kotobabi) offering English and professional courses, including for Francophone students."}
            </p>
            <Link href="/about" className="btn btn-primary">
              {t.common.learnMore}
            </Link>
          </div>
          <div className="hp-video reveal">
            <PhotoFrame src="/images/campus-video-thumbnail.png" alt="" ratio="21-9" sizes="(max-width: 1023px) 92vw, 1180px" />
            <div className="hp-video-ui">
              <span className="hp-play" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7L8 5Z" />
                </svg>
              </span>
              <strong>{fr ? "Visite du campus" : "Watch Our Campus Tour"}</strong>
              <span className="small">{fr ? "Vidéo à confirmer" : "Video to confirm"}</span>
            </div>
          </div>
          <StatsBand />
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head-center reveal">
            <span className="sec-kicker">{fr ? "Logement" : "Housing"}</span>
            <h2>{fr ? "Votre maison loin de chez vous" : "Your Home Away From Home"}</h2>
            <p className="lede">
              {fr
                ? "TAS aide les étudiants à se loger près du campus. Trois formules, avec leurs équipements et leur tarif."
                : "TAS helps students find housing close to campus. Three options, with what each includes and its price."}
            </p>
          </div>
          <div className="home-cards-3 reveal reveal-stagger">
            {TAS_ROOMS.map((room) => (
              <RoomCard key={room.slug} room={room} sizes="(max-width: 1023px) 78vw, 33vw" />
            ))}
          </div>
          <p className="section-note reveal">
            <IconInfo />
            <span>{t.accommodation.priceNote}</span>
          </p>
          <ul className="feature-strip reveal reveal-stagger">
            {ROOM_FEATURES.map((feature, i) => {
              const Icon = TRUST_ICONS[i % TRUST_ICONS.length];
              return (
                <li key={feature.titleEn}>
                  <span className="icon-badge">
                    <Icon />
                  </span>
                  <div>
                    <strong>{fr ? feature.titleFr : feature.titleEn}</strong>
                    <span>{fr ? feature.textFr : feature.textEn}</span>
                  </div>
                </li>
              );
            })}
          </ul>
          <div className="section-foot reveal">
            <Link href="/accommodation" className="btn btn-primary">
              {fr ? "Voir l'hébergement" : "View Accommodation"}
            </Link>
          </div>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container">
          <div className="section-head-center reveal">
            <span className="sec-kicker">{t.excursions.kicker}</span>
            <h2>{t.excursions.title}</h2>
            <p className="lede">{t.excursions.text}</p>
          </div>
          <div className="home-cards-4 reveal reveal-stagger">
            {TAS_OUTINGS.map((outing) => (
              <OutingCard key={outing.slug} outing={outing} />
            ))}
          </div>
          <div className="section-foot reveal">
            <a href={whatsappLinkFromDisplay(site.whatsapp, t.excursions.askMessage)} className="btn btn-primary" target="_blank" rel="noopener noreferrer">
              {t.excursions.askCta}
            </a>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head-center reveal">
            <span className="sec-kicker">{fr ? "Avis" : "Reviews"}</span>
            <h2>{fr ? "Des parcours réels. Des progrès concrets." : "Real Stories. Real Progress."}</h2>
            <p className="lede">
              {fr
                ? "Ce que disent les étudiants passés par TAS English Institute."
                : "What students who came through TAS English Institute have to say."}
            </p>
          </div>
          <div className="stories-row reveal reveal-stagger">
            {STORIES.map((story) => (
              <article key={story.src} className="card story-card">
                <PhotoFrame src={story.src} alt="" ratio="3-2" sizes="120px" />
                <div className="card-body">
                  <p className="story-quote">« {fr ? story.quoteFr : story.quoteEn} »</p>
                  <div>
                    <span className="story-name">{fr ? story.nameFr : story.nameEn}</span>
                    <span className="story-meta">{fr ? story.metaFr : story.metaEn}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
          <div className="section-foot reveal">
            <Link href="/student-stories" className="btn btn-secondary">
              {t.home.storyCta}
            </Link>
          </div>
        </div>
      </section>

      <section className="section section-navy section-glow">
        <div className="container">
          <div className="section-head-center reveal">
            <span className="sec-kicker">{t.home.stepsKicker}</span>
            <h2>{t.home.stepsTitle}</h2>
            <p className="lede">{t.home.stepsText}</p>
          </div>
          <ol className="step-rail reveal reveal-stagger">
            {t.home.steps.map((step, i) => (
              <li key={step.title}>
                <span className="sec-step">{i + 1}</span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </li>
            ))}
          </ol>
          <div className="steps-actions reveal">
            <Link href="/apply" className="btn btn-primary">
              {t.home.stepsCta}
            </Link>
            <a href={wa} className="btn btn-outline-white" target="_blank" rel="noopener noreferrer">
              {t.common.whatsappCta}
            </a>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head-center reveal">
            <span className="sec-kicker">{fr ? "Campus" : "Campus"}</span>
            <h2>{fr ? "La vie à TAS English Institute" : "Life at TAS English"}</h2>
            <p className="lede">
              {fr ? "Un aperçu du campus, des salles et de la communauté." : "A glimpse of campus, classrooms and community."}
            </p>
          </div>
          <div className="home-mosaic reveal reveal-stagger">
            {GALLERY.map((src) => (
              <div key={src} className="card card-hover">
                <PhotoFrame src={src} alt="" sizes="(max-width: 1023px) 50vw, 33vw" />
              </div>
            ))}
          </div>
          <div className="section-foot reveal">
            <Link href="/gallery" className="btn btn-secondary">
              {fr ? "Voir la galerie" : "View Full Gallery"}
            </Link>
          </div>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container">
          <div className="section-head-center reveal">
            <span className="sec-kicker">{fr ? "Blog" : "Blog"}</span>
            <h2>{fr ? "Ressources pour progresser" : "Insights & Resources for Your Growth"}</h2>
            <p className="lede">
              {fr
                ? "Conseils pour l'oral, la vie au Ghana et le choix de programme."
                : "Tips on speaking, life in Ghana and choosing a program."}
            </p>
          </div>
          <div className="blog-grid reveal reveal-stagger">
            <Link href="/resources" className="card card-hover blog-lead">
              <PhotoFrame src={BLOG[0].src} alt="" ratio="16-10" sizes="(max-width: 1023px) 100vw, 50vw" />
              <div className="card-body">
                <span className="blog-kicker">{fr ? "À la une" : "Featured"}</span>
                <h3>{fr ? BLOG[0].titleFr : BLOG[0].titleEn}</h3>
                <p className="small muted">{fr ? BLOG[0].excerptFr : BLOG[0].excerptEn}</p>
              </div>
            </Link>
            <div className="blog-list">
              {BLOG.slice(1).map((post) => (
                <Link key={post.titleEn} href="/resources" className="card card-hover blog-row">
                  <PhotoFrame src={post.src} alt="" ratio="1-1" sizes="120px" />
                  <div className="card-body">
                    <h3>{fr ? post.titleFr : post.titleEn}</h3>
                    <p className="small muted">{fr ? post.excerptFr : post.excerptEn}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section section-glow">
        <div className="container">
          <div className="section-head-center reveal">
            <span className="sec-kicker">{t.home.faqKicker}</span>
            <h2>{t.home.faqTitle}</h2>
            <p className="lede">{t.home.faqText}</p>
          </div>
          <div className="faq-wrap reveal">
            <Faq items={t.home.faq} columns={2} />
          </div>
          <div className="section-foot reveal">
            <a href={wa} className="btn btn-secondary" target="_blank" rel="noopener noreferrer">
              {t.home.faqCta}
            </a>
          </div>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container">
          <div className="section-head-center reveal">
            <span className="sec-kicker">{t.location.kicker}</span>
            <h2>{t.location.sectionTitle}</h2>
            <p className="lede">{t.location.sectionText}</p>
          </div>
          <div className="reveal">
            <LocationCard />
          </div>
        </div>
      </section>

      <section className="section hp-cta">
        <div className="hp-cta-media" aria-hidden="true">
          <Image src="/images/cta-student.png" alt="" fill sizes="100vw" style={{ objectFit: "cover" }} />
        </div>
        <div className="container">
          <div className="section-head-center reveal">
            <span className="sec-kicker">{fr ? "Inscription" : "Admission"}</span>
            <h2>{fr ? "Rejoignez TAS English aujourd'hui" : "Join TAS English Today"}</h2>
            <p className="lede">
              {fr ? "Passez à l'étape suivante vers un avenir plus clair." : "Take the next step toward a brighter future."}
            </p>
            <div className="hp-cta-actions">
              <Link href="/apply" className="btn btn-primary">
                {t.home.finalCtaButton}
              </Link>
              <a href={wa} className="btn btn-whatsapp" target="_blank" rel="noopener noreferrer">
                {t.common.whatsappCta}
              </a>
            </div>
            <p className="hp-cta-caption">
              {fr ? "Plus qu'une langue. Un avenir plus clair." : "More Than a Language. A Brighter Future."}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
