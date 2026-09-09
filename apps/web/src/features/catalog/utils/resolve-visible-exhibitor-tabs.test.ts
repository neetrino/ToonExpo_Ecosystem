import { describe, expect, it } from 'vitest';

import {
  resolveExhibitorFilters,
  resolveVisibleExhibitorTabs,
} from './resolve-visible-exhibitor-tabs';

describe('resolveVisibleExhibitorTabs', () => {
  it('keeps the combined tab first, then builders, and skips empty partner types', () => {
    expect(resolveVisibleExhibitorTabs(true, ['it_company', 'bank'])).toEqual([
      'all',
      'builder',
      'bank',
      'it_company',
    ]);
  });

  it('omits builders when none are published', () => {
    expect(resolveVisibleExhibitorTabs(false, ['bank'])).toEqual(['all', 'bank']);
  });

  it('returns no tabs when every category is empty', () => {
    expect(resolveVisibleExhibitorTabs(false, [])).toEqual([]);
  });
});

describe('resolveExhibitorFilters', () => {
  it('keeps the requested tab when it has items', () => {
    expect(resolveExhibitorFilters({ tab: 'bank', page: 2 }, ['builder', 'bank'])).toEqual({
      tab: 'bank',
      page: 2,
    });
  });

  it('falls back to the first visible tab', () => {
    expect(resolveExhibitorFilters({ tab: 'sponsor', page: 3 }, ['bank', 'it_company'])).toEqual({
      tab: 'bank',
      page: 1,
    });
  });

  it('keeps the keyword when falling back to another tab', () => {
    expect(
      resolveExhibitorFilters({ tab: 'sponsor', page: 3, q: 'Ameria' }, ['bank']),
    ).toEqual({
      tab: 'bank',
      page: 1,
      q: 'Ameria',
    });
  });
});
