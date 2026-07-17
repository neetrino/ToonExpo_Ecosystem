import { describe, expect, it, vi } from 'vitest';

vi.mock('../../common/env', () => ({
  loadApiEnv: () => ({
    NODE_ENV: 'development',
    APP_URL: 'http://localhost:3000',
    API_URL: 'http://localhost:4000',
  }),
}));

import { CSRF_COOKIE_NAME } from './auth.constants';
import { AuthController } from './auth.controller';
import { createCsrfToken } from './csrf-token';

describe('AuthController.getCsrf', () => {
  const controller = new AuthController({} as never, {} as never);

  it('reuses an existing valid CSRF cookie without rewriting it', () => {
    const existing = createCsrfToken();
    const res = { cookie: vi.fn() };
    const req = { cookies: { [CSRF_COOKIE_NAME]: existing } };

    const result = controller.getCsrf(req as never, res as never);

    expect(result).toEqual({ csrfToken: existing });
    expect(res.cookie).not.toHaveBeenCalled();
  });

  it('issues a new CSRF cookie when none exists', () => {
    const res = { cookie: vi.fn() };
    const req = { cookies: {} };

    const result = controller.getCsrf(req as never, res as never);

    expect(result.csrfToken.length).toBeGreaterThanOrEqual(16);
    expect(res.cookie).toHaveBeenCalledWith(
      CSRF_COOKIE_NAME,
      result.csrfToken,
      expect.objectContaining({ httpOnly: false, path: '/' }),
    );
  });

  it('stays stable when two tabs request CSRF with the same cookie', () => {
    const shared = createCsrfToken();
    const resA = { cookie: vi.fn() };
    const resB = { cookie: vi.fn() };
    const req = { cookies: { [CSRF_COOKIE_NAME]: shared } };

    const tabA = controller.getCsrf(req as never, resA as never);
    const tabB = controller.getCsrf(req as never, resB as never);

    expect(tabA.csrfToken).toBe(shared);
    expect(tabB.csrfToken).toBe(shared);
    expect(resA.cookie).not.toHaveBeenCalled();
    expect(resB.cookie).not.toHaveBeenCalled();
  });
});
