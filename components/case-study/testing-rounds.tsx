"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useId, useState } from "react";
import { useRovingTabs } from "@/components/case-study/use-roving-tabs";
import { tween } from "@/lib/motion";

export type Round = {
  name: string;
  method: string;
  who: string;
  tasks: string[];
  issues: { issue: string; severity: "High" | "Medium" | "Low"; change: string }[];
};

const tone = {
  High: "bg-danger/12 text-danger",
  Medium: "bg-accent-soft text-ink",
  Low: "border border-line text-ink-2",
} as const;

/** Usability testing by round: what we asked people to do, what broke, and what changed because of it */
export function TestingRounds({ rounds }: { rounds: Round[] }) {
  const [active, setActive] = useState(0);
  const reduce = useReducedMotion();
  const id = useId();
  const { tabProps } = useRovingTabs(rounds.length, active, setActive);
  const r = rounds[active]!;

  return (
    <div className="my-10 rounded-[var(--radius-l)] border border-line bg-surface lg:-mr-[12%]">
      <div role="tablist" aria-label="Testing rounds" className="flex gap-1 overflow-x-auto border-b border-line p-2">
        {rounds.map((round, i) => (
          <button
            key={round.name}
            type="button"
            {...tabProps(i)}
            id={`${id}-tab-${i}`}
            aria-controls={`${id}-panel`}
            className={`shrink-0 rounded-full px-4 py-1.5 text-small transition-colors duration-150 ${
              i === active ? "bg-ink text-paper" : "text-ink-2 hover:bg-sunken hover:text-ink"
            }`}
          >
            {round.name}
          </button>
        ))}
      </div>
      <div id={`${id}-panel`} role="tabpanel" aria-labelledby={`${id}-tab-${active}`} className="relative overflow-hidden">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={r.name}
            initial={reduce ? { opacity: 0 } : { opacity: 0, filter: "blur(4px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, filter: "blur(4px)", transition: tween("quick", "exit") }}
            transition={tween("base")}
            className="p-5 sm:p-6"
          >
            <div className="grid gap-5 sm:grid-cols-[1fr_1.4fr]">
              <div>
                <p className="text-micro text-ink-3">Method</p>
                <p className="mt-1 text-small text-ink">{r.method}</p>
                <p className="mt-4 text-micro text-ink-3">Who</p>
                <p className="mt-1 text-small text-ink">{r.who}</p>
              </div>
              <div>
                <p className="text-micro text-ink-3">Tasks</p>
                <ol className="mt-1 list-decimal space-y-1 pl-4 text-small text-ink">
                  {r.tasks.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ol>
              </div>
            </div>
            <div className="mt-6 overflow-x-auto">
              <table className="w-full min-w-[520px] text-left text-small">
                <thead>
                  <tr className="text-micro text-ink-3">
                    <th className="pb-2 font-normal">What went wrong</th>
                    <th className="pb-2 font-normal">Severity</th>
                    <th className="pb-2 font-normal">What changed</th>
                  </tr>
                </thead>
                <tbody>
                  {r.issues.map((it) => (
                    <tr key={it.issue} className="border-t border-line align-top">
                      <td className="py-3 pr-4 text-ink">{it.issue}</td>
                      <td className="py-3 pr-4">
                        <span className={`rounded-full px-2 py-0.5 text-micro whitespace-nowrap ${tone[it.severity]}`}>{it.severity}</span>
                      </td>
                      <td className="py-3 text-ink-2">{it.change}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
