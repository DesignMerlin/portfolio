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

await step("peel a sticker open", async () => {
  await page.locator("#work .sticker").nth(1).scrollIntoViewIfNeeded();
  const box = await page.locator("#work .sticker").nth(1).boundingBox();
  // Off centre: the middle is the View button
  await page.mouse.click(box.x + box.width * 0.8, box.y + box.height * 0.2);
  await page.waitForTimeout(900);
  await shot("01-sticker-open");
});

await step("drag a sticker corner halfway", async () => {
  await page.locator("#work .sticker").nth(0).scrollIntoViewIfNeeded();
  const box = await page.locator("#work .sticker").nth(0).boundingBox();
  const sx = box.x + 30;
  const sy = box.y + box.height - 30;
  await page.mouse.move(sx, sy);
  await page.mouse.down();
  for (let i = 1; i <= 10; i++) await page.mouse.move(sx + i * 16, sy - i * 13);
  await shot("02-sticker-drag");
  await page.mouse.up();
  await page.waitForTimeout(900);
});

await step("read case study from the revealed sticker", async () => {
  await page.locator("#work .sticker").nth(1).getByRole("link", { name: /^Read case study/ }).click();
  await page.waitForURL("**/work/fundpath");
  await page.waitForTimeout(800);
  await shot("03-fundpath-case");
});

await step("View button appears on hover and opens the project", async () => {
  await page.goto(base + "/", { waitUntil: "networkidle" });
  await page.keyboard.press("Escape");
  await page.waitForTimeout(900);
  const card = page.locator("#work .sticker").nth(0);
  await card.scrollIntoViewIfNeeded();
  await card.hover();
  await page.waitForTimeout(500);
  await shot("03b-view-button");
  await card.getByRole("link", { name: "View Room8" }).click();
  await page.waitForURL("**/work/room8");
  await page.waitForTimeout(800);
});

await step("command menu opens with Ctrl+K and filters", async () => {
  await page.keyboard.press("Control+k");
  await page.waitForTimeout(150);
  await page.keyboard.type("case tracker");
  await page.waitForTimeout(150);
  await shot("04-command-menu");
  await page.keyboard.press("Enter");
  await page.waitForURL("**/work/immigify-case-tracker");
  await page.waitForTimeout(800);
});

