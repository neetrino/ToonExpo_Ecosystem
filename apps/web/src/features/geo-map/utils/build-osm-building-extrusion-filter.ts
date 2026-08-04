/**
 * Builds the MapLibre filter that hides OSM `building-3d` features under
 * placed GLB models.
 *
 * Key invariant: identity keys are NEVER applied globally. MVT feature ids in
 * public OpenMapTiles / OpenFreeMap tiles are only unique per tile, so a bare
 * `["in", ["id"], …]` filter also hid unrelated buildings on other streets
 * that happened to share the id. Every identity clause is therefore scoped to
 * a small radius around the placement anchor:
 *
 *   hide(feature) = (id matches) AND (feature within scopeRadius of anchor)
 *
 * Targets without any identity fall back to a tight distance-only mask.
 */

import type { Point } from 'geojson';

import {
  expandFeatureIdLiterals,
  parseBuildingHideIdentity,
} from '@/features/geo-map/utils/building-hide-identity';

/** One building to hide: anchor + best-known identity. */
export type OsmBuildingHideTarget = {
  longitude: number;
  latitude: number;
  /** Real OSM id when tiles expose it (stable, but still kept scoped). */
  osmId?: string | null | undefined;
  /** MVT feature id — only unique per tile, must stay distance-scoped. */
  featureId?: string | number | null | undefined;
};

export type OsmBuildingHideRadii = {
  /** Radius that scopes an identity match around the anchor (meters). */
  scopeRadiusMeters: number;
  /** Distance-only fallback radius for targets without identity (meters). */
  fallbackRadiusMeters: number;
};

/** MapLibre expression fragment (structural typing is done by MapLibre itself). */
export type OsmBuildingHideExpression = readonly unknown[];

const distanceBelowRadius = (
  longitude: number,
  latitude: number,
  radiusMeters: number,
): OsmBuildingHideExpression => {
  const point: Point = { type: 'Point', coordinates: [longitude, latitude] };
  return ['<', ['distance', point], radiusMeters];
};

const osmIdMatch = (osmId: string): OsmBuildingHideExpression => [
  '==',
  ['to-string', ['get', 'osm_id']],
  osmId,
];

const featureIdMatch = (featureId: string | number): OsmBuildingHideExpression | null => {
  const literals = expandFeatureIdLiterals([featureId]);
  if (literals.length === 0) {
    return null;
  }
  return ['in', ['id'], ['literal', literals]];
};

/**
 * Converts a stored model row into a hide target.
 * `sourceOsmId` may hold a real OSM id or an encoded `mvt:<featureId>`.
 */
export const modelToOsmBuildingHideTarget = (model: {
  longitude: number;
  latitude: number;
  sourceOsmId?: string | null | undefined;
}): OsmBuildingHideTarget => {
  const identity = parseBuildingHideIdentity(model.sourceOsmId);
  return {
    longitude: model.longitude,
    latitude: model.latitude,
    osmId: identity.kind === 'osm-id' ? identity.value : null,
    featureId: identity.kind === 'feature-id' ? identity.value : null,
  };
};

/** Positive match expression for one target (true = feature must be hidden). */
const buildTargetMatch = (
  target: OsmBuildingHideTarget,
  radii: OsmBuildingHideRadii,
): OsmBuildingHideExpression => {
  const scope = distanceBelowRadius(target.longitude, target.latitude, radii.scopeRadiusMeters);

  const osmId = target.osmId?.trim();
  if (osmId) {
    return ['all', osmIdMatch(osmId), scope];
  }

  if (target.featureId !== null && target.featureId !== undefined) {
    const idMatch = featureIdMatch(target.featureId);
    if (idMatch) {
      return ['all', idMatch, scope];
    }
  }

  return distanceBelowRadius(target.longitude, target.latitude, radii.fallbackRadiusMeters);
};

/**
 * Combined hide filter for `building-3d`. Returns `null` when there is nothing
 * to hide (caller should clear the layer filter).
 */
export const buildOsmBuildingHideFilter = (
  targets: readonly OsmBuildingHideTarget[],
  radii: OsmBuildingHideRadii,
): OsmBuildingHideExpression | null => {
  if (radii.scopeRadiusMeters <= 0 || radii.fallbackRadiusMeters <= 0) {
    throw new Error('hide radii must be positive');
  }
  if (targets.length === 0) {
    return null;
  }

  const matches = targets.map((target) => buildTargetMatch(target, radii));
  const first = matches[0];
  if (matches.length === 1 && first) {
    return ['!', first];
  }
  return ['!', ['any', ...matches]];
};
