"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useOs } from "./OsProvider";
import { useOsT } from "./useOsT";

function roleLabel(role: string | undefined, t: ReturnType<typeof useOsT>["t"]) {
  if (role === "founder" || role === "director" || role === "superadmin") return t.gate.ceo.title;
  if (role === "teacher") return t.gate.teacher.title;
  if (role === "student") return t.gate.student.title;
  if (role === "finance") return t.nav.desk;
  return t.gate.admin.title;
}

export default function AccountMenu() {
  const router = useRouter();
  const { user, session, theme, setTheme, signOut } = useOs();
  const { lang, setLang, t } = useOsT();
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  return (
    <div className="os-account" ref={root}>
      <button
        type="button"
        className="os-avatar-btn"
        aria-label={t.account.profile}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="os-avatar">{user.initials}</span>
      </button>
      {open ? (
        <div className="os-account-menu" role="menu">
          <div className="os-account-id">
            <strong>{session?.name ?? user.name}</strong>
            <span>{session?.matricule}</span>
            <span>{roleLabel(session?.role, t)}</span>
          </div>
          <p className="os-account-label">{t.account.language}</p>
          <div className="os-product-switch">
            <button type="button" className={lang === "fr" ? "active" : ""} onClick={() => setLang("fr")}>
              FR
            </button>
            <button type="button" className={lang === "en" ? "active" : ""} onClick={() => setLang("en")}>
              EN
            </button>
          </div>
          <p className="os-account-label">{t.account.appearance}</p>
          <div className="os-product-switch">
            <button type="button" className={theme === "light" ? "active" : ""} onClick={() => setTheme("light")}>
              {t.account.light}
            </button>
            <button type="button" className={theme === "dark" ? "active" : ""} onClick={() => setTheme("dark")}>
              {t.account.dark}
            </button>
          </div>
          <button
            type="button"
            className="os-account-exit"
            onClick={() => {
              setOpen(false);
              signOut();
              router.push("/os");
            }}
          >
            {t.nav.exit}
          </button>
        </div>
      ) : null}
    </div>
  );
}