await step("immigify agent: ask, think, stream, expand card", async () => {
  await page.goto(base + "/work/immigify", { waitUntil: "networkidle" });
  await page.waitForTimeout(600);
  await page.keyboard.press("Escape");
  await page.waitForTimeout(900);
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

await step("fundpath prototype: find a campaign, read its report, give", async () => {
  await page.goto(base + "/work/fundpath", { waitUntil: "networkidle" });
  await page.locator("#prototype").scrollIntoViewIfNeeded();
  await page.waitForTimeout(3400);
  const proto = page.getByRole("group", { name: "FundPath prototype" });
  const tap = async (name) => {
    await proto.getByRole("button", { name, exact: true }).click();
    await page.waitForTimeout(750);
  };
  for (const name of ["Next", "Log in", "Password, type into it", "Sign in", "Open Jane's kidney transplant bills", "Transparency report"]) await tap(name);
  await shot("07-fundpath-report");
  for (const name of ["Back", "Share", "Close share", "Donate now"]) await tap(name);
  await shot("08-fundpath-amount");
  for (const name of ["Proceed", "Proceed", "Pay now"]) await tap(name);
  await page.waitForTimeout(2200);
  await tap("Back to home");
});

await step("room8 prototype: onboarding to roommate and 3D tour", async () => {
  await page.goto(base + "/work/room8", { waitUntil: "networkidle" });
  await page.locator("#prototype").scrollIntoViewIfNeeded();
  await page.waitForTimeout(3200);
  const proto = page.getByRole("group", { name: "Room8 prototype" });
  const tap = async (name) => {
    await proto.getByRole("button", { name, exact: true }).click();
    await page.waitForTimeout(700);
  };
  for (const name of ["Skip", "Sign in", "Settings", "Edit profile", "Back", "Back", "Notifications", "Back", "Explore", "Open Steph Campbell", "Back", "Home", "Open Sunlit Studio", "Start the 3D tour"]) await tap(name);
  await page.waitForTimeout(2200);
  await tap("Walk");
  await shot("09-room8-tour");
});

await step("case tracker prototype: type a receipt number, get the case, book and pay", async () => {
  await page.goto(base + "/work/immigify-case-tracker", { waitUntil: "networkidle" });
  await page.locator("#prototype").scrollIntoViewIfNeeded();
  await page.waitForTimeout(3600);
  const proto = page.getByRole("group", { name: "Case Tracker+ prototype" });
  const tap = async (name) => {
    await proto.getByRole("button", { name, exact: true }).click();
    await page.waitForTimeout(750);
  };
  for (const name of ["Get started", "Newcomer", "Continue", "Pick interests", "Continue", "Receipt number, type into it"]) await tap(name);
  await page.waitForTimeout(900);
  await shot("09b-tracker-typed");
  await tap("Finish");
  await page.waitForTimeout(3200);
  for (const name of ["Ask AI", "What does “biometrics” mean?", "See my case", "Back", "Consultants", "View Maria Alvarez", "See packages and book", "Book", "Select event type", "Initial Strategy Session", "Pick a date", "Confirm and pay $120", "Card number, type into it", "Pay $120", "View my appointments", "Join meeting", "End call"]) await tap(name);
});

await step("yoyo prototype: pick goals, build a budget, log a transaction, save for a goal", async () => {
  await page.goto(base + "/work/yoyo", { waitUntil: "networkidle" });
  await page.keyboard.press("Escape");
  await page.waitForTimeout(1200);
  await page.locator("#prototype").scrollIntoViewIfNeeded();
  await page.waitForTimeout(4200);
  const proto = page.getByRole("group", { name: "Yoyo prototype" });
  const tap = async (name) => {
    await proto.getByRole("button", { name, exact: true }).click();
    await page.waitForTimeout(750);
  };
  for (const name of ["Sign up", "Get started", "Continue", "Password, type into it", "Continue", "Skip", "Make a budget", "Continue", "Go to dashboard", "Budget", "Create a budget", "Create a budget", "Budget name, type into it", "Add income", "Amount, type into it", "Confirm", "Continue", "Housing", "Confirm", "Continue"]) await tap(name);
  await shot("09c-yoyo-summary");
  for (const name of ["Continue", "Go to home", "Overview", "Transaction history", "Add a transaction", "Amount, type into it", "Expenses", "Save", "Back", "Goals", "Create a goal", "Create a goal", "Weekly", "Tuesdays", "Confirm", "Confirm", "Confirm", "Continue", "Create goal", "View savings", "Save", "Save $250", "Back to Vacation"]) await tap(name);
});

await step("project page: no TL;DR or facts, and only real projects under More work", async () => {
  for (const slug of ["room8", "yoyo", "iexcelo", "heightgpt"]) {
    await page.goto(base + "/work/" + slug, { waitUntil: "networkidle" });
    if (await page.getByText("TL;DR").count()) throw new Error(slug + " still has a TL;DR");
    if (await page.locator("#overview dt").count()) throw new Error(slug + " still lists its facts");
    const more = page.getByRole("navigation", { name: "More work" });
    if (await more.getByText("Placeholder").count()) throw new Error(slug + " shows a placeholder under More work");
    if ((await more.getByRole("link").count()) < 4) throw new Error(slug + " shows too few projects");
  }
});

await step("nav: reads over any card, splits between two, works by mouse and keyboard", async () => {
  await page.goto(base + "/", { waitUntil: "networkidle" });
  await page.keyboard.press("Escape");
  await page.waitForTimeout(1200);
  const cards = page.locator("#work .sticker");
  if ((await cards.count()) !== 6) throw new Error("expected six cards, found " + (await cards.count()));
  // Scroll until the pill sits over a light card and a dark one: both skins show, each cut to its side
  const top = await cards.first().evaluate((e) => e.getBoundingClientRect().top + scrollY);
  for (let y = top - 300; y < top + 160; y += 60) {
    await page.evaluate((y) => scrollTo({ top: y, behavior: "instant" }), y);
    await page.waitForTimeout(150);
  }
  await page.waitForTimeout(1200);
  const skins = await page.evaluate(() => ["dark", "light"].map((k) => { const s = document.querySelector('[data-skin="' + k + '"]').style; return s.visibility + " " + s.clipPath.slice(0, 5); }));
  if (skins.some((s) => s !== "visible path(")) throw new Error("nav did not split: " + skins.join(" | "));
  await shot("10-nav-split");
  await page.locator("header").getByRole("link", { name: "About" }).hover();
  if ((await page.locator("[data-skin] [data-hot]").count()) !== 2) throw new Error("hover not drawn on both skins");
  await page.locator("header").getByRole("link", { name: "Projects" }).focus();
  await page.keyboard.press("Tab");
  if ((await page.locator("[data-skin] [data-focus]").count()) !== 2) throw new Error("focus not drawn on both skins");
  if (await page.locator("header").getByRole("link", { name: "Playground" }).count()) throw new Error("Playground is still in the menu");
  await page.keyboard.press("Enter");
  await page.waitForURL("**/about");
});

await step("playground: draw, undo, redo, clear, undo", async () => {
  await page.goto(base + "/playground", { waitUntil: "networkidle" });
  await page.keyboard.press("Escape");
  await page.waitForTimeout(1200);
  const paper = page.locator(".doodle-paper canvas");
  const strokes = async () => Number((await paper.getAttribute("aria-label")).match(/with ([0-9]+)/)[1]);
  const b = await paper.boundingBox();
  await page.mouse.move(b.x + 100, b.y + 100);
  await page.mouse.down();
  await page.mouse.move(b.x + 260, b.y + 180, { steps: 12 });
  await page.mouse.up();
  const seen = [await strokes()];
  await page.keyboard.press("Control+z");
  seen.push(await strokes());
  await page.keyboard.press("Control+Shift+z");
  seen.push(await strokes());
  await page.getByRole("button", { name: "Clear the page" }).click();
  seen.push(await strokes());
  await page.getByRole("button", { name: "Undo" }).click();
  seen.push(await strokes());
  if (seen.join() !== "1,0,1,0,1") throw new Error("strokes went " + seen.join());
});

await step("journey arrow keys + IA tree", async () => {
  await page.goto(base + "/work/room8", { waitUntil: "networkidle" });
  await page.waitForTimeout(600);
  await page.keyboard.press("Escape");
  await page.waitForTimeout(900);
  await page.locator(".full-process > summary").click();
  await page.waitForTimeout(400);
  await page.locator("[role=tablist][aria-label='Journey stages'] [aria-selected=true]").focus();
  await page.keyboard.press("ArrowRight");
  await page.waitForTimeout(500);
  await shot("10-journey-step");
});

await step("projects filter + lightbox", async () => {
  await page.goto(base + "/projects", { waitUntil: "networkidle" });
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
