import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import sharp from 'sharp';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outDir = path.join(root, 'src', 'app');
const publicDir = path.join(root, 'public');
const brandDir = path.join(publicDir, 'brand');

/** Full green lockup — source of truth for favicon / app icons. */
const MARK_SOURCE = path.join(brandDir, 'toon-expo-logo-pill.png');

const writePngFromMark = async (size, filePath) => {
  const buf = await sharp(MARK_SOURCE)
    .resize(size, size, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();
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

if (!fs.existsSync(MARK_SOURCE)) {
  throw new Error(`Missing mark source: ${MARK_SOURCE}`);
}

fs.mkdirSync(brandDir, { recursive: true });

await writePngFromMark(32, path.join(outDir, 'icon.png'));
await writePngFromMark(32, path.join(publicDir, 'icon.png'));
await writePngFromMark(180, path.join(outDir, 'apple-icon.png'));
await writePngFromMark(180, path.join(publicDir, 'apple-icon.png'));

const png16 = await sharp(MARK_SOURCE)
  .resize(16, 16, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png()
  .toBuffer();
const png32 = await sharp(MARK_SOURCE)
  .resize(32, 32, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png()
  .toBuffer();
const png48 = await sharp(MARK_SOURCE)
  .resize(48, 48, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png()
  .toBuffer();
const ico = pngToIco([png16, png32, png48]);
fs.writeFileSync(path.join(outDir, 'favicon.ico'), ico);
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), ico);
console.log('wrote favicon.ico', ico.length);

console.log('done');
