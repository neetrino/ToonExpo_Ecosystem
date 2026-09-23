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
        slogan: { hy: 'Ապրիր լավ', en: 'Live well' },
      },
      labels: {
        hy: ['Կայանատեղի'],
        en: ['Parking'],
      },
      gallery: ['https://cdn.example.com/render-1.webp', 'https://cdn.example.com/render-2.webp'],
      links: {
        website: 'https://example.com',
        floorplans2d: 'https://example.com/plans-2d',
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
    expect(slice.catalogDetails.apartmentsCount).toEqual({ hy: '12', ru: '12', en: '12' });
    expect(slice.catalogDetails.slogan.hy).toBe('Ապրիր լավ');
    expect(slice.catalogLinks.floorplans2d).toBe('https://example.com/plans-2d');
    expect(slice.catalogGallery).toBe(
      'https://cdn.example.com/render-1.webp\nhttps://cdn.example.com/render-2.webp',
    );
    expect(slice.amenityLabelsHy).toBe('Կայանատեղի');
    expect(slice.amenityLabelsEn).toBe('Parking');
    expect(slice.nearbyPlacesHy).toBe('Արագած');
    expect(slice.catalogLinks.website).toBe('https://example.com');

    const written = catalogFormSliceToJson(slice);
    expect(written.amenities).toMatchObject({
      details: {
        propertyType: { hy: 'Բնակելի', en: 'Residential' },
        apartmentsCount: '12',
        slogan: { hy: 'Ապրիր լավ', en: 'Live well' },
      },
      labels: {
        hy: ['Կայանատեղի'],
        en: ['Parking'],
      },
      gallery: ['https://cdn.example.com/render-1.webp', 'https://cdn.example.com/render-2.webp'],
      links: {
        website: 'https://example.com',
        floorplans2d: 'https://example.com/plans-2d',
      },
    });
    expect(written.nearbyPlaces).toEqual({
      places: {
        hy: ['Արագած'],
        en: ['Aragats'],
      },
    });
  });

  it('stores a price once even when older locale copies differ', () => {
    const slice = catalogJsonToFormSlice(
      {
        details: {
          pricePerSqmMin: { hy: '420000', ru: '1', en: '2' },
          unitPriceMin: { en: '28000000' },
        },
      },
      null,
    );
    expect(slice.catalogDetails.pricePerSqmMin).toEqual({
      hy: '420000',
      ru: '420000',
      en: '420000',
    });
    expect(slice.catalogDetails.unitPriceMin).toEqual({
      hy: '28000000',
      ru: '28000000',
      en: '28000000',
    });
    expect(catalogFormSliceToJson(slice).amenities).toMatchObject({
      details: {
        pricePerSqmMin: '420000',
        unitPriceMin: '28000000',
      },
    });
  });

  it('round-trips construction timeline stage dates', () => {
    const slice = catalogJsonToFormSlice(
      {
        timelineStageDates: {
          preSale: '01/2024',
          foundation: '06/2024',
          structure: '01/2025',
        },
      },
      null,
    );
    expect(slice.timelineStageDates.preSale).toBe('01/2024');
    expect(slice.timelineStageDates.foundation).toBe('06/2024');
    expect(slice.timelineStageDates.structure).toBe('01/2025');
    expect(slice.timelineStageDates.facade).toBe('');
    expect(catalogFormSliceToJson(slice).amenities).toEqual({
      timelineStageDates: {
        preSale: '01/2024',
        foundation: '06/2024',
        structure: '01/2025',
      },
    });
  });

  it('returns null JSON when the form slice is empty', () => {
    const written = catalogFormSliceToJson(emptyProjectCatalogFormSlice());
    expect(written.amenities).toBeNull();
    expect(written.nearbyPlaces).toBeNull();
  });
});
