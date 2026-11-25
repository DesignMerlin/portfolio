"use client";

import { at, Device, on, PT, pushIn, ScreenUI, shot, show, Still, Touches, uiTracks, type Press, type Touch, type Typing } from "@/components/case-study/film/device";
import { CAMERA, DRIFT, ENTER, SHEET, type Frame } from "@/components/case-study/film/kit";
import { useFilm, type FilmProps, type FilmScript } from "@/components/case-study/film/use-film";
import { LiveParts, liveTracks, type LiveScene, type Part, type PtBox } from "@/components/case-study/live/kit";
import { caseTrackerConfirmed, caseTrackerSplash } from "@/components/case-study/live/scenes";
import { caseTracker, type CaseTrackerScreen } from "@/content/case-tracker";

/** Onboarding plays from HELLO. Everything after it is written as if it weren't there, and moved along by ONBOARD */
const HELLO = 3.25;
const ONBOARD = 4.85;
/** One loop, in seconds, without the onboarding */
const T = 33.6;
/** When the case comes back and the room turns from crimson to daylight */
const ANSWER = 12.1;

/* ------------------------------------------------------------------ */
/* The three promises swipe past, two questions are answered, then one  */
/* number in, a clear picture out. The app's AI orb is a sun       */
/* behind the phone. A receipt number is typed, the sun is drawn into  */
/* the screen to work on it, and bursts back out as the case. Then     */
/* the same ease for the rest: cases, consultants, a booking.          */
/* The camera stays square on and punches in to each touch.            */
/* ------------------------------------------------------------------ */

const PUNCH = "cubic-bezier(0.32, 0.72, 0, 1)";

const CAMERA_MOVE: Frame[] = [
  [0, shot(0, 1250, -200, 26, -14, 6), PUNCH],
  [1.7, shot(0, 0, 20, 4, -9, 1), DRIFT],
  [3.5, shot(0, 0, 50, 2, 5, 0), PUNCH],
  // The receipt number
  [4.8, shot(0, 20, 400, 9, 8, -1, 0, 46), DRIFT],
  [7.5, shot(0, 10, 440, 6, -4, 0, 0, 50), PUNCH],
  [8.4, shot(0, 0, 250, 3, -6, 0, 0, -90), DRIFT],
  [8.8, shot(0, 0, 255, 3, -5, 0, 0, -90), PUNCH],
  // The orb working
  [9.8, shot(0, 10, 440, 4, 5, 0, 0, 10), DRIFT],
  [ANSWER, shot(0, 10, 500, 3, -3, 0, 0, 40), PUNCH],
  [ANSWER + 1.1, shot(0, 0, 110, 2, 4, 0), DRIFT],
  [14.2, shot(0, 0, 100, 3, 7, 0), PUNCH],
  // The case
  [15.2, shot(0, 30, 520, 12, 10, -2, 0, 132), DRIFT],
  [16.6, shot(0, 20, 540, 9, -2, 1, 0, 118), PUNCH],
  [17.4, shot(0, 0, 150, 3, -6, 0), DRIFT],
  [19.5, shot(0, 0, 160, 2, 4, 0), PUNCH],
  // My cases
  [20.6, shot(0, 30, 460, 12, 9, -2, 0, 130), DRIFT],
  [22.2, shot(0, 20, 480, 8, -4, 1, 0, 110), PUNCH],
  [23, shot(0, 0, 130, 2, -5, 0), DRIFT],
  [24.2, shot(0, 0, 140, 3, 5, 0), PUNCH],
  // Booking
  [25.1, shot(0, 10, 330, 9, 8, -1, 0, -120), DRIFT],
  [26.1, shot(0, 10, 340, 8, 4, -1, 0, -120), PUNCH],
  // Paying
  [27, shot(0, 30, 480, 13, 9, -2, 0, -70), DRIFT],
  [28.9, shot(0, 20, 490, 9, -5, 1, 0, -130), DRIFT],
  [29.5, shot(0, 10, 440, 7, -6, 1, 0, -130), PUNCH],
  [30.4, shot(0, 0, 70, 3, 7, 0), DRIFT],
  [31.9, shot(0, 0, 50, 3, -4, 0), CAMERA],
  [33.1, shot(0, 1250, -200, -18, 14, -5)],
];

/** Daylight over the crimson */
const DAY: Frame[] = [
  [0, { opacity: 0 }],
  [ANSWER + 0.55, { opacity: 0 }, ENTER],
  [ANSWER + 1.4, { opacity: 1 }],
  [31.9, { opacity: 1 }, DRIFT],
  [33, { opacity: 0 }],
];

