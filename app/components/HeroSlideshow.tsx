"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export interface HeroSlide {
  src: string;
  alt: string;
  position?: string;
}

const STEP_MS = 6000;

/**
 * Fond du haut de l'accueil : les photos s'enchaînent en fondu, avec un zoom lent.
 * La première est chargée en priorité ; les suivantes arrivent pendant qu'elle s'affiche.
 */
export default function HeroSlideshow({ slides }: { slides: HeroSlide[] }) {
  const [index, setIndex] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Laisse la première image s'afficher avant de charger les autres.
    const t = window.setTimeout(() => setReady(true), 1200);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!ready || slides.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % slides.length), STEP_MS);
    return () => window.clearInterval(id);
  }, [ready, slides.length]);

  return (
    <>
      {slides.map((s, i) =>
        i === 0 || ready ? (
          <Image
            key={s.src}
            src={s.src}
            alt={i === 0 ? s.alt : ""}
            fill
            priority={i === 0}
            quality={82}
            sizes="100vw"
            className={`hero-slide${i === index ? " is-active" : ""}`}
            style={{ objectFit: "cover", objectPosition: s.position ?? "center 40%" }}
          />
        ) : null
      )}
    </>
  );
}
