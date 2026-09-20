"use client";

import { useEffect, useRef, useState } from "react";
import { useLang } from "../LangProvider";
import { TAS_KPIS } from "../lib/kpi";
import { IconBook, IconGlobe, IconPeople, IconPin } from "./icons";

const ICONS = [IconPeople, IconGlobe, IconBook, IconPin];

/** The rating-style values need one decimal, and a comma in French. */
function format(current: number, target: number, fr: boolean) {
  const text = current.toFixed(Number.isInteger(target) ? 0 : 1);
  return fr ? text.replace(".", ",") : text;
}

/** Horizontal band of the institute's headline figures, counting up on scroll. */
export default function StatsBand() {
  const { lang } = useLang();
  const fr = lang === "fr";
  const root = useRef<HTMLUListElement>(null);
  const [values, setValues] = useState<number[]>(() => TAS_KPIS.map(() => 0));

  useEffect(() => {
    const el = root.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setValues(TAS_KPIS.map((kpi) => kpi.value));
      return;
    }

    let raf = 0;
    const animate = () => {
      const start = performance.now();
      const dur = 1400;
      const tick = (now: number) => {
        const p = Math.min(1, (now - start) / dur);
        const eased = 1 - (1 - p) ** 3;
        setValues(TAS_KPIS.map((kpi) => kpi.value * eased));
        if (p < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.unobserve(entry.target);
        animate();
      },
      { threshold: 0.35 },
    );
    io.observe(el);

    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <ul className="stats-band" ref={root}>
      {TAS_KPIS.map((kpi, i) => {
        const Icon = ICONS[i % ICONS.length];
        return (
          <li key={kpi.en}>
            <span className="icon-badge">
              <Icon />
            </span>
            <div>
              <strong className="stat-n">
                {format(values[i], kpi.value, fr)}
                {kpi.suffix}
              </strong>
              <span className="stat-l">{fr ? kpi.fr : kpi.en}</span>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
