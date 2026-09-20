"use client";

import { useLang } from "../LangProvider";
import PhotoFrame from "./PhotoFrame";
import { IconCheck } from "./icons";
import { whatsappLink } from "../lib/contact";
import type { Room } from "../lib/rooms";

type RoomCardProps = { room: Room; sizes?: string };

/** Housing option: photo with the price tag, what's included, and a booking CTA
 *  that opens WhatsApp with the room already named in the message. */
export default function RoomCard({ room, sizes = "(max-width: 1023px) 92vw, 33vw" }: RoomCardProps) {
  const { t, lang } = useLang();
  const fr = lang === "fr";
  const a = t.accommodation;
  const title = fr ? room.titleFr : room.titleEn;

  return (
    <article className="card card-hover room-card">
      <div className="room-media">
        <PhotoFrame src={room.image} alt="" ratio="16-10" sizes={sizes} />
        <p className="room-price">
          <span className="room-price-n">{room.price}</span>
          <span className="room-price-c">CFA</span>
          <span className="room-price-p">{a.perPeriod}</span>
        </p>
      </div>
      <div className="card-body">
        <h3>{title}</h3>
        <ul className="room-includes">
          {(fr ? room.includesFr : room.includesEn).map((item) => (
            <li key={item}>
              <span className="icon-check" aria-hidden="true">
                <IconCheck />
              </span>
              {item}
            </li>
          ))}
        </ul>
        <a
          href={whatsappLink(a.bookMessage.replace("{room}", title))}
          className="btn btn-primary room-cta"
          target="_blank"
          rel="noopener noreferrer"
        >
          {a.bookCta}
        </a>
      </div>
    </article>
  );
}
