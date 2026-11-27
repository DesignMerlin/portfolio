"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useReducedMotion } from "@/components/ui/use-reduced-motion";

/**
 * The About page's doodle wall: one shared wall that keeps going in every direction.
 * - Tools, on a rail in the wall's corner, each button drawn as a sample of the mark it makes:
 *   Pen (fine, thins as you speed up), Brush (thick, tapering at both ends), Highlighter (flat and
 *   see-through), Eraser (lifts whole lines of yours you haven't added yet) and Hand (moves the wall).
 * - Five inks, theme-aware, so a drawing reads on light or dark paper.
 * - Look around: Hand, held Space, two fingers or the middle button pans; pinch, ⌘/Ctrl + scroll, or the
 *   zoom control zooms around the pointer; the corners button frames everything on the wall.
 * - Shared: everyone sees everyone's doodles (/api/wall, lib/wall.ts). "Add to the wall" adds yours. Until
 *   then your lines are only yours: Undo steps back, Start over wipes them (Undo brings them back), and
 *   nobody can touch anyone else's. With no shared store set up, the wall is kept in this browser instead.
 * Strokes are kept in the wall's own coordinates, so they stay sharp at any zoom.
 * Keyboard: focus the wall; arrow keys move a crosshair (the wall pans at its edges), hold Enter to use
 * the tool, P B H E pick a tool, + and − zoom, F frames the wall. Reduced motion: zooming jumps.
 */

const KEY = "doodle-wall:v2";
const INKS = [
  { name: "Graphite", light: "#1c1e24", dark: "#eef0f3" },
  { name: "Coral", light: "#e2553d", dark: "#ff8a73" },
  { name: "Marigold", light: "#d99a00", dark: "#ffcd4d" },
  { name: "Teal", light: "#0f8f86", dark: "#41d1c4" },
  { name: "Indigo", light: "#4b3fd6", dark: "#a69cff" },
];
/** Drawing tools, in the order they're stored (a stroke's t) */
const MARKS = [
  { id: "pen", w: 3.2 },
  { id: "brush", w: 15 },
  { id: "highlighter", w: 22 },
] as const;
type ToolId = (typeof MARKS)[number]["id"] | "eraser" | "hand";
const TOOLS: { id: ToolId; name: string; hint: string }[] = [
  { id: "pen", name: "Pen", hint: "P" },
  { id: "brush", name: "Brush", hint: "B" },
  { id: "highlighter", name: "Highlighter", hint: "H" },
  { id: "eraser", name: "Eraser", hint: "E" },
  { id: "hand", name: "Hand", hint: "hold Space" },
];
const MIN_Z = 0.25;
const MAX_Z = 4;
const GRID = 32;
const MAX_POINTS = 3000;

type Pt = [x: number, y: number];
type Stroke = { t: number; ink: number; w: number; pts: Pt[] };
type View = { x: number; y: number; z: number };
type Theme = "light" | "dark";

const themeNow = (): Theme => (document.documentElement.dataset.theme === "dark" ? "dark" : "light");
const onTheme = (fn: () => void) => {
  const mo = new MutationObserver(fn);
  mo.observe(document.documentElement, { attributeFilter: ["data-theme"] });
  return () => mo.disconnect();
};
const noop = () => () => {};
const clampZ = (z: number) => Math.min(MAX_Z, Math.max(MIN_Z, z));

/** Drops points closer than `gap` wall px to the last kept one: a lighter doodle that draws the same */
const lighter = (s: Stroke, gap = 1.5): Stroke => {
  const out: Pt[] = [];
  for (const p of s.pts) {
    const q = out[out.length - 1];
    if (!q || Math.hypot(p[0] - q[0], p[1] - q[1]) >= gap) out.push(p);
  }
  const last = s.pts[s.pts.length - 1]!;
  if (out[out.length - 1] !== last) out.push(last);
  return { ...s, pts: out };
};

function load(): Stroke[] {
  try {
    const raw = localStorage.getItem(KEY);
    const v = raw ? JSON.parse(raw) : [];
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}
function save(strokes: Stroke[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(strokes));
  } catch {}
}

