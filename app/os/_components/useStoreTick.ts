"use client";

import { useEffect, useState } from "react";

/** Relit le store local après un événement d’écriture. */
export function useStoreTick(...events: string[]) {
  const [tick, setTick] = useState(0);
  const key = events.join("|");

  useEffect(() => {
    function bump() {
      setTick((n) => n + 1);
    }
    bump();
    const names = key ? key.split("|") : [];
    names.forEach((name) => window.addEventListener(name, bump));
    return () => names.forEach((name) => window.removeEventListener(name, bump));
  }, [key]);

  return tick;
}
