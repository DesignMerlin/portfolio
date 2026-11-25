"use client";

import { at, Device, on, pushIn, ScreenUI, shot, show, Still, Touches, uiTracks, SCREEN_H, type Press, type Touch, type Typing } from "@/components/case-study/film/device";
import { DRIFT, ENTER, SHEET, type Frame } from "@/components/case-study/film/kit";
import { LiveParts, liveTracks, type LiveScene } from "@/components/case-study/live/kit";
import { fundpathProcessing, fundpathSplash, fundpathSuccess } from "@/components/case-study/live/scenes";
import { useFilm, type FilmProps, type FilmScript } from "@/components/case-study/film/use-film";
import { fundpath, type FundpathScreen } from "@/content/fundpath";

/** One loop, in seconds */
const T = 34;
/** When the donation goes through and the lights come on */
const LIT = 24.1;

/** A slow start and a long, soft landing: one operator, one heavy camera */
const DOLLY = "cubic-bezier(0.45, 0, 0.15, 1)";
const TURN = "cubic-bezier(0.5, 0, 0.2, 1)";

/* ------------------------------------------------------------------ */
/* Lights on. One phone, one unbroken move: out of the heart in the    */
/* dark, low across the app like a landscape, up and round its edge    */
/* as a campaign opens, close over the giving itself (choosing an      */
/* amount, typing the card in), and into the light when the donation   */
/* goes through. Then along the transparency report as it fills in.    */
/* ------------------------------------------------------------------ */

const CAMERA_MOVE: Frame[] = [
  // Inside the heart, rolling slowly
  [0, shot(0, 0, 1210, 0, -8, -16), DRIFT],
  [2.2, shot(0, 0, 1150, 0, 4, -7), DOLLY],
  // Out to the whole phone
  [4.6, shot(0, 0, 60, 4, 8, 0), DRIFT],
  [5.3, shot(0, 0, 40, 6, 10, 0), DOLLY],
  // Down, and low across the screen: in over the trending campaigns, out past the wallet
  [7.4, shot(70, 70, 560, 60, 0, -34, 0, -70), "cubic-bezier(0.35, 0, 0.65, 1)"],
  [10.4, shot(-50, 60, 700, 55, 0, 9, 0, 150), DOLLY],
  // Up into the air, seen from below. A campaign is tapped, and the phone swings edge-on and back as it opens
  [12, shot(-20, 0, 50, -5, 24, -2), DRIFT],
  [12.5, shot(-20, 0, 60, -5, 26, -2), TURN],
  [13.8, shot(0, 0, -10, -9, 68, 3), TURN],
  [15.1, shot(20, 0, 90, 1, -13, 1), DRIFT],
  [15.6, shot(20, 0, 100, 1, -12, 1), DOLLY],
  // In on the amount
  [16.5, shot(0, 20, 420, 14, -7, 2, 0, -30), DRIFT],
  [17.9, shot(0, 20, 450, 12, 4, -1, 0, -40), DOLLY],
  [18.4, shot(0, 0, 240, 4, 8, 0, 0, -120), DOLLY],
  // Over the card while it's typed in
  [19.5, shot(0, 40, 520, 20, 13, -4, -20, 140), DRIFT],
  [22.8, shot(0, 20, 480, 14, -10, 3, 10, 90), DOLLY],
  // Holds its breath while the donation goes through
  [23.6, shot(0, 10, 200, 1, -2, 0), ENTER],
  // The light
  [LIT + 0.75, shot(0, 0, 70, 2, 2, 0), DRIFT],
  [25.9, shot(0, 0, 60, 3, 6, 0), DOLLY],
  // Over the report, close: the chart, then the ledger
  [27.9, shot(30, 10, 640, 36, 28, -12, -10, 10), "cubic-bezier(0.35, 0, 0.65, 1)"],
  [30.9, shot(-20, 30, 720, 30, -15, 6, 0, -185), DOLLY],
  // And away
  [33.1, shot(0, 0, -120, 3, -2, 0), DRIFT],
  [T, shot(0, 0, -170, 3, 2, 0)],
];

