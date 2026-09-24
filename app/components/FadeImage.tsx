"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";

/**
 * next/image qui apparaît en fondu une fois chargée (même règle que PhotoFrame).
 * Les images `priority` (grandes images du haut) s'affichent sans attendre.
 */
export default function FadeImage({ className, priority, alt, ...props }: Omit<ImageProps, "onLoad">) {
  const [loaded, setLoaded] = useState(false);
  const fade = priority ? "" : `fade-img${loaded ? " is-loaded" : ""}`;
  return (
    <Image
      {...props}
      alt={alt}
      priority={priority}
      className={[fade, className].filter(Boolean).join(" ") || undefined}
      onLoad={priority ? undefined : () => setLoaded(true)}
    />
  );
}
