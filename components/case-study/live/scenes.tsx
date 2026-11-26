import { DRIFT, ENTER, SHEET, type Frame } from "@/components/case-study/film/kit";
import type { LiveScene, Part, PtBox, Sprite } from "@/components/case-study/live/kit";
import { iexceloScenes } from "@/components/case-study/live/iexcelo";
import { voxdeedScenes } from "@/components/case-study/live/voxdeed";
import { phoneScenes } from "@/components/case-study/live/phones";
import { revivalScenes } from "@/components/case-study/live/revival";
import { caseTracker } from "@/content/case-tracker";
import { fundpath } from "@/content/fundpath";
import { room8 } from "@/content/room8";
import { yoyo } from "@/content/yoyo";

/**
 * Every screen that moves, by the screen it belongs to. The hourglass, paper
 * plane, wallet and ticks are the LottieFiles animations from Samuel's own
 * Figma files, frame for frame. Logos are the real vectors, taken apart.
 */

const SPRING = "cubic-bezier(0.34, 1.56, 0.64, 1)";

// Moves -------------------------------------------------------------------

const pop = (t: number, d = 0.5, from = 0): Frame[] => [
  [0, { transform: `scale(${from})` }],
  [t, { transform: `scale(${from})` }, SPRING],
  [t + d, { transform: "scale(1)" }],
];
const fade = (t: number, d = 0.3): Frame[] => [
  [0, { opacity: 0 }],
  [t, { opacity: 0 }, ENTER],
  [t + d, { opacity: 1 }],
];
const slideUp = (t: number, d = 0.6, from = 105): Frame[] => [
  [0, { transform: `translateY(${from}%)` }],
  [t, { transform: `translateY(${from}%)` }, ENTER],
  [t + d, { transform: "translateY(0%)" }],
];
/** A stroke drawing itself: pathLength 1, dasharray 1 */
const draw = (t: number, d: number, from = 1): Frame[] => [
  [0, { strokeDashoffset: from }],
  [t, { strokeDashoffset: from }, SHEET],
  [t + d, { strokeDashoffset: 0 }],
];
const uncoverX = (t: number, d: number): Frame[] => [
  [0, { transform: "scaleX(1)" }],
  [t, { transform: "scaleX(1)" }, SHEET],
  [t + d, { transform: "scaleX(0)" }],
];
const uncoverY = (t: number, d: number): Frame[] => [
  [0, { transform: "scaleY(1)" }],
  [t, { transform: "scaleY(1)" }, SHEET],
  [t + d, { transform: "scaleY(0)" }],
];
const ringOut = (t: number, to = 2.1): Frame[] => [
  [0, { transform: "scale(0.9)", opacity: 0 }],
  [t, { transform: "scale(0.9)", opacity: 0 }],
  [t + 0.02, { opacity: 0.55 }, ENTER],
  [t + 0.9, { transform: `scale(${to})`, opacity: 0 }],
];

/** Words in the screen's own pixels, rising out of their own line */
const risingText = (id: string, box: PtBox, slice: string, bg: string, t: number, d = 0.6): Part => ({
  id,
  box,
  bg,
  clip: true,
  parts: [{ id: `${id}-in`, box, slice, frames: slideUp(t, d) }],
});

// The original animations -------------------------------------------------

const SPRITES = {
  hourglass: { src: "/work/motion/hourglass.webp", cols: 6, rows: 5, frames: 30, fps: 25, box: [123.43, 271.16, 125.14, 130.26] },
  donePurple: { src: "/work/motion/done-purple.webp", cols: 10, rows: 11, frames: 104, fps: 25, box: [41.31, 140.09, 292.92, 241.45] },
  plane: { src: "/work/motion/plane.webp", cols: 7, rows: 11, frames: 74, fps: 25, box: [47.5, 233.8, 260, 143] },
  wallet: { src: "/work/motion/wallet.webp", cols: 8, rows: 7, frames: 53, fps: 25, box: [128.19, 177.16, 124.79, 122.57] },
  doneBlue: { src: "/work/motion/done-blue.webp", cols: 5, rows: 5, frames: 25, fps: 25, box: [105.16, 225.46, 172.84, 165.73] },
} satisfies Record<string, Sprite>;

const sprite = (s: Sprite, cover: PtBox, bg: string, loop = false): LiveScene => ({
  length: s.frames / s.fps,
  loop,
  still: loop ? 0.01 : undefined,
  parts: [
    { id: "cover", box: cover, bg },
    { id: "lottie", box: s.box, sprite: s },
  ],
});

// Room8 -------------------------------------------------------------------

const HOUSE =
  "M0.188528 47.0417C0.191482 45.9165 0.676995 44.8465 1.52193 44.1034L50.5522 0.978287C52.0251 -0.317256 54.2282 -0.327124 55.7127 0.95517L105.665 44.1038C106.524 44.8461 107.02 45.9087 107.024 47.0441C107.066 57.6593 107.267 112.574 107.017 118.678C106.741 125.439 93.8817 123.507 93.8817 118.678V101.292C93.8817 93.7582 78.6211 91.8267 78.6211 101.292V118.678C78.6211 124.666 64.9058 127.37 64.5194 118.678C64.1331 109.985 64.5194 112.303 64.1331 100.519C63.7467 88.7359 42.8843 88.7359 42.8843 101.292C42.8843 113.848 43.0774 111.916 42.4979 119.064C41.9183 126.211 28.9758 126.211 28.9758 119.064V101.292C28.9758 92.4061 13.522 93.7583 13.522 100.519C13.522 107.28 13.9084 112.303 13.522 119.064C13.1357 125.825 0 126.791 0 119.064L0.188528 47.0417Z";
const ROOM8_GREEN = "#10973e";
const LETTERS: [x: number, w: number][] = [
  [118, 27.4],
  [145.4, 25],
  [170.4, 24.6],
  [195, 38],
  [233, 26],
];

