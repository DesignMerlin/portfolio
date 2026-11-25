/**
 * The vocabulary every project film is written in: frames on a timeline, in
 * seconds, and the moves they're made of. ./use-film.ts runs them; ./film.tsx is the one-phone scene.
 */

import type { LiveScene } from "@/components/case-study/live/kit";

/** Films are laid out at this size and scaled to fit their card */
export const STAGE_W = 1184;
export const STAGE_H = 1032;
/** App screens are 375×812 points; a film phone's screen is this wide */
export const SW = 324;
export const SH = 702;
export const K = SW / 375;

export type Frame = [at: number, style: Keyframe, easing?: string];
export type ScreenLayer = { id: string; src: string; frames: Frame[]; live?: { scene: LiveScene; t: number } };
export type Tap = { x: number; y: number; t: number };
/**
 * An exact crop of a screen that lifts off it. Box in screen points: where it sits before it lifts.
 * Pieces shown enlarged are laid out `up` times bigger and start scaled down, so they stay sharp.
 */
export type Piece = { src: string; box: [x: number, y: number, w: number, h: number]; radius: number; up?: number; frames: Frame[] };
export type FilmPhone = { track: Frame[]; screens: ScreenLayer[]; taps: Tap[]; pieces: Piece[]; glare: Frame[] };
export type Storyboard = {
  /** One loop, in seconds */
  length: number;
  /** The frame shown when the film isn't playing */
  poster: number;
  fade: Frame[];
  shadow: Frame[];
  phone: FilmPhone;
  /** Colour of the shadows, as rgb numbers: "6 46 22" */
  shade: string;
};

// The site's curves (styles/tokens.css), plus one long in-out for camera moves
export const ENTER = "cubic-bezier(0.23, 1, 0.32, 1)";
export const SHEET = "cubic-bezier(0.32, 0.72, 0, 1)";
export const CAMERA = "cubic-bezier(0.6, 0, 0.2, 1)";
export const DRIFT = "cubic-bezier(0.4, 0, 0.6, 1)";
export const DIVE = "cubic-bezier(0.5, 0, 0.75, 0.6)";

export const pose = (x: number, y: number, z: number, rx: number, ry: number, rz: number): Keyframe => ({
  transform: `translate3d(${x}px, ${y}px, ${z}px) rotateX(${rx}deg) rotateY(${ry}deg) rotateZ(${rz}deg)`,
});
export const at = (x: number, y: number, z: number, scale = 1): string => `translate3d(${x}px, ${y}px, ${z}px) scale(${scale})`;

/** There from the start */
export const still: Frame[] = [[0, { transform: "translateX(0)" }]];

/** A screen pushed in from the right; it stays underneath whatever comes after it */
export const push = (t: number): Frame[] => [
  [0, { transform: "translateX(100%)" }],
  [t, { transform: "translateX(100%)" }, SHEET],
  [t + 0.6, { transform: "translateX(0)" }],
];

/** Opens as a circle out of the button that was pressed (screen points) */
export const open = (t: number, x: number, y: number): Frame[] => {
  const c = `${((x / 375) * 100).toFixed(1)}% ${((y / 812) * 100).toFixed(1)}%`;
  return [
    [0, { clipPath: `circle(0% at ${c})` }],
    [t, { clipPath: `circle(0% at ${c})` }, SHEET],
    [t + 0.8, { clipPath: `circle(130% at ${c})` }],
  ];
};

/** Arrives from a distance or from close up */
export const zoomIn = (t: number, from: number): Frame[] => [
  [0, { opacity: 0, transform: `scale(${from})` }],
  [t, { opacity: 0, transform: `scale(${from})` }, SHEET],
  [t + 0.8, { opacity: 1, transform: "scale(1)" }],
];

/** A finger press: grows in, sinks, fades */
export const tap = (t: number): Frame[] => [
  [0, { opacity: 0, transform: "scale(1.6)" }],
  [t - 0.35, { opacity: 0, transform: "scale(1.6)" }, ENTER],
  [t, { opacity: 1, transform: "scale(1)" }],
  [t + 0.12, { opacity: 1, transform: "scale(0.8)" }, ENTER],
  [t + 0.45, { opacity: 0, transform: "scale(1.5)" }],
];

/** A piece that lifts off the screen, hangs there drifting, and settles back where it came from */
export const lift = (from: number, until: number, out: string, drift: string, up = 1): Frame[] => {
  const home = at(0, 0, 2, 1 / up);
  // A short stay gets a quicker rise, so it always has time to hang before settling
  const risen = Math.min(from + 1.1, until - 0.15);
  return [
    [0, { transform: home, opacity: 0 }],
    [from, { transform: home, opacity: 0 }],
    [from + 0.1, { transform: home, opacity: 1 }, ENTER],
    [risen, { transform: out, opacity: 1 }, DRIFT],
    [until, { transform: drift, opacity: 1 }, CAMERA],
    [until + 0.6, { transform: home, opacity: 1 }],
    [until + 0.75, { transform: home, opacity: 0 }],
  ];
};

/** Out-of-focus shapes between the camera and the phone, moving faster than it: depth */
export const bokeh = (length: number, x0: number, y0: number, x1: number, y1: number, o: number): Frame[] => [
  [0, { transform: `translate3d(${x0}px, ${y0}px, 0)`, opacity: 0 }, DRIFT],
  [2, { opacity: o }, DRIFT],
  [length - 4, { opacity: o }, DRIFT],
  [length, { transform: `translate3d(${x1}px, ${y1}px, 0)`, opacity: 0 }],
];

/** Split a track into one looping animation per property, so frames that skip a property don't reset it */
export function play(el: Element, frames: Frame[], length: number) {
  const props = [...new Set(frames.flatMap(([, s]) => Object.keys(s)))];
  return props.map((prop) => {
    const own = frames.filter(([, s]) => prop in s);
    const keys = own.map(([t, s, easing]) => ({ [prop]: s[prop], offset: t / length, easing: easing ?? "linear" }));
    if (keys[0]!.offset !== 0) keys.unshift({ ...keys[0]!, offset: 0, easing: "linear" });
    if (keys.at(-1)!.offset !== 1) keys.push({ ...keys.at(-1)!, offset: 1, easing: "linear" });
    return el.animate(keys as Keyframe[], { duration: length * 1000, iterations: Infinity, fill: "both" });
  });
}
