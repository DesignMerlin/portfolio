import type { RopeCarouselSettings } from "@/components/home/rope-carousel/settings";

// Pendulum tuning (same model as the old hanging cards: θ'' = -ω²θ - 2ζωθ' + k·a)
const PERIOD = 1.2; // seconds per full swing
const DAMPING = 0.11;
const GAIN = 0.014; // degrees per px/s² of rope acceleration, scaled by ω
const MAX_SWAY = 14;
/** How quickly a fling bleeds off into the autoplay speed, seconds */
const COAST = 0.2;
/** How quickly autoplay picks back up from a standstill: fast enough to feel immediate, without a jump */
const RESUME = 0.08;
const MAX_FLING = 3200; // px/s
/** Each card's own resting lean, as a share of settings.tilt */
const LEAN = [-1, 0.55, -0.3, 0.85, -0.65, 0.25, 0.7];

type Hooks = {
  getSettings: () => RopeCarouselSettings;
  isReduced: () => boolean;
  isPlaying: () => boolean;
  /** Tells React the stage width and card pitch, so it can render enough copies to fill the rope */
  onLayout: (width: number, pitch: number) => void;
};

/**
 * Runs the rope carousel: one animation loop that moves every card along
 * the rope, tilts it with the rope's slope, and swings it like a pendulum
 * when the flow speeds up or slows down. Writes transforms straight to the
 * DOM (no React renders per frame) and sleeps while off screen.
 *
 * The flow has one velocity. Autoplay, drag, fling momentum, wheel and
 * arrow-key steps all act on it or on the offset, so any of them can take
 * over from any other mid-flight without a jump.
 */
export class RopeEngine {
  private cards: HTMLElement[] = [];
  private theta = new Float64Array(0);
  private omega = new Float64Array(0);
  private width = 0;
  private cardW = 0;
  private pitch = 1;

  private offset = 0;
  private vel = 0;
  private lastOffset = 0;
  private flowV = 0;
  private seek: number | null = null;

  private dragging = false;
  private dragX = 0;
  private samples: { x: number; t: number }[] = [];
  private hovered = false;
  /** Set by a drag: the mouse is still over the rope, but the visitor is done with it, so autoplay carries on */
  private released = false;
  private focused = false;

  private visible = false;
  private raf = 0;
  private last = 0;
  private ro: ResizeObserver;
  private io: IntersectionObserver;

  constructor(
    private stage: HTMLElement,
    private rope: SVGPathElement[],
    private hooks: Hooks,
  ) {
    this.ro = new ResizeObserver(() => this.measure());
    this.ro.observe(stage);
    this.io = new IntersectionObserver(([e]) => {
      this.visible = !!e?.isIntersecting;
      if (this.visible) this.start();
    });
    this.io.observe(stage);

    stage.addEventListener("pointerdown", this.onDown);
    stage.addEventListener("pointermove", this.onMove);
    stage.addEventListener("pointerup", this.onUp);
    stage.addEventListener("pointercancel", this.onUp);
    stage.addEventListener("pointerenter", this.onEnter);
    stage.addEventListener("pointerleave", this.onLeave);
    stage.addEventListener("wheel", this.onWheel, { passive: false });
    document.addEventListener("visibilitychange", this.onVisibility);
  }

  setCards(cards: HTMLElement[]) {
    this.cards = cards;
    this.theta = new Float64Array(cards.length);
    this.omega = new Float64Array(cards.length);
    if (cards[0]) this.ro.observe(cards[0]);
    this.measure();
  }

  /** Settings or play state changed: make sure the loop is running to react */
  wake() {
    this.measure();
    this.start();
  }

  setFocused(v: boolean) {
    this.focused = v;
    this.start();
  }

  /** Arrow keys and the prev/next buttons: move exactly one card, snapped to the grid */
  step(dir: 1 | -1) {
    const from = this.seek ?? this.offset;
    const target = Math.round(from / this.pitch) * this.pitch - dir * this.pitch;
    this.vel = 0;
    if (this.hooks.isReduced()) {
      this.offset = this.lastOffset = target;
      this.seek = null;
      this.render(0);
    } else {
      this.seek = target;
    }
    this.start();
  }

