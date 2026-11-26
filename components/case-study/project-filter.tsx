"use client";

import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { useState } from "react";
import { useReducedMotion } from "@/components/ui/use-reduced-motion";
import { spring, tween } from "@/lib/motion";

type Item = { id: string; kind: string; node: React.ReactNode };

/**
 * The projects grid, with chips to narrow it by kind of work.
 * - The dark pill slides to the chosen chip (snappy spring); the cards that stay
 *   glide to their new places (gentle spring), the rest fade out. Any change can
 *   be interrupted by picking another chip.
 * - Chips are toggle buttons (aria-pressed); the new count is announced.
 * Reduced motion: the pill and the cards change place instantly.
 */
export function ProjectFilter({ items, filters, className }: { items: Item[]; filters: { id: string; label: string }[]; className?: string }) {
  const [filter, setFilter] = useState("all");
  const reduce = useReducedMotion();
  const visible = items.filter((i) => filter === "all" || i.kind === filter);
  // Only chips with something behind them
  const chips = filters.filter((f) => f.id === "all" || items.some((i) => i.kind === f.id));

  return (
    <LayoutGroup>
      <div role="group" aria-label="Filter projects" className="mt-8 flex flex-wrap gap-1.5">
        {chips.map((f) => {
          const count = f.id === "all" ? items.length : items.filter((i) => i.kind === f.id).length;
          const active = filter === f.id;
          return (
            <button
              key={f.id}
              type="button"
              aria-pressed={active}
              onClick={() => setFilter(f.id)}
              className={`pressable relative rounded-full border px-4 py-2 text-small transition-colors duration-[var(--dur-quick)] ${
                active ? "border-transparent text-paper" : "border-line text-ink-2 hover:border-line-strong hover:text-ink"
              }`}
            >
              {active ? (
                <motion.span layoutId="project-filter" transition={reduce ? { duration: 0 } : spring.snappy} className="absolute inset-0 rounded-full bg-ink" />
              ) : null}
              <span className="relative">
                {f.label} <span className="tabular opacity-60">{count}</span>
              </span>
            </button>
          );
        })}
      </div>
      <p className="sr-only" aria-live="polite">
        Showing {visible.length} {visible.length === 1 ? "project" : "projects"}
      </p>
      <ul className={className}>
        <AnimatePresence initial={false} mode="popLayout">
          {visible.map((i) => (
            <motion.li
              key={i.id}
              layout={reduce ? false : "position"}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: tween("quick", "exit") }}
              transition={reduce ? { duration: 0 } : spring.gentle}
            >
              {i.node}
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </LayoutGroup>
  );
}
