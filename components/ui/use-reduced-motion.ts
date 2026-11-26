"use client";

import { useSyncExternalStore } from "react";

/*
  Reduced motion has two sources: the visitor's OS setting, and the site's own toggle (the motion
  button, bottom left). The answer lives on <html data-motion="reduce">: the boot script in
  app/layout.tsx sets it before first paint, CSS keys every reduced-motion rule off it, and this
  module keeps it current. A choice made with the toggle is saved and wins over the OS setting.
*/
const QUERY = "(prefers-reduced-motion: reduce)";
const KEY = "motion";
const listeners = new Set<() => void>();

type Saved = "reduce" | "full" | null;
function saved(): Saved {
  try {
    const v = localStorage.getItem(KEY);
    return v === "reduce" || v === "full" ? v : null;
  } catch {
    return null;
  }
}

function sync() {
  const s = saved();
  const reduce = s ? s === "reduce" : matchMedia(QUERY).matches;
  const html = document.documentElement;
  if (reduce) html.dataset.motion = "reduce";
  else delete html.dataset.motion;
  listeners.forEach((l) => l());
}

/** Is motion reduced right now? For one-off checks outside React. */
export function motionReduced() {
  return document.documentElement.dataset.motion === "reduce";
}

/** Turn the site's motion off (true) or back on (false), and remember the choice. */
export function setMotionReduced(reduce: boolean) {
  try {
    localStorage.setItem(KEY, reduce ? "reduce" : "full");
  } catch {}
  sync();
}

const subscribe = (onChange: () => void) => {
  const mq = matchMedia(QUERY);
  listeners.add(onChange);
  mq.addEventListener("change", sync);
  return () => {
    listeners.delete(onChange);
    mq.removeEventListener("change", sync);
  };
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
  return useSyncExternalStore(subscribe, motionReduced, () => false);
}
