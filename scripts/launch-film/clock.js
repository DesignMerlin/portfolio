// A clock the recorder controls. Injected before any of the site's scripts, it takes over every way the
// site keeps time (performance.now, Date.now, requestAnimationFrame, timers, Web Animations, CSS animations
// and transitions, and video) and advances all of them together, one frame at a time, when the recorder
// calls window.__step(ms). So physics, springs, films and transitions are captured at exactly 30 frames a
// second however long each screenshot takes. Scroll-linked animations stay native: the recorder scrolls.
(() => {
  // The real timer, kept for the recorder's own waiting before the site's is replaced
  const realTimeout = window.setTimeout.bind(window);
  let vt = 0;
  const epoch = Date.now();
  let raf = [];
  let rafId = 1;
  const timers = new Map();
  let timerId = 1;

  performance.now = () => vt;
  Date.now = () => epoch + vt;
  window.requestAnimationFrame = (cb) => {
    const id = rafId++;
    raf.push([id, cb]);
    return id;
  };
  window.cancelAnimationFrame = (id) => {
    raf = raf.filter((x) => x[0] !== id);
  };
  window.setTimeout = (cb, ms, ...args) => {
    const id = timerId++;
    timers.set(id, { at: vt + Math.max(0, Number(ms) || 0), cb, args, every: 0 });
    return id;
  };
  window.clearTimeout = (id) => timers.delete(id);
  window.setInterval = (cb, ms, ...args) => {
    const id = timerId++;
    const every = Math.max(1, Number(ms) || 1);
    timers.set(id, { at: vt + every, cb, args, every });
    return id;
  };
  window.clearInterval = (id) => timers.delete(id);

  // Web Animations (and CSS animations and transitions, which are the same objects): all are kept paused
  // natively; each remembers whether the site meant it to run, and its own time, which the clock advances
  const A = Animation.prototype;
  const meta = new WeakMap();
  const nativeTime = Object.getOwnPropertyDescriptor(A, "currentTime");
  const nativeState = Object.getOwnPropertyDescriptor(A, "playState");
  const nativePlay = A.play;
  const nativePause = A.pause;
  const nativeFinish = A.finish;
  const scrollLinked = (a) => a.timeline && a.timeline !== document.timeline;
  const m = (a) => {
    let x = meta.get(a);
    if (!x) {
      const t = Number(nativeTime.get.call(a) ?? 0);
      // Seen for the first time a moment after it began: start it from its beginning on this clock
      x = { run: nativeState.get.call(a) === "running", t: t < 400 && !(a instanceof CSSAnimation) ? 0 : t };
      meta.set(a, x);
    }
    return x;
  };
  A.play = function () {
    if (scrollLinked(this)) return nativePlay.call(this);
    const x = m(this);
    const end = this.effect?.getComputedTiming().endTime;
    if (Number.isFinite(end) && x.t >= end) x.t = 0;
    x.run = true;
    x.done = false;
    nativePause.call(this);
    nativeTime.set.call(this, x.t);
  };
  A.pause = function () {
    if (scrollLinked(this)) return nativePause.call(this);
    m(this).run = false;
    nativePause.call(this);
  };
  Object.defineProperty(A, "currentTime", {
    configurable: true,
    get() {
      if (scrollLinked(this)) return nativeTime.get.call(this);
      return m(this).t;
    },
    set(v) {
      if (!scrollLinked(this)) m(this).t = Number(v);
      nativeTime.set.call(this, v);
    },
  });
  Object.defineProperty(A, "playState", {
    configurable: true,
    get() {
      if (scrollLinked(this)) return nativeState.get.call(this);
      const s = nativeState.get.call(this);
      if (s === "idle" || s === "finished") return s;
      return m(this).run ? "running" : "paused";
    },
  });

  // Video: kept paused natively and moved frame by frame
  const V = HTMLMediaElement.prototype;
  const vmeta = new WeakMap();
  const vplay = V.play;
  const vpause = V.pause;
  V.play = function () {
    vmeta.set(this, true);
    if (this.preload === "none") this.preload = "auto";
    this.muted = true;
    vpause.call(this);
    return Promise.resolve();
  };
  V.pause = function () {
    vmeta.set(this, false);
    vpause.call(this);
  };
  Object.defineProperty(V, "paused", { configurable: true, get() { return !vmeta.get(this); } });
  void vplay;

  window.__vt = () => vt;
  /** Move every clock on by `ms`. Resolves once videos have shown their new frame */
  window.__step = (ms) => {
    const target = vt + ms;
    // Timers, in order, each at its own moment
    for (;;) {
      let next = null;
      for (const [id, t] of timers) if (t.at <= target && (!next || t.at < next[1].at)) next = [id, t];
      if (!next) break;
      const [id, t] = next;
      vt = Math.max(vt, t.at);
      if (t.every) t.at = vt + t.every;
      else timers.delete(id);
      try {
        typeof t.cb === "function" ? t.cb(...t.args) : 0;
      } catch (e) {
        console.error(e);
      }
    }
    vt = target;
    for (const a of document.getAnimations()) {
      if (scrollLinked(a)) continue;
      const x = m(a);
      if (x.done) continue;
      nativePause.call(a);
      const rate = a.playbackRate || 1;
      if (x.run) x.t += ms * rate;
      // At its end, it really finishes: its finished promise resolves and its events fire, which is what
      // tells Motion an exit is over (the intro's curtain, a closing modal) and CSS that a transition ended
      const end = a.effect?.getComputedTiming().endTime;
      if (x.run && ((rate > 0 && Number.isFinite(end) && x.t >= end) || (rate < 0 && x.t <= 0))) {
        x.done = true;
        x.run = false;
        try {
          nativeFinish.call(a);
        } catch {
          nativeTime.set.call(a, rate > 0 ? end : 0);
        }
        continue;
      }
      nativeTime.set.call(a, x.t);
    }
    const q = raf;
    raf = [];
    for (const [, cb] of q) {
      try {
        cb(vt);
      } catch (e) {
        console.error(e);
      }
    }
    const seeks = [];
    document.querySelectorAll("video").forEach((v) => {
      if (!vmeta.get(v) || !(v.duration > 0)) return;
      const t = ((v.currentTime || 0) + (ms / 1000) * (v.playbackRate || 1)) % v.duration;
      seeks.push(
        new Promise((res) => {
          v.addEventListener("seeked", res, { once: true });
          v.currentTime = t;
        }),
      );
    });
    // A seek that never reports back doesn't hold the frame up for long
    return seeks.length ? Promise.race([Promise.all(seeks), new Promise((r) => realTimeout(r, 400))]) : Promise.resolve();
  };
  window.__realTimeout = realTimeout;
})();
