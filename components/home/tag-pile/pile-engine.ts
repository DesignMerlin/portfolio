import type MatterNS from "matter-js";
import type { PileSettings } from "@/components/home/tag-pile/settings";

type Matter = typeof MatterNS;
type Body = MatterNS.Body;

const STEP = 1000 / 60;
const PUSH_RADIUS = 110;

type Options = {
  getSettings: () => PileSettings;
  isReduced: () => boolean;
  isActive: () => boolean;
  onActivate: (index: number) => void;
};

/**
 * The tag pile's physics, kept out of React: a matter-js world with walls,
 * one rounded rigid body per tag, a fixed-step loop that writes transforms
 * straight to the tag elements, grab/throw via a spring constraint, cursor
 * push, squash on hard landings and pop on click.
 */
export class PileEngine {
  private M: Matter;
  private engine: MatterNS.Engine;
  private area: HTMLElement;
  private els: (HTMLElement | null)[];
  private opts: Options;
  private bodies: Body[] = [];
  private walls: Body[] = [];
  private sizes: { w: number; h: number }[] = [];
  private timers: ReturnType<typeof setTimeout>[] = [];
  /** Tags still waiting to enter */
  private pending = 0;
  /** False while the pile's layout is hidden and the tags couldn't be measured */
  private measured = true;
  private lastSquash: number[] = [];
  private drag: {
    index: number;
    constraint: MatterNS.Constraint;
    moved: number;
    startT: number;
    vx: number;
    vy: number;
    lx: number;
    ly: number;
    lt: number;
  } | null = null;
  private raf = 0;
  private visible = true;
  private seen = false;
  private io: IntersectionObserver;
  private ro: ResizeObserver;

  constructor(M: Matter, area: HTMLElement, els: (HTMLElement | null)[], opts: Options) {
    this.M = M;
    this.area = area;
    this.els = els;
    this.opts = opts;
    this.engine = M.Engine.create({ enableSleeping: true });
    this.engine.gravity.y = opts.getSettings().gravity;

    this.buildWalls();
    this.buildBodies(false);
    this.drop();

    M.Events.on(this.engine, "collisionStart", this.onCollide);
    this.raf = requestAnimationFrame(this.loop);

    // Pause off screen; replay on revisit
    this.io = new IntersectionObserver(([entry]) => {
      if (!entry) return;
      const was = this.visible;
      this.visible = entry.isIntersecting;
      if (!was && this.visible && this.seen && this.opts.getSettings().replayOnRevisit) this.drop();
      if (this.visible) this.seen = true;
    });
    this.io.observe(area);
    this.ro = new ResizeObserver(() => {
      this.buildWalls();
      // Shown for the first time (e.g. the window crossed a breakpoint): measure and drop in properly
      if (!this.measured && this.area.offsetWidth) {
        this.buildBodies(false);
        this.drop();
        return;
      }
      this.keepInside();
    });
    this.ro.observe(area);

    addEventListener("pointermove", this.onMove, { passive: true });
    addEventListener("pointerup", this.release);
    addEventListener("pointercancel", this.release);
  }

  destroy() {
    cancelAnimationFrame(this.raf);
    this.timers.forEach(clearTimeout);
    this.io.disconnect();
    this.ro.disconnect();
    removeEventListener("pointermove", this.onMove);
    removeEventListener("pointerup", this.release);
    removeEventListener("pointercancel", this.release);
    this.M.Events.off(this.engine, "collisionStart", this.onCollide);
    this.M.Engine.clear(this.engine);
  }

  /** Apply gravity, bounce and friction to the live world */
  setPhysics(s: PileSettings) {
    this.engine.gravity.y = s.gravity;
    for (const b of this.bodies) {
      b.restitution = s.bounce;
      b.friction = s.friction;
      this.M.Sleeping.set(b, false);
    }
  }

  /* ---------------------------------------------------------------- */

  private lastT = 0;
  private acc = 0;

  /** Fixed-step physics on real time: a slow frame runs extra steps (capped), so the world never runs in slow motion */
  private loop = (t: number) => {
    const dt = this.lastT ? Math.min(100, t - this.lastT) : STEP;
    this.lastT = t;
    if (this.visible && this.opts.isActive()) {
      this.acc += dt;
      let steps = 0;
      while (this.acc >= STEP && steps < 4) {
        this.M.Engine.update(this.engine, STEP);
        this.acc -= STEP;
        steps++;
      }
      if (steps === 4) this.acc = 0;
      if (steps) this.render();
    } else {
      this.acc = 0;
    }
    this.raf = requestAnimationFrame(this.loop);
  };

  private size() {
    const r = this.area.getBoundingClientRect();
    return { W: r.width || 800, H: r.height || 400 };
  }

  private buildWalls() {
    const { M, engine } = this;
    const { W, H } = this.size();
    if (this.walls.length) M.Composite.remove(engine.world, this.walls);
    const t = 400;
    this.walls = [
      M.Bodies.rectangle(W / 2, H + t / 2, W * 3, t, { isStatic: true }),
      M.Bodies.rectangle(-t / 2, H / 2 - 2000, t, H + 4000, { isStatic: true }),
      M.Bodies.rectangle(W + t / 2, H / 2 - 2000, t, H + 4000, { isStatic: true }),
    ];
    M.Composite.add(engine.world, this.walls);
  }

