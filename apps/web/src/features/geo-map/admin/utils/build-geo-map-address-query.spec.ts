import { describe, expect, it } from 'vitest';

import { buildGeoMapAddressQuery } from '@/features/geo-map/admin/utils/build-geo-map-address-query';

describe('buildGeoMapAddressQuery', () => {
  it('joins street, district and city and appends Armenia', () => {
    expect(
      buildGeoMapAddressQuery({
        address: 'Abovyan 1',
        district: 'Kentron',
        city: 'Yerevan',
        locationText: null,
      }),
    ).toBe('Abovyan 1, Kentron, Yerevan, Armenia');
  });

  it('falls back to locationText when structured fields are empty', () => {
    expect(
      buildGeoMapAddressQuery({
        address: '  ',
        district: null,
        city: null,
        locationText: 'Defense Housing',
      }),
    ).toBe('Defense Housing, Armenia');
  });

  it('returns empty when nothing is filled', () => {
    expect(
      buildGeoMapAddressQuery({
        address: null,
        district: null,
        city: null,
        locationText: '',
      }),
    ).toBe('');
  });
});
