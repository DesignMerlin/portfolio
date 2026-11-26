import { ENTER, SHEET, type Frame } from "@/components/case-study/film/kit";
import { type LiveScene, type Part, type PtBox } from "@/components/case-study/live/kit";
import { voxdeed as vx } from "@/content/voxdeed";

/**
 * Voxdeed's landing page, moving. The hero window, the vault card and the floating feature cards are the Figma
 * file's own vectors, rendered with their moving pieces taken out (the plates) and each piece on its own.
 * Every function takes `oy`: where its scene starts on the page, so the same parts serve the whole page (in
 * the film) and a single section (on the project page). Boxes are in the page's points.
 */

const F = "/work/voxdeed";
const SPRING = "cubic-bezier(0.34, 1.56, 0.64, 1)";
const SOFT = "cubic-bezier(0.37, 0, 0.63, 1)";
const RED = "rgb(240 64 82)";

/** One transform shape everywhere, so every keyframe interpolates the same functions */
const T = (x = 0, y = 0, r = 0, s = 1): Keyframe => ({ transform: `translate(${x}%, ${y}%) rotate(${r}deg) scale(${s})` });

/** Keys of one cycle (times within 0..period, first and last the same), repeated from `from` until `to` */
const cycle = (keys: [number, Keyframe][], period: number, from: number, to: number, ease = SOFT): Frame[] => {
  const out: Frame[] = [];
  for (let n = 0; from + n * period < to - 0.01; n++)
    keys.forEach(([t, k]) => {
      const at = Math.round((from + n * period + t) * 1000) / 1000;
      if (at <= to) out.push([at, k, ease]);
    });
  return out;
};
/** Pops in from nothing */
const pop = (t: number, from = 0.6, d = 0.5): Frame[] => [
  [0, { ...T(0, 0, 0, from), opacity: 0 }],
  [t, { ...T(0, 0, 0, from), opacity: 0 }, SPRING],
  [t + 0.08, { opacity: 1 }],
  [t + d, T()],
];
/** Slides up into place, fading in */
const slideUp = (t: number, dy = 24, d = 0.6): Frame[] => [
  [0, { ...T(0, dy), opacity: 0 }],
  [t, { ...T(0, dy), opacity: 0 }, SHEET],
  [t + 0.12, { opacity: 1 }],
  [t + d, T()],
];
const fadeOut = (t: number, d = 0.2): Frame[] => [
  [0, { opacity: 1 }],
  [t, { opacity: 1 }, ENTER],
  [t + d, { opacity: 0 }],
];
const at = (box: PtBox, oy: number): PtBox => [box[0], box[1] - oy, box[2], box[3]];
const img = (id: string, box: PtBox, oy: number, frames: Frame[] | undefined, extra: Partial<Part> = {}): Part => ({ id, box: at(box, oy), img: `${F}/${id}.webp`, frames, ...extra });
/** Starts after a build ends (or straight away without one) and repeats until `until` */
const after = (build: Frame[], keys: [number, Keyframe][], period: number, start: number, until: number, ease?: string): Frame[] => [
  ...build,
  ...cycle(keys, period, Math.max(start, ...build.map((f) => f[0])), until, ease),
];

// The hero: a voice note becomes a contract -------------------------------------------

const HERO: Record<string, PtBox> = {
  "hx-plate": [323, 644, 768, 511],
  "hx-voice": [861, 708, 195.7, 113],
  "hx-proc": [356, 778, 252.4, 164.5],
  "hx-contract": [356, 925, 337, 205.9],
  "hx-badge": [968.4, 1011.4, 172.6, 172.6],
};

/**
 * In the VoiceContract AI window: the voice note arrives, the AI works through its three steps (each ticks in),
 * the contract rises ready to sign, and the 60-seconds badge turns. Starts at `t`; the badge keeps turning
 * until `until`.
 */
