"use client";

import Image from "next/image";
import { FILM_DESKTOP, FILM_PHONE } from "@/components/case-study/film/kit";
import { PT, SCREEN_H, SCREEN_W, show } from "@/components/case-study/film/device";
import { DRIFT, ENTER, SHEET, type Frame } from "@/components/case-study/film/kit";
import { useFilm, type FilmProps, type FilmScript } from "@/components/case-study/film/use-film";
import { LiveParts, liveTracks, type LiveScene, type Part } from "@/components/case-study/live/kit";
import { CARD_X, CARD_Y, cardParts, dashParts, heroParts, submittedParts } from "@/components/case-study/live/iexcelo";
import { IX_LOGO } from "@/components/case-study/iexcelo/logo";
import { iexcelo, type IxScreen } from "@/content/iexcelo";

/* ------------------------------------------------------------------ */
/* Marking a script. One browser on iExcelo's own pink-to-blue wash,   */
/* and a pointer that clicks its way through the product.             */
/* uses. Pages arrive like the next sheet of an exam paper, sliding up */
/* over the last, and the pointer finishes on the score.              */
/* A phone joins for the pages people read on the way to school.       */
/* ------------------------------------------------------------------ */

const SPRING = "cubic-bezier(0.34, 1.56, 0.64, 1)";
const PUNCH = "cubic-bezier(0.32, 0.72, 0, 1)";
const SHEET_IN = "cubic-bezier(0.22, 0.8, 0.24, 1)";

/** One loop, in seconds */
const T = 36;
/** When each part starts */
const HERO = 2.2;
const CARDS = 7.6;
const TOUR = 12.4;
const PAGE = 1.95;
const DASH = 24.6;
const EXAM = 27.4;
const QUESTION = 28.7;
const DONE = 30.9;
const END = 34.2;

// The browser: 1440 points across 980 pixels -----

const BW = 980;
const BH = 612;
const BAR = 40;
const LPT = BW / 1440;
/** Where the browser sits: alone, and with the phone beside it */
const ALONE: [number, number] = [102, 196];
const BESIDE: [number, number] = [46, 196];
const SHIFT = BESIDE[0] - ALONE[0];

// The camera: a point in the stage held still while it pushes in -----

const cam = (s: number, ox = 592, oy = 516): Keyframe => ({ transform: `translate(${(ox - 592) * (1 - s)}px, ${(oy - 516) * (1 - s)}px) scale(${s})` });
/** A point on the page, in the browser's points, as a stage position */
const onPage = (x: number, y: number, scroll: number, at = ALONE): [number, number] => [at[0] + x * LPT, at[1] + BAR + (y - scroll) * LPT];

const CAMERA: Frame[] = [
  [0, cam(1)],
  [HERO + 1.8, cam(1), DRIFT],
  [HERO + 3.6, cam(1.14, ...onPage(700, 1000, 330)), PUNCH],
  [CARDS - 0.6, cam(1.14, ...onPage(700, 1000, 330)), DRIFT],
  [CARDS + 0.4, cam(1), DRIFT],
  [CARDS + 2.6, cam(1.06, ...onPage(720, 2980, 2480)), DRIFT],
  [TOUR - 0.6, cam(1.06, ...onPage(720, 2980, 2480)), PUNCH],
  [TOUR + 0.2, cam(1), DRIFT],
  [DASH + 1.4, cam(1), DRIFT],
  [DASH + 2.6, cam(1.08, ...onPage(860, 600, 0)), DRIFT],
  [QUESTION + 0.2, cam(1.08, ...onPage(860, 600, 0)), PUNCH],
  [QUESTION + 0.9, cam(1.2, ...onPage(300, 460, 0)), DRIFT],
  [DONE - 0.3, cam(1.2, ...onPage(300, 460, 0)), PUNCH],
  [DONE + 0.5, cam(1.06, ...onPage(800, 330, 0)), DRIFT],
  [DONE + 2.2, cam(1.24, ...onPage(980, 462, 0)), PUNCH],
  [END - 0.2, cam(1.24, ...onPage(980, 462, 0)), PUNCH],
  [END + 0.5, cam(1)],
  [T, cam(1)],
];

