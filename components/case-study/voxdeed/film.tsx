"use client";

import Image from "next/image";
import { FILM_DESKTOP, FILM_PHONE } from "@/components/case-study/film/kit";
import { PT, SCREEN_H, SCREEN_W } from "@/components/case-study/film/device";
import { DRIFT, ENTER, SHEET, type Frame } from "@/components/case-study/film/kit";
import { useFilm, type FilmProps, type FilmScript } from "@/components/case-study/film/use-film";
import { LiveParts, liveTracks, type LiveScene } from "@/components/case-study/live/kit";
import { featureParts, heroParts, stepsParts } from "@/components/case-study/live/voxdeed";
import { VX_LOGO } from "@/components/case-study/voxdeed/logo";
import { voxdeed } from "@/content/voxdeed";

/* ------------------------------------------------------------------ */
/* A voice note becomes a contract. One browser in the dark, lit red  */
/* like the product: the mark builds, the hero's window does the      */
/* product's one trick, and a pointer reads down the page: how it     */
/* works, what you get, what it costs, then signs up. A phone joins    */
/* for the part people read on the go.                                 */
/* ------------------------------------------------------------------ */

const SPRING = "cubic-bezier(0.34, 1.56, 0.64, 1)";
const PUNCH = "cubic-bezier(0.32, 0.72, 0, 1)";
const EASE_SCROLL = "cubic-bezier(0.45, 0, 0.2, 1)";

/** One loop, in seconds */
const T = 26;
/** When each part starts */
const HERO = 2.4;
const STEPS = 7.2;
const FEATURES = 11.2;
const PRICING = 15.2;
const CTA = 19.2;
const END = 24.4;

// The browser: 1440 points across 980 pixels -----

const BW = 980;
const BH = 612;
const BAR = 40;
const LPT = BW / 1440;
const ALONE: [number, number] = [102, 196];
const BESIDE: [number, number] = [46, 196];
const SHIFT = BESIDE[0] - ALONE[0];

const cam = (s: number, ox = 592, oy = 516): Keyframe => ({ transform: `translate(${(ox - 592) * (1 - s)}px, ${(oy - 516) * (1 - s)}px) scale(${s})` });
/** A point on the page, in the browser's points, as a stage position, with the page scrolled to `scroll` */
const onPage = (x: number, y: number, scroll: number, at = ALONE): [number, number] => [at[0] + x * LPT, at[1] + BAR + (y - scroll) * LPT];

/** Where the page is scrolled to, and when it gets there */
const SCROLLS: [from: number, to: number, y: number][] = [
  [HERO + 0.4, HERO + 1.2, 330],
  [STEPS - 0.6, STEPS + 0.4, 1250],
  [FEATURES - 0.4, FEATURES + 0.6, 2180],
  [PRICING - 0.4, PRICING + 0.6, 3930],
  [CTA - 0.4, CTA + 0.6, 5700],
  [END - 2, END - 1, 6342],
];

const CAMERA: Frame[] = [
  [0, cam(1)],
  [HERO + 1.2, cam(1), DRIFT],
  // Into the window while a voice note turns into a contract
  [HERO + 2.2, cam(1.18, ...onPage(707, 900, 330)), PUNCH],
  [HERO + 3.3, cam(1.18, ...onPage(707, 900, 330)), DRIFT],
  [HERO + 3.8, cam(1), DRIFT],
  // The vault, where it ends up
  [STEPS + 1.2, cam(1), DRIFT],
  [STEPS + 2.2, cam(1.12, ...onPage(1136, 1845, 1250)), PUNCH],
  [FEATURES - 1.4, cam(1.12, ...onPage(1136, 1845, 1250)), DRIFT],
  [FEATURES - 0.6, cam(1), DRIFT],
  // Try it
  [CTA + 0.8, cam(1), DRIFT],
  [CTA + 1.8, cam(1.14, ...onPage(640, 6250, 5700)), PUNCH],
  [END - 2.4, cam(1.14, ...onPage(640, 6250, 5700)), PUNCH],
  [END - 1.6, cam(1)],
  [T, cam(1)],
];

