import { describe, expect, it } from 'vitest';

import {
  PROJECT_PAGE_SIZE,
  buildCatalogFilterHref,
  buildProjectSearchParams,
  mergeLiveCatalogFilters,
  parseProjectFilters,
  parseRoomsFilterValue,
  parseSalesStatusFilter,
  toListProjectsQuery,
} from './project-filters';

describe('parseProjectFilters', () => {
  it('applies defaults', () => {
    expect(parseProjectFilters({})).toEqual({
      page: 1,
      pageSize: PROJECT_PAGE_SIZE,
    });
  });

  it('parses valid filter values', () => {
    expect(
      parseProjectFilters({
        page: '2',
        rooms: '3',
        minPrice: '10000000',
        maxPrice: '90000000',
        salesStatus: 'available',
        city: 'Yerevan',
        builderId: 'builder_company_a',
        q: '  Arabkir Park  ',
      }),
    ).toEqual({
      page: 2,
      pageSize: PROJECT_PAGE_SIZE,
      rooms: [3],
      minPrice: 10_000_000,
      maxPrice: 90_000_000,
      salesStatus: 'available',
      city: 'Yerevan',
      builderId: 'builder_company_a',
      q: 'Arabkir Park',
    });
  });

  it('parses comma-separated rooms', () => {
    expect(parseProjectFilters({ rooms: '1,3,4' }).rooms).toEqual([1, 3, 4]);
  });

  it('ignores invalid salesStatus and non-positive numbers', () => {
    expect(
      parseProjectFilters({
        page: '0',
        rooms: '-1',
        salesStatus: 'pending',
        minPrice: 'abc',
      }),
    ).toEqual({
      page: 1,
      pageSize: PROJECT_PAGE_SIZE,
    });
  });

  it('reads first value from array search params', () => {
    expect(parseProjectFilters({ city: ['Yerevan', 'Gyumri'] }).city).toBe('Yerevan');
  });
});

describe('toListProjectsQuery', () => {
  it('maps filters to API query', () => {
    expect(
      toListProjectsQuery({
        page: 1,
        pageSize: PROJECT_PAGE_SIZE,
        rooms: [2],
        salesStatus: 'reserved',
        q: 'Park',
      }),
    ).toEqual({
      page: 1,
      pageSize: PROJECT_PAGE_SIZE,
      rooms: [2],
      salesStatus: 'reserved',
      q: 'Park',
    });
  });
});

describe('buildProjectSearchParams', () => {
  it('omits default page and pageSize', () => {
    expect(
      buildProjectSearchParams({
        page: 1,
        pageSize: PROJECT_PAGE_SIZE,
        city: 'Yerevan',
        q: 'Arabkir',
      }),
    ).toEqual({ city: 'Yerevan', q: 'Arabkir' });
  });

  it('supports page override for pagination links', () => {
    expect(
      buildProjectSearchParams({ page: 1, pageSize: PROJECT_PAGE_SIZE, rooms: [2, 4] }, 3),
    ).toEqual({ page: '3', rooms: '2,4' });
  });
});

describe('mergeLiveCatalogFilters', () => {
  it('clears a field and resets to page 1', () => {
    expect(
      mergeLiveCatalogFilters(
        {
          page: 3,
          pageSize: PROJECT_PAGE_SIZE,
          city: 'Yerevan',
          rooms: [2],
        },
        { rooms: undefined },
      ),
    ).toEqual({
      page: 1,
      pageSize: PROJECT_PAGE_SIZE,
      city: 'Yerevan',
    });
  });
});

describe('buildCatalogFilterHref', () => {
  it('resets page and builds a shareable href', () => {
    expect(
      buildCatalogFilterHref('/projects', {
        page: 3,
        pageSize: PROJECT_PAGE_SIZE,
        city: 'Yerevan',
      }),
    ).toBe('/projects?city=Yerevan');
  });

  it('returns a bare path when filters are empty', () => {
    expect(
      buildCatalogFilterHref('/apartments', {
        page: 1,
        pageSize: PROJECT_PAGE_SIZE,
      }),
    ).toBe('/apartments');
  });
});

describe('parseRoomsFilterValue', () => {
  it('parses comma-separated room counts', () => {
    expect(parseRoomsFilterValue('1,3,4')).toEqual([1, 3, 4]);
  });

  it('ignores empty and invalid values', () => {
    expect(parseRoomsFilterValue('')).toBeUndefined();
    expect(parseRoomsFilterValue('-1')).toBeUndefined();
  });
});

describe('parseSalesStatusFilter', () => {
  it('accepts known statuses and ignores unknown values', () => {
    expect(parseSalesStatusFilter('available')).toBe('available');
    expect(parseSalesStatusFilter('pending')).toBeUndefined();
  });
});
