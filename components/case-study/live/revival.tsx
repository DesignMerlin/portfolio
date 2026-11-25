import { DRIFT, ENTER, SHEET, type Frame } from "@/components/case-study/film/kit";
import { HOLD, type LiveScene, type Part, type PtBox, type Sprite } from "@/components/case-study/live/kit";
import { BARS, FLAME, LETTERS, LOCKUP } from "@/components/case-study/revival-stream/logo";
import { revival as r } from "@/content/revival-stream";

/**
 * Revival Stream's screens that move. The waveform and the tick are the LottieFiles animations from the
 * Figma file, frame for frame; the logo is its real vectors, taken apart.
 */

const SPRING = "cubic-bezier(0.34, 1.56, 0.64, 1)";
const DARK = "#141414";
const PANEL = "#0f0f0f";
const DESK: [number, number] = [1440, 1024];
const FILES = "/work/revival";

// The logo ----------------------------------------------------------------

/** A sound bar at work: the heights it passes through, one every `step` seconds, ending at rest */
export const dance = (seed: number, from: number, to: number, step: number, low = 0.25): Frame[] => {
  const frames: Frame[] = [];
  for (let t = from, n = 0; t < to - 0.01; t += step, n++) {
    const v = low + (1 - low) * Math.abs(Math.sin(seed * 12.9898 + n * 2.399 + Math.sin(n * 1.7 + seed)));
    frames.push([t, { transform: `scaleY(${v.toFixed(2)})` }, DRIFT]);
  }
  frames.push([to, { transform: "scaleY(1)" }]);
  return frames;
};

/** SVG shapes move about their own box */
export const inPlace = (origin: string): React.CSSProperties => ({ transformBox: "fill-box", transformOrigin: origin });

/** The lockup arriving: the flame catches, the sound bars start, the name rises a letter at a time */
const logo = (id: string, box: PtBox, t = 0.15): Part[] => {
  const inner: Record<string, Frame[]> = {
    flame: [
      [0, { transform: "scale(0.2, 0)" }],
      [t, { transform: "scale(0.2, 0)" }, SPRING],
      [t + 0.65, { transform: "scale(1, 1)" }],
    ],
  };
  BARS.forEach((_, i) => {
    const t0 = t + 0.35 + Math.abs(i - 2) * 0.07;
    inner[`bar-${i}`] = [[0, { transform: "scaleY(0)" }], [t0, { transform: "scaleY(0)" }, SPRING], ...dance(i + 1, t0 + 0.3, t + 2.6, 0.2)];
  });
  LETTERS.forEach((_, i) => {
    const t0 = t + 0.5 + i * 0.035;
    inner[`letter-${i}`] = [
      [0, { transform: "translateY(180px)" }],
      [t0, { transform: "translateY(180px)" }, ENTER],
      [t0 + 0.55, { transform: "translateY(0px)" }],
    ];
  });
  const [x, y, w, h] = box;
  return [
    { id: "logo-ground", box: [x - 2, y - 2, w + 4, h + 4], bg: DARK },
    {
      id: "logo",
      box,
      inner,
      node: (track) => (
        <svg viewBox={`0 0 ${LOCKUP[0]} ${LOCKUP[1]}`}>
          <clipPath id={`${id}-0`}>
            <rect x="500" y="160" width="700" height="166" />
          </clipPath>
          <clipPath id={`${id}-1`}>
            <rect x="500" y="330" width="700" height="166" />
          </clipPath>
          <path {...track("flame")} d={FLAME} fill="#ea4609" style={inPlace("50% 100%")} />
          {BARS.map(([bx, by, bw, bh], i) => (
            <rect key={i} {...track(`bar-${i}`)} x={bx} y={by} width={bw} height={bh} rx={bw / 2} fill={DARK} style={inPlace("50% 50%")} />
          ))}
          {([0, 1] as const).map((line) => (
            <g key={line} clipPath={`url(#${id}-${line})`}>
              {LETTERS.map((l, i) => (l.line === line ? <path key={i} {...track(`letter-${i}`)} d={l.d} fill="#fff" /> : null))}
            </g>
          ))}
        </svg>
      ),
    },
  ];
};

const logoDesk: LiveScene = { length: 3, size: DESK, parts: logo("rs-desk", [80, 56, 88.6, 41.6]) };
const logoPhone: LiveScene = { length: 3, parts: logo("rs-phone", [143.2, 56, 88.6, 41.6]) };

// The original animations -------------------------------------------------

const WAVE_S = 45 / 25;
const wave = (box: PtBox): Sprite => ({ src: "/work/motion/sound-wave.webp", cols: 5, rows: 9, frames: 45, fps: 25, box });
const tick = (box: PtBox): Sprite => ({ src: "/work/motion/done-green.webp", cols: 6, rows: 10, frames: 60, fps: 50, box });

