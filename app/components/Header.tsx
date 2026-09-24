"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useLang } from "../LangProvider";
import Logo from "./Logo";
import { IconWhatsApp } from "./icons";
import { useSiteContent } from "../lib/useSiteContent";
import { whatsappUrlFromDisplay } from "../lib/siteStore";

const NAV_PRIMARY = [
  { href: "/", key: "home" as const },
  { href: "/programs", key: "programs" as const },
  { href: "/accommodation", key: "accommodation" as const },
  { href: "/about", key: "about" as const },
  { href: "/contact", key: "contact" as const },
];

const NAV_MORE = [
  { href: "/university-guidance", key: "universityGuidance" as const },
  { href: "/teachers", key: "teachers" as const },
  { href: "/student-stories", key: "stories" as const },
  { href: "/gallery", key: "gallery" as const },
  { href: "/resources", key: "resources" as const },
];

export default function Header() {
  const { t } = useLang();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const site = useSiteContent();
  const wa = whatsappUrlFromDisplay(site.whatsapp);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  useEffect(() => setOpen(false), [pathname]);

  // The drawer overlays the page, so freeze the page behind it and let Escape close it.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <header className="site-header">
        <div className="container">
          <Link href="/" className="brand" aria-label="TAS English Institute" onClick={() => setOpen(false)}>
            <Logo />
            <span className="brand-name" aria-hidden="true">
              English
              <span className="brand-suffix">INSTITUTE</span>
            </span>
          </Link>

          <nav className="main-nav" aria-label="Primary">
            <ul>
              {NAV_PRIMARY.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={isActive(item.href) ? "active" : ""}
                  >
                    {t.nav[item.key]}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="header-actions">
            <a href={wa} className="btn btn-whatsapp btn-sm header-wa" target="_blank" rel="noopener noreferrer">
              <IconWhatsApp />
              {t.nav.whatsapp}
            </a>
            <Link href="/apply" className="btn btn-primary btn-sm">
              {t.nav.applyNow}
            </Link>
            <button
              type="button"
              className={`hamburger${open ? " open" : ""}`}
              aria-label="Menu"
              aria-expanded={open}
              aria-controls="mobile-nav"
              onClick={() => setOpen((v) => !v)}
            >
              <span />
            </button>
          </div>
        </div>
      </header>

      <div
        className={`mobile-scrim${open ? " open" : ""}`}
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />

      <div
        className={`mobile-nav${open ? " open" : ""}`}
        id="mobile-nav"
        aria-hidden={!open}
      >
        <div className="mobile-nav-head">
          <span className="mobile-nav-title">Menu</span>
          <button
            type="button"
            className="mobile-close"
            aria-label={t.nav.closeMenu}
            onClick={() => setOpen(false)}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              aria-hidden="true"
            >
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        <nav className="mobile-nav-group" aria-label="Mobile primary">
          <ul>
            {NAV_PRIMARY.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={isActive(item.href) ? "active" : ""}
                  onClick={() => setOpen(false)}
                >
                  {t.nav[item.key]}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav className="mobile-nav-group" aria-label="Mobile secondary">
          <span className="mobile-nav-label">{t.nav.exploreMore}</span>
          <ul>
            {NAV_MORE.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={isActive(item.href) ? "active" : ""}
                  onClick={() => setOpen(false)}
                >
                  {t.nav[item.key]}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="mobile-nav-foot">
          <Link
            href="/apply"
            className="btn btn-primary btn-block"
            onClick={() => setOpen(false)}
          >
            {t.nav.applyNow}
          </Link>
          <a
            href={wa}
            className="btn btn-whatsapp btn-block"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setOpen(false)}
          >
            <IconWhatsApp />
            {t.nav.whatsapp}
          </a>
        </div>
      </div>
    </>
  );
}
