"use client";

import { useState } from "react";
import { ChevronDown } from "@/components/ui/icons";
import type { Role } from "@/content/about";

/** Each role leads with what it taught, and opens to the proof */
export function ExperienceList({ roles }: { roles: Role[] }) {
  const [open, setOpen] = useState<number | null>(1);
  return (
    <ol className="border-t border-line">
      {roles.map((r, i) => {
        const isOpen = open === i;
        return (
          <li key={r.company} className="border-b border-line">
            <button
              type="button"
              aria-expanded={isOpen}
              aria-controls={`role-${i}`}
              onClick={() => setOpen(isOpen ? null : i)}
              className="grid w-full gap-x-8 gap-y-2 py-6 text-left md:grid-cols-[180px_1fr_auto]"
            >
              <span className="font-mono text-micro text-ink-3 tabular md:pt-1.5">{r.when}</span>
              <span>
                <span className="block text-lead font-medium text-ink">{r.lesson}</span>
                <span className="mt-1 block text-small text-ink-2">
                  {r.title}, {r.company} ({r.where})
                </span>
              </span>
              <ChevronDown
                className={`hidden shrink-0 text-ink-3 transition-transform duration-[280ms] ease-[var(--ease-standard)] md:mt-2 md:block ${isOpen ? "rotate-180" : ""}`}
              />
            </button>
            <div id={`role-${i}`} className="collapse-grid" data-open={isOpen} inert={!isOpen}>
              <div>
                <ul className="space-y-2 pb-6 md:ml-[212px]">
                  {r.proof.map((p) => (
                    <li key={p} className="flex gap-3 text-ink-2">
                      <span className="mt-2.5 size-1 shrink-0 rounded-full bg-ink-3" aria-hidden="true" />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