/** The room: dark until the donation goes through, and dark again for the loop */
const LIGHT: Frame[] = [
  [0, { opacity: 0 }],
  [LIT, { opacity: 0 }, ENTER],
  [LIT + 1, { opacity: 1 }],
  [32.4, { opacity: 1 }, DRIFT],
  [33.8, { opacity: 0 }],
];
const BLOOM: Frame[] = [
  [0, { opacity: 0, transform: "scale(0.2)" }],
  [LIT - 0.05, { opacity: 0, transform: "scale(0.2)" }, ENTER],
  [LIT + 0.3, { opacity: 1, transform: "scale(0.9)" }, DRIFT],
  [LIT + 2, { opacity: 0, transform: "scale(1.5)" }],
];
/** Light spilling from the screen onto the room behind it */
const SPILL: Frame[] = [
  [0, { opacity: 0 }],
  [0.9, { opacity: 0 }, DRIFT],
  [2.2, { opacity: 0.9 }],
  [5.2, { opacity: 0.8 }, DRIFT],
  [7.4, { opacity: 0.35 }],
  [10.4, { opacity: 0.35 }, DRIFT],
  [12.4, { opacity: 0.75 }],
  [16.5, { opacity: 0.5 }, DRIFT],
  [LIT, { opacity: 0.6 }, ENTER],
  [LIT + 0.8, { opacity: 0 }],
];
/** A beam from above, swinging slowly; only in the dark */
const BEAM: Frame[] = [
  [0, { opacity: 0, transform: "rotate(-9deg)" }],
  [3.4, { opacity: 0 }, DRIFT],
  [5, { opacity: 0.8 }],
  [7.4, { opacity: 0.25 }],
  [10.6, { opacity: 0.25 }, DRIFT],
  [12.2, { opacity: 0.95, transform: "rotate(6deg)" }],
  [16.4, { opacity: 0.35 }, DRIFT],
  [22.6, { opacity: 0.35 }, DRIFT],
  [LIT, { opacity: 0.8, transform: "rotate(-4deg)" }, ENTER],
  [LIT + 0.7, { opacity: 0 }],
];
/** The edge catches the light on one diagonal, then the other: two still gradients crossfading */
const RIM: Frame[] = [
  [0, { opacity: 0 }],
  [2.6, { opacity: 0 }, DRIFT],
  [4.6, { opacity: 1 }, DRIFT],
  [7.2, { opacity: 0.1 }, DRIFT],
  [10.4, { opacity: 1 }, DRIFT],
  [13, { opacity: 0 }, DRIFT],
  [16, { opacity: 1 }, DRIFT],
  [20, { opacity: 0.1 }, DRIFT],
  [23.6, { opacity: 1 }, ENTER],
  [25, { opacity: 0.1 }, DRIFT],
  [28, { opacity: 0.7 }, DRIFT],
  [31.5, { opacity: 0 }],
];
const FLOOR: Frame[] = [
  [0, { opacity: 0, transform: "scale(0.6)" }],
  [3.4, { opacity: 0, transform: "scale(0.6)" }, DRIFT],
  [5, { opacity: 0.55, transform: "scale(1)" }, DOLLY],
  [7.2, { opacity: 0, transform: "scale(1.6)" }],
  [11.2, { opacity: 0, transform: "scale(0.9)" }, DRIFT],
  [13.6, { opacity: 0.5, transform: "scale(0.7)" }, DRIFT],
  [15.2, { opacity: 0.5, transform: "scale(0.95)" }, DOLLY],
  [16.4, { opacity: 0, transform: "scale(1.4)" }],
  [23, { opacity: 0, transform: "scale(1)" }, DRIFT],
  [LIT, { opacity: 0.6, transform: "scale(1.1)" }, DRIFT],
  [25.9, { opacity: 0.5, transform: "scale(1)" }, DOLLY],
  [27.5, { opacity: 0, transform: "scale(1.6)" }],
];
/** Out of black, and back into it */
const BLACK: Frame[] = [
  [0, { opacity: 1 }],
  [0.3, { opacity: 1 }, DRIFT],
  [1.7, { opacity: 0 }],
  [33, { opacity: 0 }, DRIFT],
  [33.9, { opacity: 1 }],
];

