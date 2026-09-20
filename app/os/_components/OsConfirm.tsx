"use client";

import OsDrawer from "./OsDrawer";

export default function OsConfirm({
  open,
  title,
  body,
  confirmLabel = "Enregistrer",
  cancelLabel = "Annuler",
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  body: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <OsDrawer open={open} title={title} onClose={onCancel} compact>
      <p className="os-confirm-copy">{body}</p>
      <div className="os-confirm-actions">
        <button type="button" className="os-btn" onClick={onCancel}>
          {cancelLabel}
        </button>
        <button type="button" className="os-btn os-btn-primary" onClick={onConfirm}>
          {confirmLabel}
        </button>
      </div>
    </OsDrawer>
  );
}
