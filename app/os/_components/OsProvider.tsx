"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { OS_USERS, type OsUser } from "../_data";
import {
  DEMO_PASSWORD,
  SPACE_HOME,
  lookupAccount,
  osUserForAccount,
  type Account,
  type Space,
} from "../_data/auth";

const PASS_KEY = "tas-os-passwords";
const SESSION_KEY = "tas-os-session";
const THEME_KEY = "tas-os-theme";

export type Session = {
  matricule: string;
  space: Space;
  name: string;
  personId: string;
  role: OsUser["role"];
};

export type OsTheme = "light" | "dark";

type PassMap = Record<string, string>;

function readPasses(): PassMap {
  try {
    return JSON.parse(window.localStorage.getItem(PASS_KEY) || "{}") as PassMap;
  } catch {
    return {};
  }
}

function writePasses(map: PassMap) {
  window.localStorage.setItem(PASS_KEY, JSON.stringify(map));
}

export type EnrollDraft = { name: string; phone: string; country: string; leadId?: string; source?: string } | null;

export type OsPanel = "student" | "admin" | "attendance" | "lead" | null;

type OsCtx = {
  user: OsUser;
  session: Session | null;
  ready: boolean;
  collapsed: boolean;
  toggleCollapsed: () => void;
  mobileOpen: boolean;
  openMobile: () => void;
  closeMobile: () => void;
  panel: OsPanel;
  enrollDraft: EnrollDraft;
  openPanel: (kind: Exclude<OsPanel, null>, draft?: EnrollDraft) => void;
  closePanel: () => void;
  theme: OsTheme;
  setTheme: (theme: OsTheme) => void;
  hasPassword: (matricule: string, firstLoginDefault: boolean) => boolean;
  setPassword: (matricule: string, password: string) => void;
  checkPassword: (matricule: string, password: string, firstLoginDefault: boolean) => boolean;
  signIn: (account: Account) => void;
  signOut: () => void;
};

const Ctx = createContext<OsCtx | null>(null);

export function OsProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const [panel, setPanel] = useState<OsPanel>(null);
  const [enrollDraft, setEnrollDraft] = useState<EnrollDraft>(null);
  const [theme, setThemeState] = useState<OsTheme>("light");

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(SESSION_KEY);
      if (raw) setSession(JSON.parse(raw) as Session);
      const saved = window.localStorage.getItem(THEME_KEY);
      if (saved === "dark" || saved === "light") setThemeState(saved);
    } catch {
      /* ignore */
    }
    setReady(true);
  }, []);

  const user = useMemo(() => {
    if (!session) return OS_USERS[0];
    return osUserForAccount(session) ?? OS_USERS[0];
  }, [session]);

  const toggleCollapsed = useCallback(() => setCollapsed((v) => !v), []);
  const openMobile = useCallback(() => setMobileOpen(true), []);
  const closeMobile = useCallback(() => setMobileOpen(false), []);
  const openPanel = useCallback((kind: Exclude<OsPanel, null>, draft?: EnrollDraft) => {
    setEnrollDraft(kind === "student" ? draft ?? null : null);
    setPanel(kind);
  }, []);
  const closePanel = useCallback(() => {
    setPanel(null);
    setEnrollDraft(null);
  }, []);
  const setTheme = useCallback((next: OsTheme) => {
    setThemeState(next);
    window.localStorage.setItem(THEME_KEY, next);
  }, []);

  const hasPassword = useCallback((matricule: string, firstLoginDefault: boolean) => {
    const map = readPasses();
    if (map[matricule]) return true;
    return !firstLoginDefault;
  }, []);

  const setPassword = useCallback((matricule: string, password: string) => {
    const map = readPasses();
    map[matricule] = password;
    writePasses(map);
  }, []);

  const checkPassword = useCallback((matricule: string, password: string, firstLoginDefault: boolean) => {
    const map = readPasses();
    if (map[matricule]) return map[matricule] === password;
    if (!firstLoginDefault) return password === DEMO_PASSWORD;
    return false;
  }, []);

  const signIn = useCallback((account: Account) => {
    const next: Session = {
      matricule: account.matricule,
      space: account.space,
      name: account.name,
      personId: account.personId,
      role: account.role,
    };
    setSession(next);
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(next));
  }, []);

  const signOut = useCallback(() => {
    setSession(null);
    setPanel(null);
    window.localStorage.removeItem(SESSION_KEY);
  }, []);

  const value = useMemo(
    () => ({
      user,
      session,
      ready,
      collapsed,
      toggleCollapsed,
      mobileOpen,
      openMobile,
      closeMobile,
      panel,
      enrollDraft,
      openPanel,
      closePanel,
      theme,
      setTheme,
      hasPassword,
      setPassword,
      checkPassword,
      signIn,
      signOut,
    }),
    [user, session, ready, collapsed, toggleCollapsed, mobileOpen, openMobile, closeMobile, panel, enrollDraft, openPanel, closePanel, theme, setTheme, hasPassword, setPassword, checkPassword, signIn, signOut],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useOs() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useOs must be used inside OsProvider");
  return ctx;
}

export { lookupAccount, SPACE_HOME };
export type { Space };
