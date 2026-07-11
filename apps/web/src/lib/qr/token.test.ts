import { describe, expect, it } from 'vitest';

import { generateQrToken, hashQrToken, QR_TOKEN_BYTE_LENGTH } from './token';

describe('QR token helpers', () => {
  it('hashes deterministically', () => {
    const token = 'opaque-test-token-value';
    expect(hashQrToken(token)).toBe(hashQrToken(token));
    expect(hashQrToken(token)).not.toBe(hashQrToken(`${token}-x`));
  });

  it('generates opaque tokens without PII patterns', () => {
    const userId = 'clxyzbuyeruserid001';
    const email = 'buyer@example.com';
    const token = generateQrToken();

    expect(token.length).toBeGreaterThanOrEqual(QR_TOKEN_BYTE_LENGTH);
    expect(token).not.toContain(userId);
    expect(token.toLowerCase()).not.toContain('buyer');
    expect(token).not.toContain(email);
    expect(token).not.toMatch(/@/);
  });

  it('produces unique tokens across calls', () => {
    const a = generateQrToken();
    const b = generateQrToken();
    expect(a).not.toBe(b);
  });
});
