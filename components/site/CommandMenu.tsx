"use client";

import { lazy, Suspense, useEffect, useState, useSyncExternalStore } from "react";
import type { CommandItemData } from "./CommandPanel";

const CommandPanel = lazy(() => import("./CommandPanel"));

const isMac = () => /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
const noop = () => () => {};

// Header trigger + global ⌘K / Ctrl+K shortcut. The panel itself is only
// downloaded the first time it opens, so it costs nothing on first load.
export function CommandMenu({ work }: { work: CommandItemData[] }) {
  const [open, setOpen] = useState(false);
  const [requested, setRequested] = useState(false);
  const mac = useSyncExternalStore(noop, isMac, () => true);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setRequested(true);
        setOpen((value) => !value);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setRequested(true);
          setOpen(true);
        }}
        // Prefetch the panel on intent, so opening feels instant.
        onPointerEnter={() => setRequested(true)}
        onFocus={() => setRequested(true)}
        aria-haspopup="dialog"
        aria-keyshortcuts={mac ? "Meta+K" : "Control+K"}
        className="flex h-10 items-center gap-2 rounded-md px-2.5 text-muted transition-colors duration-(--dur-quick) hover:bg-ink-soft hover:text-fg"
      >
        <svg viewBox="0 0 20 20" className="size-[18px]" aria-hidden="true">
          <circle cx="9" cy="9" r="5.75" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <path
            d="m13.5 13.5 3.5 3.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
        <span className="sr-only">Search and jump to</span>
        <kbd className="hidden rounded-sm border border-line px-1.5 font-mono text-meta text-faint sm:inline">
          {mac ? "⌘K" : "Ctrl K"}
        </kbd>
      </button>

      {requested && (
        <Suspense fallback={null}>
          <CommandPanel open={open} onClose={() => setOpen(false)} work={work} />
        </Suspense>
      )}
    </>
  );
}
