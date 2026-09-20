"use client";

import { useRef, type ReactNode } from "react";

export default function HSlide({
  children,
  label,
  className,
}: {
  children: ReactNode;
  label: string;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const move = (dir: -1 | 1) => {
    const el = ref.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>(":scope > *");
    const gap = 16;
    const step = (card?.getBoundingClientRect().width ?? 252) + gap;
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  };

  return (
    <div className="h-rail">
      <div className={`h-slide${className ? ` ${className}` : ""}`} ref={ref} role="list" aria-label={label}>
        {children}
      </div>
      <div className="h-rail-actions">
        <button type="button" className="h-rail-nav" aria-label="Précédent" onClick={() => move(-1)}>
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
            <path d="M15 6 9 12l6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <button type="button" className="h-rail-nav" aria-label="Suivant" onClick={() => move(1)}>
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
            <path d="m9 6 6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}
