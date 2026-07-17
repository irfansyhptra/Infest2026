#!/usr/bin/env node
// Converts every .jpg/.jpeg in public/assets/images/ (non-recursive) to .webp.
// Also caps the long edge at MAX_DIMENSION — the source JPGs here are raw
// camera exports (up to 6000px wide); serving that as page-weight for a bento
// grid tile a few hundred px wide is pure waste, format change alone isn't
// "optimized". Run: node scripts/convert-to-webp.mjs
import { readdir, stat } from "node:fs/promises";
import { extname, join, basename } from "node:path";
import sharp from "sharp";

const IMAGES_DIR = join(import.meta.dirname, "..", "public", "assets", "images");
const MAX_DIMENSION = 1600; // long edge, px — plenty for a 2-col bento tile at 2x DPI
const QUALITY = 80;

const files = await readdir(IMAGES_DIR);
const jpgs = files.filter((f) => [".jpg", ".jpeg"].includes(extname(f).toLowerCase()));

if (jpgs.length === 0) {
  console.log("No .jpg/.jpeg files found in", IMAGES_DIR);
  process.exit(0);
}

for (const file of jpgs) {
  const inputPath = join(IMAGES_DIR, file);
  const outputPath = join(IMAGES_DIR, `${basename(file, extname(file))}.webp`);

  await sharp(inputPath)
    .resize({ width: MAX_DIMENSION, height: MAX_DIMENSION, fit: "inside", withoutEnlargement: true })
    .webp({ quality: QUALITY })
    .toFile(outputPath);

  const [{ size: inputSize }, { size: outputSize }] = await Promise.all([
    stat(inputPath),
    stat(outputPath),
  ]);
  console.log(
    `${file} -> ${basename(outputPath)}  (${(inputSize / 1024).toFixed(0)}KB -> ${(outputSize / 1024).toFixed(0)}KB)`
  );
}
