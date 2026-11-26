import { ENTER, SHEET, type Frame } from "@/components/case-study/film/kit";
import { type LiveScene, type Part, type PtBox, type Sprite } from "@/components/case-study/live/kit";
import { iexcelo as ix } from "@/content/iexcelo";

/**
 * iExcelo's screens that move. The feature illustrations and the hero are the Figma file's own vectors and
 * images, taken apart so each piece can move; the success seal is the LottieFiles animation from the file.
 */

const SPRING = "cubic-bezier(0.34, 1.56, 0.64, 1)";
const SOFT = "cubic-bezier(0.37, 0, 0.63, 1)";
const F = "/work/iexcelo-web";
const RED = "#e5243b";

/** One transform shape everywhere, so every keyframe interpolates the same functions */
const T = (x = 0, y = 0, r = 0, s = 1): Keyframe => ({ transform: `translate(${x}%, ${y}%) rotate(${r}deg) scale(${s})` });
const REST = T();

/** Keys of one cycle (times within 0..period, first and last the same), repeated from `from` until `to` */
const cycle = (keys: [number, Keyframe][], period: number, from: number, to: number): Frame[] => {
  const out: Frame[] = [];
  for (let n = 0; from + n * period < to - 0.01; n++) keys.forEach(([t, k]) => {
    const at = Math.round((from + n * period + t) * 1000) / 1000;
    if (at <= to) out.push([at, k, SOFT]);
  });
  return out;
};

/** Pops in from nothing */
const pop = (t: number, from = 0, d = 0.5): Frame[] => [
  [0, { ...T(0, 0, 0, from), opacity: 0 }],
  [t, { ...T(0, 0, 0, from), opacity: 0 }, SPRING],
  [t + 0.06, { opacity: 1 }],
  [t + d, T()],
];
/** Rises into place inside its own box */
const rise = (t: number, d = 0.7, from = 104): Frame[] => [
  [0, T(0, from)],
  [t, T(0, from), SHEET],
  [t + d, T()],
];
/** A cover that slides away to one side, uncovering what's under it */
const uncover = (t: number, d: number): Frame[] => [
  [0, { transform: "scaleX(1)" }],
  [t, { transform: "scaleX(1)" }, SHEET],
  [t + d, { transform: "scaleX(0)" }],
];
const fadeOut = (t: number, d = 0.25): Frame[] => [
  [0, { opacity: 1 }],
  [t, { opacity: 1 }, ENTER],
  [t + d, { opacity: 0 }],
];

// The three feature cards -------------------------------------------------

/** Where each card's illustration sits on the homepage, and its pieces in the card's own 395×244 */
export const CARD_X = [112, 522.67, 933.33];
export const CARD_Y = 2831;
const PIECES: Record<string, PtBox> = {
  "c1-rings-in": [56.1, 98.8, 280.9, 145.2],
  "c1-core": [112.5, 151.2, 169.2, 92.8],
  "c1-waec": [5, 63, 117, 77],
  "c1-sat": [168, 26, 58, 39.5],
  "c1-neco": [313, 83, 82, 78],
  "c1-jamb": [162, 173, 70, 67],
  "c2-money": [56.8, 26.8, 301.6, 203.7],
  "c2-n1": [97.3, 26.8, 62.2, 48.9],
  "c2-n2": [299.9, 157.6, 58.5, 33.8],
  "c2-n3": [56.8, 117.4, 58.5, 33.8],
  "c2-n4": [239, 33, 47.3, 51.4],
  "c3-gift": [99.6, 72.3, 124.1, 131.9],
  "c3-tagp": [172.9, 24.9, 49.7, 44.2],
  "c3-spark1": [236.3, 44.6, 21.9, 20.1],
  "c3-spark2": [86, 104, 22, 21.9],
};

/**
 * The cards' illustrations, at (ox, oy) on the page. With `build`, each one assembles itself from that moment;
 * after that (or straight away, without one) they keep moving gently until `until`.
 */
