"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import BrandIcon from "../../components/BrandIcon";
import { IcAlert, IcClose, IcFile, IcGrid, IcHome, IcMenu, IcTrend, IcVideo } from "../../os/_components/icons";

const ADMIN_NAV = [
  { href: "/admin", label: "Back office", icon: IcGrid },
  { href: "/admin/pages", label: "Pages du site", icon: IcFile },
  { href: "/admin/media", label: "Médias", icon: IcVideo },
  { href: "/admin/traffic", label: "Trafic", icon: IcTrend },
  { href: "/admin/blockages", label: "Blocages", icon: IcAlert },
];

export default function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname() || "/admin";
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <div className="os">
      <div className="os-layout">
        <div className={`os-scrim-nav${open ? " open" : ""}`} onClick={() => setOpen(false)} />
        <aside className={`os-sidebar${open ? " open" : ""}`}>
          <div className="os-brand">
            <Link href="/admin" className="os-brand" style={{ flex: 1, minWidth: 0, padding: 0, height: "auto" }} onClick={() => setOpen(false)}>
              <BrandIcon size={30} className="os-brand-mark" />
              <span className="os-brand-text">
                <strong>TAS</strong>
                <span>Back office</span>
              </span>
            </Link>
            <button type="button" className="os-close-mobile" onClick={() => setOpen(false)} aria-label="Fermer">
              <IcClose />
            </button>
          </div>
          <nav className="os-nav">
            <div className="os-nav-group">Pilotage</div>
            {ADMIN_NAV.map((item) => {
              const Icon = item.icon;
              const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
              return (
                <Link key={item.href} href={item.href} className={active ? "active" : ""} onClick={() => setOpen(false)}>
                  <Icon />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
          <div className="os-sidebar-foot">
            <Link href="/os">← Retour à l&apos;app</Link>
          </div>
        </aside>
        <div className="os-main">
          <header className="os-topbar">
            <button type="button" className="os-burger" aria-label="Ouvrir le menu" onClick={() => setOpen(true)}>
              <IcMenu />
            </button>
            <div className="os-topbar-title">
              <strong>Back office</strong>
            </div>
            <div className="os-topbar-tools">
              <nav className="os-product-switch" aria-label="Produit">
                <Link href="/os">App</Link>
                <Link href="/admin" className="active">
                  Back office
                </Link>
              </nav>
              <Link href="/" className="os-btn os-btn-sm">
                <IcHome />
                Site
              </Link>
            </div>
          </header>
          <div className="os-content">
            <div className="os-page-stack">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
