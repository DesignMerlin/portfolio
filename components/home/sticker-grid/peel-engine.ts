/**
 * Peel physics for one sticker. The sticker is peeled from its bottom-left
 * corner C towards a point D:
 * - the fold is the perpendicular bisector of C→D;
 * - the front keeps only the part of the sticker beyond the fold (clip-path);
 * - the flap is the part that came off, mirrored across the fold (a CSS
 *   reflection matrix), so its corner lands exactly on D, with the sticker's
 *   glossy back showing.
 * D moves on a spring towards its target (rest curl, open, or the pointer),
 * so every change can be interrupted mid-flight from any other.
 *
 * Writes straight to the DOM; React only hears about open/closed changes.
 */

export type PeelSettings = {
  /** 0 = still. Multiplies how far the corner flutters */
  wind: number;
  /** Multiplies how fast the breeze moves */
  windSpeed: number;
};

type Els = { root: HTMLElement; front: HTMLElement; flap: HTMLElement };
type Hooks = { isReduced: () => boolean; onToggle: (open: boolean) => void; getSettings: () => PeelSettings };

type V = { x: number; y: number };

const STIFFNESS = 190;
const DAMPING = 21; // a little under critical: the sticker settles with one soft overshoot
const DRAG_THRESHOLD = 5;
const NONE = "polygon(0 0, 0 0, 0 0)";

export class PeelEngine {
  private w = 0;
  private h = 0;
  private d: V = { x: 0, y: 0 };
  private v: V = { x: 0, y: 0 };
  private open = false;
  /** Mouse over the sticker: the corner lifts a little further, as a hint */
  private hovered = false;
  private clock = Math.random() * 10;

  private pointer: { id: number; start: V; startD: V; dragging: boolean; last: V; lastT: number; vel: V } | null = null;
  private visible = false;
  private raf = 0;
  private lastT = 0;
  private ro: ResizeObserver;
  private io: IntersectionObserver;

  constructor(
    private els: Els,
    private hooks: Hooks,
  ) {
    this.ro = new ResizeObserver(() => this.measure());
    this.ro.observe(els.root);
    this.io = new IntersectionObserver(([e]) => {
      this.visible = !!e?.isIntersecting;
      this.wake();
    });
    this.io.observe(els.root);
    els.root.addEventListener("pointerdown", this.onDown);
    els.root.addEventListener("pointermove", this.onMove);
    els.root.addEventListener("pointerup", this.onUp);
    els.root.addEventListener("pointercancel", this.onCancel);
    els.root.addEventListener("pointerenter", this.onEnter);
    els.root.addEventListener("pointerleave", this.onLeave);
    document.addEventListener("visibilitychange", this.wake);
    this.measure();
    this.d = this.restPoint();
    this.paint();
  }

  destroy() {
    cancelAnimationFrame(this.raf);
    this.ro.disconnect();
    this.io.disconnect();
    const r = this.els.root;
    r.removeEventListener("pointerdown", this.onDown);
    r.removeEventListener("pointermove", this.onMove);
    r.removeEventListener("pointerup", this.onUp);
    r.removeEventListener("pointercancel", this.onCancel);
    r.removeEventListener("pointerenter", this.onEnter);
    r.removeEventListener("pointerleave", this.onLeave);
    document.removeEventListener("visibilitychange", this.wake);
  }

  /** Click, tap, Enter or Space */
  toggle(open = !this.open) {
    if (open !== this.open) {
      this.open = open;
      this.hooks.onToggle(open);
    }
    if (this.hooks.isReduced()) {
      this.d = this.target();
      this.v = { x: 0, y: 0 };
      this.paint();
    }
    this.wake();
  }

  // Geometry ----------------------------------------------------------------

  private get corner(): V {
    return { x: 0, y: this.h };
  }

  /** Direction a full peel travels: towards the opposite corner */
  private get openDir(): V {
    const len = Math.hypot(this.w, this.h) || 1;
    return { x: this.w / len, y: -this.h / len };
  }

  /** Far enough that the fold has passed the opposite corner: nothing of the sticker is left on the card */
  private get openReach() {
    return 2 * Math.hypot(this.w, this.h) + 40;
  }

