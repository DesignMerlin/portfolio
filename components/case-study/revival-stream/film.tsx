"use client";

import Image from "next/image";
import { FILM_DESKTOP, FILM_PHONE } from "@/components/case-study/film/kit";
import { at, on, pushIn, PT, ScreenUI, SCREEN_H, SCREEN_W, show, Touches, uiTracks, type Box, type Press, type Touch, type Typing } from "@/components/case-study/film/device";
import { DRIFT, ENTER, SHEET, STAGE_W, type Frame } from "@/components/case-study/film/kit";
import { useFilm, type FilmProps, type FilmScript } from "@/components/case-study/film/use-film";
import { HOLD, LiveParts, liveTracks, type LiveScene, type Part, type PtBox } from "@/components/case-study/live/kit";
import { dance, inPlace, land, likeParts, revivalEmpty, revivalLoading, revivalMinister, revivalPlayerPhone, revivalVerified } from "@/components/case-study/live/revival";
import { BARS, FLAME, LETTERS, LOCKUP } from "@/components/case-study/revival-stream/logo";
import { revival, type RevivalScreen } from "@/content/revival-stream";

/* ------------------------------------------------------------------ */
/* A radio. The stage is the front of one: a dial along the bottom, a  */
/* needle that never moves, and an equaliser behind. Each part of the  */
/* product is a station. Between them the dial is turned: the devices  */
/* slide away one side and the next ones come in from the other, and   */
/* the dial settles with a little overshoot, the way tuning does. The  */
/* equaliser only plays while a channel does.                          */
/* ------------------------------------------------------------------ */

const FILES = "/work/revival";
const PEACH = "#ff8c62";
const SPRING = "cubic-bezier(0.34, 1.56, 0.64, 1)";
const PUNCH = "cubic-bezier(0.32, 0.72, 0, 1)";
const TUNE_OUT = "cubic-bezier(0.6, 0, 0.9, 0.4)";
const TUNE_IN = "cubic-bezier(0.16, 0.9, 0.3, 1)";

/** When each station is tuned to */
const A = 3.3; // sign up, on the laptop
const B = 11.4; // sign in and listen, on the phone
const C = 25.8; // sign in and listen, on the laptop
const D = 37.2; // browse, on both
const E = 44.4; // the library, on both
const F = 53.3; // the account, on both
const END = 62.5;
/** One loop, in seconds */
const T = 64.1;

const STATIONS = ["Sign up", "Listen on mobile", "Listen on desktop", "Browse", "Library", "Account"];
const STATION_GAP = 1180;
const TUNES = [B, C, D, E, F];

// The laptop's screen is 1440×1024 points, drawn at this many pixels to a point -----

const LPT = 0.75;
const LAP = 0.7;
const DESK: [number, number] = [1440, 1024];
/** Stage pixels to a point: the laptop, the phone alone, the phone beside the laptop */
const LS = LPT * LAP;
const PS = PT * 0.47;
const PB = PT * 0.4;
const PHONE_AT: [x: number, y: number] = [398, 42];
const LAPTOP_BOTH = -104;

// The camera: flat. A point on a screen held in the middle, and how close -----

const cam = (x: number, y: number, s: number): Keyframe => ({ transform: `translate3d(${(-x * s).toFixed(1)}px, ${(-y * s).toFixed(1)}px, 0px) scale(${s})` });
const WHOLE = cam(0, 0, 1);
const onLap = (x: number, y: number, s: number, dx = 0) => cam((x - 720) * LS + dx, (y - 512) * LS, s);
const onPhone = (x: number, y: number, s: number) => cam((x - 187.5) * PS, (y - 406) * PS, s);
const onBoth = (x: number, y: number, s: number) => onLap(x, y, s, LAPTOP_BOTH);
const onSide = (x: number, y: number, s: number) => cam((x - 187.5) * PB + PHONE_AT[0], (y - 406) * PB + PHONE_AT[1], s);

const CAMERA: Frame[] = [
  [0, WHOLE],
  [A + 0.2, WHOLE, PUNCH],
  // Sign up
  [A + 0.95, onLap(720, 420, 2.35), DRIFT],
  [A + 3.5, onLap(720, 500, 2.45), PUNCH],
  [A + 4.3, onLap(720, 380, 1.9), DRIFT],
  [A + 6, onLap(720, 400, 2), PUNCH],
  [A + 6.7, onLap(720, 420, 1.75), DRIFT],
  [A + 7.6, onLap(720, 420, 1.8), PUNCH],
  [B, WHOLE, DRIFT],
  // Sign in on the phone
  [B + 0.8, onPhone(187.5, 390, 1), PUNCH],
  [B + 1.4, onPhone(187.5, 350, 1.55), DRIFT],
  [B + 2.7, onPhone(187.5, 380, 1.6), PUNCH],
  [B + 3.5, onPhone(187.5, 406, 1), DRIFT],
  [B + 6, onPhone(187.5, 440, 1.06), PUNCH],
  [B + 6.6, onPhone(187.5, 640, 1.55), DRIFT],
  [B + 7, onPhone(187.5, 640, 1.55), PUNCH],
  [B + 7.8, onPhone(187.5, 350, 1.4), DRIFT],
  [B + 9.2, onPhone(187.5, 406, 1.08), PUNCH],
  [B + 9.9, onPhone(187.5, 430, 1.3), DRIFT],
  [B + 12.2, onPhone(187.5, 440, 1.32), DRIFT],
  [B + 13.9, onPhone(187.5, 490, 1.36), PUNCH],
  [C, WHOLE, DRIFT],
  // Sign in on the laptop
  [C + 0.7, WHOLE, PUNCH],
  [C + 1.3, onLap(720, 400, 2.25), DRIFT],
  [C + 3.2, onLap(720, 450, 2.35), PUNCH],
  [C + 4, WHOLE, DRIFT],
  [C + 5.2, onLap(700, 520, 1.12), DRIFT],
  [C + 5.6, onLap(640, 520, 1.3), PUNCH],
  [C + 6.5, onLap(720, 430, 1.5), DRIFT],
  [C + 7.2, onLap(860, 380, 1.75), DRIFT],
  [C + 8.5, onLap(900, 360, 1.8), PUNCH],
  [C + 9.4, onLap(1000, 520, 1.4), DRIFT],
  [C + 11, onLap(1030, 500, 1.45), PUNCH],
  [D, WHOLE, DRIFT],
  // Browse
  [D + 2, cam(20, 0, 1.04), DRIFT],
  [D + 6.6, cam(30, 10, 1.1), PUNCH],
  [E, WHOLE, DRIFT],
  // Library: the phone's menu, then the form
  [E + 0.7, WHOLE, PUNCH],
  [E + 1.3, onSide(187.5, 400, 1.36), DRIFT],
  [E + 3.4, onSide(187.5, 420, 1.42), PUNCH],
  [E + 4.1, onBoth(810, 430, 1.45), DRIFT],
  [E + 4.9, onBoth(800, 420, 1.7), DRIFT],
  [E + 6.1, onBoth(800, 560, 1.8), DRIFT],
  [E + 7.9, onBoth(820, 760, 1.75), PUNCH],
  [F, WHOLE, DRIFT],
  // Account
  [F + 0.7, WHOLE, PUNCH],
  [F + 1.4, onBoth(1080, 330, 1.65), DRIFT],
  [F + 2, onBoth(1080, 400, 1.6), PUNCH],
  [F + 2.8, onBoth(860, 330, 1.25), DRIFT],
  [F + 3.6, onBoth(960, 300, 1.4), PUNCH],
  [F + 4.6, cam(0, 0, 1.06), DRIFT],
  [F + 5.6, cam(0, 10, 1.1), PUNCH],
  [F + 6.4, onBoth(760, 560, 1.45), DRIFT],
  [F + 7.2, onBoth(760, 540, 1.45), PUNCH],
  [F + 8.1, onBoth(760, 320, 1.6), DRIFT],
  [F + 8.7, onBoth(760, 320, 1.65), PUNCH],
  [END, WHOLE],
  [T, WHOLE],
];