/** The browser rises in, moves aside for the phone, and goes at the end */
const at = (x: number, y = 0, s = 1): Keyframe => ({ transform: `translate3d(${x}px, ${y}px, 0px) scale(${s})` });
const BROWSER: Frame[] = [
  [0, at(0, 760, 0.94)],
  [1.1, at(0, 760, 0.94), PUNCH],
  [2, at(0, 0, 1)],
  [TOUR - 1.6, at(0), SHEET],
  [TOUR - 0.9, at(SHIFT)],
  [DASH - 0.5, at(SHIFT), SHEET],
  [DASH + 0.2, at(0)],
  [END, at(0), "cubic-bezier(0.5, 0, 0.8, 0.4)"],
  [END + 0.8, at(0, 820, 0.94)],
];
const PHONE_X = 1018;
const PHONE_Y = 560;
const PHONE: Frame[] = [
  [0, at(520, 120, 0.82)],
  [TOUR - 1.5, at(520, 120, 0.82), SHEET],
  [TOUR - 0.7, at(0, 0, 0.82)],
  [DASH - 0.6, at(0, 0, 0.82), "cubic-bezier(0.5, 0, 0.8, 0.4)"],
  [DASH + 0.1, at(520, 120, 0.82)],
];

// The pages -----

type Layer = {
  id: string;
  screen: IxScreen;
  frames: Frame[];
  scroll?: Frame[];
  /** Scenes on the page and when they start */
  live?: [LiveScene, number, number?][];
};
const scroll = (pt: number, ...stops: [from: number, to: number, y: number][]): Frame[] => {
  const out: Frame[] = [[0, { transform: "translateY(0px)" }]];
  let y = 0;
  stops.forEach(([from, to, next]) => {
    out.push([from, { transform: `translateY(${(-y * pt).toFixed(1)}px)` }, "cubic-bezier(0.45, 0, 0.2, 1)"], [to, { transform: `translateY(${(-next * pt).toFixed(1)}px)` }]);
    y = next;
  });
  return out;
};
/** The next page slides up over the last, like turning to the next sheet, and stays until `until` */
const sheet = (t: number, until = Infinity): Frame[] => [
  [0, { transform: "translateY(104%)" }],
  [t, { transform: "translateY(104%)" }, SHEET_IN],
  [t + 0.7, { transform: "translateY(0%)" }],
  ...show(t, until),
];
const scene = (parts: Part[], size: [number, number]): LiveScene => ({ length: T, size, parts });

const HOME_PARTS = scene([...heroParts(HERO, HERO + 1.9), ...cardParts(CARD_Y, CARDS + 1.1, TOUR + 0.5)], [1440, 5985]);
const DASH_PARTS = scene(dashParts(DASH + 0.6), [1440, 1024]);
const QUESTION_PARTS = scene(
  [
    // Not answered yet: an empty choice over the picked one, gone when it's clicked
    { id: "b-empty", box: [160, 421, 22, 22], bg: "#fff", r: "50%", border: "1.5px solid #d0d5dd", frames: [[0, { opacity: 1 }], [QUESTION + 1.15, { opacity: 1 }], [QUESTION + 1.2, { opacity: 0 }]] },
  ],
  [1440, 1016],
);
const DONE_PARTS = scene(submittedParts(DONE + 0.4), [1440, 1024]);

const HOME_SCROLL = scroll(LPT, [HERO + 3, HERO + 3.9, 330], [CARDS - 0.2, CARDS + 0.9, 2480]);
const TOUR_PAGES: [IxScreen, IxScreen, string, number][] = [
  ["about", "mAbout", "about-us", 900],
  ["revision", "mRevision", "exam-revision", 760],
  ["giveback", "mGiveback", "giveback", 700],
  ["affiliate", "mAffiliate", "affiliate", 600],
  ["faq", "mFaq", "faqs", 520],
  ["contact", "mContact", "contact-us", 400],
];
const pageAt = (i: number) => TOUR + 0.2 + i * PAGE;