/** The sun: rises with the phone, is drawn into it, bursts back, sets */
const SUN: Frame[] = [
  [0, { opacity: 0, transform: "translate3d(0px, 420px, 0px) scale(0.5)" }, PUNCH],
  [1.9, { opacity: 1, transform: "translate3d(210px, -150px, 0px) scale(1)" }, DRIFT],
  [4.7, { transform: "translate3d(250px, -120px, 0px) scale(1.16)" }, DRIFT],
  [8.4, { opacity: 1, transform: "translate3d(120px, -150px, 0px) scale(1.05)" }, CAMERA],
  [9.4, { opacity: 1, transform: "translate3d(0px, -120px, 0px) scale(0.1)" }],
  [9.45, { opacity: 0 }],
  [ANSWER + 0.7, { opacity: 0, transform: "translate3d(0px, -60px, 0px) scale(0.35)" }, ENTER],
  [ANSWER + 0.75, { opacity: 1 }],
  [ANSWER + 2, { opacity: 1, transform: "translate3d(-150px, -60px, 0px) scale(1.12)" }, DRIFT],
  [17.4, { transform: "translate3d(170px, 60px, 0px) scale(1.02)" }, DRIFT],
  [23, { transform: "translate3d(-190px, 40px, 0px) scale(1.1)" }, DRIFT],
  [30.4, { opacity: 1, transform: "translate3d(0px, -20px, 0px) scale(1.2)" }, DRIFT],
  [31.9, { opacity: 1, transform: "translate3d(0px, -10px, 0px) scale(1.16)" }, CAMERA],
  [33.1, { opacity: 0, transform: "translate3d(0px, 420px, 0px) scale(0.5)" }],
];

const FLOOR: Frame[] = [
  [0, { opacity: 0, transform: "scale(0.4)" }, PUNCH],
  [1.8, { opacity: 0.5, transform: "scale(1)" }, PUNCH],
  [4.4, { opacity: 0, transform: "scale(1.5)" }],
  [ANSWER + 0.8, { opacity: 0, transform: "scale(1)" }, DRIFT],
  [13.8, { opacity: 0.5, transform: "scale(1)" }, PUNCH],
  [15, { opacity: 0, transform: "scale(1.5)" }],
  [30, { opacity: 0, transform: "scale(1)" }, DRIFT],
  [30.8, { opacity: 0.5, transform: "scale(1)" }],
  [31.9, { opacity: 0.5, transform: "scale(1)" }, CAMERA],
  [32.8, { opacity: 0, transform: "scale(0.4)" }],
];

const RIM: Frame[] = [
  [0, { opacity: 0 }, DRIFT],
  [3, { opacity: 1 }, DRIFT],
  [7, { opacity: 0.2 }, DRIFT],
  [13, { opacity: 1 }, DRIFT],
  [18, { opacity: 0.2 }, DRIFT],
  [24, { opacity: 1 }, DRIFT],
  [29, { opacity: 0.2 }, DRIFT],
  [T, { opacity: 0 }],
];

// What the screen shows -------------------------------------------------

const until = (t: number): Frame[] => [
  [t, { opacity: 1 }],
  [t + 0.02, { opacity: 0 }],
];
const KEYS_DOWN = 100 * (307 / 812);

/** The three promises, swiped through like the app's own carousel */
const SWIPE_1 = 3.35;
const SWIPE_2 = 4.3;
const swipe = (arrive: number | null, go: number | null): Frame[] => [
  [0, { transform: arrive === null ? "translateX(0%)" : "translateX(100%)" }],
  ...(arrive === null ? [] : ([[arrive, { transform: "translateX(100%)" }, SHEET], [arrive + 0.55, { transform: "translateX(0%)" }]] as Frame[])),
  ...(go === null ? [] : ([[go, { transform: "translateX(0%)" }, SHEET], [go + 0.55, { transform: "translateX(-100%)" }]] as Frame[])),
];
/** A choice before it's picked, lying over the picked one until it's tapped */
const unpicked = (id: string, box: PtBox, img: string, t: number): Part => ({
  id,
  box,
  img,
  frames: [
    [0, { opacity: 1 }],
    [t, { opacity: 1 }, ENTER],
    [t + 0.18, { opacity: 0 }],
  ],
});
const STATUS: LiveScene = { length: T, parts: [unpicked("newcomer", [14, 228, 347, 60], "/work/case-tracker/status-off.webp", 6.1)] };
const INTERESTS: LiveScene = {
  length: T,
  parts: [
    unpicked("sports", [104.5, 273.5, 79, 66], "/work/case-tracker/interest-sports-off.webp", 7.35),
    unpicked("social", [193.5, 352.5, 79, 66.5], "/work/case-tracker/interest-social-off.webp", 7.8),
    { id: "count", box: [274, 238, 90, 26], bg: "#fff", frames: [[0, { opacity: 1 }], [7.8, { opacity: 1 }, ENTER], [8, { opacity: 0 }]] },
  ],
};

