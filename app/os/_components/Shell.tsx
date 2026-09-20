"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { APPROVALS_CHANGED, NOTIFICATIONS, PENDING_TRANSFERS, countPending } from "../_data";
import { SPACE_HOME } from "../_data/auth";
import { ALL_ITEMS, NAV, canAccess, canOpenPath } from "./nav";
import { useOs } from "./OsProvider";
import { useOsT } from "./useOsT";
import GlobalSearch from "./GlobalSearch";
import EnrollPanels from "./EnrollPanels";
import OsDrawer from "./OsDrawer";
import AccountMenu from "./AccountMenu";
import { useLiveLeads } from "./useLiveLeads";
import { useStoreTick } from "./useStoreTick";
import { IcBell, IcChevronLeft, IcChevronRight, IcClose, IcHome, IcMenu } from "./icons";

function isActive(href: string, pathname: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

const BARE = ["/os", "/os/login", "/os/forgot"];

export default function Shell({ children }: { children: ReactNode }) {
  const pathname = usePathname() || "/os";
  const router = useRouter();
  const { t } = useOsT();
  const { session, ready, collapsed, toggleCollapsed, mobileOpen, openMobile, closeMobile, signOut, panel, theme } = useOs();
  const [notifs, setNotifs] = useState(false);
  const liveLeads = useLiveLeads();
  useStoreTick(APPROVALS_CHANGED);
  useEffect(() => {
    if (panel) setNotifs(false);
  }, [panel]);
  const backTo = useMemo(() => {
    if (!session) return null;
    const allowed = ALL_ITEMS.filter((item) => canAccess(item, session.role));
    if (allowed.some((item) => item.href === pathname)) return null;
    const parts = pathname.split("/").filter(Boolean);
    if (parts.length < 3) return null;
    const up = `/${parts.slice(0, -1).join("/")}`;
    const nestedOk = allowed.some((item) => up === item.href || up.startsWith(`${item.href}/`));
    return nestedOk ? up : null;
  }, [pathname, session]);
  const bare = BARE.some((p) => pathname === p || pathname.startsWith(`${p}?`)) || pathname.startsWith("/os/login") || pathname.startsWith("/os/forgot");

  useEffect(() => {
    closeMobile();
  }, [pathname, closeMobile]);

  useEffect(() => {
    if (bare) return;
    if (!ready) return;
    if (!session) {
      router.replace("/os");
      return;
    }
    const allowed = canOpenPath(session.role, pathname);
    if (!allowed) router.replace(SPACE_HOME[session.space]);
  }, [pathname, session, router, bare, ready]);

  const groups = useMemo(
    () =>
      NAV.map((g) => ({
        ...g,
        items: g.items.filter((item) => session && canAccess(item, session.role)),
      })).filter((g) => g.items.length > 0),
    [session],
  );

  const unreadNotifs = NOTIFICATIONS.filter((n) => {
    if (n.read) return false;
    if (session?.role === "teacher" || session?.role === "student") return n.category === "Académique";
    if (session?.role === "admin") return n.category === "Admissions" || n.category === "Opérations";
    if (session?.role === "finance") return n.category === "Finance";
    if (session?.role === "founder" || session?.role === "director") return n.category === "Admissions" || n.category === "Opérations";
    return false;
  });
  const reviewCount = countPending();
  const unread =
    unreadNotifs.length +
    (session?.role === "founder" || session?.role === "director" || session?.role === "superadmin"
      ? reviewCount
      : session?.role === "admin"
        ? PENDING_TRANSFERS.length
        : 0);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setNotifs(false);
        closeMobile();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [closeMobile]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  if (bare) return <>{children}</>;

  return (
    <div className="os os-app" data-theme={theme}>
      <div className="os-layout">
        <div className={`os-scrim-nav${mobileOpen ? " open" : ""}`} onClick={closeMobile} />
        <aside className={`os-sidebar${collapsed ? " collapsed" : ""}${mobileOpen ? " open" : ""}`}>
          <div className="os-brand">
            <Link href="/os" className="os-brand" style={{ flex: 1, minWidth: 0, padding: 0, height: "auto" }} onClick={closeMobile}>
              <span className="os-brand-mark">
                <IcHome />
              </span>
              <span className="os-brand-text">
                <strong>TAS App</strong>
                <span>{session?.name ?? "TAS App"}</span>
              </span>
            </Link>
            <button type="button" className="os-collapse" onClick={toggleCollapsed} aria-label="Replier le menu">
              <IcChevronRight />
            </button>
            <button type="button" className="os-close-mobile" onClick={closeMobile} aria-label="Fermer">
              <IcClose />
            </button>
          </div>
          <nav className="os-nav" aria-label="Navigation">
            {groups.map((g) => (
              <div key={g.label}>
                <div className="os-nav-group">{g.label}</div>
                {g.items.map((item) => {
                  const Icon = item.icon;
                  const badge =
                    item.href === "/os/crm"
                      ? String(liveLeads.filter((l) => l.stage === "new").length)
                      : item.href === "/os/ceo/validations"
                        ? String(reviewCount)
                        : item.badge;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={isActive(item.href, pathname) ? "active" : ""}
                      title={collapsed ? item.label : undefined}
                      onClick={closeMobile}
                    >
                      <Icon />
                      <span>{item.label}</span>
                      {badge && badge !== "0" ? <span className="os-nav-badge">{badge}</span> : null}
                    </Link>
                  );
                })}
              </div>
            ))}
          </nav>
          <div className="os-sidebar-foot">
            <button
              type="button"
              className="os-btn os-btn-sm"
              onClick={() => {
                signOut();
                router.push("/os");
              }}
            >
              {t.nav.exit}
            </button>
          </div>
        </aside>

        <div className="os-main">
          <header className="os-topbar">
            <button type="button" className="os-burger" aria-label="Menu" onClick={openMobile}>
              <IcMenu />
            </button>
            <GlobalSearch />
            <div className="os-topbar-tools">
              {session?.role === "founder" ? (
                <Link href="/admin" className="os-btn os-btn-sm os-hide-mobile">
                  {t.nav.kitchen}
                </Link>
              ) : null}
              <button type="button" className="os-bell" aria-label="Notifications" onClick={() => setNotifs(true)}>
                <IcBell />
                {unread > 0 ? <span className="os-bell-dot">{unread > 99 ? "99" : unread}</span> : null}
              </button>
              <AccountMenu />
            </div>
          </header>
          <div className="os-content">
            <div className="os-page-stack">
              {backTo ? (
                <Link href={backTo} className="os-back">
                  <span className="os-back-disc" aria-hidden="true">
                    <IcChevronLeft />
                  </span>
                  Retour
                </Link>
              ) : null}
              {children}
            </div>
          </div>
        </div>
      </div>

      <OsDrawer open={notifs} title="Notifications" onClose={() => setNotifs(false)} badge={<span className="os-nav-badge">{unread}</span>}>
        {reviewCount > 0 && (session?.role === "founder" || session?.role === "director" || session?.role === "superadmin") ? (
          <Link href="/os/ceo/validations" className="os-list-item" onClick={() => setNotifs(false)}>
            <div>
              <strong>
                {reviewCount} {t.nav.validations}
              </strong>
              <span>{t.ceo.pendingReview}</span>
            </div>
          </Link>
        ) : null}
        {PENDING_TRANSFERS.length > 0 && session?.role === "admin" ? (
          <Link href="/os/transfers" className="os-list-item" onClick={() => setNotifs(false)}>
            <div>
              <strong>
                {PENDING_TRANSFERS.length} {t.transfers.pending}
              </strong>
              <span>{t.nav.transfers}</span>
            </div>
          </Link>
        ) : null}
        {unreadNotifs.map((n) => (
          <div key={n.id} className="os-list-item">
            <div>
              <strong>{n.title}</strong>
              <span>
                {n.category} {n.detail}
              </span>
            </div>
            <span className="os-list-time">{n.at}</span>
          </div>
        ))}
      </OsDrawer>
      <EnrollPanels />
    </div>
  );
}
