// Records the launch film's plates: each shot, captured from the real site on the controlled clock
// (clock.js), 30 frames a second, as numbered JPEGs in .launch-film/plates/<shot>/.
//
//   pnpm build && pnpm start          (the site, on http://localhost:3000 unless given)
//   node scripts/launch-film/record.mjs [http://localhost:3000] [shot ...]
import fs from "node:fs";
import path from "node:path";
import { chromium } from "@playwright/test";

const args = process.argv.slice(2);
const base = args[0]?.startsWith("http") ? args.shift() : "http://localhost:3000";
const only = new Set(args);
const OUT = ".launch-film/plates";
const FPS = 30;
const clock = fs.readFileSync(new URL("./clock.js", import.meta.url), "utf8");
const browser = await chromium.launch({ args: ["--use-gl=swiftshader", "--ignore-gpu-blocklist", "--force-color-profile=srgb"] });

/** One shot: open the page, let it settle on the clock, set it up, then record `secs` of it */
async function plate(name, { path: route, secs, setup, frame, clip, scale = 4 / 3, theme = "dark" }) {
  if (only.size && !only.has(name)) return;
  const dir = path.join(OUT, name);
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(dir, { recursive: true });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 810 }, deviceScaleFactor: scale });
  await ctx.addInitScript((t) => {
    try {
      localStorage.setItem("motion", "full");
      localStorage.setItem("theme", t);
      localStorage.setItem("projects-view", "gallery");
    } catch {}
  }, theme);
  await ctx.addInitScript(clock);
  // The Stop motion button is for visitors, not for the film
  await ctx.addInitScript(() => {
    const css = ".motion-fab{display:none!important}";
    document.addEventListener("DOMContentLoaded", () => document.head.append(Object.assign(document.createElement("style"), { textContent: css })));
  });
  const page = await ctx.newPage();
  page.on("pageerror", (e) => console.log(`  [${name}] page error: ${e.message}`));
  const step = (ms = 1000 / FPS) => page.evaluate((ms) => window.__step(ms), ms);
  const run = async (secs) => {
    for (let i = 0; i < secs * FPS; i++) await step();
  };
  await page.goto(base + route, { waitUntil: "load" });
  // Through the intro (it plays on every full load), on the clock
  for (let i = 0; i < 600 && (await page.evaluate(() => document.documentElement.dataset.intro === "play")); i++) await step();
  await run(0.3);
  const ctxObj = { page, step, run, rect: (sel) => page.locator(sel).first().boundingBox() };
  if (setup) await setup(ctxObj);
  const box = clip ? await clip(ctxObj) : null;
  const total = Math.round(secs * FPS);
  for (let f = 0; f < total; f++) {
    if (frame) await frame(ctxObj, f, f / FPS);
    await step();
    await page.evaluate(() => new Promise((r) => window.__realTimeout(r, 0)));
    await page.screenshot({ path: path.join(dir, `${String(f).padStart(5, "0")}.jpg`), type: "jpeg", quality: 90, ...(box ? { clip: box } : {}) });
  }
  console.log(`${name}: ${total} frames`);
  await ctx.close();
}

const scrollTo = (page, y) => page.evaluate((y) => window.scrollTo({ top: y, behavior: "instant" }), y);
const topOf = (page, sel) => page.evaluate((sel) => document.querySelector(sel).getBoundingClientRect().top + scrollY, sel);
/** A film on a project page, at film time `t` seconds, playing */
const filmAt = async ({ page, run }, t) => {
  await page.locator("main .film").first().evaluate((e) => e.scrollIntoView({ block: "center" }));
  await run(1);
  await page.locator("main .film").first().evaluate((root, t) => {
    root.querySelectorAll("*").forEach((n) => n.getAnimations().forEach((a) => {
      a.currentTime = t * 1000;
      a.play();
    }));
  }, t);
};
const filmBox = async ({ page }) => {
  const b = await page.locator("main .film").first().boundingBox();
  return { x: Math.round(b.x), y: Math.round(b.y), width: Math.round(b.width), height: Math.round(b.height) };
};

// 2. The name lands: from the moment the intro has gone
await plate("hero", { path: "/", secs: 5.5 });

