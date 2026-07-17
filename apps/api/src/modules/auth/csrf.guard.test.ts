import { ForbiddenException, type ExecutionContext } from '@nestjs/common';
import { describe, expect, it } from 'vitest';

import { CSRF_COOKIE_NAME, CSRF_HEADER_NAME } from './auth.constants';
import { createCsrfToken } from './csrf-token';
import { CsrfGuard } from './csrf.guard';

function createContext(input: {
  method: string;
  cookie?: string;
  header?: string | string[];
}): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => ({
        method: input.method,
        cookies: input.cookie === undefined ? {} : { [CSRF_COOKIE_NAME]: input.cookie },
        headers: input.header === undefined ? {} : { [CSRF_HEADER_NAME]: input.header },
      }),
    }),
  } as ExecutionContext;
}

describe('CsrfGuard', () => {
  const guard = new CsrfGuard();

  it('allows safe methods without tokens', () => {
    expect(guard.canActivate(createContext({ method: 'GET' }))).toBe(true);
    expect(guard.canActivate(createContext({ method: 'HEAD' }))).toBe(true);
    expect(guard.canActivate(createContext({ method: 'OPTIONS' }))).toBe(true);
  });

  it('accepts matching cookie and header for login/logout/register-style mutations', () => {
    const token = createCsrfToken();
    for (const method of ['POST', 'PUT', 'PATCH', 'DELETE'] as const) {
      expect(
        guard.canActivate(
          createContext({ method, cookie: token, header: token }),
        ),
      ).toBe(true);
    }
  });

  it('rejects missing CSRF on mutations', () => {
    expect(() => guard.canActivate(createContext({ method: 'POST' }))).toThrow(ForbiddenException);
    try {
      guard.canActivate(createContext({ method: 'POST' }));
    } catch (error) {
      expect(error).toBeInstanceOf(ForbiddenException);
      expect((error as ForbiddenException).getResponse()).toMatchObject({
        code: 'CSRF_REJECTED',
      });
    }
  });

  it('rejects mismatched cookie and header', () => {
    const cookie = createCsrfToken();
    const header = createCsrfToken();
    expect(() =>
      guard.canActivate(createContext({ method: 'POST', cookie, header })),
    ).toThrow(ForbiddenException);
  });

  it('rejects invalid short tokens even when they match', () => {
    expect(() =>
      guard.canActivate(createContext({ method: 'POST', cookie: 'short', header: 'short' })),
    ).toThrow(ForbiddenException);
  });
});
