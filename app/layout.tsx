import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./design-system.css";
import { LangProvider } from "./LangProvider";
import Header from "./components/Header";
import Footer from "./components/Footer";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "TAS English Institute — English School & Professional Training, Accra",
    template: "%s | TAS English Institute",
  },
  description:
    "TAS English Institute is an English language school and professional training institute in Accra, Ghana, offering structured programs for African and international students.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={jakarta.variable}>
      <body>
        <LangProvider>
          <Header />
          <main>{children}</main>
          <Footer />
        </LangProvider>
      </body>
    </html>
  );
}