// Tuning: what's on leaves to the left, what's next arrives from the right -----

const slide = (x: number, y = 0, lean = 0, s = 1): Keyframe => ({ transform: `translate3d(${x}px, ${y}px, 0px) skewX(${lean}deg) scale(${s})` });
const FAR = 1420;
const leave = (t: number, x: number, y: number, s: number): Frame[] => [
  [t - 0.12, slide(x, y, 0, s), TUNE_OUT],
  [t + 0.34, slide(x - FAR, y, 5, s), HOLD],
  [t + 0.35, slide(x + FAR, y, 5, s)],
];
const arrive = (t: number, x: number, y: number, s: number): Frame[] => [
  [t + 0.36, slide(x + FAR, y, 5, s), TUNE_IN],
  [t + 0.98, slide(x, y, 0, s)],
];
const LAPTOP: Frame[] = [
  // Comes up from below as its lid opens
  [0, slide(0, 720)],
  [A - 1.35, slide(0, 720), PUNCH],
  [A - 0.45, slide(0, 0)],
  ...leave(B, 0, 0, 1),
  ...arrive(C, 0, 0, 1),
  ...leave(D, 0, 0, 1),
  ...arrive(D, LAPTOP_BOTH, 0, 1),
  ...leave(E, LAPTOP_BOTH, 0, 1),
  ...arrive(E, LAPTOP_BOTH, 0, 1),
  ...leave(F, LAPTOP_BOTH, 0, 1),
  ...arrive(F, LAPTOP_BOTH, 0, 1),
  [END + 0.45, slide(LAPTOP_BOTH), TUNE_OUT],
  [END + 0.95, slide(LAPTOP_BOTH, 760)],
];
const [PX, PY] = PHONE_AT;
const PHONE: Frame[] = [
  [0, slide(FAR, 0, 5)],
  ...arrive(B, 0, 0, 0.94),
  ...leave(C, 0, 0, 0.94),
  ...arrive(D, PX, PY, 0.8),
  ...leave(E, PX, PY, 0.8),
  ...arrive(E, PX, PY, 0.8),
  ...leave(F, PX, PY, 0.8),
  ...arrive(F, PX, PY, 0.8),
  [END + 0.25, slide(PX, PY, 0, 0.8), TUNE_OUT],
  [END + 0.8, slide(PX, PY + 900, 0, 0.8)],
];
const LID: Frame[] = [
  [0, { transform: "perspective(5200px) rotateX(-88deg)" }],
  [A - 1.15, { transform: "perspective(5200px) rotateX(-88deg)" }, PUNCH],
  [A - 0.15, { transform: "perspective(5200px) rotateX(0deg)" }],
  [END + 0.05, { transform: "perspective(5200px) rotateX(0deg)" }, "cubic-bezier(0.5, 0, 0.75, 0.4)"],
  [END + 0.6, { transform: "perspective(5200px) rotateX(-88deg)" }],
];

/** The dial runs under the needle, past the station, then back onto it */
const strip = (i: number, off = 0) => ({ transform: `translate3d(${-i * STATION_GAP + off}px, 0px, 0px)` });
const DIAL: Frame[] = [
  [0, strip(0, STATION_GAP * 0.6)],
  [A - 1.3, strip(0, STATION_GAP * 0.6), "cubic-bezier(0.5, 0, 0.2, 1)"],
  [A - 0.5, strip(0, -26), DRIFT],
  [A - 0.2, strip(0)],
  ...TUNES.flatMap((t, i): Frame[] => [
    [t - 0.2, strip(i), "cubic-bezier(0.5, 0, 0.2, 1)"],
    [t + 0.75, strip(i + 1, -26), DRIFT],
    [t + 1.05, strip(i + 1)],
  ]),
  [END, strip(5), TUNE_OUT],
  [END + 0.9, strip(5, -STATION_GAP * 0.6)],
];
const DIAL_IN: Frame[] = [
  [0, { transform: "translateY(260px)" }],
  [A - 1.5, { transform: "translateY(260px)" }, PUNCH],
  [A - 0.7, { transform: "translateY(0px)" }],
  [END + 0.5, { transform: "translateY(0px)" }, TUNE_OUT],
  [END + 1, { transform: "translateY(260px)" }],
];
const station = (i: number): Frame[] => {
  const from = i === 0 ? A - 0.5 : TUNES[i - 1]! + 0.6;
  const to = TUNES[i] ?? END + 0.3;
  return [
    [0, { opacity: 0.45 }],
    [from, { opacity: 0.45 }, ENTER],
    [from + 0.3, { opacity: 1 }],
    [to - 0.2, { opacity: 1 }, ENTER],
    [to + 0.1, { opacity: 0.45 }],
  ];
};

// The equaliser ------------------------------------------------------------

