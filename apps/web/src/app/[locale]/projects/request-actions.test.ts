import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/auth', () => ({
  auth: vi.fn(),
}));

vi.mock('@/lib/crm/public-request-mutations', () => ({
  submitPublicRequest: vi.fn(),
}));

vi.mock('@/lib/rate-limit', () => ({
  assertIpNotRateLimited: vi.fn(),
}));

import { auth } from '@/auth';
import { submitPublicRequest } from '@/lib/crm/public-request-mutations';
import { assertIpNotRateLimited } from '@/lib/rate-limit';

import { publicRequestFormAction, submitPublicRequestAction } from './request-actions';

const HONEYPOT_FIELD = 'website';

function buildFormData(entries: Record<string, string>): FormData {
  const formData = new FormData();
  for (const [key, value] of Object.entries(entries)) {
    formData.set(key, value);
  }
  return formData;
}

describe('publicRequestFormAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(auth).mockResolvedValue(null as never);
    vi.mocked(submitPublicRequest).mockResolvedValue({ ok: true, dealId: 'deal-1' });
    vi.mocked(assertIpNotRateLimited).mockResolvedValue({ limited: false });
  });

  it('returns success without calling prisma when honeypot is filled', async () => {
    const formData = buildFormData({
      [HONEYPOT_FIELD]: 'https://spam.example',
      projectId: 'project-1',
      name: 'Bot',
      phone: '+37490000000',
      email: 'bot@spam.example',
    });

    const result = await publicRequestFormAction('en', {}, formData);

    expect(result).toEqual({ success: true });
    expect(submitPublicRequest).not.toHaveBeenCalled();
    expect(assertIpNotRateLimited).not.toHaveBeenCalled();
  });

  it('returns rateLimited when the limiter denies', async () => {
    vi.mocked(assertIpNotRateLimited).mockResolvedValue({
      limited: true,
      errorKey: 'rateLimited',
    });

    const formData = buildFormData({
      projectId: 'project-1',
      name: 'Ani',
      phone: '+37491112233',
      email: 'ani@example.com',
    });

    const result = await publicRequestFormAction('en', {}, formData);

    expect(result).toEqual({ errorKey: 'rateLimited' });
    expect(submitPublicRequest).not.toHaveBeenCalled();
  });

  it('delegates valid submissions to submitPublicRequest', async () => {
    const formData = buildFormData({
      projectId: 'project-1',
      name: 'Ani',
      phone: '+37491112233',
      email: 'ani@example.com',
      message: 'Hello',
    });

    const result = await publicRequestFormAction('en', {}, formData);

    expect(result).toEqual({ success: true });
    expect(submitPublicRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        projectId: 'project-1',
        name: 'Ani',
        email: 'ani@example.com',
      }),
    );
  });

  it('does not attach buyerUserId for authenticated non-buyer sessions', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { id: 'builder-1', role: 'BUILDER', email: 'builder@example.com' },
    } as never);

    const formData = buildFormData({
      projectId: 'project-1',
      name: 'Builder',
      phone: '+37491112233',
      email: 'builder@example.com',
    });

    await publicRequestFormAction('en', {}, formData);

    expect(submitPublicRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        buyerUserId: undefined,
      }),
    );
  });
});

describe('submitPublicRequestAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(submitPublicRequest).mockResolvedValue({ ok: true, dealId: 'deal-1' });
    vi.mocked(assertIpNotRateLimited).mockResolvedValue({ limited: false });
  });

  it('forwards input to submitPublicRequest', async () => {
    const input = {
      projectId: 'project-1',
      name: 'Ani',
      phone: '+37491112233',
      email: 'ani@example.com',
    };

    await submitPublicRequestAction(input);

    expect(submitPublicRequest).toHaveBeenCalledWith(input);
  });

  it('returns success without calling submitPublicRequest when honeypot is filled', async () => {
    const result = await submitPublicRequestAction({
      projectId: 'project-1',
      name: 'Bot',
      phone: '+37490000000',
      email: 'bot@spam.example',
      website: 'https://spam.example',
    });

    expect(result).toEqual({ ok: true, dealId: 'honeypot-suppressed' });
    expect(submitPublicRequest).not.toHaveBeenCalled();
  });
});
