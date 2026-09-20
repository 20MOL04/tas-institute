"use client";

import { useCallback, useMemo } from "react";
import SelectMenu, { type SelectOption } from "./SelectMenu";
import { filterCountries, worldCountryOptions, type CountryLang } from "../../lib/world-countries";

type Props = {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  lang?: CountryLang;
  required?: boolean;
  compact?: boolean;
  allowAll?: boolean;
  allLabel?: string;
  placeholder?: string;
  "aria-label"?: string;
};

export default function CountryField({
  id,
  value,
  onChange,
  lang = "fr",
  required = false,
  compact = false,
  allowAll = false,
  allLabel = "Tous les pays",
  placeholder = "Rechercher un pays",
  "aria-label": ariaLabel,
}: Props) {
  const options = useMemo(() => {
    const rows = worldCountryOptions(lang).map((row) => ({ value: row.value, label: row.label }));
    return allowAll ? [{ value: "all", label: allLabel }, ...rows] : rows;
  }, [lang, allowAll, allLabel]);

  const filterOptions = useCallback(
    (query: string, current: SelectOption[]) => {
      const found = filterCountries(query, lang).map((row) => ({ value: row.value, label: row.label }));
      if (!allowAll) return found;
      const head = current.find((row) => row.value === "all");
      return head ? [head, ...found] : found;
    },
    [lang, allowAll],
  );

  return (
    <SelectMenu
      id={id}
      value={value}
      onChange={onChange}
      options={options}
      filterOptions={filterOptions}
      searchable
      required={required}
      compact={compact}
      placeholder={placeholder}
      aria-label={ariaLabel}
    />
  );
}
