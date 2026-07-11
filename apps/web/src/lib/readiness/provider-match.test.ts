import { describe, expect, it } from 'vitest';

import { filterProvidersForServiceCategory, partnerMatchesServiceCategory } from './provider-match';

const PIXEL = {
  id: 'p1',
  name: 'PixelRender Studio',
  slug: 'pixelrender-studio',
  serviceCategories: ['photography', 'render_studio', 'video_production'],
  phone: null,
  email: null,
  website: 'https://example.com/pixelrender-studio',
  description: 'Render studio',
};

const OTHER = {
  id: 'p2',
  name: 'Copy Desk',
  slug: 'copy-desk',
  serviceCategories: ['copywriting'],
  phone: null,
  email: null,
  website: null,
  description: null,
};

describe('partnerMatchesServiceCategory', () => {
  it('matches when the key is in serviceCategories', () => {
    expect(partnerMatchesServiceCategory(PIXEL.serviceCategories, 'render_studio')).toBe(true);
  });

  it('returns false for null key or non-matching key', () => {
    expect(partnerMatchesServiceCategory(PIXEL.serviceCategories, null)).toBe(false);
    expect(partnerMatchesServiceCategory(PIXEL.serviceCategories, 'copywriting')).toBe(false);
  });
});

describe('filterProvidersForServiceCategory', () => {
  it('returns only partners matching the service category key', () => {
    const result = filterProvidersForServiceCategory([PIXEL, OTHER], 'render_studio');
    expect(result).toEqual([PIXEL]);
  });

  it('returns empty when key is missing', () => {
    expect(filterProvidersForServiceCategory([PIXEL, OTHER], null)).toEqual([]);
  });
});
