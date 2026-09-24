"use client";

import Image from "./FadeImage";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLang } from "../LangProvider";
import type { Testimonial } from "../lib/testimonials";

const STEP_MS = 5000;

/**
 * Avis en carrousel horizontal : un avis à la fois sur mobile, deux sur grand écran.
 * Défilement automatique ; l'utilisateur peut glisser (doigt ou souris), utiliser
 * les flèches ou les points. L'auto-défilement s'arrête dès qu'il interagit.
 */
export default function TestimonialSlider({ items }: { items: Testimonial[] }) {
  const { lang } = useLang();
  const fr = lang === "fr";
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const drag = useRef<{ x: number; left: number } | null>(null);

  const cardWidth = () => {
    const track = trackRef.current;
    const first = track?.firstElementChild as HTMLElement | null;
    if (!track || !first) return 0;
    const gap = parseFloat(getComputedStyle(track).columnGap || "0") || 0;
    return first.offsetWidth + gap;
  };

  const goTo = useCallback(
    (i: number) => {
      const track = trackRef.current;
      if (!track) return;
      const w = cardWidth();
      const maxLeft = track.scrollWidth - track.clientWidth;
      const n = items.length;
      const next = ((i % n) + n) % n;
      track.scrollTo({ left: Math.min(next * w, maxLeft), behavior: "smooth" });
    },
    [items.length]
  );

  // Carte visible, déduite de la position de défilement.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const onScroll = () => {
      const w = cardWidth();
      if (!w) return;
      const atEnd = track.scrollLeft >= track.scrollWidth - track.clientWidth - 4;
      setIndex(atEnd ? items.length - 1 : Math.round(track.scrollLeft / w));
    };
    track.addEventListener("scroll", onScroll, { passive: true });
    return () => track.removeEventListener("scroll", onScroll);
  }, [items.length]);

  useEffect(() => {
    if (paused || items.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setTimeout(() => goTo(index + 1), STEP_MS);
    return () => window.clearTimeout(id);
  }, [index, paused, goTo, items.length]);

  // Glisser à la souris (le doigt est géré nativement par le défilement).
  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse" || !trackRef.current) return;
    drag.current = { x: e.clientX, left: trackRef.current.scrollLeft };
    trackRef.current.classList.add("is-dragging");
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current || !trackRef.current) return;
    trackRef.current.scrollLeft = drag.current.left - (e.clientX - drag.current.x);
  };
  const endDrag = () => {
    if (!drag.current || !trackRef.current) return;
    const moved = trackRef.current.scrollLeft - drag.current.left;
    drag.current = null;
    trackRef.current.classList.remove("is-dragging");
    const w = cardWidth();
    if (w) goTo(Math.round((trackRef.current.scrollLeft + Math.sign(moved) * w * 0.2) / w));
  };

  return (
    <div
      className="review-slider"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
      onFocusCapture={() => setPaused(true)}
      aria-roledescription="carousel"
      aria-label={fr ? "Avis d'anciens étudiants" : "Former students' reviews"}
    >
      <div
        ref={trackRef}
        className="review-track"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerLeave={endDrag}
      >
        {items.map((item, i) => (
          <article
            key={item.id}
            className="review-card"
            aria-roledescription="slide"
            aria-label={`${i + 1} / ${items.length}`}
          >
            <div className="review-photo">
              <Image
                src={item.photo}
                alt={item.name}
                fill
                draggable={false}
                sizes="(max-width: 767px) 34vw, 220px"
                style={{ objectFit: "cover", objectPosition: item.photoPosition ?? "50% 20%" }}
              />
            </div>
            <div className="review-body">
              {item.rating ? (
                <span
                  className="testimonial-stars"
                  aria-label={fr ? `Note : ${item.rating} sur 5` : `Rated ${item.rating} out of 5`}
                >
                  {"★".repeat(item.rating)}
                  <span className="is-off">{"★".repeat(5 - item.rating)}</span>
                </span>
              ) : null}
              <p className="review-quote">« {fr ? item.quoteFr : item.quoteEn} »</p>
              <div className="review-who">
                <strong>{item.name}</strong>
                <span>{fr ? item.programFr : item.programEn}</span>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="review-nav">
        <button type="button" className="review-arrow" onClick={() => goTo(index - 1)} aria-label={fr ? "Avis précédent" : "Previous review"}>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <path d="M15 5l-7 7 7 7" />
          </svg>
        </button>
        <div className="review-dots">
          {items.map((item, i) => (
            <button
              key={item.id}
              type="button"
              className={i === index ? "is-active" : undefined}
              aria-label={`${fr ? "Avis" : "Review"} ${i + 1}`}
              aria-current={i === index}
              onClick={() => goTo(i)}
            />
          ))}
        </div>
        <button type="button" className="review-arrow" onClick={() => goTo(index + 1)} aria-label={fr ? "Avis suivant" : "Next review"}>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <path d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