export function heroParts(t: number, until: number, oy = 0): Part[] {
  const rows = [0, 1, 2].map((i): Part => ({
    id: `hx-row-${i}`,
    box: at([393, 836.5 + i * 23.4, 150, 23.4], oy),
    bg: "#000",
    frames: fadeOut(t + 1.05 + i * 0.38, 0.18),
  }));
  return [
    img("hx-plate", HERO["hx-plate"]!, oy, undefined, { r: 16 }),
    img("hx-voice", HERO["hx-voice"]!, oy, [
      [0, { ...T(14, 30, 0, 0.9), opacity: 0 }],
      [t, { ...T(14, 30, 0, 0.9), opacity: 0 }, SPRING],
      [t + 0.1, { opacity: 1 }],
      [t + 0.55, T()],
    ], { origin: "100% 100%" }),
    img("hx-proc", HERO["hx-proc"]!, oy, pop(t + 0.7, 0.85), { origin: "0% 0%", parts: rows }),
    img("hx-contract", HERO["hx-contract"]!, oy, slideUp(t + 2.35, 26, 0.7)),
    img("hx-badge", HERO["hx-badge"]!, oy, [
      ...pop(t + 0.3, 0.3, 0.6),
      // A slow turn, like a stopwatch
      ...cycle([[0, T(0, 0, 0)], [12, T(0, 0, 360)]], 12, t + 0.9, until, "linear"),
    ]),
  ];
}

// How it works: three steps ----------------------------------------------------------------

const CARD = (i: number): PtBox => [112 + i * 416, 1521, 384, 531];
const MIC: [number, number] = [377.5, 1946.5];
const CHIP: [number, number] = [719.5, 1612];
const SHIELD: [number, number] = [1136, 1845.5];
const VAULT: Record<string, PtBox> = {
  "vx-plate": [938.7, 1517.3, 395, 542],
  "vx-i1": [1193.2, 1667.8, 91, 91],
  "vx-i2": [983.2, 1764.8, 91, 91],
  "vx-i3": [961.2, 1908.8, 91, 91],
  "vx-i4": [1228.2, 1891.8, 91, 91],
};

/** A ring that leaves a point and widens out, fading, every `period` seconds */
const ripple = (id: string, [cx, cy]: [number, number], d: number, oy: number, from: number, until: number, period: number, phase: number, grow = 1.7): Part => ({
  id,
  box: at([cx - d / 2, cy - d / 2, d, d], oy),
  r: "50%",
  border: `2px solid ${RED}`,
  frames: cycle(
    [
      [0, { ...T(0, 0, 0, 1), opacity: 0 }],
      [0.05, { ...T(0, 0, 0, 1), opacity: 0.75 }],
      [period * 0.8, { ...T(0, 0, 0, grow), opacity: 0 }],
      [period, { ...T(0, 0, 0, grow), opacity: 0 }],
    ],
    period,
    from + phase,
    until,
    "cubic-bezier(0.2, 0.6, 0.3, 1)",
  ),
});

/**
 * The three steps, alive: sound leaves the microphone in rings, the AI chip glows as it thinks, and in the
 * vault the four icons circle the shield while it pings. From `from` until `until`; with `build`, the vault's
 * icons pop in first.
 */
