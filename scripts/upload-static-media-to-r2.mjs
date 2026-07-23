/**
 * Uploads apps/web/public/demo and public/images assets to Cloudflare R2.
 * Usage (from repo root):
 *   node --env-file=.env scripts/upload-static-media-to-r2.mjs
 */
import { createRequire } from 'node:module';
import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(path.join(ROOT, 'apps/api/package.json'));
const { PutObjectCommand, S3Client } = require('@aws-sdk/client-s3');

const WEB_PUBLIC = path.join(ROOT, 'apps/web/public');
const UPLOAD_DIRS = ['demo', 'images'];
const ALLOWED_EXTENSIONS = new Set(['.webp', '.png', '.jpg', '.jpeg', '.avif', '.svg']);

const CONTENT_TYPES = {
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.avif': 'image/avif',
  '.svg': 'image/svg+xml',
};

const requiredEnv = [
  'R2_ACCOUNT_ID',
  'R2_ACCESS_KEY_ID',
  'R2_SECRET_ACCESS_KEY',
  'R2_BUCKET_NAME',
  'R2_PUBLIC_URL',
];

const missing = requiredEnv.filter((key) => !process.env[key]?.trim());
if (missing.length > 0) {
  console.error(`Missing env: ${missing.join(', ')}`);
  process.exit(1);
}

const accountId = process.env.R2_ACCOUNT_ID.trim();
const bucketName = process.env.R2_BUCKET_NAME.trim();
const publicBase = process.env.R2_PUBLIC_URL.trim().replace(/\/$/, '');

const client = new S3Client({
  region: 'auto',
  endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID.trim(),
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY.trim(),
  },
});

const listFilesRecursive = async (dirAbsolute, relativePrefix) => {
  const entries = await readdir(dirAbsolute, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const absolute = path.join(dirAbsolute, entry.name);
    const relative = path.posix.join(relativePrefix, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await listFilesRecursive(absolute, relative)));
      continue;
    }
    const extension = path.extname(entry.name).toLowerCase();
    if (!ALLOWED_EXTENSIONS.has(extension)) {
      console.log(`skip ${relative}`);
      continue;
    }
    files.push({ absolute, key: relative, extension });
  }

  return files;
};

const uploadFile = async ({ absolute, key, extension }) => {
  const body = await readFile(absolute);
  const contentType = CONTENT_TYPES[extension] ?? 'application/octet-stream';
  await client.send(
    new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: body,
      ContentType: contentType,
      CacheControl: 'public, max-age=31536000, immutable',
    }),
  );
  console.log(`ok  ${publicBase}/${key} (${body.byteLength} bytes)`);
};

const main = async () => {
  const allFiles = [];

  for (const dirName of UPLOAD_DIRS) {
    const absoluteDir = path.join(WEB_PUBLIC, dirName);
    const info = await stat(absoluteDir).catch(() => null);
    if (!info?.isDirectory()) {
      console.warn(`missing directory: ${absoluteDir}`);
      continue;
    }
    allFiles.push(...(await listFilesRecursive(absoluteDir, dirName)));
  }

  console.log(`Uploading ${allFiles.length} files to r2://${bucketName} …`);
  for (const file of allFiles) {
    await uploadFile(file);
  }
  console.log('Done.');
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
