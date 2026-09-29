"use client";

import { useEffect, useState } from "react";
import { useOs } from "../../_components/OsProvider";
import { PROFILE_CHANGED, readDisplayName } from "../../_data/profile";

/** Nom à afficher pour le compte connecté (nom du compte, ou nom choisi dans Paramètres). */
export function useDisplayName(): string {
  const { session } = useOs();
  const base = session?.name ?? "";
  const [name, setName] = useState(base);
  useEffect(() => {
    const sync = () => setName(readDisplayName(session?.matricule, base));
    sync();
    window.addEventListener(PROFILE_CHANGED, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(PROFILE_CHANGED, sync);
      window.removeEventListener("storage", sync);
    };
  }, [session?.matricule, base]);
  return name;
}