/** The house rises into its own outline, three people pop up at home, the roof draws over them, the name arrives */
export const room8Splash: LiveScene = {
  length: 2.2,
  parts: [
    { id: "ground", box: [112, 246, 152, 226], bg: ROOM8_GREEN },
    {
      id: "house-clip",
      box: [128, 262, 119, 132],
      clip: true,
      parts: [
        {
          id: "house",
          box: [133.9, 266.1, 107.14, 124.5],
          frames: slideUp(0.1, 0.8, 110),
          node: () => (
            <svg viewBox="0 0 107.14 124.503">
              <path d={HOUSE} fill="#fff" />
            </svg>
          ),
        },
      ],
    },
    { id: "head-1", box: [146.2, 341.8, 16.23, 16.23], bg: "#0fbf4b", r: "50%", frames: pop(0.75, 0.45) },
    { id: "head-2", box: [176.6, 332.2, 21.64, 21.64], bg: "#0fbf4b", r: "50%", frames: pop(0.62, 0.5) },
    { id: "head-3", box: [212, 341.6, 14.68, 14.68], bg: "#0fbf4b", r: "50%", frames: pop(0.88, 0.45) },
    {
      id: "roof",
      box: [128.5, 257, 118.08, 53.04],
      inner: { line: draw(0.7, 0.7) },
      node: (track) => (
        <svg viewBox="0 0 118.079 53.0397">
          <path
            {...track("line")}
            d="M1.57077 49.7304L55.7703 2.53613C57.2548 1.2436 59.4667 1.24965 60.9439 2.55026L116.508 51.4689"
            stroke="#fff"
            strokeWidth="3.1415"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            pathLength={1}
            strokeDasharray="1 1.1"
          />
        </svg>
      ),
    },
    ...LETTERS.map(
      ([x, w], i): Part => ({
        id: `letter-${i}`,
        box: [x, 414, w, 50],
        slice: room8.splash.src,
        frames: [
          [0, { transform: "translateY(36%)", opacity: 0 }],
          [1 + i * 0.08, { transform: "translateY(36%)", opacity: 0 }, ENTER],
          [1.55 + i * 0.08, { transform: "translateY(0%)", opacity: 1 }],
        ],
      }),
    ),
  ],
};

const tick = (box: PtBox, d: string, width: number, t: number): Part => ({
  id: "tick",
  box,
  inner: { line: draw(t, 0.4) },
  node: (track) => (
    <svg viewBox={`0 0 ${box[2]} ${box[3]}`}>
      <path {...track("line")} d={d} stroke="#fff" strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" fill="none" pathLength={1} strokeDasharray="1 1.1" />
    </svg>
  ),
});

const room8PayDone: LiveScene = {
  length: 2,
  parts: [
    { id: "ground", box: [138, 276, 99, 98], bg: "#fff" },
    { id: "ring-1", box: [149.3, 286.2, 76.3, 76.3], r: "50%", border: "calc(2 * var(--pt)) solid #17a34a", frames: ringOut(0.45, 1.5) },
    { id: "ring-2", box: [149.3, 286.2, 76.3, 76.3], r: "50%", border: "calc(2 * var(--pt)) solid #17a34a", frames: ringOut(0.75, 1.5) },
    { id: "disc", box: [149.3, 286.2, 76.3, 76.3], r: "50%", bg: "linear-gradient(#62bf7f, #0f973d)", frames: pop(0.1, 0.55) },
    tick([149.3, 286.2, 76.3, 76.3], "M28 39.2L35 46.2L49 32", 4.4, 0.5),
  ],
};

/** The headset's lenses wake up while the bar fills */
export const room8TourLoader: LiveScene = {
  length: 1.8,
  parts: [
    { id: "bar", box: [91, 557, 193, 6], bg: "#05070b", origin: "100% 50%", frames: uncoverX(0.1, 1.5) },
    ...[114, 208].map(
      (x, i): Part => ({
        id: `lens-${i}`,
        box: [x, 294, 52, 52],
        slice: room8.vrLoader.src,
        r: "50%",
        frames: [
          [0, { transform: "scale(0.82)", opacity: 0.5 }],
          [0.1 + i * 0.14, { transform: "scale(0.82)", opacity: 0.5 }, SPRING],
          [0.7 + i * 0.14, { transform: "scale(1.06)", opacity: 1 }, DRIFT],
          [1.2, { transform: "scale(0.97)" }, DRIFT],
          [1.8, { transform: "scale(1)", opacity: 1 }],
        ],
      }),
    ),
  ],
};

const beat: Frame[] = [
  [0, { transform: "scale(1)" }, SPRING],
  [0.18, { transform: "scale(1.22)" }, DRIFT],
  [0.36, { transform: "scale(0.96)" }, SPRING],
  [0.54, { transform: "scale(1.12)" }, DRIFT],
  [0.8, { transform: "scale(1)" }],
  [1.6, { transform: "scale(1)" }],
];
const room8Saved: LiveScene = {
  length: 1.6,
  loop: true,
  parts: [{ id: "heart", box: [159, 230, 33, 31], slice: room8.saved.src, r: "50%", frames: beat }],
};

// FundPath ----------------------------------------------------------------

