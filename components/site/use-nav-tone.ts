"use client";

import { useEffect } from "react";

/**
 * Works out what is behind the nav, all the way across it, and splits the nav
 * along it: dark glass with light words over dark things, light glass with
 * dark words over light ones, cut exactly where the page changes, even
 * mid-letter.
 *
 * The page is read as rectangles. Anything with a solid background, every
 * picture (by its average brightness) and every film (which says how bright
 * it is, moment by moment) counts; whatever comes later in the page sits on
 * top. Only what's under the nav is measured, once per scroll frame.
 */
type Tone = "dark" | "light";
type Box = { l: number; t: number; r: number; b: number; tone: Tone };

/** How far outside the pill its glass reaches (its shadow) */
const REACH = 40;
export const NAV_TONE = "nav:tone";

const lum = (r: number, g: number, b: number) => {
  const f = (v: number) => {
    const c = v / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
};
/** Below this, white text reads better than black */
const toneOf = (l: number): Tone => (l < 0.22 ? "dark" : "light");

/** Any CSS colour, through a canvas: the page uses oklab and friends */
let ctx: CanvasRenderingContext2D | null = null;
const pixel = () => (ctx ??= Object.assign(document.createElement("canvas"), { width: 4, height: 4 }).getContext("2d", { willReadFrequently: true }));
function colour(css: string): [number, number, number, number] | null {
  const c = pixel();
  if (!c) return null;
  c.clearRect(0, 0, 4, 4);
  c.fillStyle = css;
  c.fillRect(0, 0, 4, 4);
  const d = c.getImageData(0, 0, 1, 1).data;
  return [d[0]!, d[1]!, d[2]!, d[3]! / 255];
}

const pictures = new Map<string, Tone | null>();
function pictureTone(img: HTMLImageElement): Tone | null {
  const key = img.currentSrc || img.src;
  if (!img.complete || !img.naturalWidth) return null;
  if (pictures.has(key)) return pictures.get(key)!;
  let tone: Tone | null = null;
  try {
    const c = pixel()!;
    c.clearRect(0, 0, 4, 4);
    c.drawImage(img, 0, 0, 4, 4);
    const d = c.getImageData(0, 0, 4, 4).data;
    let sum = 0;
    let solid = 0;
    for (let i = 0; i < d.length; i += 4) {
      if (d[i + 3]! < 200) continue;
      solid++;
      sum += lum(d[i]!, d[i + 1]!, d[i + 2]!);
    }
    if (solid > 12) tone = toneOf(sum / solid);
  } catch {}
  pictures.set(key, tone);
  return tone;
}

/** Whole subtrees the scan never walks into: a film or a live screen speaks for itself, and is made of hundreds of moving parts */
const SEALED = "[data-nav-tone], .live-root, .live, .film";

/** Everything on the page that could change what's behind the nav */
function surfaces() {
  const found: { el: Element; tone: () => Tone | null }[] = [];
  const big = (el: HTMLElement) => el.offsetWidth >= 120 && el.offsetHeight >= 60;
  const picture = (el: HTMLImageElement) => big(el) && found.push({ el, tone: () => pictureTone(el) });
  const visit = (el: HTMLElement) => {
    if (el.dataset.navTone) {
      found.push({ el, tone: () => el.dataset.navTone as Tone });
      return NodeFilter.FILTER_REJECT;
    }
    if (el.matches(SEALED)) return NodeFilter.FILTER_REJECT;
    // Inside a sticker card only the picture counts: the rest is paper folds and shadows
    if (el.classList.contains("sticker")) {
      // ...or the film in it, which says how bright it is
      el.querySelectorAll<HTMLElement>("[data-nav-tone]").forEach((t) => found.push({ el: t, tone: () => t.dataset.navTone as Tone }));
      el.querySelectorAll("img").forEach((img) => !img.closest("[data-nav-tone]") && picture(img));
      return NodeFilter.FILTER_REJECT;
    }
    if (el instanceof HTMLImageElement) {
      picture(el);
      return NodeFilter.FILTER_REJECT;
    }
    if (!big(el)) return NodeFilter.FILTER_SKIP;
    const s = getComputedStyle(el);
    const solid = s.backgroundColor !== "rgba(0, 0, 0, 0)" ? colour(s.backgroundColor) : null;
    if (solid && solid[3] > 0.85) {
      const tone = toneOf(lum(solid[0], solid[1], solid[2]));
      found.push({ el, tone: () => tone });
    }
    return NodeFilter.FILTER_SKIP;
  };
  for (const root of [document.getElementById("main"), document.querySelector("footer")]) {
    if (!root) continue;
    const walk = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT, {
      // Only HTML: an SVG's insides never count
      acceptNode: (n) => (n instanceof HTMLElement ? visit(n) : NodeFilter.FILTER_REJECT),
    });
    if (root.tagName === "FOOTER") visit(root as HTMLElement);
    while (walk.nextNode());
  }
  return found;
}

const inside = (x: number, y: number, b: Box) => x >= b.l && x < b.r && y >= b.t && y < b.b;

