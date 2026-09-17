"use client";

import Link from "next/link";
import { useLang } from "./LangProvider";

// Root 404. Next.js renders this inside the nearest layout automatically
// (app/layout.tsx), so Header/Footer wrap it the same as every real page —
// before this file existed, any mistyped URL fell through to Next's raw
// unstyled default 404, breaking the "one senior team designed this"
// consistency rule (spec §63) on the single page a visitor reaches by
// accident rather than by navigation.
export default function NotFound() {
  const { t } = useLang();

  return (
    <section className="section" style={{ textAlign: "center" }}>
      <div className="container stack" style={{ alignItems: "center", maxWidth: 560, margin: "0 auto" }}>
        <h1>{t.notFound.title}</h1>
        <p className="lede">{t.notFound.text}</p>
        <Link href="/" className="btn btn-primary" style={{ marginTop: "var(--space-2)" }}>
          {t.notFound.cta}
        </Link>
      </div>
    </section>
  );
}
