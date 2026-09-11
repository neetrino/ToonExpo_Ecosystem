import { describe, expect, it } from 'vitest';

import {
  MAPLIBRE_WORKER_PUBLIC_URL,
  MAPLIBRE_WORKER_VERSION,
} from '@/features/geo-map/utils/configure-maplibre-worker';

describe('configureMaplibreWorker', () => {
  it('cache-busts the public worker with the installed MapLibre version', () => {
    expect(MAPLIBRE_WORKER_VERSION).toBe('6.2.0');
    expect(MAPLIBRE_WORKER_PUBLIC_URL).toBe('/maplibre/maplibre-gl-worker.mjs?v=6.2.0');
  });
});