  /** (Re)create the tag bodies from the elements' current size; keep = stay where they are */
  buildBodies(keep: boolean) {
    const { M, engine } = this;
    const st = this.opts.getSettings();
    const old = this.bodies;
    const inWorld = old.map((b) => engine.world.bodies.includes(b));
    if (old.length) M.Composite.remove(engine.world, old);
    // Hidden layouts (display: none) measure 0; use a sensible size until they're shown
    this.sizes = this.els.map((el) => ({ w: el?.offsetWidth || 140, h: el?.offsetHeight || 40 }));
    this.measured = this.els.every((el) => !!el?.offsetWidth);
    this.bodies = this.sizes.map(({ w, h }, i) => {
      const prev = old[i];
      return M.Bodies.rectangle(prev?.position.x ?? 0, prev?.position.y ?? -200, w, h, {
        chamfer: { radius: Math.max(2, h / 2 - 1) },
        restitution: st.bounce,
        friction: st.friction,
        frictionAir: 0.012,
        density: 0.0016,
        angle: prev?.angle ?? 0,
      });
    });
    if (keep && this.pending > 0) {
      // Mid-entrance: the queued drops hold the old bodies, so start the entrance again
      this.drop();
    } else if (keep) {
      M.Composite.add(
        engine.world,
        this.bodies.filter((_, i) => inWorld[i]),
      );
      this.render();
    }
  }

  private keepInside() {
    const { W, H } = this.size();
    for (const b of this.bodies) {
      const x = Math.min(W - 20, Math.max(20, b.position.x));
      const y = Math.min(H - 20, b.position.y);
      if (x !== b.position.x || y !== b.position.y) this.M.Body.setPosition(b, { x, y });
      this.M.Sleeping.set(b, false);
    }
  }

  /** Drop every tag in again, using the chosen entrance */
  drop() {
    const { M, engine } = this;
    const st = this.opts.getSettings();
    this.timers.forEach(clearTimeout);
    this.timers = [];
    this.pending = 0;
    this.release();
    M.Composite.remove(engine.world, this.bodies);
    const { W, H } = this.size();
    const n = this.bodies.length;

    const place = (b: Body, i: number, height: number) => {
      const { w } = this.sizes[i]!;
      const span = Math.max(1, W - w - 24);
      const x =
        st.entrance === "sequence" ? w / 2 + 12 + (i * span) / Math.max(1, n - 1) : w / 2 + 12 + Math.random() * span;
      M.Body.setPosition(b, { x, y: height });
      M.Body.setAngle(b, (Math.random() - 0.5) * 0.9);
      M.Body.setVelocity(b, { x: (Math.random() - 0.5) * 3, y: 0 });
      M.Body.setAngularVelocity(b, (Math.random() - 0.5) * 0.08);
      M.Sleeping.set(b, false);
    };

    this.els.forEach((el) => el && (el.style.opacity = "0"));

    if (this.opts.isReduced()) {
      // Settle the pile ahead of time, so it simply appears in place
      this.bodies.forEach((b, i) => place(b, i, H - 60 - i * 30));
      M.Composite.add(engine.world, this.bodies);
      for (let k = 0; k < 600; k++) M.Engine.update(engine, STEP);
      this.els.forEach((el) => el && (el.style.opacity = "1"));
      this.render();
      return;
    }

    this.bodies.forEach((b, i) => {
      const delay = st.entrance === "together" ? 0 : st.entrance === "sequence" ? i * 110 : Math.random() * 1400;
      const height = st.entrance === "together" ? -40 - Math.random() * 260 : -60 - Math.random() * 40;
      const enter = () => {
        this.pending = Math.max(0, this.pending - 1);
        place(b, i, height);
        M.Composite.add(engine.world, b);
        const el = this.els[i];
        if (el) el.style.opacity = "1";
      };
      if (delay === 0) enter();
      else {
        this.pending++;
        this.timers.push(setTimeout(enter, delay));
      }
    });
  }

  private render() {
    this.bodies.forEach((b, i) => {
      const el = this.els[i];
      const sz = this.sizes[i];
      if (!el || !sz) return;
      el.style.transform = `translate3d(${b.position.x - sz.w / 2}px, ${b.position.y - sz.h / 2}px, 0) rotate(${b.angle}rad)`;
    });
  }

  /* ---------------------------------------------------------------- */
  /* Feel                                                               */
  /* ---------------------------------------------------------------- */

  private onCollide = (e: MatterNS.IEventCollision<MatterNS.Engine>) => {
    const st = this.opts.getSettings();
    if (this.opts.isReduced() || !st.squash) return;
    const now = performance.now();
    for (const pair of e.pairs) {
      for (const b of [pair.bodyA, pair.bodyB]) {
        const i = this.bodies.indexOf(b);
        if (i < 0) continue;
        const speed = Math.hypot(b.velocity.x, b.velocity.y);
        if (speed < 5 || now - (this.lastSquash[i] ?? 0) < 220) continue;
        this.lastSquash[i] = now;
        this.squash(i, Math.min(1, speed / 18));
      }
    }
  };

