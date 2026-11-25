/** How strokes look. Kept apart from the component so it's plain canvas code */

export type Tool = "pen" | "marker" | "spray" | "eraser";
export type Stroke = {
  tool: Tool;
  /** Index into INKS */
  ink: number;
  /** Width in px on a 1200px-wide page */
  size: number;
  /** Copies around the middle: 1, 2 (left-right) or 8 (kaleidoscope) */
  mirror: number;
  seed: number;
  /** x and y as fractions of the page's width, and ms since the stroke began */
  pts: [x: number, y: number, t: number][];
  at: number;
};

/** Each ink has a light-paper and a dark-paper version, so a drawing still reads after a theme change */
export const INKS = [
  { name: "Ink", light: "#111318", dark: "#eceef1" },
  { name: "Violet", light: "#5b3fe0", dark: "#a99cff" },
  { name: "Tomato", light: "#e4572e", dark: "#ff8a66" },
  { name: "Crimson", light: "#d11f45", dark: "#ff6f8d" },
  { name: "Sun", light: "#e0a100", dark: "#ffd166" },
  { name: "Leaf", light: "#1f9d57", dark: "#5fd394" },
  { name: "Sky", light: "#2b6fe0", dark: "#7db4ff" },
  { name: "Pink", light: "#d63d8f", dark: "#ff8fc8" },
];

export const newStroke = (s: Pick<Stroke, "tool" | "ink" | "size" | "mirror">, x: number, y: number): Stroke => ({
  ...s,
  seed: Math.floor(Math.random() * 1e6),
  pts: [[x, y, 0]],
  at: performance.now(),
});
export const elapsed = (s: Stroke) => Math.round(performance.now() - s.at);

/** Small, repeatable randomness, so spray doesn't shimmer when redrawn */
function random(seed: number) {
  let s = seed || 1;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

export function drawStroke(ctx: CanvasRenderingContext2D, s: Stroke, w: number, h: number, theme: "light" | "dark") {
  const unit = w / 1200;
  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  const colour = INKS[s.ink]?.[theme] ?? INKS[0]![theme];
  ctx.globalCompositeOperation = s.tool === "eraser" ? "destination-out" : "source-over";
  ctx.strokeStyle = ctx.fillStyle = colour;
  ctx.globalAlpha = s.tool === "marker" ? 0.45 : 1;

  const cx = w / 2;
  const cy = h / 2;
  const copies = s.mirror;
  for (let i = 0; i < copies; i++) {
    ctx.save();
    ctx.translate(cx, cy);
    if (copies === 2) ctx.scale(i ? -1 : 1, 1);
    else if (copies > 2) {
      ctx.rotate((Math.floor(i / 2) * 2 * Math.PI) / (copies / 2));
      if (i % 2) ctx.scale(-1, 1);
    }
    ctx.translate(-cx, -cy);
    if (s.tool === "spray") spray(ctx, s, w, unit);
    else if (s.tool === "pen") pen(ctx, s, w, unit);
    else flat(ctx, s, w, unit);
    ctx.restore();
  }
  ctx.restore();
}

/** One smooth path: marker and eraser */
function flat(ctx: CanvasRenderingContext2D, s: Stroke, w: number, unit: number) {
  ctx.lineWidth = s.size * unit * (s.tool === "marker" ? 2.2 : 2.6);
  const p = s.pts;
  ctx.beginPath();
  ctx.moveTo(p[0]![0] * w, p[0]![1] * w);
  if (p.length === 1) ctx.lineTo(p[0]![0] * w + 0.01, p[0]![1] * w);
  for (let i = 1; i < p.length; i++) {
    const a = p[i]!;
    const b = p[i + 1] ?? a;
    ctx.quadraticCurveTo(a[0] * w, a[1] * w, ((a[0] + b[0]) / 2) * w, ((a[1] + b[1]) / 2) * w);
  }
  ctx.stroke();
}

/** Ink: thinner the faster it's drawn, easing between widths so it never steps */
function pen(ctx: CanvasRenderingContext2D, s: Stroke, w: number, unit: number) {
  const p = s.pts;
  const base = s.size * unit;
  if (p.length === 1) {
    ctx.beginPath();
    ctx.arc(p[0]![0] * w, p[0]![1] * w, base * 0.6, 0, Math.PI * 2);
    ctx.fill();
    return;
  }
  let width = base * 0.7;
  let mx = p[0]![0] * w;
  let my = p[0]![1] * w;
  for (let i = 1; i < p.length; i++) {
    const a = p[i - 1]!;
    const b = p[i]!;
    const dt = Math.max(b[2] - a[2], 1);
    const speed = (Math.hypot(b[0] - a[0], b[1] - a[1]) * 1200) / dt;
    const target = base * Math.max(0.35, 1.15 - speed * 0.32);
    width += (target - width) * 0.35;
    const nx = ((a[0] + b[0]) / 2) * w;
    const ny = ((a[1] + b[1]) / 2) * w;
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.moveTo(mx, my);
    ctx.quadraticCurveTo(a[0] * w, a[1] * w, nx, ny);
    ctx.stroke();
    mx = nx;
    my = ny;
  }
}

function spray(ctx: CanvasRenderingContext2D, s: Stroke, w: number, unit: number) {
  const rnd = random(s.seed);
  const r = s.size * unit * 2.4;
  const dot = Math.max(0.6, s.size * unit * 0.13);
  for (const [x, y] of s.pts) {
    for (let k = 0; k < 26; k++) {
      const a = rnd() * Math.PI * 2;
      const d = Math.sqrt(rnd()) * r;
      ctx.beginPath();
      ctx.arc(x * w + Math.cos(a) * d, y * w + Math.sin(a) * d, dot * (0.5 + rnd()), 0, Math.PI * 2);
      ctx.fill();
    }
  }
}