const LAYERS: Layer[] = [
  { id: "home", screen: "home", frames: show(1.45, pageAt(0) + 0.72), scroll: HOME_SCROLL, live: [[HOME_PARTS, 0]] },
  ...TOUR_PAGES.map(([screen, , , depth], i): Layer => {
    const t = pageAt(i);
    const next = i === TOUR_PAGES.length - 1 ? DASH + 0.72 : pageAt(i + 1) + 0.72;
    return { id: screen, screen, frames: sheet(t, next), scroll: scroll(LPT, [t + 0.8, t + PAGE + 0.6, depth]) };
  }),
  { id: "dash", screen: "dash", frames: sheet(DASH, EXAM + 0.72), live: [[DASH_PARTS, 0]] },
  { id: "exam", screen: "exam", frames: sheet(EXAM, QUESTION + 0.72) },
  { id: "question", screen: "question", frames: sheet(QUESTION, DONE + 0.72), live: [[QUESTION_PARTS, 0]] },
  { id: "done", screen: "submitted", frames: sheet(DONE, END + 1), live: [[DONE_PARTS, 0]] },
];
const PHONE_LAYERS: Layer[] = [
  { id: "m-home", screen: "mHome", frames: show(0, pageAt(0) + 0.7), scroll: scroll(PT, [TOUR - 0.6, pageAt(0) + 0.4, 1650]) },
  ...TOUR_PAGES.map(([, screen, , depth], i): Layer => {
    const t = pageAt(i) + 0.12;
    const next = i === TOUR_PAGES.length - 1 ? Infinity : pageAt(i + 1) + 0.82;
    return { id: screen, screen, frames: sheet(t, next), scroll: scroll(PT, [t + 0.8, t + PAGE + 0.5, depth * 1.6]) };
  }),
];

/** The address bar: each page's address, typed */
const URLS: [string, number][] = [
  ["iexcelo.com", 1.5],
  ...TOUR_PAGES.map(([, , path], i): [string, number] => [`iexcelo.com/${path}`, pageAt(i) - 0.35]),
  ["app.iexcelo.com/dashboard", DASH - 0.35],
  ["app.iexcelo.com/exams", EXAM - 0.35],
];
const typed = (text: string, t: number, until: number): Frame[] => [
  [0, { clipPath: "inset(0 100% 0 0)", opacity: 1 }],
  [t, { clipPath: "inset(0 100% 0 0)" }, `steps(${text.length}, jump-end)`],
  [t + Math.min(0.5, text.length * 0.03), { clipPath: "inset(0 0% 0 0)" }],
  ...(until < Infinity ? ([[until, { opacity: 1 }], [until + 0.01, { opacity: 0 }]] as Frame[]) : []),
];

// The pointer: where it goes, in the window's points, and whether it clicks -----

type Stroke = [t: number, x: number, y: number, press?: boolean];
const PEN: Stroke[] = [
  [HERO + 1.2, 860, 640],
  // Over the promise, then down to the dashboard
  [HERO + 2.2, 470, 372],
  [HERO + 3.3, 1000, 600],
  // Across the three cards, the page scrolled to 2480
  ...CARD_X.map((x, i): Stroke => [CARDS + 2.2 + i * 0.75, x + 200, CARD_Y + 120 - 2480]),
  [CARDS + 4.4, 1300, 700],
  [TOUR - 0.4, 1520, 760],
  // The dashboard: start an exam, pick an answer, submit
  [DASH + 2.9, 405, 278, true],
  [EXAM + 0.6, 346, 243, true],
  [QUESTION + 1.15, 171, 432, true],
  [QUESTION + 1.9, 814, 606, true],
  // The score
  [DONE + 2.4, 990, 470],
  [END + 0.2, 1500, 760],
];
const spot = (x: number, y: number) => ({ transform: `translate3d(${(x * LPT).toFixed(1)}px, ${(BAR + y * LPT).toFixed(1)}px, 0px)` });
const PEN_TRACK: Frame[] = [[0, spot(1520, 760)]];
PEN.forEach(([t, x, y], i) => {
  const prev = PEN[i - 1];
  if (prev) PEN_TRACK.push([Math.max(prev[0] + 0.08, t - 0.5), spot(prev[1], prev[2]), "cubic-bezier(0.45, 0.05, 0.2, 1)"]);
  PEN_TRACK.push([t, spot(x, y)]);
});
const PRESSES = PEN.filter((p) => p[3]);

