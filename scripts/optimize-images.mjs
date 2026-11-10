import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const inputDir = path.join(process.cwd(), "images");
const outputDir = path.join(inputDir, "optimized");
await fs.mkdir(outputDir, { recursive: true });
const supported = new Set([".jpg", ".jpeg", ".png"]);
let count = 0;
for (const entry of await fs.readdir(inputDir, { withFileTypes: true })) {
  if (!entry.isFile()) continue;
  const ext = path.extname(entry.name).toLowerCase();
  if (!supported.has(ext)) continue;
  const source = path.join(inputDir, entry.name);
  const target = path.join(outputDir, path.basename(entry.name, ext) + ".webp");
  await sharp(source, { failOn: "none" })
    .rotate()
    .resize({ width: 1200, height: 1200, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 90, effort: 5 })
    .toFile(target);
  const [before, after] = await Promise.all([fs.stat(source), fs.stat(target)]);
  console.log(entry.name + ": " + Math.round(before.size / 1024) + " KB -> " + Math.round(after.size / 1024) + " KB WebP");
  count++;
}
console.log("Optimized " + count + " original images. Originals were not changed.");
