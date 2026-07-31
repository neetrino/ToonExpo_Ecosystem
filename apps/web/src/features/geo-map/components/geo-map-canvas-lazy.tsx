'use client';

import dynamic from 'next/dynamic';

/**
 * `GeoMapCanvas`, pre-wrapped with `next/dynamic` (`ssr: false`) so consumers
 * don't have to. MapLibre/deck.gl touch `window`/WebGL and cannot render on the server.
 */
export const GeoMapCanvasLazy = dynamic(
  () => import('@/features/geo-map/components/geo-map-canvas').then((mod) => mod.GeoMapCanvas),
  { ssr: false },
);
