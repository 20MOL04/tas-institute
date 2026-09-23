"use client";

import Link from "next/link";
import { useLang } from "../LangProvider";
import PageHero from "../components/PageHero";
import PhotoFrame from "../components/PhotoFrame";

const THUMBS = ["/images/blog-1.jpg", "/images/blog-2.jpg", "/images/blog-3.jpg"];

export default function ResourcesContent() {
  const { t } = useLang();

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
          <div className="grid grid-3">
            {t.resources.posts.map((post, i) => (
              <article key={post.title} className="card card-hover">
                <PhotoFrame src={THUMBS[i % THUMBS.length]} alt="" ratio="16-10" />
                <div className="card-body">
                  <span className="badge">{post.tag}</span>
                  <h3 style={{ fontSize: "1.1rem" }}>{post.title}</h3>
                  <p className="small muted">{post.excerpt}</p>
                  <Link href="/contact" className="btn-ghost small">
                    {t.resources.readMore}
                  </Link>
                </div>
              </article>
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