type Layer = {
  id: string;
  screen?: CaseTrackerScreen;
  frames: Frame[];
  presses?: Press[];
  typing?: Typing[];
  live?: [LiveScene, number];
  /** Part of the onboarding: its times are already right */
  hello?: boolean;
};
const LAYERS: Layer[] = [
  { id: "splash", screen: "splash", frames: show(null, 3.1), live: [caseTrackerSplash, 0.25], hello: true },
  { id: "welcome-1", screen: "welcome1", frames: [...on(2.6, 0.4), ...swipe(null, SWIPE_1), ...until(SWIPE_1 + 0.6)], hello: true },
  { id: "welcome-2", screen: "welcome2", frames: [...swipe(SWIPE_1, SWIPE_2), ...show(SWIPE_1, SWIPE_2 + 0.6)], hello: true },
  { id: "welcome-3", screen: "welcome3", frames: [...swipe(SWIPE_2, null), ...show(SWIPE_2, 6)], presses: [{ t: 5.25, box: [16, 679, 343, 48], r: 8 }], hello: true },
  { id: "status", screen: "status", frames: pushIn(5.35, 7.35), live: [STATUS, 0], presses: [{ t: 6.6, box: [16, 712, 343, 48], r: 8 }], hello: true },
  { id: "interests", screen: "interests", frames: pushIn(6.7, 9.1), live: [INTERESTS, 0], presses: [{ t: 8.25, box: [16, 712, 343, 48], r: 8 }], hello: true },
  {
    id: "add",
    screen: "addCase",
    frames: pushIn(3.55, 9.2),
    typing: [
      {
        focusAt: 4.9,
        from: 5.7,
        to: 7,
        blurAt: 7.6,
        chars: 13,
        text: [31, 267, 139, 24],
        field: [16, 255, 343, 47],
        r: 8,
        bg: "#fafafa",
        src: "/work/case-tracker/receipt.webp",
      },
    ],
    presses: [{ t: 8.65, box: [16, 712, 343, 48], r: 8 }],
  },
  // The keyboard comes up for the number and goes away after it
  {
    id: "keys",
    frames: [
      [0, { transform: `translateY(${KEYS_DOWN}%)` }],
      [5, { transform: `translateY(${KEYS_DOWN}%)` }, SHEET],
      [5.5, { transform: "translateY(0%)" }],
      [7.6, { transform: "translateY(0%)" }, SHEET],
      [8.05, { transform: `translateY(${KEYS_DOWN}%)` }],
      ...show(4.98, 8.1),
    ],
    presses: [
      { t: 5.74, box: [262, 547, 32, 42], r: 5 }, // i
      { t: 5.86, box: [298, 547, 32, 42], r: 5 }, // o
      { t: 5.98, box: [81, 547, 32, 42], r: 5 }, // e
    ],
  },
  { id: "fetching", screen: "fetching", frames: [...on(8.8, 0.4), ...until(ANSWER + 0.9)] },
  { id: "home", frames: show(ANSWER + 0.6, 20.1) },
  { id: "cases", screen: "cases", frames: [...on(19.7, 0.3), ...until(23.5)] },
  { id: "consultants", screen: "consultants", frames: [...on(23.1, 0.3), ...until(24.95)] },
  {
    id: "book",
    screen: "book",
    frames: pushIn(24.3, 26.85),
    presses: [
      { t: 25.3, box: [133.5, 537, 106, 44], r: 22 },
      { t: 26, box: [16, 713, 343, 48], r: 8 },
    ],
  },
  {
    id: "pay",
    screen: "pay",
    frames: pushIn(26.15, 30),
    typing: [
      { focusAt: 26.95, from: 27.1, to: 27.8, blurAt: 27.9, chars: 19, text: [47, 461, 152, 22], field: [34, 450, 307, 44], r: 12, bg: "#fafafa" },
      { focusAt: 27.9, from: 28, to: 28.2, blurAt: 28.25, chars: 5, text: [47, 540, 50, 22], field: [34, 529, 144, 44], r: 12, bg: "#fafafa" },
      { focusAt: 28.25, from: 28.35, to: 28.5, blurAt: 28.55, chars: 3, text: [202, 540, 27, 22], field: [189, 529, 152, 44], r: 12, bg: "#fafafa" },
      { focusAt: 28.55, from: 28.65, to: 29, blurAt: 29.2, chars: 17, text: [47, 629, 119, 22], field: [34, 618, 307, 44], r: 12, bg: "#fafafa" },
    ],
    presses: [{ t: 29.55, box: [34, 674, 307, 48], r: 24 }],
  },
  { id: "confirmed", screen: "confirmed", frames: on(29.65, 0.35), live: [caseTrackerConfirmed, 29.75] },
];

