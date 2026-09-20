"use client";

import { useLang } from "../../LangProvider";
import { osCopy } from "../_i18n";

export function useOsT() {
  const { lang, setLang } = useLang();
  return { lang, setLang, t: osCopy[lang] };
}
