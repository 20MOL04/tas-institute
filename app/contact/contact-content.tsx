"use client";

import { useState, type FormEvent } from "react";
import { useLang } from "../LangProvider";
import PageHero from "../components/PageHero";
import LocationCard from "../components/LocationCard";
import { IconClock, IconMail, IconPhone, IconWhatsApp } from "../components/icons";
import { addLead } from "../os/_data/growth";
import { useSiteContent } from "../lib/useSiteContent";
import { whatsappUrlFromDisplay } from "../lib/siteStore";

export default function ContactContent() {
  const { t, lang } = useLang();
  const c = t.contact;
  const site = useSiteContent();
  const [sent, setSent] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const waUrl = whatsappUrlFromDisplay(site.whatsapp);
  const hours = lang === "en" ? site.hoursEn : site.hoursFr;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (sent) return;
    setSent(true);
    addLead({
      name: name.trim(),
      phone: phone.trim() || email.trim(),
      country: "Ghana",
      programId: "eng-intensive",
      note: [subject.trim(), message.trim(), email.trim()].filter(Boolean).join(". "),
      source: "Contact",
    });
    setSent(true);
  };

  return (
    <>
      <PageHero src="/images/hero-contact.png" alt="" eyebrow={c.heroEyebrow} title={c.heroTitle} subtitle={c.heroSubtitle} />

      {/* CHANNELS */}
      <section className="section">
        <div className="container">
          <div className="section-head-center reveal">
            <span className="sec-kicker">{c.channelsKicker}</span>
            <h2>{c.channelsTitle}</h2>
            <p className="lede">{c.channelsText}</p>
          </div>
          <div className="home-cards-3 reveal reveal-stagger">
            <a
              id="whatsapp"
              href={waUrl}
              className="card card-pad card-hover"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="icon-badge">
                <IconWhatsApp />
              </span>
              <h3>{c.whatsappChannelTitle}</h3>
              <p className="small muted">{c.whatsappChannelText}</p>
              <strong className="channel-value">{site.whatsapp}</strong>
            </a>

            <a href={`tel:${site.phone.replace(/\s/g, "")}`} className="card card-pad card-hover">
              <span className="icon-badge">
                <IconPhone />
              </span>
              <h3>{c.phoneChannelTitle}</h3>
              <p className="small muted">{c.phoneChannelText}</p>
              <strong className="channel-value">{site.phone}</strong>
            </a>

            <a href={`mailto:${site.email}`} className="card card-pad card-hover">
              <span className="icon-badge">
                <IconMail />
              </span>
              <h3>{c.emailChannelTitle}</h3>
              <p className="small muted">{c.emailChannelText}</p>
              <strong className="channel-value">{site.email}</strong>
            </a>
          </div>
          <p className="section-note reveal">
            <IconClock />
            <span>
              {c.hoursLabel} : {hours}
            </span>
          </p>
        </div>
      </section>

      {/* MAP */}
      <section className="section section-alt">
        <div className="container">
          <div className="section-head-center reveal">
            <span className="sec-kicker">{t.location.kicker}</span>
            <h2>{t.location.sectionTitle}</h2>
            <p className="lede">{t.location.sectionText}</p>
          </div>
          <div className="reveal">
            <LocationCard />
          </div>
        </div>
      </section>

      {/* FORM */}
      <section className="section">
        <div className="container">
          <div className="section-head-center reveal">
            <span className="sec-kicker">{c.formKicker}</span>
            <h2>{c.formTitle}</h2>
            <p className="lede">{c.formText}</p>
          </div>
          <div className="form-wrap card reveal">
            {sent ? (
              <p className="lede">{t.apply.submittedText}</p>
            ) : (
              <form className="stack" onSubmit={handleSubmit}>
                <div className="field-row">
                  <div className="field">
                    <label htmlFor="c-name">{c.nameField} *</label>
                    <input id="c-name" required value={name} onChange={(e) => setName(e.target.value)} />
                  </div>
                  <div className="field">
                    <label htmlFor="c-email">{c.emailField} *</label>
                    <input id="c-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
                  </div>
                </div>
                <div className="field-row">
                  <div className="field">
                    <label htmlFor="c-phone">{c.phoneField}</label>
                    <input id="c-phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
                  </div>
                  <div className="field">
                    <label htmlFor="c-subject">{c.subjectField}</label>
                    <input id="c-subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
                  </div>
                </div>
                <div className="field">
                  <label htmlFor="c-message">{c.messageField} *</label>
                  <textarea id="c-message" required value={message} onChange={(e) => setMessage(e.target.value)} />
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
