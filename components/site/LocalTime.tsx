"use client";

import { useEffect, useState } from "react";
import { site } from "@/lib/site";

const format = (date: Date) =>
  new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: site.timeZone,
  }).format(date);

// Live Lagos time, so a recruiter in another timezone knows when Samuel is around.
export function LocalTime() {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    const tick = () => setTime(format(new Date()));
    tick();
    const id = setInterval(tick, 15_000);
    return () => clearInterval(id);
  }, []);

  return (
    <time className="tabular-nums" suppressHydrationWarning>
      {time ?? "--:--"} {site.timeZoneLabel}
    </time>
  );
}
