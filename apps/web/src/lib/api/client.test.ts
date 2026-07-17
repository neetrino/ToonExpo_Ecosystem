import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/api/base-url', () => ({
  buildApiUrl: (path: string) => `http://api.test${path.startsWith('/') ? path : `/${path}`}`,
  resolveApiBaseUrl: () => 'http://api.test',
}));

import {
  apiRequest,
  clearCachedBrowserCsrfToken,
} from './client';
import type { ApiClientError } from './errors';

const CSRF_HEADER = 'x-csrf-token';

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('apiRequest CSRF handling', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    clearCachedBrowserCsrfToken();
    vi.stubGlobal('window', {});
    vi.stubGlobal('document', { cookie: '' });
    vi.stubGlobal('fetch', fetchMock);
    fetchMock.mockReset();
  });

  afterEach(() => {
    clearCachedBrowserCsrfToken();
    vi.unstubAllGlobals();
  });

  it('fetches CSRF once and sends it on mutations', async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse(200, { csrfToken: 'csrf-token-aaaaaaaa' }))
      .mockResolvedValueOnce(jsonResponse(200, { ok: true }));

    await expect(
      apiRequest<{ ok: boolean }>('/auth/login', {
        method: 'POST',
        body: { email: 'a@example.com', password: 'sup3rsecret' },
      }),
    ).resolves.toEqual({ ok: true });

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[0]?.[0]).toBe('http://api.test/auth/csrf');
    const mutationInit = fetchMock.mock.calls[1]?.[1] as RequestInit;
    expect(mutationInit.credentials).toBe('include');
    expect((mutationInit.headers as Record<string, string>)[CSRF_HEADER]).toBe(
      'csrf-token-aaaaaaaa',
    );
  });

  it('recovers from a stale cached token with exactly one retry', async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse(200, { csrfToken: 'stale-token-bbbbbbbb' }))
      .mockResolvedValueOnce(
        jsonResponse(403, { code: 'CSRF_REJECTED', message: 'CSRF token missing or invalid' }),
      )
      .mockResolvedValueOnce(jsonResponse(200, { csrfToken: 'fresh-token-cccccccc' }))
      .mockResolvedValueOnce(jsonResponse(200, { user: { id: 'u1' } }));

    await expect(
      apiRequest<{ user: { id: string } }>('/auth/login', {
        method: 'POST',
        body: { email: 'a@example.com', password: 'sup3rsecret' },
      }),
    ).resolves.toEqual({ user: { id: 'u1' } });

    expect(fetchMock).toHaveBeenCalledTimes(4);
    const firstMutation = fetchMock.mock.calls[1]?.[1] as RequestInit;
    const retryMutation = fetchMock.mock.calls[3]?.[1] as RequestInit;
    expect((firstMutation.headers as Record<string, string>)[CSRF_HEADER]).toBe(
      'stale-token-bbbbbbbb',
    );
    expect((retryMutation.headers as Record<string, string>)[CSRF_HEADER]).toBe(
      'fresh-token-cccccccc',
    );
  });

  it('does not retry indefinitely when CSRF keeps failing', async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse(200, { csrfToken: 'bad-token-dddddddd' }))
      .mockResolvedValueOnce(
        jsonResponse(403, { code: 'CSRF_REJECTED', message: 'CSRF token missing or invalid' }),
      )
      .mockResolvedValueOnce(jsonResponse(200, { csrfToken: 'still-bad-eeeeeeee' }))
      .mockResolvedValueOnce(
        jsonResponse(403, { code: 'CSRF_REJECTED', message: 'CSRF token missing or invalid' }),
      );

    await expect(
      apiRequest('/auth/logout', { method: 'POST' }),
    ).rejects.toMatchObject({
      code: 'CSRF_REJECTED',
      status: 403,
    } satisfies Partial<ApiClientError>);

    expect(fetchMock).toHaveBeenCalledTimes(4);
  });

  it('does not CSRF-retry non-CSRF failures', async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse(200, { csrfToken: 'csrf-token-ffffffff' }))
      .mockResolvedValueOnce(
        jsonResponse(401, { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' }),
      );

    await expect(
      apiRequest('/auth/login', {
        method: 'POST',
        body: { email: 'a@example.com', password: 'wrong' },
      }),
    ).rejects.toMatchObject({ code: 'INVALID_CREDENTIALS', status: 401 });

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('sends CSRF for register and logout mutations', async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse(200, { csrfToken: 'csrf-token-gggggggg' }))
      .mockResolvedValueOnce(jsonResponse(201, { user: { id: 'u2' } }))
      .mockResolvedValueOnce(new Response(null, { status: 204 }));

    await expect(
      apiRequest('/auth/register', {
        method: 'POST',
        body: { email: 'b@example.com', password: 'sup3rsecret', name: 'Bea' },
      }),
    ).resolves.toEqual({ user: { id: 'u2' } });

    await expect(apiRequest('/auth/logout', { method: 'POST' })).resolves.toBeUndefined();

    expect(fetchMock).toHaveBeenCalledTimes(3);
    const registerInit = fetchMock.mock.calls[1]?.[1] as RequestInit;
    const logoutInit = fetchMock.mock.calls[2]?.[1] as RequestInit;
    expect((registerInit.headers as Record<string, string>)[CSRF_HEADER]).toBe(
      'csrf-token-gggggggg',
    );
    expect((logoutInit.headers as Record<string, string>)[CSRF_HEADER]).toBe(
      'csrf-token-gggggggg',
    );
  });
});
