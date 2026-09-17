"use client";

import Link from "next/link";
import { useLang } from "../../LangProvider";

export default function ProgramNotFoundContent() {
  const { t } = useLang();

  return (
    <section className="section" style={{ textAlign: "center" }}>
      <div className="container stack" style={{ alignItems: "center", maxWidth: 560, margin: "0 auto" }}>
        <h1>{t.programDetail.notFoundTitle}</h1>
        <p className="lede">{t.programDetail.notFoundText}</p>
        <Link href="/programs" className="btn btn-primary" style={{ marginTop: "var(--space-2)" }}>
          {t.programDetail.notFoundCta}
        </Link>
      </div>
    </section>
  );
}
