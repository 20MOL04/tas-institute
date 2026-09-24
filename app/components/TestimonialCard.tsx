"use client";

import Image from "next/image";
import { useLang } from "../LangProvider";
import type { Testimonial } from "../lib/testimonials";

export default function TestimonialCard({ item }: { item: Testimonial }) {
  const { lang } = useLang();
  const fr = lang === "fr";
  const badge = item.pending ? (fr ? "Exemple, avis à confirmer" : "Example, to be confirmed") : fr ? item.badgeFr : item.badgeEn;

  return (
    <article className="card testimonial-card">
      <div className="testimonial-photo">
        <Image
          src={item.photo}
          alt={item.name}
          fill
          sizes="(max-width: 767px) 92vw, 380px"
          style={{ objectFit: "cover", objectPosition: item.photoPosition ?? "50% 20%" }}
        />
        {badge ? <span className={`testimonial-badge${item.pending ? " is-pending" : ""}`}>{badge}</span> : null}
      </div>
      <div className="card-body">
        {item.rating ? (
          <span className="testimonial-stars" aria-label={fr ? `Note : ${item.rating} sur 5` : `Rated ${item.rating} out of 5`}>
            {"★".repeat(item.rating)}
            <span className="is-off">{"★".repeat(5 - item.rating)}</span>
          </span>
        ) : null}
        <p className="story-quote">« {fr ? item.quoteFr : item.quoteEn} »</p>
        <div>
          <span className="story-name">{item.name}</span>
          <span className="story-meta">{fr ? item.programFr : item.programEn}</span>
        </div>
      </div>
    </article>
  );
}
