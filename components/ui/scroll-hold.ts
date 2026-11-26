/**
 * Motion holds still while a phone is scrolling.
 *
 * On a touch screen the page is moving under the finger, and that's the moment a phone has the least to
 * spare: drawing a film's hundred animations or a screen's moving parts on top of the scroll is what makes
 * it hang. So while a touch device scrolls, films and live screens pause where they are, and carry on
 * from that frame the moment the page comes to rest. With a mouse or trackpad nothing changes.
 */
type Listener = (held: boolean) => void;

const listeners = new Set<Listener>();
let held = false;
let timer = 0;
let listening = false;
/** Quiet time after the last scroll event that counts as "at rest" */
const REST = 180;

const touchy = () => matchMedia("(pointer: coarse)").matches;

function set(next: boolean) {
  if (next === held) return;
  held = next;
  // CSS animations (the marquee, the whole-page columns) hold too: html[data-scroll-held] in globals.css
  document.documentElement.toggleAttribute("data-scroll-held", held);
  listeners.forEach((l) => l(held));
}

function onScroll() {
  clearTimeout(timer);
  timer = window.setTimeout(() => set(false), REST);
  set(true);
}

function listen(on: boolean) {
  if (on === listening) return;
  listening = on;
  if (on) addEventListener("scroll", onScroll, { passive: true });
  else {
    removeEventListener("scroll", onScroll);
    clearTimeout(timer);
    held = false;
    document.documentElement.removeAttribute("data-scroll-held");
  }
}

/** Whether motion is holding for a scroll right now */
export const scrollHeld = () => held;

/** Hear when a touch scroll starts (true) and when the page is at rest again (false). Returns how to stop */
export function onScrollHold(l: Listener) {
  if (typeof window === "undefined" || !touchy()) return () => {};
  listeners.add(l);
  listen(true);
  return () => {
    listeners.delete(l);
    if (!listeners.size) listen(false);
  };
}