// What the screen shows -------------------------------------------------

/**
 * Written onto the screen by a bar of light, bottom to top. A window slides up while what's in it
 * slides down by the same amount, so it's revealed in place using transforms alone.
 */
const scan = (t: number, from: 100 | -100): Frame[] => [
  [0, { transform: `translateY(${from}%)` }],
  [t, { transform: `translateY(${from}%)` }, DOLLY],
  [t + 1.3, { transform: "translateY(0%)" }],
];
const scanBar = (...times: number[]): Frame[] =>
  times.flatMap((t): Frame[] => [
    [t - 0.02, { transform: `translateY(${SCREEN_H + 20}px)`, opacity: 0 }],
    [t, { transform: `translateY(${SCREEN_H + 20}px)`, opacity: 1 }, DOLLY],
    [t + 1.3, { transform: "translateY(-60px)", opacity: 1 }],
    [t + 1.32, { transform: "translateY(-60px)", opacity: 0 }],
  ]);

/** Where the donation sheet starts on its screen, as a share of its height */
const SHEET_EDGE = (318 / 812) * 100;

type Layer = { id: string; screen: FundpathScreen; frames?: Frame[]; clip?: string; scanAt?: number; until?: number; presses?: Press[]; typing?: Typing[]; live?: { scene: LiveScene; t: number; until?: number; speed?: number } };
const SHEET_AT = 15.45;
const LAYERS: Layer[] = [
  { id: "heart", screen: "heart", frames: show(null, 3.1) },
  // The splash opens on the same heart, so the turn starts from where the camera was
  { id: "splash", screen: "splash", frames: show(3, 7.1), live: { scene: fundpathSplash, t: 3.1 } },
  { id: "home", screen: "home", scanAt: 5.7, until: 13.2 },
  {
    id: "campaign",
    screen: "campaign",
    frames: pushIn(12.5, 18.95),
    presses: [{ t: 15.35, box: [150, 720, 209, 44], r: 8 }],
  },
  { id: "dim", screen: "amount", clip: `inset(0 0 ${100 - SHEET_EDGE}% 0)`, frames: [...on(SHEET_AT, 0.5), [18.95, { opacity: 1 }], [18.97, { opacity: 0 }]] },
  {
    id: "sheet",
    screen: "amount",
    clip: `inset(${SHEET_EDGE}% 0 0 0)`,
    frames: [
      [0, { transform: `translateY(${100 - SHEET_EDGE}%)` }],
      [SHEET_AT, { transform: `translateY(${100 - SHEET_EDGE}%)` }, SHEET],
      [SHEET_AT + 0.7, { transform: "translateY(0%)" }],
      ...show(SHEET_AT, 18.95),
    ],
    typing: [{ focusAt: 16.65, from: 17, to: 17.75, blurAt: 18, chars: 5, text: [157, 414, 63, 30], field: [144.7, 409, 86.7, 40], r: 2, bg: "#fff" }],
    presses: [{ t: 18.2, box: [16, 721, 343, 44], r: 8 }],
  },
  {
    id: "card",
    screen: "card",
    frames: pushIn(18.35, 24.3),
    typing: [
      { focusAt: 19.55, from: 19.75, to: 20.85, blurAt: 21, chars: 25, text: [27, 166, 198, 26], field: [16, 159, 343, 40], r: 8, bg: "#fff" },
      { focusAt: 21, from: 21.15, to: 21.5, blurAt: 21.6, chars: 5, text: [28, 248, 43, 26], field: [17, 241, 163, 40], r: 8, bg: "#fff" },
      { focusAt: 21.6, from: 21.75, to: 22, blurAt: 22.1, chars: 3, text: [206, 248, 30, 26], field: [195, 241, 163, 40], r: 8, bg: "#fff" },
      { focusAt: 22.1, from: 22.25, to: 22.7, blurAt: 22.9, chars: 8, text: [28, 330, 74, 26], field: [17, 323, 343, 40], r: 8, bg: "#fff" },
    ],
    presses: [{ t: 23.35, box: [16, 658, 343, 44], r: 8 }],
  },
  { id: "processing", screen: "processing", frames: [...on(23.45, 0.25), [24.4, { opacity: 1 }], [24.42, { opacity: 0 }]], live: { scene: fundpathProcessing, t: 23.4, until: 24.4 } },
  { id: "success", screen: "success", frames: [...on(LIT - 0.05, 0.3), [27.4, { opacity: 1 }], [27.42, { opacity: 0 }]], live: { scene: fundpathSuccess, t: LIT - 0.1, speed: 2 } },
  { id: "report", screen: "report", scanAt: 26 },
];