/** The waveform, over the page with its own drawing of it taken out */
const waveParts = (plate: string, at: PtBox, box: PtBox): Part[] => [
  { id: "plate", box: at, img: `${FILES}/plate-${plate}.webp` },
  { id: "wave", box, sprite: wave(box) },
];
const PLATE_DESK: PtBox = [300, 470, 378, 162];
const onAir = (plate: string): LiveScene => ({
  length: WAVE_S,
  loop: true,
  still: 0.01,
  size: DESK,
  parts: waveParts(plate, PLATE_DESK, [304, 462.2, 370, 177.6]),
});
const player = onAir("player");
export const revivalMinister = onAir("minister");
export const revivalPlayerPhone: LiveScene = {
  length: WAVE_S,
  loop: true,
  still: 0.01,
  size: [375, 1833],
  parts: waveParts("m-player", [12, 342, 351, 118], [16, 315.9, 342, 164.2]),
};

const verified = (box: PtBox, size?: [number, number]): LiveScene => ({
  length: 1.2,
  size,
  parts: [
    { id: "ground", box, bg: DARK },
    { id: "tick", box, sprite: tick(box) },
  ],
});
export const revivalVerified = verified([657, 254, 136, 136], DESK);

// Pieces of the screens ---------------------------------------------------

/** A piece of a screen landing where it belongs */
export const land = (id: string, box: PtBox, slice: string, t: number, sliceSize?: [number, number], from = 0.7): Part => ({
  id,
  box,
  slice,
  sliceSize,
  frames: [
    [0, { opacity: 0, transform: `scale(${from})` }],
    [t, { opacity: 0, transform: `scale(${from})` }, SPRING],
    [t + 0.05, { opacity: 1 }],
    [t + 0.4, { transform: "scale(1)" }],
  ],
});

/** Something sliding up from below its own place */
const up = (t: number, d = 0.55): Frame[] => [
  [0, { transform: "translateY(105%)" }],
  [t, { transform: "translateY(105%)" }, SHEET],
  [t + d, { transform: "translateY(0%)" }],
];

/** The code goes in a digit at a time */
const digits = (src: string, xs: number[], y: number, size?: [number, number]): LiveScene => ({
  length: 1.9,
  size,
  parts: xs.flatMap((x, i): Part[] => [
    { id: `box-${i}`, box: [x + 14, y + 14, 52, 48], bg: "#fff" },
    land(`digit-${i}`, [x + 14, y + 14, 52, 48], src, 0.4 + i * 0.28, undefined, 0.3),
  ]),
});

/** The button's own spinner, turning a spoke at a time */
export const revivalLoading: LiveScene = {
  length: 0.8,
  loop: true,
  still: 0.01,
  size: DESK,
  parts: [
    { id: "ground", box: [708, 502, 36, 36], bg: "#ea4609" },
    {
      id: "spinner",
      box: [714, 508, 24, 24],
      slice: r.loginLoading.src,
      r: "50%",
      frames: Array.from({ length: 9 }, (_, i): Frame => [i * 0.1, { transform: `rotate(${i * 45}deg)` }, HOLD]),
    },
  ],
};

/** The empty calendar sways on its stand */
const sway = (img: string, box: PtBox, bg: string, size?: [number, number]): LiveScene => ({
  length: 3.2,
  loop: true,
  still: 0.01,
  size,
  parts: [
    { id: "ground", box, bg },
    {
      id: "calendar",
      box,
      img,
      origin: "50% 96%",
      frames: [
        [0, { transform: "rotate(0deg) translateY(0%)" }, DRIFT],
        [0.8, { transform: "rotate(-2.4deg) translateY(-1.5%)" }, DRIFT],
        [1.6, { transform: "rotate(0deg) translateY(0%)" }, DRIFT],
        [2.4, { transform: "rotate(2.4deg) translateY(-1.5%)" }, DRIFT],
        [3.2, { transform: "rotate(0deg) translateY(0%)" }],
      ],
    },
  ],
});
export const revivalEmpty = sway(`${FILES}/empty.webp`, [740, 326, 236, 196], "#18181b", DESK);
const emptyPhone = sway(`${FILES}/m-empty.webp`, [100, 288, 170, 146], DARK, [375, 1024]);