const at = (x: number, y = 0, s = 1): Keyframe => ({ transform: `translate3d(${x}px, ${y}px, 0px) scale(${s})` });
const BROWSER: Frame[] = [
  [0, at(0, 760, 0.94)],
  [1.1, at(0, 760, 0.94), PUNCH],
  [2, at(0, 0, 1)],
  [FEATURES - 1.2, at(0), SHEET],
  [FEATURES - 0.5, at(SHIFT)],
  [CTA - 0.9, at(SHIFT), SHEET],
  [CTA - 0.2, at(0)],
  [END, at(0), "cubic-bezier(0.5, 0, 0.8, 0.4)"],
  [END + 0.8, at(0, 820, 0.94)],
];
const PHONE_X = 1018;
const PHONE_Y = 560;
const PHONE: Frame[] = [
  [0, at(520, 120, 0.82)],
  [FEATURES - 1.1, at(520, 120, 0.82), SHEET],
  [FEATURES - 0.3, at(0, 0, 0.82)],
  [CTA - 1, at(0, 0, 0.82), "cubic-bezier(0.5, 0, 0.8, 0.4)"],
  [CTA - 0.3, at(520, 120, 0.82)],
];

const scroll = (pt: number, stops: [number, number, number][]): Frame[] => {
  const out: Frame[] = [[0, { transform: "translateY(0px)" }]];
  let y = 0;
  stops.forEach(([from, to, next]) => {
    out.push([from, { transform: `translateY(${(-y * pt).toFixed(1)}px)` }, EASE_SCROLL], [to, { transform: `translateY(${(-next * pt).toFixed(1)}px)` }]);
    y = next;
  });
  return out;
};

const HOME: LiveScene = {
  length: T,
  size: [1440, 7241],
  parts: [...heroParts(HERO + 1.3, END), ...stepsParts(STEPS, END, 0, STEPS + 0.3), ...featureParts(FEATURES + 1.4, END, 0, FEATURES + 0.5)],
};

/** The address bar: where the page is, typed */
const URLS: [string, number][] = [
  ["voxdeed.com", 1.5],
  ["voxdeed.com/#how-it-works", STEPS - 0.7],
  ["voxdeed.com/#features", FEATURES - 0.5],
  ["voxdeed.com/#pricing", PRICING - 0.5],
  ["voxdeed.com/#get-started", CTA - 0.5],
];
const typed = (text: string, t: number, until: number): Frame[] => [
  [0, { clipPath: "inset(0 100% 0 0)", opacity: 1 }],
  [t, { clipPath: "inset(0 100% 0 0)" }, `steps(${text.length}, jump-end)`],
  [t + Math.min(0.5, text.length * 0.03), { clipPath: "inset(0 0% 0 0)" }],
  ...(until < Infinity ? ([[until, { opacity: 1 }], [until + 0.01, { opacity: 0 }]] as Frame[]) : []),
];

// The pointer: where it goes, in the window's points (page y minus scroll), and whether it clicks -----

type Stroke = [t: number, x: number, y: number, press?: boolean];
const POINTER: Stroke[] = [
  [HERO + 1.4, 1100, 720],
  // Watches the voice note come in, then the AI work on it
  [HERO + 2.2, 960, 420],
  [HERO + 3.0, 520, 520],
  // See how it works
  [HERO + 4.0, 854, 565 - 330, true],
  // The microphone, then the vault
  [STEPS + 1.4, 377, 1946 - 1250],
  [STEPS + 2.6, 1180, 1845 - 1250],
  // Past the features to the price people pick
  [FEATURES + 2.4, 760, 2560 - 2180],
  [PRICING + 1.4, 720, 4480 - 3930],
  [PRICING + 3, 760, 4330 - 3930],
  // Try it
  [CTA + 1.3, 629, 6340 - 5700, true],
  [END - 0.6, 1500, 760],
];
const spot = (x: number, y: number) => ({ transform: `translate3d(${(x * LPT).toFixed(1)}px, ${(BAR + y * LPT).toFixed(1)}px, 0px)` });
const POINTER_TRACK: Frame[] = [[0, spot(1500, 760)]];
POINTER.forEach(([t, x, y], i) => {
  const prev = POINTER[i - 1];
  if (prev) POINTER_TRACK.push([Math.max(prev[0] + 0.08, t - 0.6), spot(prev[1], prev[2]), "cubic-bezier(0.45, 0.05, 0.2, 1)"]);
  POINTER_TRACK.push([t, spot(x, y)]);
});
const PRESSES = POINTER.filter((p) => p[3]);