const FP_PURPLE = "#9f77ed";
const Heart = () => (
  <svg viewBox="0 0 52.2353 39.1765">
    <path
      fill="#fff"
      d="M13.2991 8.34026C4.00146 10.4511 3.4549 5.5875 4.35892 2.8629C0.897973 3.66019 -1.20957 9.12733 0.753838 17.5274C2.71725 25.9274 5.65681 28.1105 10.1272 31.0529C14.5975 33.9953 23.8266 39.0258 23.8266 39.0258C23.8266 39.0258 16.0396 32.619 14.1648 30.6257C12.2901 28.6325 6.77243 23.3647 10.1272 16.1036C13.4819 8.84259 19.7889 9.64937 23.8266 10.8358C21.0579 7.76055 15.6547 7.89075 13.2991 8.34026Z"
    />
    <path
      fill="#fff"
      d="M39.0214 8.17076C48.2595 10.2743 48.8025 5.42746 47.9043 2.71222C51.3431 3.50677 53.4371 8.95512 51.4863 17.3263C49.5355 25.6975 42.1731 30.8053 42.1731 30.8053C42.1731 30.8053 32.0001 38.0887 28.5614 39.1765C31.2838 37.6157 38.1613 30.3796 38.1613 30.3796C38.1613 30.3796 45.8984 23.9949 42.1731 15.9075C38.4477 7.82005 32.5733 9.47537 28.5614 10.6577C31.3124 7.59304 36.681 7.72279 39.0214 8.17076Z"
    />
    <ellipse cx="9.47" cy="3.9177" rx="3.97" ry="3.9177" fill="#fff" />
    <ellipse cx="42.995" cy="3.9177" rx="4.05" ry="3.9177" fill="#fff" />
  </svg>
);

/** Two people become a heart, beating once */
const fundpathHeart: LiveScene = {
  length: 1.2,
  parts: [
    { id: "ground", box: [150, 375, 75, 62], bg: FP_PURPLE },
    {
      id: "heart",
      box: [161, 386, 52.24, 39.18],
      frames: [
        [0, { transform: "scale(0)", opacity: 0 }, SPRING],
        [0.5, { transform: "scale(1)", opacity: 1 }, DRIFT],
        [0.7, { transform: "scale(1.16)" }, DRIFT],
        [0.95, { transform: "scale(1)" }],
      ],
      node: Heart,
    },
  ],
};

/** As storyboarded in Figma: the heart grows as it turns, settles to the left, and the name comes out from behind it */
const heartTurn: Frame[] = [
  [0, { transform: "translateX(144.4%) rotate(0deg) scale(0.868)" }, DRIFT],
  [0.45, { transform: "translateX(144.4%) rotate(135deg) scale(1.5)" }, "linear"],
  [0.75, { transform: "translateX(144.4%) rotate(235deg) scale(1.45)" }, SHEET],
  [1.35, { transform: "translateX(144.4%) rotate(360deg) scale(1)" }, SHEET],
  [2.05, { transform: "translateX(0%) rotate(360deg) scale(1)" }],
];
export const fundpathSplash: LiveScene = {
  length: 2.3,
  parts: [
    { id: "ground", box: [40, 336, 295, 140], bg: FP_PURPLE },
    {
      id: "name-clip",
      box: [134, 383, 172, 45],
      clip: true,
      parts: [
        {
          id: "name",
          box: [134, 383, 172, 45],
          slice: fundpath.splash.src,
          frames: [
            [0, { transform: "translateX(-101%)" }],
            [1.35, { transform: "translateX(-101%)" }, SHEET],
            [2.1, { transform: "translateX(0%)" }],
          ],
        },
      ],
    },
    { id: "heart", box: [70, 383, 60.18, 45.14], frames: heartTurn, node: Heart },
  ],
};

export const fundpathProcessing = sprite(SPRITES.hourglass, [124, 272, 124, 126], "#fff", true);
export const fundpathSuccess = sprite(SPRITES.donePurple, [130, 203, 115, 115], "#f9fbfc");
const fundpathReview = sprite(SPRITES.plane, [100, 256, 162, 100], "#f9fbfc", true);

// Immigify Case Tracker+ ---------------------------------------------------

const DISC =
  "M21.9709 44.9903C27.5602 44.9903 32.9318 43.2448 36.8879 39.7657C39.8641 37.1352 40.9408 35.7533 42.9128 31.8742C50.2806 17.2791 37.8316 -3.66795 17.3978 0.550555C13.7805 1.30213 9.12267 3.94476 6.56996 6.51465L4.71894 8.74513C-6.93157 23.9584 4.57377 45.0146 21.983 45.0146L21.9709 44.9903Z";
const IM =
  "M9.60659 17.9216C9.42512 20.3096 9.5582 23.1099 9.5582 25.5343C9.5582 27.6799 9.19526 30.7589 10.4293 32.056C11.9657 33.6682 14.7604 33.0621 15.6557 31.4378C17.047 28.9285 15.1233 22.334 16.9018 21.3885C17.9664 20.8188 18.9948 21.4855 19.1883 22.5159C19.6843 25.1706 17.4825 34.6623 23.5316 32.8682C28.1893 31.4863 23.6525 21.8128 27.0642 21.2552C31.1534 20.5884 26.7013 30.5286 30.6695 32.6742C32.7745 33.8137 34.9764 32.2742 35.3514 30.5407C35.666 29.0739 35.4603 24.6736 35.4603 22.9038C35.4603 20.7339 35.9201 17.6791 34.5651 16.2851C33.1254 14.8062 30.5969 15.1335 29.5322 16.5396C28.5039 17.8973 27.1126 19.1702 25.8544 20.2127C25.6971 18.4913 25.8907 17.2064 24.8503 16.176C21.4991 12.8303 18.3294 18.9035 16.1517 20.0308L16.0791 17.9701C13.6474 18.7095 14.216 20.6491 9.61869 17.9216H9.60659Z";
