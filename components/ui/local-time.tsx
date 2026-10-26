"use client";

import { useEffect, useState } from "react";

const ZONE = "Africa/Lagos";

function lagosTime(d: Date) {
  return new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: ZONE }).format(d);
}

/** Hours between Lagos and the visitor, e.g. "1 hour ahead of you" */
function relative(d: Date) {
  const offset = (zone?: string) => {
    const parts = new Intl.DateTimeFormat("en-US", { timeZone: zone, timeZoneName: "longOffset" })
      .formatToParts(d)
      .find((p) => p.type === "timeZoneName")?.value;
    const m = parts?.match(/GMT([+-])(\d{2}):?(\d{2})?/);
    if (!m) return 0;
    return (m[1] === "-" ? -1 : 1) * (Number(m[2]) * 60 + Number(m[3] ?? 0));
  };
  const diff = (offset(ZONE) - offset()) / 60;
  if (diff === 0) return "same time as you";
  const h = Math.abs(diff);
  const unit = h === 1 ? "hour" : "hours";
  return `${Number.isInteger(h) ? h : h.toFixed(1)} ${unit} ${diff > 0 ? "ahead of" : "behind"} you`;
}

/** Ticks on the minute boundary, not every second, so it never wastes renders */
function useNow() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      const d = new Date();
      setNow(d);
      timer = setTimeout(tick, 60_000 - (d.getTime() % 60_000) + 50);
    };
    tick();
    return () => clearTimeout(timer);
  }, []);
  return now;
}

export function LocalTime({ withRelative = false }: { withRelative?: boolean }) {
  const now = useNow();
  return (
    <span className="tabular font-mono text-micro text-ink-2">
      <span className="text-ink">Lagos {now ? lagosTime(now) : "--:--"}</span>{" "}
      <span>WAT</span>
      {withRelative && now ? <span className="text-ink-3">, {relative(now)}</span> : null}
    </span>
  );
}
