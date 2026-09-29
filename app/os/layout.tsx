import type { ReactNode } from "react";
import "./os.css";
import "./founder.css";
import "../components/ui/select-menu.css";
import { OsProvider } from "./_components/OsProvider";
import Shell from "./_components/Shell";
import { ToastProvider } from "./_components/Toast";

export const metadata = {
  title: "TAS App",
  robots: { index: false, follow: false },
};

export default function OsLayout({ children }: { children: ReactNode }) {
  return (
    <OsProvider>
      <ToastProvider>
        <Shell>{children}</Shell>
      </ToastProvider>
    </OsProvider>
  );
}
