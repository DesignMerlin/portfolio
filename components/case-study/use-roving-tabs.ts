"use client";

import { useRef } from "react";

/** Arrow-key navigation for a tab list (WAI-ARIA tabs pattern, automatic activation) */
export function useRovingTabs(count: number, active: number, select: (i: number) => void, vertical = false) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    const next = vertical ? "ArrowDown" : "ArrowRight";
    const prev = vertical ? "ArrowUp" : "ArrowLeft";
    let to: number | null = null;
    if (e.key === next) to = (active + 1) % count;
    else if (e.key === prev) to = (active - 1 + count) % count;
    else if (e.key === "Home") to = 0;
    else if (e.key === "End") to = count - 1;
    if (to === null) return;
    e.preventDefault();
    select(to);
    refs.current[to]?.focus();
  };

  const tabProps = (i: number) => ({
    ref: (el: HTMLButtonElement | null) => {
      refs.current[i] = el;
    },
    role: "tab" as const,
    "aria-selected": i === active,
    tabIndex: i === active ? 0 : -1,
    onKeyDown,
    onClick: () => select(i),
  });

  return { tabProps };
}
