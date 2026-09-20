import type { Role } from "../_data/core";
import {
  IcBuilding,
  IcCalendar,
  IcCheckCircle,
  IcClipboard,
  IcFile,
  IcFunnel,
  IcGraduation,
  IcGrid,
  IcLayers,
  IcTable,
  IcTrend,
  IcUser,
  IcUsers,
  IcWallet,
} from "./icons";

export type NavItem = {
  href: string;
  label: string;
  icon: (p: { className?: string }) => JSX.Element;
  badge?: string;
  roles: Role[];
};

export type NavGroup = { label: string; items: NavItem[] };

const CEO: Role[] = ["founder", "superadmin", "director"];
const OPS: Role[] = ["admin"];
const MONEY: Role[] = ["finance"];
const TEA: Role[] = ["teacher"];
const STU: Role[] = ["student"];

export const NAV: NavGroup[] = [
  {
    label: "Direction",
    items: [
      { href: "/os/ceo", label: "Tableau de bord", icon: IcGrid, roles: CEO },
      { href: "/os/ceo/validations", label: "À valider", icon: IcCheckCircle, roles: CEO },
      { href: "/os/ceo/admins", label: "Administrateurs", icon: IcUser, roles: CEO },
      { href: "/os/ceo/traffic", label: "Trafic", icon: IcTrend, roles: CEO },
    ],
  },
  {
    label: "Bureau",
    items: [
      { href: "/os/desk", label: "Tableau de bord", icon: IcGrid, roles: ["admin", "finance"] },
      { href: "/os/applications", label: "Candidatures", icon: IcClipboard, roles: OPS },
      { href: "/os/crm", label: "Inscriptions en ligne", icon: IcFunnel, roles: ["admin"] },
      { href: "/os/students", label: "Étudiants", icon: IcUsers, roles: ["admin", "finance"] },
      { href: "/os/teachers", label: "Enseignants", icon: IcUser, roles: ["admin"] },
      { href: "/os/transfers", label: "Transferts", icon: IcLayers, roles: ["admin"] },
      { href: "/os/print/teachers", label: "Imprimer fiches profs", icon: IcFile, roles: OPS },
      { href: "/os/intakes", label: "Sessions", icon: IcCalendar, roles: OPS },
      { href: "/os/finance", label: "Paiements", icon: IcWallet, roles: MONEY },
    ],
  },
  {
    label: "Enseignant",
    items: [
      { href: "/os/teacher", label: "Tableau de bord", icon: IcGrid, roles: TEA },
      { href: "/os/teacher/evaluations", label: "Évaluations", icon: IcGraduation, roles: TEA },
      { href: "/os/attendance", label: "Présences", icon: IcTable, roles: TEA },
      { href: "/os/groups", label: "Groupes", icon: IcLayers, roles: TEA },
    ],
  },
  {
    label: "Élève",
    items: [
      { href: "/os/student", label: "Mon espace", icon: IcGraduation, roles: STU },
      { href: "/os/student/grades", label: "Notes", icon: IcTable, roles: STU },
      { href: "/os/student/documents", label: "Documents", icon: IcFile, roles: STU },
    ],
  },
];

export const ALL_ITEMS: NavItem[] = NAV.flatMap((g) => g.items);

export function titleFor(pathname: string): { title: string; group: string } {
  const exact = ALL_ITEMS.find((i) => i.href === pathname);
  if (exact) {
    const group = NAV.find((g) => g.items.includes(exact))?.label ?? "";
    return { title: exact.label, group };
  }
  const parent = ALL_ITEMS.filter((i) => pathname.startsWith(`${i.href}/`)).sort((a, b) => b.href.length - a.href.length)[0];
  if (parent) {
    const group = NAV.find((g) => g.items.includes(parent))?.label ?? "";
    return { title: parent.label, group };
  }
  return { title: "TAS App", group: "" };
}

export function canAccess(item: NavItem, role: Role) {
  return item.roles.includes(role);
}

const FOUNDER_RECORDS = [
  "/os/students",
  "/os/crm",
  "/os/applications",
  "/os/transfers",
  "/os/teachers",
  "/os/schools",
  "/os/reports",
  "/os/intakes",
  "/os/print",
];

export function canOpenPath(role: Role, pathname: string) {
  if (ALL_ITEMS.some((i) => canAccess(i, role) && (pathname === i.href || pathname.startsWith(`${i.href}/`)))) {
    return true;
  }
  if (role === "founder" || role === "director" || role === "superadmin") {
    return FOUNDER_RECORDS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  }
  return false;
}