const TOUCHES: Touch[] = [
  { t: 4.9, x: 150, y: 279 }, // receipt number
  { t: 5.74, x: 278, y: 568 },
  { t: 5.86, x: 314, y: 568 },
  { t: 5.98, x: 97, y: 568 },
  { t: 8.65, x: 187, y: 736 }, // Finish
  { t: 19.6, x: 114, y: 742 }, // My cases
  { t: 23, x: 187, y: 742 }, // Consultants
  { t: 24.2, x: 314, y: 273 }, // Maria Alvarez
  { t: 25.3, x: 187, y: 559 }, // 10:30
  { t: 26, x: 187, y: 737 }, // Confirm and pay
  { t: 26.95, x: 140, y: 472 },
  { t: 27.9, x: 90, y: 551 },
  { t: 28.25, x: 250, y: 551 },
  { t: 28.55, x: 150, y: 640 },
  { t: 29.55, x: 187, y: 698 }, // Pay
];

const HELLO_TOUCHES: Touch[] = [
  { t: 5.25, x: 187, y: 703 }, // Get started
  { t: 6.1, x: 187, y: 258 }, // Newcomer
  { t: 6.6, x: 187, y: 736 }, // Continue
  { t: 7.35, x: 144, y: 306 }, // Sports
  { t: 7.8, x: 233, y: 385 }, // Socializing
  { t: 8.25, x: 187, y: 736 }, // Continue
];
/** A finger dragging a page along */
const dragLeft = (t: number): Frame[] => [
  [0, { opacity: 0, transform: "translateX(0px) scale(1.4)" }],
  [t - 0.25, { opacity: 0, transform: "translateX(0px) scale(1.4)" }, ENTER],
  [t, { opacity: 1, transform: "translateX(0px) scale(0.9)" }, SHEET],
  [t + 0.45, { opacity: 1, transform: `translateX(-${230 * PT}px) scale(0.9)` }, ENTER],
  [t + 0.65, { opacity: 0, transform: `translateX(-${240 * PT}px) scale(1.4)` }],
];
/** Square on for the promises, leaning with each swipe, then in on each answer */
const HELLO_CAMERA: Frame[] = [
  [3.3, shot(0, 0, 60, 3, 6, 0), PUNCH],
  [SWIPE_1 + 0.65, shot(0, 0, 80, 3, -9, 1), DRIFT],
  [SWIPE_2, shot(0, 0, 90, 3, -6, 0), PUNCH],
  [SWIPE_2 + 0.65, shot(0, 0, 90, 3, 8, -1), DRIFT],
  [5.35, shot(0, 0, 110, 3, 4, 0), PUNCH],
  [6.05, shot(0, 10, 340, 8, 7, -1, 0, 90), DRIFT],
  [6.4, shot(0, 10, 350, 7, 4, -1, 0, 84), PUNCH],
  [6.75, shot(0, 0, 200, 4, -3, 0, 0, 0), PUNCH],
  [7.35, shot(0, 10, 360, 8, -7, 1, 0, 60), DRIFT],
  [8, shot(0, 10, 370, 7, -3, 1, 0, 50), PUNCH],
];

/** Fetching: each step appears as it's done, and the bar fills */
const STEPS = [
  { y: 397, t: 9.4 },
  { y: 427, t: 10.1 },
  { y: 457, t: 10.8 },
];
const uncover = (t: number, d = 1): Frame[] => [
  [0, { transform: "scaleX(1)" }],
  [t, { transform: "scaleX(1)" }, SHEET],
  [t + d, { transform: "scaleX(0)" }],
];
const vanish = (t: number): Frame[] => [
  [0, { opacity: 1 }],
  [t, { opacity: 1 }, ENTER],
  [t + 0.35, { opacity: 0 }],
];

