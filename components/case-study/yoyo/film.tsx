"use client";

import { on, pushIn, ScreenUI, show, Still, Touches, uiTracks, type Press, type Touch, type Typing } from "@/components/case-study/film/device";
import { DRIFT, ENTER, SHEET, STAGE_H, STAGE_W, type Frame } from "@/components/case-study/film/kit";
import { useFilm, type FilmProps, type FilmScript } from "@/components/case-study/film/use-film";
import { LiveParts, liveTracks, type LiveScene, type Part, type PtBox } from "@/components/case-study/live/kit";
import { yoyoBudgetDone, yoyoBudgetEmpty, yoyoGoalDone, yoyoHome, yoyoReady, yoyoSplash, yoyoSummary, yoyoVacation } from "@/components/case-study/live/scenes";
import { yoyo, type YoyoScreen } from "@/content/yoyo";

/* ------------------------------------------------------------------ */
/* A yo-yo. Flat colour, no 3D: one iPhone, square on, hung on a       */
/* string. Between features it's pulled up out of the frame and drops  */
/* back down on a new colour, bouncing at the end of the string. The   */
/* ring behind it is the yo-yo, and it's also the progress of whatever */
/* you're doing: goals picked, a budget divided, a form filled, money  */
/* saved.                                                              */
/* ------------------------------------------------------------------ */

const SPRING = "cubic-bezier(0.34, 1.56, 0.64, 1)";
const PUNCH = "cubic-bezier(0.32, 0.72, 0, 1)";
const THROW = "cubic-bezier(0.55, 0, 0.9, 0.4)";

/** When the yo-yo is caught (leaves the frame) and the next feature drops in */
const BUDGET = 11.1;
const SPEND = 24.6;
const SAVE = 31;
const END = 37;
/** One loop, in seconds */
const T = 37.9;

// The camera: flat. A place on the screen (points) held in the middle, and how close -----

const cam = (x: number, y: number, s: number): Keyframe => ({
  transform: `translate3d(${(-(x - 187.5) * 0.864 * s).toFixed(1)}px, ${(-(y - 406) * 0.864 * s).toFixed(1)}px, 0px) scale(${s})`,
});
const WHOLE = cam(187.5, 406, 1);

const CAMERA_MOVE: Frame[] = [
  // Inside the splash screen, which fills the frame
  [0, cam(187.5, 353, 3.95), DRIFT],
  [1.7, cam(187.5, 358, 3.8), PUNCH],
  [2.7, WHOLE, DRIFT],
  [3.7, cam(187.5, 406, 1.02), PUNCH],
  // The goals
  [4.5, cam(187.5, 300, 1.62), DRIFT],
  [6, cam(187.5, 310, 1.66), PUNCH],
  [6.7, WHOLE, DRIFT],
  [9, cam(187.5, 400, 1.05), PUNCH],
  // The bars
  [9.8, cam(187.5, 420, 1.5), DRIFT],
  [BUDGET - 0.5, cam(187.5, 410, 1.54), PUNCH],
  [BUDGET, WHOLE, PUNCH],
  [BUDGET + 2.2, WHOLE, PUNCH],
  // The budget's name
  [BUDGET + 3, cam(187.5, 200, 1.75), DRIFT],
  [BUDGET + 4.6, cam(187.5, 210, 1.78), PUNCH],
  // Income
  [BUDGET + 5.5, cam(187.5, 610, 1.62), DRIFT],
  [BUDGET + 7.5, cam(187.5, 620, 1.66), PUNCH],
  [BUDGET + 8.2, cam(187.5, 440, 1.2), DRIFT],
  [BUDGET + 9.8, cam(187.5, 406, 1.08), PUNCH],
  [BUDGET + 10.5, WHOLE, DRIFT],
  [SPEND + 1, WHOLE, PUNCH],
  // A transaction
  [SPEND + 1.7, cam(187.5, 190, 1.6), DRIFT],
  [SPEND + 2.3, cam(187.5, 230, 1.62), PUNCH],
  [SPEND + 3, cam(187.5, 400, 1.62), DRIFT],
  [SPEND + 4.2, cam(187.5, 520, 1.62), PUNCH],
  [SPEND + 4.8, cam(187.5, 640, 1.6), DRIFT],
  [SPEND + 5.2, cam(187.5, 640, 1.6), PUNCH],
  [SPEND + 5.9, WHOLE, DRIFT],
  [SAVE + 2.8, WHOLE, PUNCH],
  // The gauge
  [SAVE + 3.9, cam(187.5, 390, 1.34), DRIFT],
  [SAVE + 5.4, cam(187.5, 390, 1.38), PUNCH],
  [END, WHOLE],
  [T, WHOLE],
];

