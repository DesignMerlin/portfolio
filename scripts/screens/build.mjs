/**
 * Renders the built screens (see kit.mjs) to public/work/<app>/b-*.webp and writes their tap targets and fields
 * to content/built/<app>.json. Run: node scripts/screens/build.mjs [app…]
 */
import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { chromium } from "@playwright/test";
import { css } from "./kit.mjs";

const root = path.resolve(import.meta.dirname, "../..");
// sharp ships with Next
const require = createRequire(fs.realpathSync(path.join(root, "node_modules/next/package.json")));
const sharp = require("sharp");

const apps = process.argv.slice(2).length ? process.argv.slice(2) : ["room8", "fundpath", "case-tracker", "yoyo"];
const kebab = (s) => s.replace(/[A-Z]/g, (c) => "-" + c.toLowerCase());
const b = await chromium.launch();

for (const app of apps) {
  const { theme, screens } = await import(pathToFileURL(path.join(import.meta.dirname, `${app}.mjs`)));
  const dir = path.join(root, "public/work", app);
  // Earlier renders of screens that no longer exist
  for (const f of fs.readdirSync(dir)) if (f.startsWith("b-")) fs.unlinkSync(path.join(dir, f));
  const page = await b.newPage({ viewport: { width: 375, height: 812 }, deviceScaleFactor: 3 });
  const tmp = path.join(root, `public/work/.screen-${app}.html`);
  const out = {};
  for (const [id, s] of Object.entries(screens)) {
    const html = `<!doctype html><meta charset="utf-8"><link rel="stylesheet" href="${theme.fontUrl}"><style>${css(theme)}</style><body>${s.html}`;
    fs.writeFileSync(tmp, html);
    await page.goto(pathToFileURL(tmp).href, { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);
    const file = `b-${kebab(id)}`;
    await sharp(await page.screenshot()).webp({ quality: 86, effort: 6 }).toFile(path.join(dir, `${file}.webp`));
    const read = await page.evaluate(() => {
      const n = (v) => Math.round(v * 10) / 10;
      const box = (e) => {
        const r = e.getBoundingClientRect();
        return { x: r.left, y: r.top, w: r.width, h: r.height };
      };
      const spots = [...document.querySelectorAll("[data-to]")].map((e) => {
        const r = box(e);
        const w = Math.min(375, Math.max(r.w, 36));
        const h = Math.max(r.h, 32);
        return { label: e.dataset.label, at: [n(r.x + r.w / 2), n(r.y + r.h / 2)], size: [n(w), n(h)], to: e.dataset.to, move: e.dataset.move };
      });
      const off = [...document.querySelectorAll("[data-to]")].filter((e) => box(e).y > 800 || box(e).x > 370).map((e) => e.dataset.label);
      const sheet = document.querySelector("[data-sheet]");
      return { spots, off, sheet: sheet ? { top: Number(sheet.dataset.sheet), over: sheet.dataset.over } : undefined };
    });
    if (read.off.length) console.warn(`${app}/${id}: off screen →`, read.off.join(", "));
    // Two rows with the same words need different names
    const named = {};
    for (const s of read.spots) {
      const n = (named[s.label] = (named[s.label] ?? 0) + 1);
      if (n > 1) s.label += `, ${n}`;
    }
    const fields = [];
    const els = await page.$$("[data-field]");
    for (let i = 0; i < els.length; i++) {
      const f = await els[i].evaluate((e) => {
        e.classList.add("typed");
        const n = (v) => Math.round(v * 10) / 10;
        const box = (x) => {
          const r = x.getBoundingClientRect();
          return [n(r.left), n(r.top), n(r.width), n(r.height)];
        };
        let bg = "rgba(0, 0, 0, 0)";
        for (let p = e; p && bg === "rgba(0, 0, 0, 0)"; p = p.parentElement) bg = getComputedStyle(p).backgroundColor;
        const ink = e.querySelector(".ink");
        const ph = e.querySelector(".ph");
        const t = box(ink);
        const c = box(ph);
        return { label: e.dataset.field, text: [t[0] - 1, t[1], t[2] + 3, t[3]], clear: [c[0] - 1, c[1], c[2] + 3, c[3]], field: box(e), r: parseFloat(getComputedStyle(e).borderRadius) || 8, bg, chars: ink.textContent.length };
      });
      const ink = `${file}-ink-${i}`;
      const [x, y, width, height] = f.text;
      await sharp(await page.screenshot({ clip: { x, y, width, height } })).webp({ quality: 90 }).toFile(path.join(dir, `${ink}.webp`));
      await els[i].evaluate((e) => e.classList.remove("typed"));
      fields.push({ ...f, src: `/work/${app}/${ink}.webp` });
    }
    out[id] = { src: `/work/${app}/${file}.webp`, alt: s.alt, spots: read.spots, ...(fields.length ? { fields } : {}), ...(read.sheet ? { sheet: read.sheet } : {}), ...(s.auto ? { auto: s.auto } : {}) };
  }
  fs.unlinkSync(tmp);
  await page.close();
  fs.mkdirSync(path.join(root, "content/built"), { recursive: true });
  fs.writeFileSync(path.join(root, `content/built/${app}.json`), JSON.stringify(out, null, 1) + "\n");
  console.log(app, Object.keys(out).length, "screens");
}
await b.close();
