"use client";

import { useSyncExternalStore } from "react";

type Theme = "light" | "dark";

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributeFilter: ["data-theme"] });
  return () => observer.disconnect();
}
const getTheme = (): Theme =>
  document.documentElement.dataset.theme === "dark" ? "dark" : "light";

export function setTheme(next: Theme) {
  const apply = () => {
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem("theme", next);
    } catch {}
  };
  // Crossfade the whole page where supported; instant otherwise.
  // Reduced motion is handled by the view-transition CSS.
  if (document.startViewTransition) document.startViewTransition(apply);
  else apply();
}

export function ThemeToggle() {
  // Server snapshot is null: the real theme is only known in the browser.
  const theme = useSyncExternalStore(subscribe, getTheme, () => null);
  const next: Theme = theme === "dark" ? "light" : "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(next)}
      aria-label={theme ? `Switch to ${next} theme` : "Switch theme"}
      className="grid size-10 place-items-center rounded-md text-muted transition-colors duration-(--dur-quick) hover:bg-ink-soft hover:text-fg"
    >
      <svg viewBox="0 0 20 20" className="size-[18px]" aria-hidden="true">
        {/* Half-filled disc: reads as "contrast" in either theme. */}
        <circle cx="10" cy="10" r="7.25" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <path d="M10 2.75a7.25 7.25 0 0 1 0 14.5Z" fill="currentColor" />
      </svg>
    </button>
  );
}