const EQ = 23;
/** Loud while something plays */
const LOUD: [from: number, to: number][] = [
  [B + 6.2, C - 0.2],
  [C + 6, D - 0.1],
];
const eqBar = (i: number): Frame[] => {
  // Taller in the middle, like the mark
  const tall = 0.45 + 0.55 * Math.cos(((i - (EQ - 1) / 2) / EQ) * 2.4);
  const frames: Frame[] = [[0, { transform: "scaleY(0.04)" }]];
  LOUD.forEach(([from, to]) => {
    frames.push([from, { transform: "scaleY(0.04)" }, DRIFT]);
    for (let t = from + 0.2, n = 0; t < to - 0.3; t += 0.24, n++) {
      const v = tall * (0.3 + 0.7 * Math.abs(Math.sin(i * 1.9 + n * 1.37 + Math.sin(n * 0.8 + i))));
      frames.push([t, { transform: `scaleY(${v.toFixed(2)})` }, DRIFT]);
    }
    frames.push([to, { transform: "scaleY(0.04)" }]);
  });
  return frames;
};

// What the screens show ----------------------------------------------------

const until = (t: number): Frame[] => [
  [t, { opacity: 1 }],
  [t + 0.02, { opacity: 0 }],
];
/** A page arriving in the browser */
const page = (t: number, end: number): Frame[] => [...on(t, 0.22), ...until(end)];
const scene = (parts: Part[], size?: [number, number]): LiveScene => ({ length: T, size, parts });
const desk = (parts: Part[]) => scene(parts, DESK);
/** A piece of the next state of a screen, in place */
const swap = (id: string, box: PtBox, src: string, t: number): Part => ({ id, box, slice: src, frames: on(t, 0.15) });
/** The page behind a dialog dims, and comes back */
const dim = (from: number, to: number, size: PtBox, o = 0.66): Part => ({
  id: `dim-${from}`,
  box: size,
  bg: `rgb(8 8 8 / ${o})`,
  frames: [
    [0, { opacity: 0 }],
    [from, { opacity: 0 }, ENTER],
    [from + 0.3, { opacity: 1 }],
    [to, { opacity: 1 }, ENTER],
    [to + 0.22, { opacity: 0 }],
  ],
});
/** A dialog: lands, and goes when it's closed */
const dialog = (id: string, box: PtBox, src: string, from: number, to: number, r: number, sliceSize?: [number, number]): Part => ({
  id,
  box,
  slice: src,
  sliceSize,
  r,
  frames: [
    [0, { opacity: 0, transform: "scale(0.88) translateY(14px)" }],
    [from, { opacity: 0, transform: "scale(0.88) translateY(14px)" }, SPRING],
    [from + 0.08, { opacity: 1 }],
    [from + 0.42, { transform: "scale(1) translateY(0px)" }],
    [to, { opacity: 1, transform: "scale(1) translateY(0px)" }, ENTER],
    [to + 0.18, { opacity: 0, transform: "scale(0.96) translateY(6px)" }],
  ],
});
/** A row that rises into its own place */
const row = (id: string, box: PtBox, src: string, t: number, bg = "#0f0f0f", sliceSize?: [number, number]): Part => ({
  id,
  box,
  bg,
  clip: true,
  parts: [
    {
      id: `${id}-in`,
      box,
      slice: src,
      sliceSize,
      frames: [
        [0, { transform: "translateY(105%)" }],
        [t, { transform: "translateY(105%)" }, SHEET],
        [t + 0.5, { transform: "translateY(0%)" }],
      ],
    },
  ],
});

type Layer = {
  id: string;
  screen: RevivalScreen;
  frames: Frame[];
  scroll?: Frame[];
  /** Parts of the page that stay where they are while it scrolls */
  fixed?: PtBox[];
  presses?: Press[];
  typing?: Typing[];
  /** Scenes on this screen, when they start and when they stop looping */
  live?: [scene: LiveScene, t: number, until?: number][];
  /** Scenes above the scroll */
  over?: LiveScene;
};

const SIDEBAR: PtBox = [0, 0, 272, 1024];
const TOPBAR: PtBox = [272, 0, 1168, 98];
const STATUS: PtBox = [0, 0, 375, 46];
/** Scrolled to each place (points) in turn */
const scroll = (pt: number, ...stops: [from: number, to: number, y: number][]): Frame[] => {
  const frames: Frame[] = [[0, { transform: "translateY(0px)" }]];
  let y = 0;
  stops.forEach(([from, to, next]) => {
    frames.push([from, { transform: `translateY(${-y * pt}px)` }, "cubic-bezier(0.45, 0, 0.2, 1)"], [to, { transform: `translateY(${-next * pt}px)` }]);
    y = next;
  });
  return frames;
};
/** A field, and the words that go in it */
const type = (t: number, d: number, chars: number, text: Box, field: Box, src: string, bg = "#424242", r = 6): Typing => ({
  focusAt: t,
  from: t + 0.15,
  to: t + 0.15 + d,
  blurAt: t + 0.3 + d,
  chars,
  text,
  field,
  r,
  bg,
  src: `${FILES}/ink-${src}.webp`,
});

/** When the mark lands in the laptop's corner */
const LAND = A + 0.1;
const bothTo = { A: B + 0.35, C: D + 0.35, D: E + 0.35, E: F + 0.35 };

// Sign up: the code, one digit at a time (the last box is drawn focused, so it's plain until then)
const CODE = desk([
  { id: "plain", box: [814, 400, 88, 84], slice: revival.code0.src, sliceAt: [722, 400], frames: [[0, { opacity: 1 }], ...until(A + 5.35)] },
  ...[542, 634, 726, 818].map((x, i) => land(`digit-${i}`, [x - 3, 400, 86, 84], revival.code.src, A + 4.75 + i * 0.2, undefined, 0.8)),
  swap("go", [540, 512, 360, 44], revival.code.src, A + 5.5),
]);
const SIGNED = desk([
  // The page's own logo waits for the mark to land on it
  { id: "no-logo", box: [78, 54, 94, 46], bg: "#141414", frames: [[0, { opacity: 1 }], ...until(LAND + 0.12)] },
  swap("go", [539, 611, 362, 55], revival.signup.src, A + 3.4),
]);
/** A placeholder longer than what replaces it goes with the first character */
const clear = (id: string, box: PtBox, t: number, bg = "#141414"): Part => ({ id, box, bg, frames: show(t) });
const LOGGED = desk([clear("clear", [556, 316, 210, 24], C + 1.2, "#424242"), swap("go", [545, 492, 362, 55], revival.login.src, C + 2.15)]);