/** One line, drawn the way its tool draws */
function paint(ctx: CanvasRenderingContext2D, s: Stroke, colour: string, dark: boolean) {
  const p = s.pts;
  if (!p.length) return;
  ctx.strokeStyle = ctx.fillStyle = colour;
  if (s.t === 2) {
    // Highlighter: one flat, see-through pass with square ends, so where it crosses itself it darkens
    ctx.save();
    ctx.globalAlpha = dark ? 0.42 : 0.34;
    ctx.lineCap = "square";
    ctx.lineJoin = "round";
    ctx.lineWidth = s.w;
    ctx.beginPath();
    ctx.moveTo(p[0]![0], p[0]![1]);
    if (p.length === 1) ctx.lineTo(p[0]![0] + 0.01, p[0]![1]);
    for (let i = 1; i < p.length; i++) {
      const a = p[i]!;
      const b = p[i + 1] ?? a;
      ctx.quadraticCurveTo(a[0], a[1], (a[0] + b[0]) / 2, (a[1] + b[1]) / 2);
    }
    ctx.stroke();
    ctx.restore();
    return;
  }
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  if (p.length === 1) {
    ctx.beginPath();
    ctx.arc(p[0]![0], p[0]![1], s.w * (s.t === 1 ? 0.4 : 0.5), 0, Math.PI * 2);
    ctx.fill();
    return;
  }
  // Pen and brush: the width eases along the line. Pen thins as it speeds up (bigger gaps between points);
  // brush swells in from a fine tip and lifts off at the end
  const n = p.length;
  let width = s.w * (s.t === 1 ? 0.3 : 0.8);
  let mx = p[0]![0];
  let my = p[0]![1];
  for (let i = 1; i < n; i++) {
    const a = p[i - 1]!;
    const b = p[i]!;
    const gap = Math.hypot(b[0] - a[0], b[1] - a[1]);
    const speed = Math.max(0.45, Math.min(1.15, 1.2 - gap * (s.t === 1 ? 0.012 : 0.035)));
    const taper = s.t === 1 ? Math.max(0.18, Math.min(1, i / 7, (n - i) / 7)) : 1;
    width += (s.w * speed * taper - width) * 0.4;
    const nx = (a[0] + b[0]) / 2;
    const ny = (a[1] + b[1]) / 2;
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.moveTo(mx, my);
    ctx.quadraticCurveTo(a[0], a[1], nx, ny);
    ctx.stroke();
    mx = nx;
    my = ny;
  }
}

