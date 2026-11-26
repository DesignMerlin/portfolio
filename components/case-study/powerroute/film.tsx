"use client";

import { Film } from "@/components/case-study/film/film";
import { at, CAMERA, DIVE, DRIFT, ENTER, lift, pose, push, SHEET, still, zoomIn, type Frame, type Piece, type Storyboard } from "@/components/case-study/film/kit";
import type { FilmProps } from "@/components/case-study/film/use-film";
import type { LiveScene } from "@/components/case-study/live/kit";
import { powerrouteBooked, powerrouteCharged, powerrouteCharging, powerrouteSplash } from "@/components/case-study/live/phones";
import { powerroute, type PowerRouteScreen } from "@/content/powerroute";

/** One loop, in seconds */
const T = 26;

/* ------------------------------------------------------------------ */
/* A driver running low: the mark, three photographs of charging,      */
/* stations near you (recents and the list lift off), the map, a       */
/* station's card, a date, payment, booked. Then the car on charge,    */
/* the battery filling, done, and the wallet. Through the screen.      */
/* ------------------------------------------------------------------ */

const CAMERA_TRACK: Frame[] = [
  [0, pose(0, 320, -1100, 34, 68, -14), SHEET],
  [1.9, pose(0, 0, 50, 9, 24, -4), DRIFT],
  // Onboarding: the photographs, nearly square on
  [3.4, pose(0, 0, 110, 4, 10, -1), CAMERA],
  [6.2, pose(0, 0, 130, 3, -8, 1), DRIFT],
  // Home: recents and stations lift off to the left
  [7.6, pose(210, 0, 120, 9, -30, 4), DRIFT],
  [10.0, pose(196, 0, 150, 7, -24, 3), CAMERA],
  // The map, then the station's card to the right
  [11.4, pose(-60, 0, 140, 6, 14, -2), DRIFT],
  [12.6, pose(-200, 0, 140, 10, 30, -4), CAMERA],
  // Booking: the calendar to the left
  [14.6, pose(190, 0, 140, 8, -28, 3), DRIFT],
  [16.0, pose(170, 0, 150, 6, -22, 3), CAMERA],
  // Booked
  [17.4, pose(0, 0, 170, 4, 6, -1), DRIFT],
  // Charging: the car and the battery to the right
  [18.8, pose(-210, 0, 140, 10, 30, -4), DRIFT],
  [21.0, pose(-190, 0, 160, 7, 24, -3), CAMERA],
  // Charged, the wallet, and through the screen
  [22.4, pose(0, 0, 200, 3, -6, 1), DRIFT],
  [24.0, pose(0, 0, 240, 2, 4, 0), CAMERA],
  [25.0, pose(0, 0, 620, 0, 0, 0), DIVE],
  [T, pose(0, 0, 1280, 0, 0, 0)],
];

// On the stage, not the phone: an animated opacity would flatten the phone's 3D
const FADE: Frame[] = [
  [0, { opacity: 0 }, ENTER],
  [0.6, { opacity: 1 }],
  [24.9, { opacity: 1 }, ENTER],
  [25.6, { opacity: 0 }],
  [T, { opacity: 0 }],
];

/** What moves on a screen, and when it starts */
const LIVE: Partial<Record<PowerRouteScreen, { scene: LiveScene; t: number }>> = {
  splash: { scene: powerrouteSplash, t: 0.3 },
  booked: { scene: powerrouteBooked, t: 17.3 },
  charging: { scene: powerrouteCharging, t: 19.0 },
  charged: { scene: powerrouteCharged, t: 22.1 },
};

const screens = (
  [
    { name: "splash", frames: still },
    { name: "onboarding1", frames: push(2.0) },
    { name: "onboarding2", frames: push(3.6) },
    { name: "onboarding3", frames: push(5.0) },
    { name: "home", frames: push(6.6) },
    { name: "map", frames: zoomIn(10.4, 0.9) },
    { name: "stationMap", frames: push(11.6) },
    { name: "booking", frames: push(13.6) },
    { name: "payment", frames: push(15.6) },
    { name: "review", frames: push(16.4) },
    { name: "booked", frames: zoomIn(17.2, 1.1) },
    { name: "charging", frames: push(18.4) },
    { name: "charged", frames: zoomIn(22.0, 1.1) },
    { name: "wallet", frames: push(23.2) },
  ] as { name: PowerRouteScreen; frames: Frame[] }[]
).map(({ name, frames }) => ({ id: name, src: powerroute[name].src, frames, live: LIVE[name] }));

// In screen points: the buttons' real places
const TAPS = [
  { x: 187, y: 746, t: 3.45 }, // Get Started
  { x: 187, y: 746, t: 4.85 },
  { x: 187, y: 746, t: 6.45 },
  { x: 334, y: 474, t: 10.25 }, // the map view
  { x: 290, y: 742, t: 13.45 }, // Book
  { x: 186, y: 743, t: 15.45 }, // Continue
  { x: 186, y: 743, t: 16.25 }, // Continue
  { x: 186, y: 743, t: 17.05 }, // Confirm Booking
  { x: 187, y: 480, t: 18.25 }, // Back to Home, then charging
];

