/**
 * Only the film you're looking at plays.
 *
 * Every film on a page (home cards, the Projects list, More work) asks to play when it's on screen. A film
 * is ~100 animations over large screenshots, so several at once is more than a phone (or a laptop's
 * integrated graphics) can draw: the motion hangs. It also breaks a rule of the site: two loud things
 * never compete. So films go through this conductor, which lets the most visible one play (two side by
 * side on wide screens, where a row holds two cards), and the rest hold their poster frame until scrolled to.
 */
import { onScrollHold, scrollHeld } from "@/components/ui/scroll-hold";

type Entry = { el: HTMLElement; ratio: number; wants: boolean; on: boolean; set: (on: boolean) => void };

const entries = new Set<Entry>();
let queued = 0;

/** How many may play at once: one on phones and tablets, two on wide screens */
const limit = () => (innerWidth >= 1024 ? 2 : 1);

function pick() {
  queued = 0;
  const mid = innerHeight / 2;
  const off = (e: Entry) => {
    const r = e.el.getBoundingClientRect();
    return Math.abs(r.top + r.height / 2 - mid);
  };
  // A phone mid-scroll: no film plays, so there's nothing to measure
  const ranked = [...entries]
    .filter((e) => e.wants && e.ratio > 0 && !scrollHeld())
    .map((e) => ({ e, d: off(e) }))
    // Most of it on screen first; between equally visible ones, the one nearest the middle
    .sort((a, b) => b.e.ratio - a.e.ratio || a.d - b.d);
  // A phone mid-scroll: everything holds its frame until the page is at rest (scroll-hold.ts)
  const chosen = new Set(ranked.slice(0, limit()).map((x) => x.e));
  for (const e of entries) {
    const on = chosen.has(e);
    if (on !== e.on) {
      e.on = on;
      e.set(on);
    }
  }
}

const queue = () => {
  if (!queued) queued = requestAnimationFrame(pick);
};

let listening = false;
let unhold = () => {};
function listen(on: boolean) {
  if (on === listening) return;
  listening = on;
  // Scrolling changes which visible film is nearest the middle without crossing any threshold
  if (on) {
    addEventListener("scroll", queue, { passive: true });
    addEventListener("resize", queue);
    unhold = onScrollHold(queue);
  } else {
    removeEventListener("scroll", queue);
    removeEventListener("resize", queue);
    unhold();
  }
}

/** Join the conductor. `set(true)` means "you may play". Returns how to report changes and to leave. */
export function conduct(el: HTMLElement, set: (on: boolean) => void) {
  const entry: Entry = { el, ratio: 0, wants: false, on: false, set };
  entries.add(entry);
  listen(true);
  const io = new IntersectionObserver(
    ([e]) => {
      entry.ratio = e?.isIntersecting ? e.intersectionRatio : 0;
      queue();
    },
    { threshold: [0, 0.25, 0.5, 0.75, 1] },
  );
  io.observe(el);
  return {
    /** Whether it would play if allowed (not paused, covered or reduced) */
    want(w: boolean) {
      if (w === entry.wants) return;
      entry.wants = w;
      queue();
    },
    leave() {
      io.disconnect();
      entries.delete(entry);
      if (!entries.size) listen(false);
      queue();
    },
  };
}
