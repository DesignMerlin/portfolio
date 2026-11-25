"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useReducedMotion } from "@/components/ui/use-reduced-motion";
import { drawStroke, elapsed, INKS, newStroke, type Stroke, type Tool } from "@/components/playground/ink";

const KEY = "doodle:v1";
const PAPER = { light: "#ffffff", dark: "#15181e" };
const PROMPTS = [
  "Draw a button that really wants to be pressed.",
  "Draw Monday, then draw Friday.",
  "Draw the last app that made you smile.",
  "Draw a loading spinner with a personality.",
  "Draw Lagos traffic as a user flow.",
  "Draw your dream desk.",
  "Draw a logo for a company that sells clouds.",
  "Draw what waiting for a visa feels like.",
];
const TOOLS: { id: Tool; label: string; key: string }[] = [
  { id: "pen", label: "Pen", key: "p" },
  { id: "marker", label: "Marker", key: "m" },
  { id: "spray", label: "Spray", key: "s" },
  { id: "eraser", label: "Eraser", key: "e" },
];
const MIRRORS = [
  { n: 1, label: "No mirror" },
  { n: 2, label: "Mirror" },
  { n: 8, label: "Kaleidoscope" },
];

const themeNow = () => (document.documentElement.dataset.theme === "dark" ? "dark" : "light");
const subscribeTheme = (fn: () => void) => {
  const mo = new MutationObserver(fn);
  mo.observe(document.documentElement, { attributeFilter: ["data-theme"] });
  return () => mo.disconnect();
};

/**
 * A page to doodle on. Strokes are kept as vectors, so the drawing survives a
 * resize or a theme change, can be undone, and can be played back as it was
 * drawn.
 * - Pen: thins as you speed up, like ink. Marker: flat and see-through.
 *   Spray: scatters. Eraser.
 * - Mirror and kaleidoscope repeat every stroke around the middle.
 * - Undo and redo (Ctrl/⌘ Z), clear (undoable), replay, save as PNG.
 * - Kept in this browser only, so it's still there when you come back.
 * Keyboard: focus the paper, move with the arrow keys, hold Space or Enter to
 * draw. Reduced motion: replay shows the finished drawing.
 */
