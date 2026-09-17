"use client";

// Small header/footer logo mark. Expects `favicon-source.png` (see the
// image table in CAHIER-DES-CHARGES.md) once Martin drops it into
// public/images/. Until then — or if it 404s — falls back to a plain
// text mark instead of a broken-image icon.

import Image from "next/image";
import { useState } from "react";

export default function Logo() {
  const [failed, setFailed] = useState(false);

  return (
    <span className="brand-mark">
      {!failed ? (
        <Image
          src="/images/favicon-source.png"
          alt=""
          fill
          sizes="38px"
          onError={() => setFailed(true)}
        />
      ) : (
        <span className="fallback" aria-hidden="true">
          TAS
        </span>
      )}
    </span>
  );
}
