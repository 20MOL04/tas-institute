"use client";

// Small header/footer logo mark. Expects `favicon-source.png` (see the
// image table in CAHIER-DES-CHARGES.md) once Martin drops in the real
// TAS logo. Until then — or if it 404s — falls back to an inline SVG
// graduation-cap mark instead of plain "TAS" text. A designed glyph
// reads as "this is a real, finished brand"; three letters in a box
// read as "this is a placeholder" — the QA audit flagged the old
// text-only fallback as the single biggest visible gap versus a real
// logo, and since it's rendered in the sticky header on every page,
// it's the highest-impact fix available without a real asset in hand.
import Image from "next/image";
import { useState } from "react";

function GraduationCapGlyph() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" style={{ width: "60%", height: "60%" }}>
      <path
        d="M12 3.2 2 8l10 4.8L22 8 12 3.2Z"
        fill="currentColor"
      />
      <path
        d="M6 10.9V15c0 1.66 2.69 3 6 3s6-1.34 6-3v-4.1l-6 2.9-6-2.9Z"
        fill="currentColor"
        opacity="0.82"
      />
      <path d="M21 9v5.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export default function Logo() {
  const [failed, setFailed] = useState(false);

  return (
    <span className="brand-mark">
      {!failed ? (
        <Image
          src="/images/favicon-source.png"
          alt=""
          fill
          sizes="38px"
          onError={() => setFailed(true)}
        />
      ) : (
        <span className="fallback" aria-hidden="true">
          <GraduationCapGlyph />
        </span>
      )}
    </span>
  );
}
