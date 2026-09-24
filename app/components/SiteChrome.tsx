"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import Header from "./Header";
import Footer from "./Footer";
import WhatsAppFloat from "./WhatsAppFloat";
import Reveal from "./Reveal";

/** Public chrome stays off the Digital OS so the two products don't collide. */
export default function SiteChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  if (pathname?.startsWith("/os") || pathname?.startsWith("/admin") || pathname?.startsWith("/flyer")) return <>{children}</>;

  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
      <WhatsAppFloat />
      <Reveal />
    </>
  );
}
