/**
 * Icon set for the internal product. Stroke icons on a 24 grid, 1.75 weight,
 * inheriting `currentColor` and sized by CSS — never emojis.
 */

type Props = { className?: string };

function I({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      width={20}
      height={20}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  );
}

export const IcGrid = (p: Props) => (
  <I {...p}>
    <rect x="3" y="3" width="7" height="7" rx="1.5" />
    <rect x="14" y="3" width="7" height="7" rx="1.5" />
    <rect x="3" y="14" width="7" height="7" rx="1.5" />
    <rect x="14" y="14" width="7" height="7" rx="1.5" />
  </I>
);

export const IcTrend = (p: Props) => (
  <I {...p}>
    <path d="M3 17l6-6 4 4 7-7" />
    <path d="M14 8h6v6" />
  </I>
);

export const IcUsers = (p: Props) => (
  <I {...p}>
    <path d="M16 19v-1.5a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4V19" />
    <circle cx="9" cy="7" r="3.2" />
    <path d="M22 19v-1.5a4 4 0 0 0-3-3.87" />
    <path d="M16 4.13a4 4 0 0 1 0 5.74" />
  </I>
);

export const IcUser = (p: Props) => (
  <I {...p}>
    <circle cx="12" cy="8" r="3.6" />
    <path d="M4.5 20a7.5 7.5 0 0 1 15 0" />
  </I>
);

export const IcGraduation = (p: Props) => (
  <I {...p}>
    <path d="M2.5 8.5 12 4l9.5 4.5L12 13 2.5 8.5Z" />
    <path d="M6 10.6V16c0 1.4 2.7 2.6 6 2.6s6-1.2 6-2.6v-5.4" />
    <path d="M21.5 8.5v5" />
  </I>
);

export const IcFunnel = (p: Props) => (
  <I {...p}>
    <path d="M3 4.5h18l-7 8v7l-4 2v-9l-7-8Z" />
  </I>
);

export const IcMegaphone = (p: Props) => (
  <I {...p}>
    <path d="M3 11v2a1 1 0 0 0 1 1h2l5 4V6L6 10H4a1 1 0 0 0-1 1Z" />
    <path d="M15 9a3.5 3.5 0 0 1 0 6" />
    <path d="M18 6.5a7 7 0 0 1 0 11" />
  </I>
);

export const IcWallet = (p: Props) => (
  <I {...p}>
    <rect x="3" y="6" width="18" height="13" rx="2.5" />
    <path d="M3 10h18" />
    <circle cx="16.5" cy="14.5" r="1.2" />
  </I>
);

export const IcFile = (p: Props) => (
  <I {...p}>
    <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z" />
    <path d="M14 3v5h5" />
  </I>
);

export const IcClipboard = (p: Props) => (
  <I {...p}>
    <rect x="5" y="4" width="14" height="17" rx="2" />
    <path d="M9 4.5V3.6A1.6 1.6 0 0 1 10.6 2h2.8A1.6 1.6 0 0 1 15 3.6v.9" />
    <path d="M9 11h6M9 15h4" />
  </I>
);

export const IcCalendar = (p: Props) => (
  <I {...p}>
    <rect x="3.5" y="5" width="17" height="16" rx="2.5" />
    <path d="M3.5 10h17M8 3v4M16 3v4" />
  </I>
);

