"use client";

import { useEffect, useState, type ReactNode } from "react";
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

  useEffect(() => {
    setMounted(true);
  }, []);

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
        className={`os-drawer${open ? " open" : ""}${fit ? " is-fit" : ""}${compact ? " is-compact" : ""}`}
        aria-hidden={!open}
        role="dialog"
        aria-modal={open}
        aria-label={title}
        inert={!open ? true : undefined}
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
