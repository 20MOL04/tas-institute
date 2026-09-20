"use client";

import { useEffect, useState } from "react";
import { PAYMENTS, PAYMENTS_CHANGED, livePayments, type Payment } from "../_data";

export function useLivePayments(): Payment[] {
  const [rows, setRows] = useState<Payment[]>(PAYMENTS);

  useEffect(() => {
    function refresh() {
      setRows(livePayments());
    }
    refresh();
    window.addEventListener(PAYMENTS_CHANGED, refresh);
    return () => window.removeEventListener(PAYMENTS_CHANGED, refresh);
  }, []);

  return rows;
}
