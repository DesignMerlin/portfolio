"use client";

import { Film } from "@/components/case-study/film/film";
import {
  at,
  CAMERA,
  DIVE,
  DRIFT,
  ENTER,
  lift,
  open,
  pose,
  push,
  SHEET,
  still,
  zoomIn,
  type Frame,
  type Piece,
  type Storyboard,
} from "@/components/case-study/film/kit";
import { room8Splash, room8TourLoader } from "@/components/case-study/live/scenes";
import type { FilmProps } from "@/components/case-study/film/use-film";
import { room8, type Room8Screen } from "@/content/room8";

/** One loop, in seconds */
const T = 25;
/** The logo gets this much longer to arrive before anything else happens */
const LOGO = 0.9;
const after = (frames: Frame[]): Frame[] => frames.map(([t, s, e]) => [t > 2 ? t + LOGO : t, s, e]);

/* ------------------------------------------------------------------ */
/* Finding a roommate: splash, onboarding, matching question, the      */
/* roommate list, a profile. Then the room, and its 3D tour.           */
/* ------------------------------------------------------------------ */

const CAMERA_TRACK: Frame[] = [
  [0, pose(0, 320, -1100, 34, -68, 14), SHEET],
  [1.9, pose(0, 0, 50, 9, -26, 4), DRIFT],
  [3.5, pose(0, 0, 90, 6, -14, 2), CAMERA],
  // The question: answers lift off to the left
  [4.8, pose(170, 0, 110, 8, -30, 4), DRIFT],
  [6.0, pose(160, 0, 130, 6, -24, 3), CAMERA],
  // The list: people lift off to the right
  [7.4, pose(-230, 10, 120, 13, 34, -5), DRIFT],
  [10.0, pose(-208, 0, 150, 9, 26, -4), CAMERA],
  // The profile: compatibility and habits to the left
  [11.4, pose(230, 0, 130, 9, -32, 4), DRIFT],
  [13.8, pose(208, 0, 155, 6, -25, 3), CAMERA],
  // The room, then square on for the tour
  [15.0, pose(-40, 0, 130, 9, 22, -3), DRIFT],
  [16.8, pose(0, 0, 170, 3, 8, -1), CAMERA],
  [18.0, pose(0, 0, 190, 2, 0, 0), DRIFT],
  [19.4, pose(0, 0, 215, 5, -17, -2), DRIFT],
  [21.3, pose(0, 0, 250, -3, 13, 2), CAMERA],
  // Through the screen
  [22.8, pose(0, 0, 620, 0, 0, 0), DIVE],
  [24.4, pose(0, 0, 1280, 0, 0, 0)],
  [T, pose(0, 0, 1290, 0, 0, 0)],
];

// On the stage, not the phone: an animated opacity would flatten the phone's 3D
const FADE: Frame[] = [
  [0, { opacity: 0 }, ENTER],
  [0.6, { opacity: 1 }],
  [24.0, { opacity: 1 }, ENTER],
  [24.7, { opacity: 0 }],
  [T, { opacity: 0 }],
];

const screens = (
  [
  { name: "splash", frames: still },
  { name: "onboarding1", frames: push(2.1) },
  { name: "questions", frames: push(3.8) },
  { name: "explore", frames: push(6.2) },
  { name: "roommate", frames: push(10.2) },
  { name: "room", frames: push(14.0) },
  { name: "vrLoader", frames: open(17.0, 331, 700) },
  { name: "vrDollhouse", frames: zoomIn(18.3, 1.12) },
  { name: "vrWalk", frames: zoomIn(20.2, 0.86) },
  // The same room without its controls, for the fly-through
  {
    name: "vrRoom",
    frames: [
      [0, { opacity: 0, transform: "scale(1)" }],
      [21.9, { opacity: 0, transform: "scale(1)" }, ENTER],
      [22.5, { opacity: 1 }],
      [T, { opacity: 1, transform: "scale(1.1)" }],
    ],
  },
] as { name: Room8Screen; frames: Frame[] }[]
).map(({ name, frames }) => ({
  id: name,
  src: room8[name].src,
  frames: after(frames),
  live: name === "splash" ? { scene: room8Splash, t: 0.5 } : name === "vrLoader" ? { scene: room8TourLoader, t: 17.2 + LOGO } : undefined,
}));

// In screen points: the buttons' real places
const TAPS = [
  { x: 290, y: 743, t: 3.65 }, // Next
  { x: 63, y: 320, t: 4.35 }, // Yaba
  { x: 187, y: 773, t: 6.05 }, // Continue
  { x: 187, y: 219, t: 10.05 }, // a roommate
  { x: 331, y: 700, t: 16.85 }, // VR tour
];

