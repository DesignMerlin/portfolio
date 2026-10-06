// Motion tokens. Every animation on the site draws from here (JS) or from the
// CSS mirror in styles/tokens.css. No ad-hoc durations or easings in components.

/** Durations in seconds (Motion's unit). */
export const duration = {
  instant: 0.1,
  quick: 0.18,
  base: 0.28,
  deliberate: 0.45,
  scene: 0.7,
} as const;

/** Cubic-bezier easings. */
export const ease = {
  /** Settles without overshoot. Default for state changes. */
  standard: [0.2, 0, 0, 1],
  /** Arrives fast, lands softly. Things appearing. */
  enter: [0.16, 1, 0.3, 1],
  /** Leaves quickly so it never competes with what's arriving. */
  exit: [0.4, 0, 1, 1],
  /** Long, confident curve for spatial moves (the work → case study morph). */
  emphasized: [0.3, 0, 0, 1],
} as const;

/** Springs for user-driven motion. Interruptible by nature. */
export const spring = {
  /** Presses, toggles, small indicators. */
  snappy: { type: "spring", visualDuration: 0.2, bounce: 0 },
  /** Previews, panels, layout. */
  gentle: { type: "spring", visualDuration: 0.45, bounce: 0 },
  /** Playful confirmation moments only (e.g. "copied"). */
  bouncy: { type: "spring", visualDuration: 0.35, bounce: 0.3 },
} as const;

/** One shared stagger for lists, in seconds. */
export const stagger = 0.04;
