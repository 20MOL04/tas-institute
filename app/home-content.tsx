"use client";

import Link from "next/link";
import Image from "./components/FadeImage";
import { useLang } from "./LangProvider";
import PhotoFrame from "./components/PhotoFrame";
import { TwoLineHeroTitle } from "./components/AccentTitle";
import Faq from "./components/Faq";
import StatsBand from "./components/StatsBand";
import LocationCard from "./components/LocationCard";
import TeacherMarquee, { TEACHER_PHOTOS } from "./components/TeacherMarquee";
import { IconBook, IconPeople, IconPin, IconGlobe, IconInfo } from "./components/icons";
import RoomCard from "./components/RoomCard";
import OutingCard from "./components/OutingCard";
import TestimonialSlider from "./components/TestimonialSlider";
import OutingReel from "./components/OutingReel";
import HeroSlideshow from "./components/HeroSlideshow";
import { OUTING_CLIPS } from "./lib/outingMedia";
import { HOME_GRADUATES, PUBLISHED_TESTIMONIALS } from "./lib/testimonials";
import { TAS_ROOMS } from "./lib/rooms";
import { TAS_OUTINGS } from "./lib/excursions";
import { ARTICLES_BY_DATE } from "./lib/articles";
import { useSiteContent } from "./lib/useSiteContent";
import { whatsappLinkFromDisplay, whatsappUrlFromDisplay } from "./lib/siteStore";

const TRUST_ICONS = [IconBook, IconPeople, IconGlobe, IconPin];

// Vrais visages TAS : deux diplômés et deux professeurs.
const AVATARS = [
  "/images/tas/graduate-woman.webp",
  "/images/teachers/tas-teacher-1.jpg",
  "/images/tas/graduate-man.webp",
  "/images/teachers/tas-teacher-7.jpg",
];