// 3. The sentence lights up, scrolled at a steady pace from its top at 80% down the screen to its bottom at 55%
await plate("sentence", {
  path: "/",
  secs: 6.5,
  frame: async ({ page }, f) => {
    if (f === 0) {
      const g = await page.evaluate(() => {
        const r = document.querySelector(".sentence, p.mx-auto.max-w-\\[17ch\\]").getBoundingClientRect();
        return { top: r.top + scrollY, h: r.height };
      });
      // Ends with the last line comfortably on screen and the numbers below still out of view
      page.__s = { from: g.top - 810 * 0.86, to: g.top + g.h - 810 * 0.66 };
    }
    const k = Math.min(1, f / (6 * FPS));
    const e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
    await scrollTo(page, page.__s.from + (page.__s.to - page.__s.from) * e);
  },
});

// 4. Selected work, the films playing
await plate("grid", {
  path: "/",
  secs: 6.5,
  setup: async ({ page, run }) => {
    await scrollTo(page, (await topOf(page, "#work")) - 24);
    await run(1.2);
  },
});

// 5. Peel a sticker: drag its corner past halfway and let go
await plate("peel", {
  path: "/",
  secs: 4.5,
  setup: async ({ page, run }) => {
    await page.locator("#work .sticker").first().evaluate((e) => e.scrollIntoView({ block: "center" }));
    await run(1.2);
  },
  frame: async ({ page }, f) => {
    if (f === 0) page.__b = await page.locator("#work .sticker").first().boundingBox();
    const b = page.__b;
    const sx = b.x + 30;
    const sy = b.y + b.height - 30;
    if (f === 12) {
      await page.mouse.move(sx, sy);
      await page.mouse.down();
    }
    if (f > 12 && f <= 36) {
      const k = (f - 12) / 24;
      const e = 1 - Math.pow(1 - k, 2);
      await page.mouse.move(sx + e * b.width * 0.62, sy - e * b.height * 0.5);
    }
    if (f === 37) await page.mouse.up();
  },
});

// 6. The gallery turning, then the centre card opened as a page
await plate("gallery", {
  path: "/projects",
  secs: 6.5,
  setup: async ({ page, run }) => {
    await page.locator(".gallery-stage").evaluate((e) => e.scrollIntoView({ block: "center" }));
    await run(2.5);
  },
  frame: async ({ page }, f) => {
    if (f === 66) {
      const b = await page.locator(".gallery-feature button").boundingBox();
      await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2);
    }
  },
});

// 7. Fysi's dashboard charts drawing; PowerRoute's battery filling (the films themselves, close)
await plate("charts", { path: "/work/fysi", secs: 7.5, scale: 2, setup: (c) => filmAt(c, 21.4), clip: filmBox });
await plate("battery", { path: "/work/powerroute", secs: 7.5, scale: 2, setup: (c) => filmAt(c, 18.6), clip: filmBox });

// 8. Four details
await plate("rope", {
  path: "/",
  secs: 2,
  setup: async ({ page, run }) => {
    await page.locator(".rope-stage").evaluate((e) => e.scrollIntoView({ block: "center" }));
    await run(1.5);
  },
});
await plate("cmdk", {
  path: "/",
  secs: 2,
  setup: ({ run }) => run(1),
  frame: async ({ page }, f) => {
    if (f === 4) await page.keyboard.press("Control+k");
    if (f === 22) await page.keyboard.type("f");
    if (f === 30) await page.keyboard.type("y");
  },
});
await plate("nav", {
  path: "/",
  secs: 2,
  setup: async ({ page, run }) => {
    const cards = await page.evaluate(() => {
      const r = document.querySelector("#work .sticker").getBoundingClientRect();
      return r.top + scrollY;
    });
    await scrollTo(page, cards - 8);
    await run(1.2);
  },
  frame: async ({ page }, f) => {
    // A slow drift, so the split in the nav slides across the card's edge
    const y = await page.evaluate(() => scrollY);
    if (f) await scrollTo(page, y + 1.2);
  },
});
await plate("theme", {
  path: "/",
  secs: 2.2,
  // A little way down, so the nav (and its theme switch) has dropped in
  setup: async ({ page, run }) => {
    await run(1.5);
    await scrollTo(page, 150);
    await run(1.5);
  },
  frame: async ({ page }, f) => {
    if (f === 8) {
      // The switch that is actually on screen (the phone menu has one too)
      const at = await page.evaluate(() => {
        for (const b of document.querySelectorAll("button")) {
          if (!/Switch to light theme/.test(b.getAttribute("aria-label") ?? b.textContent ?? "")) continue;
          const r = b.getBoundingClientRect();
          if (r.width && r.top >= 0 && r.bottom <= innerHeight) return [r.x + r.width / 2, r.y + r.height / 2];
        }
        return null;
      });
      if (at) await page.mouse.click(at[0], at[1]);
      else console.log("  [theme] no switch on screen");
    }
  },
});

