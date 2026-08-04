import { describe, expect, it } from 'vitest';

import {
  encodeFeatureHideId,
  expandFeatureIdLiterals,
  parseBuildingHideIdentity,
  resolveStoredHideIdForPlacement,
} from '@/features/geo-map/utils/building-hide-identity';

describe('building-hide-identity', () => {
  it('encodes and parses MapLibre feature hide keys', () => {
    expect(encodeFeatureHideId(123)).toBe('mvt:123');
    expect(parseBuildingHideIdentity('mvt:123')).toEqual({
      kind: 'feature-id',
      value: 123,
    });
  });

  it('parses real osm ids', () => {
    expect(parseBuildingHideIdentity('582962758')).toEqual({
      kind: 'osm-id',
      value: '582962758',
    });
  });

  it('prefers osm id over feature id when placing', () => {
    expect(
      resolveStoredHideIdForPlacement({
        sourceOsmId: '111',
        featureId: 999,
      }),
    ).toBe('111');
  });

  it('falls back to encoded feature id when osm id is missing', () => {
    expect(
      resolveStoredHideIdForPlacement({
        sourceOsmId: null,
        featureId: 999,
      }),
    ).toBe('mvt:999');
  });

  it('expands numeric feature ids to number and string literals', () => {
    expect(expandFeatureIdLiterals([42])).toEqual([42, '42']);
  });
});