/** "Immigify", a path per letter (the i's carry their dots) */
const IMMIGIFY = [
  "M0 22.6328H4.07707V0.776581H0V22.6328Z",
  "M10.5466 7.50436C10.5103 6.0497 10.6676 6.30426 7.42526 6.30426C6.86875 6.30426 6.71147 6.47397 6.71147 7.01947V22.6328H10.5466V13.5048C10.5466 8.42564 16.0633 8.44988 16.0633 12.7896V22.6328H19.8985V13.5048C19.8985 8.48625 25.4152 8.44988 25.4152 12.5472V22.6328H29.2503V11.1046C29.2503 8.48625 27.0605 6.06182 24.4594 6.06182C20.1525 6.06182 21.2776 6.09819 18.4709 7.97712C17.0554 5.85574 15.7609 6.06182 13.438 6.06182C12.2403 6.06182 11.2967 7.00735 10.5587 7.50436H10.5466Z",
  "M36.5466 7.50436V6.30427C33.9455 6.30427 32.7115 5.9406 32.7115 7.01947V22.6328H36.5466C36.5466 18.4628 35.5666 9.6621 39.184 9.6621C40.8535 9.6621 42.0633 10.0379 42.0633 12.5472V22.6328H45.8985C45.8985 18.4628 44.9185 9.6621 48.5358 9.6621C51.2458 9.6621 51.6451 11.1289 51.6451 14.9474V22.6328H55.4802C55.4802 18.984 56.073 10.5106 54.3308 8.1832C52.6008 5.87999 50.9555 6.06182 48.5358 6.06182C46.3945 6.06182 45.8621 7.2013 44.7007 7.97712C42.7166 6.64369 43.8297 6.06182 39.9099 6.06182C38.3492 6.06182 37.5023 6.86188 36.5587 7.50436H36.5466Z",
  "M58.1833 22.6328H62.0184V6.54672H58.1833V22.6328ZM57.7115 2.21913C57.7115 4.9951 62.2604 5.24966 62.2604 2.21913C62.2604 -0.896263 57.7115 -0.496232 57.7115 2.21913Z",
  "M71.6558 9.66212C75.9748 9.66212 75.007 12.4017 75.007 17.59C75.007 20.1357 67.0585 21.1054 68.8732 12.4017C69.1515 11.0925 70.2161 9.66212 71.6558 9.66212ZM64.7115 14.22C64.7115 18.9234 66.7924 23.1056 71.4259 23.1056C73.3737 23.1056 73.7972 22.5601 75.0191 21.9055C75.0191 23.6753 74.5594 24.4875 73.3495 25.033C72.3575 25.4936 70.7484 25.7361 69.2604 25.7361C69.5749 27.0938 70.6033 27.6029 70.942 28.8515C76.1079 28.8515 78.8542 26.5483 78.8542 21.4085V6.99525C78.8542 5.97699 77.9347 6.28004 75.745 6.28004C75.0796 6.28004 75.1643 6.46187 75.0312 6.99525C73.2044 6.51036 74.7771 6.0376 70.7122 6.0376C66.877 6.0376 64.7236 10.7652 64.7236 14.2079L64.7115 14.22Z",
  "M81.9413 22.6328H85.7764V6.54672H81.9413V22.6328ZM81.7115 1.97666C81.7115 5.52845 86.0305 4.82537 86.0305 2.46155C86.0305 -1.09024 81.7115 -0.387156 81.7115 1.97666Z",
  "M89.8649 4.86174V6.54672H87.7115V9.90455H89.8649V22.6328H93.7V9.90455H97.2932V6.54672H93.7C93.7 2.82522 94.4138 3.46769 97.2932 4.14653V1.01902C95.6236 0.134105 95.2123 0.303815 93.2161 0.303815C90.6634 0.303815 89.8649 2.27972 89.8649 4.86174Z",
  "M103.47 22.1479C103.47 22.7298 101.413 27.9302 101.075 28.6333H105.152L113.536 6.54673H109.459C109.398 7.21345 106.083 16.3535 105.382 17.3476C105.297 16.3051 103.978 13.1412 103.531 11.9896C102.865 10.2803 101.946 8.29232 101.547 6.53461H97.7115C97.8445 8.09836 103.458 21.3479 103.458 22.1479H103.47Z",
];

/** The disc rolls in, "im" stands up inside it, the red dot drops onto the i, and the name comes out letter by letter */
export const caseTrackerSplash: LiveScene = {
  length: 2.2,
  parts: [
    { id: "ground", box: [85, 340, 210, 88], img: "/work/case-tracker/splash-ground.webp" },
    {
      id: "disc",
      box: [104, 361, 45.05, 45.01],
      frames: [
        [0, { transform: "translateX(140%) rotate(220deg) scale(0)" }, SPRING],
        [0.5, { transform: "translateX(140%) rotate(0deg) scale(1.15)" }],
        [0.8, { transform: "translateX(140%) rotate(0deg) scale(1.15)" }, SHEET],
        [1.4, { transform: "translateX(0%) rotate(0deg) scale(1)" }],
      ],
      inner: {
        im: [
          [0, { transform: "translateY(16px) scaleY(0.2)", opacity: 0 }],
          [0.45, { transform: "translateY(16px) scaleY(0.2)", opacity: 0 }, SPRING],
          [0.85, { transform: "translateY(0px) scaleY(1)", opacity: 1 }],
        ],
        dot: [
          [0, { transform: "translateY(-34px)", opacity: 0 }],
          [0.75, { transform: "translateY(-34px)", opacity: 0 }, "cubic-bezier(0.5, 0, 0.9, 0.5)"],
          [0.78, { opacity: 1 }],
          [1, { transform: "translateY(0px)" }, ENTER],
          [1.12, { transform: "translateY(-5px)" }, "cubic-bezier(0.5, 0, 0.9, 0.5)"],
          [1.24, { transform: "translateY(0px)", opacity: 1 }],
        ],
      },
      node: (track) => (
        <svg viewBox="0 0 45.0504 45.0146">
          <path d={DISC} fill="#fff" />
          <g {...track("im")} style={{ transformBox: "fill-box", transformOrigin: "50% 100%" }}>
            <path d={IM} fill="#000" fillRule="evenodd" />
          </g>
          <g {...track("dot")}>
            <path d="M11.9536 12.0545C7.39263 13.4606 9.90905 19.6672 13.8288 18.358C17.8938 17.0003 16.1396 10.7574 11.9536 12.0545Z" fill="#FE2725" />
          </g>
        </svg>
      ),
    },
    {
      id: "word",
      box: [159.1, 369.1, 113.54, 28.85],
      inner: Object.fromEntries(
        IMMIGIFY.map((_, i): [string, Frame[]] => [
          `l${i}`,
          [
            [0, { transform: "translateX(-16px)", opacity: 0 }],
            [1.05 + i * 0.055, { transform: "translateX(-16px)", opacity: 0 }, ENTER],
            [1.6 + i * 0.055, { transform: "translateX(0px)", opacity: 1 }],
          ],
        ]),
      ),
      node: (track) => (
        <svg viewBox="0 0 113.536 28.8515">
          {IMMIGIFY.map((d, i) => (
            <path key={i} {...track(`l${i}`)} d={d} fill="#fff" fillRule="evenodd" />
          ))}
        </svg>
      ),
    },
  ],
};

