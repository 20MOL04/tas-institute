"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import { LastWordAccent } from "./AccentTitle";

interface PageHeroProps {
  src: string;
  alt: string;
  eyebrow?: string;
  title: string;
  subtitle?: string;
  children?: ReactNode;
}

export default function PageHero({ src, alt, eyebrow, title, subtitle, children }: PageHeroProps) {
  return (
    <section className="page-hero">
      <div className="page-hero-media">
        <Image src={src} alt={alt} fill priority sizes="100vw" />
      </div>
      <div className="page-hero-overlay" aria-hidden="true" />
      <div className="page-hero-copy">
        {eyebrow ? <span className="home-chip">{eyebrow}</span> : null}
        <h1>
          <LastWordAccent title={title} />
        </h1>
        {subtitle ? <p className="lede">{subtitle}</p> : null}
        {children}
      </div>
    </section>
  );
}
