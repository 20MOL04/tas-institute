"use client";

import { useEffect, useState } from "react";
import { LEADS, LEADS_CHANGED, liveLeads, type Lead } from "../_data";

export function useLiveLeads(): Lead[] {
  const [rows, setRows] = useState<Lead[]>(LEADS);

  useEffect(() => {
    function refresh() {
      setRows(liveLeads());
    }
    refresh();
    window.addEventListener(LEADS_CHANGED, refresh);
    return () => window.removeEventListener(LEADS_CHANGED, refresh);
  }, []);

  return rows;
}