const y = (px: number, deg = 0): Keyframe => ({ transform: `translate3d(0px, ${px}px, 0px) rotate(${deg}deg)` });
/** Caught: a small dip, then up and out. Then the drop, and the bounce at the end of the string */
const bounce = (t: number): Frame[] => [
  [t - 0.25, y(0), ENTER],
  [t - 0.08, y(34), THROW],
  [t + 0.32, y(-1330, 4)],
  [t + 0.4, y(-1330, -5), "cubic-bezier(0.45, 0, 0.75, 0.75)"],
  [t + 0.82, y(58, -2), "cubic-bezier(0.2, 0.6, 0.4, 1)"],
  [t + 1.02, y(-46, 2.2), DRIFT],
  [t + 1.24, y(20, -1.4), DRIFT],
  [t + 1.44, y(-8, 0.6), DRIFT],
  [t + 1.64, y(0)],
];
const YOYO: Frame[] = [
  [0, y(0)],
  ...bounce(BUDGET),
  ...bounce(SPEND),
  ...bounce(SAVE),
  [END - 0.25, y(0), ENTER],
  [END - 0.08, y(34), THROW],
  [END + 0.34, y(-1330, 4)],
];
/** The ring spins as it falls, like a yo-yo does */
const SPIN: Frame[] = [
  [0, { transform: "rotate(0deg)" }],
  ...[BUDGET, SPEND, SAVE].flatMap((t, i): Frame[] => [
    [t - 0.1, { transform: `rotate(${i * 720}deg)` }, "cubic-bezier(0.4, 0, 0.3, 1)"],
    [t + 1.3, { transform: `rotate(${(i + 1) * 720}deg)` }],
  ]),
];

// Colour: each feature's own, opening out of the middle as the phone drops -----

const COLOURS = [
  { id: "budget", t: BUDGET, color: "#ffd166" },
  { id: "spend", t: SPEND, color: "#aeecc8" },
  { id: "save", t: SAVE, color: "#ddd6ff" },
];
const openOut = (t: number): Frame[] => [
  [0, { transform: "scale(0)" }],
  [t + 0.22, { transform: "scale(0)" }, PUNCH],
  [t + 0.9, { transform: "scale(1)" }],
];

// The ring ----------------------------------------------------------------

