"use client";

import { Film } from "@/components/case-study/film/film";
import { at, CAMERA, DIVE, DRIFT, ENTER, lift, pose, push, SHEET, still, zoomIn, type Frame, type Piece, type Storyboard } from "@/components/case-study/film/kit";
import type { FilmProps } from "@/components/case-study/film/use-film";
import type { LiveScene } from "@/components/case-study/live/kit";
import { lagAccepted, lagPaid, lagSplash } from "@/components/case-study/live/phones";
import { lagTop, type LagScreen } from "@/content/lagproperties";

/** One loop, in seconds */
const T = 28;

/* ------------------------------------------------------------------ */
/* Renting in Lagos, both sides of it. A tenant: the orange mark, two  */
/* photographs of the city, sign up, rent or list (the choice lifts),  */
/* listings (two lift off), a flat, an inspection booked, paid, a chat */
/* with the agent, the agreement signed. Then the landlord: escrow and */
/* rent lift off the dashboard, an inspection request accepted.        */
/* ------------------------------------------------------------------ */

const CAMERA_TRACK: Frame[] = [
  [0, pose(0, 320, -1100, 34, -68, 14), SHEET],
  [1.9, pose(0, 0, 50, 9, -24, 4), DRIFT],
  [3.4, pose(0, 0, 100, 4, -8, 1), CAMERA],
  [5.6, pose(0, 0, 120, 3, 8, -1), DRIFT],
  // Rent or list: the two choices lift off to the right
  [6.6, pose(-200, 0, 130, 10, 30, -4), DRIFT],
  [8.0, pose(-186, 0, 145, 8, 24, -3), CAMERA],
  // Listings to the left
  [9.0, pose(210, 0, 130, 10, -32, 4), DRIFT],
  [10.8, pose(196, 0, 150, 7, -25, 3), CAMERA],
  // The flat, then booking the inspection to the right
  [12.2, pose(-40, 0, 140, 5, 10, -1), DRIFT],
  [13.4, pose(-200, 0, 140, 9, 28, -4), CAMERA],
  [15.6, pose(0, 0, 160, 4, -6, 1), DRIFT],
  // The chat to the left
  [17.2, pose(210, 0, 140, 10, -30, 4), DRIFT],
  [19.2, pose(190, 0, 160, 7, -24, 3), CAMERA],
  [20.6, pose(0, 0, 180, 4, 6, -1), DRIFT],
  // The landlord's dashboard to the right
  [22.6, pose(-210, 0, 150, 10, 30, -4), DRIFT],
  [24.6, pose(-190, 0, 170, 7, 24, -3), CAMERA],
  [26.0, pose(0, 0, 230, 2, -4, 0), CAMERA],
  [27.0, pose(0, 0, 620, 0, 0, 0), DIVE],
  [T, pose(0, 0, 1280, 0, 0, 0)],
];

// On the stage, not the phone: an animated opacity would flatten the phone's 3D
const FADE: Frame[] = [
  [0, { opacity: 0 }, ENTER],
  [0.6, { opacity: 1 }],
  [26.9, { opacity: 1 }, ENTER],
  [27.6, { opacity: 0 }],
  [T, { opacity: 0 }],
];

/** What moves on a screen, and when it starts */
const LIVE: Partial<Record<LagScreen, { scene: LiveScene; t: number }>> = {
  splash: { scene: lagSplash, t: 0.3 },
  paid: { scene: lagPaid, t: 15.5 },
  landlordAccepted: { scene: lagAccepted, t: 25.9 },
};

const screens = (
  [
    { name: "splash", frames: still },
    { name: "onboarding1", frames: push(2.0) },
    { name: "onboarding2", frames: push(3.4) },
    { name: "signUp", frames: push(4.8) },
    { name: "home", frames: push(6.0) },
    { name: "explore", frames: push(8.4) },
    { name: "property", frames: push(11.2) },
    { name: "schedule", frames: push(12.6) },
    { name: "time", frames: zoomIn(14.4, 1.06) },
    { name: "paid", frames: zoomIn(15.4, 1.1) },
    { name: "chat", frames: push(16.6) },
    { name: "agreement", frames: push(19.4) },
    { name: "signing", frames: zoomIn(20.6, 1.06) },
    { name: "landlordDashboard", frames: push(22.0) },
    { name: "landlordInspection", frames: zoomIn(24.8, 1.08) },
    { name: "landlordAccepted", frames: zoomIn(25.8, 1.08) },
  ] as { name: LagScreen; frames: Frame[] }[]
).map(({ name, frames }) => ({ id: name, src: lagTop(name), frames, live: LIVE[name] }));

// In screen points: the buttons' real places
const TAPS = [
  { x: 187, y: 752, t: 4.65 }, // Sign up
  { x: 187, y: 742, t: 5.85 }, // Sign up
  { x: 187, y: 146, t: 7.2 }, // Rent an apartment
  { x: 187, y: 762, t: 8.25 }, // Proceed
  { x: 99, y: 230, t: 11.05 }, // a flat
  { x: 220, y: 202, t: 14.25 }, // the time
  { x: 187, y: 749, t: 15.25 }, // Schedule
  { x: 337, y: 748, t: 19.25 }, // send
  { x: 187, y: 680, t: 25.65 }, // Accept
];

