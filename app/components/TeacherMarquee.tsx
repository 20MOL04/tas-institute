"use client";

import Image from "./FadeImage";

import { TEACHER_PHOTOS } from "../lib/teachers";

export { TEACHER_PHOTOS };

/** Assez de cases pour couvrir un grand écran même avec peu de photos. */
const MIN_CELLS = 12;

function fill(photos: string[]) {
  if (photos.length === 0) return [];
  const out: string[] = [];
  while (out.length < MIN_CELLS) out.push(...photos);
  return out;
}

function Cell({ src }: { src: string }) {
  return (
    <span className="teacher-marquee-cell">
      <Image src={src} alt="" fill sizes="180px" style={{ objectPosition: "50% 20%" }} />
    </span>
  );
}

function Row({ photos, reverse }: { photos: string[]; reverse?: boolean }) {
  return (
    <div className={`teacher-marquee-row${reverse ? " is-reverse" : ""}`}>
      <div className="teacher-marquee-track">
        {photos.map((src, i) => (
          <Cell key={`a-${i}`} src={src} />
        ))}
        <div className="teacher-marquee-copy" aria-hidden>
          {photos.map((src, i) => (
            <Cell key={`b-${i}`} src={src} />
          ))}
        </div>
      </div>
    </div>
  );
}

// Deux rangées avec toute l'équipe, dans deux ordres différents, pour que
// deux mêmes visages ne se retrouvent pas l'un au-dessus de l'autre.
export default function TeacherMarquee({ photos = TEACHER_PHOTOS }: { photos?: string[] }) {
  const half = Math.ceil(photos.length / 2);
  const shifted = [...photos.slice(half), ...photos.slice(0, half)];
  return (
    <div className="teacher-marquee" aria-hidden="true">
      <Row photos={fill(photos)} />
      <Row photos={fill(shifted)} reverse />
    </div>
  );
}
