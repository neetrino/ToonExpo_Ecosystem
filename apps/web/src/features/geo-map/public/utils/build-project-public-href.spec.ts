import { describe, expect, it } from 'vitest';

import { buildProjectPublicHref } from '@/features/geo-map/public/utils/build-project-public-href';

describe('buildProjectPublicHref', () => {
  it('builds the catalog project detail path', () => {
    expect(buildProjectPublicHref('defans-hauzing-test')).toBe('/projects/defans-hauzing-test');
  });
});