/** Every touch, at the button's or field's real place */
const TOUCHES: Touch[] = [
  { t: 12.4, x: 126, y: 602 }, // Jane's campaign
  { t: 15.35, x: 254, y: 742 }, // Donate now
  { t: 16.65, x: 188, y: 429 }, // the amount
  { t: 18.2, x: 187, y: 743 }, // Proceed
  { t: 19.55, x: 150, y: 179 }, // card number
  { t: 21, x: 90, y: 261 }, // expiry
  { t: 21.6, x: 262, y: 261 }, // CVV
  { t: 22.1, x: 150, y: 343 }, // name
  { t: 23.35, x: 187, y: 680 }, // Pay now
];

/** The chart: twelve bars, 22.27 points apart. Each is uncovered from the bottom up, so it grows */
const BARS = Array.from({ length: 12 }, (_, i) => ({ x: 88 + i * 22.27, t: 27.2 + i * 0.09 }));
const grow = (t: number): Frame[] => [
  [0, { transform: "scaleY(1)" }],
  [t, { transform: "scaleY(1)" }, SHEET],
  [t + 0.9, { transform: "scaleY(0)" }],
];
/** The ledger: each line slides out from under its cover as the camera reaches it */
const ROWS = [
  { y: 660, t: 29.2 },
  { y: 708, t: 29.75 },
];
const wipe = (t: number): Frame[] => [
  [0, { transform: "scaleX(1)" }],
  [t, { transform: "scaleX(1)" }, SHEET],
  [t + 0.8, { transform: "scaleX(0)" }],
];

/** Dust in the light: x, y, z, size, drift, when it's brightest */
const DUST = [
  [130, 250, 220, 5, -60, 4.5], [320, 820, 80, 3, -90, 5.5], [520, 120, 260, 4, 70, 12.5], [700, 900, 140, 6, -120, 13.5],
  [860, 300, 60, 3, -70, 11.8], [1010, 640, 240, 5, -110, 14.6], [220, 560, 300, 7, -80, 13], [930, 130, 180, 4, 90, 15.4],
  [420, 420, 340, 4, -130, 15], [1090, 420, 120, 3, -50, 5], [90, 880, 160, 5, -140, 16], [620, 640, 380, 6, -100, 12.2],
] as const;

