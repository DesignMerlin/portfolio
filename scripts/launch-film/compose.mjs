// Renders the launch film's frames: steps the compositor (compositor.html) through the edit (edit.mjs),
// one frame at a time, into .launch-film/frames/. Run after record.mjs.
//   node scripts/launch-film/compose.mjs [from-second] [to-second]
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { chromium } from "@playwright/test";
import * as edl from "./edit.mjs";

const [from = 0, to = edl.LENGTH] = process.argv.slice(2).map(Number);
const PLATES = path.resolve(".launch-film/plates");
const OUT = ".launch-film/frames";
fs.mkdirSync(OUT, { recursive: true });
const counts = Object.fromEntries(fs.readdirSync(PLATES).map((d) => [d, fs.readdirSync(path.join(PLATES, d)).length]));

const browser = await chromium.launch({ args: ["--allow-file-access-from-files"] });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
page.on("pageerror", (e) => console.log("compositor error:", e.message));
await page.goto(pathToFileURL(path.resolve("scripts/launch-film/compositor.html")).href, { waitUntil: "load" });
await page.evaluate(([e, p, c]) => window.setup(e, p, c), [{ FPS: edl.FPS, shots: edl.shots }, pathToFileURL(PLATES).href, counts]);

const stage = page.locator("#stage");
const first = Math.round(from * edl.FPS);
const last = Math.round(to * edl.FPS);
for (let f = first; f < last; f++) {
  await page.evaluate((t) => window.render(t), f / edl.FPS);
  await stage.screenshot({ path: path.join(OUT, `${String(f).padStart(5, "0")}.jpg`), type: "jpeg", quality: 92 });
  if (f % 150 === 0) console.log(`${(f / edl.FPS).toFixed(0)}s`);
}
await browser.close();
console.log(`frames ${first}–${last - 1} in ${OUT}`);
