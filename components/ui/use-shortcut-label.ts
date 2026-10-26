"use client";

import { useSyncExternalStore } from "react";

const noop = () => () => {};

/** "⌘K" on Apple devices, "Ctrl K" everywhere else. Server renders the neutral form. */
export function useShortcutLabel() {
  return useSyncExternalStore(
    noop,
    () => (/Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent) ? "⌘K" : "Ctrl K"),
    () => "Ctrl K",
  );
}
