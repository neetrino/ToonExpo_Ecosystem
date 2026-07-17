import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockApiRequest = vi.fn();

vi.mock('@/lib/api', () => ({
  apiRequest: (...args: unknown[]) => mockApiRequest(...args),
  ApiClientError: class ApiClientError extends Error {
    constructor(readonly status: number) {
      super('API error');
    }
  },
}));

import { getPublicBuilderBySlug, getPublicBuilders } from './queries';

describe('builder public API queries', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('loads builder listings from Nest', async () => {
    mockApiRequest.mockResolvedValue([]);
    await expect(getPublicBuilders()).resolves.toEqual([]);
    expect(mockApiRequest).toHaveBeenCalledWith('/catalog/builders');
  });

  it('loads builder detail by encoded slug', async () => {
    mockApiRequest.mockResolvedValue({
      id: 'builder-1',
      name: 'Builder',
      slug: 'builder',
      logoUrl: null,
      city: null,
      description: null,
      publishedProjectCount: 1,
      phone: null,
      email: null,
      website: null,
      address: null,
      projects: [],
    });
    await getPublicBuilderBySlug('builder');
    expect(mockApiRequest).toHaveBeenCalledWith('/catalog/builders/builder');
  });
});
