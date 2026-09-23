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

export function IconPhone({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path
        d="M6.4 3.8h2.3l1.5 3.6-2 1.4a10.6 10.6 0 0 0 5 5l1.4-2 3.6 1.5v2.3c0 1.4-1.2 2.5-2.6 2.3C9.9 17.4 6.6 14.1 4.1 6.4c-.2-1.4.9-2.6 2.3-2.6Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconMail({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <rect x="3.2" y="5.5" width="17.6" height="13" rx="2.2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M4 7l8 5.6L20 7" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

export function IconBus({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <rect x="4.5" y="3.8" width="15" height="13.4" rx="2.4" stroke="currentColor" strokeWidth="1.6" />
      <path d="M4.5 11.5h15M8 17.2v2.2M16 17.2v2.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="8.6" cy="14.4" r="1" fill="currentColor" />
      <circle cx="15.4" cy="14.4" r="1" fill="currentColor" />
    </svg>
  );
}

export function IconWhatsApp({ className }: IconProps) {
  return (
    <svg className={className ?? "wa-icon"} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12.04 2C6.58 2 2.15 6.4 2.15 11.84c0 1.97.52 3.89 1.51 5.58L2 22l4.74-1.55a9.86 9.86 0 0 0 5.3 1.48h.01c5.46 0 9.89-4.4 9.89-9.84C21.94 6.4 17.5 2 12.04 2Zm5.76 13.96c-.24.68-1.4 1.25-1.93 1.33-.5.08-1.13.11-1.82-.11-.42-.14-.96-.31-1.65-.6-2.9-1.25-4.78-4.17-4.93-4.36-.14-.2-1.18-1.57-1.18-3 0-1.42.74-2.12 1-2.41.26-.29.57-.36.76-.36h.55c.17 0 .41-.07.64.49.24.58.82 2 .89 2.15.07.14.12.31.02.5-.1.2-.15.32-.3.49-.14.17-.3.38-.43.51-.14.14-.29.29-.12.56.16.28.72 1.19 1.55 1.93 1.06.95 1.96 1.24 2.23 1.38.28.14.44.12.6-.07.17-.2.7-.81.88-1.09.19-.28.37-.23.62-.14.26.1 1.63.77 1.91.91.28.14.47.21.54.33.07.12.07.68-.17 1.36Z" />
    </svg>
  );
}

export function IconFacebook({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M14.2 8.4h2.3V5.2h-2.3c-2.6 0-4.3 1.6-4.3 4.3v1.7H8.2v3.2h1.7V21h3.4v-6.6h2.5l.5-3.2h-3V9.6c0-.8.4-1.2 1.2-1.2Z" />
    </svg>
  );
}

export function IconInstagram({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3.6" y="3.6" width="16.8" height="16.8" rx="5" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="12" cy="12" r="3.6" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="16.7" cy="7.3" r="1" fill="currentColor" />
    </svg>
  );
}

export function IconYoutube({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M21.6 8.2a2.8 2.8 0 0 0-2-2C18 5.8 12 5.8 12 5.8s-6 0-7.6.4a2.8 2.8 0 0 0-2 2A29 29 0 0 0 2 12a29 29 0 0 0 .4 3.8 2.8 2.8 0 0 0 2 2c1.6.4 7.6.4 7.6.4s6 0 7.6-.4a2.8 2.8 0 0 0 2-2A29 29 0 0 0 22 12a29 29 0 0 0-.4-3.8ZM10.2 15.1V8.9L15.5 12l-5.3 3.1Z" />
    </svg>
  );
}

/** Checklist mark. Heavier stroke than the rest of the set on purpose: it sits
 *  inside a 20px disc, where a 1.6 stroke reads as a hairline. */
export function IconCheck({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className} style={{ width: 13, height: 13 }}>
      <path d="M5 12.5l4.4 4.4L19 7.4" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconInfo({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <circle cx="12" cy="12" r="8.2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 11v5.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="12" cy="8" r="1.05" fill="currentColor" />
    </svg>
  );
}

export function IconClock({ className }: IconProps) {
  return (
    <svg {...base} className={className}>
      <circle cx="12" cy="12" r="8.2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 7.6V12l3.2 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
