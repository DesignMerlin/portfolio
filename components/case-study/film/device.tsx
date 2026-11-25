import Image from "next/image";
import { ENTER, SHEET, tap, type Frame } from "@/components/case-study/film/kit";

/**
 * The phone used for close-up films, and what happens on its screen: touches,
 * presses, typing. It's laid out at twice its size (globals.css zooms it to
 * suit the card), and everything on the screen is placed in the app's own
 * points (375×812) through PT.
 */
export const PT = 648 / 375;
export const SCREEN_W = 648;
export const SCREEN_H = 1404;

/**
 * One camera position. Position, then tilt, pan and roll, then a move along the phone's own surface
 * (lx, ly), which is what lets the camera skim the screen. Always the same functions in the same
 * order, so the browser interpolates each one rather than a matrix.
 */
export const shot = (x: number, y: number, z: number, tilt: number, pan: number, roll: number, lx = 0, ly = 0): Keyframe => ({
  transform: `translate3d(${x}px, ${y}px, ${z}px) rotateX(${tilt}deg) rotateY(${pan}deg) rotateZ(${roll}deg) translate3d(${lx}px, ${ly}px, 0px)`,
});

/** A place on the screen, in points */
export type Box = [x: number, y: number, w: number, h: number];
export const at = ([x, y, w, h]: Box): React.CSSProperties => ({ left: x * PT, top: y * PT, width: w * PT, height: h * PT });

// Tracks ------------------------------------------------------------------

/** Fades in and stays */
export const on = (t: number, d = 0.45): Frame[] => [
  [0, { opacity: 0 }],
  [t, { opacity: 0 }, ENTER],
  [t + d, { opacity: 1 }],
];

/**
 * Drawn from `from` (the start, if null) until `until`. Every layer is opacity 0 outside its moment,
 * so the GPU only ever draws the one or two screens you can see.
 */
export const show = (from: number | null, until = Infinity): Frame[] => [
  ...(from === null ? ([[0, { opacity: 1 }]] as Frame[]) : ([[0, { opacity: 0 }], [from - 0.02, { opacity: 0 }], [from, { opacity: 1 }]] as Frame[])),
  ...(until < Infinity ? ([[until, { opacity: 1 }], [until + 0.02, { opacity: 0 }]] as Frame[]) : []),
];

/** Pushed in from the right */
export const pushIn = (t: number, until = Infinity): Frame[] => [
  [0, { transform: "translateX(100%)" }],
  [t, { transform: "translateX(100%)" }, SHEET],
  [t + 0.6, { transform: "translateX(0%)" }],
  ...show(t, until),
];

/** A button going down and coming back */
const press = (t: number): Frame[] => [
  [0, { opacity: 0 }],
  [t - 0.03, { opacity: 0 }, ENTER],
  [t + 0.07, { opacity: 1 }],
  [t + 0.16, { opacity: 1 }, ENTER],
  [t + 0.42, { opacity: 0 }],
];

/** The field being typed in: its border lights while it has focus */
const focus = (t: number, until: number): Frame[] => [
  [0, { opacity: 0 }],
  [t, { opacity: 0 }, ENTER],
  [t + 0.2, { opacity: 1 }],
  [until, { opacity: 1 }, ENTER],
  [until + 0.25, { opacity: 0 }],
];

/** A caret blinks while it waits, holds while you type, and goes when the field loses focus */
const blink = (t: number, from: number, until: number): Frame[] => {
  const frames: Frame[] = [[0, { opacity: 0 }], [t, { opacity: 0 }], [t + 0.01, { opacity: 1 }]];
  let k = t + 0.3;
  let lit = true;
  for (; k < from - 0.05; k += 0.28, lit = !lit) frames.push([k - 0.01, { opacity: lit ? 1 : 0 }], [k, { opacity: lit ? 0 : 1 }]);
  frames.push([from - 0.01, { opacity: lit ? 1 : 0 }], [from, { opacity: 1 }], [until, { opacity: 1 }], [until + 0.01, { opacity: 0 }]);
  return frames;
};

// What happens on a screen ------------------------------------------------

export type Touch = { t: number; x: number; y: number };
/** A button and when it's pressed. `r`: its corner radius in points */
export type Press = { t: number; box: Box; r: number };
/**
 * Text arriving a character at a time. What's typed is the screen's own text, uncovered from the left
 * in steps (or `src`, an image of it, over an empty field).
 */
