/**
 * `npm run logos` : rasterise les SVG de `public/` en PNG et génère le favicon.
 * Les SVG sont la source, ne jamais retoucher un PNG à la main.
 */
import sharp from "sharp";
import { Buffer } from "node:buffer";
import { copyFile, readFile, writeFile } from "node:fs/promises";

const PUBLIC = new URL("../public/", import.meta.url);
const APP = new URL("../src/app/", import.meta.url);

const EXPORTS: { source: string; sizes: number[] }[] = [
  { source: "logo-mark.svg", sizes: [32, 64, 180, 192, 256, 384, 512, 1024] },
  { source: "logo-mark-light.svg", sizes: [256, 512] },
  { source: "logo.svg", sizes: [600, 1200] },
  { source: "logo-light.svg", sizes: [600, 1200] },
];

async function main() {
  for (const { source, sizes } of EXPORTS) {
    const svg = await readFile(new URL(source, PUBLIC));
    for (const width of sizes) {
      const name = source.replace(".svg", `-${width}.png`);
      // Sans density élevée, sharp rastérise à 72 ppp puis agrandit : bords flous.
      const png = await sharp(svg, { density: 384 })
        .resize({ width })
        .png({ compressionLevel: 9 })
        .toBuffer();
      await writeFile(new URL(name, PUBLIC), png);
      console.log(`${name}  ${(png.length / 1024).toFixed(1)} ko`);
    }
  }

  await copyFile(new URL("logo-mark-512.png", PUBLIC), new URL("icon.png", APP));
  await copyFile(new URL("logo-mark-180.png", PUBLIC), new URL("apple-icon.png", APP));
  console.log("src/app/icon.png, src/app/apple-icon.png");
}

/** sharp ne produit pas d'ICO : on écrit l'en-tête et on y encapsule les PNG. */
async function buildFavicon() {
  const sizes = [16, 32, 48];
  const svg = await readFile(new URL("logo-mark.svg", PUBLIC));
  const images = await Promise.all(
    sizes.map((size) =>
      sharp(svg, { density: 384 }).resize({ width: size, height: size }).png().toBuffer(),
    ),
  );

  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // réservé
  header.writeUInt16LE(1, 2); // type 1 = icône
  header.writeUInt16LE(sizes.length, 4);

  let offset = 6 + 16 * sizes.length;
  const entries = images.map((png, i) => {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(sizes[i] === 256 ? 0 : sizes[i], 0);
    entry.writeUInt8(sizes[i] === 256 ? 0 : sizes[i], 1);
    entry.writeUInt8(0, 2); // palette
    entry.writeUInt8(0, 3); // réservé
    entry.writeUInt16LE(1, 4); // plans de couleur
    entry.writeUInt16LE(32, 6); // bits par pixel
    entry.writeUInt32LE(png.length, 8);
    entry.writeUInt32LE(offset, 12);
    offset += png.length;
    return entry;
  });

  const ico = Buffer.concat([header, ...entries, ...images]);
  await writeFile(new URL("favicon.ico", APP), ico);
  console.log(`favicon.ico  ${(ico.length / 1024).toFixed(1)} ko`);
}

void main().then(buildFavicon);
