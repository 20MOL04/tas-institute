"use client";

import Image from "next/image";

/** 18 slots. Swap the files in public/images when the real portraits arrive. */
export const TEACHER_PHOTOS = [
  "/images/teacher-1.jpg",
  "/images/teacher-2.jpg",
  "/images/teacher-3.jpg",
  "/images/teacher-4.jpg",
  "/images/hero-teachers.png",
  "/images/cta-student.png",
  "/images/student-1.jpg",
  "/images/student-2.jpg",
  "/images/student-3.jpg",
  "/images/student-story-1.jpg",
  "/images/student-story-2.jpg",
  "/images/avatar-1.jpg",
  "/images/avatar-2.jpg",
  "/images/avatar-3.jpg",
  "/images/avatar-4.jpg",
  "/images/hero-about.png",
  "/images/hero-stories.png",
  "/images/about-campus.jpg",
];

function Cell({ src }: { src: string }) {
  return (
    <span className="teacher-marquee-cell">
      <Image src={src} alt="" fill sizes="180px" />
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

export default function TeacherMarquee({ photos = TEACHER_PHOTOS }: { photos?: string[] }) {
  const mid = Math.ceil(photos.length / 2);
  return (
    <div className="teacher-marquee" aria-hidden="true">
      <Row photos={photos.slice(0, mid)} />
      <Row photos={photos.slice(mid)} reverse />
    </div>
  );
}