const caseTrackerFetching: LiveScene = {
  length: 2.8,
  parts: [
    ...[397, 427, 457].map(
      (y, i): Part => ({
        id: `step-${i}`,
        box: [40, y, 230, 28],
        bg: "#fff",
        frames: [
          [0, { opacity: 1 }],
          [0.4 + i * 0.7, { opacity: 1 }, ENTER],
          [0.75 + i * 0.7, { opacity: 0 }],
        ],
      }),
    ),
    { id: "bar", box: [47, 593, 131, 6], bg: "#e9edf3", origin: "100% 50%", frames: uncoverX(0.3, 2.4) },
    ...[0, 0.8, 1.6].map(
      (t, i): Part => ({ id: `ring-${i}`, box: [153.5, 220, 68, 68], r: "50%", border: "calc(2 * var(--pt)) solid rgb(220 20 60 / 0.6)", frames: ringOut(0.2 + t, 2.3) }),
    ),
    {
      id: "orb",
      box: [153.5, 220, 68, 68],
      img: "/work/case-tracker/orb.webp",
      frames: [
        [0, { transform: "scale(0.9)" }, DRIFT],
        [0.7, { transform: "scale(1.1)" }, DRIFT],
        [1.4, { transform: "scale(0.94)" }, DRIFT],
        [2.1, { transform: "scale(1.1)" }, DRIFT],
        [2.8, { transform: "scale(1)" }],
      ],
    },
  ],
};

export const caseTrackerConfirmed: LiveScene = {
  length: 1.4,
  parts: [
    { id: "ground", box: [146, 214, 84, 82], bg: "#fafafa" },
    { id: "ring", box: [156.3, 224, 63.3, 62.3], r: "50%", border: "calc(2 * var(--pt)) solid #2f9e3a", frames: ringOut(0.4, 1.6) },
    {
      id: "rosette",
      box: [154, 222, 67, 66],
      slice: caseTracker.confirmed.src,
      r: "50%",
      frames: [
        [0, { transform: "rotate(-150deg) scale(0)" }, SPRING],
        [0.7, { transform: "rotate(0deg) scale(1)" }],
      ],
    },
  ],
};

// Yoyo --------------------------------------------------------------------

const YOYO_BLUE = "#1671d9";
const PAPER = "#fcfcfd";

/** Three banknotes: they start as one and fan open from the corner they're held by */
const Notes = ({ track }: { track: (name: string) => { "data-track": string } }) => {
  const line = { stroke: "#0D5EBA", strokeWidth: 1.5, strokeMiterlimit: 10 };
  const held: React.CSSProperties = { transformBox: "view-box", transformOrigin: "38px 122px" };
  return (
    <svg viewBox="0 0 132.868 124.779" fill="none">
      <g {...track("back")} style={held}>
        <path {...line} fill="#1671D9" d="M25.8172 116.199C51.4928 70.2504 35.3305 38.9672 35.3305 38.9672C16.0621 40.3435 1.11799 53.6324 1.11799 53.6324C25.5568 76.1183 16.3969 110.526 16.3969 110.526C16.3969 110.526 23.1483 115.222 25.8172 116.199Z" />
        <path {...line} d="M36.558 45.2908C28.4861 46.3044 20.4143 49.5778 16.3411 51.7167C16.834 52.5629 17.1223 53.5394 17.1223 54.5902C17.1223 56.478 16.2016 58.1426 14.7974 59.1841C25.4824 75.2814 26.5891 93.8895 22.3206 113.883" />
      </g>
      <g {...track("mid")} style={held}>
        <path {...line} fill="#80BBFF" d="M76.313 20.6474C53.7526 14.0541 31.4248 23.3349 31.4248 23.3349C49.9957 84.9248 25.8265 116.208 25.8265 116.208C25.8265 116.208 40.2313 124.029 61.7315 124.029C61.7315 124.029 93.8423 48.2759 76.3223 20.6567L76.313 20.6474Z" />
        <path {...line} d="M75.9875 27.3615C71.9887 26.4316 63.4705 25.1297 59.0161 25.1297C55.5567 25.1297 52.2833 25.418 49.2982 25.8457C49.3075 26.0596 49.3261 26.2642 49.3261 26.4781C49.3261 31.1929 46.1643 35.173 41.8494 36.4098C50.163 75.4859 42.6677 99.8039 32.1594 118.71" />
      </g>
      <g {...track("front")} style={held}>
        <path {...line} fill="#B6D8FF" d="M127.069 23.9394C106.694 -2.08037 72.4816 0.848938 72.4816 0.848938C91.0525 91.7599 34.3354 119.835 34.3354 119.835C34.3354 119.835 68.5758 132.817 98.1014 112.609C98.1014 112.609 147.76 81.0098 127.078 23.9394H127.069Z" />
        <path {...line} d="M131.133 38.9765C120.02 22.3027 104.741 14.6958 92.5869 10.9481C91.5268 16.0814 87.5187 19.4012 82.3018 20.2289C85.7984 57.7706 75.9317 82.9534 66.1301 98.1486C64.2144 101.115 61.8989 104.379 59.2858 107.597" />
        <path {...line} d="M94.7258 110.015C93.8982 109.736 93.0798 109.401 92.2894 108.982C82.8226 104.063 79.8561 91.0253 85.6589 79.866C91.4617 68.7067 103.839 63.6385 113.297 68.5579C119.388 71.729 122.791 78.2572 122.884 85.4828" />
      </g>
    </svg>
  );
};
const notes = (box: PtBox, t: number): Part => ({
  id: "notes",
  box,
  frames: pop(t, 0.45, 0.2),
  inner: {
    back: [
      [0, { transform: "rotate(58deg)" }],
      [t + 0.25, { transform: "rotate(58deg)" }, SPRING],
      [t + 0.95, { transform: "rotate(0deg)" }],
    ],
    mid: [
      [0, { transform: "rotate(32deg)" }],
      [t + 0.2, { transform: "rotate(32deg)" }, SPRING],
      [t + 0.85, { transform: "rotate(0deg)" }],
    ],
    front: [
      [0, { transform: "rotate(-18deg)" }],
      [t, { transform: "rotate(-18deg)" }, SPRING],
      [t + 0.75, { transform: "rotate(0deg)" }],
    ],
  },
  node: (track) => <Notes track={track} />,
});

