"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLang } from "../LangProvider";
import type { OutingClip } from "../lib/outingMedia";

const STEP_MS = 3800;

/**
 * Vignette de l'accueil : les aperçus des sorties défilent en fondu.
 * Un clic lance la vidéo affichée ; à la fin, la suivante s'enchaîne.
 */
export default function OutingReel({ clips }: { clips: OutingClip[] }) {
  const { lang } = useLang();
  const fr = lang === "fr";
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [paused, setPaused] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const go = useCallback((i: number) => setIndex((i + clips.length) % clips.length), [clips.length]);

  // Défilement automatique, coupé pendant la lecture, au survol, ou si l'utilisateur limite les animations.
  useEffect(() => {
    if (playing || paused || clips.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setTimeout(() => go(index + 1), STEP_MS);
    return () => window.clearTimeout(id);
  }, [index, playing, paused, go, clips.length]);

  useEffect(() => {
    if (playing) videoRef.current?.play().catch(() => {});
  }, [playing, index]);

  const current = clips[index];
  const title = (c: OutingClip) => (fr ? c.titleFr : c.titleEn);

  return (
    <div
      className="outing-reel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {playing ? (
        <video
          key={current.id}
          ref={videoRef}
          src={current.src}
          poster={current.poster}
          controls
          playsInline
          preload="metadata"
          className={current.vertical ? "is-vertical" : undefined}
          onEnded={() => go(index + 1)}
        />
      ) : (
        <>
          {clips.map((c, i) => (
            <Image
              key={c.id}
              src={c.poster}
              alt=""
              fill
              sizes="(max-width: 1023px) 92vw, 44vw"
              className={`outing-reel-slide${i === index ? " is-active" : ""}`}
              priority={i === 0}
            />
          ))}
          <button type="button" className="outing-video-ui" onClick={() => setPlaying(true)}>
            <span className="hp-play" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7L8 5Z" />
              </svg>
            </span>
            <strong>{title(current)}</strong>
            <span className="small">{fr ? "Sorties TAS" : "TAS outings"}</span>
          </button>
        </>
      )}

      <div className="outing-reel-dots" role="tablist" aria-label={fr ? "Vidéos des sorties" : "Outing videos"}>
        {clips.map((c, i) => (
          <button
            key={c.id}
            type="button"
            role="tab"
            aria-selected={i === index}
            aria-label={title(c)}
            className={i === index ? "is-active" : undefined}
            onClick={() => go(i)}
          />
        ))}
      </div>
    </div>
  );
}
