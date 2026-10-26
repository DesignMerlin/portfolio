"use client";

import { useState } from "react";
import { ChevronDown } from "@/components/ui/icons";

export type Finding = { theme: string; insight: string; evidence: string[]; implication: string };

/**
 * Affinity clusters from research. Each insight opens to show what it was
 * built from and the design move it led to, so the reader can follow the
 * chain from observation to decision. Several can be open at once.
 */
export function Findings({ items }: { items: Finding[] }) {
  const [open, setOpen] = useState<Set<number>>(() => new Set([0]));

  const toggle = (i: number) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });

  return (
    <div className="my-10 space-y-3 lg:-mr-[12%]">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setOpen(open.size === items.length ? new Set() : new Set(items.map((_, i) => i)))}
          className="text-small text-ink-2 underline-offset-4 hover:text-ink hover:underline"
        >
          {open.size === items.length ? "Collapse all" : "Expand all"}
        </button>
      </div>
      {items.map((f, i) => {
        const isOpen = open.has(i);
        return (
          <div key={f.theme} className="rounded-[var(--radius-m)] border border-line bg-surface">
            <h3>
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={`finding-${i}`}
                onClick={() => toggle(i)}
                className="flex w-full items-start gap-4 p-5 text-left"
              >
                <span className="mt-1 shrink-0 rounded-full bg-accent-soft px-2.5 py-0.5 text-micro text-ink">{f.theme}</span>
                <span className="flex-1 font-medium text-ink">{f.insight}</span>
                <ChevronDown
                  className={`mt-1.5 shrink-0 text-ink-3 transition-transform duration-[280ms] ease-[var(--ease-standard)] ${isOpen ? "rotate-180" : ""}`}
                />
              </button>
            </h3>
            <div id={`finding-${i}`} className="collapse-grid" data-open={isOpen} inert={!isOpen}>
              <div>
                <div className="grid gap-5 border-t border-line px-5 pt-4 pb-5 sm:grid-cols-2">
                  <div>
                    <p className="text-micro text-ink-3">What we heard and saw</p>
                    <ul className="mt-2 space-y-1.5">
                      {f.evidence.map((e) => (
                        <li key={e} className="text-small text-ink-2">
                          {e}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-micro text-ink-3">So the design</p>
                    <p className="mt-2 text-small text-ink">{f.implication}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
