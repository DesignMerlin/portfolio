// Design review screenshots + console error capture
import { chromium, webkit, devices } from "@playwright/test";
import { mkdir } from "node:fs/promises";

const base = "http://localhost:3100";
const out = process.argv[2];
await mkdir(out, { recursive: true });

const errors = [];
const run = async (engine, label, options) => {
  const browser = await engine.launch();
  const ctx = await browser.newContext(options);
  const page = await ctx.newPage();
  page.on("console", (m) => m.type() === "error" && errors.push(`[${label}] ${m.text()}`));
  page.on("pageerror", (e) => errors.push(`[${label}] pageerror ${e.message}`));

  // Intro mid-count, then after
  await page.goto(base + "/", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${out}/${label}-intro.png` });
  await page.waitForTimeout(2600);
  await page.screenshot({ path: `${out}/${label}-home.png` });
  await page.screenshot({ path: `${out}/${label}-home-full.png`, fullPage: true });

  for (const p of ["/work/room8", "/work/fundpath", "/work/immigify", "/shots", "/about"]) {
    await page.goto(base + p, { waitUntil: "networkidle" });
    await page.waitForTimeout(400);
    const name = p.replaceAll("/", "-").slice(1);
    await page.screenshot({ path: `${out}/${label}-${name}.png` });
    if (p === "/work/room8") {
      // Too long for one image on phones: capture key sections one viewport at a time
      for (const id of ["research", "personas", "journey", "ia", "decisions", "prototype", "testing"]) {
        await page.evaluate((i) => document.getElementById(i)?.scrollIntoView(), id);
        await page.waitForTimeout(900);
        await page.screenshot({ path: `${out}/${label}-${name}-${id}.png` });
      }
    }
  }
  await browser.close();
};

await run(chromium, "desktop", { viewport: { width: 1440, height: 900 } });
await run(webkit, "mobile", { ...devices["iPhone 13 Mini"], viewport: { width: 375, height: 812 } });
console.log(errors.length ? errors.join("\n") : "no console errors");
