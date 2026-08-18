import { describe, expect, it } from 'vitest';

import {
  buildGeoMapAddressQuery,
  formatGeoMapSiteAddress,
  nextGeoMapSearchQueryAfterLookup,
} from '@/features/geo-map/admin/utils/build-geo-map-address-query';

describe('formatGeoMapSiteAddress', () => {
  it('keeps the filled project address without appending Armenia', () => {
    expect(
      formatGeoMapSiteAddress({
        address: 'Նորաշեն 6, երկար հայերեն նկարագրություն',
        district: 'Աջափնյակ',
        city: 'Երևան',
        locationText: null,
      }),
    ).toBe('Նորաշեն 6, երկար հայերեն նկարագրություն, Աջափնյակ, Երևան');
  });
});

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

describe('nextGeoMapSearchQueryAfterLookup', () => {
  it('clears the search when it still matches the lookup query', () => {
    expect(nextGeoMapSearchQueryAfterLookup('norashen 6', 'norashen 6')).toBe('');
  });

  it('keeps later typing if the lookup was for an older query', () => {
    expect(nextGeoMapSearchQueryAfterLookup('norashen 6a', 'norashen 6')).toBe('norashen 6a');
  });
});
