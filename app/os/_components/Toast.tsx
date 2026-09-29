"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { IcCheckCircle, IcAlert, IcClose } from "./icons";
import { useOs } from "./OsProvider";

type ToastKind = "success" | "error" | "info";
type ToastItem = { id: number; kind: ToastKind; text: string };

type ToastApi = {
  success: (text: string) => void;
  error: (text: string) => void;
  info: (text: string) => void;
};

const Ctx = createContext<ToastApi | null>(null);

/** Petit système de notifications : « Enregistré ✓ », erreurs. Annoncé aux lecteurs d'écran. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const { theme } = useOs();
  const [items, setItems] = useState<ToastItem[]>([]);
  const seq = useRef(0);
  const timers = useRef(new Map<number, ReturnType<typeof setTimeout>>());

  const dismiss = useCallback((id: number) => {
    setItems((list) => list.filter((t) => t.id !== id));
    const timer = timers.current.get(id);
    if (timer) clearTimeout(timer);
    timers.current.delete(id);
  }, []);

  const push = useCallback(
    (kind: ToastKind, text: string) => {
      seq.current += 1;
      const id = seq.current;
      setItems((list) => [...list.slice(-3), { id, kind, text }]);
      timers.current.set(
        id,
        setTimeout(() => dismiss(id), kind === "error" ? 7000 : 4000),
      );
    },
    [dismiss],
  );

  useEffect(() => {
    const map = timers.current;
    return () => map.forEach((t) => clearTimeout(t));
  }, []);

  const api = useMemo<ToastApi>(
    () => ({
      success: (text) => push("success", text),
      error: (text) => push("error", text),
      info: (text) => push("info", text),
    }),
    [push],
  );

  return (
    <Ctx.Provider value={api}>
      {children}
      <div className="os-sheet-host fx-toasts" data-theme={theme} role="region" aria-label="Notifications">
        <div aria-live="polite" aria-atomic="false">
          {items.map((t) => (
            <div key={t.id} className={`fx-toast fx-toast-${t.kind}`} role={t.kind === "error" ? "alert" : "status"}>
              {t.kind === "error" ? <IcAlert /> : <IcCheckCircle />}
              <span>{t.text}</span>
              <button type="button" onClick={() => dismiss(t.id)} aria-label="Fermer la notification">
                <IcClose />
              </button>
            </div>
          ))}
        </div>
      </div>
    </Ctx.Provider>
  );
}

const NOOP: ToastApi = { success: () => undefined, error: () => undefined, info: () => undefined };

export function useToast(): ToastApi {
  return useContext(Ctx) ?? NOOP;
}
