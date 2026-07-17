import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockApiRequest = vi.fn();

vi.mock('@/lib/api', () => ({
  apiRequest: (...args: unknown[]) => mockApiRequest(...args),
}));

import {
  isMortgagePageEnabled,
  loadPlatformContactSettings,
  resolveContactWithDefaults,
} from './platform-settings';

describe('public platform settings API queries', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockApiRequest.mockResolvedValue({
      contact: { email: 'hello@toonexpo.com', phone: '+37410123456' },
      mortgagePageEnabled: false,
    });
  });

  it('loads contact settings from Nest', async () => {
    await expect(loadPlatformContactSettings()).resolves.toEqual({
      email: 'hello@toonexpo.com',
      phone: '+37410123456',
    });
    expect(mockApiRequest).toHaveBeenCalledWith('/catalog/platform-settings');
  });

  it('loads mortgage visibility from Nest', async () => {
    await expect(isMortgagePageEnabled()).resolves.toBe(false);
  });
});

describe('resolveContactWithDefaults', () => {
  it('fills unset contact values from localized defaults', () => {
    expect(
      resolveContactWithDefaults(
        { email: null, phone: null },
        { email: 'default@toonexpo.com', phone: '+37400000000' },
      ),
    ).toEqual({
      email: 'default@toonexpo.com',
      phone: '+37400000000',
    });
  });
});
