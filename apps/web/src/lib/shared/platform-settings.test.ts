import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockFindMany = vi.fn();
const mockFindUnique = vi.fn();

vi.mock('@toonexpo/db', () => ({
  prisma: {
    platformSetting: {
      findMany: (...args: unknown[]) => mockFindMany(...args),
      findUnique: (...args: unknown[]) => mockFindUnique(...args),
    },
  },
}));

import {
  isMortgagePageEnabled,
  loadPlatformContactSettings,
  resolveContactWithDefaults,
} from './platform-settings';

describe('loadPlatformContactSettings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFindMany.mockResolvedValue([]);
  });

  it('returns null contact fields when settings are unset', async () => {
    const result = await loadPlatformContactSettings();

    expect(result).toEqual({ email: null, phone: null });
  });

  it('returns stored contact values when present', async () => {
    mockFindMany.mockResolvedValue([
      { key: 'CONTACT_EMAIL', value: 'hello@toonexpo.com' },
      { key: 'CONTACT_PHONE', value: '+37410123456' },
    ]);

    const result = await loadPlatformContactSettings();

    expect(result).toEqual({
      email: 'hello@toonexpo.com',
      phone: '+37410123456',
    });
  });
});

describe('resolveContactWithDefaults', () => {
  it('falls back to i18n defaults when settings are unset', () => {
    const resolved = resolveContactWithDefaults(
      { email: null, phone: null },
      { email: 'default@toonexpo.com', phone: '+37400000000' },
    );

    expect(resolved).toEqual({
      email: 'default@toonexpo.com',
      phone: '+37400000000',
    });
  });

  it('prefers stored settings over defaults', () => {
    const resolved = resolveContactWithDefaults(
      { email: 'set@toonexpo.com', phone: '+37411111111' },
      { email: 'default@toonexpo.com', phone: '+37400000000' },
    );

    expect(resolved).toEqual({
      email: 'set@toonexpo.com',
      phone: '+37411111111',
    });
  });
});

describe('isMortgagePageEnabled', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('defaults to enabled when setting is unset', async () => {
    mockFindUnique.mockResolvedValue(null);

    await expect(isMortgagePageEnabled()).resolves.toBe(true);
  });

  it('returns false when MORTGAGE_PAGE_ENABLED is false', async () => {
    mockFindUnique.mockResolvedValue({ value: 'false' });

    await expect(isMortgagePageEnabled()).resolves.toBe(false);
  });

  it('returns true when MORTGAGE_PAGE_ENABLED is true', async () => {
    mockFindUnique.mockResolvedValue({ value: 'true' });

    await expect(isMortgagePageEnabled()).resolves.toBe(true);
  });
});