// The player
const P_CHAT = C + 9;
const PLAYER = desk([
  ...likeParts(C + 7.25, C + 8.6),
  {
    id: "chat",
    box: [948, 179, 463, 803],
    slice: revival.chat.src,
    r: 10,
    frames: [
      [0, { opacity: 0, transform: "translateX(40%)" }],
      [P_CHAT + 0.05, { opacity: 0, transform: "translateX(40%)" }, SHEET],
      [P_CHAT + 0.15, { opacity: 1 }],
      [P_CHAT + 0.55, { transform: "translateX(0%)" }],
    ],
    parts: [row("says-1", [964, 246, 431, 62], revival.chat.src, P_CHAT + 0.55), row("says-2", [964, 321, 431, 64], revival.chat.src, P_CHAT + 0.95)],
  },
]);

// The library
const REQ = E + 3.6;
const MEDIA = desk([
  clear("clear-title", [480, 308, 200, 28], REQ + 0.65),
  clear("clear-who", [480, 826, 280, 28], REQ + 3.5),
  clear("clear-type", [480, 708, 80, 28], REQ + 3.1),
  {
    id: "menu",
    box: [468, 752, 240, 163],
    img: `${FILES}/media-menu.webp`,
    r: 8,
    clip: true,
    origin: "50% 0%",
    frames: [
      [0, { opacity: 0, transform: "scaleY(0.6)" }],
      [REQ + 2.35, { opacity: 0, transform: "scaleY(0.6)" }, SHEET],
      [REQ + 2.42, { opacity: 1 }],
      [REQ + 2.65, { transform: "scaleY(1)" }],
      [REQ + 3.1, { opacity: 1 }, ENTER],
      [REQ + 3.25, { opacity: 0 }],
    ],
  },
  { id: "picked", box: [484, 711, 38, 24], img: `${FILES}/ink-request-type.webp`, frames: on(REQ + 3.1, 0.1) },
]);

// The account
const TOGGLE = (y: number, t: number): Part[] => [
  { id: `track-${y}`, box: [907, y, 36, 20], slice: revival.prefs.src, sliceAt: [907, 212], r: 10, frames: on(t, 0.15) },
  {
    id: `cover-${y}`,
    box: [924, y + 1, 18, 18],
    bg: "#ea4609",
    r: 9,
    frames: on(t, 0.15),
  },
  {
    id: `knob-${y}`,
    box: [909, y + 2, 16, 16],
    bg: "#fff",
    r: 8,
    frames: [
      [0, { opacity: 0, transform: "translateX(0%)" }],
      [t, { opacity: 0, transform: "translateX(0%)" }, SPRING],
      [t + 0.05, { opacity: 1 }],
      [t + 0.35, { transform: "translateX(100%)" }],
    ],
  },
];
const PREFS = desk([...TOGGLE(248, F + 8.25), ...TOGGLE(375, F + 8.65)]);
const BELL = desk([
  {
    id: "menu",
    box: [925, 92, 400, 676],
    img: `${FILES}/notification-menu.webp`,
    r: 8,
    clip: true,
    origin: "96% 0%",
    frames: [
      [0, { opacity: 0, transform: "scale(0.85)" }],
      [F + 1.1, { opacity: 0, transform: "scale(0.85)" }, SPRING],
      [F + 1.16, { opacity: 1 }],
      [F + 1.5, { transform: "scale(1)" }],
    ],
  },
]);
const MENU: LiveScene = desk([
  {
    id: "menu",
    box: [1165, 84, 240, 128],
    img: `${FILES}/account-menu.webp`,
    r: 8,
    clip: true,
    origin: "92% 0%",
    frames: [
      [0, { opacity: 0, transform: "scale(0.85)" }],
      [F + 3.4, { opacity: 0, transform: "scale(0.85)" }, SPRING],
      [F + 3.46, { opacity: 1 }],
      [F + 3.75, { transform: "scale(1)" }],
    ],
  },
]);
const NOTES: LiveScene = scene(
  [
    { id: "ground", box: [296, 278, 1072, 60], bg: "#141414", frames: on(F + 2.75, 0.02) },
    {
      id: "row",
      box: [296, 278, 1072, 60],
      slice: revival.notifications.src,
      frames: [
        [0, { opacity: 1, transform: "translateX(0%)" }],
        [F + 2.75, { opacity: 1, transform: "translateX(0%)" }, "cubic-bezier(0.4, 0, 1, 1)"],
        [F + 3.1, { opacity: 0, transform: "translateX(12%)" }],
      ],
    },
  ],
  [1440, 1271],
);
const DISCONNECT: LiveScene = scene(
  [dim(F + 5.7, F + 7.05, [0, 0, 1440, 1353], 0.6), dialog("sheet", [304, 301, 981, 593], revival.disconnect.src, F + 5.7, F + 7.05, 12)],
  [1440, 1353],
);