/** Added to favourites: the heart fills and the alert drops in, until `out` */
export const likeParts = (t: number, out?: number): Part[] => [
  {
    id: "heart",
    box: [815.5, 382.5, 37.4, 35],
    img: `${FILES}/heart.webp`,
    frames: [
      [0, { opacity: 0, transform: "scale(0.3)" }],
      [t, { opacity: 0, transform: "scale(0.3)" }, SPRING],
      [t + 0.05, { opacity: 1 }],
      [t + 0.4, { transform: "scale(1)" }],
    ],
  },
  {
    id: "alert-clip",
    box: [990, 97, 410, 70],
    clip: true,
    parts: [
      {
        id: "alert",
        box: [998, 106, 398, 58],
        img: `${FILES}/alert.webp`,
        frames: [
          [0, { transform: "translateY(-160%)" }],
          [t + 0.15, { transform: "translateY(-160%)" }, SHEET],
          [t + 0.65, { transform: "translateY(0%)" }],
          ...(out === undefined
            ? []
            : ([
                [out, { transform: "translateY(0%)" }, SHEET],
                [out + 0.4, { transform: "translateY(-160%)" }],
              ] as Frame[])),
        ],
      },
    ],
  },
];
const liked: LiveScene = {
  length: 1.6,
  size: DESK,
  parts: [
    { id: "no-heart", box: [808, 373, 53, 53], slice: r.minstrel.src },
    { id: "no-alert", box: [990, 97, 410, 70], slice: r.minstrel.src },
    ...likeParts(0.5),
  ],
};

/** Comments arrive one after another */
const comments = (rows: PtBox[], src: string, size?: [number, number]): LiveScene => ({
  length: 1.8,
  size,
  parts: rows.flatMap((box, i): Part[] => [
    { id: `ground-${i}`, box, bg: PANEL },
    { id: `clip-${i}`, box, clip: true, parts: [{ id: `row-${i}`, box, slice: src, frames: up(0.4 + i * 0.45, 0.6) }] },
  ]),
});

/** The now-playing bar rises over the page as a channel starts */
const barUp: LiveScene = {
  length: 1.2,
  size: [1440, 1027],
  parts: [
    { id: "page", box: [0, 866, 1440, 161], slice: r.home.src, sliceSize: [1440, 1436] },
    { id: "bar-clip", box: [0, 866, 1440, 161], clip: true, parts: [{ id: "bar", box: [0, 866, 1440, 158], img: `${FILES}/bar.webp`, frames: up(0.4) }] },
  ],
};
const barUpPhone: LiveScene = {
  length: 1.2,
  size: [375, 2097],
  parts: [
    { id: "page", box: [9, 743, 358, 65], slice: r.mHome.src, sliceSize: [375, 2089] },
    { id: "bar-clip", box: [9, 743, 358, 69], clip: true, parts: [{ id: "bar", box: [11, 745, 354, 61], img: `${FILES}/mini-bar.webp`, frames: up(0.4) }] },
  ],
};

/** Where to share it: each one pops in turn */
const places = (xs: number[], y: number, src: string, size: [number, number]): LiveScene => ({
  length: 1.4,
  size,
  parts: xs.flatMap((x, i): Part[] => [
    { id: `ground-${i}`, box: [x - 1, y - 1, 42, 42], bg: PANEL },
    { ...land(`place-${i}`, [x, y, 40, 40], src, 0.3 + i * 0.1, undefined, 0), r: "50%" },
  ]),
});

export const revivalScenes: Record<string, LiveScene> = {
  [r.signup0.src]: logoDesk,
  [r.signup.src]: logoDesk,
  [r.login0.src]: logoDesk,
  [r.login.src]: logoDesk,
  [r.mSignup0.src]: logoPhone,
  [r.mSignup.src]: logoPhone,
  [r.mLogin0.src]: logoPhone,
  [r.mLogin.src]: logoPhone,
  [r.loginLoading.src]: revivalLoading,
  [r.code.src]: digits(r.code.src, [542, 634, 726, 818], 404, DESK),
  [r.mCode.src]: digits(r.mCode.src, [13.5, 102.5, 191.5, 280], 308),
  [r.verified.src]: revivalVerified,
  [r.mVerified.src]: verified([116, 193, 144, 144]),
  [r.homePlaying.src]: barUp,
  [r.mHomePlaying.src]: barUpPhone,
  [r.player.src]: player,
  [r.minister.src]: revivalMinister,
  [r.minstrel.src]: onAir("minstrel"),
  [r.mPlayer.src]: revivalPlayerPhone,
  [r.like.src]: liked,
  [r.chat.src]: comments([[964, 246, 431, 62], [964, 321, 431, 64]], r.chat.src, DESK),
  [r.mChat.src]: comments([[16, 403, 344, 58], [16, 471, 344, 58]], r.mChat.src),
  [r.share.src]: places([503, 575, 648, 720], 472, r.share.src, DESK),
  [r.mShare.src]: places([59, 131, 204, 276], 471, r.mShare.src, [375, 1264]),
  [r.favourites.src]: revivalEmpty,
  [r.mFavourites.src]: emptyPhone,
};
