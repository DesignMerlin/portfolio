"use client";

import { useState } from "react";
import { ChevronDown } from "@/components/ui/icons";

export type Decision = {
  title: string;
  context: string;
  chose: string;
  rejected: { option: string; why: string }[];
};

/**
 * Key decisions with the road not taken. The rejected options sit one tap
 * away: present for the reviewer who wants the reasoning, quiet for the one
 * skimming.
 */
export function DecisionLog({ items }: { items: Decision[] }) {
  return (
    <ol className="my-10 space-y-4 lg:-mr-[12%]">
      {items.map((d, i) => (
        <DecisionCard key={d.title} d={d} n={i + 1} />
      ))}
    </ol>
  );
}

function DecisionCard({ d, n }: { d: Decision; n: number }) {
  const [open, setOpen] = useState(false);
  const panel = `decision-${n}`;
  return (
    <li className="rounded-[var(--radius-l)] border border-line bg-surface p-5 sm:p-6">
      <p className="text-micro text-ink-3">Decision {n}</p>
      <h3 className="mt-1 text-h3 font-semibold">{d.title}</h3>
      <p className="mt-2 text-small text-ink-2">{d.context}</p>
      <div className="mt-4 rounded-[var(--radius-m)] bg-accent-soft p-4">
        <p className="text-micro text-accent">What we chose</p>
        <p className="mt-1 text-ink">{d.chose}</p>
      </div>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panel}
        onClick={() => setOpen(!open)}
        className="mt-4 inline-flex items-center gap-1.5 text-small text-ink-2 hover:text-ink"
      >
        {open ? "Hide" : "Show"} what we rejected ({d.rejected.length})
        <ChevronDown className={`transition-transform duration-[280ms] ease-[var(--ease-standard)] ${open ? "rotate-180" : ""}`} />
      </button>
      <div id={panel} className="collapse-grid" data-open={open} inert={!open}>
        <div>
          <ul className="mt-3 space-y-3 border-l border-line pl-4">
            {d.rejected.map((r) => (
              <li key={r.option}>
                <p className="text-small text-ink line-through decoration-ink-3">{r.option}</p>
                <p className="text-small text-ink-2">{r.why}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </li>
  );
}
