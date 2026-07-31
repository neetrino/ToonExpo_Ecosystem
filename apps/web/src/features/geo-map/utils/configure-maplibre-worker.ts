import { setWorkerUrl } from 'maplibre-gl';

/**
 * Public path for the MapLibre v6 tile worker (and its sibling shared chunk),
 * populated by `apps/web/scripts/copy-maplibre-worker.mjs`.
 */
export const MAPLIBRE_WORKER_PUBLIC_URL = '/maplibre/maplibre-gl-worker.mjs';

let hasConfiguredWorker = false;

/**
 * Ensures MapLibre's tile-parsing worker URL is set once before any `Map` is created.
 * Required under Next.js bundling — without this, the style loads but vector tiles never render.
 */
export const configureMaplibreWorker = (): void => {
  if (hasConfiguredWorker || typeof window === 'undefined') {
    return;
  }

  setWorkerUrl(MAPLIBRE_WORKER_PUBLIC_URL);
  hasConfiguredWorker = true;
};
