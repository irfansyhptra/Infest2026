#!/usr/bin/env node
// Regenerates src/app/favicon.ico from the current logo (logo_hero.PNG).
// Next.js App Router serves src/app/favicon.ico at /favicon.ico automatically —
// that's the file actually in use, not public/assets/favicon/favicon.ico.
// Run: node scripts/generate-favicon.mjs
import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";
import pngToIco from "png-to-ico";

const SOURCE_LOGO = join(import.meta.dirname, "..", "public", "assets", "images", "logo_hero.PNG");
const OUTPUT_ICO = join(import.meta.dirname, "..", "src", "app", "favicon.ico");
const SIZES = [16, 32, 48];

// The source logo is a wide lockup with transparent padding around the
// mascot — .trim() crops that off first so the icon isn't tiny and
// off-center once squeezed into a 16px square.
const trimmed = await sharp(SOURCE_LOGO).trim().toBuffer();

const pngBuffers = await Promise.all(
  SIZES.map((size) =>
    sharp(trimmed)
      .resize({
        width: size,
        height: size,
        fit: "contain",
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .png()
      .toBuffer()
  )
);

const icoBuffer = await pngToIco(pngBuffers);
await writeFile(OUTPUT_ICO, icoBuffer);

console.log(`favicon.ico regenerated from logo_hero.PNG (${SIZES.join("/")}px) -> ${OUTPUT_ICO}`);
