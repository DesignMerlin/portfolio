"use client";

import { useSyncExternalStore } from "react";

/**
 * Live media query match. Reports `false` on the server and during hydration
 * (so markup matches), then the real value.
 */
export function useMediaQuery(query: string) {
  return useSyncExternalStore(
    (onChange) => {
      const mq = matchMedia(query);
      mq.addEventListener("change", onChange);
      return () => mq.removeEventListener("change", onChange);
    },
    () => matchMedia(query).matches,
    () => false,
  );
}

/**
 * `null` until the client has mounted, then the live match. Use this when a value must not be
 * acted on during hydration at all (e.g. assigning a unique view-transition name to exactly one
 * of two copies), rather than flipping from a guess to the real value.
 */
export function useMediaQueryAfterMount(query: string): boolean | null {
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const matches = useMediaQuery(query);
  return mounted ? matches : null;
}
