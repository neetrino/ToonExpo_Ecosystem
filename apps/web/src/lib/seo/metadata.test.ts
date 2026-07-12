import { describe, expect, it } from 'vitest';

import {
  buildAbsoluteUrl,
  buildEntityDescription,
  buildEntityTitle,
  truncateSeoText,
} from './metadata';
import {
  buildApartmentJsonLd,
  buildBuilderOrganizationJsonLd,
  buildPartnerOrganizationJsonLd,
  buildProjectRealEstateListingJsonLd,
} from './json-ld';

describe('seo metadata helpers', () => {
  it('truncates long descriptions with an ellipsis', () => {
    const long = 'a'.repeat(200);
    const result = truncateSeoText(long, 20);
    expect(result).toBe(`${'a'.repeat(19)}…`);
    expect(result?.length).toBe(20);
  });

  it('builds absolute URLs without double slashes', () => {
    expect(buildAbsoluteUrl('https://toonexpo.com/', '/en/projects/x/y')).toBe(
      'https://toonexpo.com/en/projects/x/y',
    );
  });

  it('builds titles and fallback descriptions', () => {
    expect(buildEntityTitle('Sunrise', 'Demo Co')).toBe('Sunrise · Demo Co · ToonExpo');
    expect(buildEntityDescription(null, 'Fallback copy')).toBe('Fallback copy');
  });
});

describe('seo json-ld helpers', () => {
  const appUrl = 'https://toonexpo.com';

  it('builds RealEstateListing for projects', () => {
    const jsonLd = buildProjectRealEstateListingJsonLd({
      locale: 'en',
      appUrl,
      project: {
        id: 'p1',
        slug: 'sunrise',
        companySlug: 'demo',
        companyName: 'Demo Co',
        name: 'Sunrise',
        city: 'Yerevan',
        coverImageUrl: null,
        description: 'A riverside project.',
        address: 'Main 1',
        media: [],
        buildings: [],
        companyDescription: null,
        companyLogoUrl: null,
        companyPhone: null,
        companyEmail: null,
        companyWebsite: null,
        companyCity: null,
        companyAddress: null,
      },
    });

    expect(jsonLd['@type']).toBe('RealEstateListing');
    expect(jsonLd.name).toBe('Sunrise');
    expect(jsonLd.url).toBe('https://toonexpo.com/en/projects/demo/sunrise');
  });

  it('builds Apartment json-ld with optional offer', () => {
    const jsonLd = buildApartmentJsonLd({
      locale: 'en',
      appUrl,
      apartment: {
        id: 'apt-1',
        code: 'A-101',
        status: 'AVAILABLE',
        areaSqm: 72,
        rooms: 2,
        priceVisibility: 'PUBLIC',
        priceDisplay: 'AMOUNT',
        priceAmd: 45_000_000,
        matterportUrl: null,
        buildingName: 'Block A',
        floorName: '1',
        media: [],
        project: {
          id: 'p1',
          name: 'Sunrise',
          slug: 'sunrise',
          companySlug: 'demo',
          companyName: 'Demo Co',
          companyId: 'c1',
        },
      },
    });

    expect(jsonLd['@type']).toBe('Apartment');
    expect(jsonLd.numberOfRooms).toBe(2);
    expect(jsonLd.offers).toEqual(
      expect.objectContaining({
        '@type': 'Offer',
        price: 45_000_000,
        priceCurrency: 'AMD',
      }),
    );
  });

  it('builds Organization json-ld for partners and builders', () => {
    const partner = buildPartnerOrganizationJsonLd(
      {
        id: 'pt1',
        name: 'Converse Bank',
        slug: 'converse',
        type: 'BANK',
        logoUrl: null,
        description: 'Mortgage partner',
        phone: '+37410000000',
        email: 'info@example.com',
        website: 'https://bank.example',
        serviceCategories: [],
        bankOffers: [],
      },
      'en',
      appUrl,
    );
    expect(partner['@type']).toBe('Organization');
    expect(partner.url).toBe('https://bank.example');

    const builder = buildBuilderOrganizationJsonLd(
      {
        id: 'b1',
        name: 'Demo Co',
        slug: 'demo',
        logoUrl: null,
        city: 'Yerevan',
        description: null,
        publishedProjectCount: 2,
        phone: null,
        email: null,
        website: null,
        address: null,
        projects: [],
      },
      'hy',
      appUrl,
    );
    expect(builder['@type']).toBe('Organization');
    expect(builder.url).toBe('https://toonexpo.com/hy/builders/demo');
  });
});
