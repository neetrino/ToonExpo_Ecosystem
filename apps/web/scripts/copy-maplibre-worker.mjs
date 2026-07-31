#!/usr/bin/env node
/**
 * Copies MapLibre CSP worker into `public/` so production/Turbopack builds
 * load a same-origin worker instead of a broken serialized blob worker.
 */
import { copyFileSync, mkdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const packageRoot = path.dirname(fileURLToPath(import.meta.url));
const webRoot = path.resolve(packageRoot, '..');
const maplibreRoot = path.dirname(require.resolve('maplibre-gl/package.json'));
const distDir = path.join(maplibreRoot, 'dist');
const outDir = path.join(webRoot, 'public', 'maplibre');

mkdirSync(outDir, { recursive: true });

for (const fileName of [
  'maplibre-gl-csp-worker.js',
  'maplibre-gl-csp-worker.js.map',
]) {
  copyFileSync(path.join(distDir, fileName), path.join(outDir, fileName));
}

console.info('[web] Synced MapLibre CSP worker to public/maplibre/');
