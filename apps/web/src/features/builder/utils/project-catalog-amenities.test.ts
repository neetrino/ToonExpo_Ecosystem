import { describe, expect, it } from 'vitest';

import {
  catalogFormSliceToJson,
  catalogJsonToFormSlice,
  emptyProjectCatalogFormSlice,
} from '@/features/builder/utils/project-catalog-amenities';

describe('project-catalog-amenities', () => {
  it('round-trips localized details, labels, nearby, and links', () => {
    const amenities = {
      details: {
        propertyType: { hy: 'Բնակելի', en: 'Residential' },
        apartmentsCount: '12',
      },
      labels: {
        hy: ['Կայանատեղի'],
        en: ['Parking'],
      },
      links: {
        website: 'https://example.com',
      },
    };
    const nearbyPlaces = {
      places: {
        hy: ['Արագած'],
        en: ['Aragats'],
      },
    };

    const slice = catalogJsonToFormSlice(amenities, nearbyPlaces);
    expect(slice.catalogDetails.propertyType.hy).toBe('Բնակելի');
    expect(slice.catalogDetails.propertyType.en).toBe('Residential');
    expect(slice.catalogDetails.apartmentsCount.hy).toBe('12');
    expect(slice.amenityLabelsHy).toBe('Կայանատեղի');
    expect(slice.amenityLabelsEn).toBe('Parking');
    expect(slice.nearbyPlacesHy).toBe('Արագած');
    expect(slice.catalogLinks.website).toBe('https://example.com');

    const written = catalogFormSliceToJson(slice);
    expect(written.amenities).toMatchObject({
      details: {
        propertyType: { hy: 'Բնակելի', en: 'Residential' },
        apartmentsCount: { hy: '12' },
      },
      labels: {
        hy: ['Կայանատեղի'],
        en: ['Parking'],
      },
      links: {
        website: 'https://example.com',
      },
    });
    expect(written.nearbyPlaces).toEqual({
      places: {
        hy: ['Արագած'],
        en: ['Aragats'],
      },
    });
  });

  it('returns null JSON when the form slice is empty', () => {
    const written = catalogFormSliceToJson(emptyProjectCatalogFormSlice());
    expect(written.amenities).toBeNull();
    expect(written.nearbyPlaces).toBeNull();
  });
});
