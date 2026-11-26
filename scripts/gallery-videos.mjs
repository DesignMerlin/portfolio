// Records every project film as a small looping video for the Projects gallery's floating cards:
// public/work/gallery/<slug>.webm plus a .jpg poster. A dozen live coded films at once is far too much for
// a phone to draw (each is ~100 animations); a dozen small videos is cheap. The centre card still plays the
// live film at full quality.
//
// Re-run after a film changes. Start the site (pnpm build && pnpm start), then
//   node scripts/gallery-videos.mjs [http://localhost:3000] [slug ...]
//
// --phone records the films phones play instead of building them live (device-mockup.tsx): sharper and
// smoother (720 wide, 24fps), in public/work/films/<slug>.mp4 with a .jpg poster. A phone draws a video
// in hardware; a live film is hundreds of animations, which is what made phones hang. Its frames go to disk
// first, then they are encoded as H.264 MP4 (see encodePhone), small without losing the sharpness of the type.
// Frames are stepped one by one on the film's own clock, so the video is smooth however slow the machine.
// Encoding uses the ffmpeg that comes with Playwright (VP8 WebM).
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
import { chromium } from "@playwright/test";
import fullFfmpeg from "ffmpeg-static";

const args = process.argv.slice(2);
const phone = args.includes("--phone");
const [base = "http://localhost:3000", ...only] = args.filter((a) => a !== "--phone");
const out = phone ? "public/work/films" : "public/work/gallery";
// Gallery: twice the size a floating card is drawn at on a desktop. Phone: a card is ~370 points wide
const W = phone ? 720 : 320;
const H = Math.round((W * 1032) / 1184 / 2) * 2;
const FPS = phone ? 24 : 20;
const RATE = "220k";

/**
 * A phone film from the saved frames, as H.264 in MP4: every phone decodes it in hardware, iPhones of any
 * age included. Constant quality (CRF), so a busy film gets the bits its type needs and a calm one stays
 * small; tuned for flat, animated screens; long keyframe gaps, since it only ever loops from the top. About
 * half the size of the first VP8 recordings, and side by side with the source frames the type is the same.
 * Needs the full ffmpeg from ffmpeg-static (Playwright's only knows VP8). FILM_CRF to try another level.
 */
async function encodePhone(dir, slug) {
  const input = ["-y", "-framerate", String(FPS), "-i", path.join(dir, "%05d.jpg"), "-an", "-pix_fmt", "yuv420p", "-g", String(FPS * 10)];
  const run = (args) =>
    new Promise((res, rej) => {
      const p = spawn(fullFfmpeg, args, { stdio: ["ignore", "ignore", "pipe"] });
      let err = "";
      p.stderr.on("data", (d) => (err += d));
      p.on("close", (code) => (code === 0 ? res() : rej(new Error(err.slice(-600)))));
    });
  await run([...input, "-c:v", "libx264", "-preset", "veryslow", "-tune", "animation", "-crf", process.env.FILM_CRF || "28", "-profile:v", "high", "-level", "4.0", "-movflags", "+faststart", `${out}/${slug}.mp4`]);
}

function ffmpegPath() {
  const root = process.env.PLAYWRIGHT_BROWSERS_PATH || path.join(os.homedir(), process.platform === "win32" ? "AppData/Local/ms-playwright" : process.platform === "darwin" ? "Library/Caches/ms-playwright" : ".cache/ms-playwright");
  const dir = fs.readdirSync(root).filter((d) => d.startsWith("ffmpeg-")).sort().pop();
  if (!dir) throw new Error("No Playwright ffmpeg found. Run: pnpm exec playwright install ffmpeg");
  const bin = fs.readdirSync(path.join(root, dir)).find((f) => f.startsWith("ffmpeg"));
  return path.join(root, dir, bin);
}

fs.mkdirSync(out, { recursive: true });
const ffmpeg = ffmpegPath();
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 1000 } });
await page.addInitScript(() => {
  localStorage.setItem("projects-view", "list");
  localStorage.setItem("motion", "full");
});
await page.goto(base + "/projects", { waitUntil: "networkidle" });
await page.waitForFunction(() => document.documentElement.dataset.intro !== "play", null, { timeout: 15000 });

