"use client";

import { AnimatePresence, motion } from "motion/react";
import { useReducedMotion } from "@/components/ui/use-reduced-motion";
import { useEffect, useRef, useState } from "react";
import { CheckIcon, CopyIcon } from "@/components/ui/icons";
import { tween } from "@/lib/motion";

type State = "idle" | "copied" | "error";

/**
 * Copies the address and confirms in place. The icon and label morph with a
 * short blur so the swap reads as one object changing, not two swapping.
 * Falls back to a mailto link if the clipboard is blocked.
 */
export function CopyEmail({ email, className = "" }: { email: string; className?: string }) {
  const [state, setState] = useState<State>("idle");
  const reduce = useReducedMotion();
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const copy = async () => {
    clearTimeout(timer.current);
    try {
      await navigator.clipboard.writeText(email);
      setState("copied");
    } catch {
      setState("error");
      window.location.href = `mailto:${email}`;
    }
    timer.current = setTimeout(() => setState("idle"), 1800);
  };

  const label = state === "copied" ? "Copied to clipboard" : state === "error" ? "Opening your email app" : email;
  const swap = reduce
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        initial: { opacity: 0, filter: "blur(3px)", transform: "translateY(4px)" },
        animate: { opacity: 1, filter: "blur(0px)", transform: "translateY(0px)" },
        exit: { opacity: 0, filter: "blur(3px)", transform: "translateY(-4px)" },
      };

  return (
    <button
      type="button"
      onClick={copy}
      className={`pressable group inline-flex items-center gap-2.5 rounded-full border border-line-strong bg-surface py-2 pr-4 pl-3 text-small transition-[border-color,background-color] duration-150 hover:border-ink-3 ${className}`}
    >
      <span className="relative grid size-4 place-items-center text-ink-2">
        <AnimatePresence initial={false} mode="popLayout">
          <motion.span key={state === "copied" ? "check" : "copy"} {...swap} transition={tween("quick")}>
            {state === "copied" ? <CheckIcon className="text-signal" /> : <CopyIcon />}
          </motion.span>
        </AnimatePresence>
      </span>
      <span className="relative overflow-hidden">
        <AnimatePresence initial={false} mode="popLayout">
          <motion.span key={state} className="block whitespace-nowrap" {...swap} transition={tween("quick")}>
            {label}
          </motion.span>
        </AnimatePresence>
      </span>
      <span className="sr-only" aria-live="polite">
        {state === "copied" ? "Email address copied" : ""}
      </span>
    </button>
  );
}
