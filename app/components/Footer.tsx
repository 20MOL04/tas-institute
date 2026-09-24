"use client";

import Link from "next/link";
import { useLang } from "../LangProvider";
import { useSiteContent } from "../lib/useSiteContent";
import { TAS_SCHOOL_PHONES, TAS_SOCIAL } from "../lib/contact";
import { whatsappUrlFromDisplay } from "../lib/siteStore";
import { IconFacebook, IconInstagram, IconYoutube } from "./icons";
import Logo from "./Logo";

const STUDY_LINKS = [
  { href: "/programs", key: "programs" as const },
  { href: "/accommodation", key: "accommodation" as const },
  { href: "/university-guidance", key: "universityGuidance" as const },
  { href: "/apply", key: "apply" as const },
];

const INSTITUTE_LINKS = [
  { href: "/about", key: "about" as const },
  { href: "/teachers", key: "teachers" as const },
  { href: "/student-stories", key: "stories" as const },
  { href: "/gallery", key: "gallery" as const },
  { href: "/resources", key: "resources" as const },
  { href: "/contact", key: "contact" as const },
];

export default function Footer() {
  const { t, lang, setLang } = useLang();
  const site = useSiteContent();
  const wa = whatsappUrlFromDisplay(site.whatsapp);

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link href="/" className="footer-logo" aria-label="TAS English Institute">
              <Logo tone="white" height={56} />
            </Link>
            <div className="footer-title">TAS English Institute</div>
            <p className="small" style={{ maxWidth: "36ch", color: "var(--tas-on-navy-muted)" }}>
              {t.footer.blurb}
            </p>
            <Link href="/apply" className="btn btn-primary btn-sm" style={{ marginTop: 12, alignSelf: "flex-start" }}>
              {t.nav.applyNow}
            </Link>
          </div>

          <div>
            <div className="footer-title">{t.footer.studyTitle}</div>
            <ul>
              {STUDY_LINKS.map((item) => (
                <li key={item.href}>
                  <Link href={item.href}>{t.nav[item.key]}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="footer-title">{t.footer.instituteTitle}</div>
            <ul className="footer-link-cols">
              {INSTITUTE_LINKS.map((item) => (
                <li key={item.href}>
                  <Link href={item.href}>{t.nav[item.key]}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="footer-title">{t.footer.contactTitle}</div>
            <ul>
              <li className="small">{site.address}</li>
              <li className="small">{site.phone}</li>
              {TAS_SCHOOL_PHONES.map((n) => (
                <li key={n} className="small">{n}</li>
              ))}
              <li className="small">{site.email}</li>
              <li>
                <a href={wa} className="btn btn-whatsapp btn-sm" style={{ marginTop: 8 }} target="_blank" rel="noopener noreferrer">
                  {t.nav.whatsapp}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <span>
            © {new Date().getFullYear()} TAS English Institute. {t.footer.rights}
          </span>

          <nav className="footer-social" aria-label={t.footer.socialLabel}>
            {TAS_SOCIAL.map((item) => {
              const Icon = item.id === "facebook" ? IconFacebook : item.id === "instagram" ? IconInstagram : IconYoutube;
              return (
                <a key={item.id} href={item.href} target="_blank" rel="noopener noreferrer" aria-label={item.label}>
                  <Icon />
                </a>
              );
            })}
          </nav>

          <div className="legal-links">
            <Link href="#">{t.footer.terms}</Link>
            <Link href="#">{t.footer.privacy}</Link>
          </div>

          <div className="lang-toggle" role="group" aria-label={t.footer.langLabel}>
            <button type="button" className={lang === "fr" ? "active" : ""} onClick={() => setLang("fr")} aria-pressed={lang === "fr"}>
              FR
            </button>
            <button type="button" className={lang === "en" ? "active" : ""} onClick={() => setLang("en")} aria-pressed={lang === "en"}>
              EN
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
