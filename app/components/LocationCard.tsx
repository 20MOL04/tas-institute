"use client";

import { useState } from "react";
import { useLang } from "../LangProvider";
import { IconBus, IconMail, IconPhone, IconPin } from "./icons";
import { TAS_DIRECTIONS_URL, TAS_LOCATION, TAS_MAP_EMBED_URL, TAS_MAP_STATIC_URL } from "../lib/contact";
import { useSiteContent } from "../lib/useSiteContent";
import { whatsappUrlFromDisplay } from "../lib/siteStore";

/**
 * Framed map beside the practical details a visitor needs to actually get
 * there. `compact` drops the contact rows and keeps map + directions only,
 * for pages where the contact block already lives elsewhere.
 *
 * The live map starts loading as soon as this block mounts (no lazy iframe).
 * A still image covers the frame until Google answers, so the place is visible
 * at once instead of a blank box for several seconds.
 */
export default function LocationCard({ compact = false }: { compact?: boolean }) {
  const { t, lang } = useLang();
  const fr = lang === "fr";
  const c = t.location;
  const site = useSiteContent();
  const wa = whatsappUrlFromDisplay(site.whatsapp);
  const [live, setLive] = useState(false);
  const [poster, setPoster] = useState(true);

  return (
    <div className={`location-card${compact ? " location-card-compact" : ""}`}>
      <div className="location-map">
        {poster ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            className={`location-map-poster${live ? " is-gone" : ""}`}
            src={TAS_MAP_STATIC_URL}
            alt=""
            decoding="async"
            onError={() => setPoster(false)}
          />
        ) : null}
        <iframe
          className={live ? "is-ready" : undefined}
          src={TAS_MAP_EMBED_URL}
          title={c.mapTitle}
          loading="eager"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
          onLoad={() => setLive(true)}
        />
      </div>

      <div className="location-info">
        <span className="sec-kicker">{c.kicker}</span>
        <h3>{fr ? TAS_LOCATION.landmarkFr : TAS_LOCATION.landmarkEn}</h3>
        <p className="small muted">{c.text}</p>

        <ul className="location-rows">
          <li>
            <span className="icon-badge">
              <IconPin />
            </span>
            <div>
              <strong>{c.addressLabel}</strong>
              <span>{fr ? TAS_LOCATION.addressFr : TAS_LOCATION.addressEn}</span>
            </div>
          </li>
          <li>
            <span className="icon-badge">
              <IconBus />
            </span>
            <div>
              <strong>{c.transitLabel}</strong>
              <span>{fr ? TAS_LOCATION.transitFr : TAS_LOCATION.transitEn}</span>
            </div>
          </li>
          {compact ? null : (
            <>
              <li>
                <span className="icon-badge">
                  <IconPhone />
                </span>
                <div>
                  <strong>{c.phoneLabel}</strong>
                  <span>
                    {site.phone}, WhatsApp {site.whatsapp}
                  </span>
                </div>
              </li>
              <li>
                <span className="icon-badge">
                  <IconMail />
                </span>
                <div>
                  <strong>{c.emailLabel}</strong>
                  <span>{site.email}</span>
                </div>
              </li>
            </>
          )}
        </ul>

        <div className="location-actions">
          <a href={TAS_DIRECTIONS_URL} className="btn btn-primary" target="_blank" rel="noopener noreferrer">
            {c.directionsCta}
          </a>
          {compact ? null : (
            <a href={wa} className="btn btn-secondary" target="_blank" rel="noopener noreferrer">
              {t.common.whatsappCta}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
