"use client";

function GraduationCapGlyph() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" style={{ width: "62%", height: "62%" }}>
      <path d="M12 3.2 2 8l10 4.8L22 8 12 3.2Z" fill="currentColor" />
      <path d="M6 10.9V15c0 1.66 2.69 3 6 3s6-1.34 6-3v-4.1l-6 2.9-6-2.9Z" fill="currentColor" opacity="0.85" />
      <path d="M21 9v5.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export default function Logo() {
  return (
    <span className="brand-mark" aria-hidden="true">
      <span className="fallback">
        <GraduationCapGlyph />
      </span>
    </span>
  );
}
