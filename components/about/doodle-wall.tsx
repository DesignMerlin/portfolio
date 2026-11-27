"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useReducedMotion } from "@/components/ui/use-reduced-motion";

/**
 * The About page's doodle wall: a wall that keeps going in every direction.
 * - Draw with a finger, pen or mouse in one of five inks, thick or thin.
 * - Look around: Move (or hold Space), two fingers, or the middle mouse button pans; pinch, ⌘/Ctrl +
 *   scroll, or + and − zoom around the pointer; Fit frames everything that's been drawn.
 * - Undo takes back your last stroke; Clear wipes the wall (and Undo brings it back).
 * - Leave it here pins what you've drawn to the wall. The wall lives in this browser only.
 * Strokes are kept in the wall's own coordinates, so they stay sharp at any zoom.
 * Keyboard: focus the wall; arrow keys move a crosshair (the wall pans when it reaches an edge), hold
 * Enter to draw, + and − zoom, F fits. Reduced motion: Fit and zoom jump instead of gliding.
 */

const KEY = "doodle-wall:v1";
const INKS = [
  { name: "Ink", light: "#16181d", dark: "#eceef1" },
  { name: "Magenta", light: "#c026d3", dark: "#e879f9" },
  { name: "Orange", light: "#ea6a1b", dark: "#fb9a5b" },
  { name: "Green", light: "#16a34a", dark: "#4ade80" },
  { name: "Blue", light: "#1d72e8", dark: "#6aa8ff" },
];
const THICK = 14;
const THIN = 3.5;
const MIN_Z = 0.25;
const MAX_Z = 4;
const GRID = 24;

type Pt = [x: number, y: number];
type Stroke = { ink: number; w: number; pts: Pt[] };
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