const PIECES: (Omit<Piece, "src"> & { name: string })[] = [
  { name: "recent1", box: [20, 196, 152, 159], radius: 12, frames: lift(7.4, 9.6, at(-30, -40, 200, 1.05), at(-38, -46, 222, 1.05)) },
  { name: "recent2", box: [180, 196, 152, 159], radius: 12, frames: lift(7.55, 9.65, at(-10, -30, 150), at(-14, -34, 168)) },
  { name: "row1", box: [20, 398, 333, 40], radius: 8, frames: lift(7.75, 9.7, at(-40, 10, 170), at(-46, 10, 190)) },
  { name: "row2", box: [20, 454, 333, 40], radius: 8, frames: lift(7.85, 9.75, at(-30, 20, 120), at(-34, 22, 134)) },
  { name: "row3", box: [20, 509, 333, 40], radius: 8, frames: lift(7.95, 9.8, at(-20, 30, 80), at(-24, 34, 90)) },

  { name: "sheet", box: [8, 524, 359, 248], radius: 18, frames: lift(12.2, 13.3, at(40, -40, 190, 1.04), at(46, -46, 210, 1.04)) },

  { name: "calendar", box: [32, 125, 300, 352], radius: 12, frames: lift(14.2, 15.4, at(-40, -10, 190, 1.04), at(-46, -12, 212, 1.04)) },

  { name: "modal", box: [21, 140, 333, 382], radius: 14, frames: lift(17.6, 18.2, at(0, -10, 160, 1.02), at(0, -12, 176, 1.02)) },

  { name: "car", box: [24, 176, 327, 196], radius: 0, frames: lift(19.2, 21.4, at(60, -60, 230, 1.06), at(70, -66, 256, 1.06)) },
  { name: "donut", box: [284, 108, 70, 70], radius: 35, up: 2, frames: lift(19.4, 21.5, at(80, -40, 180), at(88, -44, 196), 2) },
  { name: "battery", box: [81, 396, 213, 93], radius: 10, up: 1.4, frames: lift(19.6, 21.6, at(50, 30, 200), at(56, 34, 220), 1.4) },

  { name: "card", box: [20, 104, 336, 134], radius: 14, frames: lift(23.6, 24.6, at(0, -20, 170, 1.04), at(0, -24, 186, 1.04)) },
];

/** A soft sweep of light across the glass, following the orbit */
const GLARE: Frame[] = [
  [0, { transform: "translateX(90%) rotate(18deg)" }, DRIFT],
  [3.4, { transform: "translateX(30%) rotate(18deg)" }, CAMERA],
  [7.6, { transform: "translateX(-80%) rotate(18deg)" }, DRIFT],
  [11.4, { transform: "translateX(40%) rotate(18deg)" }, DRIFT],
  [14.6, { transform: "translateX(-70%) rotate(18deg)" }, CAMERA],
  [18.8, { transform: "translateX(70%) rotate(18deg)" }, DRIFT],
  [22.4, { transform: "translateX(-120%) rotate(18deg)" }],
  [T, { transform: "translateX(-120%) rotate(18deg)" }],
];

const SHADOW: Frame[] = [
  [0, { opacity: 0, transform: "scale(0.5)" }, SHEET],
  [1.9, { opacity: 0.5, transform: "scale(1)" }, CAMERA],
  [7.6, { opacity: 0.42, transform: "translateX(165px) scale(1.1)" }, DRIFT],
  [10, { opacity: 0.42, transform: "translateX(150px) scale(1.12)" }, CAMERA],
  [12.6, { opacity: 0.42, transform: "translateX(-160px) scale(1.1)" }, DRIFT],
  [14.6, { opacity: 0.42, transform: "translateX(150px) scale(1.1)" }, DRIFT],
  [17.4, { opacity: 0.45, transform: "scale(1.15)" }, DRIFT],
  [18.8, { opacity: 0.42, transform: "translateX(-165px) scale(1.12)" }, DRIFT],
  [22.4, { opacity: 0.45, transform: "scale(1.2)" }, CAMERA],
  [25, { opacity: 0, transform: "scale(1.8)" }],
  [T, { opacity: 0, transform: "scale(1.8)" }],
];

const board: Storyboard = {
  length: T,
  // Stations lifting off home
  poster: 8.8,
  fade: FADE,
  shadow: SHADOW,
  shade: "12 60 20",
  finger: true,
  phone: {
    track: CAMERA_TRACK,
    screens,
    taps: TAPS,
    glare: GLARE,
    pieces: PIECES.map(({ name, ...p }) => ({ ...p, src: `/work/powerroute/piece-${name}.webp` })),
  },
};

/**
 * PowerRoute as a short 3D film, told with the app's own screens: the onboarding photographs, stations
 * lifting off home, a station's card off the map, the booking calendar, booked, then the car on charge
 * with its battery filling, charged, and the wallet. The camera flies through the screen at the end.
 */
export default function PowerRouteFilm(props: FilmProps) {
  return <Film board={board} {...props} />;
}