  /** The resting curl, fluttering in the breeze */
  private restPoint(): V {
    const s = this.hooks.getSettings();
    const still = this.hooks.isReduced() || s.wind === 0;
    const t = this.clock * s.windSpeed;
    const gust = still ? 0 : s.wind * (0.6 * Math.sin(t * 1.3) + 0.4 * Math.sin(t * 2.9 + 1.7));
    const sway = still ? 0 : s.wind * Math.sin(t * 0.9 + 0.4);
    const r = (this.hovered ? 0.3 : 0.22) * Math.min(this.w, this.h) * (1 + 0.12 * gust);
    const a = ((48 + 7 * sway) * Math.PI) / 180;
    return { x: r * Math.cos(a), y: this.h - r * Math.sin(a) };
  }

  private target(): V {
    if (!this.open) return this.restPoint();
    const dir = this.openDir;
    return { x: this.corner.x + dir.x * this.openReach, y: this.corner.y + dir.y * this.openReach };
  }

  /** How far the corner has travelled towards the opposite corner, as a share of the diagonal */
  private progress(p: V) {
    const dir = this.openDir;
    return ((p.x - this.corner.x) * dir.x + (p.y - this.corner.y) * dir.y) / (Math.hypot(this.w, this.h) || 1);
  }

  private measure() {
    this.w = this.els.root.clientWidth;
    this.h = this.els.root.clientHeight;
    if (!this.pointer) this.d = this.target();
    this.paint();
  }