/** The pill's area, cut into the dark part and the light part, as clip paths in the pill's own pixels */
function cut(pill: DOMRect, boxes: Box[], page: Tone): Record<Tone, string> {
  const area = { l: pill.left - REACH, t: pill.top - REACH, r: pill.right + REACH, b: pill.bottom + REACH };
  const near = boxes.filter((b) => b.l < area.r && b.r > area.l && b.t < area.b && b.b > area.t);
  const whole = (tone: Tone): Record<Tone, string> => (tone === "dark" ? { dark: "all", light: "" } : { dark: "", light: "all" });
  if (!near.length) return whole(page);
  const lines = (from: number, to: number, at: number[]) => [...new Set([from, to, ...at.filter((v) => v > from && v < to)])].sort((a, b) => a - b);
  const xs = lines(area.l, area.r, near.flatMap((b) => [b.l, b.r]));
  const ys = lines(area.t, area.b, near.flatMap((b) => [b.t, b.b]));
  const path: Record<Tone, string> = { dark: "", light: "" };
  const seen = new Set<Tone>();
  for (let j = 0; j < ys.length - 1; j++) {
    const y0 = ys[j]!;
    const y1 = ys[j + 1]!;
    let start = xs[0]!;
    let tone: Tone | null = null;
    const flush = (end: number) => {
      if (!tone) return;
      seen.add(tone);
      const n = (v: number) => v.toFixed(1);
      path[tone] += `M${n(start - pill.left)} ${n(y0 - pill.top - 0.2)}H${n(end - pill.left)}V${n(y1 - pill.top + 0.2)}H${n(start - pill.left)}Z`;
    };
    for (let i = 0; i < xs.length - 1; i++) {
      const mx = (xs[i]! + xs[i + 1]!) / 2;
      const my = (y0 + y1) / 2;
      let at = page;
      for (const b of near) if (inside(mx, my, b)) at = b.tone;
      if (at !== tone) {
        flush(xs[i]!);
        start = xs[i]!;
        tone = at;
      }
    }
    flush(area.r);
  }
  return seen.size === 1 ? whole([...seen][0]!) : path;
}

export function useNavTone(header: React.RefObject<HTMLElement | null>, pill: React.RefObject<HTMLElement | null>, on: boolean, route: string) {
  useEffect(() => {
    const head = header.current;
    const box = pill.current;
    if (!on || !head || !box) return;
    const skins = { dark: box.querySelector<HTMLElement>('[data-skin="dark"]')!, light: box.querySelector<HTMLElement>('[data-skin="light"]')! };
    const under = new Set<Element>();
    let list: ReturnType<typeof surfaces> = [];
    let io: IntersectionObserver | null = null;
    let frame = 0;
    // The clip paths last drawn: unchanged ones aren't written again, so a scroll that changes nothing costs nothing
    const drawn: Record<Tone, string | null> = { dark: null, light: null };

    const draw = () => {
      frame = 0;
      // Where the pill rests, whatever its entrance is doing
      const h = head.getBoundingClientRect();
      const r = new DOMRect(h.left + box.offsetLeft, h.top + box.offsetTop, box.offsetWidth, box.offsetHeight);
      const page: Tone = document.documentElement.dataset.theme === "light" ? "light" : "dark";
      const boxes: Box[] = [];
      for (const { el, tone } of list) {
        if (!under.has(el)) continue;
        const t = tone();
        if (!t || !el.checkVisibility({ opacityProperty: true, visibilityProperty: true })) continue;
        const b = el.getBoundingClientRect();
        boxes.push({ l: b.left, t: b.top, r: b.right, b: b.bottom, tone: t });
      }
      const paths = cut(r, boxes, page);
      (["dark", "light"] as const).forEach((k) => {
        const p = paths[k];
        if (p === drawn[k]) return;
        drawn[k] = p;
        const s = skins[k];
        // The dark glass is for dark places: light words on it
        s.style.visibility = p ? "visible" : "hidden";
        s.style.clipPath = p && p !== "all" ? `path("${p}")` : "none";
      });
    };
    const queue = () => {
      if (!frame) frame = requestAnimationFrame(draw);
    };

    /** Only what passes under the nav is ever measured */
    const watch = () => {
      io?.disconnect();
      under.clear();
      list = surfaces();
      io = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => (e.isIntersecting ? under.add(e.target) : under.delete(e.target)));
          queue();
        },
        { rootMargin: `0px 0px -${Math.max(0, innerHeight - head.offsetHeight - REACH)}px 0px` },
      );
      list.forEach(({ el }) => io!.observe(el));
      queue();
    };
    let timer = 0;
    const rewatch = () => {
      clearTimeout(timer);
      timer = window.setTimeout(watch, 350);
    };
    watch();
    // Films and pictures arrive later, and pages change
    // Changes inside a film or a live screen (its parts mounting) don't move anything the nav reads
    const mo = new MutationObserver((records) => {
      if (records.some((m) => !(m.target instanceof Element) || !m.target.closest(SEALED))) rewatch();
    });
    const main = document.getElementById("main");
    if (main) mo.observe(main, { childList: true, subtree: true });
    const theme = new MutationObserver(rewatch);
    theme.observe(document.documentElement, { attributeFilter: ["data-theme"] });
    addEventListener("scroll", queue, { passive: true });
    addEventListener("resize", rewatch);
    addEventListener(NAV_TONE, queue);
    document.addEventListener("load", queue, true);
    return () => {
      io?.disconnect();
      mo.disconnect();
      theme.disconnect();
      clearTimeout(timer);
      cancelAnimationFrame(frame);
      removeEventListener("scroll", queue);
      removeEventListener("resize", rewatch);
      removeEventListener(NAV_TONE, queue);
      document.removeEventListener("load", queue, true);
    };
  }, [header, pill, on, route]);
}
