"use client";

import Image from "next/image";
import { AnimatePresence, motion, useMotionTemplate, useSpring } from "motion/react";
import { useState } from "react";
import { useRovingTabs } from "@/components/case-study/use-roving-tabs";
import { useReducedMotion } from "@/components/ui/use-reduced-motion";
import { room8, type Room8Screen } from "@/content/room8";
import { spring, tween } from "@/lib/motion";

/** Ordered from furthest away to closest in, so changing mode always zooms the right way */
const MODES: { id: Room8Screen; label: string; note: string }[] = [
  { id: "vrDollhouse", label: "Dollhouse", note: "The whole home at once, so the layout makes sense before you step in." },
  { id: "vrWalk", label: "Walk", note: "Move through the rooms yourself, with a floor plan showing where you are." },
  { id: "vrCinematic", label: "Cinematic", note: "Sit back for a guided walk with captions. Tap anywhere to take over." },
];
const TILT = 9;

/**
 * The 3D tour's three modes on one phone. Changing mode zooms: towards the
 * room when going in, away from it when pulling back, so you can tell where
 * you are. The phone leans towards the pointer (or a dragging finger) on a
 * spring. Tabs with arrow keys. Reduced motion: a crossfade, and no lean.
 */
export function TourModes() {
  const reduce = useReducedMotion();
  const [state, setState] = useState({ active: 1, dir: 1 });
  const { active, dir } = state;
  const { tabProps } = useRovingTabs(MODES.length, active, (i) => setState((s) => ({ active: i, dir: i >= s.active ? 1 : -1 })));
  const rx = useSpring(0, { stiffness: 170, damping: 20 });
  const ry = useSpring(0, { stiffness: 170, damping: 20 });
  const transform = useMotionTemplate`rotateX(${rx}deg) rotateY(${ry}deg)`;
  const mode = MODES[active]!;

  const lean = (e: React.PointerEvent<HTMLElement>) => {
    if (reduce) return;
    const r = e.currentTarget.getBoundingClientRect();
    ry.set(((e.clientX - r.left) / r.width - 0.5) * 2 * TILT);
    rx.set(-((e.clientY - r.top) / r.height - 0.5) * 2 * TILT);
  };
  const rest = () => {
    rx.set(0);
    ry.set(0);
  };

  return (
    <div
      className="screen-panel grid items-center gap-8 overflow-hidden rounded-[var(--radius-l)] px-6 py-10 md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] md:px-12 lg:py-14"
      data-tone="deep"
      onPointerMove={lean}
      onPointerLeave={rest}
      onPointerUp={(e) => e.pointerType !== "mouse" && rest()}
      onPointerCancel={rest}
    >
      <div className="mx-auto w-full max-w-[270px] [perspective:1100px]">
        <motion.div
          style={{ transform: reduce ? undefined : transform }}
          id="tour-mode"
          role="tabpanel"
          aria-label={`${mode.label} mode`}
          className="tour-phone relative aspect-[375/812]"
        >
          <AnimatePresence initial={false} custom={dir}>
            <motion.div
              key={mode.id}
              className="absolute inset-0"
              custom={dir}
              variants={{
                enter: (d: number) => ({ opacity: 0, transform: reduce ? "scale(1)" : `scale(${d > 0 ? 0.86 : 1.16})` }),
                show: { opacity: 1, transform: "scale(1)" },
                leave: (d: number) => ({ opacity: 0, transform: reduce ? "scale(1)" : `scale(${d > 0 ? 1.16 : 0.86})` }),
              }}
              initial="enter"
              animate="show"
              exit="leave"
              transition={reduce ? tween("base") : spring.gentle}
            >
              <Image src={room8[mode.id].src} alt={room8[mode.id].alt} fill sizes="270px" draggable={false} className="object-cover" />
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
      <div className="text-white">
        <div role="tablist" aria-label="Tour modes" className="flex flex-wrap gap-1.5">
          {MODES.map((m, i) => (
            <button
              key={m.id}
              type="button"
              {...tabProps(i)}
              aria-controls="tour-mode"
              className="relative rounded-full px-4 py-2.5 text-small text-white/80 transition-colors duration-150 outline-offset-2 hover:text-white aria-selected:text-[#0b1f13]"
            >
              {i === active ? (
                <motion.span layoutId="tour-mode-pill" transition={reduce ? { duration: 0 } : spring.snappy} className="absolute inset-0 rounded-full bg-white" />
              ) : null}
              <span className="relative">{m.label}</span>
            </button>
          ))}
        </div>
        <p aria-live="polite" className="mt-5 min-h-[4.5em] max-w-[34ch] text-lead text-white/90">
          {mode.note}
        </p>
      </div>
    </div>
  );
}
