import { describe, expect, it } from 'vitest';

import { filterListingsByProjectId } from '@/features/catalog/utils/filter-listings-by-project';

const listings = [
  { id: 'a1', projectId: 'proj-a' },
  { id: 'a2', projectId: 'proj-a' },
  { id: 'b1', projectId: 'proj-b' },
];

describe('filterListingsByProjectId', () => {
  it('returns all listings when projectId is null', () => {
    expect(filterListingsByProjectId(listings, null)).toEqual(listings);
  });

  it('returns only listings for the selected project', () => {
    expect(filterListingsByProjectId(listings, 'proj-a')).toEqual([
      { id: 'a1', projectId: 'proj-a' },
      { id: 'a2', projectId: 'proj-a' },
    ]);
  });

  it('returns an empty array when no listing matches', () => {
    expect(filterListingsByProjectId(listings, 'missing')).toEqual([]);
  });

  it('returns a shallow copy when unfiltered', () => {
    const result = filterListingsByProjectId(listings, null);
    expect(result).not.toBe(listings);
    expect(result).toEqual(listings);
  });
});
