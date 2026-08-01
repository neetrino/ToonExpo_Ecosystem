import type { GeoMapObject } from '@/features/geo-map/types';
import { buildCirclePolygonRing } from '@/features/geo-map/utils/model-footprint-polygon';

export type ModelFootprintFeatureCollection = GeoJSON.FeatureCollection<GeoJSON.Polygon>;

export const EMPTY_MODEL_FOOTPRINT_GEOJSON: ModelFootprintFeatureCollection = {
  type: 'FeatureCollection',
  features: [],
};

/**
 * Builds a GeoJSON FeatureCollection of circular footprint polygons for the
 * given map objects (typically viewport-visible GLB models).
 */
export const buildModelFootprintGeoJson = (
  objects: readonly Pick<GeoMapObject, 'id' | 'longitude' | 'latitude'>[],
  radiusMeters: number,
  segmentCount: number,
): ModelFootprintFeatureCollection => ({
  type: 'FeatureCollection',
  features: objects.map((object) => {
    const ring = buildCirclePolygonRing(
      object.longitude,
      object.latitude,
      radiusMeters,
      segmentCount,
    );
    return {
      type: 'Feature',
      id: object.id,
      properties: { objectId: object.id },
      geometry: {
        type: 'Polygon',
        coordinates: [ring.map((point) => [point[0], point[1]])],
      },
    };
  }),
});
