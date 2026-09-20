"use client";

import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from "react";

export type SelectOption = {
  value: string;
  label: string;
  hint?: string;
};

export type SelectMenuProps = {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  searchable?: boolean;
  required?: boolean;
  disabled?: boolean;
  compact?: boolean;
  filterOptions?: (query: string, options: SelectOption[]) => SelectOption[];
  "aria-label"?: string;
};

function optionText(row: SelectOption) {
  return row.hint ? `${row.label}, ${row.hint}` : row.label;
}

function Chevron() {
  return (
    <svg className="tas-menu-chevron" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M5 7.5 10 12.5 15 7.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Check() {
  return (
    <svg className="tas-menu-check" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M4.5 10.5 8 14l7.5-8" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function SelectMenu({
  id,
  value,
  onChange,
  options,
  placeholder = "Choisir",
  searchable = false,
  required = false,
  disabled = false,
  compact = false,
  filterOptions,
  "aria-label": ariaLabel,
}: SelectMenuProps) {
  const uid = useId();
  const listId = `${uid}-list`;
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);

  const selected = options.find((row) => row.value === value);
  const shown = useMemo(() => {
    if (filterOptions) return filterOptions(query, options);
    if (!searchable || !query.trim()) return options;
    const q = query.trim().toLowerCase();
    return options.filter(
      (row) =>
        row.label.toLowerCase().includes(q) ||
        row.value.toLowerCase().includes(q) ||
        (row.hint?.toLowerCase().includes(q) ?? false),
    );
  }, [options, query, searchable, filterOptions]);

  useEffect(() => {
    function onDoc(ev: MouseEvent) {
      if (!rootRef.current?.contains(ev.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  useEffect(() => {
    if (!open) return;
    const idx = Math.max(0, shown.findIndex((row) => row.value === value));
    setActive(idx);
    inputRef.current?.focus();
  }, [open, shown, value]);

  function pick(next: string) {
    onChange(next);
    setOpen(false);
    setQuery("");
  }

  function onKey(ev: KeyboardEvent) {
    if (disabled) return;
    if (!open && (ev.key === "ArrowDown" || ev.key === "Enter" || ev.key === " ")) {
      ev.preventDefault();
      setOpen(true);
      return;
    }
    if (!open) return;
    if (ev.key === "Escape") {
      ev.preventDefault();
      setOpen(false);
      setQuery("");
    }
    if (ev.key === "ArrowDown") {
      ev.preventDefault();
      setActive((i) => Math.min(shown.length - 1, i + 1));
    }
    if (ev.key === "ArrowUp") {
      ev.preventDefault();
      setActive((i) => Math.max(0, i - 1));
    }
    if (ev.key === "Enter") {
      ev.preventDefault();
      const row = shown[active];
      if (row) pick(row.value);
    }
  }

  return (
    <div
      ref={rootRef}
      className={`tas-menu${open ? " is-open" : ""}${compact ? " is-compact" : ""}${searchable ? " is-search" : ""}`}
    >
      {searchable ? (
        <div className="tas-menu-trigger" onClick={() => !disabled && setOpen(true)}>
          <input
            ref={inputRef}
            id={id}
            className="tas-menu-search"
            value={open ? query : selected ? optionText(selected) : ""}
            placeholder={placeholder}
            required={required && !value}
            disabled={disabled}
            role="combobox"
            aria-expanded={open}
            aria-controls={listId}
            aria-autocomplete="list"
            aria-label={ariaLabel}
            autoComplete="off"
            onFocus={() => setOpen(true)}
            onChange={(ev) => {
              setQuery(ev.target.value);
              setOpen(true);
              setActive(0);
            }}
            onKeyDown={onKey}
          />
          <Chevron />
        </div>
      ) : (
        <button
          type="button"
          id={id}
          className="tas-menu-trigger"
          disabled={disabled}
          aria-expanded={open}
          aria-controls={listId}
          aria-haspopup="listbox"
          aria-label={ariaLabel}
          onClick={() => setOpen((v) => !v)}
          onKeyDown={onKey}
        >
          <span className={`tas-menu-value${selected ? "" : " is-empty"}`}>
            {selected ? optionText(selected) : placeholder}
          </span>
          <Chevron />
        </button>
      )}
      {open ? (
        <div className="tas-menu-panel" id={listId} role="listbox">
          {shown.length === 0 ? (
            <p className="tas-menu-empty">Aucun résultat.</p>
          ) : (
            shown.map((row, i) => (
              <button
                key={row.value}
                type="button"
                role="option"
                className={`tas-menu-option${row.value === value ? " is-selected" : ""}${i === active ? " is-active" : ""}${row.hint ? " has-hint" : ""}`}
                aria-selected={row.value === value}
                onMouseEnter={() => setActive(i)}
                onClick={() => pick(row.value)}
              >
                <span className="tas-menu-option-copy">
                  <span className="tas-menu-option-label">{row.label}</span>
                  {row.hint ? <span className="tas-menu-option-hint">{row.hint}</span> : null}
                </span>
                {row.value === value ? <Check /> : null}
              </button>
            ))
          )}
        </div>
      ) : null}
    </div>
  );
}