const LAPTOP_LAYERS: Layer[] = [
  {
    id: "signup",
    screen: "signup0",
    frames: show(null, A + 4.2),
    live: [[SIGNED, 0]],
    typing: [
      type(A + 0.85, 0.5, 8, [555, 333, 68, 22], [539, 315, 362, 56], "username"),
      type(A + 1.65, 0.75, 16, [555, 409, 132, 22], [539, 391, 362, 56], "email"),
      type(A + 2.7, 0.4, 8, [555, 484, 66, 22], [539, 467, 362, 56], "password"),
    ],
    presses: [{ t: A + 3.95, box: [539, 611, 362, 55], r: 6 }],
  },
  { id: "code", screen: "code0", frames: page(A + 4.05, A + 6.45), live: [[CODE, 0]], presses: [{ t: A + 6, box: [540, 512, 360, 44], r: 8 }] },
  { id: "verified", screen: "verified", frames: page(A + 6.15, bothTo.A), live: [[revivalVerified, A + 6.25]], presses: [{ t: A + 7.6, box: [545, 576, 360, 44], r: 8 }] },

  {
    id: "login",
    screen: "login0",
    frames: show(C + 0.34, C + 2.75),
    live: [[LOGGED, 0]],
    typing: [
      type(C + 1.05, 0.4, 8, [561, 317, 68, 22], [545, 299, 362, 56], "login-username"),
      type(C + 1.7, 0.3, 8, [561, 392, 66, 22], [545, 375, 362, 56], "login-password"),
    ],
    presses: [{ t: C + 2.6, box: [545, 492, 362, 55], r: 6 }],
  },
  { id: "loading", screen: "loginLoading", frames: show(C + 2.7, C + 3.75), live: [[revivalLoading, C + 2.7, C + 3.8]] },
  {
    id: "home",
    screen: "home",
    frames: page(C + 3.5, C + 6.4),
    scroll: scroll(LPT, [C + 4.1, C + 4.9, 412]),
    fixed: [SIDEBAR, TOPBAR],
    presses: [{ t: C + 5.6, box: [304, 825, 177, 177], r: 88 }],
  },
  {
    id: "player",
    screen: "minister",
    frames: [
      [0, { transform: "translateY(100%)", opacity: 0 }],
      [C + 5.7, { transform: "translateY(100%)", opacity: 0 }],
      [C + 5.72, { transform: "translateY(100%)", opacity: 1 }, SHEET],
      [C + 6.3, { transform: "translateY(0%)" }],
      ...until(bothTo.C),
    ],
    live: [
      [revivalMinister, C + 5.7, D + 0.4],
      [PLAYER, 0],
    ],
    presses: [
      { t: C + 7.2, box: [808, 373, 53, 53], r: 27 },
      { t: P_CHAT, box: [877, 373, 53, 53], r: 27 },
    ],
  },

  { id: "channels", screen: "channels", frames: show(D + 0.34, D + 1.75), fixed: [SIDEBAR, TOPBAR], presses: [{ t: D + 1.45, box: [677, 188, 357, 170], r: 8 }] },
  { id: "channel", screen: "channelPlaying", frames: page(D + 1.55, D + 3.1) },
  { id: "ministers", screen: "ministers", frames: page(D + 2.8, D + 4.4), scroll: scroll(LPT, [D + 3.1, D + 3.9, 160]), fixed: [SIDEBAR, TOPBAR] },
  { id: "minstrels", screen: "minstrels", frames: page(D + 4.1, D + 5.7) },
  { id: "testimonies", screen: "testimonies", frames: page(D + 5.4, bothTo.D), scroll: scroll(LPT, [D + 5.7, D + 6.6, 220]), fixed: [SIDEBAR, TOPBAR] },

  { id: "favourites", screen: "favourites", frames: show(E + 0.34, REQ + 0.3), live: [[revivalEmpty, E + 0.4, REQ + 0.4]] },
  {
    id: "request",
    screen: "request",
    frames: page(REQ, bothTo.E),
    typing: [
      type(REQ + 0.5, 0.55, 18, [484, 310, 136, 24], [468, 294, 733, 55], "request-title", "#141414"),
      type(REQ + 1.25, 0.85, 67, [484, 427, 419, 24], [468, 412, 733, 219], "request-why", "#141414"),
      type(REQ + 3.35, 0.5, 16, [484, 828, 113, 24], [468, 812, 733, 55], "request-who", "#141414"),
    ],
    live: [[MEDIA, 0]],
    presses: [{ t: REQ + 4.35, box: [467, 899, 729, 54], r: 6 }],
  },

  { id: "bell", screen: "request", frames: show(F + 0.34, F + 2.3), live: [[BELL, 0]] },
  { id: "notes", screen: "notifications", frames: page(F + 2.05, F + 4.4), live: [[NOTES, 0]], over: MENU },
  { id: "account", screen: "account", frames: page(F + 4.15, F + 5.2) },
  { id: "password", screen: "password", frames: page(F + 4.95, F + 7.6), live: [[DISCONNECT, 0]], presses: [{ t: F + 5.65, box: [1126, 765, 215, 53], r: 6 }] },
  { id: "prefs", screen: "prefs", frames: [...on(F + 7.4, 0.22)], live: [[PREFS, 0]] },
];

/** The pointer: where it goes, when it gets there and whether it clicks */
type Move = [t: number, x: number, y: number, click?: boolean];
const POINTER: Move[] = [
  [A + 0.3, 1010, 700],
  [A + 0.8, 640, 343, true],
  [A + 1.6, 660, 419, true],
  [A + 2.65, 640, 495, true],
  [A + 3.95, 720, 640, true],
  [A + 4.55, 640, 440],
  [A + 6, 720, 536, true],
  [A + 7.6, 725, 600, true],
  [C + 0.4, 1020, 700],
  [C + 1, 640, 327, true],
  [C + 1.65, 640, 403, true],
  [C + 2.6, 725, 522, true],
  [C + 4, 900, 640],
  [C + 5.6, 392, 502, true],
  [C + 7.2, 834, 402, true],
  [P_CHAT, 903, 402, true],
  [P_CHAT + 1.2, 1120, 560],
  [D + 0.5, 1000, 600],
  [D + 1.45, 850, 280, true],
  [D + 2.75, 90, 287, true],
  [D + 4.05, 90, 335, true],
  [D + 5.35, 90, 383, true],
  [D + 6, 700, 560],
  [E + 0.5, 600, 600],
  [REQ - 0.05, 112, 479, true],
  [REQ + 0.5, 620, 322, true],
  [REQ + 1.2, 640, 500, true],
  [REQ + 2.35, 820, 722, true],
  [REQ + 3.05, 540, 806, true],
  [REQ + 3.35, 640, 840, true],
  [REQ + 4.35, 830, 928, true],
  [F + 0.5, 1150, 400],
  [F + 1.05, 1311, 52, true],
  [F + 2, 1015, 740, true],
  [F + 2.75, 1316, 293, true],
  [F + 3.4, 1381, 50, true],
  [F + 4.1, 1250, 160, true],
  [F + 4.9, 356, 283, true],
  [F + 5.65, 1233, 792, true],
  [F + 7, 1217, 364, true],
  [F + 7.4, 403, 331, true],
  [F + 8.2, 925, 259, true],
  [F + 8.6, 925, 386, true],
  [END, 1050, 620],
];
const spot = (x: number, y: number) => ({ transform: `translate3d(${x * LPT}px, ${y * LPT}px, 0px)` });
const pointerFrames: Frame[] = [];
POINTER.forEach(([t, x, y], i) => {
  const prev = POINTER[i - 1];
  // Sets off about half a second before it's due, or as soon as the last thing is done
  if (prev) pointerFrames.push([Math.max(prev[0] + 0.1, t - 0.62), spot(prev[1], prev[2]), "cubic-bezier(0.45, 0.05, 0.2, 1)"]);
  pointerFrames.push([t - (prev && t - prev[0] < 0.4 ? 0.02 : 0.1), spot(x, y)]);
});
const CLICKS = POINTER.filter((m) => m[3]);

