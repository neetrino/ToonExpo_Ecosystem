import { beforeEach, describe, expect, it, vi } from 'vitest';

import { revalidateCatalogPaths } from './revalidate-catalog-paths';

describe('revalidateCatalogPaths', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('is a no-op isomorphic helper after direct Nest browser auth', () => {
    expect(() => revalidateCatalogPaths({ companySlug: 'demo-development' })).not.toThrow();
    expect(() =>
      revalidateCatalogPaths({
        companySlug: 'demo-development',
        projectSlug: 'sunrise-residence',
      }),
    ).not.toThrow();
  });
});
