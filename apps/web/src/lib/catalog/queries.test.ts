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

import {
  getPublishedApartment,
  getPublishedProjectBySlug,
  getPublishedProjects,
  isValidApartmentId,
} from './queries';

const VALID_APARTMENT_ID = 'clxxxxxxxxxxxxxxxxxx01';

describe('public catalog API queries', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('validates apartment ids before requesting Nest', async () => {
    expect(isValidApartmentId(VALID_APARTMENT_ID)).toBe(true);
    expect(isValidApartmentId('../etc')).toBe(false);
    await expect(
      getPublishedApartment('demo-development', 'sunrise', '../etc'),
    ).resolves.toBeNull();
    expect(mockApiRequest).not.toHaveBeenCalled();
  });

  it('forwards project filters to Nest', async () => {
    mockApiRequest.mockResolvedValue([]);
    await getPublishedProjects({ city: 'Yerevan', builderSlug: 'demo-development' });
    expect(mockApiRequest).toHaveBeenCalledWith(
      '/catalog/projects?city=Yerevan&builder=demo-development',
    );
  });

  it('forwards the session cookie for project prices', async () => {
    mockApiRequest.mockResolvedValue({
      companyId: 'company-1',
      project: {
        id: 'project-1',
        slug: 'sunrise',
        companySlug: 'demo-development',
        companyName: 'Demo Development',
        name: 'Sunrise',
        city: null,
        coverImageUrl: null,
        description: null,
        address: null,
        media: [],
        buildings: [],
        companyDescription: null,
        companyLogoUrl: null,
        companyPhone: null,
        companyEmail: null,
        companyWebsite: null,
        companyCity: null,
        companyAddress: null,
      },
    });
    await getPublishedProjectBySlug('demo-development', 'sunrise', 'toonexpo.sid=token');
    expect(mockApiRequest).toHaveBeenCalledWith(
      '/catalog/projects/demo-development/sunrise',
      { cookie: 'toonexpo.sid=token' },
    );
  });
});
