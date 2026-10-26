"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import { spring, stagger, tween } from "@/lib/motion";

/**
 * "Tap to see how I use AI": the card grows in place into the process,
 * steps arriving one after another. Tapping again folds it back.
 */
export function AiProcessCard({ steps }: { steps: { step: string; detail: string }[] }) {
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotion();

  return (
    <motion.div
      layout={!reduce}
      transition={spring.gentle}
      className="overflow-hidden bg-ink text-paper"
      style={{ borderRadius: 22 }}
    >
      <motion.button
        layout="position"
        transition={spring.gentle}
        type="button"
        aria-expanded={open}
        aria-controls="ai-process"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-6 p-6 text-left sm:p-8"
      >
        <span>
          <span className="block text-small opacity-60">How I use AI in my process</span>
          <span className="mt-1 block font-display text-h3 font-semibold">I use AI to go wider, then slow down to go deeper.</span>
        </span>
        <span className="shrink-0 rounded-full bg-paper/10 px-3 py-1.5 text-small">{open ? "Fold" : "Tap to see"}</span>
      </motion.button>
      <AnimatePresence initial={false}>
        {open ? (
          <motion.ol
            id="ai-process"
            key="steps"
            className="grid gap-px px-6 pb-6 sm:grid-cols-2 sm:px-8 sm:pb-8"
            initial="hidden"
            animate="shown"
            exit="hidden"
            variants={{ shown: { transition: { staggerChildren: stagger, delayChildren: 0.1 } }, hidden: {} }}
          >
            {steps.map((s, i) => (
              <motion.li
                key={s.step}
                variants={{
                  hidden: { opacity: 0, transform: reduce ? "none" : "translateY(8px)", transition: tween("instant", "exit") },
                  shown: { opacity: 1, transform: "translateY(0px)", transition: tween("base") },
                }}
                className="border-t border-paper/15 py-4 sm:pr-6"
              >
                <p className="font-mono text-micro opacity-50">Step {i + 1}</p>
                <p className="mt-1 font-medium">{s.step}</p>
                <p className="mt-1 text-small opacity-70">{s.detail}</p>
              </motion.li>
            ))}
          </motion.ol>
        ) : null}
      </AnimatePresence>
    </motion.div>
  );
}
