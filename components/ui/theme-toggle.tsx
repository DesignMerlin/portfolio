"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useSyncExternalStore } from "react";
import { MoonIcon, SunIcon } from "@/components/ui/icons";
import { tween } from "@/lib/motion";

type Theme = "light" | "dark";

const listeners = new Set<() => void>();
const subscribe = (fn: () => void) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};
const read = (): Theme => (document.documentElement.dataset.theme === "dark" ? "dark" : "light");

/** Swap the theme. The whole page crossfades through a view transition where supported. */
export function setTheme(next: Theme) {
  const html = document.documentElement;
  const apply = () => {
    html.dataset.theme = next;
    try {
      localStorage.setItem("theme", next);
    } catch {}
    listeners.forEach((l) => l());
  };
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!document.startViewTransition || reduce) return apply();
  // The view transition does the crossfade; per-element colour transitions would double it.
  html.classList.add("theme-swap");
  document.startViewTransition(apply).finished.finally(() => html.classList.remove("theme-swap"));
}

export function useTheme() {
  return useSyncExternalStore(subscribe, read, () => "dark" as Theme);
}

export function ThemeToggle() {
  const theme = useTheme();
  const reduce = useReducedMotion();
  const next = theme === "dark" ? "light" : "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(next)}
      aria-label={`Switch to ${next} theme`}
      className="pressable relative grid size-9 place-items-center rounded-full text-ink-2 transition-colors duration-150 hover:bg-sunken hover:text-ink"
    >
      <AnimatePresence initial={false} mode="popLayout">
        <motion.span
          key={theme}
          initial={reduce ? { opacity: 0 } : { opacity: 0, transform: "rotate(-60deg) scale(0.6)", filter: "blur(2px)" }}
          animate={{ opacity: 1, transform: "rotate(0deg) scale(1)", filter: "blur(0px)" }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, transform: "rotate(60deg) scale(0.6)", filter: "blur(2px)" }}
          transition={tween("quick")}
          className="grid place-items-center"
        >
          {theme === "dark" ? <MoonIcon /> : <SunIcon />}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}
