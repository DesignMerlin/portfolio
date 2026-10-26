"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useId, useState } from "react";
import { useRovingTabs } from "@/components/case-study/use-roving-tabs";
import { spring, tween } from "@/lib/motion";
import type { Skill } from "@/content/about";

/** What I do: pick an area, the marker travels, the detail crossfades */
export function SkillsSwitcher({ skills }: { skills: Skill[] }) {
  const [active, setActive] = useState(0);
  const reduce = useReducedMotion();
  const id = useId();
  const { tabProps } = useRovingTabs(skills.length, active, setActive, true);
  const s = skills[active]!;

  return (
    <div className="grid gap-6 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] md:gap-10">
      <div role="tablist" aria-orientation="vertical" aria-label="Skills" className="flex flex-col">
        {skills.map((skill, i) => (
          <button
            key={skill.name}
            type="button"
            {...tabProps(i)}
            id={`${id}-tab-${i}`}
            aria-controls={`${id}-panel`}
            className={`relative border-t border-line py-4 pl-5 text-left text-lead transition-colors duration-150 last:border-b ${
              i === active ? "text-ink" : "text-ink-3 hover:text-ink-2"
            }`}
          >
            {i === active ? (
              <motion.span
                layoutId={`${id}-marker`}
                transition={reduce ? { duration: 0 } : spring.snappy}
                className="absolute top-1/2 left-0 h-6 w-[3px] -translate-y-1/2 rounded-full bg-accent"
              />
            ) : null}
            {skill.name}
          </button>
        ))}
      </div>
      <div id={`${id}-panel`} role="tabpanel" aria-labelledby={`${id}-tab-${active}`} className="relative">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={s.name}
            initial={reduce ? { opacity: 0 } : { opacity: 0, filter: "blur(4px)", transform: "translateY(6px)" }}
            animate={{ opacity: 1, filter: "blur(0px)", transform: "translateY(0px)" }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, filter: "blur(4px)", transition: tween("quick", "exit") }}
            transition={tween("base")}
            className="rounded-[var(--radius-l)] bg-surface p-6 sm:p-8"
          >
            <p className="font-display text-h3 font-semibold">{s.line}</p>
            <p className="mt-3 text-ink-2">{s.detail}</p>
            <ul className="mt-6 flex flex-wrap gap-2">
              {s.tools.map((t) => (
                <li key={t} className="rounded-full border border-line px-3 py-1 text-small text-ink-2">
                  {t}
                </li>
              ))}
            </ul>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