export const IcCheckCircle = (p: Props) => (
  <I {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M8.5 12.5l2.4 2.4 4.6-5" />
  </I>
);

export const IcAlert = (p: Props) => (
  <I {...p}>
    <path d="M12 3.8 2.9 19.2a1.2 1.2 0 0 0 1 1.8h16.2a1.2 1.2 0 0 0 1-1.8L12 3.8Z" />
    <path d="M12 9.5v4.2M12 17.2h.01" />
  </I>
);

export const IcBell = (p: Props) => (
  <I {...p}>
    <path d="M18 15.5V11a6 6 0 1 0-12 0v4.5L4.5 18h15L18 15.5Z" />
    <path d="M9.8 21a2.4 2.4 0 0 0 4.4 0" />
  </I>
);

export const IcSearch = (p: Props) => (
  <I {...p}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="M16 16l4.5 4.5" />
  </I>
);

export const IcChevronDown = (p: Props) => (
  <I {...p}>
    <path d="M6 9.5l6 6 6-6" />
  </I>
);

export const IcChevronLeft = (p: Props) => (
  <I {...p}>
    <path d="M14.5 6l-6 6 6 6" />
  </I>
);

export const IcChevronRight = (p: Props) => (
  <I {...p}>
    <path d="M9.5 6l6 6-6 6" />
  </I>
);

export const IcArrowUp = (p: Props) => (
  <I {...p}>
    <path d="M12 19V5M6 11l6-6 6 6" />
  </I>
);

export const IcArrowDown = (p: Props) => (
  <I {...p}>
    <path d="M12 5v14M6 13l6 6 6-6" />
  </I>
);

export const IcMinus = (p: Props) => (
  <I {...p}>
    <path d="M5 12h14" />
  </I>
);

export const IcPlus = (p: Props) => (
  <I {...p}>
    <path d="M12 5v14M5 12h14" />
  </I>
);

export const IcClose = (p: Props) => (
  <I {...p}>
    <path d="M6 6l12 12M18 6L6 18" />
  </I>
);

export const IcMenu = (p: Props) => (
  <I {...p}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </I>
);

export const IcDownload = (p: Props) => (
  <I {...p}>
    <path d="M12 4v10M8 10.5l4 4 4-4" />
    <path d="M5 19h14" />
  </I>
);

export const IcFilter = (p: Props) => (
  <I {...p}>
    <path d="M4 6h16M7 12h10M10 18h4" />
  </I>
);

export const IcBuilding = (p: Props) => (
  <I {...p}>
    <rect x="4" y="3.5" width="10" height="17" rx="1.6" />
    <path d="M14 9h4.5A1.5 1.5 0 0 1 20 10.5v10" />
    <path d="M7.5 7.5h3M7.5 11h3M7.5 14.5h3M17 13h0M17 16.5h0M4 20.5h16" />
  </I>
);

export const IcVideo = (p: Props) => (
  <I {...p}>
    <rect x="3" y="5.5" width="13" height="13" rx="2" />
    <path d="M16 11l5-3v8l-5-3v-2Z" />
  </I>
);

export const IcCoins = (p: Props) => (
  <I {...p}>
    <ellipse cx="12" cy="6.5" rx="7" ry="3" />
    <path d="M5 6.5v5c0 1.7 3.1 3 7 3s7-1.3 7-3v-5" />
    <path d="M5 11.5v5c0 1.7 3.1 3 7 3s7-1.3 7-3v-5" />
  </I>
);

export const IcSettings = (p: Props) => (
  <I {...p}>
    <circle cx="12" cy="12" r="3.2" />
    <path d="M19.4 14.5a1.6 1.6 0 0 0 .3 1.8l.1.1a1.7 1.7 0 1 1-2.4 2.4l-.1-.1a1.6 1.6 0 0 0-2.7 1.1v.2a1.7 1.7 0 1 1-3.4 0v-.1a1.6 1.6 0 0 0-2.7-1.2l-.1.1a1.7 1.7 0 1 1-2.4-2.4l.1-.1a1.6 1.6 0 0 0-1.1-2.7H5a1.7 1.7 0 1 1 0-3.4h.1a1.6 1.6 0 0 0 1.2-2.7l-.1-.1a1.7 1.7 0 1 1 2.4-2.4l.1.1a1.6 1.6 0 0 0 2.7-1.1V5a1.7 1.7 0 1 1 3.4 0v.1a1.6 1.6 0 0 0 2.7 1.2l.1-.1a1.7 1.7 0 1 1 2.4 2.4l-.1.1a1.6 1.6 0 0 0 1.1 2.7h.2a1.7 1.7 0 1 1 0 3.4h-.1a1.6 1.6 0 0 0-1.5 1.1Z" />
  </I>
);

export const IcBook = (p: Props) => (
  <I {...p}>
    <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H19v15H6.5A2.5 2.5 0 0 0 4 20.5v-15Z" />
    <path d="M4 20.5A2.5 2.5 0 0 1 6.5 18H19v3H6.5" />
  </I>
);

export const IcChat = (p: Props) => (
  <I {...p}>
    <path d="M4 5.5h16v10H9l-5 4v-14Z" />
    <path d="M8.5 10h7" />
  </I>
);

export const IcClock = (p: Props) => (
  <I {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7.5V12l3 2" />
  </I>
);

export const IcMapPin = (p: Props) => (
  <I {...p}>
    <path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11Z" />
    <circle cx="12" cy="10" r="2.6" />
  </I>
);

export const IcPhone = (p: Props) => (
  <I {...p}>
    <path d="M5 3.5h3.2l1.6 4-2 1.4a11 11 0 0 0 5.3 5.3l1.4-2 4 1.6V17c0 1.4-1.1 2.5-2.5 2.5A14.5 14.5 0 0 1 2.5 5C2.5 3.6 3.6 2.5 5 2.5Z" />
  </I>
);

export const IcMail = (p: Props) => (
  <I {...p}>
    <rect x="3" y="5.5" width="18" height="13" rx="2.5" />
    <path d="M4 7.5l8 5.5 8-5.5" />
  </I>
);

export const IcLayers = (p: Props) => (
  <I {...p}>
    <path d="M12 3l8.5 4.5L12 12 3.5 7.5 12 3Z" />
    <path d="M4 12.5 12 17l8-4.5" />
    <path d="M4 17 12 21.5 20 17" />
  </I>
);

export const IcTable = (p: Props) => (
  <I {...p}>
    <rect x="3.5" y="4.5" width="17" height="15" rx="2" />
    <path d="M3.5 9.5h17M9.5 9.5v10" />
  </I>
);

export const IcExternal = (p: Props) => (
  <I {...p}>
    <path d="M14 4h6v6" />
    <path d="M20 4l-9 9" />
    <path d="M18 14v4.5A1.5 1.5 0 0 1 16.5 20h-11A1.5 1.5 0 0 1 4 18.5v-11A1.5 1.5 0 0 1 5.5 6H10" />
  </I>
);

export const IcHome = (p: Props) => (
  <I {...p}>
    <path d="M4 10.5 12 4l8 6.5V19a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 19v-8.5Z" />
    <path d="M9.5 20.5V14h5v6.5" />
  </I>
);
