"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "@/components/ui/use-reduced-motion";

type Photo = { src: string | null; alt: string };

/** Cells across the card; rows follow from the aspect ratio */
const COLS = 18;
/** Reach of the cursor's reveal, as a fraction of the card width */
const REACH = 0.34;
/** Time constants (s): tiles flip to the photo quickly and drift back slowly, leaving a trail */
const RISE = 0.07;
const FALL = 0.55;

type Cell = { heat: number; jitter: number };

/**
 * Portrait that is an illustration by default and the real photo underneath.
 * Around the cursor the tiles turn into the photo in steps, coarse mosaic,
 * then fine mosaic, then sharp, and drift back to the illustration after
 * the cursor has moved on, leaving a pixel trail. The edge is ragged on
 * purpose: each tile has its own small offset, so the reveal dissolves
 * rather than drawing a clean circle.
 *
 * Keyboard (Enter/Space) and touch (tap) dissolve the whole card to the
 * photo and back. Reduced motion: no trail; the photo crossfades in on
 * hover, focus or tap.
 *
 * Canvas at device pixel ratio (capped at 2), painted only while tiles are
 * changing. The photo layer loads after the illustration.
 */
export function PixelPortrait({
  stylized,
  real,
  alt,
  priority = false,
}: {
  stylized: string;
  real: Photo;
  alt: string;
  priority?: boolean;
}) {
  const reduce = useReducedMotion();
  const [full, setFull] = useState(false);
  const [hovered, setHovered] = useState(false);
  const box = useRef<HTMLButtonElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const live = useRef({ full, reduce });
  useEffect(() => {
    live.current = { full, reduce };
  });

  useEffect(() => {
    const el = box.current;
    const cv = canvas.current;
    const ctx = cv?.getContext("2d");
    if (!el || !cv || !ctx || !real.src || reduce) return;

    const img = new window.Image();
    img.decoding = "async";
    img.src = real.src;

    let w = 0;
    let h = 0;
    let dpr = 1;
    let cols = COLS;
    let rows = 1;
    let cw = 0;
    let ch = 0;
    let cells: Cell[] = [];
    // Source rect of the photo that object-fit: cover shows
    let sx = 0;
    let sy = 0;
    let sw = 0;
    let sh = 0;
    // The photo averaged per tile and per 2×2 block, for the mosaic steps
    let fine: Uint8ClampedArray | null = null;
    let coarse: Uint8ClampedArray | null = null;

    const pointer = { x: 0, y: 0, inside: false };
    let raf = 0;
    let last = 0;
    let fullSince = 0;

    const sample = (c: number, r: number) => {
      const off = document.createElement("canvas");
      off.width = c;
      off.height = r;
      const o = off.getContext("2d")!;
      o.imageSmoothingQuality = "high";
      o.drawImage(img, sx, sy, sw, sh, 0, 0, c, r);
      return o.getImageData(0, 0, c, r).data;
    };

    const build = () => {
      const r = el.getBoundingClientRect();
      w = r.width;
      h = r.height;
      if (!w || !h) return;
      dpr = Math.min(devicePixelRatio || 1, 2);
      cv.width = Math.round(w * dpr);
      cv.height = Math.round(h * dpr);
      cols = COLS;
      cw = w / cols;
      rows = Math.max(1, Math.round(h / cw));
      ch = h / rows;
      let seed = 11;
      const rand = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
      cells = Array.from({ length: cols * rows }, () => ({ heat: 0, jitter: rand() }));
      if (img.complete && img.naturalWidth) prepare();
      paint();
    };

    const prepare = () => {
      const ir = img.naturalWidth / img.naturalHeight;
      const br = w / h;
      if (ir > br) {
        sh = img.naturalHeight;
        sw = sh * br;
        sx = (img.naturalWidth - sw) / 2;
        sy = 0;
      } else {
        sw = img.naturalWidth;
        sh = sw / br;
        sx = 0;
        sy = (img.naturalHeight - sh) / 2;
      }
      fine = sample(cols, rows);
      coarse = sample(Math.ceil(cols / 2), Math.ceil(rows / 2));
    };

    const paint = () => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      if (!fine || !coarse || cells.length !== rows * cols) return;
      const cc = Math.ceil(cols / 2);
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const heat = cells[r * cols + c]!.heat;
          if (heat < 0.05) continue;
          const x = c * cw;
          const y = r * ch;
          if (heat >= 0.62) {
            // Sharp photo for this tile (a hair of overlap hides seams)
            const fx = sx + (x / w) * sw;
            const fy = sy + (y / h) * sh;
            ctx.globalAlpha = Math.min(1, (heat - 0.62) / 0.12 + 0.6);
            ctx.drawImage(img, fx, fy, (cw / w) * sw, (ch / h) * sh, x, y, cw + 0.5, ch + 0.5);
          }
          if (heat < 0.74) {
            // Mosaic: coarse 2×2 blocks first, then single tiles
            const coarseStep = heat < 0.36;
            const data = coarseStep ? coarse : fine;
            const i = coarseStep ? ((r >> 1) * cc + (c >> 1)) * 4 : (r * cols + c) * 4;
            ctx.globalAlpha = heat >= 0.62 ? 1 - (heat - 0.62) / 0.12 : Math.min(1, heat / 0.2);
            ctx.fillStyle = `rgb(${data[i]},${data[i + 1]},${data[i + 2]})`;
            ctx.fillRect(x, y, cw + 0.5, ch + 0.5);
          }
        }
      }
      ctx.globalAlpha = 1;
    };

    const tick = (now: number) => {
      raf = 0;
      // Not measured yet (e.g. hidden at this breakpoint): nothing to animate
      if (cells.length !== rows * cols) return;
      const dt = Math.min(now - last, 50) / 1000;
      last = now;
      const kUp = 1 - Math.exp(-dt / RISE);
      const kDown = 1 - Math.exp(-dt / FALL);
      const reach = REACH * w;
      const showAll = live.current.full;
      const since = (now - fullSince) / 1000;
      let busy = pointer.inside;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const cell = cells[r * cols + c]!;
          let target = 0;
          if (showAll) {
            // Whole-card dissolve: tiles flip in a random order over ~0.5s
            target = since > cell.jitter * 0.5 ? 1 : 0;
          } else if (pointer.inside) {
            const dx = (c + 0.5) * cw - pointer.x;
            const dy = (r + 0.5) * ch - pointer.y;
            const d = Math.hypot(dx, dy) / reach + (cell.jitter - 0.5) * 0.45;
            target = d < 1 ? Math.min(1, (1 - d) * 2.6) : 0;
          }
          const k = target > cell.heat ? kUp : kDown;
          cell.heat += (target - cell.heat) * k;
          if (Math.abs(target - cell.heat) < 0.004) cell.heat = target;
          if (cell.heat !== target) busy = true;
        }
      }
      paint();
      if (busy) raf = requestAnimationFrame(tick);
    };
    const wake = () => {
      if (raf) return;
      last = performance.now();
      raf = requestAnimationFrame(tick);
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const r = el.getBoundingClientRect();
      pointer.x = e.clientX - r.left;
      pointer.y = e.clientY - r.top;
      pointer.inside = true;
      wake();
    };
    const onLeave = () => {
      pointer.inside = false;
      wake();
    };
    const onFull = () => {
      fullSince = performance.now();
      wake();
    };

    img.onload = () => {
      if (w) prepare();
      paint();
    };
    build();
    const ro = new ResizeObserver(build);
    ro.observe(el);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    el.addEventListener("portrait:full", onFull);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      el.removeEventListener("portrait:full", onFull);
    };
  }, [real.src, reduce]);

  // Keyboard and touch: tell the canvas loop the whole card changed
  useEffect(() => {
    box.current?.dispatchEvent(new Event("portrait:full"));
  }, [full]);

  const showReal = full || (reduce && hovered);

  return (
    <button
      ref={box}
      type="button"
      aria-pressed={full}
      aria-label={`${alt}. ${full ? "Show the illustration" : "Show the real photo"}`}
      onClick={() => setFull((f) => !f)}
      onPointerEnter={(e) => e.pointerType === "mouse" && setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      onFocus={(e) => reduce && e.target.matches(":focus-visible") && setHovered(true)}
      onBlur={() => setHovered(false)}
      className="pixel-portrait relative block h-full w-full cursor-crosshair overflow-hidden rounded-[var(--radius-l)] text-left shadow-[var(--shadow-float)] outline-offset-4"
    >
      <Image src={stylized} alt="" fill sizes="(min-width: 1024px) 336px, 60vw" priority={priority} draggable={false} className="object-cover" />
      {reduce && real.src ? (
        <Image
          src={real.src}
          alt=""
          fill
          sizes="(min-width: 1024px) 336px, 60vw"
          draggable={false}
          className="object-cover transition-opacity duration-[var(--dur-base)] ease-[var(--ease-enter)]"
          style={{ opacity: showReal ? 1 : 0 }}
        />
      ) : (
        <canvas ref={canvas} aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full" />
      )}
    </button>
  );
}
