/**
 * Uploads marketing static assets to Cloudflare R2.
 * Bytes live only in R2 (not in `apps/web/public`). To add/replace assets:
 *   1. Put files under `media/static/demo` and/or `media/static/images`
 *   2. Run `pnpm media:upload-static`
 *   3. Keep `media/static` out of git (see `.gitignore`)
 *
 * Usage (from repo root):
 *   pnpm media:upload-static
 */
import { createRequire } from 'node:module';
import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(path.join(ROOT, 'apps/api/package.json'));
const { PutObjectCommand, S3Client } = require('@aws-sdk/client-s3');

const STAGING_ROOT = path.join(ROOT, 'media', 'static');
const LEGACY_PUBLIC = path.join(ROOT, 'apps', 'web', 'public');
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

const resolveSourceRoot = async () => {
  const stagingInfo = await stat(STAGING_ROOT).catch(() => null);
  if (stagingInfo?.isDirectory()) {
    return STAGING_ROOT;
  }
  return LEGACY_PUBLIC;
};

const main = async () => {
  const sourceRoot = await resolveSourceRoot();
  const allFiles = [];

  for (const dirName of UPLOAD_DIRS) {
    const absoluteDir = path.join(sourceRoot, dirName);
    const info = await stat(absoluteDir).catch(() => null);
    if (!info?.isDirectory()) {
      console.warn(`missing directory: ${absoluteDir}`);
      continue;
    }
    allFiles.push(...(await listFilesRecursive(absoluteDir, dirName)));
  }

  if (allFiles.length === 0) {
    console.error(
      `No files found under ${path.join(sourceRoot, '{demo,images}')}.\n` +
        'Place assets in media/static/demo and media/static/images, then re-run.',
    );
    process.exit(1);
  }

  console.log(`Uploading ${allFiles.length} files from ${sourceRoot} → r2://${bucketName} …`);
  for (const file of allFiles) {
    await uploadFile(file);
  }
  console.log('Done.');
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
