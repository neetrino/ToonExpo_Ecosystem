import { describe, expect, it } from 'vitest';

import {
  buildExhibitorTabHref,
  buildPartnerSearchParams,
  parsePartnerFilters,
} from './partner-filters';

describe('parsePartnerFilters', () => {
  it('defaults to the builders tab', () => {
    expect(parsePartnerFilters({})).toEqual({ page: 1, tab: 'builder' });
  });

  it('parses a partner type tab', () => {
    expect(parsePartnerFilters({ type: 'bank', page: '2' })).toEqual({
      page: 2,
      tab: 'bank',
    });
  });

  it('falls back to builders for unknown types', () => {
    expect(parsePartnerFilters({ type: 'unknown' }).tab).toBe('builder');
  });

  it('uses the first value from a legacy comma list', () => {
    expect(parsePartnerFilters({ type: 'it_company,bank' }).tab).toBe('it_company');
  });
});

describe('buildPartnerSearchParams', () => {
  it('always includes the active tab', () => {
    expect(buildPartnerSearchParams({ page: 1, tab: 'builder' }, 1)).toEqual({
      type: 'builder',
    });
    expect(buildPartnerSearchParams({ page: 1, tab: 'bank' }, 3)).toEqual({
      type: 'bank',
      page: '3',
    });
  });
});

describe('buildExhibitorTabHref', () => {
  it('links to the builders tab without a page', () => {
    expect(buildExhibitorTabHref('builder')).toBe('/partners?type=builder');
  });
});