const PIECES: (Omit<Piece, "src"> & { name: string })[] = [
  { name: "yaba", box: [16, 302, 95, 36], radius: 8, up: 1.9, frames: lift(4.5, 5.4, at(-190, -40, 190), at(-200, -44, 205), 1.9) },
  { name: "ibeju", box: [121, 214, 137, 36], radius: 8, up: 1.5, frames: lift(4.58, 5.4, at(-250, -50, 130), at(-258, -54, 142), 1.5) },

  { name: "steph", box: [16, 160, 343, 117], radius: 10, frames: lift(7.2, 9.1, at(34, -30, 215, 1.04), at(42, -36, 240, 1.04)) },
  { name: "karoline", box: [16, 286, 343, 117], radius: 10, frames: lift(7.35, 9.15, at(10, 0, 145, 1.02), at(14, 0, 164, 1.02)) },
  { name: "melissa", box: [16, 412, 343, 117], radius: 10, frames: lift(7.5, 9.2, at(-8, 30, 80), at(-10, 36, 92)) },

  { name: "compat", box: [260, 327, 99, 18], radius: 9, up: 2.5, frames: lift(11.2, 13.1, at(-330, -130, 230), at(-344, -138, 250), 2.5) },
  { name: "rent", box: [8, 300, 240, 52], radius: 14, frames: lift(11.35, 13.15, at(-190, -40, 190), at(-202, -42, 206)) },
  { name: "bio", box: [8, 364, 360, 92], radius: 14, frames: lift(11.5, 13.2, at(-196, 20, 150, 0.9), at(-206, 20, 164, 0.9)) },
  { name: "life", box: [8, 606, 270, 78], radius: 14, frames: lift(11.65, 13.25, at(-210, -60, 115), at(-222, -62, 126)) },

  { name: "bed", box: [16.3, 378, 78.3, 84], radius: 10, frames: lift(14.8, 16.0, at(14, -14, 150, 1.12), at(18, -16, 165, 1.12)) },
  { name: "bath", box: [104.3, 378, 78.3, 84], radius: 10, frames: lift(14.88, 16.0, at(18, -14, 130, 1.12), at(22, -16, 144, 1.12)) },
  { name: "size", box: [192, 378, 78.3, 84], radius: 10, frames: lift(14.96, 16.0, at(22, -14, 110, 1.12), at(26, -16, 122, 1.12)) },
  { name: "furn", box: [279.7, 378, 78.3, 84], radius: 10, frames: lift(15.04, 16.0, at(26, -14, 90, 1.12), at(30, -16, 100, 1.12)) },
];

/** A soft sweep of light across the glass, following the orbit */
const GLARE: Frame[] = [
  [0, { transform: "translateX(-90%) rotate(18deg)" }, DRIFT],
  [4.8, { transform: "translateX(-30%) rotate(18deg)" }, CAMERA],
  [7.4, { transform: "translateX(80%) rotate(18deg)" }, DRIFT],
  [10, { transform: "translateX(55%) rotate(18deg)" }, CAMERA],
  [11.4, { transform: "translateX(-70%) rotate(18deg)" }, DRIFT],
  [13.8, { transform: "translateX(-40%) rotate(18deg)" }, CAMERA],
  [16, { transform: "translateX(120%) rotate(18deg)" }],
  [T, { transform: "translateX(120%) rotate(18deg)" }],
];

const SHADOW: Frame[] = [
  [0, { opacity: 0, transform: "scale(0.5)" }, SHEET],
  [1.9, { opacity: 0.5, transform: "scale(1)" }, CAMERA],
  [4.8, { opacity: 0.42, transform: "translateX(130px) scale(1.1)" }, DRIFT],
  [6, { opacity: 0.42, transform: "translateX(125px) scale(1.1)" }, CAMERA],
  [7.4, { opacity: 0.42, transform: "translateX(-175px) scale(1.1)" }, DRIFT],
  [10, { opacity: 0.42, transform: "translateX(-160px) scale(1.12)" }, CAMERA],
  [11.4, { opacity: 0.42, transform: "translateX(175px) scale(1.1)" }, DRIFT],
  [13.8, { opacity: 0.42, transform: "translateX(160px) scale(1.12)" }, CAMERA],
  [15, { opacity: 0.45, transform: "translateX(-30px) scale(1.15)" }, DRIFT],
  [18, { opacity: 0.45, transform: "scale(1.2)" }, DRIFT],
  [21.3, { opacity: 0.4, transform: "scale(1.3)" }, CAMERA],
  [22.8, { opacity: 0, transform: "scale(1.8)" }],
  [T, { opacity: 0, transform: "scale(1.8)" }],
];

const board: Storyboard = {
  length: T + LOGO,
  // Roommates lifting off the list
  poster: 8.6 + LOGO,
  fade: after(FADE),
  shadow: after(SHADOW),
  shade: "6 46 22",
  phone: {
    track: after(CAMERA_TRACK),
    screens,
    taps: TAPS.map((x) => ({ ...x, t: x.t + LOGO })),
    glare: after(GLARE),
    pieces: PIECES.map(({ name, ...p }) => ({ ...p, frames: after(p.frames), src: `/work/room8/piece-${name}.webp` })),
  },
};

/**
 * Room8 as a short 3D film, told with the app's own screens. Answers lift off
 * the matching question, roommates lift off the list, a profile opens out
 * into compatibility and habits, then the room opens its 3D tour (dollhouse,
 * then walking inside) and the camera flies through the screen into it.
 */
export default function Room8Film(props: FilmProps) {
  return <Film board={board} {...props} />;
}
