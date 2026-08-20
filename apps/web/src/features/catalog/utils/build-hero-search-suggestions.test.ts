import { describe, expect, it } from 'vitest';

import { buildHeroSearchSuggestions } from './build-hero-search-suggestions';
import type { ProjectListItem } from '@toonexpo/contracts';

const project = (overrides: Partial<ProjectListItem> & Pick<ProjectListItem, 'id' | 'name'>): ProjectListItem => ({
  slug: overrides.slug ?? overrides.name.toLowerCase().replace(/\s+/g, '-'),
  shortDescription: null,
  locationText: null,
  address: null,
  city: overrides.city ?? null,
  district: null,
  latitude: null,
  longitude: null,
  cover: null,
  builder: overrides.builder ?? {
    id: 'builder_1',
    name: 'Acme Build',
    logoUrl: null,
  },
  availability: { total: 1, available: 1, reserved: 0, sold: 0 },
  minPrice: null,
  maxPrice: null,
  priceCurrency: null,
  priceOnRequest: false,
  ...overrides,
});

describe('buildHeroSearchSuggestions', () => {
  const projects = [
    project({ id: 'p1', name: 'Arabkir Park Homes', city: 'Yerevan' }),
    project({
      id: 'p2',
      name: 'Gyumri Lofts',
      city: 'Gyumri',
      builder: { id: 'builder_2', name: 'Northern Dev', logoUrl: null },
    }),
  ];

  it('returns empty for blank query', () => {
    expect(buildHeroSearchSuggestions(projects, '   ')).toEqual([]);
  });

  it('matches projects, builders, and cities', () => {
    const byProject = buildHeroSearchSuggestions(projects, 'arabkir');
    expect(byProject[0]).toMatchObject({
      kind: 'project',
      label: 'Arabkir Park Homes',
      href: '/projects/p1',
    });

    const byBuilder = buildHeroSearchSuggestions(projects, 'northern');
    expect(byBuilder.some((item) => item.kind === 'builder' && item.label === 'Northern Dev')).toBe(
      true,
    );

    const byCity = buildHeroSearchSuggestions(projects, 'yerevan');
    expect(byCity.some((item) => item.kind === 'city' && item.label === 'Yerevan')).toBe(true);
  });
});