// 9. The numbers roll, then the testimonials turn
await plate("proof", {
  path: "/",
  secs: 6.5,
  setup: async ({ page, run }) => {
    // Clear of the intro, then straight to the numbers so they roll in on camera
    await run(1.2);
    const stats = await page.evaluate(() => {
      const h = [...document.querySelectorAll("h2, p")].find((e) => /what does that look like/i.test(e.textContent ?? ""));
      return h.getBoundingClientRect().top + scrollY;
    });
    await scrollTo(page, stats - 120);
    page.__stats = stats;
    page.__dial = await topOf(page, "#testimonials-title");
  },
  frame: async ({ page }, f) => {
    if (f >= 90 && f <= 120) {
      const k = (f - 90) / 30;
      const e = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
      await scrollTo(page, page.__stats - 120 + (page.__dial - 40 - (page.__stats - 120)) * e);
    }
    if (f === 150) await page.evaluate(() => document.querySelector('button[aria-label="Next testimonial"]')?.click());
  },
});

// 10. "hi" on the doodle wall, added, then the wall zooms out
await plate("wall", {
  path: "/about",
  secs: 6.5,
  setup: async ({ page, run }) => {
    await page.locator("canvas.wall-paper").waitFor();
    await run(1.5);
    await page.locator("canvas.wall-paper").evaluate((e) => e.scrollIntoView({ block: "center" }));
    await run(0.5);
    await page.getByRole("radio", { name: "Coral", exact: true }).click({ force: true });
    await page.getByRole("radio", { name: "Brush", exact: true }).click({ force: true });
    page.__r = await page.locator("canvas.wall-paper").boundingBox();
  },
  frame: async ({ page }, f) => {
    const r = page.__r;
    const at = (x, y) => [r.x + x * r.width, r.y + y * r.height];
    // Strokes: [start frame, points]
    const strokes = [
      [6, [[0.42, 0.28], [0.42, 0.44], [0.42, 0.62]]],
      [24, [[0.42, 0.5], [0.45, 0.45], [0.49, 0.46], [0.5, 0.53], [0.5, 0.62]]],
      [46, [[0.57, 0.45], [0.57, 0.62]]],
      [62, [[0.57, 0.35], [0.572, 0.36]]],
    ];
    for (const [start, pts] of strokes) {
      const len = pts.length * 4;
      if (f === start) {
        await page.mouse.move(...at(...pts[0]));
        await page.mouse.down();
      }
      if (f > start && f <= start + len) {
        const k = (f - start) / len;
        const i = Math.min(pts.length - 2, Math.floor(k * (pts.length - 1)));
        const u = k * (pts.length - 1) - i;
        const a = pts[i];
        const b = pts[i + 1] ?? a;
        await page.mouse.move(...at(a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u));
      }
      if (f === start + len + 1) await page.mouse.up();
    }
    if (f === 76) {
      await page.getByRole("radio", { name: "Marigold", exact: true }).click({ force: true });
      await page.getByRole("radio", { name: "Highlighter", exact: true }).click({ force: true });
    }
    if (f === 80) {
      await page.mouse.move(...at(0.37, 0.7));
      await page.mouse.down();
    }
    if (f > 80 && f <= 98) await page.mouse.move(...at(0.37 + ((f - 80) / 18) * 0.26, 0.7));
    if (f === 99) await page.mouse.up();
    if (f === 126) await page.getByRole("button", { name: "Add to the wall", exact: true }).click({ force: true });
    if (f === 150 || f === 162) await page.getByRole("button", { name: "Zoom out", exact: true }).click({ force: true });
  },
});

await browser.close();
