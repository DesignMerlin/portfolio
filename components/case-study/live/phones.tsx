import { ENTER, SHEET, type Frame } from "@/components/case-study/film/kit";
import type { LiveScene, Part, PtBox, Sprite } from "@/components/case-study/live/kit";
import { lagproperties as lp, lagTop } from "@/content/lagproperties";
import { powerroute as pr } from "@/content/powerroute";

/**
 * PowerRoute's and LAGProperties' screens that move: the logos assemble on their splash screens, the
 * battery fills, and the success marks arrive. Each piece is the screen's own pixels (a slice) laid over a
 * patch of the screen's own background, so what moves is exactly what's in the design.
 */

const SPRING = "cubic-bezier(0.34, 1.56, 0.64, 1)";
const WIPE = "cubic-bezier(0.6, 0, 0.2, 1)";

const ground = (id: string, box: PtBox, bg: string, r?: number | string): Part => ({ id, box, bg, r });
/** Comes in from `x`% to the side, settling with a little overshoot */
const driveIn = (t: number, x = -130, d = 0.8): Frame[] => [
  [0, { transform: `translateX(${x}%)`, opacity: 0 }],
  [t, { transform: `translateX(${x}%)`, opacity: 0 }, SPRING],
  [t + 0.1, { opacity: 1 }],
  [t + d, { transform: "translateX(0%)" }],
];
/** Rises out of its own box */
const rise = (t: number, d = 0.7): Frame[] => [
  [0, { transform: "translateY(105%)" }],
  [t, { transform: "translateY(105%)" }, SHEET],
  [t + d, { transform: "translateY(0%)" }],
];
/** Written on from the left */
const wipe = (t: number, d = 0.5): Frame[] => [
  [0, { clipPath: "inset(0 100% 0 0)" }],
  [t, { clipPath: "inset(0 100% 0 0)" }, WIPE],
  [t + d, { clipPath: "inset(0 0% 0 0)" }],
];
/** Spins in from nothing, like a stamp */
const stamp = (t: number, d = 0.7): Frame[] => [
  [0, { transform: "rotate(-150deg) scale(0)" }],
  [t, { transform: "rotate(-150deg) scale(0)" }, SPRING],
  [t + d, { transform: "rotate(0deg) scale(1)" }],
];
/** A ring that leaves the mark as it lands */
const ringOut = (t: number, to = 1.9): Frame[] => [
  [0, { transform: "scale(0.9)", opacity: 0 }],
  [t, { transform: "scale(0.9)", opacity: 0 }],
  [t + 0.02, { opacity: 0.6 }, ENTER],
  [t + 0.9, { transform: `scale(${to})`, opacity: 0 }],
];
/** A success mark: its patch of background, a ring, and the mark stamped in */
const success = (id: string, box: PtBox, src: string, bg: string, color: string, t: number, size?: [number, number]): Part[] => [
  ground(`${id}-ground`, [box[0] - 4, box[1] - 4, box[2] + 8, box[3] + 8], bg),
  { id: `${id}-ring`, box, r: "50%", border: `calc(3 * var(--pt)) solid ${color}`, frames: ringOut(t + 0.35) },
  { id, box, slice: src, sliceSize: size, r: "50%", frames: stamp(t) },
];

// PowerRoute ------------------------------------------------------------------

const PR_GREEN = "#5acd56";
const PR_GROUND = "#effaee";

/** The car with a plug for a tail drives in, then the name writes itself under it */
export const powerrouteSplash: LiveScene = {
  length: 2,
  parts: [
    ground("ground", [104, 330, 168, 150], PR_GROUND),
    { id: "car-clip", box: [104, 336, 168, 104], clip: true, parts: [{ id: "car", box: [127, 339, 122, 96], slice: pr.splash.src, frames: driveIn(0.15) }] },
    { id: "spark", box: [158, 357, 60, 60], r: "50%", border: `calc(3 * var(--pt)) solid ${PR_GREEN}`, frames: ringOut(0.8, 2.4) },
    { id: "name", box: [117, 451, 142, 22], slice: pr.splash.src, frames: wipe(0.85) },
  ],
};

