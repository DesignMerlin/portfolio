"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useId, useState } from "react";
import { useRovingTabs } from "@/components/case-study/use-roving-tabs";
import { spring, tween } from "@/lib/motion";

export type Stage = {
  name: string;
  doing: string;
  thinking: string;
  /** -2 (worst) to 2 (best) */
  feeling: number;
  pain: string;
  opportunity: string;
};

const COL = 100;
const H = 120;
const PAD = 22;

const yFor = (feeling: number) => PAD + ((2 - feeling) / 4) * (H - PAD * 2);

/** Smooth curve through the points (Catmull-Rom converted to cubic Béziers) */
function curve(points: [number, number][]) {
  if (points.length < 2) return "";
  let d = `M ${points[0]![0]} ${points[0]![1]}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i]!;
    const p1 = points[i]!;
    const p2 = points[i + 1]!;
    const p3 = points[i + 2] ?? p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C ${c1[0]} ${c1[1]}, ${c2[0]} ${c2[1]}, ${p2[0]} ${p2[1]}`;
  }
  return d;
}

/**
 * Journey map with an emotion curve. Pick a stage (click, tap, or arrow
 * keys) and the marker springs along to it while the detail card slides in
 * from the side you moved towards. The curve shows the whole arc at once;
 * the card holds the detail, so neither has to do both jobs.
 */
export function JourneyMap({ persona, stages }: { persona: string; stages: Stage[] }) {
  const [{ active, direction }, setState] = useState(() => {
    // Open on the lowest point: that's the moment the design had to fix
    let low = 0;
    stages.forEach((s, i) => {
      if (s.feeling < stages[low]!.feeling) low = i;
    });
    return { active: low, direction: 1 };
  });
  const reduce = useReducedMotion();
  const id = useId();

  const select = (i: number) => setState((s) => ({ active: i, direction: i > s.active ? 1 : -1 }));
  const { tabProps } = useRovingTabs(stages.length, active, select);

  const W = stages.length * COL;
  const points = stages.map((s, i) => [i * COL + COL / 2, yFor(s.feeling)] as [number, number]);
  const s = stages[active]!;
  const [mx, my] = points[active]!;

  return (
    <div className="my-10 rounded-[var(--radius-l)] border border-line bg-surface p-4 sm:p-6 lg:-mr-[12%]">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-small text-ink-2">
          Journey of <span className="font-medium text-ink">{persona}</span>
        </p>
        <p className="text-micro text-ink-3 [@media(pointer:coarse)]:hidden">Use arrow keys to step through</p>
      </div>

      <div className="relative mt-4">
        <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full overflow-visible" aria-hidden="true">
          <line x1="0" x2={W} y1={yFor(0)} y2={yFor(0)} stroke="var(--line-strong)" strokeDasharray="3 5" />
          {stages.map((_, i) =>
            i > 0 ? <line key={i} x1={i * COL} x2={i * COL} y1="0" y2={H} stroke="var(--line)" /> : null,
          )}
          <path d={curve(points)} fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" />
          {points.map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="4" fill="var(--surface)" stroke="var(--accent)" strokeWidth="2" />
          ))}
          <motion.g
            initial={false}
            animate={{ transform: `translate(${mx}px, ${my}px)` }}
            transition={reduce ? { duration: 0 } : spring.gentle}
          >
            <circle r="13" fill="var(--accent)" opacity="0.16" />
            <circle r="6.5" fill="var(--accent)" />
          </motion.g>
        </svg>
        <span className="pointer-events-none absolute top-0 left-0 text-[10px] text-ink-3">Delighted</span>
        <span className="pointer-events-none absolute bottom-0 left-0 text-[10px] text-ink-3">Frustrated</span>
      </div>

      <div
        role="tablist"
        aria-label="Journey stages"
        className="mt-2 grid"
        style={{ gridTemplateColumns: `repeat(${stages.length}, minmax(0, 1fr))` }}
      >
        {stages.map((stage, i) => (
          <button
            key={stage.name}
            type="button"
            {...tabProps(i)}
            id={`${id}-tab-${i}`}
            aria-controls={`${id}-panel`}
            className={`rounded-[8px] px-1 py-2 text-center text-[12px] leading-tight transition-colors duration-150 sm:text-small ${
              i === active ? "bg-sunken font-medium text-ink" : "text-ink-2 hover:text-ink"
            }`}
          >
            {stage.name}
          </button>
        ))}
      </div>

      <div
        id={`${id}-panel`}
        role="tabpanel"
        aria-labelledby={`${id}-tab-${active}`}
        className="relative mt-4 overflow-hidden rounded-[var(--radius-m)] bg-paper"
      >
        <AnimatePresence mode="popLayout" initial={false} custom={direction}>
          <motion.div
            key={s.name}
            custom={direction}
            variants={{
              enter: (d: number) => (reduce ? { opacity: 0 } : { opacity: 0, transform: `translateX(${d * 16}px)` }),
              center: { opacity: 1, transform: "translateX(0px)" },
              exit: (d: number) =>
                reduce
                  ? { opacity: 0 }
                  : { opacity: 0, transform: `translateX(${d * -16}px)`, transition: tween("quick", "exit") },
            }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={tween("base")}
            className="grid gap-5 p-5 sm:grid-cols-2"
          >
            <Detail label="Doing" text={s.doing} />
            <Detail label="Thinking" text={s.thinking} />
            <Detail label="Pain point" text={s.pain} tone="danger" />
            <Detail label="Opportunity" text={s.opportunity} tone="accent" />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function Detail({ label, text, tone }: { label: string; text: string; tone?: "danger" | "accent" }) {
  return (
    <div>
      <p className={`text-micro ${tone === "danger" ? "text-danger" : tone === "accent" ? "text-accent" : "text-ink-3"}`}>{label}</p>
      <p className="mt-1 text-small text-ink">{text}</p>
    </div>
  );
}