// The mark at the start ---------------------------------------------------

const LOGO_W = 440;
const LOGO_H = (LOGO_W * VX_LOGO.h) / VX_LOGO.w;
const LAND: [number, number] = onPage(136 + VX_LOGO.w / 2, 72.7 + VX_LOGO.h / 2, 0);

const tracks: FilmScript["tracks"] = {
  camera: CAMERA,
  browser: BROWSER,
  phone: PHONE,
  "d-scroll": scroll(LPT, SCROLLS),
  "m-scroll": scroll(PT, [
    [FEATURES - 0.6, FEATURES + 0.4, 3440],
    [FEATURES + 2.4, FEATURES + 3.3, 4260],
    [PRICING - 0.2, PRICING + 0.8, 5420],
    [PRICING + 2.2, PRICING + 3.1, 6300],
  ]),
  logo: [
    [0, { transform: "translate3d(0px, 0px, 0px) scale(1)", opacity: 1 }],
    [1.3, { transform: "translate3d(0px, 0px, 0px) scale(1)" }, PUNCH],
    [2.1, { transform: `translate3d(${(LAND[0] - 592).toFixed(1)}px, ${(LAND[1] - 516).toFixed(1)}px, 0px) scale(${((VX_LOGO.w * LPT) / LOGO_W).toFixed(4)})`, opacity: 1 }],
    [2.2, { opacity: 1 }],
    [2.25, { opacity: 0 }],
  ],
  // The mark swings up into place like a seal being pressed, then the name writes itself out of it
  "logo-mark": [
    [0, { transform: "translateY(40%) rotate(-24deg) scale(0.3)", opacity: 0 }],
    [0.1, { transform: "translateY(40%) rotate(-24deg) scale(0.3)", opacity: 0 }, SPRING],
    [0.18, { opacity: 1 }],
    [0.7, { transform: "translateY(0%) rotate(0deg) scale(1)" }],
  ],
  "logo-letters": [
    [0, { clipPath: "inset(0 100% 0 0)", transform: "translateX(-8%)" }],
    [0.5, { clipPath: "inset(0 100% 0 0)", transform: "translateX(-8%)" }, "cubic-bezier(0.6, 0, 0.2, 1)"],
    [1.1, { clipPath: "inset(0 0% 0 0)", transform: "translateX(0%)" }],
  ],
  pointer: POINTER_TRACK,
  "pointer-show": [
    [0, { opacity: 0 }],
    [HERO + 1.1, { opacity: 0 }, ENTER],
    [HERO + 1.4, { opacity: 1 }],
    [END - 0.8, { opacity: 1 }, ENTER],
    [END - 0.5, { opacity: 0 }],
  ],
  wash: [
    [0, { transform: "translate(0%, 0%) rotate(0deg)" }, DRIFT],
    [T / 2, { transform: "translate(5%, -4%) rotate(-10deg)" }, DRIFT],
    [T, { transform: "translate(0%, 0%) rotate(0deg)" }],
  ],
  ...liveTracks("d-live", HOME, 0),
};
URLS.forEach(([text, t], i) => (tracks[`url-${i}`] = typed(text, t, URLS[i + 1] ? URLS[i + 1]![1] : Infinity)));
PRESSES.forEach(([t], i) => {
  tracks[`press-${i}`] = [
    [0, { opacity: 0, transform: "scale(0.3)" }],
    [t - 0.01, { opacity: 0, transform: "scale(0.3)" }],
    [t, { opacity: 0.85, transform: "scale(0.3)" }, ENTER],
    [t + 0.45, { opacity: 0, transform: "scale(1)" }],
  ];
});
// Moves written close together can overlap by a hair: keep every track in time order
Object.values(tracks).forEach((frames) =>
  frames.forEach((f, i) => {
    if (i && f[0] < frames[i - 1]![0]) f[0] = frames[i - 1]![0];
  }),
);

const script: FilmScript = {
  length: T,
  // The contract has just come back
  poster: HERO + 3.9,
  tones: [[0, "dark"]],
  tracks,
};

/**
 * Voxdeed as a short film: the mark builds, the hero's window turns a voice note into a contract, and a
 * pointer reads down the landing page (how it works, features, pricing) with a phone alongside, then signs up.
 */