const R = 356;
const ring = (from: number, to: number) => {
  const p = (deg: number) => {
    const a = ((deg - 90) * Math.PI) / 180;
    return `${(450 + R * Math.cos(a)).toFixed(1)} ${(450 + R * Math.sin(a)).toFixed(1)}`;
  };
  return `M${p(from)} A${R} ${R} 0 ${to - from > 180 ? 1 : 0} 1 ${p(to)}`;
};
type Arc = { chapter: number; from: number; to: number; color: string; t: number; d?: number; until?: number };
const ARCS: Arc[] = [
  // A third for each goal picked
  { chapter: 0, from: 2, to: 118, color: "#1671d9", t: 4.85 },
  { chapter: 0, from: 122, to: 238, color: "#12b5a0", t: 5.3 },
  { chapter: 0, from: 242, to: 358, color: "#6b35b8", t: 5.75 },
  // The budget, divided
  { chapter: 1, from: 339, to: 431, color: "#563610", t: BUDGET + 10.2, d: 0.35 },
  { chapter: 1, from: 72.5, to: 198.5, color: "#f04438", t: BUDGET + 10.45, d: 0.4 },
  { chapter: 1, from: 200.5, to: 290, color: "#0ba5ec", t: BUDGET + 10.75, d: 0.35 },
  { chapter: 1, from: 292, to: 337, color: "#12a150", t: BUDGET + 11, d: 0.35 },
  // A quarter for each answer
  { chapter: 2, from: 2, to: 88, color: "#1671d9", t: SPEND + 2 },
  { chapter: 2, from: 92, to: 178, color: "#f04438", t: SPEND + 2.75 },
  { chapter: 2, from: 182, to: 268, color: "#f79009", t: SPEND + 3.2 },
  { chapter: 2, from: 272, to: 358, color: "#0d5eba", t: SPEND + 4.4 },
];
/** Saved: all the way round with the tick, then back to half */
const SAVED: Frame[] = [
  [0, { strokeDashoffset: 1, opacity: 0 }],
  [SAVE + 1.95, { strokeDashoffset: 1, opacity: 0 }],
  [SAVE + 1.96, { opacity: 1 }, SHEET],
  [SAVE + 2.8, { strokeDashoffset: 0 }],
  [SAVE + 4, { strokeDashoffset: 0 }, SHEET],
  [SAVE + 5.1, { strokeDashoffset: 0.5 }],
  [END + 0.4, { strokeDashoffset: 0.5, opacity: 1 }],
  [END + 0.42, { opacity: 0 }],
];
const chapterShow = [show(null, BUDGET + 0.36), show(BUDGET + 0.36, SPEND + 0.36), show(SPEND + 0.36, SAVE + 0.36)];

// What the screen shows ---------------------------------------------------

const until = (t: number): Frame[] => [
  [t, { opacity: 1 }],
  [t + 0.02, { opacity: 0 }],
];
/** A piece of the next state of a screen, landing as it's tapped */
const piece = (id: string, box: PtBox, src: string, t: number): Part => ({
  id,
  box,
  slice: src,
  frames: [
    [0, { opacity: 0, transform: "scale(0.94)" }],
    [t, { opacity: 0, transform: "scale(0.94)" }, SPRING],
    [t + 0.05, { opacity: 1 }],
    [t + 0.35, { transform: "scale(1)" }],
  ],
});
const scene = (parts: Part[]): LiveScene => ({ length: T, parts });

const PICKS = scene([
  piece("a", [15, 131, 166, 147], yoyo.goalsPicked.src, 4.8),
  piece("b", [194, 131, 166, 147], yoyo.goalsPicked.src, 5.25),
  piece("c", [194, 308, 166, 147], yoyo.goalsPicked.src, 5.7),
  piece("go", [15, 737, 345, 44], yoyo.goalsPicked.src, 5.8),
]);
/** The page under the sheet dims all the way down */
const shade = (from: number, to: number): Part => ({
  id: "shade",
  box: [0, 0, 375, 812],
  bg: "rgb(0 0 0 / 0.5)",
  frames: [
    [0, { opacity: 0 }],
    [from, { opacity: 0 }, ENTER],
    [from + 0.35, { opacity: 1 }],
    [to, { opacity: 1 }],
    [to + 0.3, { opacity: 0 }],
  ],
});
const FORM = scene([shade(BUDGET + 5, BUDGET + 8)]);
const NAMED = scene([shade(BUDGET + 7, BUDGET + 7.5), { id: "name", box: [31.6, 139, 170, 20], img: "/work/yoyo/ink-name.webp" }]);
/** Placeholders go as the first character is typed */
const CLEARED = scene(
  (
    [
      [607, BUDGET + 5.9],
      [697, BUDGET + 6.6],
    ] as const
  ).map(([top, t], i): Part => ({ id: `clear-${i}`, box: [30, top, 120, 20], bg: "#fff", frames: show(t) })),
);
const HOUSING = scene([
  piece("card", [15, 138, 166, 114], yoyo.categoriesPicked.src, BUDGET + 9.1),
  piece("go", [15, 737, 345, 44], yoyo.categoriesPicked.src, BUDGET + 9.2),
]);
const CHOICES = scene([
  piece("type", [15, 222, 118, 40], yoyo.txFilled.src, SPEND + 2.7),
  piece("category", [14, 320, 106, 40], yoyo.txFilled.src, SPEND + 3.15),
  piece("wallet", [12, 468, 354, 44], yoyo.txFilled.src, SPEND + 3.6),
  piece("auto", [12, 666, 160, 36], yoyo.txFilled.src, SPEND + 4.85),
  piece("go", [15, 722, 345, 59], yoyo.txFilled.src, SPEND + 4.9),
]);