const PROGRAMS = [
  {
    href: "/programs",
    src: "/images/programs/english-intensive.jpg",
    titleFr: "Cours intensif d'anglais",
    titleEn: "Short-duration English course",
    textFr: "Grammaire, vocabulaire, lecture, écriture, écoute, oral et débat. 8 heures par jour.",
    textEn: "Grammar, vocabulary, reading, writing, listening, speaking and debate. 8 hours per day.",
  },
  {
    href: "/programs",
    src: "/images/programs/english-long.jpg",
    titleFr: "Cours d'anglais (durée longue)",
    titleEn: "Long-duration English course",
    textFr: "Le même socle linguistique, à un rythme de 5 heures par jour.",
    textEn: "The same language core, at a pace of 5 hours per day.",
  },
  {
    href: "/programs",
    src: "/images/programs/computer.jpg",
    titleFr: "Cours d'informatique",
    titleEn: "Computer courses",
    textFr: "Office, infographie, réparation, Excel, bases de données, réseaux, sites web. 3 heures par jour.",
    textEn: "Office, graphic design, repair, Excel, databases, networks, websites. 3 hours a day.",
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

// Les avis viennent de lib/testimonials.ts (vrais anciens étudiants uniquement).

// 8 photos : 1 grande, 6 petites, 1 large en bas (la grille de 4 colonnes reste pleine).
const GALLERY = [
  "/images/tas/class-red.jpg",
  "/images/outings/kakum-selfie.jpg",
  "/images/tas/graduation-handshake.jpg",
  "/images/outings/beach-tug-of-war-poster.jpg",
  "/images/tas/class-white.jpg",
  "/images/outings/beach-student.jpg",
  "/images/outings/cape-coast-group.jpg",
  "/images/outings/beach-volleyball-poster.jpg",
];

// Les 3 articles les plus récents de la page Ressources.
const BLOG = ARTICLES_BY_DATE.slice(0, 3);

export default function HomeContent() {
  const { t, lang } = useLang();
  const fr = lang === "fr";
  const site = useSiteContent();
  const wa = whatsappUrlFromDisplay(site.whatsapp);

  return (
    <div className="home">
      <section className="home-hero">
        <div className="home-hero-media">
          <HeroSlideshow
            slides={[
              { src: "/images/hero-home.jpg", alt: t.home.heroImageAlt, position: "center 42%" },
              { src: "/images/tas/graduation-caps-yellow.jpg", alt: "", position: "center 35%" },
              { src: "/images/tas/graduation-class-hall.jpg", alt: "", position: "center 30%" },
              { src: "/images/tas/graduation-caps-group.jpg", alt: "", position: "center 30%" },
              { src: "/images/tas/graduate-duo.jpg", alt: "", position: "center 25%" },
              { src: "/images/tas/graduation-class-night.jpg", alt: "", position: "center 35%" },
            ]}
          />
          <div className="home-hero-overlay" aria-hidden="true" />
        </div>
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
                  <Image src={src} alt="" fill sizes="56px" style={{ objectFit: "cover" }} />
                </span>
              ))}
            </span>
            <span className="small" style={{ color: "rgb(var(--c-white-rgb) / 0.9)" }}>
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
            <span className="sec-kicker">{t.home.programsEyebrow}</span>
            <h2>{t.home.programsTitle}</h2>
            <p className="lede">{t.home.programsSubtitle}</p>
          </div>
          <div className="home-cards-3 reveal reveal-stagger">
            {PROGRAMS.map((p) => (
              <Link key={p.src} href={p.href} className="card card-hover">
                <PhotoFrame src={p.src} alt="" ratio="16-10" sizes="(max-width: 1023px) 78vw, 33vw" />
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
            <span className="sec-kicker">{t.home.teachersEyebrow}</span>
            <h2>{t.home.teachersTitle}</h2>
            <p className="lede">{fr ? "Une équipe en classe, tous les jours." : "A team in class, every day."}</p>
          </div>
        </div>
        <TeacherMarquee photos={TEACHER_PHOTOS} />
        <div className="container">
          <div className="section-foot reveal">
            <Link href="/teachers" className="btn btn-secondary">
              {t.home.teachersCta}
            </Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="home-split reveal">
            <div className="home-split-copy">
              <span className="sec-kicker">{t.home.whyEyebrow}</span>
              <h2>{t.home.whyTitle}</h2>
              <p className="lede">{fr ? "Une école à Accra, pour les étudiants d'Afrique de l'Ouest." : "A school in Accra, for students from West Africa."}</p>
              <Link href="/about" className="btn btn-primary">
                {t.common.learnMore}
              </Link>
            </div>
            <div className="hp-video">
              <OutingReel clips={OUTING_CLIPS.filter((c) => !c.vertical)} />
            </div>
          </div>
          <StatsBand />
        </div>
      </section>

      <section className="section section-alt">
        <div className="container">
          <div className="section-head-center reveal">
            <span className="sec-kicker">{t.accommodation.optionsKicker}</span>
            <h2>{t.accommodation.optionsTitle}</h2>
            <p className="lede">{fr ? "Près des cours. Vous réservez sur WhatsApp." : "Near class. You book on WhatsApp."}</p>
          </div>
          <div className="home-cards-4 reveal reveal-stagger">
            {TAS_ROOMS.map((room) => (
              <RoomCard key={room.slug} room={room} sizes="(max-width: 1023px) 78vw, 24vw" />
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
              {fr ? "Voir l'hébergement" : "View housing"}
            </Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head-center reveal">
            <span className="sec-kicker">{t.excursions.kicker}</span>
            <h2>{t.excursions.title}</h2>
            <p className="lede">{fr ? "Cape Coast, Kakum, Accra, la mer." : "Cape Coast, Kakum, Accra, the sea."}</p>
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

      <section className="section section-alt">
        <div className="container">
          <div className="section-head-center reveal">
            <span className="sec-kicker">{t.home.storyEyebrow}</span>
            <h2>{t.home.storyTitle}</h2>
            <p className="lede">{t.home.storyText}</p>
          </div>
          <div className="reveal">
            <TestimonialSlider items={PUBLISHED_TESTIMONIALS} />
          </div>
          <h3 className="graduates-title reveal">{fr ? "Nos diplômés" : "Our graduates"}</h3>
          <div className="graduates-row reveal reveal-stagger">
            {HOME_GRADUATES.map((photo) => (
              <div key={photo.src} className="card card-hover">
                <PhotoFrame src={photo.src} alt={fr ? photo.altFr : photo.altEn} ratio="1-1" sizes="(max-width: 767px) 46vw, 24vw" />
              </div>
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
            <span className="sec-kicker">{t.home.campusEyebrow}</span>
            <h2>{t.home.campusTitle}</h2>
            <p className="lede">{t.home.campusText}</p>
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
              {fr ? "Voir la galerie" : "View the gallery"}
            </Link>
          </div>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container">
          <div className="section-head-center reveal">
            <span className="sec-kicker">{t.resources.heroEyebrow}</span>
            <h2>{t.resources.heroTitle}</h2>
            <p className="lede">{t.resources.heroSubtitle}</p>
          </div>
          <div className="blog-grid reveal reveal-stagger">
            <Link href={`/resources/${BLOG[0].slug}`} className="card card-hover blog-lead">
              <PhotoFrame src={BLOG[0].image} alt="" ratio="16-10" sizes="(max-width: 1023px) 100vw, 50vw" />
              <div className="card-body">
                <span className="blog-kicker">{fr ? "À la une" : "Featured"}</span>
                <h3>{BLOG[0][lang].title}</h3>
                <p className="small muted">{BLOG[0][lang].excerpt}</p>
              </div>
            </Link>
            <div className="blog-list">
              {BLOG.slice(1).map((post) => (
                <Link key={post.slug} href={`/resources/${post.slug}`} className="card card-hover blog-row">
                  <PhotoFrame src={post.image} alt="" ratio="1-1" sizes="120px" />
                  <div className="card-body">
                    <h3>{post[lang].title}</h3>
                    <p className="small muted">{post[lang].tag} · {post.readMinutes} {t.resources.minRead}</p>
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
          <LocationCard />
        </div>
      </section>

      <section className="section hp-cta">
        <div className="hp-cta-media" aria-hidden="true">
          <Image src="/images/tas/graduation-caps-yellow.jpg" alt="" fill sizes="100vw" style={{ objectFit: "cover", objectPosition: "50% 35%" }} />
        </div>
        <div className="container">
          <div className="section-head-center reveal">
            <span className="sec-kicker">{t.home.stepsKicker}</span>
            <h2>{t.home.finalCtaTitle}</h2>
            <p className="lede">{t.home.finalCtaText}</p>
            <div className="hp-cta-actions">
              <Link href="/apply" className="btn btn-primary">
                {t.home.finalCtaButton}
              </Link>
              <a href={wa} className="btn btn-whatsapp" target="_blank" rel="noopener noreferrer">
                {t.common.whatsappCta}
              </a>
            </div>
            <p className="hp-cta-caption">
              {fr ? "Une place à Accra. Un rythme. Un départ." : "A place in Accra. A pace. A start."}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
