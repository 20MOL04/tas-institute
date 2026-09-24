import type { Metadata } from "next";
import { notFound } from "next/navigation";
import JsonLd from "../../components/JsonLd";
import { ARTICLES, getArticle, ogImagePath, plainText } from "../../lib/articles";
import { ORGANIZATION_REF, SITE_NAME, breadcrumbJsonLd, pageMetadata } from "../../lib/seo";
import { SITE_URL } from "../../lib/site";
import ArticleContent from "./article-content";

export function generateStaticParams() {
  return ARTICLES.map((a) => ({ slug: a.slug }));
}

export const dynamicParams = false;

// Les métadonnées sont en français : c'est la langue par défaut du site et du public visé.
export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const article = getArticle(params.slug);
  if (!article) return { title: "Article" };
  const { title, excerpt, imageAlt, tag } = article.fr;
  const base = pageMetadata({
    title,
    description: excerpt,
    path: `/resources/${article.slug}`,
    og: `article-${article.slug}`,
    ogAlt: imageAlt,
  });
  return {
    ...base,
    keywords: [tag, "apprendre l'anglais", "anglais pour francophones", "Accra", "Ghana"],
    openGraph: {
      ...base.openGraph,
      type: "article",
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt ?? article.publishedAt,
      section: tag,
      authors: [SITE_NAME],
    },
  };
}

export default function ArticlePage({ params }: { params: { slug: string } }) {
  const article = getArticle(params.slug);
  if (!article) notFound();

  const url = `${SITE_URL}/resources/${article.slug}`;
  const articleLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: article.fr.title,
    description: plainText(article.fr.excerpt),
    image: [`${SITE_URL}${article.image}`, `${SITE_URL}${ogImagePath(article.slug)}`],
    datePublished: article.publishedAt,
    dateModified: article.updatedAt ?? article.publishedAt,
    inLanguage: "fr",
    articleSection: article.fr.tag,
    timeRequired: `PT${article.readMinutes}M`,
    mainEntityOfPage: url,
    url,
    author: ORGANIZATION_REF,
    publisher: ORGANIZATION_REF,
  };

  return (
    <>
      <JsonLd data={articleLd} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Accueil", path: "" },
          { name: "Ressources", path: "/resources" },
          { name: article.fr.title, path: `/resources/${article.slug}` },
        ])}
      />
      <ArticleContent slug={article.slug} />
    </>
  );
}
