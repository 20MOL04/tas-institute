"use client";

import Link from "next/link";
import { useLang } from "../../LangProvider";
import PhotoFrame from "../../components/PhotoFrame";
import ArticleBody from "../../components/ArticleBody";
import ShareBar from "../../components/ShareBar";
import { IconClock, IconWhatsApp } from "../../components/icons";
import { formatArticleDate, getArticle, relatedArticles } from "../../lib/articles";
import { useSiteContent } from "../../lib/useSiteContent";
import { whatsappLinkFromDisplay } from "../../lib/siteStore";

export default function ArticleContent({ slug }: { slug: string }) {
  const { t, lang } = useLang();
  const site = useSiteContent();
  const article = getArticle(slug)!;
  const copy = article[lang];
  const related = relatedArticles(slug);
  const ask = whatsappLinkFromDisplay(site.whatsapp, t.resources.askMessage.replace("{title}", copy.title));

  return (
    <>
      <article>
        <header className="section-tight hero-halo article-head">
          <div className="container article-narrow">
            <div className="small muted article-crumb">
              <Link href="/resources">{t.resources.heroEyebrow}</Link> / {copy.tag}
            </div>
            <span className="badge">{copy.tag}</span>
            <h1 className="article-title">{copy.title}</h1>
            <p className="lede">{copy.excerpt}</p>
            <div className="article-meta small muted">
              <time dateTime={article.publishedAt}>{formatArticleDate(article.publishedAt, lang)}</time>
              <span aria-hidden="true">·</span>
              <span className="article-meta-read">
                <IconClock /> {article.readMinutes} {t.resources.minRead}
              </span>
            </div>
          </div>
          <div className="container article-wide">
            <PhotoFrame src={article.image} alt={copy.imageAlt} ratio="21-9" priority sizes="(max-width: 1023px) 100vw, 960px" />
          </div>
        </header>

        <div className="section" style={{ paddingTop: 0 }}>
          <div className="container article-narrow">
            <ArticleBody blocks={copy.blocks} />
            <ShareBar path={`/resources/${article.slug}`} title={copy.title} shareText={copy.shareText} />

            <aside className="article-ask">
              <div>
                <h2>{t.resources.askTitle}</h2>
                <p className="small muted">{t.resources.askText}</p>
              </div>
              <a href={ask} className="btn btn-whatsapp" target="_blank" rel="noopener noreferrer">
                <IconWhatsApp /> {t.resources.askCta}
              </a>
            </aside>
          </div>
        </div>
      </article>

      <section className="section section-alt">
        <div className="container">
          <div className="article-related-head">
            <h2>{t.resources.relatedTitle}</h2>
            <Link href="/resources" className="btn-ghost small">
              {t.resources.allArticles}
            </Link>
          </div>
          <div className="grid grid-3">
            {related.map((a) => (
              <Link key={a.slug} href={`/resources/${a.slug}`} className="card card-hover">
                <PhotoFrame src={a.image} alt="" ratio="16-10" sizes="(max-width: 1023px) 100vw, 33vw" />
                <div className="card-body">
                  <span className="badge">{a[lang].tag}</span>
                  <h3 style={{ fontSize: "1.05rem" }}>{a[lang].title}</h3>
                  <p className="small muted">
                    {a.readMinutes} {t.resources.minRead}
                  </p>
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