/** The orb on the screen: breathes while it works, then opens out into the case */
const ORB: Frame[] = [
  [0, { transform: "scale(0.6)", opacity: 0 }],
  [9.2, { transform: "scale(0.6)", opacity: 0 }, ENTER],
  [9.35, { opacity: 1 }],
  [9.8, { transform: "scale(1.08)" }, DRIFT],
  [10.5, { transform: "scale(0.96)" }, DRIFT],
  [11.2, { transform: "scale(1.1)" }, DRIFT],
  [11.9, { transform: "scale(0.9)" }],
  [ANSWER, { transform: "scale(0.9)" }, CAMERA],
  [ANSWER + 0.85, { transform: "scale(22)", opacity: 1 }, ENTER],
  [ANSWER + 1.35, { transform: "scale(24)", opacity: 0 }],
];
/** Rings going out from it */
const ring = (t: number): Frame[] => [
  [0, { transform: "scale(0.9)", opacity: 0 }],
  [t, { transform: "scale(0.9)", opacity: 0 }],
  [t + 0.05, { opacity: 0.6 }, ENTER],
  [t + 1.2, { transform: "scale(2.5)", opacity: 0 }],
];

const SCROLL = 100 * (500 / 1332);
const tracks: FilmScript["tracks"] = {
  camera: CAMERA_MOVE,
  day: DAY,
  sun: SUN,
  floor: FLOOR,
  rim: RIM,
  glass: [
    [0, { transform: "translateX(-90%) rotate(16deg)" }, DRIFT],
    [3.4, { transform: "translateX(90%) rotate(16deg)" }],
    [13.4, { transform: "translateX(-90%) rotate(16deg)" }, DRIFT],
    [16.6, { transform: "translateX(80%) rotate(16deg)" }],
    [30, { transform: "translateX(-90%) rotate(16deg)" }, DRIFT],
    [31.8, { transform: "translateX(90%) rotate(16deg)" }],
  ],
  orb: ORB,
  "ring-0": ring(9.8),
  "ring-1": ring(10.6),
  "ring-2": ring(11.3),
  bar: uncover(9.3, 2.5),
  progress: uncover(14.5, 1.4),
  // Home scrolls under its tab bar, pulled by a finger
  scroll: [
    [0, { transform: "translateY(0%)" }],
    [17.5, { transform: "translateY(0%)" }, "cubic-bezier(0.3, 0.6, 0.2, 1)"],
    [18.6, { transform: `translateY(-${SCROLL}%)` }],
  ],
  drag: [
    [0, { opacity: 0, transform: "translateY(0px) scale(1.4)" }],
    [17.3, { opacity: 0, transform: "translateY(0px) scale(1.4)" }, ENTER],
    [17.5, { opacity: 1, transform: "translateY(0px) scale(0.9)" }, "cubic-bezier(0.3, 0.6, 0.2, 1)"],
    [18.1, { opacity: 1, transform: `translateY(-${330 * PT}px) scale(0.9)` }, ENTER],
    [18.35, { opacity: 0, transform: `translateY(-${350 * PT}px) scale(1.4)` }],
  ],
  "case-0": uncover(20.4, 1.1),
  "case-1": uncover(20.7, 1.3),
};
LAYERS.forEach((l) => {
  tracks[`layer-${l.id}`] = l.frames;
  Object.assign(tracks, uiTracks(l.id, l));
  if (l.live) Object.assign(tracks, liveTracks(`live-${l.id}`, l.live[0], l.live[1]));
});
STEPS.forEach((s, i) => (tracks[`step-${i}`] = vanish(s.t)));
Object.assign(tracks, uiTracks("ui", { touches: TOUCHES }));

// Make room for the onboarding, then add it
const later = (frames: Frame[]): Frame[] => frames.map(([t, s, e]) => [t > HELLO ? t + ONBOARD : t, s, e]);
const hello = LAYERS.filter((l) => l.hello).map((l) => l.id);
const own = (key: string) => hello.some((id) => key === `layer-${id}` || key.startsWith(`${id}-`) || key.startsWith(`live-${id}-`));
Object.keys(tracks).forEach((k) => {
  if (!own(k)) tracks[k] = later(tracks[k]!);
});
tracks.camera = [...tracks.camera!, ...HELLO_CAMERA].sort((a, b) => a[0] - b[0]);
Object.assign(tracks, uiTracks("hi", { touches: HELLO_TOUCHES }), { "drag-1": dragLeft(SWIPE_1), "drag-2": dragLeft(SWIPE_2) });

