"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useId, useState } from "react";
import { useRovingTabs } from "@/components/case-study/use-roving-tabs";
import { spring, tween } from "@/lib/motion";

export type Persona = {
  name: string;
  archetype: string;
  context: string;
  goals: string[];
  frustrations: string[];
  needs: string[];
};

/**
 * Persona switcher. The selection pill travels between tabs (spring, so a
 * quick second click retargets mid-flight); the profile crossfades with a
 * light blur so it reads as one card changing, not two swapping.
 */
export function Personas({ personas, tint = "var(--accent)" }: { personas: Persona[]; tint?: string }) {
  const [active, setActive] = useState(0);
  const reduce = useReducedMotion();
  const id = useId();
  const { tabProps } = useRovingTabs(personas.length, active, setActive);
  const p = personas[active]!;

  return (
    <div className="not-prose my-10 lg:-mr-[12%]">
      <div role="tablist" aria-label="Personas" className="flex flex-wrap gap-1.5">
        {personas.map((persona, i) => (
          <button
            key={persona.name}
            type="button"
            {...tabProps(i)}
            id={`${id}-tab-${i}`}
            aria-controls={`${id}-panel`}
            className={`relative flex items-center gap-2.5 rounded-full py-1.5 pr-4 pl-1.5 text-small transition-colors duration-150 ${
              i === active ? "text-ink" : "text-ink-2 hover:text-ink"
            }`}
          >
            {i === active ? (
              <motion.span
                layoutId={`${id}-pill`}
                transition={reduce ? { duration: 0 } : spring.snappy}
                className="absolute inset-0 rounded-full border border-line bg-surface shadow-[var(--shadow-raised)]"
              />
            ) : null}
            <Monogram name={persona.name} tint={tint} />
            <span className="relative">{persona.name}</span>
          </button>
        ))}
      </div>

      <div
        id={`${id}-panel`}
        role="tabpanel"
        aria-labelledby={`${id}-tab-${active}`}
        className="relative mt-4 overflow-hidden rounded-[var(--radius-l)] border border-line bg-surface"
      >
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={p.name}
            initial={reduce ? { opacity: 0 } : { opacity: 0, filter: "blur(4px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, filter: "blur(4px)", transition: tween("quick", "exit") }}
            transition={tween("base")}
            className="grid gap-8 p-6 sm:p-8 md:grid-cols-[1fr_1.6fr]"
          >
            <div>
              <p className="text-micro text-ink-3">Persona</p>
              <p className="mt-1 font-display text-h3 font-semibold">{p.name}</p>
              <p className="text-ink-2">{p.archetype}</p>
              <p className="mt-5 text-small leading-relaxed text-ink-2">{p.context}</p>
            </div>
            <div className="grid gap-6 sm:grid-cols-3 md:grid-cols-1 lg:grid-cols-3">
              <List title="Goals" items={p.goals} />
              <List title="Frustrations" items={p.frustrations} />
              <List title="Needs from us" items={p.needs} />
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function List({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <p className="text-small font-semibold text-ink">{title}</p>
      <ul className="mt-2 space-y-2">
        {items.map((it) => (
          <li key={it} className="text-small leading-snug text-ink-2">
            {it}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Monogram({ name, tint }: { name: string; tint: string }) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2);
  return (
    <span
      aria-hidden="true"
      className="relative grid size-7 place-items-center rounded-full text-[11px] font-semibold text-white"
      style={{ background: tint }}
    >
      {initials}
    </span>
  );
}