// The phone ----------------------------------------------------------------

const H = B + 2.95;
const PL = B + 6.95;
const MINI: LiveScene = scene([
  {
    id: "bar",
    box: [11, 737, 354, 61],
    img: `${FILES}/mini-bar.webp`,
    frames: [
      [0, { transform: "translateY(170%)" }],
      [B + 6.05, { transform: "translateY(170%)" }, SPRING],
      [B + 6.5, { transform: "translateY(0%)" }],
    ],
  },
]);
const PHONE_PLAYER: LiveScene = scene([
  dim(B + 9.75, B + 10.75, [0, 0, 375, 812]),
  dialog("about", [16, 260, 343, 347], revival.mAbout.src, B + 9.75, B + 10.75, 8, [375, 1264]),
  dim(B + 11.15, B + 12.05, [0, 0, 375, 812]),
  dialog("share", [16, 328, 344, 301], revival.mShare.src, B + 11.15, B + 12.05, 12, [375, 1264]),
  {
    id: "chat",
    box: [0, 345, 375, 467],
    slice: revival.mChat.src,
    r: 12,
    frames: [
      [0, { transform: "translateY(102%)" }],
      [B + 12.5, { transform: "translateY(102%)" }, SHEET],
      [B + 13, { transform: "translateY(0%)" }],
    ],
    parts: [row("says-1", [16, 403, 344, 58], revival.mChat.src, B + 13), row("says-2", [16, 471, 344, 58], revival.mChat.src, B + 13.35)],
  },
]);
const SIGNED_IN: LiveScene = scene([swap("go", [17, 453, 342, 54], revival.mLogin.src, B + 2.35)]);

/** The menu: Library opens, and what's under it moves down */
const OPEN = E + 1.6;
const MENU_PHONE: LiveScene = scene([
  { id: "ground", box: [0, 262, 375, 200], bg: "#0f0f0f", frames: on(OPEN, 0.02) },
  {
    id: "list",
    box: [44, 247.6, 130, 74],
    img: `${FILES}/library-menu.webp`,
    frames: [
      [0, { opacity: 0, transform: "translateY(-18%)" }],
      [OPEN + 0.12, { opacity: 0, transform: "translateY(-18%)" }, ENTER],
      [OPEN + 0.5, { opacity: 1, transform: "translateY(0%)" }],
    ],
  },
  {
    id: "rest",
    box: [0, 262, 375, 112],
    slice: revival.mMenuIn.src,
    frames: [
      [0, { transform: "translateY(0%)" }],
      [OPEN, { transform: "translateY(0%)" }, SHEET],
      [OPEN + 0.5, { transform: "translateY(81%)" }],
    ],
  },
  {
    id: "chevron",
    box: [334, 204, 26, 26],
    slice: revival.mMenuIn.src,
    frames: [
      [0, { transform: "rotate(0deg)" }],
      [OPEN, { transform: "rotate(0deg)" }, SHEET],
      [OPEN + 0.4, { transform: "rotate(180deg)" }],
    ],
  },
]);

const PHONE_LAYERS: Layer[] = [
  {
    id: "m-login",
    screen: "mLogin0",
    frames: show(null, H + 0.6),
    live: [[SIGNED_IN, 0]],
    typing: [
      type(B + 1.05, 0.45, 8, [31, 267, 68, 22], [16, 249, 343, 56], "m-username", "#424242", 8),
      type(B + 1.75, 0.35, 8, [31, 342, 66, 22], [16, 325, 343, 56], "m-password", "#424242", 8),
    ],
    presses: [{ t: B + 2.85, box: [17, 453, 342, 54], r: 8 }],
  },
  {
    id: "m-home",
    screen: "mHome",
    frames: pushIn(H, PL + 0.6),
    scroll: scroll(PT, [H + 0.9, H + 1.7, 720], [H + 2, H + 2.7, 0]),
    fixed: [STATUS],
    over: MINI,
    presses: [{ t: B + 5.95, box: [16, 411, 184, 88], r: 6 }],
  },
  {
    id: "m-player",
    screen: "mPlayer",
    frames: [
      [0, { transform: "translateY(100%)", opacity: 0 }],
      [PL, { transform: "translateY(100%)", opacity: 0 }],
      [PL + 0.02, { transform: "translateY(100%)", opacity: 1 }, SHEET],
      [PL + 0.6, { transform: "translateY(0%)" }],
      ...until(C + 0.35),
    ],
    scroll: scroll(PT, [PL + 1.3, PL + 2, 330], [PL + 2.2, PL + 2.8, 0]),
    live: [[revivalPlayerPhone, PL, C + 0.4]],
    over: PHONE_PLAYER,
  },

  // Always a different list from the laptop's, so no picture is on screen twice
  { id: "m-ministers", screen: "mMinisters", frames: show(D + 0.34, D + 2.45), scroll: scroll(PT, [D + 1, D + 2, 380]), fixed: [STATUS] },
  { id: "m-minstrels", screen: "mMinstrels", frames: pushIn(D + 2.2, D + 3.75), scroll: scroll(PT, [D + 2.7, D + 3.4, 360]), fixed: [STATUS] },
  { id: "m-testimonies", screen: "mTestimonies", frames: pushIn(D + 3.5, D + 5.4), scroll: scroll(PT, [D + 4, D + 4.7, 420]), fixed: [STATUS] },
  { id: "m-channels", screen: "mChannels", frames: pushIn(D + 4.8, bothTo.D), scroll: scroll(PT, [D + 5.4, D + 6.7, 620]), fixed: [STATUS] },

  { id: "m-menu", screen: "mMenuIn", frames: show(E + 0.34, E + 4.6), live: [[MENU_PHONE, 0]] },
  { id: "m-request", screen: "mRequest", frames: pushIn(E + 3.85, bothTo.E), scroll: scroll(PT, [E + 6, E + 7.2, 240]), fixed: [STATUS] },

  { id: "m-notes", screen: "mNotifications", frames: show(F + 0.34, F + 4.8) },
  { id: "m-settings", screen: "mSettings", frames: pushIn(F + 3.5, F + 4.8) },
  { id: "m-account", screen: "mAccount", frames: pushIn(F + 4.2, F + 5.6), fixed: [STATUS] },
  { id: "m-password", screen: "mPassword", frames: pushIn(F + 5, F + 8), scroll: scroll(PT, [F + 5.5, F + 6.4, 260]), fixed: [STATUS] },
  { id: "m-prefs", screen: "mPrefs", frames: pushIn(F + 7.4) },
];
const TOUCHES: Touch[] = [
  { t: B + 1.05, x: 120, y: 277 },
  { t: B + 1.75, x: 120, y: 353 },
  { t: B + 2.85, x: 187, y: 480 },
  { t: B + 5.95, x: 108, y: 455 }, // Soaking Worship FM
  { t: B + 6.9, x: 120, y: 768 }, // the small player
  { t: B + 9.7, x: 243, y: 582 }, // about
  { t: B + 10.7, x: 328, y: 315 }, // close
  { t: B + 11.1, x: 345, y: 71 }, // share
  { t: B + 12, x: 327, y: 362 }, // close
  { t: B + 12.45, x: 305, y: 71 }, // chat
  { t: OPEN, x: 347, y: 217 }, // Library
  { t: E + 3.8, x: 105, y: 261 }, // Request Channel
];

