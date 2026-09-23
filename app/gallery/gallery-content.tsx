"use client";

import { useLang } from "../LangProvider";
import PageHero from "../components/PageHero";
import PhotoFrame from "../components/PhotoFrame";
import OutingVideo from "../components/OutingVideo";
import { liveGallery } from "../lib/siteStore";
import { useSiteContent } from "../lib/useSiteContent";

export default function GalleryContent() {
  const { t, lang } = useLang();
  useSiteContent();
  const photos = liveGallery();
  const fr = lang === "fr";

  return (
    <>
      <PageHero
        src="/images/hero-gallery.jpg"
        alt=""
        eyebrow={t.gallery.heroEyebrow}
        title={t.gallery.heroTitle}
        subtitle={t.gallery.heroSubtitle}
        objectPosition="78% 38%"
      />

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="gallery-grid">
            {photos.map((img) => {
              const local = img.src.startsWith("/");
              if (img.kind === "video" && img.poster) {
                return (
                  <div key={img.id} className="card">
                    <OutingVideo
                      src={img.src}
                      poster={img.poster}
                      title={fr ? img.titleFr || t.gallery.heroEyebrow : img.titleEn || t.gallery.heroEyebrow}
                    />
                  </div>
                );
              }
              return (
                <div key={img.id} className="card">
                  {local ? (
                    <PhotoFrame src={img.src} alt={img.alt} ratio="4-3" />
                  ) : (
                    <div className="photo-frame r-4-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img.src} alt={img.alt} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