/** A tool button's face: a short sample of the mark it makes */
function ToolFace({ tool }: { tool: ToolId }) {
  const line = { fill: "none", stroke: "currentColor", strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (tool) {
    case "pen":
      return (
        <svg viewBox="0 0 28 28" width="26" height="26" aria-hidden="true">
          <path d="M5 19c3-6 6-9 8-6s3 3 5-1 4-5 5-3" {...line} strokeWidth="1.6" />
        </svg>
      );
    case "brush":
      return (
        <svg viewBox="0 0 28 28" width="26" height="26" aria-hidden="true">
          <path d="M4.5 18.5c2.5-.5 4.5-6 8.5-6s6 4.5 10.5-1c-2.5 6.5-7 9.5-11.5 7.5-2.2-1-4.2 0-7.5-.5z" fill="currentColor" />
        </svg>
      );
    case "highlighter":
      return (
        <svg viewBox="0 0 28 28" width="26" height="26" aria-hidden="true">
          <path d="M5 15.5h18" stroke="currentColor" strokeWidth="8" strokeOpacity="0.38" />
        </svg>
      );
    case "eraser":
      return (
        <svg viewBox="0 0 28 28" width="26" height="26" aria-hidden="true">
          <path d="M6.5 17.5l7-8a2 2 0 0 1 3 0l4 4a2 2 0 0 1 0 3l-4.5 4.5H10z" {...line} strokeWidth="1.6" />
          <path d="M11 12.5l6 6M10 21h12" {...line} strokeWidth="1.6" />
        </svg>
      );
    case "hand":
      return (
        <svg viewBox="0 0 28 28" width="26" height="26" aria-hidden="true">
          <path
            d="M10 15V8.5a1.5 1.5 0 0 1 3 0V14m0-6.5a1.5 1.5 0 0 1 3 0V14m0-5a1.5 1.5 0 0 1 3 0v7c0 4-2.5 6-6 6-2.6 0-4-1.2-5.6-3.6L6 16.2a1.4 1.4 0 0 1 2.2-1.7L10 16"
            {...line}
            strokeWidth="1.5"
          />
        </svg>
      );
  }
}

export function DoodleWall() {
  const reduce = useReducedMotion();
  const theme = useSyncExternalStore(onTheme, themeNow, () => "dark" as Theme);
  const touch = useSyncExternalStore(noop, () => matchMedia("(pointer: coarse)").matches, () => false);
  const box = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const cross = useRef<HTMLSpanElement>(null);

  // What's on the wall: everyone's (kept) and this visit's lines that haven't been added yet (mine)
  const kept = useRef<Stroke[]>([]);
  const mine = useRef<Stroke[]>([]);
  /** Earlier versions of `mine`, for Undo */
  const past = useRef<Stroke[][]>([]);
  const live = useRef<Stroke | null>(null);
  const view = useRef<View>({ x: 0, y: 0, z: 1 });
  /** Where the view is headed: a second zoom step mid-glide builds on the first */
  const aim = useRef<View>({ x: 0, y: 0, z: 1 });
  const size = useRef({ w: 800, h: 500 });
  const frame = useRef(0);

  const [tool, setTool] = useState<ToolId>("pen");
  const [ink, setInk] = useState(0);
  const [space, setSpace] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [counts, setCounts] = useState({ mine: 0, all: 0, canUndo: false });
  const [shared, setShared] = useState<boolean | null>(null);
  const [note, setNote] = useState<{ text: string; bad?: boolean } | null>(null);
  const [posting, setPosting] = useState(false);
  const [said, setSaid] = useState("");

  const sync = useCallback(() => {
    setCounts({ mine: mine.current.length, all: kept.current.length + mine.current.length, canUndo: past.current.length > 0 });
  }, []);
  /** Before any change to your lines: remember them, so Undo can bring them back */
  const remember = () => {
    past.current.push(mine.current.slice());
    if (past.current.length > 60) past.current.shift();
  };

  // Drawing ---------------------------------------------------------------------------
  const draw = useCallback(() => {
    frame.current = 0;
    const c = canvas.current;
    const ctx = c?.getContext("2d");
    if (!c || !ctx) return;
    const { w, h } = size.current;
    const dpr = Math.min(2, devicePixelRatio || 1);
    const t = themeNow();
    const dark = t === "dark";
    const { x, y, z } = view.current;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = dark ? "#191b21" : "#fcfcfa";
    ctx.fillRect(0, 0, w, h);
    // Graph paper: a fine line every 32 wall px and a firmer one every fourth, spaced out when zoomed far out
    let step = GRID;
    while (step * z < 16) step *= 2;
    for (const [every, alpha] of [
      [1, dark ? 0.035 : 0.045],
      [4, dark ? 0.065 : 0.08],
    ] as const) {
      const s = step * every;
      ctx.strokeStyle = dark ? `rgb(255 255 255 / ${alpha})` : `rgb(30 40 70 / ${alpha})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let gx = Math.floor(x / s) * s; (gx - x) * z < w; gx += s) {
        const px = Math.round((gx - x) * z) + 0.5;
        ctx.moveTo(px, 0);
        ctx.lineTo(px, h);
      }
      for (let gy = Math.floor(y / s) * s; (gy - y) * z < h; gy += s) {
        const py = Math.round((gy - y) * z) + 0.5;
        ctx.moveTo(0, py);
        ctx.lineTo(w, py);
      }
      ctx.stroke();
    }
    ctx.setTransform(dpr * z, 0, 0, dpr * z, -x * z * dpr, -y * z * dpr);
    for (const s of [...kept.current, ...mine.current, ...(live.current ? [live.current] : [])]) paint(ctx, s, INKS[s.ink]?.[t] ?? INKS[0]![t], dark);
  }, []);
  const redraw = useCallback(() => {
    if (!frame.current) frame.current = requestAnimationFrame(draw);
  }, [draw]);

  // Zoom and pan --------------------------------------------------------------------
  const setView = useCallback(
    (next: View, animate = false) => {
      const from = { ...view.current };
      const to = { ...next, z: clampZ(next.z) };
      aim.current = to;
      setZoom(Math.round(to.z * 100));
      cancelAnimationFrame(frame.current);
      frame.current = 0;
      if (!animate || reduce) {
        view.current = to;
        redraw();
        return;
      }
      const start = performance.now();
      const dur = 280;
      const step = (now: number) => {
        const k = Math.min(1, (now - start) / dur);
        const e = 1 - Math.pow(1 - k, 3);
        view.current = { x: from.x + (to.x - from.x) * e, y: from.y + (to.y - from.y) * e, z: from.z + (to.z - from.z) * e };
        draw();
        frame.current = k < 1 ? requestAnimationFrame(step) : 0;
      };
      frame.current = requestAnimationFrame(step);
    },
    [draw, redraw, reduce],
  );
  /** Zoom by `k` around a point on screen (the middle, unless given) */
  const zoomAt = useCallback(
    (k: number, sx = size.current.w / 2, sy = size.current.h / 2, animate = false) => {
      const v = animate ? aim.current : view.current;
      const z = clampZ(v.z * k);
      const wx = v.x + sx / v.z;
      const wy = v.y + sy / v.z;
      setView({ x: wx - sx / z, y: wy - sy / z, z }, animate);
    },
    [setView],
  );
  /** Frame everything on the wall, or the middle at 100% when it's empty */
  const fit = useCallback(
    (animate = true) => {
      const { w, h } = size.current;
      const pts = [...kept.current, ...mine.current].flatMap((s) => s.pts);
      if (!pts.length) return setView({ x: -w / 2, y: -h / 2, z: 1 }, animate);
      let x0 = Infinity;
      let y0 = Infinity;
      let x1 = -Infinity;
      let y1 = -Infinity;
      for (const [x, y] of pts) {
        x0 = Math.min(x0, x);
        y0 = Math.min(y0, y);
        x1 = Math.max(x1, x);
        y1 = Math.max(y1, y);
      }
      const pad = 64;
      const z = clampZ(Math.min((w - pad * 2) / Math.max(1, x1 - x0), (h - pad * 2) / Math.max(1, y1 - y0), 1.5));
      setView({ x: (x0 + x1) / 2 - w / 2 / z, y: (y0 + y1) / 2 - h / 2 / z, z }, animate);
    },
    [setView],
  );

  // Size, the wall itself, theme ------------------------------------------------------
  useEffect(() => {
    const c = canvas.current!;
    let first = true;
    const ro = new ResizeObserver(([e]) => {
      const { width: w, height: h } = e!.contentRect;
      size.current = { w, h };
      const dpr = Math.min(2, devicePixelRatio || 1);
      c.width = Math.round(w * dpr);
      c.height = Math.round(h * dpr);
      if (first) fit(false);
      else redraw();
      first = false;
    });
    ro.observe(c);
    return () => {
      ro.disconnect();
      cancelAnimationFrame(frame.current);
    };
  }, [fit, redraw]);
  useEffect(() => redraw(), [theme, redraw]);

  /** Everyone's doodles from the shared wall; this browser's own when there isn't one */
  const pull = useCallback(
    (refit: boolean) =>
      fetch("/api/wall", { cache: "no-store" })
        .then((r) => r.json() as Promise<{ shared: boolean; doodles: { strokes: Stroke[] }[] }>)
        .then((data) => {
          if (!data.shared) throw new Error("not shared");
          kept.current = data.doodles.flatMap((d) => d.strokes);
          setShared(true);
        })
        .catch(() => {
          kept.current = load();
          setShared(false);
        })
        .then(() => {
          sync();
          if (refit) fit(false);
          else redraw();
        }),
    [fit, redraw, sync],
  );
  useEffect(() => {
    void pull(true);
    // Back on the tab: whatever others have added since
    const back = () => {
      if (document.visibilityState === "visible") void pull(false);
    };
    document.addEventListener("visibilitychange", back);
    return () => document.removeEventListener("visibilitychange", back);
  }, [pull]);

  // Held Space takes the hand, while the pointer is over the wall
  const over = useRef(false);
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.code !== "Space" || e.repeat || !over.current || document.activeElement === canvas.current) return;
      e.preventDefault();
      setSpace(true);
    };
    const up = (e: KeyboardEvent) => e.code === "Space" && setSpace(false);
    addEventListener("keydown", down);
    addEventListener("keyup", up);
    return () => {
      removeEventListener("keydown", down);
      removeEventListener("keyup", up);
    };
  }, []);

  // ⌘/Ctrl + scroll (and a trackpad pinch) zooms; a plain scroll keeps scrolling the page
  useEffect(() => {
    const c = canvas.current!;
    const wheel = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      const r = c.getBoundingClientRect();
      zoomAt(Math.exp(-e.deltaY * 0.0025), e.clientX - r.left, e.clientY - r.top);
    };
    c.addEventListener("wheel", wheel, { passive: false });
    return () => c.removeEventListener("wheel", wheel);
  }, [zoomAt]);

  // Using a tool ---------------------------------------------------------------------------
  const toWall = (sx: number, sy: number): Pt => {
    const v = view.current;
    return [v.x + sx / v.z, v.y + sy / v.z];
  };
  const erasing = useRef(false);
  /** The eraser at a wall point: lifts any line of yours it touches (one Undo brings a whole sweep back) */
  const eraseAt = (pt: Pt) => {
    const reach = 10 / view.current.z;
    const hit = (s: Stroke) => s.pts.some((q) => Math.hypot(q[0] - pt[0], q[1] - pt[1]) < s.w / 2 + reach);
    if (!mine.current.some(hit)) return;
    if (!erasing.current) {
      remember();
      erasing.current = true;
    }
    mine.current = mine.current.filter((s) => !hit(s));
    sync();
    redraw();
  };
  const begin = (sx: number, sy: number) => {
    const at = toWall(sx, sy);
    if (tool === "eraser") {
      erasing.current = false;
      eraseAt(at);
      return;
    }
    const m = MARKS.findIndex((x) => x.id === tool);
    if (m < 0) return;
    live.current = { t: m, ink, w: MARKS[m]!.w / Math.max(0.5, view.current.z), pts: [at] };
    setNote(null);
    redraw();
  };
  const extend = (sx: number, sy: number) => {
    const at = toWall(sx, sy);
    if (tool === "eraser") return eraseAt(at);
    if (!live.current) return;
    live.current.pts.push(at);
    redraw();
  };
  const end = useCallback(() => {
    erasing.current = false;
    const s = live.current;
    live.current = null;
    if (!s) return;
    remember();
    mine.current = [...mine.current, s];
    sync();
    redraw();
  }, [redraw, sync]);

  // Pointers ---------------------------------------------------------------------------------
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const pan = useRef<{ x: number; y: number } | null>(null);
  const pinch = useRef<{ d: number; mx: number; my: number } | null>(null);
  const local = (e: { clientX: number; clientY: number }) => {
    const r = canvas.current!.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };
  const looking = tool === "hand" || space;

  const onDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (e.button === 2) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    const p = local(e);
    pointers.current.set(e.pointerId, p);
    if (pointers.current.size === 2) {
      // A second finger: no drawing, two-finger pan and pinch instead
      live.current = null;
      erasing.current = false;
      const [a, b] = [...pointers.current.values()];
      pinch.current = { d: Math.hypot(a!.x - b!.x, a!.y - b!.y), mx: (a!.x + b!.x) / 2, my: (a!.y + b!.y) / 2 };
      pan.current = null;
      redraw();
      return;
    }
    if (looking || e.button === 1) {
      pan.current = p;
      return;
    }
    begin(p.x, p.y);
  };
  const onMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!pointers.current.has(e.pointerId)) return;
    const p = local(e);
    pointers.current.set(e.pointerId, p);
    if (pinch.current && pointers.current.size >= 2) {
      const [a, b] = [...pointers.current.values()];
      const d = Math.hypot(a!.x - b!.x, a!.y - b!.y);
      const mx = (a!.x + b!.x) / 2;
      const my = (a!.y + b!.y) / 2;
      const v = view.current;
      const z = clampZ(v.z * (d / pinch.current.d));
      const wx = v.x + pinch.current.mx / v.z;
      const wy = v.y + pinch.current.my / v.z;
      aim.current = view.current = { x: wx - mx / z, y: wy - my / z, z };
      pinch.current = { d, mx, my };
      setZoom(Math.round(z * 100));
      redraw();
      return;
    }
    if (pan.current) {
      const v = view.current;
      aim.current = view.current = { ...v, x: v.x - (p.x - pan.current.x) / v.z, y: v.y - (p.y - pan.current.y) / v.z };
      pan.current = p;
      redraw();
      return;
    }
    // Every point the pointer passed through, not just one per frame
    for (const ev of e.nativeEvent.getCoalescedEvents?.() ?? [e.nativeEvent]) {
      const q = local(ev);
      extend(q.x, q.y);
    }
  };
  const onUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) pinch.current = null;
    if (!pointers.current.size) {
      pan.current = null;
      end();
    }
  };

  // Keyboard ----------------------------------------------------------------------------------
  const kb = useRef({ x: 0, y: 0, down: false, on: false });
  const placeCross = () => {
    const el = cross.current;
    if (!el) return;
    el.style.transform = `translate(${kb.current.x}px, ${kb.current.y}px)`;
    el.style.opacity = kb.current.on ? "1" : "0";
  };
  const onKey = (e: React.KeyboardEvent<HTMLCanvasElement>) => {
    const k = kb.current;
    const { w, h } = size.current;
    const pick = ({ p: "pen", b: "brush", h: "highlighter", e: "eraser" } as Record<string, ToolId>)[e.key.toLowerCase()];
    const act =
      e.key === "+" || e.key === "="
        ? () => zoomAt(1.25, k.x, k.y, true)
        : e.key === "-" || e.key === "_"
          ? () => zoomAt(0.8, k.x, k.y, true)
          : e.key === "f" || e.key === "F"
            ? () => fit()
            : pick && !e.metaKey && !e.ctrlKey
              ? () => setTool(pick)
              : null;
    if (act) {
      e.preventDefault();
      act();
      return;
    }
    if (e.key === "Enter" && !k.down) {
      e.preventDefault();
      k.down = true;
      begin(k.x, k.y);
      return;
    }
    const d = ({ ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] } as Record<string, [number, number]>)[e.key];
    if (!d) return;
    e.preventDefault();
    const stepPx = e.shiftKey ? 32 : 8;
    let nx = k.x + d[0] * stepPx;
    let ny = k.y + d[1] * stepPx;
    // At an edge, the wall moves instead: it keeps going
    const edge = 28;
    let px = 0;
    let py = 0;
    if (nx < edge) {
      px = nx - edge;
      nx = edge;
    }
    if (nx > w - edge) {
      px = nx - (w - edge);
      nx = w - edge;
    }
    if (ny < edge) {
      py = ny - edge;
      ny = edge;
    }
    if (ny > h - edge) {
      py = ny - (h - edge);
      ny = h - edge;
    }
    if (px || py) {
      const v = view.current;
      aim.current = view.current = { ...v, x: v.x + px / v.z, y: v.y + py / v.z };
    }
    k.x = nx;
    k.y = ny;
    if (k.down) extend(nx, ny);
    placeCross();
    redraw();
  };
  const onKeyUp = (e: React.KeyboardEvent) => {
    if (e.key !== "Enter" || !kb.current.down) return;
    kb.current.down = false;
    end();
  };

  // Actions -------------------------------------------------------------------------------------
  const tell = (text: string, bad = false) => {
    setNote({ text, bad });
    setSaid(text);
  };
  const undo = useCallback(() => {
    const prev = past.current.pop();
    if (!prev) return;
    mine.current = prev;
    sync();
    redraw();
    setSaid("Stepped back.");
  }, [redraw, sync]);
  const startOver = () => {
    if (!mine.current.length) return;
    remember();
    mine.current = [];
    sync();
    redraw();
    setSaid("Your lines are gone. Undo brings them back.");
  };
  const add = async () => {
    if (!mine.current.length || posting) return;
    const doodle = mine.current.map((s) => lighter(s));
    const done = (text: string) => {
      kept.current = [...kept.current, ...doodle];
      mine.current = [];
      past.current = [];
      sync();
      redraw();
      tell(text);
    };
    if (!shared) {
      save([...kept.current, ...doodle]);
      done("Added to the wall. It'll be here when you come back.");
      return;
    }
    if (doodle.reduce((n, s) => n + s.pts.length, 0) > MAX_POINTS) {
      tell("That's a lot for one go. Add part of it, then draw the rest.", true);
      return;
    }
    setPosting(true);
    try {
      const res = await fetch("/api/wall", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ strokes: doodle }) });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) tell(data.error ?? "The wall couldn't take it just now. Try again in a moment.", true);
      else done("Added to the wall. Everyone who visits will see it.");
    } catch {
      tell("You seem to be offline. Your doodle is still here; try again when you're back.", true);
    } finally {
      setPosting(false);
    }
  };
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "z" && box.current?.contains(document.activeElement)) {
        e.preventDefault();
        undo();
      }
    };
    addEventListener("keydown", k);
    return () => removeEventListener("keydown", k);
  }, [undo]);

  return (
    <div ref={box} className="wall">
      <div className="wall-frame" onPointerEnter={() => (over.current = true)} onPointerLeave={() => (over.current = false)}>
        <canvas
          ref={canvas}
          tabIndex={0}
          role="img"
          aria-label={`A ${shared ? "shared " : ""}wall to draw on, ${counts.all} ${counts.all === 1 ? "line" : "lines"} so far. Draw with a mouse, finger or pen. With a keyboard: arrow keys move, hold Enter to draw, P B H E pick a tool, plus and minus zoom, F shows the whole wall.`}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
          onKeyDown={onKey}
          onKeyUp={onKeyUp}
          onFocus={(e) => {
            if (!e.currentTarget.matches(":focus-visible")) return;
            kb.current = { ...kb.current, x: size.current.w / 2, y: size.current.h / 2, on: true };
            placeCross();
          }}
          onBlur={() => {
            kb.current.on = false;
            if (kb.current.down) {
              kb.current.down = false;
              end();
            }
            placeCross();
          }}
          data-tool={looking ? "hand" : tool}
          className="wall-paper"
        />
        <span ref={cross} aria-hidden="true" className="wall-cross" />

        {/* Tools and inks, on a rail in the corner */}
        <div className="wall-rail">
          <div role="radiogroup" aria-label="Tool" className="wall-rail-group">
            {TOOLS.map((t) => (
              <button
                key={t.id}
                type="button"
                role="radio"
                aria-checked={tool === t.id}
                aria-label={t.name}
                title={`${t.name} (${t.hint})`}
                onClick={() => setTool(t.id)}
                className="wall-tool"
                style={t.id === "eraser" || t.id === "hand" ? undefined : { color: INKS[ink]![theme] }}
              >
                <ToolFace tool={t.id} />
              </button>
            ))}
          </div>
          <span aria-hidden="true" className="wall-rail-rule" />
          <div role="radiogroup" aria-label="Ink" className="wall-rail-group">
            {INKS.map((c, i) => (
              <button
                key={c.name}
                type="button"
                role="radio"
                aria-checked={ink === i}
                aria-label={c.name}
                title={c.name}
                onClick={() => {
                  setInk(i);
                  if (tool === "eraser" || tool === "hand") setTool("pen");
                }}
                className="wall-ink"
                style={{ "--ink": c[theme] } as React.CSSProperties}
              />
            ))}
          </div>
        </div>

        {/* Zoom, slim, top right */}
        <div className="wall-zoom" role="group" aria-label="Zoom">
          <button type="button" onClick={() => zoomAt(1.25, undefined, undefined, true)} disabled={zoom >= MAX_Z * 100} aria-label="Zoom in">
            <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
              <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
          <span aria-live="polite" className="tabular">
            {zoom}%
          </span>
          <button type="button" onClick={() => zoomAt(0.8, undefined, undefined, true)} disabled={zoom <= MIN_Z * 100} aria-label="Zoom out">
            <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
              <path d="M3 8h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
          <button type="button" onClick={() => fit()} aria-label="Show the whole wall" title="Show the whole wall (F)">
            <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
              <path d="M2.5 6V2.5H6M10 2.5h3.5V6M13.5 10v3.5H10M6 13.5H2.5V10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {/* What to do with your lines, bottom right */}
        <div className="wall-actions">
          <button type="button" onClick={undo} disabled={!counts.canUndo} aria-label="Undo" title="Undo (⌘Z)" className="wall-action wall-action-icon">
            <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
              <path d="M6 4.5L3 7.5l3 3M3.5 7.5H10a3 3 0 0 1 0 6H8" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button type="button" onClick={startOver} disabled={!counts.mine} className="wall-action">
            Start over
          </button>
          <button type="button" onClick={() => void add()} disabled={!counts.mine || posting} aria-busy={posting} className="wall-add">
            {posting ? "Adding…" : "Add to the wall"}
          </button>
        </div>
      </div>

      <p className={`mt-3 min-h-[1.5em] text-small ${note?.bad ? "text-danger" : "text-ink-2"}`}>
        {note
          ? note.text
          : shared
            ? "One wall for everyone who visits. Yours stays yours until you add it."
            : "Draw anything. Add it to the wall and it'll be here next time."}
      </p>
      <p className="mt-1 text-small text-ink-3">
        {touch
          ? "Pinch to zoom. Two fingers, or the hand, to wander the wall."
          : "⌘ or Ctrl and scroll to zoom. Hold space, or take the hand, to wander the wall."}
      </p>
      <p className="sr-only" aria-live="polite">
        {said}
      </p>
    </div>
  );
}
