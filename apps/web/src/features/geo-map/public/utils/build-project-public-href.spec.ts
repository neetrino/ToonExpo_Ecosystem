import { describe, expect, it } from 'vitest';

import {
  buildApartmentPublicHref,
  buildProjectPublicHref,
} from '@/features/geo-map/public/utils/build-project-public-href';

describe('buildProjectPublicHref', () => {
  it('builds the catalog project detail path', () => {
    expect(buildProjectPublicHref('defans-hauzing-test')).toBe('/projects/defans-hauzing-test');
  });
});

describe('buildApartmentPublicHref', () => {
  it('builds the catalog apartment detail path from slug', () => {
    expect(buildApartmentPublicHref('defans-hauzing-test-unit-1-abc123')).toBe(
      '/apartments/defans-hauzing-test-unit-1-abc123',
    );
  });
});
