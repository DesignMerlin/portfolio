"use client";

import { useSyncExternalStore } from "react";

const query = "(prefers-reduced-motion: reduce)";

const subscribe = (onChange: () => void) => {
  const mq = matchMedia(query);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
};

/**
 * Reduced-motion preference that is safe to branch markup on.
 * Motion's own hook reads the media query on the very first client render,
 * so a component that renders differently for reduced motion would no longer
 * match the server HTML; React then throws away the whole document (and with
 * it the theme set by the boot script). This reports `false` during hydration,
 * exactly like the server, then switches to the real preference.
 */
export function useReducedMotion() {
  return useSyncExternalStore(subscribe, () => matchMedia(query).matches, () => false);
}