const PIECES: (Omit<Piece, "src"> & { name: string })[] = [
  { name: "rent", box: [16, 91, 343, 110], radius: 10, frames: lift(6.7, 7.9, at(40, -30, 200, 1.04), at(46, -34, 222, 1.04)) },
  { name: "list", box: [16, 217, 343, 110], radius: 10, frames: lift(6.85, 7.95, at(30, 10, 130), at(34, 12, 146)) },

  { name: "card1", box: [16, 151, 166, 232], radius: 10, frames: lift(9.1, 10.7, at(-60, -30, 210, 1.06), at(-68, -34, 234, 1.06)) },
  { name: "card2", box: [194, 151, 166, 232], radius: 10, frames: lift(9.25, 10.75, at(-20, -20, 150, 1.03), at(-24, -22, 168, 1.03)) },

  { name: "mode", box: [16, 92, 236, 62], radius: 8, up: 1.3, frames: lift(13.0, 14.1, at(40, -30, 190), at(46, -34, 210), 1.3) },
  { name: "when", box: [16, 170, 235, 66], radius: 8, up: 1.3, frames: lift(13.15, 14.15, at(30, 10, 150), at(34, 12, 166), 1.3) },

  { name: "house", box: [193, 101, 164, 165], radius: 12, frames: lift(17.0, 19.0, at(-40, -30, 200, 1.05), at(-46, -34, 222, 1.05)) },
  { name: "msg1", box: [92, 278, 267, 60], radius: 12, frames: lift(17.2, 19.05, at(-60, 0, 170), at(-66, 0, 188)) },
  { name: "msg2", box: [19, 389, 204, 40], radius: 12, frames: lift(17.35, 19.1, at(-80, 10, 140), at(-88, 12, 156)) },
  { name: "msg3", box: [18, 447, 308, 40], radius: 12, frames: lift(17.5, 19.15, at(-60, 20, 110), at(-66, 22, 122)) },

  { name: "escrow", box: [16, 148, 343, 179], radius: 12, frames: lift(22.6, 24.5, at(40, -40, 210, 1.04), at(46, -46, 234, 1.04)) },
  { name: "received", box: [16, 343, 343, 127], radius: 12, frames: lift(22.8, 24.55, at(30, 0, 150), at(34, 0, 166)) },
];

/** A soft sweep of light across the glass, following the orbit */
const GLARE: Frame[] = [
  [0, { transform: "translateX(-90%) rotate(18deg)" }, DRIFT],
  [3.4, { transform: "translateX(-30%) rotate(18deg)" }, CAMERA],
  [6.6, { transform: "translateX(80%) rotate(18deg)" }, DRIFT],
  [9.0, { transform: "translateX(-70%) rotate(18deg)" }, DRIFT],
  [13.4, { transform: "translateX(70%) rotate(18deg)" }, CAMERA],
  [17.2, { transform: "translateX(-70%) rotate(18deg)" }, DRIFT],
  [22.6, { transform: "translateX(80%) rotate(18deg)" }, DRIFT],
  [26, { transform: "translateX(120%) rotate(18deg)" }],
  [T, { transform: "translateX(120%) rotate(18deg)" }],
];

const SHADOW: Frame[] = [
  [0, { opacity: 0, transform: "scale(0.5)" }, SHEET],
  [1.9, { opacity: 0.5, transform: "scale(1)" }, CAMERA],
  [6.6, { opacity: 0.42, transform: "translateX(-165px) scale(1.1)" }, DRIFT],
  [9.0, { opacity: 0.42, transform: "translateX(170px) scale(1.1)" }, DRIFT],
  [13.4, { opacity: 0.42, transform: "translateX(-160px) scale(1.1)" }, CAMERA],
  [15.6, { opacity: 0.45, transform: "scale(1.15)" }, DRIFT],
  [17.2, { opacity: 0.42, transform: "translateX(170px) scale(1.1)" }, DRIFT],
  [22.6, { opacity: 0.42, transform: "translateX(-170px) scale(1.12)" }, DRIFT],
  [26, { opacity: 0.45, transform: "scale(1.2)" }, CAMERA],
  [27, { opacity: 0, transform: "scale(1.8)" }],
  [T, { opacity: 0, transform: "scale(1.8)" }],
];

const board: Storyboard = {
  length: T,
  // Listings lifting off explore
  poster: 10.2,
  fade: FADE,
  shadow: SHADOW,
  shade: "90 34 8",
  finger: true,
  phone: {
    track: CAMERA_TRACK,
    screens,
    taps: TAPS,
    glare: GLARE,
    pieces: PIECES.map(({ name, ...p }) => ({ ...p, src: `/work/lagproperties/piece-${name}.webp` })),
  },
};

/**
 * LAGProperties as a short 3D film, told with the app's own screens: a tenant chooses to rent, listings lift
 * off explore, an inspection gets booked and paid for, the agent's chat lifts off, the agreement is signed;
 * then the landlord's escrow and rent lift off the dashboard and an inspection is accepted.
 */
export default function LagPropertiesFilm(props: FilmProps) {
  return <Film board={board} {...props} />;
}