/** A sheet from the bottom, over its own dimmed page */
const SHEET_TOP = (470 / 812) * 100;
const SHEET_UP = BUDGET + 5;
const SHEET_DOWN = BUDGET + 7.5;

type Layer = {
  id: string;
  screen: YoyoScreen;
  frames: Frame[];
  clip?: string;
  presses?: Press[];
  typing?: Typing[];
  /** A scene on this screen, and when it starts */
  live?: [LiveScene, number, number?];
};
const C = BUDGET;
const LAYERS: Layer[] = [
  { id: "splash", screen: "splash", frames: show(null, 3.45), live: [yoyoSplash, 0.25] },
  { id: "goals", screen: "goalsEmpty", frames: pushIn(2.85, 7.2), live: [PICKS, 0], presses: [{ t: 6.55, box: [16, 738, 343, 42], r: 6 }] },
  { id: "ready", screen: "ready", frames: pushIn(6.6, 9.4), live: [yoyoReady, 6.75], presses: [{ t: 9, box: [16, 738, 343, 42], r: 6 }] },
  { id: "home", screen: "home", frames: [...on(9.1, 0.25), ...until(C + 0.38)], live: [yoyoHome, 9.3] },

  { id: "empty", screen: "budgetEmpty", frames: show(C + 0.36, C + 2.9), live: [yoyoBudgetEmpty, C + 0.4, C + 3], presses: [{ t: C + 2.2, box: [62, 464, 250, 42], r: 6 }] },
  {
    id: "form",
    screen: "budgetForm",
    frames: pushIn(C + 2.25, C + 7.9),
    live: [FORM, 0],
    typing: [
      { focusAt: C + 2.95, from: C + 3.15, to: C + 4.35, blurAt: C + 4.7, chars: 23, text: [31.6, 139, 170, 20], field: [16, 123, 331, 56], r: 8, bg: "#fcfcfd", src: "/work/yoyo/ink-name.webp" },
    ],
  },
  {
    id: "sheet",
    screen: "incomeEmpty",
    clip: `inset(${SHEET_TOP}% 0 0 0)`,
    frames: [
      [0, { transform: `translateY(${100 - SHEET_TOP}%)` }],
      [SHEET_UP, { transform: `translateY(${100 - SHEET_TOP}%)` }, SHEET],
      [SHEET_UP + 0.55, { transform: "translateY(0%)" }],
      [SHEET_DOWN, { transform: "translateY(0%)" }, SHEET],
      [SHEET_DOWN + 0.45, { transform: `translateY(${100 - SHEET_TOP}%)` }],
      ...show(SHEET_UP, SHEET_DOWN + 0.5),
    ],
    live: [CLEARED, 0],
    typing: [
      { focusAt: C + 5.75, from: C + 5.9, to: C + 6.25, blurAt: C + 6.45, chars: 6, text: [32, 607, 44, 18], field: [16, 588, 331, 56], r: 8, bg: "#fff", src: "/work/yoyo/ink-salary.webp" },
      { focusAt: C + 6.45, from: C + 6.6, to: C + 6.95, blurAt: C + 7.3, chars: 6, text: [32, 697, 52, 22], field: [16, 680, 331, 56], r: 8, bg: "#fff", src: "/work/yoyo/ink-amount.webp" },
    ],
    presses: [{ t: C + 7.4, box: [282, 758, 88, 34], r: 8 }],
  },
  { id: "filled", screen: "budgetFilled", frames: show(C + 7.46, C + 8.9), live: [NAMED, 0], presses: [{ t: C + 8.3, box: [16, 738, 343, 42], r: 6 }] },
  { id: "categories", screen: "categories", frames: pushIn(C + 8.35, C + 10.5), live: [HOUSING, 0], presses: [{ t: C + 9.75, box: [16, 738, 343, 42], r: 6 }] },
  { id: "summary", screen: "summary", frames: pushIn(C + 9.8, C + 12.1), live: [yoyoSummary, C + 10.15], presses: [{ t: C + 11.75, box: [16, 738, 343, 42], r: 6 }] },
  { id: "done", screen: "budgetDone", frames: [...on(C + 11.85, 0.2), ...until(SPEND + 0.38)], live: [yoyoBudgetDone, C + 11.9] },

  {
    id: "tx",
    screen: "txNew",
    frames: show(SPEND + 0.36, SPEND + 5.8),
    live: [CHOICES, 0],
    typing: [
      { focusAt: SPEND + 1.6, from: SPEND + 1.8, to: SPEND + 2.25, blurAt: SPEND + 2.55, chars: 4, text: [120, 98, 136, 60], field: [104, 94, 168, 68], r: 10, bg: "#fcfcfd", src: "/work/yoyo/ink-five.webp" },
      { focusAt: SPEND + 3.85, from: SPEND + 4, to: SPEND + 4.6, blurAt: SPEND + 4.75, chars: 18, text: [42, 531, 124, 20], field: [12, 524, 351, 36], r: 6, bg: "#fcfcfd", src: "/work/yoyo/ink-narration.webp" },
    ],
    presses: [{ t: SPEND + 5.25, box: [16, 724, 343, 55], r: 6 }],
  },
  { id: "list", screen: "txList", frames: [...pushIn(SPEND + 5.3), ...until(SAVE + 0.38)] },

  { id: "plan", screen: "goalSummary", frames: show(SAVE + 0.36, SAVE + 2.4), presses: [{ t: SAVE + 1.75, box: [16, 738, 343, 42], r: 6 }] },
  { id: "tick", screen: "goalDone", frames: [...on(SAVE + 1.85, 0.15), ...until(SAVE + 4)], live: [yoyoGoalDone, SAVE + 1.95], presses: [{ t: SAVE + 3.25, box: [16, 738, 343, 42], r: 6 }] },
  { id: "vacation", screen: "vacation", frames: pushIn(SAVE + 3.3, END + 0.4), live: [yoyoVacation, SAVE + 3.8] },
];