export function stepsParts(from: number, until: number, oy = 0, build: number | null = null): Part[] {
  const clip = (i: number, parts: Part[]): Part => ({ id: `st-clip-${i}`, box: at(CARD(i), oy), clip: true, r: 24, parts });
  const orbit = (k: string, phase: number, dx: number, dy: number): Part => {
    const keys: [number, Keyframe][] = [
      [0, T(0, 0)],
      [1.2, T(dx, -dy)],
      [2.4, T(dx * 2, 0)],
      [3.6, T(dx, dy)],
      [4.8, T(0, 0)],
    ];
    const pop0 = build === null ? [] : pop(build + phase * 0.6, 0.3, 0.55);
    return img(k, VAULT[k]!, oy, after(pop0, keys, 4.8, from + phase, until));
  };
  return [
    clip(0, [0, 1, 2].map((i) => ripple(`st-mic-${i}`, MIC, 300, oy, from, until, 2.4, i * 0.8, 1.55))),
    clip(1, [
      {
        id: "st-chip-glow",
        box: at([CHIP[0] - 170, CHIP[1] - 170, 340, 340], oy),
        bg: "radial-gradient(closest-side, rgb(255 70 96 / 0.55), rgb(255 70 96 / 0.15) 60%, transparent)",
        frames: cycle(
          [
            [0, { ...T(0, 0, 0, 0.85), opacity: 0.2 }],
            [1.2, { ...T(0, 0, 0, 1.08), opacity: 0.9 }],
            [2.4, { ...T(0, 0, 0, 0.85), opacity: 0.2 }],
          ],
          2.4,
          from,
          until,
        ),
      },
    ]),
    img("vx-plate", VAULT["vx-plate"]!, oy, undefined),
    ripple("st-shield-0", SHIELD, 211, oy, from, until, 3.2, 0, 1.6),
    ripple("st-shield-1", SHIELD, 211, oy, from, until, 3.2, 1.6, 1.6),
    orbit("vx-i1", 0, 3, 4),
    orbit("vx-i2", 0.4, -3, 4),
    orbit("vx-i3", 0.8, 3, -4),
    orbit("vx-i4", 1.2, -3, -4),
  ];
}

// Features: the floating cards -------------------------------------------------------------

const FEAT: Record<string, PtBox> = {
  "fx-plate": [112, 2178.7, 1273, 1113],
  "fx-review": [112, 2268.2, 321.1, 257.1],
  "fx-signed": [1112.3, 2263.2, 272.7, 198.1],
  "fx-icons": [1123.6, 2782.8, 261.4, 271.5],
  "fx-upload": [1019.8, 2845.8, 195.2, 208.1],
  "fx-supply": [112, 2816.8, 346.1, 243.3],
};

/** The cards round the headline float, each at its own pace. With `build`, they fly in from the edges first */
export function featureParts(from: number, until: number, oy = 0, build: number | null = null): Part[] {
  const card = (k: string, i: number, dx: number, dy: number, rot: number, inFrom: [number, number]): Part => {
    const keys: [number, Keyframe][] = [
      [0, T(0, 0, 0)],
      [1.6 + i * 0.2, T(dx, -dy, rot)],
      [3.3 + i * 0.1, T(-dx * 0.6, dy * 0.6, -rot * 0.6)],
      [5, T(0, 0, 0)],
    ];
    const enter: Frame[] =
      build === null
        ? []
        : [
            [0, { ...T(inFrom[0], inFrom[1], rot * 4, 0.9), opacity: 0 }],
            [build + i * 0.12, { ...T(inFrom[0], inFrom[1], rot * 4, 0.9), opacity: 0 }, "cubic-bezier(0.16, 1, 0.3, 1)"],
            [build + i * 0.12 + 0.1, { opacity: 1 }],
            [build + i * 0.12 + 0.9, T()],
          ];
    return img(k, FEAT[k]!, oy, after(enter, keys, 5, from + i * 0.3, until));
  };
  return [
    img("fx-plate", FEAT["fx-plate"]!, oy, undefined),
    card("fx-review", 0, 2, 4, -2, [-90, -20]),
    card("fx-signed", 1, -2, 5, 2, [90, -30]),
    card("fx-supply", 2, 3, 3, 1.5, [-90, 30]),
    card("fx-upload", 3, -3, 4, -2, [80, 40]),
    card("fx-icons", 4, 2, 5, 3, [90, 20]),
  ];
}

// On the project page -------------------------------------------------------------------------

const LOOP = 28.8;
const heroScene: LiveScene = { length: 4.4, size: [1440, 1236], parts: heroParts(0.25, 4.4) };
const stepsScene: LiveScene = { length: LOOP, loop: true, still: 0.01, size: [1440, 912], parts: stepsParts(0, LOOP, 1236) };
const featuresScene: LiveScene = { length: 30, loop: true, still: 0.01, size: [1440, 985], parts: featureParts(0, 30, 2148) };

export const voxdeedScenes: Record<string, LiveScene> = {
  [vx.hero.src]: heroScene,
  [vx.steps.src]: stepsScene,
  [vx.features.src]: featuresScene,
};
