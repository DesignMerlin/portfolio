// Measures the hanging cards' swing: scroll down in a burst, then up, sampling each card's angle.
// A good swing crosses zero several times (back and forth) and then settles near 0.
// Usage: node scripts/swing-test.mjs   (server on :3100)
import { chromium } from "@playwright/test";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto("http://localhost:3100/", { waitUntil: "networkidle" });
await page.keyboard.press("Escape");
await page.waitForTimeout(800);

await page.evaluate(() => {
  const el = document.querySelector("section[aria-labelledby='services-title-desktop']");
  const top = el.getBoundingClientRect().top + window.scrollY;
  window.scrollTo(0, top + (el.offsetHeight - window.innerHeight) * 0.3);
});
await page.waitForTimeout(1500);

const angles = () =>
  page.evaluate(() =>
    [...document.querySelectorAll("section[aria-labelledby='services-title-desktop'] article")].slice(1, 4).map((a) => {
      const m = getComputedStyle(a).transform;
      if (!m || m === "none") return 0;
      const [x, y] = m.slice(7, -1).split(",").map(Number);
      return Math.round(Math.atan2(y, x) * (180 / Math.PI) * 10) / 10;
    }),
  );

async function burst(dir, label) {
  for (let i = 0; i < 8; i++) {
    await page.mouse.wheel(0, dir * 120);
    await page.waitForTimeout(25);
  }
  const samples = [];
  for (let t = 0; t <= 3200; t += 100) {
    samples.push(await angles());
    await page.waitForTimeout(100);
  }
  const first = samples.map((s) => s[0]);
  const crossings = first.slice(1).filter((v, i) => Math.sign(v) !== Math.sign(first[i]) && Math.abs(v) > 0.2).length;
  const peak = Math.max(...first.map(Math.abs));
  console.log(`${label}: peak ${peak}°, zero crossings ${crossings}, final ${first.at(-1)}°`);
  console.log("  card 2 over time:", first.filter((_, i) => i % 2 === 0).join("  "));
}

await burst(1, "Scroll down");
await burst(-1, "Scroll up");
await browser.close();