export function DoodleWall() {
  const reduce = useReducedMotion();
  const theme = useSyncExternalStore(onTheme, themeNow, () => "dark" as Theme);
  const box = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const cross = useRef<HTMLSpanElement>(null);

  // What's on the wall: left strokes (kept) and this visit's strokes (not left yet)
  const kept = useRef<Stroke[]>([]);
  const mine = useRef<Stroke[]>([]);
  const cleared = useRef<Stroke[] | null>(null);
  const live = useRef<Stroke | null>(null);
  const view = useRef<View>({ x: 0, y: 0, z: 1 });
  const size = useRef({ w: 800, h: 500 });
  const frame = useRef(0);

  const [ink, setInk] = useState(0);
  const [thin, setThin] = useState(false);
  const [move, setMove] = useState(false);
  const [space, setSpace] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [counts, setCounts] = useState({ mine: 0, all: 0, canUndo: false });
  const [said, setSaid] = useState("");
  const touch = useSyncExternalStore(noop, () => matchMedia("(pointer: coarse)").matches, () => false);

  const sync = useCallback(() => {
    setCounts({ mine: mine.current.length, all: kept.current.length + mine.current.length, canUndo: mine.current.length > 0 || !!cleared.current });
  }, []);

  // Drawing ------------------------------------------------------------------
  const draw = useCallback(() => {
    frame.current = 0;
    const c = canvas.current;
    const ctx = c?.getContext("2d");
    if (!c || !ctx) return;
    const { w, h } = size.current;
    const dpr = Math.min(2, devicePixelRatio || 1);
    const t = themeNow();
    const { x, y, z } = view.current;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = t === "dark" ? "#1b1d23" : "#fbfaf7";
    ctx.fillRect(0, 0, w, h);
    // Dots, every 24 wall px, spaced out further when zoomed far out so they never turn to noise
    let step = GRID;
    while (step * z < 12) step *= 2;
    ctx.fillStyle = t === "dark" ? "rgb(255 255 255 / 0.09)" : "rgb(20 22 30 / 0.12)";
    const r = Math.max(0.6, Math.min(1.2, z));
    for (let gx = Math.floor(x / step) * step; (gx - x) * z < w; gx += step)
      for (let gy = Math.floor(y / step) * step; (gy - y) * z < h; gy += step) {
        ctx.beginPath();
        ctx.arc((gx - x) * z, (gy - y) * z, r, 0, Math.PI * 2);
        ctx.fill();
      }
    ctx.setTransform(dpr * z, 0, 0, dpr * z, -x * z * dpr, -y * z * dpr);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    const all = [...kept.current, ...mine.current, ...(live.current ? [live.current] : [])];
    for (const s of all) {
      const p = s.pts;
      if (!p.length) continue;
      // Skip what's nowhere near the view
      ctx.strokeStyle = ctx.fillStyle = INKS[s.ink]?.[t] ?? INKS[0]![t];
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
    }
  }, []);
  const redraw = useCallback(() => {
    if (!frame.current) frame.current = requestAnimationFrame(draw);
  }, [draw]);

  // Zoom and pan --------------------------------------------------------------
  const glide = useRef<Animation | null>(null);
  /** Where the view is headed: a second zoom step mid-glide builds on the first, not on where the glide had got to */
  const aim = useRef<View>({ x: 0, y: 0, z: 1 });
  const setView = useCallback(
    (next: View, animate = false) => {
      glide.current?.cancel();
      const from = { ...view.current };
      const to = { ...next, z: clampZ(next.z) };
      aim.current = to;
      setZoom(Math.round(to.z * 100));
      if (!animate || reduce) {
        view.current = to;
        redraw();
        return;
      }
      // A short eased glide, drawn from the animation's own clock
      const start = performance.now();
      const dur = 280;
      const step = (now: number) => {
        const k = Math.min(1, (now - start) / dur);
        const e = 1 - Math.pow(1 - k, 3);
        view.current = { x: from.x + (to.x - from.x) * e, y: from.y + (to.y - from.y) * e, z: from.z + (to.z - from.z) * e };
        draw();
        if (k < 1) frame.current = requestAnimationFrame(step);
        else frame.current = 0;
      };
      cancelAnimationFrame(frame.current);
      frame.current = requestAnimationFrame(step);
    },
    [draw, redraw, reduce],
  );
  /** Zoom by `k` around a point on screen (the middle, unless given) */
  const zoomAt = useCallback(
    (k: number, sx = size.current.w / 2, sy = size.current.h / 2, animate = false) => {
      const v = animate ? aim.current : view.current;
      const z = clampZ(v.z * k);
      // Keep the wall point under (sx, sy) where it is
      const wx = v.x + sx / v.z;
      const wy = v.y + sy / v.z;
      setView({ x: wx - sx / z, y: wy - sy / z, z }, animate);
    },
    [setView],
  );
  /** Frame everything that's been drawn, or the middle at 100% on an empty wall */
  const fit = useCallback(
    (animate = true) => {
      const { w, h } = size.current;
      const all = [...kept.current, ...mine.current].flatMap((s) => s.pts);
      if (!all.length) return setView({ x: -w / 2, y: -h / 2, z: 1 }, animate);
      let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
      for (const [x, y] of all) {
        x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y);
      }
      const pad = 40;
      const z = clampZ(Math.min((w - pad * 2) / Math.max(1, x1 - x0), (h - pad * 2) / Math.max(1, y1 - y0), 1.5));
      setView({ x: (x0 + x1) / 2 - w / 2 / z, y: (y0 + y1) / 2 - h / 2 / z, z }, animate);
    },
    [setView],
  );

  // Size, saved wall, theme ----------------------------------------------------
  useEffect(() => {
    kept.current = load();
    const c = canvas.current!;
    const ro = new ResizeObserver(([e]) => {
      const { width: w, height: h } = e!.contentRect;
      const first = size.current.w === 800 && size.current.h === 500 && !c.width;
      size.current = { w, h };
      const dpr = Math.min(2, devicePixelRatio || 1);
      c.width = Math.round(w * dpr);
      c.height = Math.round(h * dpr);
      if (first) fit(false);
      else redraw();
    });
    ro.observe(c);
    sync();
    return () => {
      ro.disconnect();
      cancelAnimationFrame(frame.current);
    };
  }, [fit, redraw, sync]);
  useEffect(() => redraw(), [theme, redraw]);

  // Space held: look around instead of drawing (only while the wall has the pointer or focus)
  const over = useRef(false);
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.code !== "Space" || e.repeat || !(over.current || box.current?.contains(document.activeElement))) return;
      if (document.activeElement === canvas.current) return; // on the focused wall, Space is for the keyboard pen
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

  // Pointers -------------------------------------------------------------------
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const pan = useRef<{ x: number; y: number } | null>(null);
  const pinch = useRef<{ d: number; mx: number; my: number } | null>(null);

  const toWall = (sx: number, sy: number): Pt => {
    const v = view.current;
    return [v.x + sx / v.z, v.y + sy / v.z];
  };
  const local = (e: React.PointerEvent) => {
    const r = canvas.current!.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };
  const endStroke = useCallback(() => {
    const s = live.current;
    live.current = null;
    if (!s) return;
    mine.current.push(s);
    cleared.current = null;
    sync();
    redraw();
  }, [redraw, sync]);

  const onDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (e.button === 2) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    const p = local(e);
    pointers.current.set(e.pointerId, p);
    glide.current?.cancel();
    if (pointers.current.size === 2) {
      // A second finger: no drawing, two-finger pan and pinch instead
      live.current = null;
      const [a, b] = [...pointers.current.values()];
      pinch.current = { d: Math.hypot(a!.x - b!.x, a!.y - b!.y), mx: (a!.x + b!.x) / 2, my: (a!.y + b!.y) / 2 };
      pan.current = null;
      redraw();
      return;
    }
    if (move || space || e.button === 1) {
      pan.current = p;
      return;
    }
    live.current = { ink, w: (thin ? THIN : THICK) / Math.max(0.5, view.current.z), pts: [toWall(p.x, p.y)] };
    redraw();
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
      view.current = { x: wx - mx / z, y: wy - my / z, z };
      pinch.current = { d, mx, my };
      aim.current = view.current;
      setZoom(Math.round(z * 100));
      redraw();
      return;
    }
    if (pan.current) {
      const v = view.current;
      view.current = { ...v, x: v.x - (p.x - pan.current.x) / v.z, y: v.y - (p.y - pan.current.y) / v.z };
      aim.current = view.current;
      pan.current = p;
      redraw();
      return;
    }
    const s = live.current;
    if (!s) return;
    // Coalesced events: every point the pen passed through, not just one per frame
    const events = e.nativeEvent.getCoalescedEvents?.() ?? [e.nativeEvent];
    const r = canvas.current!.getBoundingClientRect();
    for (const ev of events) s.pts.push(toWall(ev.clientX - r.left, ev.clientY - r.top));
    redraw();
  };
  const onUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) pinch.current = null;
    if (!pointers.current.size) {
      pan.current = null;
      endStroke();
    }
  };

  // Keyboard pen ----------------------------------------------------------------
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
    const act = { "+": () => zoomAt(1.25, k.x, k.y, true), "=": () => zoomAt(1.25, k.x, k.y, true), "-": () => zoomAt(0.8, k.x, k.y, true), _: () => zoomAt(0.8, k.x, k.y, true), f: () => fit(), F: () => fit() }[e.key];
    if (act) {
      e.preventDefault();
      act();
      return;
    }
    if (e.key === "Enter" && !k.down) {
      e.preventDefault();
      k.down = true;
      live.current = { ink, w: (thin ? THIN : THICK) / Math.max(0.5, view.current.z), pts: [toWall(k.x, k.y)] };
      redraw();
      return;
    }
    const d = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[e.key];
    if (!d) return;
    e.preventDefault();
    const stepPx = e.shiftKey ? 32 : 8;
    let nx = k.x + d[0]! * stepPx;
    let ny = k.y + d[1]! * stepPx;
    // At an edge, the wall moves instead: it keeps going
    const v = view.current;
    const edge = 24;
    let px = 0, py = 0;
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
    if (px || py) aim.current = view.current = { ...v, x: v.x + px / v.z, y: v.y + py / v.z };
    k.x = nx;
    k.y = ny;
    if (k.down && live.current) live.current.pts.push(toWall(nx, ny));
    placeCross();
    redraw();
  };
  const onKeyUp = (e: React.KeyboardEvent) => {
    if (e.key !== "Enter" || !kb.current.down) return;
    kb.current.down = false;
    endStroke();
  };

  // Actions -----------------------------------------------------------------------
  const undo = useCallback(() => {
    if (cleared.current) {
      kept.current = cleared.current;
      cleared.current = null;
      save(kept.current);
      setSaid("The wall is back.");
    } else if (mine.current.length) {
      mine.current.pop();
      setSaid("Took back your last line.");
    } else return;
    sync();
    redraw();
  }, [redraw, sync]);
  const clear = () => {
    const all = [...kept.current, ...mine.current];
    if (!all.length) return;
    cleared.current = all;
    kept.current = [];
    mine.current = [];
    save([]);
    sync();
    redraw();
    setSaid("The wall is clear. Undo brings it back.");
  };
  const leave = () => {
    if (!mine.current.length) return;
    kept.current = [...kept.current, ...mine.current];
    mine.current = [];
    cleared.current = null;
    save(kept.current);
    sync();
    setSaid("Left on the wall. It'll be here when you come back.");
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

  const looking = move || space;
  const round = "pressable inline-flex h-10 items-center rounded-[10px] border border-line px-4 text-small text-ink-2 hover:text-ink disabled:opacity-40 disabled:hover:text-ink-2";

  return (
    <div ref={box} className="doodle-wall">
      <div className="relative">
        <canvas
          ref={canvas}
          tabIndex={0}
          role="img"
          aria-label={`A wall to draw on, ${counts.all} ${counts.all === 1 ? "line" : "lines"} so far. Draw with a mouse, finger or pen. With a keyboard: arrow keys move, hold Enter to draw, plus and minus zoom, F fits.`}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
          onPointerEnter={() => (over.current = true)}
          onPointerLeave={() => (over.current = false)}
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
              endStroke();
            }
            placeCross();
          }}
          data-looking={looking ? "" : undefined}
          className="doodle-wall-paper"
        />
        <span ref={cross} aria-hidden="true" className="doodle-wall-cross" />
        <div className="doodle-wall-zoom" role="group" aria-label="Zoom">
          <button type="button" onClick={() => zoomAt(0.8, undefined, undefined, true)} disabled={zoom <= MIN_Z * 100} aria-label="Zoom out">
            −
          </button>
          <span aria-live="polite" className="tabular">
            {zoom}%
          </span>
          <button type="button" onClick={() => zoomAt(1.25, undefined, undefined, true)} disabled={zoom >= MAX_Z * 100} aria-label="Zoom in">
            +
          </button>
          <span aria-hidden="true" className="doodle-wall-zoom-rule" />
          <button type="button" onClick={() => fit()} aria-label="Fit the whole drawing in view">
            Fit
          </button>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <div role="radiogroup" aria-label="Ink" className="flex items-center gap-1.5">
            {INKS.map((c, i) => (
              <button
                key={c.name}
                type="button"
                role="radio"
                aria-checked={ink === i}
                aria-label={c.name}
                onClick={() => {
                  setInk(i);
                  setMove(false);
                }}
                className="doodle-wall-ink"
                style={{ "--ink": c[theme] } as React.CSSProperties}
              />
            ))}
          </div>
          <span aria-hidden="true" className="mx-1 h-6 w-px bg-line" />
          <button type="button" aria-pressed={thin} onClick={() => setThin((t) => !t)} className={`${round} aria-pressed:border-ink-3 aria-pressed:text-ink`}>
            Thin
          </button>
          <button type="button" aria-pressed={move} onClick={() => setMove((m) => !m)} className={`${round} aria-pressed:border-ink-3 aria-pressed:text-ink`}>
            Move
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={undo} disabled={!counts.canUndo} className={round}>
            Undo
          </button>
          <button type="button" onClick={clear} disabled={!counts.all} className={round}>
            Clear
          </button>
          <button
            type="button"
            onClick={leave}
            disabled={!counts.mine}
            className="pressable inline-flex h-10 items-center rounded-[10px] bg-ink px-4 text-small font-medium text-paper hover:opacity-90 disabled:opacity-40"
          >
            Leave it here
          </button>
        </div>
      </div>
      <p className="mt-3 text-small text-ink-3">
        {touch
          ? "The wall keeps going. Pinch to zoom, and drag with two fingers to look around."
          : "The wall keeps going. Pinch or use + and − to zoom, and hold space and drag to look around."}
      </p>
      <p className="sr-only" aria-live="polite">
        {said}
      </p>
    </div>
  );
}