export const yoyoSplash: LiveScene = {
  length: 2.2,
  parts: [
    { id: "ground", box: [100, 270, 175, 168], bg: YOYO_BLUE },
    notes([122, 291.7, 131, 123.3], 0.1),
    risingText("name", [132, 683, 112, 37], yoyo.splash.src, YOYO_BLUE, 0.75),
    risingText("line", [104, 720, 167, 22], yoyo.splash.src, YOYO_BLUE, 0.9),
  ],
};
const yoyoWelcome: LiveScene = {
  length: 1.8,
  parts: [
    { id: "ground", box: [106, 58, 164, 50], bg: YOYO_BLUE },
    notes([112, 64, 40.4, 38], 0.05),
    risingText("name", [156, 64, 112, 38], yoyo.welcome.src, YOYO_BLUE, 0.4),
    risingText("h1", [20, 291, 335, 40], yoyo.welcome.src, YOYO_BLUE, 0.5),
    risingText("h2", [20, 331, 335, 40], yoyo.welcome.src, YOYO_BLUE, 0.6),
    risingText("p", [60, 384, 255, 46], yoyo.welcome.src, YOYO_BLUE, 0.75),
  ],
};
const yoyoDarkSplash: LiveScene = {
  length: 1.4,
  parts: [
    { id: "ground", box: [110, 284, 155, 140], bg: "#101010" },
    {
      id: "mark",
      box: [114, 286, 147, 134],
      slice: yoyo.darkSplash.src,
      origin: "30% 95%",
      frames: [
        [0, { transform: "rotate(-40deg) scale(0)" }, SPRING],
        [0.75, { transform: "rotate(0deg) scale(1)" }],
      ],
    },
  ],
};

/** A line of light reads the fingerprint */
const scanFinger = (box: PtBox, color: string): LiveScene => ({
  length: 2,
  loop: true,
  parts: [
    {
      id: "scan-clip",
      box,
      clip: true,
      parts: [
        {
          id: "scan",
          box: [box[0], box[1], box[2], 3],
          bg: color,
          r: 2,
          frames: [
            [0, { transform: "translateY(0%)", opacity: 0 }],
            [0.1, { opacity: 1 }, DRIFT],
            [0.95, { transform: `translateY(${((box[3] - 3) / 3) * 100}%)` }, DRIFT],
            [1.8, { transform: "translateY(0%)", opacity: 1 }],
            [2, { opacity: 0 }],
          ],
        },
      ],
    },
  ],
});

/** The week's bars grow, and the balance arrives */
export const yoyoHome: LiveScene = {
  length: 1.8,
  parts: [
    risingText("balance", [28, 154, 96, 28], yoyo.home.src, YOYO_BLUE, 0.1),
    ...Array.from({ length: 7 }, (_, i): Part => {
      const x = 98 + i * 37.5;
      const top = [485, 496.5, 496.5, 484, 481, 484, 478][i]!;
      return { id: `bar-${i}`, box: [x - 0.5, top - 1, 17, 549 - top], bg: "#eaecf0", origin: "50% 0%", frames: uncoverY(0.25 + i * 0.08, 0.8) };
    }),
  ],
};

const arc = (id: string, box: PtBox, d: string, width: number, ground: string, track: string, color: string, share: number, t: number, butt = false): Part => ({
  id,
  box,
  inner: { on: [[0, { strokeDashoffset: share }], [t, { strokeDashoffset: share }, SHEET], [t + 1.3, { strokeDashoffset: 0 }]] },
  node: (tr) => (
    <svg viewBox={`0 0 ${box[2]} ${box[3]}`}>
      <path d={d} stroke={ground} strokeWidth={width + 2.4} fill="none" />
      <path d={d} stroke={track} strokeWidth={width} strokeLinecap={butt ? "butt" : "round"} fill="none" />
      <path {...tr("on")} d={d} stroke={color} strokeWidth={width} strokeLinecap="round" fill="none" pathLength={1} strokeDasharray={`${share} 2`} />
    </svg>
  ),
});

const yoyoHealth: LiveScene = {
  length: 2,
  parts: [
    arc("ring", [74, 106.5, 227, 227], "M113.5 13a100.5 100.5 0 1 1 -0.01 0", 15.4, "#f9fafb", "#eaecf0", "#0f973d", 0.75, 0.2, true),
    risingText("score", [146, 231, 84, 32], yoyo.health.src, "#f9fafb", 0.7),
  ],
};

