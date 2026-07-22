import type { UserResponse } from '@toonexpo/contracts';
import { describe, expect, it } from 'vitest';

import { resolvePostLoginPath } from '@/features/auth/utils/resolve-post-login-path';

const user = (
  accountType: UserResponse['accountType'],
  companyType?: UserResponse['companyType'],
): UserResponse => ({
  id: 'user-1',
  email: 'staff@example.com',
  name: 'Staff',
  phone: null,
  status: 'active',
  accountType,
  companyType: companyType ?? null,
  defaultLocale: 'hy',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
});

describe('resolvePostLoginPath', () => {
  it('returns explicit return URL when provided', () => {
    expect(resolvePostLoginPath(user('buyer'), '/qr')).toBe('/qr');
  });

  it('sends buyers to dashboard by default', () => {
    expect(resolvePostLoginPath(user('buyer'), null)).toBe('/dashboard');
  });

  it('sends entrance staff to check-in by default', () => {
    expect(resolvePostLoginPath(user('entrance_staff'), null)).toBe('/checkin');
  });

  it('sends builder company members to the builder portal', () => {
    expect(resolvePostLoginPath(user('company_member', 'builder'), null)).toBe('/builder');
  });

  it('sends partner company members to the partner portal', () => {
    expect(resolvePostLoginPath(user('company_member', 'partner'), null)).toBe('/partner');
    expect(resolvePostLoginPath(user('company_member', 'bank'), null)).toBe('/partner');
  });
});
