// Contact sheet of a plate (or the final frames): every Nth frame, small, in a grid. For checking by eye
const sharp = require("sharp");
const fs = require("fs");
const [dir, out, every = "15"] = process.argv.slice(2);
(async () => {
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".jpg")).sort().filter((_, i) => i % +every === 0);
  const W = 384, H = 216;
  const tiles = await Promise.all(files.map((f) => sharp(`${dir}/${f}`).resize(W, H, { fit: "cover" }).toBuffer()));
  const cols = 4;
  await sharp({ create: { width: cols * (W + 4), height: Math.ceil(tiles.length / cols) * (H + 4), channels: 3, background: "#f0f" } })
    .composite(tiles.map((b, i) => ({ input: b, left: (i % cols) * (W + 4), top: Math.floor(i / cols) * (H + 4) })))
    .jpeg({ quality: 80 })
    .toFile(out);
  console.log(files.length, "tiles");
})();
