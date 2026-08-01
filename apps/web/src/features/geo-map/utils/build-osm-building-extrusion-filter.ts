/**
 * Builds a MapLibre filter that hides OSM `building-3d` features near placed
 * models (distance) and/or by stable `osm_id` when known.
 *
 * Returns `null` when there is nothing to hide (caller should clear the filter).
 */

export type OsmExtrusionFilterPoint = {
  longitude: number;
  latitude: number;
};

export type OsmBuildingHideInput = {
  longitude: number;
  latitude: number;
  sourceOsmId?: string | null | undefined;
};

/** Admin session hides (no DB) merged into the building-3d filter. */
export type OsmBuildingExtrusionFilterExtras = {
  hiddenOsmIds?: readonly string[] | undefined;
  hiddenDistancePoints?: readonly OsmExtrusionFilterPoint[] | undefined;
};

type DistanceClause = readonly ['<', readonly ['distance', GeoJSON.Point], number];
type OsmIdExclusion = readonly [
  '!',
  readonly [
    'in',
    readonly ['to-string', readonly ['get', 'osm_id']],
    readonly ['literal', string[]],
  ],
];
type DistanceExclusion =
  readonly ['!', DistanceClause] | readonly ['!', readonly ['any', ...DistanceClause[]]];

export type OsmBuildingExtrusionFilter =
  | DistanceExclusion
  | OsmIdExclusion
  | readonly ['all', ...ReadonlyArray<DistanceExclusion | OsmIdExclusion>];

const distanceBelowRadius = (
  longitude: number,
  latitude: number,
  radiusMeters: number,
): DistanceClause => [
  '<',
  [
    'distance',
    {
      type: 'Point',
      coordinates: [longitude, latitude],
    },
  ],
  radiusMeters,
];

const buildDistanceExclusion = (
  points: readonly OsmExtrusionFilterPoint[],
  radiusMeters: number,
): DistanceExclusion | null => {
  if (points.length === 0) {
    return null;
  }

  if (points.length === 1) {
    const only = points[0];
    if (!only) {
      return null;
    }
    return ['!', distanceBelowRadius(only.longitude, only.latitude, radiusMeters)];
  }

  const clauses = points.map((point) =>
    distanceBelowRadius(point.longitude, point.latitude, radiusMeters),
  ) as [DistanceClause, ...DistanceClause[]];

  return ['!', ['any', ...clauses]];
};

const buildOsmIdExclusion = (osmIds: readonly string[]): OsmIdExclusion | null => {
  if (osmIds.length === 0) {
    return null;
  }
  return ['!', ['in', ['to-string', ['get', 'osm_id']], ['literal', [...osmIds]]]];
};

/**
 * Legacy distance-only helper (kept for existing call sites / tests).
 */
export const buildOsmBuildingExtrusionFilter = (
  points: readonly OsmExtrusionFilterPoint[],
  radiusMeters: number,
): OsmBuildingExtrusionFilter | null => {
  if (radiusMeters <= 0) {
    throw new Error('radiusMeters must be positive');
  }
  return buildDistanceExclusion(points, radiusMeters);
};

/**
 * Preferred hide filter: merge `osm_id` exclusions with distance mask around
 * models that lack a stable OSM id (or for all models as a safety net).
 */
export const buildCombinedOsmBuildingExtrusionFilter = (
  models: readonly OsmBuildingHideInput[],
  radiusMeters: number,
  extras?: OsmBuildingExtrusionFilterExtras,
): OsmBuildingExtrusionFilter | null => {
  if (radiusMeters <= 0) {
    throw new Error('radiusMeters must be positive');
  }

  const osmIds = [
    ...new Set(
      [
        ...models.map((model) => model.sourceOsmId?.trim()),
        ...(extras?.hiddenOsmIds ?? []).map((id) => id.trim()),
      ].filter((id): id is string => Boolean(id && id.length > 0)),
    ),
  ];

  // Always keep distance mask for models without osm_id; also keep it for all
  // anchors so tiles missing osm_id still clear under the GLB.
  const distancePoints = [
    ...models.map((model) => ({
      longitude: model.longitude,
      latitude: model.latitude,
    })),
    ...(extras?.hiddenDistancePoints ?? []),
  ];

  const distanceFilter = buildDistanceExclusion(distancePoints, radiusMeters);
  const osmFilter = buildOsmIdExclusion(osmIds);

  if (!distanceFilter && !osmFilter) {
    return null;
  }
  if (distanceFilter && osmFilter) {
    return ['all', distanceFilter, osmFilter];
  }
  return distanceFilter ?? osmFilter;
};