export function cardParts(oy: number, build: number | null, until: number, xs = CARD_X): Part[] {
  const b = build ?? -10;
  const on = build !== null;
  const at = (card: number, k: string, frames: Frame[], origin = "50% 50%"): Part => {
    const [x, y, w, h] = PIECES[k]!;
    return { id: k, box: [xs[card]! + x, oy + y, w, h], img: `${F}/card-${k}.webp`, origin, frames };
  };
  const plate = (card: number): Part => ({ id: `c${card + 1}-plate`, box: [xs[card]!, oy, 395, 244], img: `${F}/card-c${card + 1}-plate.webp`, r: 12 });
  // The motion starts once the build is over
  const live = (keys: [number, Keyframe][], period: number, start: number, buildFrames: Frame[]): Frame[] => [...buildFrames, ...cycle(keys, period, Math.max(start, ...buildFrames.map((f) => f[0])), until)];
  const bob = (dy: number, period: number, phase = 0): [number, Keyframe][] => [
    [0, T(0, 0)],
    [period * (0.25 + phase), T(0, -dy)],
    [period * (0.75 + phase), T(0, dy * 0.4)],
    [period, T(0, 0)],
  ];

  // Master Every Question: the rings rise, the exams arrive one by one, then float
  const c1t = b;
  const card1: Part[] = [
    plate(0),
    { id: "c1-clip", box: [xs[0]!, oy, 395, 244], clip: true, r: 12, parts: [at(0, "c1-rings-in", on ? rise(c1t, 0.8, 100) : [[0, REST]], "50% 100%"), at(0, "c1-core", on ? rise(c1t + 0.15, 0.8, 100) : [[0, REST]], "50% 100%")] },
    at(0, "c1-waec", live([[0, T(0, 0, 0)], [1.1, T(0, -5, -4)], [2.4, T(0, 3, 3)], [3.2, T(0, 0, 0)]], 3.2, on ? c1t + 1.1 : 0, on ? pop(c1t + 0.5) : [])),
    at(0, "c1-sat", live(bob(8, 2.8), 2.8, on ? c1t + 1.2 : 0.3, on ? pop(c1t + 0.62) : [])),
    at(0, "c1-neco", live([[0, T(0, 0, 0)], [1.3, T(0, -6, 4)], [2.6, T(0, 2, -2)], [3.6, T(0, 0, 0)]], 3.6, on ? c1t + 1.3 : 0.6, on ? pop(c1t + 0.74) : [])),
    at(0, "c1-jamb", live([[0, T(0, 0, 0, 1)], [1.2, T(0, -3, 0, 1.06)], [2.4, T(0, 0, 0, 1)]], 2.4, on ? c1t + 1.6 : 0, on ? pop(c1t + 0.95, 0, 0.6) : []), "50% 60%"),
  ];

  // Support Students: the money lands, the notes fly out of the bag and flutter
  const c2t = b + 0.35;
  const note = (k: string, dx: number, dy: number, rot: number, phase: number): Part =>
    at(1, k, [
      ...(on
        ? ([
            [0, { ...T(dx, dy, rot * 3, 0.4), opacity: 0 }],
            [c2t + 0.6, { ...T(dx, dy, rot * 3, 0.4), opacity: 0 }, "cubic-bezier(0.2, 0.8, 0.3, 1)"],
            [c2t + 0.66, { opacity: 1 }],
            [c2t + 1.3, T()],
          ] as Frame[])
        : []),
      ...cycle(
        [
          [0, T(0, 0, 0)],
          [0.9 + phase, T(4, -10, rot)],
          [2 + phase, T(-3, 6, -rot * 0.6)],
          [3.2, T(0, 0, 0)],
        ],
        3.2,
        on ? c2t + 1.3 : 0,
        until,
      ),
    ]);
  const card2: Part[] = [
    plate(1),
    { id: "c2-clip", box: [xs[1]!, oy, 395, 244], clip: true, r: 12, parts: [at(1, "c2-money", live(bob(2.5, 2.6), 2.6, on ? c2t + 0.8 : 0, on ? rise(c2t, 0.8, 70) : []), "50% 100%")] },
    note("c2-n1", 120, 120, -14, 0),
    note("c2-n2", -160, -60, 12, 0.3),
    note("c2-n3", 150, -20, -10, 0.15),
    note("c2-n4", -60, 140, 16, 0.45),
  ];

  // Earn as You Share: the gift drops in and hops, the tag swings, the sparks twinkle
  const c3t = b + 0.7;
  const hop: [number, Keyframe][] = [
    [0, T(0, 0, 0, 1)],
    [1.5, T(0, 0, 0, 1)],
    [1.68, T(0, 2, 0, 0.97)],
    [1.9, T(0, -9, -2, 1.02)],
    [2.15, T(0, 0, 0, 1)],
    [2.6, T(0, 0, 0, 1)],
  ];
  const twinkle = (phase: number): [number, Keyframe][] => [
    [0, { ...T(0, 0, 0, 1), opacity: 1 }],
    [0.6 + phase, { ...T(0, 0, 25, 0.55), opacity: 0.4 }],
    [1.3 + phase, { ...T(0, 0, 0, 1.12), opacity: 1 }],
    [2, { ...T(0, 0, 0, 1), opacity: 1 }],
  ];
  const card3: Part[] = [
    plate(2),
    at(
      2,
      "c3-gift",
      [
        ...(on
          ? ([
              [0, { ...T(0, -160, 0, 1), opacity: 0 }],
              [c3t, { ...T(0, -160, 0, 1), opacity: 0 }, "cubic-bezier(0.5, 0, 0.9, 0.5)"],
              [c3t + 0.05, { opacity: 1 }],
              [c3t + 0.4, T(0, 0, 0, 1)],
              [c3t + 0.52, T(0, 3, 0, 0.94), "cubic-bezier(0.2, 0.6, 0.4, 1)"],
              [c3t + 0.75, T(0, -6, 0, 1.02)],
              [c3t + 0.95, T(0, 0, 0, 1)],
            ] as Frame[])
          : []),
        ...cycle(hop, 2.6, on ? c3t + 0.95 : 0, until),
      ],
      "50% 100%",
    ),
    at(2, "c3-tagp", live([[0, T(0, 0, 0)], [1.1, T(0, 0, 12)], [2.2, T(0, 0, -8)], [3, T(0, 0, 0)]], 3, on ? c3t + 1.1 : 0, on ? pop(c3t + 0.6) : []), "80% 10%"),
    at(2, "c3-spark1", live(twinkle(0), 2, on ? c3t + 1 : 0, on ? pop(c3t + 0.75) : [])),
    at(2, "c3-spark2", live(twinkle(0.3), 2, on ? c3t + 1.2 : 0.4, on ? pop(c3t + 0.85) : [])),
  ];
  return [...card1, ...card2, ...card3];
}

