import { describe, expect, it } from 'vitest';

import {
  isPanelPathname,
  parsePanelLocaleCookie,
  pathWithoutLocalePrefix,
} from '@/shared/i18n/panel-locale';

describe('panel-locale', () => {
  it('strips locale prefix from pathnames', () => {
    expect(pathWithoutLocalePrefix('/hy/admin/projects')).toBe('/admin/projects');
    expect(pathWithoutLocalePrefix('/en')).toBe('/');
    expect(pathWithoutLocalePrefix('/projects')).toBe('/projects');
  });

  it('detects portal paths', () => {
    expect(isPanelPathname('/hy/admin')).toBe(true);
    expect(isPanelPathname('/en/builder/projects')).toBe(true);
    expect(isPanelPathname('/ru/partner/settings')).toBe(true);
    expect(isPanelPathname('/hy/staff/checkin')).toBe(true);
    expect(isPanelPathname('/hy/projects')).toBe(false);
    expect(isPanelPathname('/en/dashboard')).toBe(false);
  });

  it('parses panel locale cookie values', () => {
    expect(parsePanelLocaleCookie('en')).toBe('en');
    expect(parsePanelLocaleCookie('xx')).toBeNull();
    expect(parsePanelLocaleCookie(undefined)).toBeNull();
  });
});