export type Typing = {
  /** When the field is tapped, when typing starts and ends, and when focus leaves */
  focusAt: number;
  from: number;
  to: number;
  blurAt: number;
  chars: number;
  /** The words themselves */
  text: Box;
  /** The field around them, for the focus ring */
  field: Box;
  r: number;
  /** The field's own colour, covering what hasn't been typed yet */
  bg: string;
  src?: string;
};

export function uiTracks(id: string, { touches = [], presses = [], typing = [] }: { touches?: Touch[]; presses?: Press[]; typing?: Typing[] }) {
  const tracks: Record<string, Frame[]> = {};
  touches.forEach((x, i) => (tracks[`${id}-touch-${i}`] = tap(x.t)));
  presses.forEach((x, i) => (tracks[`${id}-press-${i}`] = press(x.t)));
  typing.forEach((x, i) => {
    const steps = `steps(${x.chars}, jump-end)`;
    tracks[`${id}-cover-${i}`] = [
      [0, { transform: "translateX(0%)" }],
      [x.from, { transform: "translateX(0%)" }, steps],
      [x.to, { transform: "translateX(100%)" }],
    ];
    // Typed over a placeholder: it stays until the first character
    if (x.src) tracks[`${id}-ink-${i}`] = show(x.from);
    tracks[`${id}-focus-${i}`] = focus(x.focusAt, x.blurAt);
    const end = x.text[2] * PT;
    tracks[`${id}-caret-${i}`] = [
      [0, { transform: "translateX(0px)" }],
      [x.from, { transform: "translateX(0px)" }, steps],
      [x.to, { transform: `translateX(${end}px)` }],
      ...blink(x.focusAt, x.from, x.blurAt),
    ];
  });
  return tracks;
}

/** Fields and buttons, drawn inside the screen they belong to */
export function ScreenUI({ id, presses = [], typing = [] }: { id: string; presses?: Press[]; typing?: Typing[] }) {
  return (
    <>
      {typing.map((x, i) => (
        <span key={`t${i}`}>
          <span data-track={`${id}-ink-${i}`} className="fp-typed" style={{ ...at(x.text), background: x.src ? x.bg : undefined }}>
            {x.src ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={x.src} alt="" className="fp-typed-ink" draggable={false} />
            ) : null}
            <span data-track={`${id}-cover-${i}`} style={{ background: x.bg }} />
          </span>
          <span data-track={`${id}-focus-${i}`} className="fp-focus" style={{ ...at(x.field), borderRadius: x.r * PT }} />
          <span data-track={`${id}-caret-${i}`} className="fp-caret" style={{ left: x.text[0] * PT, top: (x.text[1] + 2) * PT, height: (x.text[3] - 4) * PT }} />
        </span>
      ))}
      {presses.map((x, i) => (
        <span key={`p${i}`} data-track={`${id}-press-${i}`} className="fp-press" style={{ ...at(x.box), borderRadius: x.r * PT }} />
      ))}
    </>
  );
}

/** The fingertip, above every screen */
export function Touches({ id, touches }: { id: string; touches: Touch[] }) {
  return touches.map((x, i) => <span key={i} data-track={`${id}-touch-${i}`} className="fp-touch" style={{ left: x.x * PT, top: x.y * PT }} />);
}

export function Still({ src, h = SCREEN_H }: { src: string; h?: number }) {
  return <Image src={src} alt="" width={SCREEN_W} height={h} sizes="1080px" loading="eager" draggable={false} style={{ height: h }} />;
}

/** The phone itself: body, walls, lit rim, bezel, then whatever is on its screen */
export function Device({ children }: { children: React.ReactNode }) {
  return (
    <div className="fp-phone">
      {/* Back to front */}
      <span className="fp-slab" style={{ transform: "translateZ(-38px)" }} />
      <span className="fp-slab" style={{ transform: "translateZ(-19px)" }} />
      {/* Walls along the straight edges; the slabs fill in the corners */}
      <span className="fp-wall" style={{ transform: "translateX(-348px) rotateY(90deg)" }} />
      <span className="fp-wall" style={{ transform: "translateX(348px) rotateY(90deg)" }} />
      <span className="fp-wall fp-wall-x" style={{ transform: "translateY(-726px) rotateX(90deg)" }} />
      <span className="fp-wall fp-wall-x" style={{ transform: "translateY(726px) rotateX(90deg)" }} />
      <span className="fp-rim" />
      <span data-track="rim" className="fp-rim fp-rim-b" />
      <span className="fp-bezel" />
      <div className="fp-screen">
        {children}
        <span className="fp-island" />
        <span data-track="glass" className="film-glare" />
      </div>
    </div>
  );
}

