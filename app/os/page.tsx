"use client";

import Link from "next/link";
import { GateChrome } from "./_components/GateChrome";
import { useOsT } from "./_components/useOsT";
import { IcBuilding, IcGraduation, IcSettings, IcUser, IcUsers } from "./_components/icons";

export default function GatePage() {
  const { t } = useOsT();
  const doors = [
    { space: "ceo", href: "/os/login?space=ceo", icon: IcBuilding, title: t.gate.ceo.title },
    { space: "admin", href: "/os/login?space=admin", icon: IcUsers, title: t.gate.admin.title },
    { space: "teacher", href: "/os/login?space=teacher", icon: IcUser, title: t.gate.teacher.title },
    { space: "student", href: "/os/login?space=student", icon: IcGraduation, title: t.gate.student.title },
  ] as const;

  return (
    <GateChrome>
      <div className="os-gate">
        <h1>{t.gate.title}</h1>
        <nav className="os-doors" aria-label={t.gate.title}>
          {doors.map((d) => {
            const Icon = d.icon;
            return (
              <Link key={d.space} href={d.href} className="os-door">
                <Icon />
                {d.title}
              </Link>
            );
          })}
        </nav>
      </div>
      <Link href="/admin" className="os-kitchen-link">
        <IcSettings />
        {t.gate.kitchen}
      </Link>
    </GateChrome>
  );
}
