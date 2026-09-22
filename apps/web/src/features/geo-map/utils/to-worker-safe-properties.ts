import type { GeoJsonProperties } from 'geojson';

/**
 * Vector-tile `properties` are often `Object.create(null)`.
 * MapLibre worker serialize reads `constructor._classRegistryKey` and throws.
 */
export const toWorkerSafeProperties = (
  properties: GeoJsonProperties | null | undefined,
): Record<string, unknown> => {
  if (!properties) {
    return {};
  }
  try {
    return JSON.parse(JSON.stringify(properties)) as Record<string, unknown>;
  } catch {
    return {};
  }
};