/** Every touch, at the button's or field's real place */
const TOUCHES: Touch[] = [
  { t: 4.8, x: 98, y: 204 },
  { t: 5.25, x: 277, y: 204 },
  { t: 5.7, x: 277, y: 381 },
  { t: 6.55, x: 187, y: 759 },
  { t: 9, x: 187, y: 759 },
  { t: C + 2.2, x: 187, y: 485 }, // Create a budget
  { t: C + 2.95, x: 130, y: 151 }, // its name
  { t: C + 4.95, x: 347, y: 416 }, // add income
  { t: C + 5.75, x: 130, y: 616 },
  { t: C + 6.45, x: 130, y: 708 },
  { t: C + 7.4, x: 326, y: 775 }, // Confirm
  { t: C + 8.3, x: 187, y: 759 },
  { t: C + 9.1, x: 98, y: 195 }, // Housing
  { t: C + 9.75, x: 187, y: 759 },
  { t: C + 11.75, x: 187, y: 759 },
  { t: SPEND + 1.6, x: 187, y: 130 }, // the amount
  { t: SPEND + 2.7, x: 74, y: 242 },
  { t: SPEND + 3.15, x: 66, y: 340 },
  { t: SPEND + 3.6, x: 62, y: 490 },
  { t: SPEND + 3.85, x: 120, y: 541 },
  { t: SPEND + 4.85, x: 34, y: 684 }, // Automation
  { t: SPEND + 5.25, x: 187, y: 751 }, // Save
  { t: SAVE + 1.75, x: 187, y: 759 },
  { t: SAVE + 3.25, x: 187, y: 759 },
];

