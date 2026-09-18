"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useLang } from "../LangProvider";
import Logo from "./Logo";

// Nav links only to the 8 pages actually built (per brief) — no dead links
// to Accommodation / University Guidance / Gallery / Resources.
const NAV_ITEMS = [
  { href: "/", key: "home" as const },
  { href: "/about", key: "about" as const },
  { href: "/programs", key: "programs" as const },
  { href: "/teachers", key: "teachers" as const },
  { href: "/student-stories", key: "stories" as const },
  { href: "/contact", key: "contact" as const },
];

// A real WhatsApp number has not been confirmed yet (brief rule 9: never
// invent coordinates). Rather than ship a fake wa.me link across every
// page, the header/footer WhatsApp buttons route to the Contact page,
// where the placeholder number is shown honestly as "TO CONFIRM" next to
// the real WhatsApp CTA. Judgment call — flagged in the handoff report.
const WHATSAPP_HREF = "/contact#whatsapp";

export default function Header() {
  const { t } = useLang();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <header className="site-header">
      <div className="container">
        <Link href="/" className="brand" onClick={() => setOpen(false)}>
          <Logo />
          {/* Two-line wordmark (bold name / small tracked "INSTITUTE"),
              matching the reference — was a single flat line before. */}
          <span className="brand-name">
            TAS English
            <span className="brand-suffix">INSTITUTE</span>
          </span>
        </Link>

        <nav className="main-nav" aria-label="Primary">
          <ul>
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className={isActive(item.href) ? "active" : ""}>
                  {t.nav[item.key]}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="header-actions">
          {/* Primary CTA on every page: kept at the default .btn 44px
              min-height (spec §58 touch-target rule), not .btn-sm — a
              header action is never "secondary UI chrome". */}
          <Link href={WHATSAPP_HREF} className="btn btn-whatsapp">
            <span className="dot" aria-hidden="true" />
            {t.nav.whatsapp}
          </Link>
          <Link href="/apply" className="btn btn-primary">
            {t.nav.applyNow}
          </Link>
          <button
            type="button"
            className={`hamburger${open ? " open" : ""}`}
            aria-label="Menu"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <span />
          </button>
        </div>
      </div>

      <div className={`mobile-nav${open ? " open" : ""}`}>
        <ul>
          {NAV_ITEMS.map((item) => (
            <li key={item.href}>
              <Link href={item.href} className={isActive(item.href) ? "active" : ""} onClick={() => setOpen(false)}>
                {t.nav[item.key]}
              </Link>
            </li>
          ))}
        </ul>
        <div className="header-actions">
          <Link href={WHATSAPP_HREF} className="btn btn-whatsapp btn-block" onClick={() => setOpen(false)}>
            <span className="dot" aria-hidden="true" />
            {t.nav.whatsapp}
          </Link>
          <Link href="/apply" className="btn btn-primary btn-block" onClick={() => setOpen(false)}>
            {t.nav.applyNow}
          </Link>
        </div>
      </div>
    </header>
  );
}
