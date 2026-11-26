"use client";

import { AnimatePresence, MotionConfig, motion } from "motion/react";
import { setMotionReduced, useReducedMotion } from "@/components/ui/use-reduced-motion";
import { useEffect, useState } from "react";
import { onScrollHold } from "@/components/ui/scroll-hold";
import { tween } from "@/lib/motion";

/** Every Motion animation on the site follows the same switch as the CSS and the films */
export function MotionPrefs({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion();
  // On touch screens, CSS loops hold while the page scrolls (scroll-hold.ts marks the page)
  useEffect(() => onScrollHold(() => {}), []);
  return <MotionConfig reducedMotion={reduce ? "always" : "never"}>{children}</MotionConfig>;
}

/**
 * Stop motion: a small glass button fixed to the bottom left of every page.
 * - Pressing it stops the site's motion (films hold their poster frame, loops stop, transitions
 *   become crossfades) and pressing again plays it. The choice is remembered, and wins over the
 *   OS setting, which is where it starts.
 * - The icon says what pressing will do: pause bars while things move, a play triangle once they
 *   are still. The two swap with a quick scale and fade (a fade alone with motion off).
 * - The name slides out to the right on hover and keyboard focus. On touch it's in the label.
 * Keyboard: a normal toggle button (aria-pressed); the change is announced.
 */
export function MotionToggle() {
  const reduce = useReducedMotion();
  const label = reduce ? "Play motion" : "Stop motion";
  // Announced only after a press, not when the page loads
  const [said, setSaid] = useState("");
  const swap = { initial: { opacity: 0, scale: 0.6 }, animate: { opacity: 1, scale: 1 }, exit: { opacity: 0, scale: 0.6 } };

  return (
    <div className="motion-fab">
      <button
        type="button"
        aria-pressed={reduce}
        aria-label="Stop motion"
        onClick={() => {
          setMotionReduced(!reduce);
          setSaid(reduce ? "Motion playing" : "Motion stopped");
        }}
        onPointerMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          e.currentTarget.style.setProperty("--gx", `${(((e.clientX - r.left) / r.width) * 100).toFixed(1)}%`);
          e.currentTarget.style.setProperty("--gy", `${(((e.clientY - r.top) / r.height) * 100).toFixed(1)}%`);
        }}
        className="glass motion-fab-button"
      >
        <span className="glass-icon grid size-5 place-items-center">
          <AnimatePresence initial={false} mode="popLayout">
            <motion.svg
              key={reduce ? "play" : "pause"}
              {...swap}
              transition={tween("quick", "enter")}
              aria-hidden="true"
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="currentColor"
            >
              {reduce ? <path d="M5 3.2v9.6a.6.6 0 0 0 .92.5l7.4-4.8a.6.6 0 0 0 0-1L5.92 2.7A.6.6 0 0 0 5 3.2Z" /> : <path d="M4.5 3h2v10h-2zM9.5 3h2v10h-2z" />}
            </motion.svg>
          </AnimatePresence>
        </span>
        <span aria-hidden="true" className="motion-fab-tip">
          {label}
        </span>
      </button>
      <p className="sr-only" aria-live="polite">
        {said}
      </p>
    </div>
  );
}
