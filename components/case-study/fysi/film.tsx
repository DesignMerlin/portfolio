"use client";

import Image from "next/image";
import { FILM_DESKTOP, FILM_PHONE } from "@/components/case-study/film/kit";
import { PT, SCREEN_H, SCREEN_W, show } from "@/components/case-study/film/device";
import { DRIFT, ENTER, SHEET, type Frame } from "@/components/case-study/film/kit";
import { useFilm, type FilmProps, type FilmScript } from "@/components/case-study/film/use-film";
import { fysi, type FysiScreen } from "@/content/fysi";

/* ------------------------------------------------------------------ */
/* Both sides of a green marketplace. A shopper: the homepage scrolls  */
/* from eco-products to best sellers, Shop Now, clothing, the cart,    */
/* checkout and a pick-up store. A phone joins for the shop on the go. */
/* Then a vendor signs up, sets up shop and lands on a dashboard, and  */
/* the admin sees the whole marketplace's sales.                       */
/* ------------------------------------------------------------------ */

const PUNCH = "cubic-bezier(0.32, 0.72, 0, 1)";
const SHEET_IN = "cubic-bezier(0.22, 0.8, 0.24, 1)";
const EASE_SCROLL = "cubic-bezier(0.45, 0, 0.2, 1)";

/** One loop, in seconds */
const T = 32;
/** When each part starts */
const HOME = 1.2;
const CLOTHING = 6.2;
const CART = 8.8;
const CHECKOUT = 11.0;
const PICKUP = 12.8;
const SIGNUP = 15.6;
const VENDOR = 17.8;
const DONE = 19.8;
const DASH = 21.8;
const PRODUCTS = 24.4;
const ADMIN = 26.6;
const END = 30.0;

// The browser: 1440 points across 980 pixels -----

const BW = 980;
const BH = 612;
const BAR = 40;
const LPT = BW / 1440;
const ALONE: [number, number] = [102, 196];
const BESIDE: [number, number] = [46, 196];
const SHIFT = BESIDE[0] - ALONE[0];

const cam = (s: number, ox = 592, oy = 516): Keyframe => ({ transform: `translate(${(ox - 592) * (1 - s)}px, ${(oy - 516) * (1 - s)}px) scale(${s})` });
const onPage = (x: number, y: number, scroll: number, at = ALONE): [number, number] => [at[0] + x * LPT, at[1] + BAR + (y - scroll) * LPT];

const CAMERA: Frame[] = [
  [0, cam(1)],
  // The hero, close
  [HOME + 1.2, cam(1), DRIFT],
  [HOME + 2.2, cam(1.16, ...onPage(500, 460, 0)), PUNCH],
  [HOME + 3.2, cam(1.16, ...onPage(500, 460, 0)), DRIFT],
  [HOME + 4.0, cam(1), DRIFT],
  // The cart's checkout button
  [CART + 0.8, cam(1), DRIFT],
  [CART + 1.6, cam(1.14, ...onPage(1100, 420, 0)), PUNCH],
  [CHECKOUT - 0.2, cam(1.14, ...onPage(1100, 420, 0)), DRIFT],
  [CHECKOUT + 0.4, cam(1), DRIFT],
  // Congratulations
  [DONE + 0.4, cam(1), DRIFT],
  [DONE + 1.2, cam(1.16, ...onPage(720, 620, 0)), PUNCH],
  [DASH - 0.2, cam(1.16, ...onPage(720, 620, 0)), DRIFT],
  [DASH + 0.4, cam(1), DRIFT],
  // The vendor's sales
  [DASH + 1.2, cam(1), DRIFT],
  [DASH + 2.0, cam(1.12, ...onPage(780, 380, 0)), PUNCH],
  [PRODUCTS - 0.2, cam(1.12, ...onPage(780, 380, 0)), DRIFT],
  [PRODUCTS + 0.4, cam(1), DRIFT],
  // The marketplace's sales
  [ADMIN + 1.0, cam(1), DRIFT],
  [ADMIN + 1.8, cam(1.14, ...onPage(700, 330, 0)), PUNCH],
  [END - 0.4, cam(1.14, ...onPage(700, 330, 0)), PUNCH],
  [END + 0.4, cam(1)],
  [T, cam(1)],
];