// The hero ------------------------------------------------------------------

const HX: Record<string, PtBox> = {
  dash: [210.5, 773.5, 995, 350.5],
  chart: [101, 946, 258.6, 168.2],
  pie: [1144, 870, 195.3, 245],
  s3: [1063.76, 167, 256.86, 283],
  s1: [1023.1, 449, 304.91, 314],
  s2: [753.78, 335.88, 261.1, 252.12],
  a1: [921.1, 243.7, 135.4, 83.4],
  a2: [1272.3, 377.7, 72.3, 92.2],
  a3: [900, 575.2, 123.6, 59.6],
  head: [109, 312.7, 591.7, 244.4],
  btn: [108, 576.5, 162, 56],
};
const hx = (k: string, frames: Frame[], origin?: string): Part => ({ id: `hx-${k}`, box: HX[k]!, img: `${F}/hx-${k}.webp`, frames, origin });
/** A hand-drawn arrow, drawn from where it starts */
const drawOn = (t: number, from: "left" | "right" | "bottom"): Frame[] => {
  const hidden = from === "left" ? "inset(0 100% 0 0)" : from === "right" ? "inset(0 0 0 100%)" : "inset(100% 0 0 0)";
  return [
    [0, { clipPath: hidden }],
    [t, { clipPath: hidden }, SHEET],
    [t + 0.6, { clipPath: "inset(0 0 0 0)" }],
  ];
};