/** Paper thrown out of the phone when the budget is done: x, y from the middle, spin, width, colour */
const CONFETTI = Array.from({ length: 34 }, (_, i) => {
  const a = ((i * 137.5) % 360) * (Math.PI / 180);
  const far = 300 + ((i * 73) % 260);
  return {
    x: Math.round(Math.cos(a) * far * 1.15),
    y: Math.round(Math.sin(a) * far * 0.85 - 110),
    spin: ((i * 97) % 500) - 250,
    w: 14 + ((i * 5) % 12),
    color: ["#f04438", "#1671d9", "#12a150", "#6b35b8", "#fff", "#0ba5ec"][i % 6]!,
  };
});
const BURST = C + 12.35;

const tracks: FilmScript["tracks"] = {
  camera: CAMERA_MOVE,
  yoyo: YOYO,
  spin: SPIN,
  saved: SAVED,
  glass: [
    [0, { transform: "translateX(-90%) rotate(16deg)" }, DRIFT],
    [2.6, { transform: "translateX(-90%) rotate(16deg)" }, DRIFT],
    [4.2, { transform: "translateX(90%) rotate(16deg)" }],
  ],
  // The last colour is the splash screen's own blue, so the loop has no seam
  blue: [
    [0, { transform: "scale(0)", opacity: 1 }],
    [0.01, { transform: "scale(0)" }],
    [END + 0.1, { transform: "scale(0)" }, PUNCH],
    [T - 0.1, { transform: "scale(1)" }],
    [T, { transform: "scale(1)", opacity: 1 }],
  ],
};
COLOURS.forEach((c) => (tracks[`colour-${c.id}`] = openOut(c.t)));
chapterShow.forEach((f, i) => (tracks[`arcs-${i}`] = f));
ARCS.forEach((a, i) => {
  tracks[`arc-${i}`] = [
    [0, { strokeDashoffset: 1, opacity: 0 }],
    [a.t, { strokeDashoffset: 1, opacity: 0 }],
    [a.t + 0.01, { opacity: 1 }, SHEET],
    [a.t + (a.d ?? 0.6), { strokeDashoffset: 0, opacity: 1 }],
  ];
});
LAYERS.forEach((l) => {
  tracks[`layer-${l.id}`] = l.frames;
  Object.assign(tracks, uiTracks(l.id, l));
  if (l.live) Object.assign(tracks, liveTracks(`live-${l.id}`, l.live[0], l.live[1], l.live[2]));
});
Object.assign(tracks, uiTracks("ui", { touches: TOUCHES }));
CONFETTI.forEach((c, i) => {
  const t = BURST + (i % 5) * 0.02;
  tracks[`bit-${i}`] = [
    [0, { transform: "translate3d(0px, 60px, 0px) rotate(0deg)", opacity: 0 }],
    [t, { transform: "translate3d(0px, 60px, 0px) rotate(0deg)", opacity: 0 }],
    [t + 0.01, { opacity: 1 }, "cubic-bezier(0.1, 0.8, 0.3, 1)"],
    [t + 0.02, { transform: "translate3d(0px, 60px, 0px) rotate(0deg)" }, "cubic-bezier(0.1, 0.8, 0.3, 1)"],
    [t + 0.7, { transform: `translate3d(${c.x}px, ${c.y}px, 0px) rotate(${c.spin}deg)` }, "cubic-bezier(0.5, 0, 0.85, 0.6)"],
    [t + 1.6, { transform: `translate3d(${Math.round(c.x * 1.1)}px, ${c.y + 900}px, 0px) rotate(${c.spin * 2.4}deg)`, opacity: 1 }],
    [t + 1.62, { opacity: 0 }],
  ];
});