const at = (x: number, y = 0, s = 1): Keyframe => ({ transform: `translate3d(${x}px, ${y}px, 0px) scale(${s})` });
const BROWSER: Frame[] = [
  [0, at(0, 760, 0.94)],
  [0.2, at(0, 760, 0.94), PUNCH],
  [1.1, at(0, 0, 1)],
  [CART - 1.6, at(0), SHEET],
  [CART - 0.9, at(SHIFT)],
  [SIGNUP - 0.5, at(SHIFT), SHEET],
  [SIGNUP + 0.2, at(0)],
  [END, at(0), "cubic-bezier(0.5, 0, 0.8, 0.4)"],
  [END + 0.8, at(0, 820, 0.94)],
];
const PHONE_X = 1018;
const PHONE_Y = 560;
const PHONE: Frame[] = [
  [0, at(520, 120, 0.82)],
  [CART - 1.5, at(520, 120, 0.82), SHEET],
  [CART - 0.7, at(0, 0, 0.82)],
  [SIGNUP - 0.6, at(0, 0, 0.82), "cubic-bezier(0.5, 0, 0.8, 0.4)"],
  [SIGNUP + 0.1, at(520, 120, 0.82)],
];

// The pages -----

type Layer = { id: string; screen: FysiScreen; frames: Frame[]; scroll?: Frame[] };
const scroll = (pt: number, ...stops: [from: number, to: number, y: number][]): Frame[] => {
  const out: Frame[] = [[0, { transform: "translateY(0px)" }]];
  let y = 0;
  stops.forEach(([from, to, next]) => {
    out.push([from, { transform: `translateY(${(-y * pt).toFixed(1)}px)` }, EASE_SCROLL], [to, { transform: `translateY(${(-next * pt).toFixed(1)}px)` }]);
    y = next;
  });
  return out;
};
/** The next page slides up over the last, and stays until `until` */
const sheet = (t: number, until = Infinity): Frame[] => [
  [0, { transform: "translateY(104%)" }],
  [t, { transform: "translateY(104%)" }, SHEET_IN],
  [t + 0.7, { transform: "translateY(0%)" }],
  ...show(t, until),
];
/** A modal over the page: it fades in where it is */
const over = (t: number, until = Infinity): Frame[] => [
  [0, { opacity: 0, transform: "translateY(0%)" }],
  [t, { opacity: 0 }, ENTER],
  [t + 0.4, { opacity: 1 }],
  ...(until < Infinity ? ([[until, { opacity: 1 }], [until + 0.01, { opacity: 0 }]] as Frame[]) : []),
];

const LAYERS: Layer[] = [
  { id: "home", screen: "home", frames: show(1.1, CLOTHING + 0.72), scroll: scroll(LPT, [HOME + 3.6, HOME + 4.6, 1500]) },
  { id: "clothing", screen: "clothing", frames: sheet(CLOTHING, CART + 0.72), scroll: scroll(LPT, [CLOTHING + 0.9, CLOTHING + 2.0, 700]) },
  { id: "cart", screen: "cart", frames: sheet(CART, CHECKOUT + 0.72) },
  { id: "checkout", screen: "checkout", frames: sheet(CHECKOUT, SIGNUP + 0.72) },
  { id: "pickup", screen: "pickup", frames: over(PICKUP, SIGNUP + 0.72) },
  { id: "signup", screen: "signup", frames: sheet(SIGNUP, VENDOR + 0.72) },
  { id: "vendor", screen: "vendorStart", frames: sheet(VENDOR, DONE + 0.72) },
  { id: "done", screen: "vendorDone", frames: over(DONE, DASH + 0.72) },
  { id: "dash", screen: "vendorOverview", frames: sheet(DASH, PRODUCTS + 0.72) },
  { id: "products", screen: "vendorProducts", frames: sheet(PRODUCTS, ADMIN + 0.72), scroll: scroll(LPT, [PRODUCTS + 0.9, PRODUCTS + 1.8, 250]) },
  { id: "admin", screen: "adminAnalytics", frames: sheet(ADMIN, END + 1) },
];
const PHONE_LAYERS: Layer[] = [
  { id: "m-home", screen: "mHome", frames: show(0, SIGNUP - 0.2), scroll: scroll(PT, [CART - 0.2, CART + 1.2, 520], [CHECKOUT + 0.4, CHECKOUT + 1.6, 1000], [PICKUP + 0.6, PICKUP + 1.8, 0]) },
];