const tracks: FilmScript["tracks"] = {
  camera: CAMERA_MOVE,
  light: LIGHT,
  bloom: BLOOM,
  spill: SPILL,
  beam: BEAM,
  rim: RIM,
  floor: FLOOR,
  black: BLACK,
  bar: scanBar(5.7, 26),
  glass: [
    [0, { transform: "translateX(-90%) rotate(16deg)" }],
    [4.4, { transform: "translateX(-90%) rotate(16deg)" }, DRIFT],
    [7.4, { transform: "translateX(-20%) rotate(16deg)" }, DRIFT],
    [10.6, { transform: "translateX(90%) rotate(16deg)" }],
    [26, { transform: "translateX(-90%) rotate(16deg)" }, DRIFT],
    [31, { transform: "translateX(90%) rotate(16deg)" }],
  ],
};
LAYERS.forEach((l) => {
  Object.assign(tracks, uiTracks(l.id, l));
  if (l.scanAt) {
    tracks[`window-${l.id}`] = [...scan(l.scanAt, 100), ...show(l.scanAt, l.until)];
    tracks[`layer-${l.id}`] = scan(l.scanAt, -100);
  } else tracks[`layer-${l.id}`] = l.frames!;
  if (l.live) Object.assign(tracks, liveTracks(`live-${l.id}`, l.live.scene, l.live.t, l.live.until, l.live.speed));
});
Object.assign(tracks, uiTracks("ui", { touches: TOUCHES }));
BARS.forEach((b, i) => (tracks[`grow-${i}`] = grow(b.t)));
ROWS.forEach((r, i) => (tracks[`row-${i}`] = wipe(r.t)));
DUST.forEach(([, , z, , drift, peak], i) => {
  tracks[`dust-${i}`] = [
    [0, { opacity: 0, transform: `translate3d(0px, 0px, ${z}px)` }, "linear"],
    [peak - 1.8, { opacity: 0 }, DRIFT],
    [peak, { opacity: 0.85 }, DRIFT],
    [Math.min(peak + 2, LIT), { opacity: 0 }],
    [T, { transform: `translate3d(${drift * 0.6}px, ${drift * 2}px, ${z}px)` }],
  ];
});

const script: FilmScript = {
  length: T,
  // Over the report, in the light
  poster: 28.9,
  tones: [[0, "dark"]],
  tracks,
};

function Covers() {
  return (
    <>
      {BARS.map((b, i) => (
        <span key={i} data-track={`grow-${i}`} className="fp-cover origin-top" style={at([b.x, 297, 18, 164])} />
      ))}
      {ROWS.map((r, i) => (
        <span key={i} data-track={`row-${i}`} className="fp-cover origin-right" style={at([8, r.y, 359, 48])} />
      ))}
    </>
  );
}

/**
 * FundPath as a short film: one iPhone and one unbroken camera move, lit
 * like a product film. It begins in the dark inside the app's heart mark,
 * pulls out, skims low over the home screen, and swings past the phone's
 * edge as a campaign opens. Every touch, press and keystroke of giving is
 * shown. When the donation goes through, the light comes on, and the last
 * move travels along the transparency report as its chart grows and its
 * ledger fills in.
 */
export default function FundpathFilm(props: FilmProps) {
  const { root, stage } = useFilm(script, props);
  return (
    <div ref={root} aria-hidden="true" className="film fp absolute inset-0 overflow-hidden">
      <div data-track="light" className="fp-light" />
      <div ref={stage} className="film-stage fp-stage" style={{ visibility: "hidden" }}>
        <span data-track="beam" className="fp-beam" />
        <span data-track="spill" className="fp-spill" />
        <span data-track="bloom" className="fp-bloom" />
        <span data-track="floor" className="fp-floor" />
        <div data-track="camera" className="film-phone">
          <Device>
            {LAYERS.map((l) =>
              l.scanAt ? (
                <div key={l.id} data-track={`window-${l.id}`} className="fp-window">
                  <div data-track={`layer-${l.id}`}>
                    <Still src={fundpath[l.screen].src} />
                    {/* The covers belong to the report, so they arrive with it */}
                    {l.id === "report" ? <Covers /> : null}
                  </div>
                </div>
              ) : (
                <div key={l.id} data-track={`layer-${l.id}`} className="fp-layer" style={l.clip ? { clipPath: l.clip } : undefined}>
                  <Still src={fundpath[l.screen].src} />
                  {l.live ? <LiveParts id={`live-${l.id}`} scene={l.live.scene} /> : null}
                  <ScreenUI id={l.id} presses={l.presses} typing={l.typing} />
                </div>
              ),
            )}
            <span data-track="bar" className="fp-scan" />
            <Touches id="ui" touches={TOUCHES} />
          </Device>
        </div>
        {DUST.map(([x, y, , size], i) => (
          <span key={i} data-track={`dust-${i}`} className="fp-dust" style={{ left: x, top: y, width: size, height: size }} />
        ))}
      </div>
      <div data-track="black" className="fp-black" />
    </div>
  );
}
