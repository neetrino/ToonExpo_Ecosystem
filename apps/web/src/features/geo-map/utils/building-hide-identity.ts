/**
 * Hide-identity helpers for OSM / OpenFreeMap extrusions.
 *
 * OpenFreeMap liberty buildings usually expose a stable MapLibre feature `id`
 * but often lack an `osm_id` property. The Map POC hides by `["id"]`; we mirror
 * that and persist feature ids in `ProjectMapModel.sourceOsmId` as `mvt:<id>`
 * when a real OSM id is unavailable (no schema change).
 */

export const MVT_FEATURE_HIDE_PREFIX = 'mvt:';

export type BuildingHideIdentity =
  | { kind: 'osm-id'; value: string }
  | { kind: 'feature-id'; value: string | number }
  | { kind: 'none' };

/** Encodes a MapLibre feature id for storage in `sourceOsmId`. */
export const encodeFeatureHideId = (featureId: string | number): string =>
  `${MVT_FEATURE_HIDE_PREFIX}${featureId}`;

const coerceFeatureId = (raw: string): string | number => {
  if (/^-?\d+$/.test(raw)) {
    return Number(raw);
  }
  return raw;
};

/** Parses a stored `sourceOsmId` / hide key into osm vs MVT feature identity. */
export const parseBuildingHideIdentity = (raw: string | null | undefined): BuildingHideIdentity => {
  const trimmed = raw?.trim();
  if (!trimmed) {
    return { kind: 'none' };
  }
  if (trimmed.startsWith(MVT_FEATURE_HIDE_PREFIX)) {
    const rest = trimmed.slice(MVT_FEATURE_HIDE_PREFIX.length).trim();
    if (!rest) {
      return { kind: 'none' };
    }
    return { kind: 'feature-id', value: coerceFeatureId(rest) };
  }
  return { kind: 'osm-id', value: trimmed };
};

/**
 * Prefer real OSM id; otherwise persist the clicked vector feature id so reload
 * can hide exactly one extrusion (not a distance radius).
 */
export const resolveStoredHideIdForPlacement = (input: {
  sourceOsmId: string | null;
  featureId: string | number | null;
}): string | null => {
  const osm = input.sourceOsmId?.trim();
  if (osm) {
    return osm;
  }
  if (input.featureId === null || input.featureId === undefined) {
    return null;
  }
  const text = String(input.featureId).trim();
  if (!text) {
    return null;
  }
  return encodeFeatureHideId(input.featureId);
};

/**
 * MapLibre `["id"]` filters are picky about number vs string — include both
 * variants when the id is numeric (POC parity).
 */
export const expandFeatureIdLiterals = (
  ids: readonly (string | number)[],
): Array<string | number> => {
  const out: Array<string | number> = [];
  const seen = new Set<string>();

  const push = (value: string | number): void => {
    if (typeof value === 'number' && !Number.isFinite(value)) {
      return;
    }
    const key = `${typeof value}:${String(value)}`;
    if (seen.has(key)) {
      return;
    }
    seen.add(key);
    out.push(value);
  };

  for (const raw of ids) {
    if (typeof raw === 'number') {
      push(raw);
      push(String(raw));
      continue;
    }
    const text = raw.trim();
    if (!text) {
      continue;
    }
    push(text);
    if (/^-?\d+$/.test(text)) {
      push(Number(text));
    }
  }

  return out;
};