// The mark, at the start ---------------------------------------------------

/** Drawn big in the middle, then flown into the laptop's own corner */
const MARK_W = 600;
const MARK_TO = (88.6 * LS) / MARK_W;
const MARK: Frame[] = [
  [0, { transform: "translate3d(0px, 0px, 0px) scale(1)", opacity: 1 }],
  [A - 0.95, { transform: "translate3d(0px, 0px, 0px) scale(1)" }, PUNCH],
  [LAND, { transform: `translate3d(${((124.3 - 720) * LS).toFixed(1)}px, ${((76.8 - 512) * LS).toFixed(1)}px, 0px) scale(${MARK_TO.toFixed(4)})`, opacity: 1 }],
  [LAND + 0.15, { opacity: 1 }],
  [LAND + 0.17, { opacity: 0 }],
];
const markBar = (i: number): Frame[] => [
  [0, { transform: "scaleY(0)" }],
  [0.1 + Math.abs(i - 2) * 0.07, { transform: "scaleY(0)" }, SPRING],
  ...dance(i + 3, 0.4 + Math.abs(i - 2) * 0.07, LAND, 0.19, 0.3),
];

const tracks: FilmScript["tracks"] = {
  camera: CAMERA,
  laptop: LAPTOP,
  phone: PHONE,
  lid: LID,
  dial: DIAL_IN,
  eq: [
    [0, { opacity: 0 }],
    [A, { opacity: 0 }, ENTER],
    [A + 0.6, { opacity: 1 }],
    [END, { opacity: 1 }, ENTER],
    [END + 0.4, { opacity: 0 }],
  ],
  strip: DIAL,
  mark: MARK,
  flame: [
    [0, { transform: "scale(0.1, 0)" }],
    [0.95, { transform: "scale(0.1, 0)" }, SPRING],
    [1.5, { transform: "scale(1, 1)" }],
  ],
  // Bars in the flame's own colour, until it's behind them; then cut out of it, down to the laptop's black
  "bars-hot": [
    [0, { opacity: 1 }],
    [1.02, { opacity: 1 }],
    [1.2, { opacity: 0 }],
  ],
  "bars-peach": [
    [0, { opacity: 0 }],
    [1.02, { opacity: 0 }],
    [1.2, { opacity: 1 }],
    [A - 0.7, { opacity: 1 }],
    [A - 0.2, { opacity: 0 }],
  ],
  "bars-dark": [
    [0, { opacity: 0 }],
    [A - 0.7, { opacity: 0 }],
    [A - 0.2, { opacity: 1 }],
  ],
  pointer: pointerFrames,
  "pointer-show": [
    [0, { opacity: 0 }],
    [A + 0.2, { opacity: 0 }, ENTER],
    [A + 0.4, { opacity: 1 }],
    [END, { opacity: 1 }, ENTER],
    [END + 0.15, { opacity: 0 }],
  ],
};
BARS.forEach((_, i) => ["hot", "peach", "dark"].forEach((k) => (tracks[`mark-${k}-${i}`] = markBar(i))));
LETTERS.forEach((_, i) => {
  const t = 1.25 + i * 0.035;
  tracks[`letter-${i}`] = [
    [0, { transform: "translateY(180px)" }],
    [t, { transform: "translateY(180px)" }, ENTER],
    [t + 0.55, { transform: "translateY(0px)" }],
  ];
});
for (let i = 0; i < EQ; i++) tracks[`eq-${i}`] = eqBar(i);
STATIONS.forEach((_, i) => (tracks[`station-${i}`] = station(i)));
CLICKS.forEach(([t], i) => {
  tracks[`click-${i}`] = [
    [0, { opacity: 0, transform: "scale(0.3)" }],
    [t - 0.01, { opacity: 0, transform: "scale(0.3)" }],
    [t, { opacity: 0.9, transform: "scale(0.3)" }, ENTER],
    [t + 0.4, { opacity: 0, transform: "scale(1)" }],
  ];
});
const addLayers = (layers: Layer[], pt: number) =>
  layers.forEach((l) => {
    tracks[`layer-${l.id}`] = l.frames;
    if (l.scroll) tracks[`scroll-${l.id}`] = l.scroll;
    Object.assign(tracks, uiTracks(l.id, l, pt));
    l.live?.forEach(([s, t, end], i) => Object.assign(tracks, liveTracks(`live-${l.id}-${i}`, s, t, end)));
    if (l.over) Object.assign(tracks, liveTracks(`over-${l.id}`, l.over, 0));
  });
addLayers(LAPTOP_LAYERS, LPT);
addLayers(PHONE_LAYERS, PT);
Object.assign(tracks, uiTracks("ui", { touches: TOUCHES }));

const script: FilmScript = {
  length: T,
  // Browsing, on both
  poster: D + 3.3,
  tones: [
    [0, "light"],
    [A + 0.6, "dark"],
    [B - 0.3, "light"],
    [C + 0.9, "dark"],
    [C + 3.7, "light"],
    [C + 5.5, "dark"],
    [D - 0.3, "light"],
    [E + 4, "dark"],
    [F - 0.3, "light"],
    [F + 1, "dark"],
    [F + 4.2, "light"],
    [F + 5.9, "dark"],
    [END - 0.4, "light"],
  ],
  tracks,
};