/** The ring of the budget: covered by its own ground, which draws back round it */
const donut = (cx: number, cy: number): Part => ({
  id: "donut",
  box: [cx - 82, cy - 82, 164, 164],
  inner: { cover: [[0, { strokeDashoffset: 0 }], [0.15, { strokeDashoffset: 0 }, SHEET], [1.5, { strokeDashoffset: -1 }]] },
  node: (track) => (
    <svg viewBox="0 0 164 164">
      <path {...track("cover")} d="M82 12a70 70 0 1 1 -0.01 0" transform="rotate(-22 82 82)" stroke={PAPER} strokeWidth="22.5" fill="none" pathLength={1} strokeDasharray="1 2" />
    </svg>
  ),
});
export const yoyoSummary: LiveScene = {
  length: 2,
  parts: [
    donut(96.5, 220),
    risingText("total", [190, 217, 90, 33], yoyo.summary.src, PAPER, 0.7),
    ...Array.from({ length: 5 }, (_, i): Part => ({ id: `row-${i}`, box: [20, 329 + i * 40, 340, 32], bg: PAPER, origin: "100% 50%", frames: uncoverX(0.6 + i * 0.1, 0.6) })),
  ],
};
const yoyoPlans: LiveScene = {
  length: 2,
  parts: [donut(98.5, 504), risingText("total", [190, 503, 90, 30], yoyo.plans.src, PAPER, 0.7)],
};

export const yoyoReady = sprite(SPRITES.wallet, [126, 190, 126, 108], "#fdfdfd");
export const yoyoGoalDone = sprite(SPRITES.doneBlue, [103, 222, 170, 172], "#fdfdfd");

/** Paper from the popper: x, y (end, points), spin, size, colour */
const CONFETTI: [number, number, number, number, string][] = [
  [-96, -118, 220, 8, "#f04438"], [-60, -150, -260, 7, "#0ba5ec"], [-18, -170, 300, 9, "#fdb022"], [28, -176, -220, 7, "#47cd89"],
  [70, -156, 260, 9, "#9e77ed"], [104, -120, -300, 8, "#1671d9"], [118, -70, 240, 7, "#f04438"], [-120, -66, -220, 9, "#fdb022"],
  [-40, -108, 200, 6, "#47cd89"], [50, -112, -200, 6, "#0ba5ec"], [88, -44, 320, 7, "#fdb022"], [-86, -30, -320, 7, "#1671d9"],
  [0, -132, 260, 7, "#f04438"], [-140, -110, 280, 6, "#9e77ed"], [140, -108, -280, 6, "#47cd89"], [12, -204, 340, 7, "#9e77ed"],
];
export const yoyoBudgetDone: LiveScene = {
  length: 2.6,
  parts: [
    { id: "ground", box: [124, 218, 128, 128], bg: "#fdfdfd" },
    ...CONFETTI.map(([x, y, spin, size, color], i): Part => {
      const t = 0.42 + (i % 4) * 0.03;
      const [w, h] = i % 3 ? [size, size * 0.6] : [size * 0.8, size * 0.8];
      const px = (v: number, of: number) => `${((v / of) * 100).toFixed(0)}%`;
      return {
        id: `bit-${i}`,
        box: [184, 280, w, h],
        bg: color,
        r: i % 3 ? 1 : "50%",
        frames: [
          [0, { transform: "translate(0%, 0%) rotate(0deg)", opacity: 0 }],
          [t, { transform: "translate(0%, 0%) rotate(0deg)", opacity: 0 }],
          [t + 0.02, { opacity: 1 }, "cubic-bezier(0.1, 0.8, 0.3, 1)"],
          [t + 0.02, { transform: "translate(0%, 0%) rotate(0deg)" }, "cubic-bezier(0.1, 0.8, 0.3, 1)"],
          [t + 0.8, { transform: `translate(${px(x, w)}, ${px(y, h)}) rotate(${spin}deg)` }, "cubic-bezier(0.5, 0, 0.8, 0.6)"],
          [t + 1.4, { opacity: 1 }],
          [t + 2, { transform: `translate(${px(x * 1.15, w)}, ${px(y + 190, h)}) rotate(${spin * 2}deg)`, opacity: 0 }],
        ],
      };
    }),
    {
      id: "popper",
      box: [128, 222, 120, 120],
      slice: yoyo.budgetDone.src,
      origin: "18% 88%",
      frames: [
        [0, { transform: "rotate(-24deg) scale(0)" }, SPRING],
        [0.35, { transform: "rotate(-10deg) scale(0.92)" }, ENTER],
        [0.5, { transform: "rotate(6deg) scale(1.1)" }, DRIFT],
        [0.75, { transform: "rotate(-4deg) scale(0.98)" }, DRIFT],
        [1, { transform: "rotate(0deg) scale(1)" }],
      ],
    },
  ],
};

const still = (id: string, box: PtBox, img: string, frames?: Frame[], origin?: string): Part => ({ id, box, img, frames, origin });

/** The piggy bank wonders: its question marks bob, one after the other */
const bob = (delay: number): Frame[] => [
  [0, { transform: "translateY(0%) rotate(0deg)" }],
  [delay, { transform: "translateY(0%) rotate(0deg)" }, DRIFT],
  [delay + 0.35, { transform: "translateY(-7%) rotate(-3deg)" }, DRIFT],
  [delay + 0.8, { transform: "translateY(0%) rotate(0deg)" }],
  [2, { transform: "translateY(0%) rotate(0deg)" }],
];
export const yoyoBudgetEmpty: LiveScene = {
  length: 2,
  loop: true,
  parts: [
    still("pig", [127, 222, 120, 120], "/work/yoyo/piggy.svg"),
    still("q1", [127, 222, 120, 120], "/work/yoyo/piggy-q1.svg", bob(0.1)),
    still("q2", [127, 222, 120, 120], "/work/yoyo/piggy-q2.svg", bob(0.45)),
  ],
};

