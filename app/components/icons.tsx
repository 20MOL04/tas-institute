// Small hand-drawn icon set for the Trust/Why-TAS cards, which the QA
// audit flagged as carrying no icon at all (Trust) or one generic
// checkmark reused for every item regardless of topic (Why TAS) — the
// reference mockup gives each item its own pictogram. currentColor-based
// so they inherit the accent color wherever they're placed, same pattern
// as every other icon-bearing component in this file tree.

type IconProps = { className?: string };
const base = { viewBox: "0 0 24 24", fill: "none", "aria-hidden": true as const, style: { width: 22, height: 22 } };

export function IconPeople({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <circle cx="9" cy="8" r="3" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3.5 19c0-3 2.5-5 5.5-5s5.5 2 5.5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="17" cy="8.5" r="2.4" stroke="currentColor" strokeWidth="1.6" opacity="0.7" />
      <path d="M15.5 14.2c2.5 0.3 4.3 2.1 4.3 4.8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" opacity="0.7" />
    </svg>
  );
}

export function IconBook({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M4 5.5c1.6-.8 3.6-1 5.5-.3.6.2 1 .8 1 1.4V18c-2-1-4.3-.9-6.5.2V5.5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M20 5.5c-1.6-.8-3.6-1-5.5-.3-.6.2-1 .8-1 1.4V18c2-1 4.3-.9 6.5.2V5.5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

export function IconGlobe({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <circle cx="12" cy="12" r="8.2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M4 12h16M12 3.8c2.3 2.2 3.5 5.1 3.5 8.2s-1.2 6-3.5 8.2c-2.3-2.2-3.5-5.1-3.5-8.2S9.7 6 12 3.8Z" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

export function IconPin({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M12 21s6.5-6.2 6.5-11A6.5 6.5 0 0 0 5.5 10c0 4.8 6.5 11 6.5 11Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <circle cx="12" cy="10" r="2.3" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}