/** The hero builds: words, button, students, arrows, then the dashboard rises and its numbers come in */
export function heroParts(t: number, dashAt = t + 1.6): Part[] {
  return [
    { id: "hx-plate", box: [0, 0, 1440, 1124], img: `${F}/hx-plate.webp` },
    { id: "hx-head-clip", box: [100, 300, 610, 270], clip: true, parts: [hx("head", rise(t, 0.8, 70))] },
    hx("btn", pop(t + 0.45, 0.6)),
    hx("s3", pop(t + 0.3, 0.2, 0.6)),
    hx("s2", pop(t + 0.45, 0.2, 0.6)),
    hx("s1", pop(t + 0.6, 0.2, 0.6)),
    hx("a1", drawOn(t + 0.85, "right")),
    hx("a2", drawOn(t + 1, "bottom")),
    hx("a3", drawOn(t + 1.15, "right")),
    // The dashboard comes up from below the fold, its chart draws and the pie turns into place
    {
      id: "hx-dash-clip",
      box: [150, 700, 1140, 424],
      clip: true,
      parts: [
        hx("dash", [
          [0, { ...T(0, 70), opacity: 0 }],
          [dashAt, { ...T(0, 70), opacity: 0 }, SHEET],
          [dashAt + 0.1, { opacity: 1 }],
          [dashAt + 0.8, T()],
        ]),
      ],
    },
    hx("chart", pop(dashAt + 0.55, 0.85)),
    { id: "hx-plot", box: [128, 970, 224, 96], bg: "#fff", origin: "100% 50%", frames: uncover(dashAt + 0.9, 1.1) },
    hx("pie", pop(dashAt + 0.7, 0.85)),
    { id: "hx-pie-ground", box: [1176, 953, 104, 104], bg: "#fff", r: "50%", frames: fadeOut(dashAt + 1.1, 0.05) },
    {
      id: "hx-pie-turn",
      box: [1178, 955, 100, 100],
      slice: ix.hero.src,
      sliceSize: [1440, 1124],
      r: "50%",
      frames: [
        [0, { ...T(0, 0, -200, 0.5), opacity: 0 }],
        [dashAt + 1.05, { ...T(0, 0, -200, 0.5), opacity: 0 }, "cubic-bezier(0.2, 0.7, 0.2, 1)"],
        [dashAt + 1.1, { opacity: 1 }],
        [dashAt + 1.9, T()],
      ],
    },
  ];
}

// The dashboard -----------------------------------------------------------------

const slice = (id: string, box: PtBox, src: string, frames: Frame[], extra: Partial<Part> = {}): Part => ({ id, box, slice: src, sliceSize: [1440, 1024], frames, ...extra });
const cover = (id: string, box: PtBox, until: number, bg = "#fff", extra: Partial<Part> = {}): Part => ({ id, box, bg, frames: until < 90 ? fadeOut(until, 0.05) : undefined, ...extra });

/** The dashboard comes together: the banner, the numbers rolling up, the chart drawing, the exams popping in */
export function dashParts(t: number): Part[] {
  const d = ix.dash.src;
  const number = (i: number, x: number, w: number): Part[] => [
    cover(`dn-ground-${i}`, [x, 448, w, 42], 99),
    { id: `dn-clip-${i}`, box: [x, 448, w, 42], clip: true, parts: [slice(`dn-${i}`, [x, 448, w, 42], d, rise(t + 0.55 + i * 0.15, 0.6, 110))] },
  ];
  const TILES: [number, number][] = [
    [1067, 605],
    [1238, 605],
    [1067, 718],
    [1238, 718],
    [1067, 832],
    [1238, 832],
  ];
  return [
    cover("db-ground", [300, 150, 1112, 172], t + 0.05),
    slice("db", [304, 155, 1104, 162], d, [
      [0, { ...T(0, 18), opacity: 0 }],
      [t, { ...T(0, 18), opacity: 0 }, SHEET],
      [t + 0.1, { opacity: 1 }],
      [t + 0.6, T()],
    ], { r: 10 }),
    ...number(0, 320, 70),
    ...number(1, 693, 70),
    ...number(2, 1067, 90),
    { id: "d-plot", box: [362, 645, 660, 296], bg: "#fff", origin: "100% 50%", frames: uncover(t + 0.8, 1.3) },
    ...TILES.flatMap(([x, y], i): Part[] => [cover(`dt-ground-${i}`, [x - 2, y - 2, 158, 107], t + 1 + i * 0.09), slice(`dt-${i}`, [x, y, 154, 103], d, pop(t + 1 + i * 0.09, 0.6, 0.45), { r: 8 })]),
  ];
}

