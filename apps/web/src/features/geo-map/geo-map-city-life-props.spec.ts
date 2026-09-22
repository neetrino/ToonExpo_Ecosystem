import { describe, expect, it } from 'vitest';

import { GEO_MAP_CITY_LIFE_PROPS } from '@/features/geo-map/geo-map-city-life-props';

describe('GEO_MAP_CITY_LIFE_PROPS', () => {
  it('keeps trees and traffic on so public maps match admin', () => {
    expect(GEO_MAP_CITY_LIFE_PROPS.greenCanopyEnabled).toBe(true);
    expect(GEO_MAP_CITY_LIFE_PROPS.roadTrafficEnabled).toBe(true);
  });
});