// The mark at the start ---------------------------------------------------

const LOGO_W = 420;
const LOGO_H = (LOGO_W * 33) / 88;
const LAND: [number, number] = onPage(306 + 44, 70 + 16, 0);
const LOGO: Frame[] = [
  [0, { transform: "translate3d(0px, 0px, 0px) scale(1)", opacity: 1 }],
  [1.25, { transform: "translate3d(0px, 0px, 0px) scale(1)" }, PUNCH],
  [2.05, { transform: `translate3d(${(LAND[0] - 592).toFixed(1)}px, ${(LAND[1] - 516).toFixed(1)}px, 0px) scale(${(88 * LPT) / LOGO_W})`, opacity: 1 }],
  [2.15, { opacity: 1 }],
  [2.2, { opacity: 0 }],
];

const tracks: FilmScript["tracks"] = {
  camera: CAMERA,
  browser: BROWSER,
  phone: PHONE,
  logo: LOGO,
  pen: PEN_TRACK,
  "pen-show": [
    [0, { opacity: 0 }],
    [HERO + 0.8, { opacity: 0 }, ENTER],
    [HERO + 1.1, { opacity: 1 }],
    [TOUR - 0.9, { opacity: 1 }, ENTER],
    [TOUR - 0.6, { opacity: 0 }],
    [DASH + 1.6, { opacity: 0 }, ENTER],
    [DASH + 1.9, { opacity: 1 }],
    [END + 0.2, { opacity: 1 }, ENTER],
    [END + 0.5, { opacity: 0 }],
  ],
  "logo-left": [
    [0, { transform: "scale(0) rotate(-40deg)", opacity: 0 }],
    [0.3, { transform: "scale(0) rotate(-40deg)", opacity: 0 }, SPRING],
    [0.35, { opacity: 1 }],
    [0.85, { transform: "scale(1) rotate(0deg)" }],
  ],
  "logo-right": [
    [0, { transform: "scale(0) rotate(40deg)", opacity: 0 }],
    [0.4, { transform: "scale(0) rotate(40deg)", opacity: 0 }, SPRING],
    [0.45, { opacity: 1 }],
    [0.95, { transform: "scale(1) rotate(0deg)" }],
  ],
  "logo-head": [
    [0, { transform: "translateY(60%) scale(0.4)", opacity: 0 }],
    [0.15, { transform: "translateY(60%) scale(0.4)", opacity: 0 }, SPRING],
    [0.2, { opacity: 1 }],
    [0.6, { transform: "translateY(0%) scale(1)" }],
  ],
  "logo-body": [
    [0, { transform: "scaleY(0)" }],
    [0.05, { transform: "scaleY(0)" }, SPRING],
    [0.45, { transform: "scaleY(1)" }],
  ],
  "logo-letters": [
    [0, { clipPath: "inset(0 100% 0 0)" }],
    [0.55, { clipPath: "inset(0 100% 0 0)" }, "cubic-bezier(0.6, 0, 0.2, 1)"],
    [1.05, { clipPath: "inset(0 0% 0 0)" }],
  ],
  wash: [
    [0, { transform: "translate(0%, 0%) rotate(0deg)" }, DRIFT],
    [T / 2, { transform: "translate(-6%, 4%) rotate(12deg)" }, DRIFT],
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
    l.live?.forEach(([s, t, end], i) => Object.assign(tracks, liveTracks(`${prefix}live-${l.id}-${i}`, s, t, end)));
  });
