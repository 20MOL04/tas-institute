"use client";

// Renders an image slot that:
//  1) always paints a CSS gradient placeholder sized to the correct aspect
//     ratio first (see .photo-frame in design-system.css) — so the layout
//     never breaks even when the file listed in CAHIER-DES-CHARGES.md has
//     not been dropped into public/images/ yet;
//  2) layers next/image on top using a plain string `src` (never a static
//     import), so a missing file cannot fail the Next.js build — it only
//     404s at request time;
//  3) hides the <img> on error, revealing the placeholder wash underneath
//     instead of a broken-image icon.
//
// This is a Client Component specifically so it can carry the onError
// handler (next/image forbids passing inline event handlers from a Server
// Component boundary).

import Image, { type ImageProps } from "next/image";
import { useState } from "react";

type Ratio = "4-3" | "3-2" | "1-1" | "16-10" | "21-9";

interface PhotoFrameProps extends Omit<ImageProps, "fill" | "style" | "onError"> {
  ratio?: Ratio;
  className?: string;
}

export default function PhotoFrame({ ratio = "4-3", className, alt, ...imageProps }: PhotoFrameProps) {
  const [failed, setFailed] = useState(false);

  return (
    <div className={`photo-frame r-${ratio}${className ? ` ${className}` : ""}`}>
      {!failed && (
        <Image
          {...imageProps}
          alt={alt}
          fill
          sizes={imageProps.sizes ?? "100vw"}
          onError={() => setFailed(true)}
        />
      )}
    </div>
  );
}
