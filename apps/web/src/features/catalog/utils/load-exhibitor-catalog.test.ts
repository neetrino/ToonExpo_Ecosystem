import { describe, expect, it } from 'vitest';
import type { BuilderSummary } from '@toonexpo/contracts';

import { filterBuildersByQuery } from './load-exhibitor-catalog';

const builder = (overrides: Partial<BuilderSummary>): BuilderSummary => ({
  id: 'b1',
  name: 'Acme Build',
  description: null,
  shortDescription: null,
  logoUrl: null,
  coverUrl: null,
  publishedProjectCount: 1,
  phone: null,
  contactPerson: null,
  email: null,
  websiteUrl: null,
  instagramUrl: null,
  facebookUrl: null,
  region: null,
  address: null,
  mediaMaterialsUrl: null,
  advertisingMaterialsUrl: null,
  ...overrides,
});

describe('filterBuildersByQuery', () => {
  it('returns all builders when the query is empty', () => {
    const builders = [builder({ id: 'a' }), builder({ id: 'b' })];
    expect(filterBuildersByQuery(builders, '  ')).toEqual(builders);
  });

  it('matches name, region, and address case-insensitively', () => {
    const builders = [
      builder({ id: 'a', name: 'Arabkir House' }),
      builder({ id: 'b', name: 'Other', region: 'Yerevan' }),
      builder({ id: 'c', name: 'Other', address: 'Northern Avenue' }),
    ];

    expect(filterBuildersByQuery(builders, 'arabkir').map((item) => item.id)).toEqual(['a']);
    expect(filterBuildersByQuery(builders, 'yerevan').map((item) => item.id)).toEqual(['b']);
    expect(filterBuildersByQuery(builders, 'avenue').map((item) => item.id)).toEqual(['c']);
  });
});