/** The battery fills bar by bar */
export const powerrouteCharging: LiveScene = {
  length: 2.6,
  parts: [
    {
      id: "empty",
      box: [100, 404, 170, 77],
      bg: "#fff",
      origin: "100% 50%",
      frames: [
        [0, { transform: "scaleX(1)" }],
        [0.3, { transform: "scaleX(1)" }, "steps(4, end)"],
        [2.3, { transform: "scaleX(0)" }],
      ],
    },
  ],
};

/** Booking successful: the tick stamps in with a ring */
export const powerrouteBooked: LiveScene = { length: 1.6, parts: success("tick", [131, 189, 113, 113], pr.booked.src, "#fff", PR_GREEN, 0.2) };

/** Charged: the battery lands and fills from the bottom */
export const powerrouteCharged: LiveScene = {
  length: 1.8,
  parts: [
    ground("ground", [150, 250, 76, 102], "#fff"),
    {
      id: "battery",
      box: [155, 254, 65, 92],
      slice: pr.charged.src,
      origin: "50% 100%",
      frames: [
        [0, { transform: "scale(0.4)", opacity: 0, clipPath: "inset(100% 0 0 0)" }],
        [0.2, { transform: "scale(0.4)", opacity: 0, clipPath: "inset(100% 0 0 0)" }, SPRING],
        [0.3, { opacity: 1 }],
        [0.8, { transform: "scale(1)", clipPath: "inset(0% 0 0 0)" }],
      ],
    },
    { id: "ring", box: [140, 253, 96, 96], r: "50%", border: `calc(3 * var(--pt)) solid ${PR_GREEN}`, frames: ringOut(0.8, 1.8) },
  ],
};

// LAGProperties -----------------------------------------------------------------------

const LAG_ORANGE = "#f56630";
/** The success animation from the file (LottieFiles "done"), as a sprite */
const DONE: Sprite = { src: "/work/motion/done-seal.webp", cols: 8, rows: 8, frames: 61, fps: 25, box: [113, 143, 151, 128] };

/** The tower rises out of the orange, then the name writes itself under it */
export const lagSplash: LiveScene = {
  length: 2,
  parts: [
    ground("ground", [115, 330, 145, 152], LAG_ORANGE),
    { id: "tower-clip", box: [125, 333, 125, 120], clip: true, parts: [{ id: "tower", box: [135, 335, 105, 116], slice: lp.splash.src, frames: rise(0.15, 0.8) }] },
    { id: "name", box: [127, 453, 121, 24], slice: lp.splash.src, frames: wipe(0.85) },
  ],
};

/** Payment successful: the file's own done animation plays */
export const lagPaid: LiveScene = {
  length: 2.6,
  parts: [
    ground("ground", [110, 140, 157, 134], "#fcfcfd"),
    { id: "done", box: DONE.box, sprite: DONE, frames: [[0, { opacity: 0 }], [0.19, { opacity: 0 }], [0.2, { opacity: 1 }]] },
  ],
};

/** Appointment confirmed: the tick stamps in with a ring */
const accepted = (src: string, size?: [number, number]): LiveScene => ({ length: 1.6, size, parts: success("tick", [158, 237, 60, 60], src, "#fff", "#22c55e", 0.2, size) });
/** In the film's phone, which shows the screen's first 812 points */
export const lagAccepted = accepted(lagTop("landlordAccepted"));

// On the project page ---------------------------------------------------------------------

export const phoneScenes: Record<string, LiveScene> = {
  [pr.splash.src]: powerrouteSplash,
  [pr.charging.src]: powerrouteCharging,
  [pr.booked.src]: powerrouteBooked,
  [pr.charged.src]: powerrouteCharged,
  [lp.splash.src]: lagSplash,
  [lp.paid.src]: lagPaid,
  [lp.landlordAccepted.src]: accepted(lp.landlordAccepted.src, [375, 1017]),
};
