import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(root, 'src', 'app');
const publicDir = path.join(root, 'public');
const brandDir = path.join(publicDir, 'brand');

const framed = (size) => `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 28 28">
  <rect width="28" height="28" rx="6" fill="#092B44"/>
  <g transform="translate(14 14) scale(0.82) translate(-14 -14)">
    <path d="M3.5 15.75L14 5.25L19.25 9.625V6.125H22.75V12.25L24.5 14V15.75H3.5Z" fill="#2BA8B0"/>
    <path d="M6.125 15.75H21.875V22.75H6.125V15.75Z" fill="#FFFFFF"/>
  </g>
</svg>`;

const writePng = async (size, filePath) => {
  const buf = await sharp(Buffer.from(framed(size))).resize(size, size).png().toBuffer();
  fs.writeFileSync(filePath, buf);
  console.log('wrote', path.relative(root, filePath), buf.length);
  return buf;
};

/** Minimal ICO container wrapping PNG images (Vista+). */
const pngToIco = (pngBuffers) => {
  const count = pngBuffers.length;
  const headerSize = 6 + count * 16;
  let offset = headerSize;
  const entries = pngBuffers.map((png) => {
    const width = png.readUInt32BE(16);
    const height = png.readUInt32BE(20);
    const entry = {
      w: width >= 256 ? 0 : width,
      h: height >= 256 ? 0 : height,
      size: png.length,
      offset,
      png,
    };
    offset += png.length;
    return entry;
  });

  const buf = Buffer.alloc(offset);
  buf.writeUInt16LE(0, 0);
  buf.writeUInt16LE(1, 2);
  buf.writeUInt16LE(count, 4);

  let entryAt = 6;
  for (const entry of entries) {
    buf.writeUInt8(entry.w, entryAt);
    entryAt += 1;
    buf.writeUInt8(entry.h, entryAt);
    entryAt += 1;
    buf.writeUInt8(0, entryAt);
    entryAt += 1;
    buf.writeUInt8(0, entryAt);
    entryAt += 1;
    buf.writeUInt16LE(1, entryAt);
    entryAt += 2;
    buf.writeUInt16LE(32, entryAt);
    entryAt += 2;
    buf.writeUInt32LE(entry.size, entryAt);
    entryAt += 4;
    buf.writeUInt32LE(entry.offset, entryAt);
    entryAt += 4;
  }

  for (const entry of entries) {
    entry.png.copy(buf, entry.offset);
  }
  return buf;
};

const ogSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#092B44"/>
  <g transform="translate(600 270) scale(11) translate(-14 -14)">
    <path d="M3.5 15.75L14 5.25L19.25 9.625V6.125H22.75V12.25L24.5 14V15.75H3.5Z" fill="#2BA8B0"/>
    <path d="M6.125 15.75H21.875V22.75H6.125V15.75Z" fill="#FFFFFF"/>
  </g>
  <text x="600" y="510" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="54" font-weight="700" fill="#FFFFFF">TOONEXPO</text>
</svg>`;

fs.mkdirSync(brandDir, { recursive: true });

await writePng(32, path.join(outDir, 'icon.png'));
await writePng(180, path.join(outDir, 'apple-icon.png'));
await writePng(512, path.join(brandDir, 'icon-512.png'));

const og = await sharp(Buffer.from(ogSvg)).png().toBuffer();
fs.writeFileSync(path.join(outDir, 'opengraph-image.png'), og);
fs.writeFileSync(path.join(outDir, 'twitter-image.png'), og);
fs.writeFileSync(path.join(brandDir, 'og.png'), og);
console.log('wrote opengraph/twitter/og', og.length);

const png16 = await sharp(Buffer.from(framed(16))).resize(16, 16).png().toBuffer();
const png32 = await sharp(Buffer.from(framed(32))).resize(32, 32).png().toBuffer();
const png48 = await sharp(Buffer.from(framed(48))).resize(48, 48).png().toBuffer();
const ico = pngToIco([png16, png32, png48]);
fs.writeFileSync(path.join(outDir, 'favicon.ico'), ico);
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), ico);
console.log('wrote favicon.ico', ico.length);

// Keep SVG as transparent mark for browsers that prefer it.
console.log('done');
