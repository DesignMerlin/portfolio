// Puts the launch film together: the rendered frames (compose.mjs) and the soundtrack (audio.mjs), as H.264
// MP4 with AAC audio, ready for LinkedIn, X and the site. Writes .launch-film/psalmuhel-launch-film.mp4.
//
// The whole film, start to finish (the site running on :3000):
//   node scripts/launch-film/record.mjs && node scripts/launch-film/compose.mjs \
//     && node scripts/launch-film/audio.mjs && node scripts/launch-film/encode.mjs
import { spawnSync } from "node:child_process";
import ffmpeg from "ffmpeg-static";
import { FPS } from "./edit.mjs";

const out = ".launch-film/psalmuhel-launch-film.mp4";
const r = spawnSync(
  ffmpeg,
  [
    "-y",
    "-framerate", String(FPS),
    "-i", ".launch-film/frames/%05d.jpg",
    "-i", ".launch-film/audio.wav",
    "-c:v", "libx264", "-preset", "slow", "-crf", "17", "-profile:v", "high", "-level", "4.1", "-pix_fmt", "yuv420p",
    "-c:a", "aac", "-b:a", "192k",
    "-movflags", "+faststart",
    "-shortest",
    out,
  ],
  { stdio: ["ignore", "ignore", "pipe"] },
);
if (r.status !== 0) {
  console.error(r.stderr.toString().slice(-1200));
  process.exit(1);
}
console.log("wrote", out);
