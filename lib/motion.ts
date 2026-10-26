/**
 * Motion tokens. Every animation on the site draws from here (CSS mirrors these
 * in /styles/tokens.css). No ad-hoc durations or curves in components.
 *
 * Curves come from Emil Kowalski's skills: strong ease-out for things that
 * respond or arrive, strong ease-in-out for things moving on screen, and the
 * iOS drawer curve for big reveals. Never ease-in on UI.
 */
import type { Transition } from "motion/react";

export const duration = {
  instant: 0.1,
  quick: 0.18,
  base: 0.28,
  deliberate: 0.45,
  scene: 0.7,
} as const;

type Bezier = [number, number, number, number];

export const ease = {
  /** Moving or morphing on screen */
  standard: [0.77, 0, 0.175, 1] as Bezier,
  /** Entering, or responding to input */
  enter: [0.23, 1, 0.32, 1] as Bezier,
  /** Leaving. Same curve as enter, always with a shorter duration */
  exit: [0.23, 1, 0.32, 1] as Bezier,
  /** Sheets, curtains, the intro reveal */
  emphasized: [0.32, 0.72, 0, 1] as Bezier,
};

export const spring = {
  /** User-driven UI: indicators, toggles, drag release */
  snappy: { type: "spring", duration: 0.3, bounce: 0 },
  /** Larger surfaces: expanding panels, sheets, previews */
  gentle: { type: "spring", duration: 0.5, bounce: 0.1 },
  /** Only for playful confirmation moments */
  bouncy: { type: "spring", duration: 0.5, bounce: 0.25 },
} satisfies Record<string, Transition>;

/** Shared delay between list items (seconds) */
export const stagger = 0.05;

export const tween = (d: keyof typeof duration, e: keyof typeof ease = "enter"): Transition => ({
  duration: duration[d],
  ease: ease[e],
});

/** Scale every duration in a transition, used by "0.25× speed" demo controls */
export function slow(t: Transition, factor: number): Transition {
  if (factor === 1) return t;
  const out: Record<string, unknown> = { ...t };
  if (typeof t.duration === "number") out.duration = t.duration / factor;
  if (typeof t.delay === "number") out.delay = t.delay / factor;
  if (t.type === "spring" && typeof t.duration !== "number") {
    out.duration = 0.5 / factor;
  }
  return out as Transition;
}
