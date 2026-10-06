// Screenshot a page at desktop and phone widths, for design review.
// Usage: pnpm shoot <url> [name]
// Output: screenshots/<name>-desktop.png and screenshots/<name>-mobile.png (gitignored)
import { mkdir } from "node:fs/promises";
import { chromium, webkit, devices } from "@playwright/test";

const [url, name = "page"] = process.argv.slice(2);
if (!url) {
  console.error("Usage: pnpm shoot <url> [name]");
  process.exit(1);
}

await mkdir("screenshots", { recursive: true });

const targets = [
  // Desktop: Chromium at a common laptop width
  { label: "desktop", engine: chromium, options: { viewport: { width: 1440, height: 900 } } },
  // Mobile: Safari's engine with iPhone size, touch, and pixel density
  {
    label: "mobile",
    engine: webkit,
    options: { ...devices["iPhone 13 Mini"], viewport: { width: 375, height: 812 } },
  },
];

for (const { label, engine, options } of targets) {
  const browser = await engine.launch();
  const page = await browser.newPage(options);
  await page.goto(url, { waitUntil: "networkidle" });
  const file = `screenshots/${name}-${label}.png`;
  await page.screenshot({ path: file });
  console.log(`saved ${file}`);
  await browser.close();
}
