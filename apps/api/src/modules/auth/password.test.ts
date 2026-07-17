import { describe, expect, it } from 'vitest';

import { hashPassword, verifyPassword } from './password';

describe('password', () => {
  it('hashes and verifies argon2id passwords', async () => {
    const hash = await hashPassword('sup3rsecret');
    await expect(verifyPassword(hash, 'sup3rsecret')).resolves.toBe(true);
    await expect(verifyPassword(hash, 'wrong-password')).resolves.toBe(false);
  });

  it('returns false for malformed hashes', async () => {
    await expect(verifyPassword('not-a-hash', 'sup3rsecret')).resolves.toBe(false);
  });
});
