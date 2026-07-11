import { describe, expect, it } from 'vitest';

import { canAccessArea, getProtectedArea } from './access';

describe('getProtectedArea', () => {
  it('maps protected path prefixes to areas', () => {
    expect(getProtectedArea('/account')).toBe('buyer');
    expect(getProtectedArea('/account/settings')).toBe('buyer');
    expect(getProtectedArea('/portal')).toBe('builder');
    expect(getProtectedArea('/admin')).toBe('admin');
  });

  it('returns null for public paths', () => {
    expect(getProtectedArea('/')).toBeNull();
    expect(getProtectedArea('')).toBeNull();
    expect(getProtectedArea('/login')).toBeNull();
    expect(getProtectedArea('/accountant')).toBeNull();
  });
});

describe('canAccessArea', () => {
  it('allows any authenticated user into the buyer area', () => {
    expect(canAccessArea('buyer', 'BUYER')).toBe(true);
    expect(canAccessArea('buyer', 'ENTRANCE_STAFF')).toBe(true);
  });

  it('restricts the builder area to builders only', () => {
    expect(canAccessArea('builder', 'BUILDER')).toBe(true);
    expect(canAccessArea('builder', 'BIGPROJECTS_ADMIN')).toBe(false);
    expect(canAccessArea('builder', 'BUYER')).toBe(false);
    expect(canAccessArea('builder', 'PARTNER')).toBe(false);
  });

  it('restricts the admin area to platform admins', () => {
    expect(canAccessArea('admin', 'BIGPROJECTS_ADMIN')).toBe(true);
    expect(canAccessArea('admin', 'BUILDER')).toBe(false);
    expect(canAccessArea('admin', 'BUYER')).toBe(false);
  });
});
