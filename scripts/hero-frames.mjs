// Screenshots the pinned hero at several scroll positions, so the scroll choreography can be reviewed frame by frame.
// Usage: node scripts/hero-frames.mjs [outDir]   (server on :3100)
import { chromium, webkit, devices } from "@playwright/test";
import { mkdir } from "node:fs/promises";

const out = process.argv[2] ?? "screenshots/hero";
await mkdir(out, { recursive: true });
const errors = [];

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
page.on("pageerror", (e) => errors.push(e.message));
await page.goto("http://localhost:3100/", { waitUntil: "networkidle" });
await page.keyboard.press("Escape");
await page.waitForTimeout(1200);

const range = await page.evaluate(() => {
  const s = document.querySelector("section[aria-labelledby='hero-name']");
  return s.offsetHeight - window.innerHeight;
});
// Hover while still the hero: should NOT flip
await page.mouse.move(720, 390);
await page.waitForTimeout(900);
await page.screenshot({ path: `${out}/desktop-hover-hero.png` });
await page.mouse.move(10, 890);
await page.waitForTimeout(700);

// Hover once settled on the left: should flip
await page.evaluate((y) => window.scrollTo(0, y), Math.round(range * 0.7));
await page.waitForTimeout(700);
await page.mouse.move(375, 415);
await page.waitForTimeout(900);
await page.screenshot({ path: `${out}/desktop-hover-left.png` });
await page.mouse.move(10, 890);
await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(700);

for (const f of [0, 0.2, 0.35, 0.5, 0.8]) {
  await page.evaluate((y) => window.scrollTo(0, y), Math.round(range * f));
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${out}/desktop-${String(Math.round(f * 100)).padStart(2, "0")}.png` });
}

// What I do: its own pinned section below the hero
const svc = await page.evaluate(() => {
  const el = document.querySelector("section[aria-labelledby='services-title-desktop']");
  const top = el.getBoundingClientRect().top + window.scrollY;
  return { top, range: el.offsetHeight - window.innerHeight };
});
for (const f of [0, 0.5, 1]) {
  await page.evaluate((y) => window.scrollTo(0, y), Math.round(svc.top + svc.range * f));
  await page.waitForTimeout(900);
  await page.screenshot({ path: `${out}/services-${Math.round(f * 100)}.png` });
}
// Catch the swing mid-scroll
await page.evaluate((y) => window.scrollTo(0, y), Math.round(svc.top + svc.range * 0.2));
await page.waitForTimeout(700);
for (let i = 0; i < 6; i++) {
  await page.mouse.wheel(0, 140);
  await page.waitForTimeout(30);
}
await page.waitForTimeout(120);
await page.screenshot({ path: `${out}/services-swinging.png` });
await browser.close();

const wk = await webkit.launch();
const m = await wk.newPage({ ...devices["iPhone 13 Mini"], viewport: { width: 375, height: 812 } });
await m.goto("http://localhost:3100/", { waitUntil: "networkidle" });
await m.waitForTimeout(3200);
await m.screenshot({ path: `${out}/mobile-top.png` });
const row = m.locator("section[aria-labelledby='services-title-mobile'] ul:has(article)");
await row.scrollIntoViewIfNeeded();
await m.evaluate(() => window.scrollBy(0, 120));
await m.waitForTimeout(600);
await m.screenshot({ path: `${out}/mobile-cards.png` });
// Swipe the row: scroll its container in quick steps, then capture the swing
for (let i = 0; i < 6; i++) {
  await row.evaluate((ul) => ul.parentElement.scrollBy({ left: 50 }));
  await m.waitForTimeout(16);
}
await m.waitForTimeout(80);
await m.screenshot({ path: `${out}/mobile-swinging.png` });
await wk.close();
console.log(errors.length ? errors.join("\n") : "no page errors");
