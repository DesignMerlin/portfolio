"use client";

import {
  motion,
  motionValue,
  useAnimationFrame,
  useMotionTemplate,
  useReducedMotion,
  useVelocity,
  type MotionValue,
} from "motion/react";
import { useMemo, useRef } from "react";
import type { Skill } from "@/content/about";

// One tint per card. Card tops stay dark in both themes; the tint carries identity.
const tints = ["#a78bfa", "#f5d90a", "#ff7a2f", "#ff7ac1", "#4ade9b"];

// Pendulum tuning
const PERIOD = 1.15; // seconds per full swing
const DAMPING = 0.1; // damping ratio: low = several visible swings before settling
const GAIN = 0.016; // degrees of swing per px/s change in the rope's speed (1000 px/s ≈ 16°)
const MAX_ANGLE = 18; // never swing past this (keeps neighbours from colliding)

/**
 * Services as tags hanging from one rope.
 * - The row slides along the rope (page scroll on desktop, the row's own
 *   scroll on phones).
 * - Each card is simulated as a pendulum hanging from a moving rope. When the
 *   rope speeds up, the card trails behind; when it slows or stops, the card
 *   swings through and rocks back and forth, each swing smaller, until it
 *   hangs still. Scrolling the other way swings it the other way.
 *   (θ'' = -ω²θ - 2ζωθ' + k·a, where a is the rope's acceleration.)
 * - Neighbours get slightly different lengths and damping, so the row rocks
 *   out of phase, like separate tags rather than one rigid sheet.
 * - One animation loop for all cards; angles are written to motion values,
 *   never React state. Every card is the same height.
 * - Reduced motion: cards slide but never swing.
 */
export function HangingCards({ services, motionSource }: { services: Skill[]; motionSource: MotionValue<number> }) {
  const reduce = !!useReducedMotion();
  const velocity = useVelocity(motionSource);
  const count = services.length;
  const angles = useMemo(() => Array.from({ length: count }, () => motionValue(0)), [count]);
  const sim = useRef({ speed: 0, theta: new Float64Array(count), omega: new Float64Array(count) });

  useAnimationFrame((_, delta) => {
    if (reduce) return;
    const dt = Math.min(delta, 40) / 1000;
    if (dt <= 0) return;
    const s = sim.current;
    // Smooth the rope's speed a touch (wheel scrolling arrives in steps), then differentiate it
    const before = s.speed;
    s.speed += (velocity.get() - s.speed) * (1 - Math.exp(-dt / 0.05));
    const accel = (s.speed - before) / dt;

    for (let i = 0; i < count; i++) {
      const w = ((2 * Math.PI) / PERIOD) * (1 + ((i % 3) - 1) * 0.09);
      const z = DAMPING + (i % 2) * 0.03;
      const angularAccel = -w * w * s.theta[i]! - 2 * z * w * s.omega[i]! + GAIN * w * accel;
      s.omega[i]! += angularAccel * dt;
      s.theta[i] = Math.max(-MAX_ANGLE, Math.min(MAX_ANGLE, s.theta[i]! + s.omega[i]! * dt));
      if (Math.abs(s.theta[i]! - angles[i]!.get()) > 0.005) angles[i]!.set(s.theta[i]!);
    }
  });

  return (
    <>
      {services.map((svc, i) => (
        <HangingCard key={svc.name} svc={svc} tint={tints[i % tints.length]!} angle={angles[i]!} />
      ))}
    </>
  );
}

function HangingCard({ svc, tint, angle }: { svc: Skill; tint: string; angle: MotionValue<number> }) {
  const transform = useMotionTemplate`rotate(${angle}deg)`;

  return (
    // The rope weaves: behind the card up to the hole, then out in front to the next card (which it goes behind again)
    <li className="relative z-[1] flex w-[min(300px,78vw)] shrink-0 pt-4 lg:w-[340px]">
      {/* The stretch of rope that has come out through the hole: in front of this card, across the gap.
          It belongs to the rope, not the card, so it stays level while the card swings. */}
      <span
        aria-hidden="true"
        className={`${ROPE} pointer-events-none absolute top-[52px] left-1/2 z-[2] -right-4 lg:-right-8`}
      >
        {/* Where it emerges from the hole: darker, as if coming out of the card */}
        <span className="absolute inset-y-0 left-0 w-3 rounded-l-full bg-[linear-gradient(90deg,rgb(0_0_0/0.55),transparent)]" />
      </span>
      {/* Swings from the hole. drop-shadow (not box-shadow) so the shadow follows the cut-out too */}
      <motion.div
        className="flex w-full origin-[50%_38px] [filter:drop-shadow(0_18px_28px_rgb(0_0_0/0.45))]"
        style={{ transform }}
      >
        <article
          className="flex w-full flex-col overflow-hidden rounded-[26px] border border-white/10 bg-[#0b0b0f]"
          style={{ maskImage: HOLE, WebkitMaskImage: HOLE }}
        >
          <div className="flex flex-col items-center px-6 pt-3 pb-7 text-center">
            {/* The tab, punched through so the rope threads it */}
            <span aria-hidden="true" className="relative grid size-[52px] place-items-center rounded-[12px]" style={{ background: tint }}>
              {/* Rim around the hole; its centre is cut away by the mask */}
              <span className="size-[18px] rounded-full shadow-[inset_0_0_0_2.5px_rgb(11_11_15/0.55),inset_0_2px_3px_rgb(0_0_0/0.5)]" />
            </span>
            <h3 className="mt-6 font-display text-[1.65rem] leading-[1.05] font-bold tracking-[-0.03em]" style={{ color: tint }}>
              {svc.name}
            </h3>
          </div>
          <div className="flex-1 space-y-3 p-6 text-[#121216]" style={{ background: `color-mix(in oklab, ${tint} 62%, #ffffff)` }}>
            <p className="font-medium">{svc.line}</p>
            <p className="text-small text-[#121216]/75">{svc.detail}</p>
            <ul className="flex flex-wrap gap-1.5 pt-2">
              {svc.tools.map((t) => (
                <li key={t} className="rounded-full border border-[#121216]/20 bg-white/40 px-2.5 py-1 text-[12px] leading-none">
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </article>
      </motion.div>
    </li>
  );
}

/** The hole: a circle cut out of the card at the pivot (12px tab inset + 26px half tab = 38px down) */
const HOLE = "radial-gradient(circle at 50% 38px, transparent 6px, #000 6.75px)";

/** How the cord looks, shared by the back run and every front stretch so they read as one rope */
const ROPE =
  "h-[5px] rounded-full bg-[linear-gradient(180deg,#9aa0ab_0%,#5b606b_45%,#2a2d33_100%)] shadow-[0_2px_3px_rgb(0_0_0/0.45)]";

/**
 * The back run of the rope: one cord at pin height, behind every card. It is
 * hidden by each card up to the hole and visible through it; from the hole
 * onward each card adds a front stretch, so the rope weaves back-front-back
 * along the row.
 */
export function Rope() {
  return <span aria-hidden="true" className={`${ROPE} pointer-events-none absolute inset-x-0 top-[52px] z-0`} />;
}
