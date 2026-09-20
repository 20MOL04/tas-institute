import type { ReactNode } from "react";
import "../os/os.css";
import { OsProvider } from "../os/_components/OsProvider";
import AdminShell from "./_components/AdminShell";

export const metadata = {
  title: "TAS Back office",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <OsProvider>
      <AdminShell>{children}</AdminShell>
    </OsProvider>
  );
}