/** The address bar: each page's address, typed */
const URLS: [string, number][] = [
  ["fysi.com", 0.9],
  ["fysi.com/clothing", CLOTHING - 0.35],
  ["fysi.com/cart", CART - 0.35],
  ["fysi.com/checkout", CHECKOUT - 0.35],
  ["fysi.com/sell", SIGNUP - 0.35],
  ["fysi.com/sell/setup", VENDOR - 0.35],
  ["vendor.fysi.com/overview", DASH - 0.35],
  ["vendor.fysi.com/products", PRODUCTS - 0.35],
  ["admin.fysi.com/analytics", ADMIN - 0.35],
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
  [HOME + 1.0, 900, 640],
  [HOME + 2.6, 197, 461, true], // Shop Now
  [CLOTHING + 2.4, 330, 560],
  [CART - 0.3, 330, 560, true], // a product
  [CART + 1.4, 1186, 456, true], // Checkout
  [CHECKOUT + 1.2, 900, 520],
  [PICKUP - 0.2, 1340, 600, true], // Select pick-up store
  [PICKUP + 1.6, 456, 614, true], // Select
  [SIGNUP + 1.2, 1022, 634, true], // Sign up
  [VENDOR + 1.2, 1032, 619, true], // Next
  [DONE + 1.3, 720, 744, true], // Go to dashboard
  [DASH + 1.6, 780, 380],
  [PRODUCTS + 1.4, 1000, 420],
  [ADMIN + 1.4, 700, 330],
  [END - 0.2, 1500, 760],
];
const spot = (x: number, y: number) => ({ transform: `translate3d(${(x * LPT).toFixed(1)}px, ${(BAR + y * LPT).toFixed(1)}px, 0px)` });
const POINTER_TRACK: Frame[] = [[0, spot(1500, 760)]];
POINTER.forEach(([t, x, y], i) => {
  const prev = POINTER[i - 1];
  if (prev) POINTER_TRACK.push([Math.max(prev[0] + 0.08, t - 0.6), spot(prev[1], prev[2]), "cubic-bezier(0.45, 0.05, 0.2, 1)"]);
  POINTER_TRACK.push([t, spot(x, y)]);
});
const PRESSES = POINTER.filter((p) => p[3]);

const tracks: FilmScript["tracks"] = {
  camera: CAMERA,
  browser: BROWSER,
  phone: PHONE,
  pointer: POINTER_TRACK,
  "pointer-show": [
    [0, { opacity: 0 }],
    [HOME + 0.6, { opacity: 0 }, ENTER],
    [HOME + 0.9, { opacity: 1 }],
    [END - 0.4, { opacity: 1 }, ENTER],
    [END - 0.1, { opacity: 0 }],
  ],
  wash: [
    [0, { transform: "translate(0%, 0%) rotate(0deg)" }, DRIFT],
    [T / 2, { transform: "translate(-5%, 4%) rotate(10deg)" }, DRIFT],
    [T, { transform: "translate(0%, 0%) rotate(0deg)" }],
  ],
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
const addLayers = (layers: Layer[], prefix: string) =>
  layers.forEach((l) => {
    tracks[`${prefix}layer-${l.id}`] = l.frames;
    if (l.scroll) tracks[`${prefix}scroll-${l.id}`] = l.scroll;
  });
addLayers(LAYERS, "d-");
addLayers(PHONE_LAYERS, "m-");
// Moves written close together can overlap by a hair: keep every track in time order
Object.values(tracks).forEach((frames) =>
  frames.forEach((f, i) => {
    if (i && f[0] < frames[i - 1]![0]) f[0] = frames[i - 1]![0];
  }),
);

const script: FilmScript = {
  length: T,
  // The clothing aisle, with the phone beside it
  poster: CLOTHING + 2.2,
  tones: [[0, "light"]],
  tracks,
};

function Page({ l, pt, w, prefix }: { l: Layer; pt: number; w: number; prefix: string }) {
  const s = fysi[l.screen];
  const h = s.h * pt;
  const img = <Image src={s.src} alt="" width={w} height={Math.round(h)} sizes={prefix === "m-" ? FILM_PHONE : FILM_DESKTOP} loading="eager" draggable={false} style={{ width: w, height: h }} />;
  return (
    <div data-track={`${prefix}layer-${l.id}`} className="ix-layer" style={{ width: w }}>
      {l.scroll ? (
        <div data-track={`${prefix}scroll-${l.id}`} className="ix-scroll">
          {img}
        </div>
      ) : (
        img
      )}
    </div>
  );
}

/**
 * Fysi as a short film: a browser on a soft green wash and a pointer shopping the marketplace (homepage,
 * clothing, cart, checkout, a pick-up store) with a phone alongside, then a vendor setting up shop and
 * landing on their dashboard, and the admin's view of the whole marketplace.
 */
export default function FysiFilm(props: FilmProps) {
  const { root, stage } = useFilm(script, props);
  return (
    <div ref={root} aria-hidden="true" className="film ix fy absolute inset-0 overflow-hidden">
      <div ref={stage} className="film-stage ix-stage" style={{ visibility: "hidden" }}>
        <span data-track="wash" className="ix-wash fy-wash" />
        <span className="ix-grid fy-grid" />

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
              {LAYERS.map((l) => (
                <Page key={l.id} l={l} pt={LPT} w={BW} prefix="d-" />
              ))}
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
                {PHONE_LAYERS.map((l) => (
                  <Page key={l.id} l={l} pt={PT} w={SCREEN_W} prefix="m-" />
                ))}
                <span className="fp-island" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
