"use client";

// DESIGN CHOICE (documented per brief instructions):
// Implemented as a real, working multi-step CLIENT-SIDE form using React
// useState to track the current step and all field values — not the
// single-scrollable-page fallback. Four steps per spec-uiux-master.txt
// "APPLY/REGISTRATION": 01 Personal Information, 02 Program,
// 03 Additional Information, 04 Review — followed by a client-only
// "Application received" confirmation state. No data is sent to a
// server (there isn't one yet); this is a UI/UX demonstration of the
// intended flow, and the demo form says so explicitly (t.apply.demoNote).

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useLang } from "../LangProvider";
import PhotoFrame from "../components/PhotoFrame";

interface FormState {
  fullName: string;
  phone: string;
  whatsapp: string;
  email: string;
  country: string;
  program: string;
  level: string;
  schedule: string;
  startDate: string;
  message: string;
  hearAbout: string;
}

const EMPTY_FORM: FormState = {
  fullName: "",
  phone: "",
  whatsapp: "",
  email: "",
  country: "",
  program: "",
  level: "",
  schedule: "",
  startDate: "",
  message: "",
  hearAbout: "",
};

export default function ApplyContent() {
  const { t } = useLang();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [consent, setConsent] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const update = (field: keyof FormState) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const validateStep = (current: number): string => {
    if (current === 0) {
      if (!form.fullName.trim() || !form.phone.trim() || !form.email.trim() || !form.country.trim()) {
        return t.common.requiredNote;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
        return t.apply.email + " — invalid format";
      }
    }
    if (current === 1 && !form.program) {
      return t.common.requiredNote;
    }
    return "";
  };

  const goNext = () => {
    const msg = validateStep(step);
    if (msg) {
      setError(msg);
      return;
    }
    setError("");
    setStep((s) => Math.min(s + 1, 3));
  };

  const goBack = () => {
    setError("");
    setStep((s) => Math.max(s - 1, 0));
  };

  const submitForm = () => {
    if (!consent) {
      setError(t.apply.consentLabel);
      return;
    }
    setError("");
    setSubmitted(true);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    submitForm();
  };

  const programOptions = t.programs.programs;

  if (submitted) {
    return (
      <section className="section" style={{ textAlign: "center" }}>
        <div className="container stack" style={{ alignItems: "center", maxWidth: 560, margin: "0 auto" }}>
          <span className="icon-check" style={{ width: 40, height: 40, fontSize: "1.1rem" }}>
            ✓
          </span>
          <h1>{t.apply.submittedTitle}</h1>
          <p className="lede">{t.apply.submittedText}</p>
          <div className="tag-list" style={{ justifyContent: "center", marginTop: "var(--space-2)" }}>
            <Link href="/contact#whatsapp" className="btn btn-whatsapp">
              <span className="dot" aria-hidden="true" />
              {t.apply.submittedWhatsapp}
            </Link>
            <Link href="/" className="btn btn-secondary">
              {t.nav.home}
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="section-tight hero-halo">
        <div className="container grid" style={{ gridTemplateColumns: "1.1fr 1fr", alignItems: "center", gap: "var(--space-6)" }}>
          <div className="section-head" style={{ marginBottom: 0 }}>
            <span className="eyebrow">{t.apply.heroEyebrow}</span>
            <h1>{t.apply.heroTitle}</h1>
            <p className="lede">{t.apply.heroSubtitle}</p>
          </div>
          <PhotoFrame src="/images/group-outdoor.jpg" alt="Groupe d'étudiants en extérieur" ratio="3-2" />
        </div>
      </section>

      <section className="section-tight">
        <div className="container" style={{ maxWidth: 760 }}>
          <div className="stepper">
            {t.apply.steps.map((s, i) => (
              <div key={s.n} className={`step${i === step ? " active" : ""}${i < step ? " done" : ""}`}>
                <span className="dot">{i < step ? "✓" : s.n}</span>
                <span className="label">{s.label}</span>
              </div>
            ))}
          </div>

          <form className="card stack" style={{ padding: "var(--space-4)" }} onSubmit={handleSubmit}>
            {step === 0 && (
              <fieldset className="stack" style={{ border: "none", padding: 0, margin: 0 }}>
                <h2 style={{ fontSize: "1.2rem" }}>{t.apply.step1Title}</h2>
                <div className="field-row">
                  <div className="field">
                    <label htmlFor="fullName">{t.apply.fullName} *</label>
                    <input id="fullName" value={form.fullName} onChange={update("fullName")} required />
                  </div>
                  <div className="field">
                    <label htmlFor="phone">{t.apply.phone} *</label>
                    <input id="phone" value={form.phone} onChange={update("phone")} required />
                  </div>
                </div>
                <div className="field-row">
                  <div className="field">
                    <label htmlFor="whatsapp">{t.apply.whatsapp}</label>
                    <input id="whatsapp" value={form.whatsapp} onChange={update("whatsapp")} />
                  </div>
                  <div className="field">
                    <label htmlFor="email">{t.apply.email} *</label>
                    <input id="email" type="email" value={form.email} onChange={update("email")} required />
                  </div>
                </div>
                <div className="field">
                  <label htmlFor="country">{t.apply.country} *</label>
                  <input id="country" value={form.country} onChange={update("country")} required />
                </div>
              </fieldset>
            )}

            {step === 1 && (
              <fieldset className="stack" style={{ border: "none", padding: 0, margin: 0 }}>
                <h2 style={{ fontSize: "1.2rem" }}>{t.apply.step2Title}</h2>
                <div className="field">
                  <label htmlFor="program">{t.apply.programField} *</label>
                  <select id="program" value={form.program} onChange={update("program")} required>
                    <option value="" disabled>
                      —
                    </option>
                    {programOptions.map((p) => (
                      <option key={p.slug} value={p.title}>
                        {p.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="field-row">
                  <div className="field">
                    <label htmlFor="level">{t.apply.levelField}</label>
                    <select id="level" value={form.level} onChange={update("level")}>
                      <option value="" disabled>
                        —
                      </option>
                      {t.apply.levelOptions.map((lvl) => (
                        <option key={lvl} value={lvl}>
                          {lvl}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="field">
                    <label htmlFor="schedule">{t.apply.scheduleField}</label>
                    <select id="schedule" value={form.schedule} onChange={update("schedule")}>
                      <option value="" disabled>
                        —
                      </option>
                      {t.apply.scheduleOptions.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="field">
                  <label htmlFor="startDate">{t.apply.startDateField}</label>
                  <input id="startDate" type="date" value={form.startDate} onChange={update("startDate")} />
                </div>
              </fieldset>
            )}

            {step === 2 && (
              <fieldset className="stack" style={{ border: "none", padding: 0, margin: 0 }}>
                <h2 style={{ fontSize: "1.2rem" }}>{t.apply.step3Title}</h2>
                <div className="field">
                  <label htmlFor="message">{t.apply.messageField}</label>
                  <textarea
                    id="message"
                    value={form.message}
                    onChange={update("message")}
                    placeholder={t.apply.messagePlaceholder}
                  />
                </div>
                <div className="field">
                  <label htmlFor="hearAbout">{t.apply.hearAboutField}</label>
                  <input id="hearAbout" value={form.hearAbout} onChange={update("hearAbout")} />
                </div>
              </fieldset>
            )}

            {step === 3 && (
              <fieldset className="stack" style={{ border: "none", padding: 0, margin: 0 }}>
                <h2 style={{ fontSize: "1.2rem" }}>{t.apply.step4Title}</h2>
                <p className="small muted">{t.apply.reviewIntro}</p>
                <dl className="grid grid-2 small" style={{ rowGap: 10 }}>
                  <ReviewItem label={t.apply.fullName} value={form.fullName} />
                  <ReviewItem label={t.apply.phone} value={form.phone} />
                  <ReviewItem label={t.apply.email} value={form.email} />
                  <ReviewItem label={t.apply.country} value={form.country} />
                  <ReviewItem label={t.apply.programField} value={form.program} />
                  <ReviewItem label={t.apply.levelField} value={form.level} />
                  <ReviewItem label={t.apply.scheduleField} value={form.schedule} />
                  <ReviewItem label={t.apply.startDateField} value={form.startDate} />
                </dl>
                <hr className="divider" />
                <label className="checkbox-field small">
                  <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
                  <span>{t.apply.consentLabel}</span>
                </label>
                <p className="small" style={{ color: "#8a93a3" }}>
                  {t.apply.demoNote}
                </p>
              </fieldset>
            )}

            {error && (
              <p className="small" style={{ color: "#b3261e" }}>
                {error}
              </p>
            )}

            <div className="tag-list" style={{ justifyContent: "space-between" }}>
              {step > 0 ? (
                <button type="button" className="btn btn-secondary" onClick={goBack}>
                  {t.apply.back}
                </button>
              ) : (
                <span />
              )}

              {step < 3 ? (
                <button type="button" className="btn btn-primary" onClick={goNext}>
                  {t.apply.continue}
                </button>
              ) : (
                <button type="submit" className="btn btn-primary">
                  {t.apply.submit}
                </button>
              )}
            </div>
          </form>
        </div>
      </section>

      <div className="sticky-cta">
        {step > 0 && (
          <button type="button" className="btn btn-secondary" onClick={goBack}>
            {t.apply.back}
          </button>
        )}
        {step < 3 ? (
          <button type="button" className="btn btn-primary" onClick={goNext}>
            {t.apply.continue}
          </button>
        ) : (
          <button type="button" className="btn btn-primary" onClick={submitForm}>
            {t.apply.submit}
          </button>
        )}
      </div>
    </>
  );
}

function ReviewItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="muted" style={{ fontSize: "0.78rem" }}>
        {label}
      </dt>
      <dd style={{ margin: 0, fontWeight: 600, color: "var(--tas-navy)" }}>{value || "—"}</dd>
    </div>
  );
}
