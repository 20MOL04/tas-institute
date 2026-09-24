import type { Metadata, Viewport } from "next";
import { Instrument_Serif, Plus_Jakarta_Sans } from "next/font/google";
import "./design-system.css";
import "./components/ui/select-menu.css";
import { LangProvider } from "./LangProvider";
import SiteChrome from "./components/SiteChrome";
import { SITE_URL } from "./lib/site";
import { SITE_DESCRIPTION, SITE_KEYWORDS, SITE_NAME, organizationJsonLd } from "./lib/seo";
import JsonLd from "./components/JsonLd";
import { palette, themeCss } from "./lib/theme";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-jakarta",
  display: "swap",
});

const display = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: palette.blue,
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "TAS English Institute | Apprendre l'anglais à Accra, Ghana",
    template: "%s | TAS English Institute",
  },
  description: SITE_DESCRIPTION,
  keywords: SITE_KEYWORDS,
  applicationName: SITE_NAME,
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: "education",
  formatDetection: { telephone: false, email: false, address: false },
  alternates: {
    types: { "application/rss+xml": [{ url: "/resources/feed.xml", title: "Ressources TAS English Institute" }] },
  },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    locale: "fr_FR",
    alternateLocale: ["en_GB"],
    url: "/",
    title: "TAS English Institute | Apprendre l'anglais à Accra, Ghana",
    description: SITE_DESCRIPTION,
    images: [{ url: "/images/og/home.jpg", width: 1200, height: 630, alt: SITE_NAME }],
  },
  twitter: {
    card: "summary_large_image",
    title: "TAS English Institute | Apprendre l'anglais à Accra, Ghana",
    description: SITE_DESCRIPTION,
    images: ["/images/og/home.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${jakarta.variable} ${display.variable}`}>
      <head>
        {/* Palette unique (app/lib/theme.ts) : toutes les feuilles CSS lisent ces variables. */}
        <style id="tas-theme" dangerouslySetInnerHTML={{ __html: themeCss() }} />
        <link rel="preconnect" href="https://www.google.com" />
        <link rel="preconnect" href="https://maps.googleapis.com" />
        <link rel="preconnect" href="https://maps.gstatic.com" crossOrigin="" />
        <link rel="dns-prefetch" href="https://www.google.com" />
      </head>
      <body>
        <JsonLd data={organizationJsonLd()} />
        <LangProvider>
          <SiteChrome>{children}</SiteChrome>
        </LangProvider>
      </body>
    </html>
  );
}
