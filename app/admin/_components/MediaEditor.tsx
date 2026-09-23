"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import {
  SITE_GALLERY_BASE,
  addGalleryPhoto,
  removeGalleryPhoto,
  type GalleryPhoto,
} from "../../lib/siteStore";
import { useSiteContent } from "../../lib/useSiteContent";

function Shot({ photo, onRemove }: { photo: GalleryPhoto; onRemove?: () => void }) {
  return (
    <div>
      <div className="os-media-shot">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={photo.kind === "video" ? photo.poster || photo.src : photo.src} alt={photo.alt} />
      </div>
      <div className="os-page-actions" style={{ marginTop: 8 }}>
        {onRemove ? (
          <button type="button" className="os-btn os-btn-sm" onClick={onRemove}>
            Retirer
          </button>
        ) : (
          <span className="os-muted os-small">Photo du campus</span>
        )}
      </div>
    </div>
  );
}

export default function MediaEditor() {
  const site = useSiteContent();
  const [url, setUrl] = useState("");
  const [alt, setAlt] = useState("");
  const [error, setError] = useState("");

  function addFromUrl(e: FormEvent) {
    e.preventDefault();
    const src = url.trim();
    if (!src) {
      setError("Indiquez une adresse d'image.");
      return;
    }
    addGalleryPhoto(src, alt.trim());
    setUrl("");
    setAlt("");
    setError("");
  }

  function addFromFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Choisissez une image.");
      return;
    }
    if (file.size > 900_000) {
      setError("Image trop lourde. Choisissez un fichier plus léger.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const src = typeof reader.result === "string" ? reader.result : "";
      if (!src) return;
      addGalleryPhoto(src, alt.trim() || file.name.replace(/\.[^.]+$/, ""));
      setAlt("");
      setError("");
    };
    reader.readAsDataURL(file);
  }

  return (
    <>
      <section className="os-section">
        <div className="os-section-head">
          <h2>Ajouter une photo</h2>
        </div>
        <div className="os-section-body">
          <form className="os-stack-form" onSubmit={addFromUrl}>
            <label className="os-field">
              <span>{"Adresse de l'image"}</span>
              <input className="os-input" value={url} onChange={(ev) => setUrl(ev.target.value)} />
            </label>
            <label className="os-field">
              <span>Légende</span>
              <input className="os-input" value={alt} onChange={(ev) => setAlt(ev.target.value)} />
            </label>
            <label className="os-field">
              <span>{"Ou depuis l'ordinateur"}</span>
              <input className="os-input" type="file" accept="image/*" onChange={addFromFile} />
            </label>
            {error ? <p className="os-field-error">{error}</p> : null}
            <button type="submit" className="os-btn os-btn-primary">
              Ajouter à la galerie
            </button>
          </form>
        </div>
      </section>
      <section className="os-section">
        <div className="os-section-head">
          <h2>Galerie du site</h2>
        </div>
        <div className="os-section-body">
          <div className="os-media-grid">
            {site.gallery.map((photo) => (
              <Shot key={photo.id} photo={photo} onRemove={() => removeGalleryPhoto(photo.id)} />
            ))}
            {SITE_GALLERY_BASE.map((photo) => (
              <Shot key={photo.id} photo={photo} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
