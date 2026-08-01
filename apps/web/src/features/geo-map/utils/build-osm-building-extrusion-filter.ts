/**
 * Builds a MapLibre filter that hides OSM `building-3d` features within
 * `radiusMeters` of any model anchor point (via the `distance` expression).
 *
 * Returns `null` when there are no points (caller should clear the filter).
 */
export type OsmExtrusionFilterPoint = {
  longitude: number;
  latitude: number;
};

export type OsmBuildingExtrusionFilter =
  | readonly ['!', readonly ['<', readonly ['distance', GeoJSON.Point], number]]
  | readonly [
      '!',
      readonly [
        'any',
        ...ReadonlyArray<readonly ['<', readonly ['distance', GeoJSON.Point], number]>,
      ],
    ];

const distanceBelowRadius = (
  longitude: number,
  latitude: number,
  radiusMeters: number,
): readonly ['<', readonly ['distance', GeoJSON.Point], number] => [
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

export const buildOsmBuildingExtrusionFilter = (
  points: readonly OsmExtrusionFilterPoint[],
  radiusMeters: number,
): OsmBuildingExtrusionFilter | null => {
  if (points.length === 0) {
    return null;
  }
  if (radiusMeters <= 0) {
    throw new Error('radiusMeters must be positive');
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
  ) as [
    readonly ['<', readonly ['distance', GeoJSON.Point], number],
    ...ReadonlyArray<readonly ['<', readonly ['distance', GeoJSON.Point], number]>,
  ];

  return ['!', ['any', ...clauses]];
};
