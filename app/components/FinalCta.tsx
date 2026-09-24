"use client";

import Link from "next/link";
import { useLang } from "../LangProvider";
import { useSiteContent } from "../lib/useSiteContent";
import { whatsappUrlFromDisplay } from "../lib/siteStore";
import CtaBackdrop from "./CtaBackdrop";

/** Appel à l'action de fin de page, sur photo de diplômés (pour les pages qui n'en ont pas). */
export default function FinalCta({ image }: { image: string }) {
  const { t } = useLang();
  const site = useSiteContent();
  return (
    <section className="section section-navy cta-photo">
      <CtaBackdrop src={image} />
      <div className="container">
        <div className="section-head-center reveal" style={{ marginBottom: 0 }}>
          <h2>{t.home.finalCtaTitle}</h2>
          <p className="lede">{t.home.finalCtaText}</p>
          <div className="steps-actions">
            <Link href="/apply" className="btn btn-primary">
              {t.home.finalCtaButton}
            </Link>
            <a href={whatsappUrlFromDisplay(site.whatsapp)} className="btn btn-outline-white" target="_blank" rel="noopener noreferrer">
              {t.common.whatsappCta}
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
