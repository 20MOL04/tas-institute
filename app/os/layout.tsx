import type { ReactNode } from "react";
import "./os.css";
import "../components/ui/select-menu.css";
import { OsProvider } from "./_components/OsProvider";
import Shell from "./_components/Shell";

export const metadata = {
  title: "TAS App",
  robots: { index: false, follow: false },
};

export default function OsLayout({ children }: { children: ReactNode }) {
  return (
    <OsProvider>
      <Shell>{children}</Shell>
    </OsProvider>
  );
}