export function Doodle() {
  const reduce = useReducedMotion();
  const theme = useSyncExternalStore(subscribeTheme, themeNow, () => "light" as const);
  const wrap = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const strokes = useRef<Stroke[]>([]);
  const undone = useRef<Stroke[][]>([]);
  const history = useRef<Stroke[][]>([]);
  const current = useRef<Stroke | null>(null);
  const cursor = useRef<HTMLSpanElement>(null);
  const keys = useRef({ x: 0.5, y: 0.5, down: false });
  const replayId = useRef(0);

  const [tool, setTool] = useState<Tool>("pen");
  const [ink, setInk] = useState(0);
  const [size, setSize] = useState(6);
  const [mirror, setMirror] = useState(1);
  const [prompt, setPrompt] = useState(0);
  const [count, setCount] = useState({ n: 0, undo: 0, redo: 0 });
  const [replaying, setReplaying] = useState(false);
  const [note, setNote] = useState("");

  const sync = useCallback(() => {
    setCount({ n: strokes.current.length, undo: history.current.length, redo: undone.current.length });
    try {
      localStorage.setItem(KEY, JSON.stringify(strokes.current));
    } catch {
      // Private window or full storage: the drawing just isn't kept
    }
  }, []);

  /** Paint everything from scratch. Points are fractions of the paper's width, so any size works */
  const redraw = useCallback(
    (list: Stroke[] = strokes.current) => {
      const c = canvas.current;
      const ctx = c?.getContext("2d");
      if (!c || !ctx) return;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, c.width, c.height);
      for (const s of list) drawStroke(ctx, s, c.width, c.height, theme);
    },
    [theme],
  );

  // Fit the canvas to the paper at the screen's resolution
  useEffect(() => {
    const el = wrap.current;
    const c = canvas.current;
    if (!el || !c) return;
    const fit = () => {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      c.width = Math.round(el.clientWidth * dpr);
      c.height = Math.round(el.clientHeight * dpr);
      redraw();
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, [redraw]);

  // Bring back the last drawing
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY) ?? "[]") as Stroke[];
      if (Array.isArray(saved) && saved.length) {
        strokes.current = saved;
        redraw();
        // eslint-disable-next-line react-hooks/set-state-in-effect -- storage is only readable after mount
        setCount({ n: saved.length, undo: 0, redo: 0 });
      }
    } catch {
      // Unreadable: start with a clean page
    }
    // Once, on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stopReplay = useCallback(() => {
    if (!replayId.current) return;
    cancelAnimationFrame(replayId.current);
    replayId.current = 0;
    setReplaying(false);
    redraw();
  }, [redraw]);

  useEffect(() => () => cancelAnimationFrame(replayId.current), []);

  const begin = (x: number, y: number) => {
    stopReplay();
    current.current = newStroke({ tool, ink, size, mirror }, x, y);
    paintLive();
  };
  const extend = (x: number, y: number) => {
    const s = current.current;
    if (!s) return;
    const last = s.pts.at(-1)!;
    if (Math.hypot(x - last[0], y - last[1]) < 0.0008) return;
    s.pts.push([x, y, elapsed(s)]);
    paintLive();
  };
  const end = () => {
    const s = current.current;
    if (!s) return;
    current.current = null;
    history.current.push([...strokes.current]);
    if (history.current.length > 80) history.current.shift();
    undone.current = [];
    strokes.current = [...strokes.current, s];
    redraw();
    sync();
  };
  /** The stroke in hand, on top of what's there */
  const frame = useRef(0);
  const paintLive = () => {
    if (frame.current) return;
    frame.current = requestAnimationFrame(() => {
      frame.current = 0;
      const s = current.current;
      redraw(s ? [...strokes.current, s] : strokes.current);
    });
  };

  const where = (e: { clientX: number; clientY: number }): [number, number] => {
    const r = canvas.current!.getBoundingClientRect();
    return [(e.clientX - r.left) / r.width, (e.clientY - r.top) / r.width];
  };

  const undo = useCallback(() => {
    const prev = history.current.pop();
    if (!prev) return;
    stopReplay();
    undone.current.push(strokes.current);
    strokes.current = prev;
    redraw();
    sync();
    setNote("Undone");
  }, [redraw, stopReplay, sync]);
  const redo = useCallback(() => {
    const next = undone.current.pop();
    if (!next) return;
    stopReplay();
    history.current.push(strokes.current);
    strokes.current = next;
    redraw();
    sync();
    setNote("Redone");
  }, [redraw, stopReplay, sync]);
  const clear = () => {
    if (!strokes.current.length) return;
    stopReplay();
    history.current.push(strokes.current);
    undone.current = [];
    strokes.current = [];
    redraw();
    sync();
    setNote("Page cleared. Undo brings it back.");
  };

  const replay = () => {
    if (replaying) return stopReplay();
    if (reduce || !strokes.current.length) return;
    setReplaying(true);
    const list = strokes.current;
    // Each stroke takes as long as it took, capped, and the whole thing fits in about ten seconds
    const raw = list.map((s) => Math.min(Math.max(s.pts.at(-1)![2], 120), 1600));
    const k = Math.min(1, 10000 / raw.reduce((a, b) => a + b + 90, 0));
    const t0 = performance.now();
    const tick = (now: number) => {
      let t = (now - t0) / k;
      const out: Stroke[] = [];
      for (let i = 0; i < list.length; i++) {
        const d = raw[i]!;
        if (t <= 0) break;
        const s = list[i]!;
        const share = Math.min(1, t / d);
        out.push(share === 1 ? s : { ...s, pts: s.pts.slice(0, Math.max(1, Math.ceil(s.pts.length * share))) });
        t -= d + 90;
      }
      redraw(out);
      if (t < 0 || out.length < list.length) replayId.current = requestAnimationFrame(tick);
      else {
        replayId.current = 0;
        setReplaying(false);
      }
    };
    replayId.current = requestAnimationFrame(tick);
  };

  const save = () => {
    const c = canvas.current;
    if (!c) return;
    const out = document.createElement("canvas");
    out.width = c.width;
    out.height = c.height;
    const ctx = out.getContext("2d")!;
    ctx.fillStyle = PAPER[theme];
    ctx.fillRect(0, 0, out.width, out.height);
    ctx.drawImage(c, 0, 0);
    out.toBlob((b) => {
      if (!b) return;
      const url = URL.createObjectURL(b);
      const a = document.createElement("a");
      a.href = url;
      a.download = "doodle.png";
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      setNote("Saved as doodle.png");
    });
  };

  // Shortcuts, while the pointer or focus is on the playground
  useEffect(() => {
    const el = wrap.current?.closest<HTMLElement>("[data-doodle]");
    if (!el) return;
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).matches("input[type=text], textarea")) return;
      const mod = e.ctrlKey || e.metaKey;
      if (mod && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
      } else if (mod && e.key.toLowerCase() === "y") {
        e.preventDefault();
        redo();
      } else if (!mod && !e.altKey) {
        const t = TOOLS.find((x) => x.key === e.key.toLowerCase());
        if (t) setTool(t.id);
      }
    };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, [undo, redo]);

  // Keyboard drawing: a cursor moved with the arrows, and Space or Enter held to draw
  const placeCursor = () => {
    const el = cursor.current;
    const c = canvas.current;
    if (!el || !c) return;
    el.style.transform = `translate(${keys.current.x * c.clientWidth}px, ${keys.current.y * c.clientWidth}px)`;
  };
  const onPaperKey = (e: React.KeyboardEvent) => {
    const step = e.shiftKey ? 0.04 : 0.012;
    const c = canvas.current!;
    const maxY = c.clientHeight / c.clientWidth;
    const k = keys.current;
    const d = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[e.key];
    if (d) {
      e.preventDefault();
      k.x = Math.min(1, Math.max(0, k.x + d[0]! * step));
      k.y = Math.min(maxY, Math.max(0, k.y + d[1]! * step));
      placeCursor();
      if (k.down) extend(k.x, k.y);
    } else if ((e.key === " " || e.key === "Enter") && !k.down) {
      e.preventDefault();
      k.down = true;
      begin(k.x, k.y);
    } else if (e.key === " " || e.key === "Enter") e.preventDefault();
  };
  const liftKeys = () => {
    if (!keys.current.down) return;
    keys.current.down = false;
    end();
  };

  const round = "pressable grid size-10 place-items-center rounded-full border border-line bg-surface text-ink-2 hover:text-ink disabled:opacity-40 disabled:hover:text-ink-2";

  return (
    <div data-doodle>
      <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-2">
        <p aria-live="polite" className="text-lead font-medium">
          {PROMPTS[prompt]}
        </p>
        <button
          type="button"
          onClick={() => setPrompt((p) => (p + 1 + Math.floor(Math.random() * (PROMPTS.length - 2))) % PROMPTS.length)}
          className="text-small text-ink-2 underline underline-offset-4 hover:text-ink"
        >
          Give me another
        </button>
      </div>

      <div
        ref={wrap}
        className="doodle-paper relative aspect-[4/5] w-full overflow-hidden rounded-[var(--radius-l)] border border-line sm:aspect-auto sm:h-[clamp(340px,calc(100svh-400px),760px)]"
        style={{ "--paper-bg": PAPER[theme] } as React.CSSProperties}
      >
        <canvas
          ref={canvas}
          tabIndex={0}
          role="img"
          aria-label={`Paper with ${count.n} ${count.n === 1 ? "stroke" : "strokes"}. Draw with a mouse, finger or pen. With a keyboard: arrow keys move, hold Space to draw.`}
          className="absolute inset-0 h-full w-full cursor-crosshair touch-none"
          onPointerDown={(e) => {
            if (e.button !== 0) return;
            e.currentTarget.setPointerCapture(e.pointerId);
            begin(...where(e));
          }}
          onPointerMove={(e) => {
            if (!current.current || keys.current.down) return;
            const list = e.nativeEvent.getCoalescedEvents?.() ?? [];
            for (const p of list.length ? list : [e.nativeEvent]) extend(...where(p));
          }}
          onPointerUp={end}
          onPointerCancel={end}
          onKeyDown={onPaperKey}
          onKeyUp={(e) => (e.key === " " || e.key === "Enter") && liftKeys()}
          onFocus={placeCursor}
          onBlur={liftKeys}
        />
        <span ref={cursor} aria-hidden="true" className="doodle-cursor" />
        {mirror > 1 ? <span aria-hidden="true" className="doodle-axis" data-n={mirror} /> : null}
        {count.n === 0 ? (
          <p aria-hidden="true" className="doodle-hint pointer-events-none absolute inset-0 grid place-items-center text-ink-3">
            Draw anything
          </p>
        ) : null}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-3">
        <div role="radiogroup" aria-label="Tool" className="flex rounded-full border border-line bg-surface p-1">
          {TOOLS.map((t) => (
            <button
              key={t.id}
              type="button"
              role="radio"
              aria-checked={tool === t.id}
              aria-keyshortcuts={t.key}
              onClick={() => setTool(t.id)}
              className={`rounded-full px-3.5 py-1.5 text-small transition-colors duration-150 ${tool === t.id ? "bg-ink text-paper" : "text-ink-2 hover:text-ink"}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div role="radiogroup" aria-label="Colour" className="flex gap-1.5">
          {INKS.map((c, i) => (
            <button
              key={c.name}
              type="button"
              role="radio"
              aria-checked={ink === i}
              aria-label={c.name}
              onClick={() => {
                setInk(i);
                if (tool === "eraser") setTool("pen");
              }}
              className="doodle-ink"
              style={{ "--c": c[theme] } as React.CSSProperties}
            />
          ))}
        </div>

        <label className="flex items-center gap-3 text-small text-ink-2">
          Size
          <input type="range" min={2} max={40} value={size} onChange={(e) => setSize(Number(e.target.value))} className="doodle-size w-28" aria-valuetext={`${size} pixels`} />
        </label>

        <div role="radiogroup" aria-label="Symmetry" className="flex rounded-full border border-line bg-surface p-1">
          {MIRRORS.map((m) => (
            <button
              key={m.n}
              type="button"
              role="radio"
              aria-checked={mirror === m.n}
              onClick={() => setMirror(m.n)}
              className={`rounded-full px-3 py-1.5 text-small transition-colors duration-150 ${mirror === m.n ? "bg-ink text-paper" : "text-ink-2 hover:text-ink"}`}
            >
              {m.label}
            </button>
          ))}
        </div>

        <div className="flex gap-2 sm:ml-auto">
          <button type="button" onClick={undo} disabled={!count.undo} aria-label="Undo" className={round}>
            <Icon d="M4 7h7a4 4 0 0 1 0 8H8M4 7l3-3M4 7l3 3" />
          </button>
          <button type="button" onClick={redo} disabled={!count.redo} aria-label="Redo" className={round}>
            <Icon d="M14 7H7a4 4 0 0 0 0 8h3M14 7l-3-3M14 7l-3 3" />
          </button>
          <button type="button" onClick={replay} disabled={!count.n || reduce} aria-label={replaying ? "Stop the replay" : "Replay the drawing"} className={round}>
            <Icon d={replaying ? "M6 5h6v8H6z" : "M6 4.5v9l7-4.5z"} fill />
          </button>
          <button type="button" onClick={clear} disabled={!count.n} aria-label="Clear the page" className={round}>
            <Icon d="M4 5h10M7 5V3.5h4V5M5.5 5l.6 9.5h5.8L12.5 5" />
          </button>
          <button type="button" onClick={save} disabled={!count.n} className="pressable rounded-full bg-ink px-4 text-small font-medium text-paper disabled:opacity-40">
            Save as PNG
          </button>
        </div>
      </div>
      <p aria-live="polite" className="mt-3 min-h-[1.4em] text-small text-ink-3">
        {note}
      </p>
    </div>
  );
}

function Icon({ d, fill = false }: { d: string; fill?: boolean }) {
  return (
    <svg aria-hidden="true" width="18" height="18" viewBox="0 0 18 18" fill={fill ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}
