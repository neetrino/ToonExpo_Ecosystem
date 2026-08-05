import { describe, expect, it } from 'vitest';

import { formatGeoMapAddressLine } from '@/features/geo-map/utils/format-geo-map-address-line';

describe('formatGeoMapAddressLine', () => {
  it('joins street address with the city', () => {
    expect(
      formatGeoMapAddressLine({ address: 'Baghramyan 26', district: 'Kentron', city: 'Yerevan' }),
    ).toBe('Baghramyan 26 · Yerevan');
  });

  it('falls back to the district when there is no city', () => {
    expect(
      formatGeoMapAddressLine({ address: 'Charents 33', district: 'Kentron', city: null }),
    ).toBe('Charents 33 · Kentron');
  });

  it('uses district and city when the street address is missing', () => {
    expect(formatGeoMapAddressLine({ address: '  ', district: 'Avan', city: 'Yerevan' })).toBe(
      'Avan · Yerevan',
    );
  });

  it('returns null without any location data', () => {
    expect(formatGeoMapAddressLine({ address: null, district: null, city: null })).toBeNull();
  });
});
