"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { IcClose } from "./icons";
import { useOs } from "./OsProvider";

let openSheets = 0;

function lockPage() {
  openSheets += 1;
  document.documentElement.classList.add("os-sheet-open");
}

function unlockPage() {
  openSheets = Math.max(0, openSheets - 1);
  if (openSheets === 0) document.documentElement.classList.remove("os-sheet-open");
}

export default function OsDrawer({
  open,
  title,
  onClose,
  children,
  badge,
  fit,
  compact,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  badge?: ReactNode;
  fit?: boolean;
  compact?: boolean;
}) {
  const { theme } = useOs();
  const [mounted, setMounted] = useState(false);
  const panel = useRef<HTMLElement>(null);
  const returnTo = useRef<HTMLElement | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Focus goes into the dialog when it opens and comes back to the trigger when it closes.
  useEffect(() => {
    if (!open) return;
    returnTo.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const timer = window.setTimeout(() => {
      const el = panel.current;
      if (!el) return;
      const target = el.querySelector<HTMLElement>("[data-autofocus], .os-drawer-body input, .os-drawer-body textarea, .os-drawer-body select, .os-drawer-body button, .os-drawer-body a[href]") ?? el.querySelector<HTMLElement>(".os-drawer-close");
      target?.focus();
    }, 60);
    return () => {
      window.clearTimeout(timer);
      returnTo.current?.focus?.();
    };
  }, [open]);

  // Keep Tab inside the open dialog.
  useEffect(() => {
    if (!open) return;
    const onTab = (e: KeyboardEvent) => {
      if (e.key !== "Tab" || !panel.current) return;
      const items = Array.from(
        panel.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'),
      ).filter((el) => el.offsetParent !== null);
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onTab);
    return () => window.removeEventListener("keydown", onTab);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    lockPage();
    return () => unlockPage();
  }, [open]);

  if (!mounted) return null;

  return createPortal(
    <div className="os-sheet-host" data-theme={theme}>
      <div className={`os-scrim${open ? " open" : ""}${compact ? " is-confirm" : ""}`} onClick={onClose} />
      <aside
        ref={panel}
        className={`os-drawer${open ? " open" : ""}${fit ? " is-fit" : ""}${compact ? " is-compact" : ""}`}
        aria-hidden={!open}
        role="dialog"
        aria-modal={open}
        aria-label={title}
        {...(!open ? ({ inert: "" } as Record<string, string>) : {})}
      >
        <div className="os-drawer-handle" aria-hidden="true" />
        <div className="os-drawer-head">
          <strong>{title}</strong>
          {badge}
          <button type="button" className="os-btn os-btn-icon os-drawer-close" onClick={onClose} aria-label="Fermer">
            <IcClose />
          </button>
        </div>
        <div className="os-drawer-body">{children}</div>
      </aside>
    </div>,
    document.body,
  );
}
