import { describe, expect, it } from 'vitest';

import { resolveScannedHref } from '@/features/buyer/utils/resolve-scanned-href';

describe('resolveScannedHref', () => {
  it('maps buyer QR token and URL to /qr/{token}', () => {
    expect(resolveScannedHref('tok_abc')).toBe('/qr/tok_abc');
    expect(resolveScannedHref('http://localhost:3000/en/qr/tok_abc')).toBe('/qr/tok_abc');
  });

  it('maps project and apartment interest URLs', () => {
    expect(resolveScannedHref('http://localhost:3000/hy/projects/proj_1/interest')).toBe(
      '/projects/proj_1/interest',
    );
    expect(resolveScannedHref('http://localhost:3000/en/apartments/apt_1/interest')).toBe(
      '/apartments/apt_1/interest',
    );
  });

  it('upgrades legacy catalog detail URLs to interest landing', () => {
    expect(resolveScannedHref('/ru/projects/proj_1')).toBe('/projects/proj_1/interest');
    expect(resolveScannedHref('/apartments/apt_1')).toBe('/apartments/apt_1/interest');
    expect(
      resolveScannedHref('http://192.168.1.10:3000/en/projects/seed_project_ajapnyak_terrace'),
    ).toBe('/projects/seed_project_ajapnyak_terrace/interest');
  });

  it('does not rewrite nested project building paths', () => {
    expect(resolveScannedHref('/en/projects/proj_1/buildings/b1')).toBeNull();
  });

  it('rejects unrelated payloads', () => {
    expect(resolveScannedHref('https://example.com/other')).toBeNull();
    expect(resolveScannedHref('')).toBeNull();
  });
});
