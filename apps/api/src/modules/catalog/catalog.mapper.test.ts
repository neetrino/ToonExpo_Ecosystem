import { describe, expect, it } from 'vitest';

import { mapApartmentDetail } from './catalog.mapper';

const apartmentRow = {
  id: 'clxxxxxxxxxxxxxxxxxx01',
  code: '202',
  status: 'AVAILABLE' as const,
  areaSqm: 110,
  rooms: 4,
  priceAmd: 85_000_000,
  priceVisibility: 'VISIBLE_AFTER_LOGIN' as const,
  matterportUrl: null,
  media: [],
  floor: {
    name: 'Floor 2',
    building: {
      name: 'Tower A',
      project: {
        id: 'project-1',
        name: 'Sunrise Residence',
        slug: 'sunrise-residence',
        companyId: 'company-1',
        company: { slug: 'demo-development', name: 'Demo Development' },
      },
    },
  },
};

describe('catalog response mapping', () => {
  it('removes login-protected prices from anonymous responses', () => {
    const apartment = mapApartmentDetail(apartmentRow, false);
    expect(apartment.priceDisplay).toBe('LOGIN_REQUIRED');
    expect(apartment.priceAmd).toBeNull();
  });

  it('includes login-protected prices for authenticated sessions', () => {
    const apartment = mapApartmentDetail(apartmentRow, true);
    expect(apartment.priceDisplay).toBe('AMOUNT');
    expect(apartment.priceAmd).toBe(85_000_000);
  });
});