/** A receipt prints, again and again */
const PRINTER: PtBox = [112.5, 231, 150, 150];
const twinkle = (d: number): Frame[] => [
  [0, { opacity: 1 }, DRIFT],
  [d, { opacity: 0.15 }, DRIFT],
  [d + 0.7, { opacity: 1 }],
  [3.2, { opacity: 1 }],
];
const yoyoTxEmpty: LiveScene = {
  length: 3.2,
  loop: true,
  still: 1.8,
  parts: [
    { id: "ground", box: [118, 250, 142, 128], bg: PAPER },
    still("printer", PRINTER, "/work/yoyo/printer.svg"),
    {
      id: "slot",
      box: PRINTER,
      clip: "polygon(0% 53%, 30.6% 55.5%, 52% 58.4%, 52% 100%, 0% 100%)",
      parts: [
        still("paper", PRINTER, "/work/yoyo/printer-paper.svg", [
          [0, { transform: "translate(17%, -29%)", opacity: 1 }, "steps(7, jump-end)"],
          [1.5, { transform: "translate(0%, 0%)", opacity: 1 }],
          [2.6, { transform: "translate(0%, 0%)", opacity: 1 }, "cubic-bezier(0.5, 0, 0.8, 0.6)"],
          [3, { transform: "translate(-6%, 12%)", opacity: 0 }],
          [3.2, { opacity: 0 }],
        ]),
      ],
    },
    still("stars-a", PRINTER, "/work/yoyo/printer-stars-a.svg", twinkle(0.6)),
    still("stars-b", PRINTER, "/work/yoyo/printer-stars-b.svg", twinkle(1.4)),
  ],
};

/** The arrow flies in, sticks, and shivers */
const TARGET: PtBox = [131.5, 252, 112, 112];
const yoyoGoalsNone: LiveScene = {
  length: 2.2,
  parts: [
    { id: "ground", box: [129, 249, 117, 117], bg: PAPER },
    still("board", TARGET, "/work/yoyo/target.svg", [
      [0, { transform: "scale(0)" }, SPRING],
      [0.45, { transform: "scale(1)" }],
      [0.83, { transform: "scale(1)" }, ENTER],
      [0.9, { transform: "scale(0.95)" }, SPRING],
      [1.25, { transform: "scale(1)" }],
    ]),
    still("shadow", TARGET, "/work/yoyo/target-shadow.svg", fade(0.84, 0.1)),
    still(
      "arrow",
      TARGET,
      "/work/yoyo/target-arrow.svg",
      [
        [0, { transform: "translate(150%, -150%) rotate(0deg)", opacity: 0 }],
        [0.55, { transform: "translate(150%, -150%) rotate(0deg)", opacity: 0 }, "cubic-bezier(0.5, 0, 1, 0.8)"],
        [0.6, { opacity: 1 }],
        [0.84, { transform: "translate(0%, 0%) rotate(0deg)" }, ENTER],
        [0.92, { transform: "translate(0%, 0%) rotate(6deg)" }, DRIFT],
        [1.02, { transform: "translate(0%, 0%) rotate(-5deg)" }, DRIFT],
        [1.12, { transform: "translate(0%, 0%) rotate(3deg)" }, DRIFT],
        [1.24, { transform: "translate(0%, 0%) rotate(-1deg)" }, DRIFT],
        [1.4, { transform: "translate(0%, 0%) rotate(0deg)", opacity: 1 }],
      ],
      "50% 50%",
    ),
  ],
};

/** The gauge fills halfway */
export const yoyoVacation: LiveScene = {
  length: 2,
  parts: [
    arc("gauge", [38, 290, 298.2, 164], "M14.8 149.2a134.2 134.2 0 0 1 268.4 0", 20, "#fff", "#eaecf0", YOYO_BLUE, 0.5, 0.2),
    risingText("share", [150, 396, 72, 34], yoyo.vacation.src, "#fff", 0.7),
  ],
};
const yoyoStock: LiveScene = {
  length: 1.8,
  parts: [{ id: "line", box: [15, 320, 346, 205], bg: PAPER, origin: "100% 50%", frames: uncoverX(0.1, 1.5) }],
};

const scenes: Record<string, LiveScene> = {
  [room8.splash.src]: room8Splash,
  [room8.payDone.src]: room8PayDone,
  [room8.vrLoader.src]: room8TourLoader,
  [room8.saved.src]: room8Saved,
  [fundpath.heart.src]: fundpathHeart,
  [fundpath.splash.src]: fundpathSplash,
  [fundpath.processing.src]: fundpathProcessing,
  [fundpath.success.src]: fundpathSuccess,
  [fundpath.live.src]: fundpathSuccess,
  [fundpath.review.src]: fundpathReview,
  [caseTracker.splash.src]: caseTrackerSplash,
  [caseTracker.fetching.src]: caseTrackerFetching,
  [caseTracker.confirmed.src]: caseTrackerConfirmed,
  [yoyo.splash.src]: yoyoSplash,
  [yoyo.welcome.src]: yoyoWelcome,
  [yoyo.darkSplash.src]: yoyoDarkSplash,
  [yoyo.biometrics.src]: scanFinger([130, 148, 115, 154], "rgb(255 255 255 / 0.9)"),
  [yoyo.biometricsSheet.src]: scanFinger([146, 552, 84, 104], "#1671d9"),
  [yoyo.ready.src]: yoyoReady,
  [yoyo.home.src]: yoyoHome,
  [yoyo.health.src]: yoyoHealth,
  [yoyo.budgetEmpty.src]: yoyoBudgetEmpty,
  [yoyo.summary.src]: yoyoSummary,
  [yoyo.plans.src]: yoyoPlans,
  [yoyo.budgetDone.src]: yoyoBudgetDone,
  [yoyo.txEmpty.src]: yoyoTxEmpty,
  [yoyo.goalsNone.src]: yoyoGoalsNone,
  [yoyo.goalDone.src]: yoyoGoalDone,
  [yoyo.vacation.src]: yoyoVacation,
  [yoyo.stock.src]: yoyoStock,
  ...revivalScenes,
  ...iexceloScenes,
  ...voxdeedScenes,
  ...phoneScenes,
};

/** What moves on this screen, if anything does */
export const liveScene = (src: string): LiveScene | undefined => scenes[src];