  /** Clip the card rectangle to one side of the fold (Sutherland–Hodgman against a single edge) */
  private halfRect(m: V, n: V, keepFar: boolean) {
    const pts: V[] = [
      { x: 0, y: 0 },
      { x: this.w, y: 0 },
      { x: this.w, y: this.h },
      { x: 0, y: this.h },
    ];
    const side = (p: V) => ((p.x - m.x) * n.x + (p.y - m.y) * n.y) * (keepFar ? 1 : -1);
    const out: V[] = [];
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i]!;
      const b = pts[(i + 1) % pts.length]!;
      const sa = side(a);
      const sb = side(b);
      if (sa >= 0) out.push(a);
      if (sa >= 0 !== sb >= 0) {
        const t = sa / (sa - sb);
        out.push({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });
      }
    }
    return out.length < 3 ? NONE : `polygon(${out.map((p) => `${p.x.toFixed(2)}px ${p.y.toFixed(2)}px`).join(",")})`;
  }

  private paint() {
    const { front, flap } = this.els;
    const c = this.corner;
    const vx = this.d.x - c.x;
    const vy = this.d.y - c.y;
    const len = Math.hypot(vx, vy);
    if (len < 0.5 || !this.w) {
      front.style.clipPath = "none";
      flap.style.visibility = "hidden";
      return;
    }
    const n = { x: vx / len, y: vy / len };
    const m = { x: c.x + vx / 2, y: c.y + vy / 2 };
    front.style.clipPath = this.halfRect(m, n, true);

    // Mirror across the fold: x' = (I - 2nnᵀ)x + 2(m·n)n
    const k = 2 * (m.x * n.x + m.y * n.y);
    const a = 1 - 2 * n.x * n.x;
    const b = -2 * n.x * n.y;
    const d = 1 - 2 * n.y * n.y;
    flap.style.visibility = "visible";
    flap.style.clipPath = this.halfRect(m, n, false);
    flap.style.transform = `matrix(${a.toFixed(5)},${b.toFixed(5)},${b.toFixed(5)},${d.toFixed(5)},${(k * n.x).toFixed(2)},${(k * n.y).toFixed(2)})`;

    // The glossy back: shaded where it bends at the fold, brightest across the middle, a cool tint at the tip.
    // Gradient runs from the fold towards the corner, in the flap's own (unmirrored) coordinates.
    const deg = (Math.atan2(-n.x, n.y) * 180) / Math.PI;
    const rad = (deg * Math.PI) / 180;
    const dir = { x: Math.sin(rad), y: -Math.cos(rad) };
    const L = Math.abs(this.w * dir.x) + Math.abs(this.h * dir.y);
    const s0 = (m.x - this.w / 2) * dir.x + (m.y - this.h / 2) * dir.y + L / 2;
    const depth = len / 2;
    const at = (f: number) => `${(s0 + depth * f).toFixed(1)}px`;
    flap.style.backgroundImage = `linear-gradient(${deg.toFixed(2)}deg, transparent ${at(-0.01)}, var(--peel-fold) ${at(0)}, var(--peel-mid) ${at(0.28)}, var(--peel-hi) ${at(0.62)}, var(--peel-tip) ${at(1)})`;
  }

  // Loop ----------------------------------------------------------------------

  private wake = () => {
    if (this.raf || !this.visible || document.hidden) return;
    this.lastT = performance.now();
    this.raf = requestAnimationFrame(this.tick);
  };

  private tick = (now: number) => {
    this.raf = 0;
    const dt = Math.min(now - this.lastT, 40) / 1000;
    this.lastT = now;
    this.clock += dt;
    const reduce = this.hooks.isReduced();

    if (!this.pointer?.dragging) {
      const t = this.target();
      if (reduce) {
        this.d = t;
        this.v = { x: 0, y: 0 };
      } else {
        // Semi-implicit Euler in small steps keeps the spring stable at any frame rate
        const steps = Math.ceil(dt / (1 / 240));
        const h = dt / steps;
        for (let i = 0; i < steps; i++) {
          this.v.x += (-STIFFNESS * (this.d.x - t.x) - DAMPING * this.v.x) * h;
          this.v.y += (-STIFFNESS * (this.d.y - t.y) - DAMPING * this.v.y) * h;
          this.d.x += this.v.x * h;
          this.d.y += this.v.y * h;
        }
      }
    }
    this.paint();

    const t = this.target();
    const settled = Math.hypot(this.d.x - t.x, this.d.y - t.y) < 0.3 && Math.hypot(this.v.x, this.v.y) < 2;
    const breezy = !this.open && !reduce && this.hooks.getSettings().wind > 0;
    if (this.visible && !document.hidden && (this.pointer || !settled || breezy)) this.raf = requestAnimationFrame(this.tick);
  };

  // Input ---------------------------------------------------------------------

  private local(e: PointerEvent): V {
    const r = this.els.root.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }

  private onDown = (e: PointerEvent) => {
    if (e.button !== 0 || (e.target as HTMLElement).closest("a, [data-no-peel]")) return;
    const p = this.local(e);
    this.pointer = { id: e.pointerId, start: p, startD: { ...this.d }, dragging: false, last: p, lastT: e.timeStamp, vel: { x: 0, y: 0 } };
    this.els.root.dataset.pressed = "true";
    this.wake();
  };

  private onMove = (e: PointerEvent) => {
    const ptr = this.pointer;
    if (!ptr || ptr.id !== e.pointerId) return;
    const p = this.local(e);
    if (!ptr.dragging) {
      if (Math.hypot(p.x - ptr.start.x, p.y - ptr.start.y) < DRAG_THRESHOLD) return;
      ptr.dragging = true;
      this.els.root.setPointerCapture(e.pointerId);
      this.els.root.dataset.dragging = "true";
    }
    // The peel follows the pointer one-to-one, from wherever it was when you grabbed it
    this.d = { x: ptr.startD.x + p.x - ptr.start.x, y: ptr.startD.y + p.y - ptr.start.y };
    // Never peel "backwards" past the corner
    this.d.x = Math.max(this.d.x, this.corner.x);
    this.d.y = Math.min(this.d.y, this.corner.y);
    const dt = Math.max((e.timeStamp - ptr.lastT) / 1000, 1 / 240);
    ptr.vel = { x: (p.x - ptr.last.x) / dt, y: (p.y - ptr.last.y) / dt };
    ptr.last = p;
    ptr.lastT = e.timeStamp;
  };

  private onUp = (e: PointerEvent) => {
    const ptr = this.pointer;
    if (!ptr || ptr.id !== e.pointerId) return;
    this.release();
    if (!ptr.dragging) {
      this.toggle();
      return;
    }
    // Decide by how far it's peeled and which way it was thrown
    const dir = this.openDir;
    const throwV = ptr.vel.x * dir.x + ptr.vel.y * dir.y;
    const p = this.progress(this.d);
    const open = throwV > 700 ? true : throwV < -700 ? false : p > 0.42;
    this.v = this.hooks.isReduced() ? { x: 0, y: 0 } : { ...ptr.vel };
    this.toggle(open);
  };

  private onEnter = (e: PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    this.hovered = true;
    this.wake();
  };

  private onLeave = (e: PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    this.hovered = false;
    this.wake();
  };

  private onCancel = () => {
    if (!this.pointer) return;
    this.release();
    this.wake();
  };

  private release() {
    if (this.pointer && this.els.root.hasPointerCapture(this.pointer.id)) this.els.root.releasePointerCapture(this.pointer.id);
    this.pointer = null;
    delete this.els.root.dataset.pressed;
    delete this.els.root.dataset.dragging;
  }
}
