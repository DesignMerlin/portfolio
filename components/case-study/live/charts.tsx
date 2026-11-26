import type { Frame } from "@/components/case-study/film/kit";
import type { LiveScene, Part, PtBox } from "@/components/case-study/live/kit";
import { fysi } from "@/content/fysi";

/**
 * Fysi's dashboard charts, drawing themselves: bars rise from the axis one month after another, the sales
 * gauge draws along its arc with a point of light riding the tip, and the pies sweep round from twelve
 * o'clock. Bars and pies are the screen's own pixels over a patch of the card; the gauge is redrawn on its
 * measured arc. Every box is measured from the exports (1440 points wide).
 */

const OUT = "cubic-bezier(0.22, 1, 0.36, 1)";
const CARD = "#fffffd";

/**
 * Bars rising from the axis, `gap` seconds apart. Each first covers its own bar with a one-point strip of
 * the empty chart beside it (at `empty` points from the bar's left edge), stretched across, so the gridlines
 * run on through where the bar will be
 */
// The cover reaches past the bar: shown small, the screen's bars blur a few points beyond their edges
const PAD = 6;
const bars = (id: string, src: string, size: [number, number], boxes: PtBox[], t: number, gap = 0.05, empty = -10): Part[] => [
  ...boxes.map(
    (b, i): Part => ({
      id: `${id}-g${i}`,
      box: [b[0] - PAD, b[1] - PAD, b[2] + 2 * PAD, b[3] + PAD],
      clip: true,
      parts: [
        {
          id: `${id}-gs${i}`,
          box: [b[0] - PAD, b[1] - PAD, 1, b[3] + PAD],
          slice: src,
          sliceSize: size,
          sliceAt: [b[0] + empty, b[1] - PAD],
          style: { transformOrigin: "0 0", transform: `scaleX(${b[2] + 2 * PAD})` },
        },
      ],
    }),
  ),
  ...boxes.map(
    (b, i): Part => ({
      id: `${id}-${i}`,
      box: b,
      slice: src,
      sliceSize: size,
      origin: "50% 100%",
      frames: [
        [0, { transform: "scaleY(0)" }],
        [t + i * gap, { transform: "scaleY(0)" }, OUT],
        [t + i * gap + 0.7, { transform: "scaleY(1)" }],
      ],
    }),
  ),
];
/** Covers first, then bars: side by side, one set's covers would otherwise hide the edge of the other's bars */
const coversFirst = (parts: Part[]) => [...parts.filter((p) => p.clip), ...parts.filter((p) => !p.clip)];

/** A pie sweeping round clockwise from the top: the slice, masked by a growing cone */
const pie = (id: string, src: string, size: [number, number], [cx, cy, r]: [number, number, number], t: number, bg = CARD): Part[] => [
  { id: `${id}-g`, box: [cx - r - PAD, cy - r - PAD, 2 * (r + PAD), 2 * (r + PAD)], bg, r: "50%" },
  {
    id,
    box: [cx - r, cy - r, 2 * r, 2 * r],
    slice: src,
    sliceSize: size,
    style: { maskImage: "conic-gradient(#000 var(--sweep), transparent 0)", WebkitMaskImage: "conic-gradient(#000 var(--sweep), transparent 0)" },
    frames: [
      [0, { "--sweep": "0deg" }],
      [t, { "--sweep": "0deg" }, "cubic-bezier(0.45, 0, 0.2, 1)"],
      [t + 1.0, { "--sweep": "360deg" }],
    ],
  },
];

// The vendor's sales progress: a half-circle gauge, 75.55% of the way round -----
const G_BOX: PtBox = [336, 394, 296, 164];
// Centre and radius of the arc's centre line, in the box
const GX = 148;
const GY = 148.5;
const GR = 136;
const G_DONE = 0.7555;
const ARC = `M ${GX - GR} ${GY} A ${GR} ${GR} 0 0 1 ${GX + GR} ${GY}`;

