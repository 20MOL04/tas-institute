"use client";

import { useState, type FormEvent } from "react";
import { useLang } from "../LangProvider";
import PhotoFrame from "../components/PhotoFrame";

export default function ContactContent() {
  const { t } = useLang();
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    // Demo form — no backend wired up yet, mirrors the Apply page's
    // documented judgment call (see apply-content.tsx top comment).
    setSent(true);
  };

  return (
    <>
      <section className="section-tight hero-halo">
        <div className="container grid" style={{ gridTemplateColumns: "1.1fr 1fr", alignItems: "center", gap: "var(--space-6)" }}>
          <div className="section-head" style={{ marginBottom: 0 }}>
            <span className="eyebrow">{t.contact.heroEyebrow}</span>
            <h1>{t.contact.heroTitle}</h1>
            <p className="lede">{t.contact.heroSubtitle}</p>
          </div>
          <PhotoFrame src="/images/contact-office.jpg" alt="Accueil / bureau administratif" ratio="3-2" priority />
        </div>
      </section>

      <section className="section">
        <div className="container grid" style={{ gridTemplateColumns: "0.9fr 1.1fr", gap: "var(--space-6)" }}>
          {/* CONTACT INFO */}
          <div className="stack">
            <h2 style={{ fontSize: "1.2rem" }}>{t.contact.infoTitle}</h2>
            <ul className="stack" style={{ gap: "var(--space-2)" }}>
              <InfoRow label={t.contact.addressLabel} value={t.contact.address} />
              <InfoRow label={t.contact.phoneLabel} value={t.contact.phone} />
              <InfoRow label={t.contact.emailLabel} value={t.contact.email} />
              <InfoRow label={t.contact.hoursLabel} value={t.contact.hours} />
            </ul>

            <div className="card" style={{ background: "var(--tas-warm-gray)", border: "none" }}>
              <p className="small muted" style={{ margin: 0 }}>
                {t.contact.mapNote}
              </p>
            </div>

            <div id="whatsapp" className="card stack" style={{ scrollMarginTop: "var(--header-h)" }}>
              <h3>{t.contact.whatsappCtaTitle}</h3>
              <p className="small muted">{t.contact.whatsappCtaText}</p>
              <p className="small" style={{ color: "#8a93a3" }}>
                {t.contact.whatsappLabel}: {t.contact.whatsapp}
              </p>
              <a
                href="#whatsapp"
                className="btn btn-whatsapp"
                style={{ alignSelf: "start" }}
                onClick={(e) => e.preventDefault()}
                aria-disabled="true"
                title={t.common.toConfirm}
              >
                <span className="dot" aria-hidden="true" />
                {t.contact.whatsappCtaButton}
              </a>
            </div>
          </div>

          {/* CONTACT FORM */}
          <div className="card" style={{ padding: "var(--space-4)" }}>
            <h2 style={{ fontSize: "1.2rem", marginBottom: "var(--space-3)" }}>{t.contact.formTitle}</h2>

            {sent ? (
              <p className="lede">{t.apply.submittedText}</p>
            ) : (
              <form className="stack" onSubmit={handleSubmit}>
                <div className="field-row">
                  <div className="field">
                    <label htmlFor="c-name">{t.contact.nameField} *</label>
                    <input id="c-name" required />
                  </div>
                  <div className="field">
                    <label htmlFor="c-email">{t.contact.emailField} *</label>
                    <input id="c-email" type="email" required />
                  </div>
                </div>
                <div className="field-row">
                  <div className="field">
                    <label htmlFor="c-phone">{t.contact.phoneField}</label>
                    <input id="c-phone" />
                  </div>
                  <div className="field">
                    <label htmlFor="c-subject">{t.contact.subjectField}</label>
                    <input id="c-subject" />
                  </div>
                </div>
                <div className="field">
                  <label htmlFor="c-message">{t.contact.messageField} *</label>
                  <textarea id="c-message" required />
                </div>
                <p className="small muted">{t.common.requiredNote}</p>
                <button type="submit" className="btn btn-primary" style={{ alignSelf: "start" }}>
                  {t.common.sendMessage}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <li>
      <span className="small muted" style={{ display: "block" }}>
        {label}
      </span>
      <span style={{ fontWeight: 600, color: "var(--tas-navy)" }}>{value}</span>
    </li>
  );
}
