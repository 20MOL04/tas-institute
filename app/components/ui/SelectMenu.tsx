"use client";

import { useEffect, useId, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import { createPortal } from "react-dom";
import "./select-menu.css";

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

const GAP = 6;
const PAD = 8;
const MAX_H = 280;

type PanelBox = {
  left: number;
  width: number;
  maxHeight: number;
  top?: number;
  bottom?: number;
  placement: "up" | "down";
  vars: CSSProperties;
};

function readVars(el: HTMLElement): CSSProperties {
  const s = getComputedStyle(el);
  const keys = [
    "--menu-bg",
    "--menu-bg-soft",
    "--menu-panel",
    "--menu-border",
    "--menu-text",
    "--menu-muted",
    "--menu-accent",
    "--menu-shadow",
  ];
  const out: Record<string, string> = {};
  keys.forEach((key) => {
    const v = s.getPropertyValue(key).trim();
    if (v) out[key] = v;
  });
  return out as CSSProperties;
}

function layoutPanel(anchor: HTMLElement): PanelBox {
  const r = anchor.getBoundingClientRect();
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const width = Math.min(Math.max(r.width, 200), Math.max(120, vw - PAD * 2));
  let left = r.left;
  if (left + width > vw - PAD) left = vw - PAD - width;
  if (left < PAD) left = PAD;

  const below = Math.max(0, vh - r.bottom - GAP - PAD);
  const above = Math.max(0, r.top - GAP - PAD);
  const mobile = window.matchMedia("(max-width: 767px)").matches;
  const preferUp = mobile || (below < MAX_H && above > below);
  const placement: "up" | "down" = preferUp && above >= 96 ? "up" : "down";
  const room = placement === "up" ? above : below;
  const maxHeight = Math.min(MAX_H, Math.max(96, room));
  const vars = readVars(anchor);

  if (placement === "up") {
    return {
      left,
      width,
      maxHeight,
      bottom: Math.max(PAD, vh - r.top + GAP),
      placement,
      vars,
    };
  }
  return {
    left,
    width,
    maxHeight,
    top: Math.min(Math.max(PAD, r.bottom + GAP), vh - PAD - 96),
    placement,
    vars,
  };
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
  const panelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const skipFocusOpen = useRef(false);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [box, setBox] = useState<PanelBox | null>(null);
  const [mounted, setMounted] = useState(false);

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
    setMounted(true);
  }, []);

  function syncBox() {
    if (rootRef.current) setBox(layoutPanel(rootRef.current));
  }

  function openMenu() {
    if (disabled) return;
    setOpen(true);
    syncBox();
  }

  function close() {
    setOpen(false);
    setQuery("");
    setBox(null);
  }

  function pick(next: string) {
    skipFocusOpen.current = true;
    onChange(next);
    close();
    inputRef.current?.blur();
    window.setTimeout(() => {
      skipFocusOpen.current = false;
    }, 0);
  }

  useEffect(() => {
    if (!open) return;
    const onOther = (ev: Event) => {
      if ((ev as CustomEvent<string>).detail !== uid) close();
    };
    window.addEventListener("tas-menu-open", onOther);
    window.dispatchEvent(new CustomEvent("tas-menu-open", { detail: uid }));
    return () => window.removeEventListener("tas-menu-open", onOther);
  }, [open, uid]);

  useEffect(() => {
    if (!open) return;
    function place(ev?: Event) {
      const target = ev?.target;
      if (target instanceof Node && panelRef.current?.contains(target)) return;
      syncBox();
    }
    place();
    const vv = window.visualViewport;
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    vv?.addEventListener("resize", place);
    vv?.addEventListener("scroll", place);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
      vv?.removeEventListener("resize", place);
      vv?.removeEventListener("scroll", place);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onDoc(ev: PointerEvent) {
      const node = ev.target as Node;
      if (rootRef.current?.contains(node) || panelRef.current?.contains(node)) return;
      close();
    }
    const timer = window.setTimeout(() => {
      document.addEventListener("pointerdown", onDoc, true);
    }, 0);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("pointerdown", onDoc, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const idx = shown.findIndex((row) => row.value === value);
    setActive(idx < 0 ? 0 : idx);
  }, [open, shown, value]);

  function onKey(ev: KeyboardEvent) {
    if (disabled) return;
    if (!open && (ev.key === "ArrowDown" || ev.key === "Enter" || ev.key === " ")) {
      ev.preventDefault();
      openMenu();
      return;
    }
    if (!open) return;
    if (ev.key === "Escape") {
      ev.preventDefault();
      close();
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

  const panel =
    open && box && mounted
      ? createPortal(
          <div
            ref={panelRef}
            className={`tas-menu-panel is-overlay is-${box.placement}`}
            id={listId}
            role="listbox"
            style={{
              ...box.vars,
              position: "fixed",
              zIndex: 400,
              overflow: "auto",
              left: box.left,
              width: box.width,
              maxHeight: box.maxHeight,
              top: box.placement === "up" ? "auto" : box.top,
              bottom: box.placement === "up" ? box.bottom : "auto",
            }}
          >
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
                  onPointerDown={(ev) => ev.preventDefault()}
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
          </div>,
          document.body,
        )
      : null;

  return (
    <div
      ref={rootRef}
      className={`tas-menu${open ? " is-open" : ""}${compact ? " is-compact" : ""}${searchable ? " is-search" : ""}`}
    >
      {searchable ? (
        <div className="tas-menu-trigger" onPointerDown={() => openMenu()}>
          <input
            ref={inputRef}
            id={id}
            className="tas-menu-search"
            value={open ? query : selected ? optionText(selected) : ""}
            placeholder={open && selected && !query ? optionText(selected) : placeholder}
            required={required && !value}
            disabled={disabled}
            role="combobox"
            aria-expanded={open}
            aria-controls={listId}
            aria-autocomplete="list"
            aria-label={ariaLabel}
            autoComplete="off"
            onFocus={() => {
              if (disabled) return;
              if (skipFocusOpen.current) {
                skipFocusOpen.current = false;
                return;
              }
              openMenu();
            }}
            onChange={(ev) => {
              setQuery(ev.target.value);
              openMenu();
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
          onClick={() => (open ? close() : openMenu())}
          onKeyDown={onKey}
        >
          <span className={`tas-menu-value${selected ? "" : " is-empty"}`}>
            {selected ? optionText(selected) : placeholder}
          </span>
          <Chevron />
        </button>
      )}
      {panel}
    </div>
  );
}