/** One page in a device: its picture, what moves on it, and what stays put while it scrolls */
function Page({ l, pt, w }: { l: Layer; pt: number; w: number }) {
  const s = revival[l.screen];
  const h = s.h * pt;
  const img = (key: string) => <Image key={key} src={s.src} alt="" width={w} height={h} sizes={w === SCREEN_W ? FILM_PHONE : FILM_DESKTOP} loading="eager" draggable={false} style={{ width: w, height: h }} />;
  const body = (
    <>
      {img("page")}
      {l.live?.map(([sc], i) => (
        <span key={i} className="rs-live" style={{ width: w, height: sc.size ? sc.size[1] * pt : (w / 375) * 812 }}>
          <LiveParts id={`live-${l.id}-${i}`} scene={sc} />
        </span>
      ))}
      <ScreenUI id={l.id} presses={l.presses} typing={l.typing} pt={pt} />
    </>
  );
  return (
    <div data-track={`layer-${l.id}`} className="rs-layer" style={{ width: w }}>
      {l.scroll ? (
        <div data-track={`scroll-${l.id}`} className="rs-scroll">
          {body}
        </div>
      ) : (
        body
      )}
      {l.scroll
        ? l.fixed?.map((box, i) => (
            <span key={i} className="rs-fixed" style={at(box, pt)}>
              <span style={{ position: "absolute", left: -box[0] * pt, top: -box[1] * pt }}>{img("fixed")}</span>
            </span>
          ))
        : null}
      {l.over ? (
        <span className="rs-live" style={{ width: w, height: l.over.size ? l.over.size[1] * pt : (w / 375) * 812 }}>
          <LiveParts id={`over-${l.id}`} scene={l.over} />
        </span>
      ) : null}
    </div>
  );
}

/**
 * Revival Stream as a short film: the front of a radio, tuned from one part of
 * the product to the next, on a laptop and an iPhone. Every click, touch,
 * keystroke and animation is the product's own.
 */
export default function RevivalFilm(props: FilmProps) {
  const { root, stage } = useFilm(script, props);
  return (
    <div ref={root} aria-hidden="true" className="film rs absolute inset-0 overflow-hidden">
      <div ref={stage} className="film-stage rs-stage" style={{ visibility: "hidden" }}>
        <div data-track="eq" className="rs-eq">
          {Array.from({ length: EQ }, (_, i) => (
            <span key={i} data-track={`eq-${i}`} />
          ))}
        </div>

        <div data-track="camera" className="rs-camera">
          <div data-track="laptop" className="rs-at">
            <div className="rs-laptop">
              <div data-track="lid" className="rs-lid">
                <span className="rs-cam" />
                <div className="rs-screen">
                  {LAPTOP_LAYERS.map((l) => (
                    <Page key={l.id} l={l} pt={LPT} w={1440 * LPT} />
                  ))}
                  <span data-track="pointer-show" className="rs-pointer-show">
                    {CLICKS.map(([, x, y], i) => (
                      <span key={i} data-track={`click-${i}`} className="rs-click" style={{ left: x * LPT, top: y * LPT }} />
                    ))}
                    <span data-track="pointer" className="rs-pointer">
                      <svg viewBox="0 0 24 28" width="26" height="30">
                        <path d="M3 2.5v19.2l4.9-4.6 3 7.1 3.6-1.5-3-7h6.7z" fill="#0b0b0c" stroke="#fff" strokeWidth="1.8" strokeLinejoin="round" />
                      </svg>
                    </span>
                  </span>
                </div>
              </div>
              <div className="rs-base">
                <span />
              </div>
            </div>
          </div>

          <div data-track="phone" className="rs-at">
            <div className="yo-phone">
              <span className="yo-button" style={{ left: -358, top: -430, height: 62 }} />
              <span className="yo-button" style={{ left: -358, top: -324, height: 116 }} />
              <span className="yo-button" style={{ left: -358, top: -186, height: 116 }} />
              <span className="yo-button" style={{ left: 352, top: -290, height: 176 }} />
              <span className="yo-frame" />
              <span className="fp-bezel" />
              <div className="fp-screen" style={{ height: SCREEN_H }}>
                {PHONE_LAYERS.map((l) => (
                  <Page key={l.id} l={l} pt={PT} w={SCREEN_W} />
                ))}
                <span className="fp-island" />
                <Touches id="ui" touches={TOUCHES} />
              </div>
            </div>
          </div>

          <div data-track="mark" className="rs-mark" style={{ width: MARK_W, marginLeft: -MARK_W / 2, marginTop: (-MARK_W * LOCKUP[1]) / LOCKUP[0] / 2 }}>
            <svg viewBox={`0 0 ${LOCKUP[0]} ${LOCKUP[1]}`}>
              <clipPath id="rs-film-0">
                <rect x="500" y="160" width="700" height="166" />
              </clipPath>
              <clipPath id="rs-film-1">
                <rect x="500" y="330" width="700" height="166" />
              </clipPath>
              <path data-track="flame" d={FLAME} fill="#ea4609" style={inPlace("50% 100%")} />
              {(
                [
                  ["hot", "#ea4609"],
                  ["peach", PEACH],
                  ["dark", "#141414"],
                ] as const
              ).map(([k, fill]) => (
                <g key={k} data-track={`bars-${k}`}>
                  {BARS.map(([x, y, w, h], i) => (
                    <rect key={i} data-track={`mark-${k}-${i}`} x={x} y={y} width={w} height={h} rx={w / 2} fill={fill} style={inPlace("50% 50%")} />
                  ))}
                </g>
              ))}
              {([0, 1] as const).map((line) => (
                <g key={line} clipPath={`url(#rs-film-${line})`}>
                  {LETTERS.map((x, i) => (x.line === line ? <path key={i} data-track={`letter-${i}`} d={x.d} fill="#fff" /> : null))}
                </g>
              ))}
            </svg>
          </div>
        </div>

        <div data-track="dial" className="rs-dial">
          <div data-track="strip" className="rs-strip">
            {STATIONS.map((name, i) => (
              <span key={name} data-track={`station-${i}`} style={{ left: STAGE_W / 2 + i * STATION_GAP }}>
                {name}
              </span>
            ))}
          </div>
          <span className="rs-needle" />
        </div>
      </div>
    </div>
  );
}
