"use client";

import { useState } from "react";
import PhotoFrame from "./PhotoFrame";

interface OutingVideoProps {
  src: string;
  poster: string;
  title: string;
  caption?: string;
}

export default function OutingVideo({ src, poster, title, caption }: OutingVideoProps) {
  const [playing, setPlaying] = useState(false);

  return (
    <div className="outing-video">
      {playing ? (
        <video src={src} poster={poster} controls autoPlay playsInline preload="metadata" />
      ) : (
        <>
          <PhotoFrame src={poster} alt="" ratio="4-3" sizes="(max-width: 1023px) 92vw, 40vw" />
          <button type="button" className="outing-video-ui" onClick={() => setPlaying(true)}>
            <span className="hp-play" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7L8 5Z" />
              </svg>
            </span>
            <strong>{title}</strong>
            {caption ? <span className="small">{caption}</span> : null}
          </button>
        </>
      )}
    </div>
  );
}
