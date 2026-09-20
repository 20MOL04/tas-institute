"use client";

import Link from "next/link";
import { useLang } from "../LangProvider";
import PageHero from "../components/PageHero";
import PhotoFrame from "../components/PhotoFrame";
import LocationCard from "../components/LocationCard";
import RoomCard from "../components/RoomCard";
import { IconInfo } from "../components/icons";
import { TAS_ROOMS } from "../lib/rooms";
import { TAS_WHATSAPP_URL } from "../lib/contact";

export default function AccommodationContent() {
  const { t } = useLang();
  const a = t.accommodation;

  return (
    <>
      <PageHero src="/images/hero-accommodation.png" alt="" eyebrow={a.heroEyebrow} title={a.heroTitle} subtitle={a.heroSubtitle} />

      {/* OPTIONS */}
      <section className="section">
        <div className="container">
          <div className="section-head-center reveal">
            <span className="sec-kicker">{a.optionsKicker}</span>
            <h2>{a.optionsTitle}</h2>
            <p className="lede">{a.optionsText}</p>
          </div>
          <div className="home-cards-3 reveal reveal-stagger">
            {TAS_ROOMS.map((room) => (
              <RoomCard key={room.slug} room={room} />
            ))}
          </div>
          <p className="section-note reveal">
            <IconInfo />
            <span>{a.priceNote}</span>
          </p>
        </div>
      </section>

      {/* HOW TO BOOK */}
      <section className="section section-alt">
        <div className="container">
          <div className="section-head-center reveal">
            <span className="sec-kicker">{a.stepsKicker}</span>
            <h2>{a.stepsTitle}</h2>
            <p className="lede">{a.stepsText}</p>
          </div>
          <div className="module-split reveal">
            <PhotoFrame src="/images/gallery-campus.png" alt="" ratio="4-3" sizes="(max-width: 1023px) 92vw, 44vw" />
            <ol className="skill-grid skill-grid-1 reveal-stagger">
              {a.steps.map((step, i) => (
                <li key={step.title}>
                  <span className="sec-step">{i + 1}</span>
                  <div>
                    <strong>{step.title}</strong>
                    <span>{step.text}</span>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* WHERE IT IS */}
      <section className="section">
        <div className="container">
          <div className="section-head-center reveal">
            <span className="sec-kicker">{a.locationKicker}</span>
            <h2>{a.locationTitle}</h2>
            <p className="lede">{a.locationText}</p>
          </div>
          <div className="reveal">
            <LocationCard compact />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section section-navy">
        <div className="container">
          <div className="section-head-center reveal" style={{ marginBottom: 0 }}>
            <span className="sec-kicker">{a.heroEyebrow}</span>
            <h2>{a.ctaTitle}</h2>
            <p className="lede">{a.ctaText}</p>
            <div className="steps-actions">
              <Link href="/contact" className="btn btn-primary">
                {a.ctaButton}
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