// Submitted -------------------------------------------------------------------

const SEAL: Sprite = { src: "/work/motion/done-seal.webp", cols: 8, rows: 8, frames: 61, fps: 25, box: [657, 132, 126, 114] };
export function submittedParts(t: number): Part[] {
  return [
    { id: "seal-ground", box: [655, 130, 130, 118], bg: "#fff" },
    { id: "seal", box: SEAL.box, sprite: SEAL, frames: [[0, { opacity: 0 }], [t - 0.01, { opacity: 0 }], [t, { opacity: 1 }]] },
    cover("score-ground", [920, 436, 116, 52], 99),
    { id: "score-clip", box: [920, 436, 116, 52], clip: true, parts: [slice("score", [920, 436, 116, 52], ix.submitted.src, rise(t + 0.7, 0.6, 110))] },
  ];
}
export const SEAL_SPRITE = SEAL;

// Pen marks -------------------------------------------------------------------

/** A loop drawn round something, a little more than once round, like a marker would */
export const loopPath = (w: number, h: number) => {
  const cx = w / 2, cy = h / 2, rx = w / 2 - 4, ry = h / 2 - 4;
  const pts: string[] = [];
  for (let i = 0; i <= 44; i++) {
    const a = -2.2 + (i / 44) * Math.PI * 2.15;
    const k = 1 + 0.06 * Math.sin(i / 6);
    pts.push(`${(cx + Math.cos(a) * rx * k).toFixed(1)} ${(cy + Math.sin(a) * ry * k).toFixed(1)}`);
  }
  return `M${pts.join(" L")}`;
};
export const TICK = "M4 22 L16 34 L44 4";

/** A mark drawn by the pen at `t`, in the page's points */
export const mark = (id: string, box: PtBox, d: string, viewBox: string, t: number, dur = 0.55, width = 4): Part => ({
  id,
  box,
  inner: {
    draw: [
      [0, { strokeDashoffset: 1 }],
      [t, { strokeDashoffset: 1 }, "cubic-bezier(0.45, 0, 0.3, 1)"],
      [t + dur, { strokeDashoffset: 0 }],
    ],
  },
  node: (track) => (
    <svg viewBox={viewBox} preserveAspectRatio="none">
      <path {...track("draw")} d={d} stroke={RED} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" fill="none" pathLength={1} strokeDasharray="1 1.1" vectorEffect="non-scaling-stroke" />
    </svg>
  ),
});

// On the project page -------------------------------------------------------------

const DESK: [number, number] = [1440, 1024];
const heroScene: LiveScene = { length: 3.8, size: [1440, 1124], parts: heroParts(0.15, 1.5) };
const featuresScene: LiveScene = { length: 31.2, loop: true, still: 0.01, size: DESK, parts: cardParts(CARD_Y - 2460, null, 31.2) };
const dashScene: LiveScene = { length: 2.4, size: DESK, parts: dashParts(0.2) };
const submittedScene: LiveScene = { length: 3, size: DESK, parts: submittedParts(0.2) };
const homeScene: LiveScene = { length: 31.2, loop: true, still: 0.01, size: [1440, 5985], parts: cardParts(CARD_Y, null, 31.2) };

export const iexceloScenes: Record<string, LiveScene> = {
  [ix.hero.src]: heroScene,
  [ix.features.src]: featuresScene,
  [ix.dash.src]: dashScene,
  [ix.submitted.src]: submittedScene,
  [ix.home.src]: homeScene,
};