  private inner(i: number) {
    return this.els[i]?.firstElementChild as HTMLElement | null;
  }

  private squash(i: number, amount: number) {
    const a = 0.08 + amount * 0.14;
    this.inner(i)?.animate(
      [
        { transform: "scale(1, 1)" },
        { transform: `scale(${1 + a}, ${1 - a})` },
        { transform: `scale(${1 - a * 0.4}, ${1 + a * 0.4})` },
        { transform: "scale(1, 1)" },
      ],
      { duration: 420, easing: "cubic-bezier(0.23, 1, 0.32, 1)" },
    );
  }

  pop(i: number) {
    const el = this.inner(i);
    if (!el) return;
    if (this.opts.isReduced()) {
      el.animate([{ opacity: 1 }, { opacity: 0.6 }, { opacity: 1 }], { duration: 240 });
      return;
    }
    el.animate(
      [{ transform: "scale(1)" }, { transform: "scale(1.2)" }, { transform: "scale(0.94)" }, { transform: "scale(1)" }],
      { duration: 420, easing: "cubic-bezier(0.32, 0.72, 0, 1)" },
    );
  }

  /* ---------------------------------------------------------------- */
  /* Pointer: push, grab, throw                                         */
  /* ---------------------------------------------------------------- */

  private onMove = (e: PointerEvent) => {
    const box = this.area.getBoundingClientRect();
    const x = e.clientX - box.left;
    const y = e.clientY - box.top;
    const d = this.drag;
    if (d) {
      const now = performance.now();
      const dt = Math.max(1, now - d.lt);
      // Smoothed pointer velocity, px per ms
      d.vx = d.vx * 0.6 + ((x - d.lx) / dt) * 0.4;
      d.vy = d.vy * 0.6 + ((y - d.ly) / dt) * 0.4;
      d.moved += Math.hypot(x - d.lx, y - d.ly);
      d.lx = x;
      d.ly = y;
      d.lt = now;
      d.constraint.pointA = { x, y };
      return;
    }
    if (this.opts.isReduced() || !this.opts.isActive() || e.pointerType !== "mouse") return;
    if (x < 0 || y < 0 || x > box.width || y > box.height) return;
    const mx = e.movementX;
    const my = e.movementY;
    if (!mx && !my) return;
    for (const b of this.bodies) {
      const dist = Math.hypot(b.position.x - x, b.position.y - y);
      if (dist > PUSH_RADIUS) continue;
      const k = (1 - dist / PUSH_RADIUS) * 0.0009 * b.mass;
      this.M.Sleeping.set(b, false);
      this.M.Body.applyForce(b, b.position, { x: mx * k, y: my * k });
    }
  };

  /** Start dragging tag i from a pointer position. Returns false if it can't be grabbed. */
  grab(i: number, clientX: number, clientY: number) {
    const b = this.bodies[i];
    if (!b || this.drag || !this.engine.world.bodies.includes(b)) return false; // ignore a second finger
    const box = this.area.getBoundingClientRect();
    const x = clientX - box.left;
    const y = clientY - box.top;
    const constraint = this.M.Constraint.create({
      pointA: { x, y },
      bodyB: b,
      pointB: { x: x - b.position.x, y: y - b.position.y },
      stiffness: 0.25,
      damping: 0.08,
      length: 0,
    });
    this.M.Composite.add(this.engine.world, constraint);
    this.M.Sleeping.set(b, false);
    const now = performance.now();
    this.drag = { index: i, constraint, moved: 0, startT: now, vx: 0, vy: 0, lx: x, ly: y, lt: now };
    this.els[i]?.setAttribute("data-dragging", "true");
    return true;
  }

  release = () => {
    const d = this.drag;
    if (!d) return;
    this.M.Composite.remove(this.engine.world, d.constraint);
    this.drag = null;
    this.els[d.index]?.removeAttribute("data-dragging");
    const b = this.bodies[d.index];
    if (!b) return;
    if (d.moved < 6 && performance.now() - d.startT < 350) {
      this.opts.onActivate(d.index);
      return;
    }
    // Throw: pointer speed (px/ms) to body speed (px/step), scaled by throw strength
    const k = STEP * this.opts.getSettings().throwStrength;
    const cap = 70;
    this.M.Body.setVelocity(b, {
      x: Math.max(-cap, Math.min(cap, d.vx * k)),
      y: Math.max(-cap, Math.min(cap, d.vy * k)),
    });
  };

  /** Keyboard alternative to throwing */
  nudge(i: number, key: string) {
    const b = this.bodies[i];
    const v = { ArrowLeft: { x: -9, y: -4 }, ArrowRight: { x: 9, y: -4 }, ArrowUp: { x: 0, y: -16 }, ArrowDown: { x: 0, y: 6 } }[
      key
    ];
    if (!b || !v) return false;
    this.M.Sleeping.set(b, false);
    this.M.Body.setVelocity(b, v);
    this.M.Body.setAngularVelocity(b, (Math.random() - 0.5) * 0.2);
    return true;
  }
}