const slugs = await page.locator('main a[href^="/work/"]').evaluateAll((as) => as.map((a) => a.getAttribute("href").split("/").pop()));
for (const slug of slugs) {
  if (only.length && !only.includes(slug)) continue;
  const art = page.locator(`main a[href="/work/${slug}"] > div`).first();
  if (!(await art.locator(".device-mockup").count())) continue;

  // Lift this card out on its own at the recording size, over a blank page
  await page.evaluate(
    ([slug, W, H]) => {
      document.querySelectorAll("[data-recording]").forEach((e) => e.removeAttribute("data-recording"));
      const el = document.querySelector(`main a[href="/work/${slug}"] > div`);
      el.dataset.recording = "";
      let s = document.getElementById("rec-style");
      if (!s) {
        s = document.createElement("style");
        s.id = "rec-style";
        document.head.append(s);
      }
      s.textContent = `[data-recording]{position:fixed!important;left:0;top:0;width:${W}px!important;height:${H}px!important;z-index:2147483647;border-radius:0!important;aspect-ratio:auto!important}
        .motion-fab,header{display:none!important}`;
      window.scrollTo(0, 0);
    },
    [slug, W, H],
  );
  await page.waitForTimeout(2500);

  // Take over the film's clock: pause everything in the card and find the loop length
  const length = await page.evaluate(() => {
    const el = document.querySelector("[data-recording]");
    const anims = document.getAnimations().filter((a) => el.contains(a.effect?.target ?? null));
    anims.forEach((a) => a.pause());
    window.__rec = anims;
    return Math.max(...anims.map((a) => Number(a.effect.getComputedTiming().duration) || 0));
  });
  const frames = Math.round((length / 1000) * FPS);
  const file = `${out}/${slug}.${phone ? "mp4" : "webm"}`;
  const keep = phone ? fs.mkdtempSync(path.join(os.tmpdir(), `film-${slug}-`)) : null;
  const enc = keep ? null : spawn(ffmpeg, ["-y", "-f", "image2pipe", "-c:v", "mjpeg", "-r", String(FPS), "-i", "pipe:0", "-c:v", "libvpx", "-b:v", RATE, "-crf", "16", "-qmin", "4", "-qmax", "42", "-deadline", "good", "-cpu-used", "1", "-auto-alt-ref", "0", "-an", file], { stdio: ["pipe", "ignore", "pipe"] });
  let errText = "";
  enc?.stderr.on("data", (d) => (errText += d));
  const done = enc ? new Promise((res, rej) => enc.on("close", (code) => (code === 0 ? res() : rej(new Error(errText.slice(-600)))))) : Promise.resolve();

  for (let f = 0; f < frames; f++) {
    await page.evaluate((t) => window.__rec.forEach((a) => (a.currentTime = t)), (f * 1000) / FPS);
    const jpg = await page.screenshot({ type: "jpeg", quality: 92, clip: { x: 0, y: 0, width: W, height: H } });
    if (f === Math.round(frames * 0.3)) fs.writeFileSync(`${out}/${slug}.jpg`, jpg);
    if (keep) fs.writeFileSync(path.join(keep, `${String(f).padStart(5, "0")}.jpg`), jpg);
    else if (!enc.stdin.write(jpg)) await new Promise((r) => enc.stdin.once("drain", r));
  }
  enc?.stdin.end();
  await done;
  if (keep) {
    await encodePhone(keep, slug);
    if (process.env.KEEP_FRAMES) console.log("frames in", keep);
    else fs.rmSync(keep, { recursive: true, force: true });
  }
  await page.evaluate(() => window.__rec.forEach((a) => a.play()));
  const kb = (p) => `${Math.round(fs.statSync(p).size / 1024)} KB`;
  console.log(slug, `${(length / 1000).toFixed(1)}s`, kb(file));
}
await browser.close();
