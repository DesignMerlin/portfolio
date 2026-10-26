// Interaction smoke test: drives the signature flows and screenshots each state.
// Usage: node scripts/interact.mjs [outDir]   (server must be running on :3100)
import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";

const base = "http://localhost:3100";
const out = process.argv[2] ?? "screenshots/interact";
await mkdir(out, { recursive: true });

const errors = [];
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
page.on("pageerror", (e) => errors.push(`pageerror ${e.message}`));
const shot = (n) => page.screenshot({ path: `${out}/${n}.png` });
const step = async (name, fn) => {
  try {
    await fn();
    console.log(`ok   ${name}`);
  } catch (e) {
    console.log(`FAIL ${name}: ${e.message.split("\n")[0]}`);
  }
};

await page.goto(base + "/", { waitUntil: "networkidle" });
await page.keyboard.press("Escape"); // skip intro
await page.waitForTimeout(900);

await step("hover second work row swaps preview", async () => {
  await page.locator("#work ol li a").nth(1).hover();
  await page.waitForTimeout(500);
  await page.locator("#work").scrollIntoViewIfNeeded();
  await shot("01-hover-fundpath");
});

await step("hover preview shows Figma hover state", async () => {
  await page.locator("#work .group\\/preview").hover();
  await page.waitForTimeout(400);
  await shot("02-preview-hover");
});

await step("click row navigates to case study", async () => {
  await page.locator("#work ol li a").nth(1).click();
  await page.waitForURL("**/work/fundpath");
  await page.waitForTimeout(800);
  await shot("03-fundpath-case");
});

await step("command menu opens with Ctrl+K and filters", async () => {
  await page.keyboard.press("Control+k");
  await page.waitForTimeout(150);
  await page.keyboard.type("immi");
  await page.waitForTimeout(150);
  await shot("04-command-menu");
  await page.keyboard.press("Enter");
  await page.waitForURL("**/work/immigify");
  await page.waitForTimeout(800);
});

await step("immigify agent: ask, think, stream, expand card", async () => {
  await page.locator("#prototype").scrollIntoViewIfNeeded();
  await page.waitForTimeout(1200);
  await page.getByRole("button", { name: "What's still missing from Adaeze's H-1B file?" }).click();
  await page.waitForTimeout(900);
  await shot("05-agent-thinking");
  await page.waitForTimeout(4500);
  await page.getByRole("button", { name: "2 missing documents" }).click();
  await page.waitForTimeout(700);
  await shot("06-agent-card");
});

await step("fundpath donate flow", async () => {
  await page.goto(base + "/work/fundpath", { waitUntil: "networkidle" });
  await page.locator("#prototype").scrollIntoViewIfNeeded();
  await page.waitForTimeout(1200);
  await page.getByRole("button", { name: "Donate ₦5,000" }).click();
  await page.waitForTimeout(500);
  await shot("07-fundpath-sheet");
  await page.getByRole("button", { name: "Confirm donation" }).click();
  await page.waitForTimeout(2600);
  await shot("08-fundpath-done");
});

await step("room8 listing detail and request", async () => {
  await page.goto(base + "/work/room8", { waitUntil: "networkidle" });
  await page.locator("#prototype").scrollIntoViewIfNeeded();
  await page.waitForTimeout(1200);
  await page.getByRole("tab", { name: /Luxury/ }).click();
  await page.waitForTimeout(500);
  await page.locator("[aria-label='Room8 prototype'] li button").first().click();
  await page.waitForTimeout(900);
  await page.getByRole("button", { name: "Request to join" }).click();
  await page.waitForTimeout(1600);
  await shot("09-room8-sent");
});

await step("journey arrow keys + IA tree", async () => {
  await page.locator("[role=tablist][aria-label='Journey stages'] [aria-selected=true]").focus();
  await page.keyboard.press("ArrowRight");
  await page.waitForTimeout(500);
  await shot("10-journey-step");
});

await step("shots filter + lightbox", async () => {
  await page.goto(base + "/shots", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: /^Mobile/ }).click();
  await page.waitForTimeout(700);
  await shot("11-shots-mobile-filter");
  await page.getByRole("button", { name: "Open FundPath campaign flows" }).click();
  await page.waitForTimeout(700);
  await shot("12-lightbox");
  await page.keyboard.press("ArrowRight");
  await page.waitForTimeout(600);
  await page.keyboard.press("Escape");
  await page.waitForTimeout(600);
});

await step("theme toggle to light", async () => {
  await page.goto(base + "/about", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: /Switch to light theme/ }).click();
  await page.waitForTimeout(600);
  await page.getByRole("button", { name: /Tap to see/ }).click();
  await page.waitForTimeout(800);
  await page.getByText("How I use AI in my process").scrollIntoViewIfNeeded();
  await shot("13-about-light");
  await page.goto(base + "/", { waitUntil: "networkidle" });
  await page.waitForTimeout(600);
  await shot("14-home-light");
});

await browser.close();
console.log(errors.length ? "ERRORS:\n" + errors.join("\n") : "no console errors");
