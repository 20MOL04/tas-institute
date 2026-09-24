"use client";

import Link from "next/link";
import { useState } from "react";
import { useLang } from "../LangProvider";
import PageHero from "../components/PageHero";
import PhotoFrame from "../components/PhotoFrame";
import { ARTICLES_BY_DATE, formatArticleDate } from "../lib/articles";

export default function ResourcesContent() {
  const { t, lang } = useLang();
  const [tag, setTag] = useState<string | null>(null);

  // Filtre indexé sur le thème français, pour survivre au changement de langue.
  const tags = Array.from(new Map(ARTICLES_BY_DATE.map((a) => [a.fr.tag, a[lang].tag])));
  const visible = tag ? ARTICLES_BY_DATE.filter((a) => a.fr.tag === tag) : ARTICLES_BY_DATE;
  const filters: [string | null, string][] = [[null, t.resources.allTags], ...tags];
  const [lead, ...rest] = visible;

  return (
    <>
      <PageHero
        src="/images/hero-resources.jpg"
        alt=""
        eyebrow={t.resources.heroEyebrow}
        title={t.resources.heroTitle}
        subtitle={t.resources.heroSubtitle}
        objectPosition="70% 42%"
      />

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="article-filters" role="group" aria-label={t.resources.heroEyebrow}>
            {filters.map(([value, label]) => (
              <button
                key={value ?? "all"}
                type="button"
                className={`share-chip${tag === value ? " is-active" : ""}`}
                aria-pressed={tag === value}
                onClick={() => setTag(value)}
              >
                {label}
              </button>
            ))}
          </div>

          {lead ? (
            <Link href={`/resources/${lead.slug}`} className="card card-hover article-lead">
              <PhotoFrame src={lead.image} alt={lead[lang].imageAlt} ratio="16-10" sizes="(max-width: 900px) 100vw, 55vw" />
              <div className="card-body">
                <span className="badge">{lead[lang].tag}</span>
                <h2>{lead[lang].title}</h2>
                <p className="muted">{lead[lang].excerpt}</p>
                <p className="small muted">
                  {formatArticleDate(lead.publishedAt, lang)} · {lead.readMinutes} {t.resources.minRead}
                </p>
                <span className="btn-ghost small" style={{ alignSelf: "start" }}>
                  {t.resources.readMore}
                </span>
              </div>
            </Link>
          ) : null}

          <div className="grid grid-3" style={{ marginTop: "var(--space-3)" }}>
            {rest.map((post) => (
              <Link key={post.slug} href={`/resources/${post.slug}`} className="card card-hover">
                <PhotoFrame src={post.image} alt="" ratio="16-10" sizes="(max-width: 1023px) 100vw, 33vw" />
                <div className="card-body">
                  <span className="badge">{post[lang].tag}</span>
                  <h3 style={{ fontSize: "1.1rem" }}>{post[lang].title}</h3>
                  <p className="small muted">{post[lang].excerpt}</p>
                  <p className="small muted">
                    {post.readMinutes} {t.resources.minRead}
                  </p>
                  <span className="btn-ghost small" style={{ alignSelf: "start" }}>
                    {t.resources.readMore}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section-navy section-tight">
        <div className="container" style={{ textAlign: "center" }}>
          <h2>{t.home.finalCtaTitle}</h2>
          <Link href="/apply" className="btn btn-primary" style={{ marginTop: "var(--space-2)" }}>
            {t.home.finalCtaButton}
          </Link>
        </div>
      </section>
    </>
  );
}
