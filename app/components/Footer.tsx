"use client";

import Link from "next/link";
import { useLang } from "../LangProvider";

const QUICK_LINKS = [
  { href: "/about", key: "about" as const },
  { href: "/programs", key: "programs" as const },
  { href: "/teachers", key: "teachers" as const },
  { href: "/student-stories", key: "stories" as const },
  { href: "/apply", key: "apply" as const },
];

export default function Footer() {
  const { t, lang, setLang } = useLang();

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <div className="footer-title">TAS English Institute</div>
            <p className="small" style={{ maxWidth: "38ch", color: "rgba(255,255,255,0.72)" }}>
              {t.footer.blurb}
            </p>
          </div>

          <div>
            <div className="footer-title">{t.footer.quickLinksTitle}</div>
            <ul>
              {QUICK_LINKS.map((item) => (
                <li key={item.href}>
                  <Link href={item.href}>{t.nav[item.key]}</Link>
                </li>
              ))}
              <li>
                <Link href="/contact">{t.nav.contact}</Link>
              </li>
            </ul>
          </div>

          <div>
            <div className="footer-title">{t.footer.contactTitle}</div>
            <ul>
              <li className="small">{t.footer.address}</li>
              <li className="small">{t.footer.phone}</li>
              <li className="small">{t.footer.email}</li>
            </ul>
          </div>

          <div>
            <div className="footer-title">{t.footer.legalTitle}</div>
            <ul>
              <li>
                <Link href="#">{t.footer.terms}</Link>
              </li>
              <li>
                <Link href="#">{t.footer.privacy}</Link>
              </li>
              <li className="small" style={{ opacity: 0.6 }}>
                {t.footer.legalNote}
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <span>
            © {new Date().getFullYear()} TAS English Institute. {t.footer.rights}
          </span>

          <div
            className="lang-toggle"
            role="group"
            aria-label={t.footer.langLabel}
          >
            <button
              type="button"
              className={lang === "fr" ? "active" : ""}
              onClick={() => setLang("fr")}
              aria-pressed={lang === "fr"}
            >
              FR
            </button>
            <button
              type="button"
              className={lang === "en" ? "active" : ""}
              onClick={() => setLang("en")}
              aria-pressed={lang === "en"}
            >
              EN
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