  destroy() {
    cancelAnimationFrame(this.raf);
    this.ro.disconnect();
    this.io.disconnect();
    const s = this.stage;
    s.removeEventListener("pointerdown", this.onDown);
    s.removeEventListener("pointermove", this.onMove);
    s.removeEventListener("pointerup", this.onUp);
    s.removeEventListener("pointercancel", this.onUp);
    s.removeEventListener("pointerenter", this.onEnter);
    s.removeEventListener("pointerleave", this.onLeave);
    s.removeEventListener("wheel", this.onWheel);
    document.removeEventListener("visibilitychange", this.onVisibility);
  }

  // Rope shape --------------------------------------------------------------

  /** Height of the rope at x: two half-parabolas meeting at the lowest point, so the dip can lean left or right */
  private ropeY(x: number) {
    const s = this.hooks.getSettings();
    const low = this.width * s.curve;
    const depth = this.width * s.sag;
    const u = x <= low ? (low - x) / Math.max(low, 1) : (x - low) / Math.max(this.width - low, 1);
    return s.top + depth * (1 - u * u);
  }

  private ropeSlope(x: number) {
    return (this.ropeY(x + 1) - this.ropeY(x - 1)) / 2;
  }

  private drawRope() {
    const pts: string[] = [];
    const from = -40;
    const to = this.width + 40;
    for (let i = 0; i <= 64; i++) {
      const x = from + ((to - from) * i) / 64;
      pts.push(`${x.toFixed(1)},${this.ropeY(x).toFixed(1)}`);
    }
    const d = `M${pts.join("L")}`;
    for (const p of this.rope) p.setAttribute("d", d);
  }

  private measure() {
    this.width = this.stage.clientWidth;
    this.cardW = this.cards[0]?.offsetWidth ?? 0;
    this.pitch = Math.max(1, this.cardW + this.hooks.getSettings().gap);
    this.drawRope();
    this.hooks.onLayout(this.width, this.pitch);
    this.render(0);
  }

  // Loop ----------------------------------------------------------------------

  private start() {
    if (this.raf || !this.visible || document.hidden) return;
    this.last = performance.now();
    this.raf = requestAnimationFrame(this.tick);
  }

  private tick = (now: number) => {
    this.raf = 0;
    const dt = Math.min(now - this.last, 40) / 1000;
    this.last = now;
    if (dt > 0) this.render(dt);
    if (this.visible && !document.hidden && !this.isAtRest()) this.raf = requestAnimationFrame(this.tick);
  };

  /** Nothing will change until input arrives: let the loop sleep */
  private isAtRest() {
    if (this.dragging || this.seek !== null || Math.abs(this.vel) > 0.5) return false;
    if (this.targetVelocity() !== 0) return false;
    for (let i = 0; i < this.theta.length; i++) {
      if (Math.abs(this.theta[i]!) > 0.02 || Math.abs(this.omega[i]!) > 0.02) return false;
    }
    return true;
  }

  private targetVelocity() {
    const s = this.hooks.getSettings();
    if (!this.hooks.isPlaying() || this.hooks.isReduced() || this.focused) return 0;
    if (s.pauseOnHover && this.hovered && !this.released) return 0;
    return s.speed * (s.direction === "left" ? -1 : 1);
  }

