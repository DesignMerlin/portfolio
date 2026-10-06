// Runs in <head> before first paint (inlined, so it can't wait for React):
// 1. Theme: saved choice, else the OS preference. Prevents a flash of the wrong theme.
// 2. Intro countdown: plays once per browser session, never with reduced motion,
//    Any key, click, scroll or tap skips it.
export const headScript = `(() => {
  const root = document.documentElement;
  try {
    const saved = localStorage.getItem("theme");
    const dark = saved ? saved === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
    root.dataset.theme = dark ? "dark" : "light";
  } catch { root.dataset.theme = "light"; }

  try {
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const seen = sessionStorage.getItem("intro-seen");
    if (reduce || seen) return;
    sessionStorage.setItem("intro-seen", "1");
    root.dataset.intro = "play";
    const done = () => {
      if (root.dataset.intro !== "play") return;
      root.dataset.intro = "done";
      ["keydown", "pointerdown", "wheel", "touchstart"].forEach((e) => removeEventListener(e, done));
    };
    ["keydown", "pointerdown", "wheel", "touchstart"].forEach((e) => addEventListener(e, done, { passive: true }));
    // End exactly when the wipe finishes; the timeout is only a safety net.
    addEventListener("animationend", (e) => e.animationName === "intro-out" && done());
    setTimeout(done, 4000);
  } catch {}
})();`;
