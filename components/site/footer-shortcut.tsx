"use client";

import { openCommandMenu } from "@/components/site/header";
import { useShortcutLabel } from "@/components/ui/use-shortcut-label";

export function FooterShortcut() {
  const shortcut = useShortcutLabel();
  return (
    <button
      type="button"
      onClick={() => openCommandMenu("pointer")}
      className="hidden rounded-full px-3 py-2 text-small text-ink-2 transition-colors hover:text-ink md:inline-flex md:items-center md:gap-2"
    >
      Jump anywhere
      <kbd className="rounded-md bg-sunken px-1.5 py-0.5 font-mono text-[11px]">{shortcut}</kbd>
    </button>
  );
}
