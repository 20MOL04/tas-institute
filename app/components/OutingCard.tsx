"use client";

import PhotoFrame from "./PhotoFrame";
import { useLang } from "../LangProvider";
import type { Outing } from "../lib/excursions";

export default function OutingCard({ outing }: { outing: Outing }) {
  const { lang } = useLang();
  const fr = lang === "fr";

  return (
    <article className="card outing-card">
      <PhotoFrame src={outing.image} alt="" ratio="4-3" sizes="(max-width: 1023px) 78vw, 24vw" />
      <div className="card-body">
        <h3>{fr ? outing.titleFr : outing.titleEn}</h3>
        <p>{fr ? outing.textFr : outing.textEn}</p>
      </div>
    </article>
  );
}
