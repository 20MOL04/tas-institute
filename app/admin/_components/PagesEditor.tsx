"use client";

import { useEffect, useState, type FormEvent } from "react";
import {
  patchSiteContent,
  readSiteContent,
  type SiteContent,
} from "../../lib/siteStore";
import { useSiteContent } from "../../lib/useSiteContent";

function Field({
  label,
  value,
  onChange,
  multiline,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
}) {
  return (
    <label className="os-field">
      <span>{label}</span>
      {multiline ? (
        <textarea className="os-input" rows={3} value={value} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <input className="os-input" value={value} onChange={(e) => onChange(e.target.value)} />
      )}
    </label>
  );
}

export default function PagesEditor() {
  const live = useSiteContent();
  const [draft, setDraft] = useState<SiteContent>(live);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setDraft(live);
  }, [live]);

  function set<K extends keyof SiteContent>(key: K, value: SiteContent[K]) {
    setDraft((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    patchSiteContent({
      ...readSiteContent(),
      phone: draft.phone.trim(),
      whatsapp: draft.whatsapp.trim(),
      email: draft.email.trim(),
      address: draft.address.trim(),
      hoursFr: draft.hoursFr.trim(),
      hoursEn: draft.hoursEn.trim(),
      homeHeroFr: draft.homeHeroFr.trim(),
      homeHeroEn: draft.homeHeroEn.trim(),
      homeLeadFr: draft.homeLeadFr.trim(),
      homeLeadEn: draft.homeLeadEn.trim(),
    });
    setSaved(true);
  }

  return (
    <form className="os-stack-form" onSubmit={submit}>
      <section className="os-section">
        <div className="os-section-head">
          <h2>Accueil</h2>
        </div>
        <div className="os-section-body">
          <Field label="Titre français" value={draft.homeHeroFr} onChange={(v) => set("homeHeroFr", v)} />
          <Field label="Titre anglais" value={draft.homeHeroEn} onChange={(v) => set("homeHeroEn", v)} />
          <Field label="Texte français" value={draft.homeLeadFr} onChange={(v) => set("homeLeadFr", v)} multiline />
          <Field label="Texte anglais" value={draft.homeLeadEn} onChange={(v) => set("homeLeadEn", v)} multiline />
        </div>
      </section>
      <section className="os-section">
        <div className="os-section-head">
          <h2>Coordonnées</h2>
        </div>
        <div className="os-section-body">
          <Field label="Téléphone" value={draft.phone} onChange={(v) => set("phone", v)} />
          <Field label="WhatsApp" value={draft.whatsapp} onChange={(v) => set("whatsapp", v)} />
          <Field label="E-mail" value={draft.email} onChange={(v) => set("email", v)} />
          <Field label="Adresse" value={draft.address} onChange={(v) => set("address", v)} />
          <Field label="Horaires français" value={draft.hoursFr} onChange={(v) => set("hoursFr", v)} />
          <Field label="Horaires anglais" value={draft.hoursEn} onChange={(v) => set("hoursEn", v)} />
        </div>
      </section>
      <div className="os-page-actions">
        <button type="submit" className="os-btn os-btn-primary">
          Publier sur le site
        </button>
        {saved ? <p className="os-muted">Le site public affiche ces textes.</p> : null}
      </div>
    </form>
  );
}