  private render(dt: number) {
    const s = this.hooks.getSettings();
    const reduce = this.hooks.isReduced();

    if (dt > 0 && !this.dragging) {
      if (this.seek !== null) {
        this.offset += (this.seek - this.offset) * (1 - Math.exp(-dt / 0.11));
        if (Math.abs(this.seek - this.offset) < 0.4) {
          this.offset = this.seek;
          this.seek = null;
        }
      } else {
        const target = this.targetVelocity();
        // Faster than autoplay (a fling) coasts down; slower (stopped, paused) catches up almost at once
        const tau = Math.abs(this.vel) > Math.abs(target) ? COAST : RESUME;
        this.vel += (target - this.vel) * (1 - Math.exp(-dt / tau));
        this.offset += this.vel * dt;
      }
    }

    // Sway comes from how the flow actually moved this frame, whatever moved it
    let accel = 0;
    if (dt > 0) {
      const before = this.flowV;
      const raw = (this.offset - this.lastOffset) / dt;
      this.flowV += (raw - this.flowV) * (1 - Math.exp(-dt / 0.05));
      accel = (this.flowV - before) / dt;
    }
    this.lastOffset = this.offset;

    const n = this.cards.length;
    if (!n || !this.width) return;
    const loop = n * this.pitch;
    const w = (2 * Math.PI) / PERIOD;

    for (let i = 0; i < n; i++) {
      if (!reduce && dt > 0) {
        const wi = w * (1 + ((i % 3) - 1) * 0.08);
        const z = DAMPING + (i % 2) * 0.03;
        this.omega[i]! += (-wi * wi * this.theta[i]! - 2 * z * wi * this.omega[i]! + GAIN * wi * accel) * dt;
        this.theta[i] = Math.max(-MAX_SWAY, Math.min(MAX_SWAY, this.theta[i]! + this.omega[i]! * dt));
      } else if (reduce) {
        this.theta[i] = this.omega[i] = 0;
      }

      // Cards occupy [-pitch/2, loop - pitch/2]; the loop is always wider than the stage plus a card each side
      const p = (((i * this.pitch + this.offset) % loop) + loop) % loop;
      const cx = p - this.pitch / 2;
      const y = this.ropeY(cx);
      const slope = (Math.atan(this.ropeSlope(cx)) * 180) / Math.PI;
      const rot = slope * s.follow + LEAN[i % LEAN.length]! * s.tilt + this.theta[i]!;
      this.cards[i]!.style.transform =
        `translate3d(${(cx - this.cardW / 2).toFixed(2)}px,${y.toFixed(2)}px,0) rotate(${rot.toFixed(3)}deg)`;
    }
  }

  // Input ---------------------------------------------------------------------

  private onDown = (e: PointerEvent) => {
    if (e.button !== 0 || (e.target as HTMLElement).closest("button,a")) return;
    this.dragging = true;
    this.seek = null;
    this.vel = 0;
    this.dragX = e.clientX;
    this.samples = [{ x: e.clientX, t: e.timeStamp }];
    this.stage.setPointerCapture(e.pointerId);
    this.stage.dataset.dragging = "true";
    this.start();
  };

  private onMove = (e: PointerEvent) => {
    if (!this.dragging) return;
    this.offset += e.clientX - this.dragX;
    this.dragX = e.clientX;
    this.samples.push({ x: e.clientX, t: e.timeStamp });
    if (this.samples.length > 6) this.samples.shift();
  };

  private onUp = (e: PointerEvent) => {
    if (!this.dragging) return;
    this.dragging = false;
    this.released = true;
    delete this.stage.dataset.dragging;
    if (this.stage.hasPointerCapture(e.pointerId)) this.stage.releasePointerCapture(e.pointerId);
    // Fling: velocity over the last ~100ms of the drag, then it coasts back to the autoplay speed
    const recent = this.samples.filter((p) => e.timeStamp - p.t < 100);
    const a = recent[0];
    const b = recent[recent.length - 1];
    const v = a && b && b.t > a.t ? ((b.x - a.x) / (b.t - a.t)) * 1000 : 0;
    this.vel = this.hooks.isReduced() ? 0 : Math.max(-MAX_FLING, Math.min(MAX_FLING, v));
    this.start();
  };

  private onEnter = (e: PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    this.hovered = true;
    this.released = false;
  };

  private onLeave = (e: PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    this.hovered = false;
    this.released = false;
    this.start();
  };

  /**
   * Horizontal wheel/trackpad scrolls the rope and is kept from the page.
   * Vertical wheel still scrolls the page, and nudges the rope along with it,
   * so the section never traps the reader mid-page.
   */
  private onWheel = (e: WheelEvent) => {
    const scale = e.deltaMode === 1 ? 16 : 1;
    if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
      e.preventDefault();
      this.offset -= e.deltaX * scale;
    } else {
      this.offset -= e.deltaY * scale * 0.35;
    }
    this.seek = null;
    this.vel = 0;
    this.start();
  };

  private onVisibility = () => this.start();
}