const gauge = (t: number, d = 1.3): Part => ({
  id: "gauge",
  box: G_BOX,
  node: (track) => (
    <svg viewBox={`0 0 ${G_BOX[2]} ${G_BOX[3]}`} width="100%" height="100%" style={{ position: "absolute", inset: 0, overflow: "visible" }}>
      <path d={ARC} fill="none" stroke={CARD} strokeWidth={24} strokeLinecap="round" />
      <path d={ARC} fill="none" stroke="#f2f2f4" strokeWidth={8} strokeLinecap="round" />
      <path {...track("arc")} d={ARC} fill="none" stroke="#013e21" strokeWidth={16} strokeLinecap="round" pathLength={1} strokeDasharray="1 1" />
      {/* The point of light at the tip, riding the arc round its centre */}
      <g {...track("tip")} style={{ transformBox: "view-box", transformOrigin: `${GX}px ${GY}px` }}>
        <circle cx={GX - GR} cy={GY} r={9} fill="#00c853" opacity={0.35} />
        <circle cx={GX - GR} cy={GY} r={4} fill="#fff" />
      </g>
    </svg>
  ),
  inner: {
    arc: [
      [0, { strokeDashoffset: 1, opacity: 0 }],
      [t, { strokeDashoffset: 1, opacity: 0 }, OUT],
      [t + 0.05, { opacity: 1 }],
      [t + d, { strokeDashoffset: 1 - G_DONE }],
    ],
    tip: [
      [0, { transform: "rotate(0deg)", opacity: 0 }],
      [t, { transform: "rotate(0deg)", opacity: 0 }, OUT],
      [t + 0.05, { opacity: 1 }],
      [t + d, { transform: `rotate(${(180 * G_DONE).toFixed(2)}deg)` }],
      [t + d + 0.1, { opacity: 1 }, OUT],
      [t + d + 0.6, { opacity: 0 }],
    ] as Frame[],
  },
});

// Measured from the screens -----
const MONTHS_X = [765, 818, 872, 926, 979, 1033, 1086, 1140, 1194, 1247, 1301, 1355];
const SALES_TOP = [520, 585, 494, 547, 520, 543, 547, 453, 507, 564, 520, 562];
/** The vendor's and the admin's Sales Summary share one baseline (656) and one set of values */
const summary = (xs: number[], w: number): PtBox[] => xs.map((x, i) => [x, SALES_TOP[i]!, w, 657 - SALES_TOP[i]!]);
const SALES_LIGHT: PtBox[] = [
  [459, 479, 31, 178], [541, 547, 30, 110], [622, 498, 31, 159], [704, 584, 31, 73], [786, 552, 30, 105], [867, 547, 31, 110],
  [949, 510, 30, 147], [1031, 479, 30, 178], [1112, 547, 31, 110], [1194, 535, 30, 122], [1276, 565, 30, 92], [1357, 511, 31, 146],
];
const ANALYTICS: PtBox[] = [
  [417, 370, 35, 137], [472, 435, 35, 72], [528, 344, 35, 163], [583, 397, 35, 110], [639, 370, 35, 137], [694, 393, 35, 114],
  [750, 397, 34, 110], [805, 303, 35, 204], [861, 357, 34, 150], [916, 414, 35, 93], [971, 370, 35, 137], [1027, 412, 35, 95],
];
const HEALTH: [number, number, number] = [1045, 875, 100];

const DESK: [number, number] = [1440, 1024];

/** The vendor's overview: the gauge, the year's sales and the website's health */
export const fysiVendorOverview: LiveScene = {
  length: 2.4,
  size: DESK,
  parts: [gauge(0.1), ...bars("bar", fysi.vendorOverview.src, DESK, summary(MONTHS_X, 33), 0.25), ...pie("health", fysi.vendorOverview.src, DESK, HEALTH, 0.7)],
};

/** The admin's overview: revenue and sales side by side, month by month, and the website's health */
export const fysiAdminOverview: LiveScene = {
  length: 2.4,
  size: DESK,
  parts: [
    ...coversFirst([
      ...bars("rev", fysi.adminOverview.src, DESK, summary([428, 510, 592, 673, 755, 837, 918, 1000, 1082, 1163, 1245, 1327], 31), 0.1, 0.06),
      // The empty chart is after each light bar: the dark one is right before it
      ...bars("sales", fysi.adminOverview.src, DESK, SALES_LIGHT, 0.16, 0.06, 41),
    ]),
    ...pie("health", fysi.adminOverview.src, DESK, HEALTH, 0.6),
  ],
};

/** The admin's analytics: overall sales by month, and the sales report by category */
export const fysiAnalytics: LiveScene = {
  length: 2.2,
  size: [1440, 1089],
  parts: [...bars("bar", fysi.adminAnalytics.src, [1440, 1089], ANALYTICS, 0.1, 0.05), ...pie("report", fysi.adminAnalytics.src, [1440, 1089], [1274.5, 362, 81], 0.5, "#fff")],
};

export const chartScenes: Record<string, LiveScene> = {
  [fysi.vendorOverview.src]: fysiVendorOverview,
  [fysi.adminOverview.src]: fysiAdminOverview,
  [fysi.adminAnalytics.src]: fysiAnalytics,
};
