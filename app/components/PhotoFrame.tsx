"use client";

// Emplacement d'image :
//  1) un fond coloré au bon format s'affiche tout de suite (.photo-frame dans design-system.css),
//     la mise en page ne bouge donc jamais ;
//  2) l'image apparaît en fondu une fois entièrement chargée, jamais « à moitié dessinée » ;
//  3) si le fichier manque, l'image est masquée et le fond reste, au lieu d'une icône cassée.

import Image, { type ImageProps } from "next/image";
import { useState } from "react";

type Ratio = "4-3" | "3-2" | "1-1" | "4-5" | "16-10" | "21-9";

interface PhotoFrameProps extends Omit<ImageProps, "fill" | "style" | "onError" | "onLoad"> {
  ratio?: Ratio;
  className?: string;
}

export default function PhotoFrame({ ratio = "4-3", className, alt, ...imageProps }: PhotoFrameProps) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);

  return (
    <div className={`photo-frame r-${ratio}${className ? ` ${className}` : ""}`}>
      {!failed && (
        <Image
          {...imageProps}
          alt={alt}
          fill
          sizes={imageProps.sizes ?? "100vw"}
          className={imageProps.priority ? undefined : `fade-img${loaded ? " is-loaded" : ""}`}
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
        />
      )}
    </div>
  );
}
