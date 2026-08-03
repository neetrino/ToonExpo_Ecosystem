/**
 * MapLibre GL JS v6 ships the tile worker as a separate ESM file that imports a
 * sibling `maplibre-gl-shared.mjs`. Bundlers (webpack/Turbopack) do not emit that
 * pair automatically, so tiles never parse. Copy both files into `public/maplibre/`
 * and point `setWorkerUrl` at the public worker path (see configure-maplibre-worker.ts).
 *
 * @see https://maplibre.org/maplibre-gl-js/docs/ (ESM / webpack installation)
 */
import { copyFileSync, mkdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const webRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const publicDir = join(webRoot, 'public', 'maplibre');

const WORKER_FILES = ['maplibre-gl-worker.mjs', 'maplibre-gl-shared.mjs'];

mkdirSync(publicDir, { recursive: true });

for (const fileName of WORKER_FILES) {
  const source = require.resolve(`maplibre-gl/dist/${fileName}`);
  copyFileSync(source, join(publicDir, fileName));
}

console.info(`[copy-maplibre-worker] Copied ${WORKER_FILES.join(', ')} → public/maplibre/`);
