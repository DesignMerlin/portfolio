"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useState } from "react";
import { spring, tween } from "@/lib/motion";

export type Story = { persona: string; want: string; so: string; priority: "Must" | "Should" | "Could" };

const priorities = ["Must", "Should", "Could"] as const;

/**
 * User stories, filterable by persona and priority. Filtering reflows the
 * list with layout animation so you can see which stories stay and which
 * leave, instead of the list jumping.
 */
export function UserStories({ stories }: { stories: Story[] }) {
  const personas = [...new Set(stories.map((s) => s.persona))];
  const [persona, setPersona] = useState<string | null>(null);
  const [priority, setPriority] = useState<Story["priority"] | null>(null);
  const reduce = useReducedMotion();

  const shown = stories.filter((s) => (!persona || s.persona === persona) && (!priority || s.priority === priority));

  return (
    <div className="my-10 lg:-mr-[12%]">
      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filter stories">
        <Chip active={persona === null} onClick={() => setPersona(null)}>
          Everyone
        </Chip>
        {personas.map((p) => (
          <Chip key={p} active={persona === p} onClick={() => setPersona(persona === p ? null : p)}>
            {p}
          </Chip>
        ))}
        <span className="mx-1 h-5 w-px bg-line" aria-hidden="true" />
        {priorities.map((p) => (
          <Chip key={p} active={priority === p} onClick={() => setPriority(priority === p ? null : p)}>
            {p} have
          </Chip>
        ))}
      </div>
      <p className="mt-3 text-small text-ink-3" aria-live="polite">
        Showing {shown.length} of {stories.length} stories
      </p>

      <ul className="mt-4 grid gap-3 sm:grid-cols-2">
        <AnimatePresence initial={false} mode="popLayout">
          {shown.map((s) => (
            <motion.li
              key={s.want}
              layout={!reduce}
              initial={{ opacity: 0, transform: reduce ? "none" : "scale(0.97)" }}
              animate={{ opacity: 1, transform: "scale(1)" }}
              exit={{ opacity: 0, transform: reduce ? "none" : "scale(0.97)", transition: tween("quick", "exit") }}
              transition={spring.gentle}
              className="rounded-[var(--radius-m)] border border-line bg-surface p-5"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-micro text-ink-3">{s.persona}</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-micro ${
                    s.priority === "Must" ? "bg-accent text-accent-ink" : s.priority === "Should" ? "bg-accent-soft text-ink" : "border border-line text-ink-2"
                  }`}
                >
                  {s.priority}
                </span>
              </div>
              <p className="mt-3 text-ink">
                <span className="text-ink-3">As {/^[aeiou]/i.test(s.persona) ? "an" : "a"} {s.persona.toLowerCase()}, I want </span>
                {s.want}
                <span className="text-ink-3"> so that </span>
                {s.so}.
              </p>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </div>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`pressable rounded-full border px-3 py-1 text-small transition-colors duration-150 ${
        active ? "border-ink bg-ink text-paper" : "border-line text-ink-2 hover:border-line-strong hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}