const script: FilmScript = {
  length: T,
  // The budget, divided, on the phone and on the ring
  poster: C + 11.6,
  tones: [
    [0, "dark"],
    [2, "light"],
    [END + 0.4, "dark"],
  ],
  tracks,
};

/**
 * Yoyo as a short film, in flat colour: an iPhone that drops on a string like
 * a yo-yo, and a ring that keeps count behind it. Every tap, keystroke and
 * animation is the app's own, up to the tick that closes the loop.
 */
export default function YoyoFilm(props: FilmProps) {
  const { root, stage } = useFilm(script, props);
  return (
    <div ref={root} aria-hidden="true" className="film yo absolute inset-0 overflow-hidden">
      <div ref={stage} className="film-stage yo-stage" style={{ visibility: "hidden" }}>
        {COLOURS.map((c) => (
          <span key={c.id} data-track={`colour-${c.id}`} className="yo-colour" style={{ background: c.color }} />
        ))}
        <div data-track="camera" className="film-phone">
          <div data-track="yoyo" className="film-phone yo-hang">
            <span className="yo-string" />
            <div data-track="spin" className="yo-ring">
              <svg viewBox="0 0 900 900" fill="none" strokeWidth="92">
                <circle cx="450" cy="450" r={R} stroke="rgb(255 255 255 / 0.62)" />
                {chapterShow.map((_, chapter) => (
                  <g key={chapter} data-track={`arcs-${chapter}`}>
                    {ARCS.map((a, i) =>
                      a.chapter === chapter ? (
                        <path key={i} data-track={`arc-${i}`} d={ring(a.from, a.to)} stroke={a.color} pathLength={1} strokeDasharray="1 1.1" />
                      ) : null,
                    )}
                  </g>
                ))}
                <path data-track="saved" d={`${ring(0, 180)} ${ring(180, 359.9).replace("M", "L")}`} stroke="#1671d9" strokeLinecap="round" pathLength={1} strokeDasharray="1 1.1" />
              </svg>
            </div>
            <div className="yo-phone">
              <span className="yo-button" style={{ left: -358, top: -430, height: 62 }} />
              <span className="yo-button" style={{ left: -358, top: -324, height: 116 }} />
              <span className="yo-button" style={{ left: -358, top: -186, height: 116 }} />
              <span className="yo-button" style={{ left: 352, top: -290, height: 176 }} />
              <span className="yo-frame" />
              <span className="fp-bezel" />
              <div className="fp-screen">
                {LAYERS.map((l) => (
                  <div key={l.id} data-track={`layer-${l.id}`} className="fp-layer" style={l.clip ? { clipPath: l.clip } : undefined}>
                    <Still src={yoyo[l.screen].src} />
                    {l.live ? <LiveParts id={`live-${l.id}`} scene={l.live[0]} /> : null}
                    <ScreenUI id={l.id} presses={l.presses} typing={l.typing} />
                  </div>
                ))}
                <span className="fp-island" />
                <Touches id="ui" touches={TOUCHES} />
                <span data-track="glass" className="film-glare" />
              </div>
            </div>
          </div>
        </div>
        {CONFETTI.map((c, i) => (
          <span
            key={i}
            data-track={`bit-${i}`}
            className="yo-bit"
            style={{ left: STAGE_W / 2, top: STAGE_H / 2, width: c.w, height: i % 3 ? c.w * 0.55 : c.w, borderRadius: i % 3 ? 2 : "50%", background: c.color }}
          />
        ))}
        <span data-track="blue" className="yo-colour" style={{ background: "#1671d9" }} />
      </div>
    </div>
  );
}