addLayers(LAYERS, "d-");
addLayers(PHONE_LAYERS, "m-");
// Moves written close together can overlap by a hair: keep every track in time order
Object.values(tracks).forEach((frames) => frames.forEach((f, i) => {
  if (i && f[0] < frames[i - 1]![0]) f[0] = frames[i - 1]![0];
}));

const script: FilmScript = {
  length: T,
  // The feature cards, mid-build
  poster: CARDS + 2.4,
  tones: [[0, "light"]],
  tracks,
};

/** A page in a frame: the picture, and whatever moves on it */
function Page({ l, pt, w, prefix }: { l: Layer; pt: number; w: number; prefix: string }) {
  const s = iexcelo[l.screen];
  const h = s.h * pt;
  const body = (
    <>
      <Image src={s.src} alt="" width={w} height={Math.round(h)} sizes={prefix === "m-" ? FILM_PHONE : FILM_DESKTOP} loading="eager" draggable={false} style={{ width: w, height: h }} />
      {l.live?.map(([sc], i) => (
        <span key={i} className="ix-live" style={{ width: w, height: (sc.size ? sc.size[1] : s.h) * pt }}>
          <LiveParts id={`${prefix}live-${l.id}-${i}`} scene={sc} />
        </span>
      ))}
    </>
  );
  return (
    <div data-track={`${prefix}layer-${l.id}`} className="ix-layer" style={{ width: w }}>
      {l.scroll ? (
        <div data-track={`${prefix}scroll-${l.id}`} className="ix-scroll">
          {body}
        </div>
      ) : (
        body
      )}
    </div>
  );
}

/**
 * iExcelo as a short film: a browser on the product's own wash, a pointer clicking through it,
 * pages arriving like the next sheet of an exam paper, a phone for the pages read on the go, and the
 * student dashboard down to a marked score.
 */
export default function IexceloFilm(props: FilmProps) {
  const { root, stage } = useFilm(script, props);
  return (
    <div ref={root} aria-hidden="true" className="film ix absolute inset-0 overflow-hidden">
      <div ref={stage} className="film-stage ix-stage" style={{ visibility: "hidden" }}>
        <span data-track="wash" className="ix-wash" />
        <span className="ix-grid" />

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
            <span data-track="pen-show" className="ix-pen-layer">
              {PRESSES.map(([, x, y], i) => (
                <span key={i} data-track={`press-${i}`} className="ix-press" style={{ left: x * LPT, top: BAR + y * LPT }} />
              ))}
              <span data-track="pen" className="ix-pen">
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

        <div data-track="logo" className="ix-logo" style={{ width: LOGO_W, height: LOGO_H, marginLeft: -LOGO_W / 2, marginTop: -LOGO_H / 2 }}>
          <svg viewBox="0 0 88 33" width={LOGO_W} height={LOGO_H}>
            <g data-track="logo-letters" dangerouslySetInnerHTML={{ __html: IX_LOGO.letters }} />
            <g data-track="logo-body" style={{ transformBox: "fill-box", transformOrigin: "50% 100%" }} dangerouslySetInnerHTML={{ __html: IX_LOGO.body }} />
            <g data-track="logo-head" style={{ transformBox: "fill-box", transformOrigin: "50% 50%" }} dangerouslySetInnerHTML={{ __html: IX_LOGO.head }} />
            <g data-track="logo-left" style={{ transformBox: "fill-box", transformOrigin: "100% 100%" }} dangerouslySetInnerHTML={{ __html: IX_LOGO.left }} />
            <g data-track="logo-right" style={{ transformBox: "fill-box", transformOrigin: "0% 100%" }} dangerouslySetInnerHTML={{ __html: IX_LOGO.right }} />
          </svg>
        </div>
      </div>
    </div>
  );
}