export default function VoxdeedFilm(props: FilmProps) {
  const { root, stage } = useFilm(script, props);
  const d = voxdeed.home;
  const m = voxdeed.mHome;
  return (
    <div ref={root} aria-hidden="true" className="film ix vx absolute inset-0 overflow-hidden">
      <div ref={stage} className="film-stage ix-stage" style={{ visibility: "hidden" }}>
        <span data-track="wash" className="ix-wash vx-wash" />
        <span className="ix-grid vx-grid" />

        <div data-track="camera" className="ix-camera">
          <div data-track="browser" className="ix-browser" style={{ left: ALONE[0], top: ALONE[1], width: BW }}>
            <div className="ix-bar">
              <span className="ix-dots">
                <i />
                <i />
                <i />
              </span>
              <span className="ix-url">
                <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true">
                  <path d="M5 7V5a3 3 0 0 1 6 0v2M4 7h8v6H4z" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinejoin="round" />
                </svg>
                <span className="ix-url-text">
                  {URLS.map(([text], i) => (
                    <span key={i} data-track={`url-${i}`}>
                      {text}
                    </span>
                  ))}
                </span>
              </span>
            </div>
            <div className="ix-screen" style={{ height: BH }}>
              <div className="ix-layer" style={{ width: BW }}>
                <div data-track="d-scroll" className="ix-scroll">
                  <Image src={d.src} alt="" width={BW} height={Math.round(d.h * LPT)} sizes={FILM_DESKTOP} loading="eager" draggable={false} style={{ width: BW, height: d.h * LPT }} />
                  <span className="ix-live" style={{ width: BW, height: d.h * LPT }}>
                    <LiveParts id="d-live" scene={HOME} />
                  </span>
                </div>
              </div>
            </div>
            <span data-track="pointer-show" className="ix-pen-layer">
              {PRESSES.map(([, x, y], i) => (
                <span key={i} data-track={`press-${i}`} className="ix-press" style={{ left: x * LPT, top: BAR + y * LPT }} />
              ))}
              <span data-track="pointer" className="ix-pen">
                <svg viewBox="0 0 24 28" width="26" height="30" className="ix-pointer">
                  <path d="M3 2.5v19.2l4.9-4.6 3 7.1 3.6-1.5-3-7h6.7z" fill="#0b0b0c" stroke="#fff" strokeWidth="1.8" strokeLinejoin="round" />
                </svg>
              </span>
            </span>
          </div>

          <div data-track="phone" className="ix-at" style={{ left: PHONE_X, top: PHONE_Y }}>
            <div className="yo-phone">
              <span className="yo-button" style={{ left: -358, top: -430, height: 62 }} />
              <span className="yo-button" style={{ left: -358, top: -324, height: 116 }} />
              <span className="yo-button" style={{ left: -358, top: -186, height: 116 }} />
              <span className="yo-button" style={{ left: 352, top: -290, height: 176 }} />
              <span className="yo-frame" />
              <span className="fp-bezel" />
              <div className="fp-screen" style={{ height: SCREEN_H }}>
                <div className="ix-layer" style={{ width: SCREEN_W }}>
                  <div data-track="m-scroll" className="ix-scroll">
                    <Image src={m.src} alt="" width={SCREEN_W} height={Math.round(m.h * PT)} sizes={FILM_PHONE} loading="eager" draggable={false} style={{ width: SCREEN_W, height: m.h * PT }} />
                  </div>
                </div>
                <span className="fp-island" />
              </div>
            </div>
          </div>
        </div>

        <div data-track="logo" className="ix-logo" style={{ width: LOGO_W, height: LOGO_H, marginLeft: -LOGO_W / 2, marginTop: -LOGO_H / 2 }}>
          <svg viewBox={`0 0 ${VX_LOGO.w} ${VX_LOGO.h}`} width={LOGO_W} height={LOGO_H}>
            <g data-track="logo-letters" dangerouslySetInnerHTML={{ __html: VX_LOGO.letters }} />
            <g data-track="logo-mark" style={{ transformBox: "fill-box", transformOrigin: "50% 100%" }} dangerouslySetInnerHTML={{ __html: VX_LOGO.mark }} />
          </svg>
        </div>
      </div>
    </div>
  );
}
