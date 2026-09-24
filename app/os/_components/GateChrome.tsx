"use client";

import { useOsT } from "./useOsT";
import BrandIcon from "../../components/BrandIcon";

export function LangSwitch() {
  const { lang, setLang } = useOsT();
  return (
    <div className="os-product-switch" role="group" aria-label="Language">
      <button type="button" className={lang === "fr" ? "active" : ""} onClick={() => setLang("fr")}>
        FR
      </button>
      <button type="button" className={lang === "en" ? "active" : ""} onClick={() => setLang("en")}>
        EN
      </button>
    </div>
  );
}

export function GateChrome({ children }: { children: React.ReactNode }) {
  const { t } = useOsT();
  return (
    <div className="os os-gate-wrap">
      <header className="os-gate-bar">
        <span className="os-gate-brand">
          <BrandIcon size={32} />
          <span className="os-gate-kicker">{t.gate.kicker}</span>
        </span>
        <LangSwitch />
      </header>
      <main className="os-gate-main">{children}</main>
    </div>
  );
}
