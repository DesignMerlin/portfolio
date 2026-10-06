"use client";

import { useEffect, useRef, useState } from "react";
import { buttonClasses, type ButtonStyleProps } from "@/components/ui/Button";
import { site } from "@/lib/site";

type State = "idle" | "copied" | "error";

const labels: Record<State, string> = {
  idle: site.email,
  copied: "Copied to clipboard",
  error: "Opening your mail app",
};

// Copies the address and says so. All labels share one grid cell: the new one
// rises in while the old one fades (CSS, motion tokens). Width is locked to the
// longest label, so nothing around the button shifts.
export function CopyEmail(props: ButtonStyleProps) {
  const [state, setState] = useState<State>("idle");
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  async function copy() {
    try {
      await navigator.clipboard.writeText(site.email);
      setState("copied");
    } catch {
      // Clipboard can be blocked (permissions, older browsers): fall back to mail.
      setState("error");
      window.location.href = `mailto:${site.email}`;
    }
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setState("idle"), 2200);
  }

  return (
    <>
      <button
        type="button"
        onClick={copy}
        className={buttonClasses(props)}
        aria-label={`Copy email address ${site.email}`}
      >
        <span className="grid overflow-hidden px-(--label-pad)">
          {(Object.keys(labels) as State[]).map((key) => (
            <span
              key={key}
              aria-hidden="true"
              className={`text-center transition-[opacity,transform] [grid-area:1/1] motion-reduce:transform-none ${
                key === state
                  ? "translate-y-0 opacity-100 duration-(--dur-base) ease-enter"
                  : "translate-y-2 opacity-0 duration-(--dur-quick) ease-exit"
              }`}
            >
              {labels[key]}
            </span>
          ))}
        </span>
      </button>
      <span className="sr-only" aria-live="polite">
        {state === "copied"
          ? "Email address copied"
          : state === "error"
            ? "Opening your mail app"
            : ""}
      </span>
    </>
  );
}
