"use client";

import { useLang } from "../LangProvider";
import PageHero from "../components/PageHero";
import PhotoFrame from "../components/PhotoFrame";
import { liveGallery } from "../lib/siteStore";
import { useSiteContent } from "../lib/useSiteContent";

export default function GalleryContent() {
  const { t } = useLang();
  useSiteContent();
  const photos = liveGallery();

  return (
    <>
      <PageHero src="/images/hero-gallery.png" alt="" eyebrow={t.gallery.heroEyebrow} title={t.gallery.heroTitle} subtitle={t.gallery.heroSubtitle} />

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="gallery-grid">
            {photos.map((img) => {
              const local = img.src.startsWith("/");
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
