"use client";

import { founderQueue, HomeBoard } from "../_components/HomeBoard";
import { useOsT } from "../_components/useOsT";
import { useStoreTick } from "../_components/useStoreTick";
import { APPROVALS_CHANGED } from "../_data";

export default function CeoHome() {
  const { t } = useOsT();
  useStoreTick(APPROVALS_CHANGED);
  return (
    <HomeBoard
      title={t.ceo.title}
      actions={[
        { href: "/os/ceo/validations", label: t.ceo.validate },
        { href: "/os/reports", label: t.nav.reports },
        { href: "/os/ceo/traffic", label: t.nav.traffic },
        { panel: "admin", label: t.ceo.createAdmin },
      ]}
      queue={founderQueue()}
    />
  );
}