const script: FilmScript = {
  length: T + ONBOARD,
  // The case, filled in, in daylight
  poster: 17.35 + ONBOARD,
  // What's behind the nav when it passes over
  tones: [
    [0, "dark"],
    [ANSWER + ONBOARD + 0.9, "light"],
    [32.4 + ONBOARD, "dark"],
  ],
  tracks,
};

/** The parts of a layer that move on their own */
function Inside({ id }: { id: string }) {
  if (id === "keys")
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src="/work/case-tracker/keyboard.webp" alt="" className="ct-keys" style={at([0, 505, 375, 307])} draggable={false} />
    );
  if (id === "fetching")
    return (
      <>
        {STEPS.map((s, i) => (
          <span key={i} data-track={`step-${i}`} className="fp-cover" style={{ ...at([40, s.y, 230, 28]), background: "#fff" }} />
        ))}
        <span data-track="bar" className="fp-cover origin-right" style={{ ...at([47, 593, 131, 6]), background: "#e9edf3" }} />
      </>
    );
  if (id === "home")
    return (
      <>
        <div data-track="scroll" className="ct-scroll">
          <Still src="/work/case-tracker/home-long.webp" h={Math.round(1332 * PT)} />
          <span data-track="progress" className="fp-cover origin-right" style={{ ...at([31, 243.5, 149, 9]), background: "#f0f2f5" }} />
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/work/case-tracker/tabs-home.webp" alt="" className="ct-keys" style={at([0, 702, 375, 110])} draggable={false} />
      </>
    );
  if (id === "cases")
    return (
      <>
        <span data-track="case-0" className="fp-cover origin-right" style={{ ...at([34, 190.5, 151, 9]), background: "#f0f2f5" }} />
        <span data-track="case-1" className="fp-cover origin-right" style={{ ...at([26, 323.5, 323, 9]), background: "#f0f2f5" }} />
      </>
    );
  return null;
}

/**
 * Immigify Case Tracker+ as a short film: one iPhone, square on, in front of
 * a glossy sun that is the app's own AI orb. The onboarding swipes past and
 * two questions are answered. Then a receipt number is typed in,
 * the sun is drawn into the screen to work on it, then opens out as the case
 * while the room turns from crimson to daylight. The camera punches in to
 * every touch, press and keystroke, through to a booked consultation.
 */
export default function CaseTrackerFilm(props: FilmProps) {
  const { root, stage } = useFilm(script, props);
  return (
    <div ref={root} aria-hidden="true" className="film ct absolute inset-0 overflow-hidden">
      <div data-track="day" className="ct-day" />
      <div ref={stage} className="film-stage fp-stage" style={{ visibility: "hidden" }}>
        <span data-track="sun" className="ct-sun" />
        <span data-track="floor" className="fp-floor" />
        <div data-track="camera" className="film-phone">
          <Device>
            {LAYERS.map((l) => (
              <div key={l.id} data-track={`layer-${l.id}`} className="fp-layer">
                {l.screen ? <Still src={caseTracker[l.screen].src} /> : null}
                {l.live ? <LiveParts id={`live-${l.id}`} scene={l.live[0]} /> : null}
                <Inside id={l.id} />
                <ScreenUI id={l.id} presses={l.presses} typing={l.typing} />
              </div>
            ))}
            <span data-track="ring-0" className="ct-ring" style={at([153.5, 220, 68, 68])} />
            <span data-track="ring-1" className="ct-ring" style={at([153.5, 220, 68, 68])} />
            <span data-track="ring-2" className="ct-ring" style={at([153.5, 220, 68, 68])} />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img data-track="orb" src="/work/case-tracker/orb.webp" alt="" className="ct-orb" style={at([153.5, 220, 68, 68])} draggable={false} />
            <span data-track="drag" className="fp-touch" style={{ left: 200 * PT, top: 600 * PT }} />
            <span data-track="drag-1" className="fp-touch" style={{ left: 300 * PT, top: 420 * PT }} />
            <span data-track="drag-2" className="fp-touch" style={{ left: 300 * PT, top: 420 * PT }} />
            <Touches id="hi" touches={HELLO_TOUCHES} />
            <Touches id="ui" touches={TOUCHES} />
          </Device>
        </div>
      </div>
    </div>
  );
}
